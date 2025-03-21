import { compareSync, hashSync } from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { OAuth2Client } from "google-auth-library";
import { loginWithGoogle } from "../middlewares/authorization";

const SALT_ROUNDS = 10;
const AUTHORIZATION_HEADER_FIELD = "authorization";

interface JwtPayload {
  id: string;
}

const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: process.env.JWT_TOKEN_EXPIRATION,
  });
};

const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET as string);
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password, username, ...rest } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).send({ Message: "User already exists" });
    }

    const hashedPassword = hashSync(password, SALT_ROUNDS);
    await User.create({
      username,
      hashedPassword,
      ...rest,
    });
    res.status(201).send({ Message: "New user created" });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers[AUTHORIZATION_HEADER_FIELD];
  const token = authHeader?.split(" ")?.at(1);
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as string,
    async (error, userInfo) => {
      if (error) {
        return res.status(403).send(error.message);
      }
      const { id: userId } = userInfo as JwtPayload;
      try {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(403).send("Invalid request");
        }
        if (!user.tokens.includes(token)) {
          user.tokens = [];
          await user.save();
          return res.status(403).send("Invalid Request");
        }
        user.tokens.splice(user.tokens.indexOf(token), 1);
        await user.save();
        res.status(200).end();
      } catch (error) {
        next(error);
      }
    }
  );
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password, username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).send({ Message: "User not found" });
      return;
    }
    if (!compareSync(password, user.hashedPassword)) {
      res.status(401).send({ Message: "Unauthorized" });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.tokens.push(refreshToken);
    await user.save();

    res.status(200).send({
      id: user.id,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers[AUTHORIZATION_HEADER_FIELD];
  const token = authHeader?.split(" ")?.at(1);
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as string,
    async (error, userInfo) => {
      if (error) {
        return res.status(403).send(error.message);
      }
      const { id: userId } = userInfo as JwtPayload;

      try {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(403).send("Invalid request");
        }
        if (!user.tokens.includes(token)) {
          user.tokens = [];
          await user.save();
          return res.status(403).send("Invalid request");
        }
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        user.tokens.push(refreshToken);
        await user.save();
        res.send({ accessToken, refreshToken });
      } catch (error) {
        next(error);
      }
    }
  );
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ Message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
};

const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).send({ Message: "Unauthorized" });
    }
    console.log(req.user)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send({ Message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { updatedUser } = req.body;
    const user = await User.findById(id);
    console.log(updatedUser);
    if (!user) {
      return res.status(404).send({ Message: "User not found" });
    } else {
      user.set(updatedUser);
      await user.save();
      res.status(200).send({ Message: "User updated successfully" });
    }
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  getGoogleLogin,
  logout,
  refreshToken,
  register,
  getUserById,
  getUserInfo,
  updateUser
};

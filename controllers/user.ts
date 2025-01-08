import { compareSync, hashSync } from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

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

const register = async (req: Request, res: Response) => {
  try {
    const { password, username, ...rest } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      res.status(400).send({ Message: "User already exists" });
      return;
    }

    const hashedPassword = hashSync(password, SALT_ROUNDS);
    await User.create({
      username,
      hashedPassword,
      ...rest,
    });
    res.status(201).send({ Message: "New user created" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send("An unkown error occurred: " + error);
    }
  }
};

const logout = async (req: Request, res: Response) => {
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
        if (error instanceof Error) {
          res.status(400).send(error.message);
        } else {
          res.status(500).send("An unkown error occurred: " + error);
        }
      }
    }
  );
};

const login = async (req: Request, res: Response) => {
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
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send("An unkown error occurred: " + error);
    }
  }
};

const refreshToken = async (req: Request, res: Response) => {
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
        if (error instanceof Error) {
          res.status(400).send(error.message);
        } else {
          res.status(500).send("An unkown error occurred: " + error);
        }
      }
    }
  );
};

export default {
  login,
  logout,
  refreshToken,
  register,
};

import { compareSync, hashSync } from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

const SALT_ROUNDS = 10;
const AUTHORIZATION_HEADER_FIELD = "authorization";

dotenv.config();
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const getPublicUserData = ({ _id, email, name, username, picture }: IUser) => {
  return {
    _id,
    email,
    name,
    username,
    picture,
  };
};

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Images Only!"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const googleClient = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: "http://localhost:5173/login",
});

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

const getGoogleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).send({ Message: "Google Invalid request" });
    }

    const { tokens } = await googleClient.getToken(code);
    const googleIdToken = tokens.id_token;

    if (!googleIdToken) {
      return res.status(400).send({ Message: "Google Invalid request" });
    }

    const googleUser = await googleClient.verifyIdToken({
      idToken: googleIdToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googlePayload = googleUser.getPayload();

    if (!googlePayload) {
      return res.status(400).send({ Message: "Google Invalid request" });
    }

    const { email, name, picture } = googlePayload;

    if (!email) {
      return res.status(400).send({ Message: "Google Invalid request" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: email.split("@")[0],
        email,
        name: name || email.split("@")[0],
        hashedPassword: "Google",
        tokens: [],
        profileImage: picture,
      });
    } else if (picture && !user.picture) {
      user.picture = picture;
      await user.save();
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
    if (user._id.toString() !== req.user?.id) {
      const publicUserData = getPublicUserData(user);
      res.status(200).send(publicUserData);
    } else {
      res.status(200).send(user);
    }
  } catch (error) {
    next(error);
  }
};

const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).send({ Message: "Unauthorized" });
    }

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
    let { updatedUser } = req.body;
    updatedUser = JSON.parse(updatedUser);
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).send({ Message: "User not found" });
    }

    if (req.file) {
      updatedUser.picture = `/uploads/${req.file.filename}`;
    }

    await User.updateOne({ _id: id }, { $set: updatedUser });
    res.status(200).send({ Message: "User updated successfully" });
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
  updateUser: [upload.single("image"), updateUser],
  getPublicUserData,
};
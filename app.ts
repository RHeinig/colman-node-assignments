import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { errorHandler } from "./middlewares/error-handling";
import commentRouter from "./routes/comment";
import postRouter from "./routes/post";
import userRouter from "./routes/user";

dotenv.config();

type AppConfig = {
  mongoUri?: string;
};

const createApp = async ({ mongoUri }: AppConfig) => {
  const app = express();
  if (!mongoUri) {
    mongoUri = "mongodb://localhost:27017/test";
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to Database");
  } catch (error) {
    console.error(error, "Error connecting to Database");
  }

  app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
  app.use(bodyParser.json());

  app.use("/post", postRouter);
  app.use("/comment", commentRouter);
  app.use("/user", userRouter);

  app.use(errorHandler);

  return app;
};

export { createApp };

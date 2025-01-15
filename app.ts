import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
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

  if (process.env.NODE_ENV === "development") {
    const options = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "Social Media API",
          version: "1.0.0",
          description: "A simple social media API",
        },
        servers: [{ url: "http://localhost:3000" }],
      },
      apis: ["./routes/*.ts"],
    };

    const specs = swaggerJsdoc(options);
    app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));
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

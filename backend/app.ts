import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import http from "http";
import https from "https";
import fs from "fs";
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

  if (process.env.NODE_ENV === "production") {    
    const options = {
      key: fs.readFileSync("./client-key.pem"),
      cert: fs.readFileSync("./client-cert.pem"),
    }
    https.createServer(options, app).listen(3000);
  }

  if (process.env.NODE_ENV === "development") {
    const options: swaggerJsdoc.Options = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "Social Media API",
          version: "1.0.0",
          description: "A simple social media API",
        },
        servers: [{ url: "http://localhost:3000" }],
        components: {
          securitySchemes: {
            Authorization: {
              type: "apiKey",
              in: "header",
              name: "Authorization",
            },
          },
        },
      },
      apis: ["./routes/*.ts"],
    };

    const specs = swaggerJsdoc(options);
    app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));
  }

  app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
  app.use(bodyParser.json());
  app.use(cors(
    {
      origin: "http://localhost:5173",
      credentials: true,
    }
  ));

  app.use("/post", postRouter);
  app.use("/comment", commentRouter);
  app.use("/user", userRouter);

  app.use("/uploads", express.static("uploads"));

  app.use((req: Request, res: Response) => {
    res.status(404).send({ error: "Not Found" });
  });
  app.use(errorHandler);

  return app;
};

export { createApp };

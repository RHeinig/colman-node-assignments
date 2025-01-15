import express from "express";
import dotenv from "dotenv";
import mongoose, { ConnectOptions } from "mongoose";
import postRouter from "./routes/post";
import commentRouter from "./routes/comment";
import bodyParser from "body-parser";
import swaggerUI from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const { PORT, DATABASE_URL } = process.env;

const initApp = async () => {
  const app = express();

  try {
    if (DATABASE_URL) {
      await mongoose.connect(DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions);
      console.log("Connected to Database");
    } else {
      throw new Error("DATABASE_URL is not provided");
    }
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
    }
    
    const specs = swaggerJsdoc(options);
    app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));
  }

  app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
  app.use(bodyParser.json());

  app.use("/post", postRouter);
  app.use("/comment", commentRouter);

  return app;
};

initApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });

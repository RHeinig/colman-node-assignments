require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const bodyParser = require("body-parser");

const { PORT, DATABASE_URL } = process.env;

const initApp = async () => {
  const app = express();

  try {
    await mongoose.connect(DATABASE_URL);
    console.log("Connected to Database");
  } catch (error) {
    console.error(error, type(error));
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

const Post = require("../models/post");

const addPost = async (req, res, next) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    if (req.query.sender) {
      return next("route");
    }

    posts = await Post.find();
    res.status(200).send(posts);
  } catch (error) {
    res.status(400).send({
      Status: "Error",
      Message: error.message,
    });
  }
};

const getPostById = async (req, res, next) => {
  try {
    const { post_id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).send({
        Status: "Not Found",
        Message: `Post ${postId} not found`,
      });
    } else {
      res.status(200).send(post);
    }
  } catch (error) {
    res.status(400).send({
      Status: "Error",
      Message: error.message,
    });
  }
};

const getPostsBySender = async (req, res, next) => {
  const senderId = req.query.sender;

  try {
    const posts = await Post.find({ sender: senderId });
    res.status(200).send(posts);
  } catch (error) {
    res.status(400).send({
      Status: "Error",
      Message: error.message,
    });
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.post_id,
      { $set: req.body },
      {
        new: true,
      }
    );
    if (!post) {
      res.status(404).send({
        Status: "Not Found",
        Message: `Post ${postId} not found`,
      });
    } else {
      res.status(200).send(post);
    }
  } catch (error) {
    res.status(400).send({
      Status: "Error",
      Message: error.message,
    });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  getPostsBySender,
  addPost,
  updatePost,
};

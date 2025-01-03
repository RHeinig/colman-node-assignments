const Comment = require("../models/comment");

const addComment = async (req, res, next) => {
  try {
    const comment = await Comment.create(req.body);
    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getCommentById = async (req, res, next) => {
  try {
    const { comment_id: commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).send({
        Status: "Not Found",
        Message: `Comment ${commentId} not found`,
      });
    } else {
      res.status(200).send(comment);
    }
  } catch (error) {
    res.status(400).send({
      Status: "Error",
      Message: error.message,
    });
  }
};

const getCommentsByPost = async (req, res, next) => {
  const { post_id: postId } = req.query;

  try {
    const comments = await Comment.find({ postId });
    res.status(200).send(comments);
  } catch (error) {
    res.status(400).send({
      Status: "Error",
      Message: error.message,
    });
  }
};

const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.comment_id,
      req.body,
      {
        new: true,
      }
    );
    if (!comment) {
      res.status(404).send({
        Status: "Not Found",
        Message: `Comment ${commentId} not found`,
      });
    } else {
      res.status(200).send(comment);
    }
  } catch (error) {
    res.status(400).send({
      Status: "Error",
      Message: error.message,
    });
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { comment_id: commentId } = req.params;
    await Comment.deleteOne({ _id: commentId });
    res.status(200).send(commentId);
  } catch (error) {
    res.status(400).send({
      Status: "Error",
      Message: error.message,
    });
  }
};

module.exports = {
  addComment,
  getCommentById,
  getCommentsByPost,
  updateComment,
  deleteComment,
};

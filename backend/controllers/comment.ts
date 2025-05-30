import { NextFunction, Request, Response } from "express";
import Comment from "../models/comment";
import Post from "../models/post";
import mongoose from "mongoose";

const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).send({
        Status: "Unauthorized",
        Message: "User is not authorized",
      });
    }

    const post = await Post.findById(req.body.postId);
    if (!post) {
      return res.status(404).send({
        Status: "Not Found",
        Message: `Post ${req.body.postId} not found`,
      });
    }

    const comment = await Comment.create({ ...req.body, userId: req.user.id });
    const populatedComment = await Comment.findById(comment._id).populate('userId', { username: 1, name: 1, email: 1, picture: 1 });
    res.status(201).send(populatedComment);
  } catch (error) {
    next(error);
  }
};

const getCommentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    next(error);
  }
};

const getCommentsByPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { post_id: postId } = req.query;

  try {
    const comments = await Comment.find({ postId: new mongoose.Types.ObjectId(postId as string) }).populate('userId', { username: 1, name: 1, email: 1, picture: 1 });
    res.status(200).send(comments);
  } catch (error) {
    next(error);
  }
};

const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).send({
        Status: "Unauthorized",
        Message: "User is not authorized",
      });
    }

    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.comment_id, userId: req.user.id },
      req.body,
      {
        new: true,
      }
    );

    if (!comment) {
      res.status(404).send({
        Status: "Not Found",
        Message: `Comment ${req.params.comment_id} not found`,
      });
    } else {
      res.status(200).send(comment);
    }
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).send({
        Status: "Unauthorized",
        Message: "User is not authorized",
      });
    }
    const { comment_id: commentId } = req.params;
    await Comment.findOneAndDelete({ _id: commentId, userId: req.user.id });
    res.status(200).send(commentId);
  } catch (error) {
    next(error);
  }
};

export = {
  addComment,
  getCommentById,
  getCommentsByPost,
  updateComment,
  deleteComment,
};

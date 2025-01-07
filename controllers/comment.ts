import { Request, Response } from "express";
import Comment from "../models/comment";

const addComment = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.create(req.body);
    res.status(201).send(comment);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unkown error occurred: " + error);
    }
  }
};

const getCommentById = async (req: Request, res: Response) => {
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
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unkown error occurred: " + error);
    }
  }
};

const getCommentsByPost = async (req: Request, res: Response) => {
  const { post_id: postId } = req.query;

  try {
    const comments = await Comment.find({ postId });
    res.status(200).send(comments);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unkown error occurred: " + error);
    }
  }
};

const updateComment = async (req: Request, res: Response) => {
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
        Message: `Comment ${req.params.comment_id} not found`,
      });
    } else {
      res.status(200).send(comment);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unkown error occurred: " + error);
    }
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const { comment_id: commentId } = req.params;
    await Comment.deleteOne({ _id: commentId });
    res.status(200).send(commentId);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unkown error occurred: " + error);
    }
  }
};

export = {
  addComment,
  getCommentById,
  getCommentsByPost,
  updateComment,
  deleteComment,
};

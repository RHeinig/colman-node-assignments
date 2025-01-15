import { NextFunction, Request, Response } from "express";
import Post from "../models/post";

const addPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).send({
        Status: "Unauthorized",
        Message: "User is not authorized",
      });
    }
    const post = await Post.create({ ...req.body, userId: req.user.id });
    res.status(201).send(post);
  } catch (error) {
    next(error);
  }
};

const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.query.sender) {
      return next("route");
    }

    const posts = await Post.find();
    res.status(200).send(posts);
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req: Request, res: Response, next: NextFunction) => {
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
    next(error);
  }
};

const getPostsBySender = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const senderId = req.query.sender;

  try {
    const posts = await Post.find({ userId: senderId });
    res.status(200).send(posts);
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).send({
        Status: "Unauthorized",
        Message: "User is not authorized",
      });
    }
    const post = await Post.findOneAndUpdate(
      { _id: req.params.post_id, userId: req.user.id },
      { $set: req.body },
      {
        new: true,
      }
    );
    if (!post) {
      res.status(404).send({
        Status: "Not Found",
        Message: `Post ${req.params.post_id} not found`,
      });
    } else {
      res.status(200).send(post);
    }
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).send({
        Status: "Unauthorized",
        Message: "User is not authorized",
      });
    }
    const post = await Post.findOneAndDelete({
      _id: req.params.post_id,
      userId: req.user.id,
    });
    if (!post) {
      res.status(404).send({
        Status: "Not Found",
        Message: `Post ${req.params.post_id} not found`,
      });
    } else {
      res.status(200).send(post);
    }
  } catch (error) {
    next(error);
  }
};

export = {
  getAllPosts,
  getPostById,
  getPostsBySender,
  addPost,
  updatePost,
  deletePost,
};

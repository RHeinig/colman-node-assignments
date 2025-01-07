import { Request, Response, NextFunction } from "express";
import Post from "../models/post";

const addPost = async (req: Request, res: Response) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).send(post);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unkown error occurred: " + error);
    }
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
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unkown error occurred: " + error);
    }
  }
};

const getPostById = async (req: Request, res: Response) => {
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
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unkown error occurred: " + error);
    }
  }
};

const getPostsBySender = async (req: Request, res: Response) => {
  const senderId = req.query.sender;

  try {
    const posts = await Post.find({ sender: senderId });
    res.status(200).send(posts);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unkown error occurred: " + error);
    }
  }
};

const updatePost = async (req: Request, res: Response) => {
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
        Message: `Post ${req.params.post_id} not found`,
      });
    } else {
      res.status(200).send(post);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unkown error occurred: " + error);
    }
  }
};

export = {
  getAllPosts,
  getPostById,
  getPostsBySender,
  addPost,
  updatePost,
};

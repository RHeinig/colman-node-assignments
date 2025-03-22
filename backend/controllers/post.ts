import { NextFunction, Request, Response } from "express";
import Post from "../models/post";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/posts";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Images Only!"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

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
    const { start = 0, limit = 10 } = req.query;
    const startNumber = parseInt(start as string);
    const limitNumber = parseInt(limit as string);
    const posts = await Post.find().sort({ createdAt: -1 }).skip(startNumber).limit(limitNumber);
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
    if (!senderId) {
      return res.status(400).send({
        Status: "Bad Request",
        Message: "Sender ID is required",
      });
    }
    const senderIdObject = new mongoose.Types.ObjectId(senderId as string);
    const { start = 0, limit = 10 } = req.query;
    const startNumber = parseInt(start as string);
    const limitNumber = parseInt(limit as string);
    const posts = await Post.find({ userId: senderIdObject }).sort({ createdAt: -1 }).skip(startNumber).limit(limitNumber);
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

const likePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { post_id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({
        Status: "Not Found",
        Message: `Post ${postId} not found`,
      });
    }
    if (req.user?.id) {
      if (post.likes.some(like => like.toString() === req.user?.id)) {
        post.likes = post.likes.filter(
          (like) => like.toString() !== req.user?.id
        );
      } else {
        post.likes.push(req.user.id);
      }
      await post.save();
    }
    res.status(200).send(post);
  } catch (error) {
    next(error);
  }
};

const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).send({ Message: "No image file provided" });
    }

    const { postId } = req.body;
    const imageUrl = `/uploads/posts/${req.file.filename}`;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({ Message: "Post not found" });
    }

    if (post.imageUrl) {
      const oldImagePath = path.join(process.cwd(), post.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    post.imageUrl = imageUrl;
    await post.save();

    res.status(200).send({ imageUrl });
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
  likePost,
  uploadImage: [upload.single("image"), uploadImage],
};

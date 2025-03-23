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
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
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
    const populatedPost = await Post.findById(post._id).populate('userId', { username: 1, name: 1, email: 1, picture: 1 });
    res.status(201).send(populatedPost);
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
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(startNumber)
      .limit(limitNumber)
      .populate('userId', { username: 1, name: 1, email: 1, picture: 1 });
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
    const posts = await Post.find({ userId: senderIdObject })
      .sort({ createdAt: -1 })
      .skip(startNumber)
      .limit(limitNumber)
      .populate('userId', { username: 1, name: 1, email: 1, picture: 1 });
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

    const { message } = req.body;
    const postId = req.params.post_id;
    const userId = req.user.id;


    const updateData: { message?: string; imageUrl?: string } = {};
    if (message) {
      updateData.message = message;
    }

    if (req.file) {
      const imageUrl = `/uploads/posts/${req.file.filename}`;

      const post = await Post.findById(postId);
      if (post && post.imageUrl) {
        const oldImagePath = path.join(process.cwd(), post.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updateData.imageUrl = imageUrl;
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(postId), userId: new mongoose.Types.ObjectId(userId) },
      { $set: updateData },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send({
        Status: "Not Found",
        Message: `Post ${postId} not found or you don't have permission to update it`,
      });
    }

    res.status(200).send(updatedPost);
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
      // Delete associated image if it exists
      if (post.imageUrl) {
        const imagePath = path.join(process.cwd(), post.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
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
      if (post.likes.some((like) => like.toString() === req.user?.id)) {
        post.likes = post.likes.filter(
          (like) => like.toString() !== req.user?.id
        );
      } else {
        post.likes.push(new mongoose.Types.ObjectId(req.user?.id));
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

const generatePostSuggestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prompt } = req.body;
    const fullPrompt = `
    You are a social media expert.
    You are given a prompt and you need to generate a post text suggestion.
    The post text suggestion should be a post that is relevant to the prompt.
    The post text suggestion should be a single sentence.
    
    Here is the prompt:
    ${prompt}
    `;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMENI_API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    res.status(200).send({ post: data.candidates[0].content.parts[0].text });
  } catch (error) {
    next(error);
  }
};

export = {
  getAllPosts,
  getPostById,
  getPostsBySender,
  addPost,
  updatePost: [upload.single("image"), updatePost],
  deletePost,
  likePost,
  uploadImage: [upload.single("image"), uploadImage],
  generatePostSuggestion,
};

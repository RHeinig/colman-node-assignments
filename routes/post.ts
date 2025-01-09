import express from "express";
const router = express.Router();

import Post from "../controllers/post";
import { authorize } from "../middlewares/authorization";

router.post("/", authorize, Post.addPost);

router.get("/", Post.getAllPosts);

router.get("/:post_id", Post.getPostById);

router.get("/", Post.getPostsBySender);

router.put("/:post_id", Post.updatePost);

export = router;

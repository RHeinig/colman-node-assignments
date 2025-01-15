import express from "express";
const router = express.Router();

import Comment from "../controllers/comment";
import { authorize } from "../middlewares/authorization";

router.post("/", authorize, Comment.addComment);

router.get("/", Comment.getCommentsByPost);

router.get("/:comment_id", Comment.getCommentById);

router.delete("/:comment_id", authorize, Comment.deleteComment);

router.put("/:comment_id", authorize, Comment.updateComment);

export = router;

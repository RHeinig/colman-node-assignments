import express from "express";
const router = express.Router();

import Comment from "../controllers/comment";

router.post("/", Comment.addComment);

router.get("/", Comment.getCommentsByPost);

router.get("/:comment_id", Comment.getCommentById);

router.delete("/:comment_id", Comment.deleteComment);

router.put("/:comment_id", Comment.updateComment);

export = router;

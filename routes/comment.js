const express = require("express");
const router = express.Router();

const Comment = require("../controllers/comment");

router.post("/", Comment.addComment);

router.get("/", Comment.getCommentsByPost);

router.get("/:comment_id", Comment.getCommentById);

router.delete("/:comment_id", Comment.deleteComment);

router.put("/:comment_id", Comment.updateComment);

module.exports = router;

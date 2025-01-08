import mongoose from "mongoose";

interface IComment {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  senderId: string;
}

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.ObjectId, required: true, ref: "Post" },
  userId: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  content: { type: String, required: true },
  senderId: { type: String, required: true },
});

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;

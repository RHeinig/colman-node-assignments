import mongoose from "mongoose";

interface IPost {
  userId: mongoose.Types.ObjectId;
  message: string;
  sender: string;
}

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
});

const PostModel = mongoose.model<IPost>("Post", postSchema);

export default PostModel;

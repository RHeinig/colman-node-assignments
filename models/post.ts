import mongoose from "mongoose";

interface IPost {
  message: string;
  sender: string;
}

const postSchema = new mongoose.Schema({
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

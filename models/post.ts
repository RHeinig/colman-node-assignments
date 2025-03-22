import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
    message: string;
    userId: string;
    likes: string[];
    imageUrl?: string;
}

const postSchema = new Schema<IPost>(
    {
        message: { type: String, required: true },
        userId: { type: String, required: true },
        likes: { type: [String], default: [] },
        imageUrl: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IPost>("Post", postSchema);

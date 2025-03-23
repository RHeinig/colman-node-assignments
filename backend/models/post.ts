import mongoose, { Schema } from "mongoose";

export interface IPost {
    message: string;
    userId: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    imageUrl?: string;
}

const postSchema = new Schema<IPost>(
    {
        message: { type: String, required: true },
        userId: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
        likes: { type: [mongoose.Schema.ObjectId], default: [], ref: "User" },
        imageUrl: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IPost>("Post", postSchema);

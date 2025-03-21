import mongoose from "mongoose";

export interface IUser {
  _id: string;
  picture?: string;
  username: string;
  email: string;
  name: string;
  hashedPassword: string;
  tokens: string[];
  refreshTokens?: string[];
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  name: { type: String, required: true },
  picture: { type: String },
  tokens: { type: [String], default: [] },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;

import mongoose from "mongoose";

interface IUser {
  username: string;
  email: string;
  name: string;
  hashedPassword: string;
  tokens: string[];
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  name: { type: String, required: true },
  tokens: { type: [String], default: [] },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;

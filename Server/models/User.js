// models/User.js (ESM)
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user","admin"], default: "user" },
  refreshToken: { type: String, default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);

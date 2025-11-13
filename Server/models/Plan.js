// Server/models/Plan.js
import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true }, // in cents or decimal (choose one)
  features: { type: [String], default: [] },
  duration: { type: Number, required: true }, // duration in days
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);

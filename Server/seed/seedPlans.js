// Server/seed/seedPlans.js
import mongoose from "mongoose";
import "dotenv/config";
import Plan from "../models/Plan.js";

const MONGO = process.env.MONGO_URI;
const plans = [
  { name: "Starter", price: 0, features: ["1 project", "Basic Learn", "Basic Support"], duration: 30 },
  { name: "Pro", price: 9.99, features: ["10 projects", "Email Support", "Analytics"], duration: 30 },
  { name: "Business", price: 29.99, features: ["Unlimited", "Priority Support", "Team Access"], duration: 30 },

];

async function seed() {
  try {
    await mongoose.connect(MONGO);
    console.log("Connected to DB for seeding");
    for (const p of plans) {
      const exists = await Plan.findOne({ name: p.name });
      if (exists) {
        console.log("Plan exists:", p.name);
        continue;
      }
      await Plan.create(p);
      console.log("Created plan:", p.name);
    }
    console.log("Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();

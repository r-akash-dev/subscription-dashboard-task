// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import authRoutes from "./routes/auth.js"; // include .js extension!

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// app.use("/api/auth", authRoutes);

// const PORT = process.env.PORT || 5000;

// mongoose
//   .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log("✅ MongoDB Connected Successfully");
//     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
//   })
//   .catch((err) => console.error("❌ MongoDB Connection Error:", err));


// index.js (ESM)


import 'dotenv/config';
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import plansRoutes from "./routes/plans.js";
// ... other routes

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow credentials and client origin (Vite default)
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({ origin: CLIENT_URL, credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/plans", plansRoutes);
// ... other routes

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    app.listen(process.env.PORT || 5000, ()=> console.log("🚀 Server running"));
  })
  .catch(err => console.error(err));


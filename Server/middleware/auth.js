// middleware/auth.js (ESM)
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "No access token" });

    let payload;
    try { payload = jwt.verify(token, process.env.JWT_SECRET); }
    catch (e) { return res.status(401).json({ message: "Invalid/Expired token" }); }

    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Authenticate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const authorize = (roles = []) => {
  if (typeof roles === "string") roles = [roles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
};

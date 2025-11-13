// controllers/authController.js (ESM)
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const ACCESS_EXPIRES = "15m";      // short lived
const REFRESH_EXPIRES = "7d";      // longer lived

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2),
  password: z.string().min(6),
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_change_me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_fallback_refresh_secret_change_me';
const ADMIN_WHITELIST = ["akashadmin@gmail.com", "user9@gmail.com"];

const createTokens = (user) => {
  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets not configured');
  }
  const payload = { id: user._id.toString(), role: user.role };
  const access = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
  const refresh = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
  return { access, refresh };
};

export const register = async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);

    // check duplicate email
    const exists = await User.findOne({ email: parsed.email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(parsed.password, salt);

    const user = await User.create({
      email: parsed.email,
      username: parsed.username,
      password: hashed,
      role: "user",
    });

    // generate tokens
    const tokens = createTokens(user);
    user.refreshToken = tokens.refresh;
    await user.save();

    // set refresh token as httpOnly secure cookie
    res.cookie("refreshToken", tokens.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // set true in production (HTTPS)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/", 
    });

    const safe = { id: user._id, email: user.email, username: user.username, role: user.role };
    return res.status(201).json({ user: safe, tokens: { access: tokens.access } });
  } catch (err) {
    if (err?.issues) {
      return res.status(400).json({ message: "Password must contain at least 6 characters", errors: err.issues });
    }
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: "Invalid credentials" });

//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(401).json({ message: "Invalid credentials" });

//     const tokens = createTokens(user);
//     user.refreshToken = tokens.refresh;
//     await user.save();

//     res.cookie("refreshToken", tokens.refresh, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       path: "/",
//     });

//     const safe = { id: user._id, email: user.email, username: user.username, role: user.role };
//     return res.json({ user: safe, tokens: { access: tokens.access } });
//   } catch (err) {
//     console.error("Login error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // If matches whitelist, promote and persist role
    if (ADMIN_WHITELIST.includes(user.email) || user.username === "akash") {
      if (user.role !== "admin") {
        user.role = "admin";
        await user.save(); // persist change
      }
    }

    const tokens = createTokens(user);
    user.refreshToken = tokens.refresh;
    await user.save();

    res.cookie("refreshToken", tokens.refresh, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7*24*60*60*1000, path: "/" });

    const safe = { id: user._id, email: user.email, username: user.username, role: user.role };
    return res.json({ user: safe, tokens: { access: tokens.access } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    let payload;
    try { payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); }
    catch (e) { return res.status(401).json({ message: "Invalid refresh token" }); }

    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const tokens = createTokens(user);
    user.refreshToken = tokens.refresh;
    await user.save();

    // update httpOnly cookie
    res.cookie("refreshToken", tokens.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({ tokens: { access: tokens.access } });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    // If client sends userId in body or use cookie to find user
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      // find user by refresh token and clear it
      await User.updateOne({ refreshToken }, { $set: { refreshToken: null } });
      // clear cookie
      res.clearCookie("refreshToken", { path: "/" });
    }
    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

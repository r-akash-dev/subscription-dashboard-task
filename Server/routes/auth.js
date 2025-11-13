// routes/auth.js
import express from "express";
import { register, login, refresh, logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh); // can accept cookie or body
router.post("/logout", logout);

export default router;

import express from "express";

import {
  register,
  login,
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  changePassword,
} from "../controller/authcontroller.js";

import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();


// ================= AUTH =================

router.post("/register", register);

router.post("/login", login);


// ================= OTP =================

router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);


// ================= PROFILE & SECURITY =================

// Get currently logged-in user's profile
router.get("/profile", authMiddleware, getProfile);

// Update currently logged-in user's profile
router.put("/profile", authMiddleware, updateProfile);

// Change password
router.put("/change-password", authMiddleware, changePassword);


export default router;
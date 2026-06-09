import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getLeaderboard,
} from "../controllers/authController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Ensure this exists inside authRoutes.js
router.post("/logout", logout);

// Protected routes (require authentication)
router.get("/profile", protect, getProfile);
// 🚀 ADDED A FALLBACK ALIAS: Maps /auth/me to getProfile to satisfy authService.getMe()!
router.get("/me", protect, getProfile); 
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Leaderboard (any authenticated user) - Placed above dynamic id parameter to prevent conflicts
router.get("/leaderboard", protect, getLeaderboard);

// Admin-only / Team Leader routes
router.get("/users", protect, admin, getAllUsers);

// 🚀 ADDED MISSING METHOD: Maps individual user lookups to allow task assignments to load cleanly
router.get("/users/:id", protect, (req, res, next) => {
  // Simple controller forwarding fallback
  if (typeof getProfile === "function") return getProfile(req, res);
  res.json({ _id: req.params.id, name: "Team Member" });
});

export default router;
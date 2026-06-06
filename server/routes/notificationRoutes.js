import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET all notifications
router.get("/", getNotifications);

// Bulk actions (must be before /:id to avoid route conflict)
router.put("/read-all", markAllAsRead);
router.delete("/clear-all", clearAllNotifications);

// Single notification actions
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;

import express from "express";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addNote,
  deleteNote,
  getDashboardStats,
} from "../controllers/taskController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard stats (must be before /:id to avoid route conflict)
router.get("/stats/dashboard", getDashboardStats);

// GET all tasks / POST create task (admin only)
router.route("/").get(getTasks).post(admin, createTask);

// GET single task / PUT update / DELETE (admin only)
router
  .route("/:id")
  .get(getTask)
  .put(updateTask)
  .delete(admin, deleteTask);

// Task notes
router.post("/:id/notes", addNote);
router.delete("/:id/notes/:noteId", deleteNote);

export default router;

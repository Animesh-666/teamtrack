import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from "../controllers/projectController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET all projects / POST create project (admin only)
router.route("/").get(getProjects).post(admin, createProject);

// GET single project / PUT update (admin) / DELETE (admin)
router
  .route("/:id")
  .get(getProject)
  .put(admin, updateProject)
  .delete(admin, deleteProject);

// Member management (admin only)
router.post("/:id/members", admin, addMember);
router.delete("/:id/members/:userId", admin, removeMember);

export default router;

import express from "express";
import {
  createReport,
  getReports,
  getReport,
  getMyReports, // Ensure this is exported from your controller
  updateReport,
  deleteReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// 1. SPECIFIC ROUTES GO FIRST
// This matches "/api/reports/me" and prevents it from being caught by "/:id"
router.get("/me", getMyReports);

// 2. ROOT ROUTES
router.route("/").get(getReports).post(createReport);

// 3. DYNAMIC ROUTES GO LAST
router
  .route("/:id")
  .get(getReport)
  .put(updateReport)
  .delete(deleteReport);

export default router;
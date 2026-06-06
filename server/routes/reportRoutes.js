import express from "express";
import {
  createReport,
  getReports,
  getReport,
  updateReport,
  deleteReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET all reports / POST create report
router.route("/").get(getReports).post(createReport);

// GET single report / PUT update / DELETE
router
  .route("/:id")
  .get(getReport)
  .put(updateReport)
  .delete(deleteReport);

export default router;

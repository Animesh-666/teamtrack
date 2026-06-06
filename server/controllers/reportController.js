import Report from "../models/Report.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req, res) => {
  try {
    const { projectId, reportText, hoursWorked, date } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const report = await Report.create({
      userId: req.user._id,
      projectId,
      reportText,
      hoursWorked,
      date: date || new Date(),
    });

    // Update user's hours logged
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { hoursLogged: hoursWorked },
    });

    // Populate the created report
    const populatedReport = await Report.findById(report._id)
      .populate("userId", "name email avatar")
      .populate("projectId", "name");

    // Notify admin users about the new report
    const admins = await User.find({ role: "ADMIN", _id: { $ne: req.user._id } });
    if (admins.length > 0) {
      const notifications = admins.map((admin) => ({
        userId: admin._id,
        message: `${req.user.name} submitted a daily report for "${project.name}" (${hoursWorked}h)`,
        type: "report_submitted",
      }));
      await Notification.insertMany(notifications);

      if (req.io) {
        admins.forEach((admin) => {
          req.io.to(admin._id.toString()).emit("notification", {
            message: `${req.user.name} submitted a daily report for "${project.name}"`,
            type: "report_submitted",
          });
        });
      }
    }

    res.status(201).json(populatedReport);
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({ message: "Server error creating report", error: error.message });
  }
};

// @desc    Get all reports (with filters)
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res) => {
  try {
    const {
      projectId,
      userId,
      dateFrom,
      dateTo,
      period, // 'today', 'week', 'month'
      page = 1,
      limit = 50,
    } = req.query;

    // Build filter query
    const filter = {};

    // For non-admin users, only show their own reports
    if (req.user.role !== "ADMIN") {
      filter.userId = req.user._id;
    } else if (userId) {
      filter.userId = userId;
    }

    if (projectId) {
      filter.projectId = projectId;
    }

    // Date filtering
    if (period) {
      const now = new Date();
      let start;

      switch (period) {
        case "today":
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          start = new Date(now);
          start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          start.setHours(0, 0, 0, 0);
          break;
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          break;
      }

      if (start) {
        filter.date = { $gte: start, $lte: now };
      }
    } else if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate("userId", "name email avatar")
        .populate("projectId", "name")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Report.countDocuments(filter),
    ]);

    // Compute aggregate stats
    const statsAgg = await Report.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          totalHours: { $sum: "$hoursWorked" },
          avgHours: { $avg: "$hoursWorked" },
        },
      },
    ]);

    const stats = statsAgg.length > 0
      ? {
          totalReports: statsAgg[0].totalReports,
          totalHours: Math.round(statsAgg[0].totalHours * 100) / 100,
          avgHours: Math.round(statsAgg[0].avgHours * 100) / 100,
        }
      : { totalReports: 0, totalHours: 0, avgHours: 0 };

    res.json({
      reports,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      stats,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ message: "Server error fetching reports", error: error.message });
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Private
export const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("userId", "name email avatar")
      .populate("projectId", "name");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check access
    if (
      req.user.role !== "ADMIN" &&
      report.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "You don't have access to this report" });
    }

    res.json(report);
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({ message: "Server error fetching report", error: error.message });
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private
export const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Only the report author or admin can update
    if (
      req.user.role !== "ADMIN" &&
      report.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "You can only update your own reports" });
    }

    const { reportText, hoursWorked, projectId, date } = req.body;

    // If hours changed, update user stats
    if (hoursWorked !== undefined && hoursWorked !== report.hoursWorked) {
      const hoursDiff = hoursWorked - report.hoursWorked;
      await User.findByIdAndUpdate(report.userId, {
        $inc: { hoursLogged: hoursDiff },
      });
    }

    if (reportText !== undefined) report.reportText = reportText;
    if (hoursWorked !== undefined) report.hoursWorked = hoursWorked;
    if (projectId !== undefined) report.projectId = projectId;
    if (date !== undefined) report.date = date;

    const updatedReport = await report.save();

    const populatedReport = await Report.findById(updatedReport._id)
      .populate("userId", "name email avatar")
      .populate("projectId", "name");

    res.json(populatedReport);
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({ message: "Server error updating report", error: error.message });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Only the report author or admin can delete
    if (
      req.user.role !== "ADMIN" &&
      report.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "You can only delete your own reports" });
    }

    // Revert user hours
    await User.findByIdAndUpdate(report.userId, {
      $inc: { hoursLogged: -report.hoursWorked },
    });

    await Report.findByIdAndDelete(report._id);

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Delete report error:", error);
    res.status(500).json({ message: "Server error deleting report", error: error.message });
  }
};

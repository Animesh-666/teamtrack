import Task from "../models/Task.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";

// Helper function to validate authorization context safely across case styles
const isLeaderOrAdmin = (user) => {
  if (!user || !user.role) return false;
  const roleUpper = user.role.trim().toUpperCase();
  return roleUpper === "ADMIN" || roleUpper === "TEAM LEADER" || roleUpper === "LEADER";
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin / Team Leader)
export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, status, dueDate, deadline } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const taskStatus = status || "Pending";
    const taskProgress = taskStatus === "Completed" ? 100 : 0;

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      assignedBy: req.user._id,
      priority: priority || "Medium",
      status: taskStatus,
      progress: taskProgress,
      dueDate: dueDate || deadline,
      deadline: deadline || dueDate,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email avatar")
      .populate("assignedBy", "name email avatar")
      .populate("projectId", "name");

    if (assignedTo) {
      if (taskStatus === "Completed") {
        await User.findByIdAndUpdate(assignedTo, {
          $inc: { completedTasks: 1, productivityScore: 10 },
        });
      }

      await Notification.create({
        userId: assignedTo,
        message: `You've been assigned a new task: "${title}" in project "${project.name}"`,
        type: "task_assigned",
      });

      if (req.io) {
        req.io.to(assignedTo.toString()).emit("notification", {
          message: `You've been assigned a new task: "${title}"`,
          type: "task_assigned",
        });
        req.io.emit("taskCreated", populatedTask);
      }
    }

    return res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: "Server error creating task", error: error.message });
  }
};

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { search, status, priority, projectId, assignedTo, assignee, page = 1, limit = 50 } = req.query;
    const filter = {};

    // 1. Text Search Filter
    if (search && typeof search === "string" && search.trim() !== "") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 2. Case-Insensitive Status Filter (🚀 FIXED: Sanitized drop-down placeholders)
    if (status && status !== "all" && status !== "undefined" && !String(status).toLowerCase().includes("all") && String(status).trim() !== "") {
      filter.status = { $regex: new RegExp(`^${status.trim()}$`, "i") };
    }

    // 3. Case-Insensitive Priority Filter (🚀 FIXED: Sanitized drop-down placeholders)
    if (priority && priority !== "all" && priority !== "undefined" && !String(priority).toLowerCase().includes("all") && String(priority).trim() !== "") {
      filter.priority = { $regex: new RegExp(`^${priority.trim()}$`, "i") };
    }

    // 4. Project Filter (🚀 FIXED: Sanitized drop-down placeholders)
    if (projectId && projectId !== "all" && projectId !== "undefined" && !String(projectId).toLowerCase().includes("all") && String(projectId).trim() !== "") {
      filter.projectId = projectId;
    }

    // 5. User Assignment Filter (🚀 FIXED: Added strict guard checking against "All Assignee" text labels!)
    const targetUser = assignedTo || assignee;
    if (targetUser && targetUser !== "all" && targetUser !== "undefined" && !String(targetUser).toLowerCase().includes("all") && String(targetUser).trim() !== "") {
      filter.assignedTo = targetUser;
    }

    // 6. Security Role Isolation Filter
    if (!isLeaderOrAdmin(req.user)) {
      filter.assignedTo = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("assignedTo", "name email avatar")
        .populate("assignedBy", "name email avatar")
        .populate("projectId", "name status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    // 🚀 FIXED RESPONSE STRUCTURE: Double-maps to both root keys to resolve all client mapping setups flawlessly!
    return res.json({
      tasks: tasks,
      data: tasks,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ message: "Server error fetching tasks", error: error.message });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email avatar")
      .populate("assignedBy", "name email avatar")
      .populate("projectId", "name status")
      .populate("notes.user", "name email avatar");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!isLeaderOrAdmin(req.user) && task.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You don't have access to this task" });
    }

    return res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    return res.status(500).json({ message: "Server error fetching task", error: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const wasCompleted = task.status === "Completed";
    const oldAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;

    if (!isLeaderOrAdmin(req.user)) {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only update your own tasks" });
      }
      const { status, progress } = req.body;
      if (status !== undefined) task.status = status;
      if (progress !== undefined) task.progress = progress;
    } else {
      const { title, description, projectId, assignedTo, priority, status, progress, dueDate, deadline } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (projectId !== undefined) task.projectId = projectId;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (priority !== undefined) task.priority = priority;
      if (status !== undefined) task.status = status;
      if (progress !== undefined) task.progress = progress;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (deadline !== undefined) task.deadline = deadline;
    }

    if (task.status === "Completed") {
      task.progress = 100;
    } else if (task.status === "Pending" && task.progress === 100) {
      task.progress = 0;
    }

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate("assignedTo", "name email avatar")
      .populate("assignedBy", "name email avatar")
      .populate("projectId", "name status");

    const isNowCompleted = task.status === "Completed";
    const newAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;

    if (oldAssignedTo === newAssignedTo) {
      if (isNowCompleted && !wasCompleted) {
        await User.findByIdAndUpdate(task.assignedTo, { $inc: { completedTasks: 1, productivityScore: 10 } });
      } else if (!isNowCompleted && wasCompleted) {
        await User.findByIdAndUpdate(task.assignedTo, { $inc: { completedTasks: -1, productivityScore: -10 } });
      }
    } else {
      if (wasCompleted && oldAssignedTo) {
        await User.findByIdAndUpdate(oldAssignedTo, { $inc: { completedTasks: -1, productivityScore: -10 } });
      }
      if (isNowCompleted && newAssignedTo) {
        await User.findByIdAndUpdate(newAssignedTo, { $inc: { completedTasks: 1, productivityScore: 10 } });
      }
    }

    if (req.io) {
      req.io.emit("taskUpdated", populatedTask);
    }

    return res.json(populatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ message: "Server error updating task", error: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin / Team Leader)
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status === "Completed" && task.assignedTo) {
      await User.findByIdAndUpdate(task.assignedTo, {
        $inc: { completedTasks: -1, productivityScore: -10 },
      });
    }

    await Task.findByIdAndDelete(task._id);

    if (req.io) {
      req.io.emit("taskDeleted", { taskId: task._id });
    }

    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ message: "Server error deleting task", error: error.message });
  }
};

// @desc    Add note to task
// @route   POST /api/tasks/:id/notes
// @access  Private
export const addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Note text is required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!isLeaderOrAdmin(req.user) && task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You don't have access to this task" });
    }

    task.notes.push({
      text: text.trim(),
      user: req.user._id,
      userName: req.user.name,
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email avatar")
      .populate("assignedBy", "name email avatar")
      .populate("projectId", "name status")
      .populate("notes.user", "name email avatar");

    return res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Add note error:", error);
    return res.status(500).json({ message: "Server error adding note", error: error.message });
  }
};

// @desc    Delete note from task
// @route   DELETE /api/tasks/:id/notes/:noteId
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const note = task.notes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (!isLeaderOrAdmin(req.user) && note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own notes" });
    }

    task.notes.pull({ _id: req.params.noteId });
    await task.save();

    return res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    return res.status(500).json({ message: "Server error deleting note", error: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    let taskFilter = {};
    let projectFilter = {};

    if (!isLeaderOrAdmin(req.user)) {
      taskFilter.assignedTo = req.user._id;
      projectFilter.$or = [
        { members: req.user._id },
        { createdBy: req.user._id },
      ];
    }

    const taskStats = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const tasks = { total: 0, pending: 0, inProgress: 0, completed: 0 };
    taskStats.forEach((stat) => {
      tasks.total += stat.count;
      if (stat._id === "Pending") tasks.pending = stat.count;
      if (stat._id === "In Progress") tasks.inProgress = stat.count;
      if (stat._id === "Completed") tasks.completed = stat.count;
    });

    const priorityStats = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const priorities = { Low: 0, Medium: 0, High: 0 };
    priorityStats.forEach((stat) => {
      priorities[stat._id] = stat.count;
    });

    const projectCount = await Project.countDocuments(projectFilter);
    const recentTasks = await Task.find(taskFilter).populate("assignedTo", "name email avatar").populate("projectId", "name").sort({ createdAt: -1 }).limit(5);
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      status: { $ne: "Completed" },
      $or: [{ dueDate: { $lt: new Date() } }, { deadline: { $lt: new Date() } }],
    });

    const teamCount = await User.countDocuments({ _id: { $ne: req.user._id } });

    return res.json({
      tasks,
      priorities,
      projectCount,
      totalProjects: projectCount,
      projects: projectCount,
      recentTasks,
      overdueTasks,
      teamCount,
      totalMembers: teamCount,
      members: teamCount,
      teamMembers: teamCount,
      memberCount: teamCount,
      userCount: teamCount,
      totalUsers: teamCount
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({ message: "Server error fetching dashboard stats", error: error.message });
  }
};
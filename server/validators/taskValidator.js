import { isValidObjectId } from "../utils/helpers.js";

/**
 * Task Validators
 */

export const validateCreateTask = (req, res, next) => {
  const errors = [];
  const { title, description, projectId, assignedTo, priority, status, dueDate, deadline } =
    req.body;

  // Title (required)
  if (!title || title.trim().length === 0) {
    errors.push("Task title is required");
  } else if (title.trim().length < 2) {
    errors.push("Task title must be at least 2 characters");
  } else if (title.trim().length > 200) {
    errors.push("Task title cannot exceed 200 characters");
  }

  // Description (optional)
  if (description && description.length > 2000) {
    errors.push("Description cannot exceed 2000 characters");
  }

  // Project ID (required)
  if (!projectId) {
    errors.push("Project ID is required");
  } else if (!isValidObjectId(projectId)) {
    errors.push("Invalid project ID format");
  }

  // Assigned To (optional)
  if (assignedTo && !isValidObjectId(assignedTo)) {
    errors.push("Invalid assignee user ID format");
  }

  // Priority (optional)
  if (priority && !["Low", "Medium", "High"].includes(priority)) {
    errors.push("Priority must be one of: Low, Medium, High");
  }

  // Status (optional)
  if (status && !["Pending", "In Progress", "Completed"].includes(status)) {
    errors.push("Status must be one of: Pending, In Progress, Completed");
  }

  // Due date
  const due = dueDate || deadline;
  if (due && isNaN(Date.parse(due))) {
    errors.push("Invalid due date format");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(". ") });
  }

  next();
};

export const validateUpdateTask = (req, res, next) => {
  const errors = [];
  const { title, description, projectId, assignedTo, priority, status, progress, dueDate, deadline } =
    req.body;

  // At least one field
  if (
    title === undefined &&
    description === undefined &&
    projectId === undefined &&
    assignedTo === undefined &&
    priority === undefined &&
    status === undefined &&
    progress === undefined &&
    dueDate === undefined &&
    deadline === undefined
  ) {
    errors.push("At least one field is required to update");
  }

  if (title !== undefined) {
    if (title.trim().length < 2) {
      errors.push("Task title must be at least 2 characters");
    } else if (title.trim().length > 200) {
      errors.push("Task title cannot exceed 200 characters");
    }
  }

  if (description !== undefined && description.length > 2000) {
    errors.push("Description cannot exceed 2000 characters");
  }

  if (projectId !== undefined && !isValidObjectId(projectId)) {
    errors.push("Invalid project ID format");
  }

  if (assignedTo !== undefined && assignedTo !== null && !isValidObjectId(assignedTo)) {
    errors.push("Invalid assignee user ID format");
  }

  if (priority !== undefined && !["Low", "Medium", "High"].includes(priority)) {
    errors.push("Priority must be one of: Low, Medium, High");
  }

  if (status !== undefined && !["Pending", "In Progress", "Completed"].includes(status)) {
    errors.push("Status must be one of: Pending, In Progress, Completed");
  }

  if (progress !== undefined) {
    const p = Number(progress);
    if (isNaN(p) || p < 0 || p > 100) {
      errors.push("Progress must be a number between 0 and 100");
    }
  }

  const due = dueDate || deadline;
  if (due !== undefined && isNaN(Date.parse(due))) {
    errors.push("Invalid due date format");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(". ") });
  }

  next();
};

export const validateAddNote = (req, res, next) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Note text is required" });
  }

  if (text.trim().length > 1000) {
    return res
      .status(400)
      .json({ success: false, message: "Note text cannot exceed 1000 characters" });
  }

  next();
};

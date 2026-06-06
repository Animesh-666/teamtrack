import { isValidObjectId } from "../utils/helpers.js";

/**
 * Project Validators
 */

export const validateCreateProject = (req, res, next) => {
  const errors = [];
  const { name, description, startDate, endDate, dueDate, status, members } = req.body;

  // Name (required)
  if (!name || name.trim().length === 0) {
    errors.push("Project name is required");
  } else if (name.trim().length < 2) {
    errors.push("Project name must be at least 2 characters");
  } else if (name.trim().length > 100) {
    errors.push("Project name cannot exceed 100 characters");
  }

  // Description (optional, but validate length if provided)
  if (description && description.length > 1000) {
    errors.push("Description cannot exceed 1000 characters");
  }

  // Dates
  if (startDate && isNaN(Date.parse(startDate))) {
    errors.push("Invalid start date format");
  }

  const end = endDate || dueDate;
  if (end && isNaN(Date.parse(end))) {
    errors.push("Invalid end/due date format");
  }

  if (startDate && end) {
    if (new Date(end) < new Date(startDate)) {
      errors.push("End date cannot be before start date");
    }
  }

  // Status (optional)
  if (status && !["active", "completed", "on-hold"].includes(status.toLowerCase())) {
    errors.push("Status must be one of: active, completed, on-hold");
  }

  // Members (optional, but each must be a valid ObjectId)
  if (members) {
    if (!Array.isArray(members)) {
      errors.push("Members must be an array of user IDs");
    } else {
      const invalid = members.filter((id) => !isValidObjectId(id));
      if (invalid.length > 0) {
        errors.push(`Invalid member ID(s): ${invalid.join(", ")}`);
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(". ") });
  }

  next();
};

export const validateUpdateProject = (req, res, next) => {
  const errors = [];
  const { name, description, startDate, endDate, dueDate, status, members } = req.body;

  // At least one field must be provided
  if (
    name === undefined &&
    description === undefined &&
    startDate === undefined &&
    endDate === undefined &&
    dueDate === undefined &&
    status === undefined &&
    members === undefined
  ) {
    errors.push("At least one field is required to update");
  }

  if (name !== undefined) {
    if (name.trim().length < 2) {
      errors.push("Project name must be at least 2 characters");
    } else if (name.trim().length > 100) {
      errors.push("Project name cannot exceed 100 characters");
    }
  }

  if (description !== undefined && description.length > 1000) {
    errors.push("Description cannot exceed 1000 characters");
  }

  if (startDate !== undefined && isNaN(Date.parse(startDate))) {
    errors.push("Invalid start date format");
  }

  const end = endDate || dueDate;
  if (end !== undefined && isNaN(Date.parse(end))) {
    errors.push("Invalid end/due date format");
  }

  if (status !== undefined && !["active", "completed", "on-hold"].includes(status.toLowerCase())) {
    errors.push("Status must be one of: active, completed, on-hold");
  }

  if (members !== undefined) {
    if (!Array.isArray(members)) {
      errors.push("Members must be an array of user IDs");
    } else {
      const invalid = members.filter((id) => !isValidObjectId(id));
      if (invalid.length > 0) {
        errors.push(`Invalid member ID(s): ${invalid.join(", ")}`);
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(". ") });
  }

  next();
};

export const validateAddMember = (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID format" });
  }

  next();
};

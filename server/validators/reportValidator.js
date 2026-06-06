import { isValidObjectId } from "../utils/helpers.js";

/**
 * Report Validators
 */

export const validateCreateReport = (req, res, next) => {
  const errors = [];
  const { projectId, reportText, hoursWorked, date } = req.body;

  // Project ID (required)
  if (!projectId) {
    errors.push("Project ID is required");
  } else if (!isValidObjectId(projectId)) {
    errors.push("Invalid project ID format");
  }

  // Report text (required)
  if (!reportText || reportText.trim().length === 0) {
    errors.push("Report text is required");
  } else if (reportText.trim().length < 10) {
    errors.push("Report text must be at least 10 characters");
  } else if (reportText.trim().length > 5000) {
    errors.push("Report text cannot exceed 5000 characters");
  }

  // Hours worked (required)
  if (hoursWorked === undefined || hoursWorked === null) {
    errors.push("Hours worked is required");
  } else {
    const h = Number(hoursWorked);
    if (isNaN(h)) {
      errors.push("Hours worked must be a number");
    } else if (h < 0) {
      errors.push("Hours worked cannot be negative");
    } else if (h > 24) {
      errors.push("Hours worked cannot exceed 24 hours");
    }
  }

  // Date (optional)
  if (date && isNaN(Date.parse(date))) {
    errors.push("Invalid date format");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(". ") });
  }

  next();
};

export const validateUpdateReport = (req, res, next) => {
  const errors = [];
  const { projectId, reportText, hoursWorked, date } = req.body;

  // At least one field
  if (
    projectId === undefined &&
    reportText === undefined &&
    hoursWorked === undefined &&
    date === undefined
  ) {
    errors.push("At least one field is required to update");
  }

  if (projectId !== undefined && !isValidObjectId(projectId)) {
    errors.push("Invalid project ID format");
  }

  if (reportText !== undefined) {
    if (reportText.trim().length < 10) {
      errors.push("Report text must be at least 10 characters");
    } else if (reportText.trim().length > 5000) {
      errors.push("Report text cannot exceed 5000 characters");
    }
  }

  if (hoursWorked !== undefined) {
    const h = Number(hoursWorked);
    if (isNaN(h)) {
      errors.push("Hours worked must be a number");
    } else if (h < 0) {
      errors.push("Hours worked cannot be negative");
    } else if (h > 24) {
      errors.push("Hours worked cannot exceed 24 hours");
    }
  }

  if (date !== undefined && isNaN(Date.parse(date))) {
    errors.push("Invalid date format");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(". ") });
  }

  next();
};

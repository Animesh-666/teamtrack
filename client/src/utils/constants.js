/**
 * constants.js
 * ─────────────────────────────────────────────────────────────
 * App-wide constants for roles, statuses, priority levels, and default settings.
 */

export const USER_ROLES = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
};

export const TASK_STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export const TASK_PRIORITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const PROJECT_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  ON_HOLD: "on-hold",
};

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: "task_assigned",
  TASK_UPDATED: "task_updated",
  REPORT_SUBMITTED: "report_submitted",
  PROJECT_CREATED: "project_created",
  SYSTEM: "system",
};

export const CHART_COLORS = {
  GREEN: {
    solid: "#22c55e",
    alpha: "rgba(34, 197, 148, 0.2)",
  },
  BLUE: {
    solid: "#3b82f6",
    alpha: "rgba(59, 130, 246, 0.2)",
  },
  PURPLE: {
    solid: "#a855f7",
    alpha: "rgba(168, 85, 247, 0.2)",
  },
  AMBER: {
    solid: "#f59e0b",
    alpha: "rgba(245, 158, 11, 0.2)",
  },
  RED: {
    solid: "#ef4444",
    alpha: "rgba(239, 68, 68, 0.2)",
  },
  SLATE: {
    solid: "#64748b",
    alpha: "rgba(100, 116, 139, 0.2)",
  },
};
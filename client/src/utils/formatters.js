/**
 * formatters.js
 * ─────────────────────────────────────────────────────────────
 * General formatting utilities for date parsing, relative times,
 * currency/percent gauges, and string truncations.
 */

/**
 * Formats an ISO date string into a clean, human-readable date.
 * Example: 2026-06-02T08:00:00.000Z -> Jun 2, 2026
 */
export const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Formats a date string into a detailed format (with time).
 * Example: Jun 2, 2026 at 08:30 AM
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Calculates and returns a relative time description (e.g., "3 hours ago", "Yesterday").
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 0) return "Just now"; // Handle future dates or clock mismatch
  if (seconds < 60) return "Just now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Truncates a long text string and appends ellipsis.
 */
export const truncateText = (text, maxLength = 60) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

/**
 * Formats numbers into progress percentages.
 */
export const formatPercent = (value) => {
  const number = Number(value);
  if (isNaN(number)) return "0%";
  return `${Math.min(100, Math.max(0, Math.round(number)))}%`;
};
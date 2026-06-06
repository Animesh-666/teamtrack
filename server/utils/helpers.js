import jwt from "jsonwebtoken";

// ═══════════════════════════════════════════════════════════
//  JWT Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Generate a signed JWT token
 * @param {string} userId - Mongo ObjectId of the user
 * @param {string} expiresIn - Token lifetime (default "30d")
 * @returns {string} Signed JWT
 */
export const generateToken = (userId, expiresIn = "30d") => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {object|null} Decoded payload or null on failure
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
//  Response Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Standard success response
 */
export const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
};

/**
 * Standard error response
 */
export const errorResponse = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// ═══════════════════════════════════════════════════════════
//  Pagination Helper
// ═══════════════════════════════════════════════════════════

/**
 * Parse page & limit from query string and return skip + sanitised values
 * @param {object} query - req.query
 * @param {number} defaultLimit
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const parsePagination = (query, defaultLimit = 50) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build a pagination metadata object for API responses
 */
export const paginationMeta = (total, page, limit) => ({
  total,
  page,
  pages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

// ═══════════════════════════════════════════════════════════
//  Date Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Get the start-of-day Date for a given date (or today)
 */
export const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the end-of-day Date for a given date (or today)
 */
export const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get the start of the current week (Sunday)
 */
export const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the start of the current month
 */
export const startOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Build a Mongo date-range filter from a period string
 * @param {"today"|"week"|"month"} period
 * @returns {{ $gte: Date, $lte: Date } | null}
 */
export const dateRangeFromPeriod = (period) => {
  const now = new Date();
  switch (period) {
    case "today":
      return { $gte: startOfDay(now), $lte: endOfDay(now) };
    case "week":
      return { $gte: startOfWeek(now), $lte: now };
    case "month":
      return { $gte: startOfMonth(now), $lte: now };
    default:
      return null;
  }
};

// ═══════════════════════════════════════════════════════════
//  String / Formatting Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Generate a random hex colour (useful for default avatars, tags, etc.)
 */
export const randomColor = () => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
};

/**
 * Slugify a string (e.g. project names → URL-safe slugs)
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

// ═══════════════════════════════════════════════════════════
//  Validation Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Check if a string is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Check if a string is a valid email format
 */
export const isValidEmail = (email) => {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
};

// ═══════════════════════════════════════════════════════════
//  Misc
// ═══════════════════════════════════════════════════════════

/**
 * Async wrapper — eliminates try/catch boilerplate in route handlers
 * Usage:  router.get("/", asyncHandler(myController))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Pick only allowed keys from an object (useful for sanitising req.body)
 */
export const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

/**
 * Sleep / delay utility (useful in dev / retry logic)
 * @param {number} ms
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  generateToken,
  verifyToken,
  successResponse,
  errorResponse,
  parsePagination,
  paginationMeta,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  dateRangeFromPeriod,
  capitalize,
  randomColor,
  slugify,
  isValidObjectId,
  isValidEmail,
  asyncHandler,
  pick,
  sleep,
};

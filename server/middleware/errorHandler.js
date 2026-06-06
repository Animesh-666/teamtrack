// @desc    404 handler — catches requests to undefined routes
export const notFound = (req, res, next) => {
  const error = new Error(`Not found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// @desc    Global error handler — normalizes all errors into a consistent JSON response
//          Must be registered LAST in the middleware chain (after all routes)
export const errorHandler = (err, req, res, next) => {
  // Log the full error in development
  console.error("💥 Error:", err.stack || err.message);

  // Determine status code (default to 500 if res still shows 200)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  // ─── Mongoose: bad ObjectId (CastError) ───
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found — invalid ID";
  }

  // ─── Mongoose: duplicate key (code 11000) ───
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(", ");
    message = `Duplicate value entered for field: ${field}. Please use another value.`;
  }

  // ─── Mongoose: validation error ───
  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(". ");
  }

  // ─── JWT errors (fallback, in case they slip past auth middleware) ───
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please login again.";
  }

  // ─── Multer file upload errors ───
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large. Maximum size is 5MB.";
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Unexpected file field.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

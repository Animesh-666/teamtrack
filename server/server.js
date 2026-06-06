import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Config
import connectDB from "./config/db.js";

// Middleware
import { notFound, errorHandler } from "./middleware/errorHandler.js";
//import { attachSocketIO } from "./middleware/upload.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Socket
import initializeSocket from "./socket/socketHandler.js";

// ─── Load environment variables ───
dotenv.config();

// ─── __dirname for ES modules ───
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Initialize Express ───
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Define allowed origins array ───
const allowedOrigins = [
  process.env.VITE_API_URL,
  "http://localhost:5173",
  "http://localhost:3000" // Added to match your active Vite layout environment setup
].filter(Boolean); // Dynamically drops undefined values if VITE_API_URL is empty

// ─── Create HTTP server and Socket.IO ───
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ═══════════════════════════════════════════════════════════
//  Global Middleware
// ═══════════════════════════════════════════════════════════

// CORS Configuration Engine
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or programmatic test payloads (like Postman or curl strings)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this backend engine does not allow cross-origin requests from ${origin}.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Attach Socket.IO instance to every request (req.io)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ═══════════════════════════════════════════════════════════
//  Health Check
// ═══════════════════════════════════════════════════════════
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ═══════════════════════════════════════════════════════════
//  API Routes
// ═══════════════════════════════════════════════════════════
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

// ═══════════════════════════════════════════════════════════
//  Serve Frontend in Production
// ═══════════════════════════════════════════════════════════
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "..", "client", "dist");
  app.use(express.static(clientBuildPath));

  // All non-API routes → React app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      message: "TeamTrack API is running 🚀",
      docs: "/api/health",
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  Error Handling (must be LAST)
// ═══════════════════════════════════════════════════════════
app.use(notFound);
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════
//  Initialize Socket.IO Handlers
// ═══════════════════════════════════════════════════════════
initializeSocket(io);

// ═══════════════════════════════════════════════════════════
//  Connect to MongoDB & Start Server
// ═══════════════════════════════════════════════════════════
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      let runPort = PORT;
      console.log(`\n🚀 ═══════════════════════════════════════════════`);
      console.log(`   TeamTrack Server running on port ${runPort}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`   API:         http://localhost:${runPort}/api`);
      console.log(`   Health:      http://localhost:${runPort}/api/health`);
      console.log(`   Socket.IO:   Enabled`);
      console.log(`🚀 ═══════════════════════════════════════════════\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// ─── Graceful shutdown ───
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("⚠️ Uncaught Exception:", error);
  process.exit(1);
});

export default app;
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
// CHANGED: Now using CLIENT_URL (the Vercel frontend URL) for CORS
const allowedOrigins = [
  process.env.CLIENT_URL, 
  "http://localhost:5173",
  "http://localhost:3000" 
].filter(Boolean); 

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

app.use(
  cors({
    origin: function (origin, callback) {
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
//  Serve Frontend in Production (DISABLED: Frontend is now on Vercel)
// ═══════════════════════════════════════════════════════════
app.get("/", (req, res) => {
  res.json({
    message: "TeamTrack API is running 🚀",
    docs: "/api/health",
  });
});

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
      console.log(`\n🚀 ═══════════════════════════════════════════════`);
      console.log(`   TeamTrack Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`   API:         http://localhost:${PORT}/api`);
      console.log(`🚀 ═══════════════════════════════════════════════\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
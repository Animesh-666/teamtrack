import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Initialise all Socket.IO event handlers
 * Called once from server.js after creating the io instance
 *
 * @param {import("socket.io").Server} io
 */
const initializeSocket = (io) => {
  // ═══════════════════════════════════════════════════════
  //  Connection-level auth middleware
  //  Verifies the JWT before allowing the handshake
  // ═══════════════════════════════════════════════════════
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: no token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: user not found"));
      }

      // Attach user data to the socket for later use
      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Authentication error: invalid token"));
    }
  });

  // ═══════════════════════════════════════════════════════
  //  Connection handler
  // ═══════════════════════════════════════════════════════
  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    const userName = socket.user.name;

    console.log(`🟢 Socket connected: ${userName} (${userId}) — socket ${socket.id}`);

    // ─── Auto-join personal room (for targeted notifications) ───
    socket.join(userId);

    // ─── Broadcast online status ───
    socket.broadcast.emit("userOnline", {
      userId,
      name: userName,
    });

    // ──────────────────────────────────────────────────────
    //  Room / Channel management
    // ──────────────────────────────────────────────────────

    /**
     * Join a project room — enables project-scoped broadcasts
     * Client emits: socket.emit("joinProject", projectId)
     */
    socket.on("joinProject", (projectId) => {
      if (!projectId) return;
      const room = `project:${projectId}`;
      socket.join(room);
      console.log(`📁 ${userName} joined room ${room}`);
    });

    /**
     * Leave a project room
     * Client emits: socket.emit("leaveProject", projectId)
     */
    socket.on("leaveProject", (projectId) => {
      if (!projectId) return;
      const room = `project:${projectId}`;
      socket.leave(room);
      console.log(`📁 ${userName} left room ${room}`);
    });

    // ──────────────────────────────────────────────────────
    //  Task events (relayed to relevant rooms)
    // ──────────────────────────────────────────────────────

    /**
     * Task status changed by a member
     * Client emits: socket.emit("taskStatusUpdate", { taskId, status, projectId })
     */
    socket.on("taskStatusUpdate", (data) => {
      const { taskId, status, projectId } = data || {};
      if (!taskId || !status) return;

      const payload = {
        taskId,
        status,
        updatedBy: { _id: userId, name: userName },
        updatedAt: new Date(),
      };

      // Broadcast to the project room (everyone except sender)
      if (projectId) {
        socket.to(`project:${projectId}`).emit("taskStatusChanged", payload);
      }

      // Also broadcast globally for dashboard widgets
      socket.broadcast.emit("taskStatusChanged", payload);
    });

    /**
     * Task progress updated
     * Client emits: socket.emit("taskProgressUpdate", { taskId, progress, projectId })
     */
    socket.on("taskProgressUpdate", (data) => {
      const { taskId, progress, projectId } = data || {};
      if (!taskId || progress === undefined) return;

      const payload = {
        taskId,
        progress,
        updatedBy: { _id: userId, name: userName },
        updatedAt: new Date(),
      };

      if (projectId) {
        socket.to(`project:${projectId}`).emit("taskProgressChanged", payload);
      }

      socket.broadcast.emit("taskProgressChanged", payload);
    });

    /**
     * New note added to a task
     * Client emits: socket.emit("taskNoteAdded", { taskId, note, projectId })
     */
    socket.on("taskNoteAdded", (data) => {
      const { taskId, note, projectId } = data || {};
      if (!taskId || !note) return;

      const payload = {
        taskId,
        note: { ...note, user: { _id: userId, name: userName } },
      };

      if (projectId) {
        socket.to(`project:${projectId}`).emit("newTaskNote", payload);
      }
    });

    // ──────────────────────────────────────────────────────
    //  Report events
    // ──────────────────────────────────────────────────────

    /**
     * New report submitted
     * Client emits: socket.emit("reportSubmitted", report)
     */
    socket.on("reportSubmitted", (report) => {
      if (!report) return;

      socket.broadcast.emit("newReport", {
        ...report,
        submittedBy: { _id: userId, name: userName },
      });
    });

    // ──────────────────────────────────────────────────────
    //  Notification acknowledgements
    // ──────────────────────────────────────────────────────

    /**
     * Client marks notification(s) as read
     * Client emits: socket.emit("notificationsRead", { notificationIds })
     */
    socket.on("notificationsRead", (data) => {
      const { notificationIds } = data || {};
      if (!notificationIds) return;

      // Could update DB here or just acknowledge
      socket.emit("notificationsReadAck", { notificationIds });
    });

    // ──────────────────────────────────────────────────────
    //  Typing indicators (optional UX polish)
    // ──────────────────────────────────────────────────────

    socket.on("typing", (data) => {
      const { projectId, taskId } = data || {};
      const room = projectId ? `project:${projectId}` : null;

      const payload = { userId, name: userName, taskId };

      if (room) {
        socket.to(room).emit("userTyping", payload);
      }
    });

    socket.on("stopTyping", (data) => {
      const { projectId, taskId } = data || {};
      const room = projectId ? `project:${projectId}` : null;

      const payload = { userId, taskId };

      if (room) {
        socket.to(room).emit("userStoppedTyping", payload);
      }
    });

    // ──────────────────────────────────────────────────────
    //  Disconnect
    // ──────────────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      console.log(`🔴 Socket disconnected: ${userName} (${userId}) — ${reason}`);

      socket.broadcast.emit("userOffline", {
        userId,
        name: userName,
      });
    });

    // ──────────────────────────────────────────────────────
    //  Error handler
    // ──────────────────────────────────────────────────────
    socket.on("error", (error) => {
      console.error(`⚠️ Socket error for ${userName}:`, error.message);
    });
  });

  console.log("⚡ Socket.IO handlers initialised");
};

export default initializeSocket;

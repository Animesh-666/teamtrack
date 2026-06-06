import Notification from "../models/Notification.js";

/**
 * Notification Service
 * Centralizes notification creation and delivery logic so that
 * controllers, socket handlers, and cron jobs can all reuse it
 * without duplicating code.
 */

// ─── Create a single notification and optionally emit via Socket.IO ───
export const createNotification = async ({ userId, message, type = "system", io = null }) => {
  try {
    const notification = await Notification.create({
      userId,
      message,
      type,
    });

    // Real-time delivery
    if (io) {
      io.to(userId.toString()).emit("notification", {
        _id: notification._id,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    console.error("notificationService.createNotification error:", error.message);
    return null;
  }
};

// ─── Create notifications for multiple users at once ───
export const createBulkNotifications = async ({ userIds, message, type = "system", io = null }) => {
  try {
    if (!userIds || userIds.length === 0) return [];

    const docs = userIds.map((userId) => ({
      userId,
      message,
      type,
    }));

    const notifications = await Notification.insertMany(docs);

    // Real-time delivery to each user
    if (io) {
      userIds.forEach((userId) => {
        io.to(userId.toString()).emit("notification", {
          message,
          type,
        });
      });
    }

    return notifications;
  } catch (error) {
    console.error("notificationService.createBulkNotifications error:", error.message);
    return [];
  }
};

// ─── Notify all admins (useful for report submissions, escalations, etc.) ───
export const notifyAdmins = async ({ message, type = "system", io = null, excludeUserId = null }) => {
  try {
    // Lazy-import User to avoid circular dependency issues
    const { default: User } = await import("../models/User.js");

    const filter = { role: "ADMIN" };
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }

    const admins = await User.find(filter).select("_id");
    const adminIds = admins.map((a) => a._id);

    if (adminIds.length === 0) return [];

    return await createBulkNotifications({ userIds: adminIds, message, type, io });
  } catch (error) {
    console.error("notificationService.notifyAdmins error:", error.message);
    return [];
  }
};

// ─── Notify all members of a specific project ───
export const notifyProjectMembers = async ({
  projectId,
  message,
  type = "system",
  io = null,
  excludeUserId = null,
}) => {
  try {
    const { default: Project } = await import("../models/Project.js");

    const project = await Project.findById(projectId).select("members");
    if (!project) return [];

    let memberIds = project.members.map((id) => id.toString());

    if (excludeUserId) {
      memberIds = memberIds.filter((id) => id !== excludeUserId.toString());
    }

    if (memberIds.length === 0) return [];

    return await createBulkNotifications({ userIds: memberIds, message, type, io });
  } catch (error) {
    console.error("notificationService.notifyProjectMembers error:", error.message);
    return [];
  }
};

// ─── Get unread count for a user ───
export const getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({ userId, read: false });
  } catch (error) {
    console.error("notificationService.getUnreadCount error:", error.message);
    return 0;
  }
};

// ─── Mark all notifications as read for a user ───
export const markAllRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    return result.modifiedCount;
  } catch (error) {
    console.error("notificationService.markAllRead error:", error.message);
    return 0;
  }
};

// ─── Delete old notifications (cleanup, e.g. called by a cron job) ───
export const deleteOldNotifications = async (daysOld = 30) => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const result = await Notification.deleteMany({ createdAt: { $lt: cutoff } });
    console.log(`🗑️  Cleaned up ${result.deletedCount} notifications older than ${daysOld} days`);
    return result.deletedCount;
  } catch (error) {
    console.error("notificationService.deleteOldNotifications error:", error.message);
    return 0;
  }
};

export default {
  createNotification,
  createBulkNotifications,
  notifyAdmins,
  notifyProjectMembers,
  getUnreadCount,
  markAllRead,
  deleteOldNotifications,
};

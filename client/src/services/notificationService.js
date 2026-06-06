/**
 * notificationService.js
 * ─────────────────────────────────────────────────────────────
 * Communicates with backend endpoints relating to user activity logs.
 */
import api from "./api";

const notificationService = {
  getNotifications: (params) => api.get("/notifications", { params }).then((res) => res.data), // 🚀 Added standard unwrapping
  markAsRead: (id) => api.put(`/notifications/${id}/read`).then((res) => res.data),
  markAllAsRead: () => api.put("/notifications/read-all").then((res) => res.data),
  clearAll: () => api.delete("/notifications/clear-all").then((res) => res.data),
  deleteNotification: (id) => api.delete(`/notifications/${id}`).then((res) => res.data),
};

export default notificationService;
export { notificationService };
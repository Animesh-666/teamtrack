/**
 * taskService.js
 * ─────────────────────────────────────────────────────────────
 * Communicates with backend endpoints relating to task delegation.
 */
import api from "./api";

const taskService = {
  getTasks: (params) => api.get("/tasks", { params }).then((res) => res.data),
  getTask: (id) => api.get(`/tasks/${id}`).then((res) => res.data),
  getMyTasks: () => api.get("/tasks/").then((res) => res.data), // 🚀 Added to fix dashboard/task page crashes!
  createTask: (taskData) => api.post("/tasks", taskData).then((res) => res.data),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData).then((res) => res.data),
  deleteTask: (id) => api.delete(`/tasks/${id}`).then((res) => res.data),
  addNote: (id, note) => api.post(`/tasks/${id}/notes`, { note }).then((res) => res.data),
};

export default taskService;
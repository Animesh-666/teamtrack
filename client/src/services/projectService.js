/**
 * projectService.js
 * ─────────────────────────────────────────────────────────────
 * Communicates with backend endpoints relating to project management,
 * analytics compilation, and project member updates.
 */

import api from "./api";

const projectService = {
  getProjects: () => api.get("/projects").then((res) => res.data),
  getProject: (id) => api.get(`/projects/${id}`).then((res) => res.data),
  createProject: (projectData) => api.post("/projects", projectData).then((res) => res.data),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData).then((res) => res.data),
  deleteProject: (id) => api.delete(`/projects/${id}`).then((res) => res.data),
  
  addMember: (projectId, userId) =>
    api.post(`/projects/${projectId}/members`, { userId }).then((res) => res.data),
    
  removeMember: (projectId, userId) =>
    api.delete(`/projects/${projectId}/members/${userId}`).then((res) => res.data),
    
  getAnalytics: (id) => api.get(`/projects/${id}/analytics`).then((res) => res.data),
};

export default projectService;
/**
 * authService.js
 * ─────────────────────────────────────────────────────────────
 * Communicates with backend endpoints relating to user authentication,
 * registration, profile modification, and session validation.
 */

import api from "./api";

const authService = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  
  // Multipart data for uploads
  updateProfile: (formData) =>
    api.put("/auth/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
    
  changePassword: (passwordData) => api.put("/auth/change-password", passwordData),
};

export default authService;
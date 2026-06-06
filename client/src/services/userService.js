/**
 * userService.js
 * ─────────────────────────────────────────────────────────────
 * Communicates with backend endpoints relating to user profiles registry.
 */

import api from "./api";

const userService = {
  // 🚀 FIXED: Pointed base endpoints to look inside /auth/ route sub-trees
  getUsers: () => api.get("/auth/users").then((res) => res.data),
  getUser: (id) => api.get(`/auth/auth/users/${id}`).then((res) => res.data),
  getLeaderboard: (params) => api.get("/auth/leaderboard", { params }).then((res) => res.data),
};

export default userService;
/**
 * reportService.js
 * ─────────────────────────────────────────────────────────────
 * Communicates with backend endpoints relating to productivity logs.
 */
import api from "./api";

const reportService = {
  // Standard multi-use fetch hook
  getReports: (params) => api.get("/reports", { params }).then((res) => res.data),
  
  // 🚀 FIXED: Added the missing function to fetch individual user productivity reports
  getMyReports: () => api.get("/reports/me").then((res) => res.data),
  
  submitReport: (reportData) => api.post("/reports", reportData).then((res) => res.data),
  editReport: (id, reportData) => api.put(`/reports/${id}`, reportData).then((res) => res.data),
  deleteReport: (id) => api.delete(`/reports/${id}`).then((res) => res.data),
};

export default reportService;
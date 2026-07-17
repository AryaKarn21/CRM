import api from "./axios";

export const employeesAPI = {
  getAll: (params) => api.get("/employees", { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post("/employees", data),
  update: (id, data) => api.patch(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),

  // ── Sub-resources (Employee Details tabs) ──────────────────
  getDashboardStats: (id) => api.get(`/employees/${id}/dashboard-stats`),
  getAttendance: (id, params) =>
    api.get(`/employees/${id}/attendance`, { params }),
  getLeaves: (id) => api.get(`/employees/${id}/leaves`),
  getPayslips: (id) => api.get(`/employees/${id}/payslips`),
  getTimeline: (id, params) => api.get(`/employees/${id}/timeline`, { params }),

  // ── Documents ──────────────────────────────────────────────
  getDocuments: (id) => api.get(`/employees/${id}/documents`),
  addDocument: (id, data) => api.post(`/employees/${id}/documents`, data),
  deleteDocument: (id, docId) =>
    api.delete(`/employees/${id}/documents/${docId}`),
  // kept for the multipart uploader, if you use it elsewhere
  uploadDocument: (id, formData) =>
    api.post(`/employees/${id}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
   
  // ── Daily Reports ──────────────────────────────────────────
  getDailyReports: (id) => api.get(`/employees/${id}/daily-reports`),
  addDailyReport: (id, data) =>
    api.post(`/employees/${id}/daily-reports`, data),
  deleteDailyReport: (id, reportId) =>
    api.delete(`/employees/${id}/daily-reports/${reportId}`),
  // ── Import / Export ────────────────────────────────────────
  exportEmployees: (params) =>
    api.get("/employees/export", { params, responseType: "blob" }),
  importEmployees: (formData) =>
    api.post("/employees/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

    exportEmployeeProfile: (id) =>
  api.get(`/employees/${id}/export`, {
    responseType: "blob",
  }),

  updatePerformanceReview: (reviewId, data) =>
  performanceAPI.update(reviewId, data),
};

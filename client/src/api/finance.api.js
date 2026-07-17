import api from "./axios";

export const financeAPI = {
  getOverview: (params) => api.get("/finance/overview", { params }),
  getLedgerEntries: (params) => api.get("/finance/ledger", { params }),
  createEntry: (data) => api.post("/finance/ledger", data),
  getAccounts: () => api.get("/finance/chart-of-accounts"),
  getExpenses: (params) => api.get("/finance/expenses", { params }),
  getExpense: (id) => api.get(`/finance/expenses/${id}`),
  createExpense: (data) => api.post("/finance/expenses", data),
  updateExpense: (id, data) => api.patch(`/finance/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),
  approveExpense: (id) => api.patch(`/finance/expenses/${id}/approve`),
  rejectExpense: (id, reason) =>
    api.patch(`/finance/expenses/${id}/reject`, { reason }),
  getReports: (type, params) => api.get(`/finance/reports/${type}`, { params }),
  uploadReceipt: (id, formData) =>
    api.post(`/finance/expenses/${id}/receipt`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  viewReceipt: (id) =>
    api.get(`/finance/expenses/${id}/receipt/view`, {
      responseType: "blob",
    }),

  downloadReceipt: (id) =>
    api.get(`/finance/expenses/${id}/download`, {
      responseType: "blob",
    }),

  downloadExpenseReport: (id) =>
    api.get(`/finance/expenses/${id}/report`, {
      responseType: "blob",
    }),

  deleteReceipt: (id) => api.delete(`/finance/expenses/${id}/receipt`),
};
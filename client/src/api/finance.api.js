import api from './axios'

export const financeAPI = {
  getOverview: (params) => api.get('/finance/overview', { params }),
  getLedgerEntries: (params) => api.get('/finance/ledger', { params }),
  createEntry: (data) => api.post('/finance/ledger', data),
  getAccounts: () => api.get('/finance/chart-of-accounts'),
  getExpenses: (params) => api.get('/finance/expenses', { params }),
  createExpense: (data) => api.post('/finance/expenses', data),
  updateExpense: (id, data) => api.patch(`/finance/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),
  approveExpense: (id) => api.patch(`/finance/expenses/${id}/approve`),
  rejectExpense: (id, reason) => api.patch(`/finance/expenses/${id}/reject`, { reason }),
  getReports: (type, params) => api.get(`/finance/reports/${type}`, { params }),
}
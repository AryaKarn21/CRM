import api from './axios'

export const reportsAPI = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getCRMReport: (params) => api.get('/reports/crm', { params }),
  getHRReport: (params) => api.get('/reports/hr', { params }),
  getFinanceReport: (params) => api.get('/reports/finance', { params }),
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getSalesForecast: () => api.get('/reports/sales-forecast'),
  getPipelineReport: () => api.get('/reports/pipeline'),
  getRevenueByMonth: (year) => api.get('/reports/revenue-by-month', { params: { year } }),
  getDealsWonLost: (year) => api.get('/reports/deals-won-lost', { params: { year } }),
  getSalesFunnel: () => api.get('/reports/sales-funnel'),
  getExpensesAnalysis: (year) => api.get('/reports/expenses-analysis', { params: { year } }),
  getEmployeeAnalytics: () => api.get('/reports/employee-analytics'),
  getInventoryAnalytics: () => api.get('/reports/inventory-analytics'),
  getSupportAnalytics: (year) => api.get('/reports/support-analytics', { params: { year } }),
  getLeadSourceAnalytics: () => api.get('/reports/lead-source-analytics'),
  export: (type, params) => api.get(`/reports/export/${type}`, { params, responseType: 'blob' }),
}
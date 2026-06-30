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
  export: (type, params) => api.get(`/reports/export/${type}`, { params, responseType: 'blob' }),
}
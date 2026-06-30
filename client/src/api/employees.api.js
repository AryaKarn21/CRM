import api from './axios'

export const employeesAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.patch(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  uploadDocument: (id, formData) => api.post(`/employees/${id}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDocuments: (id) => api.get(`/employees/${id}/documents`),
  getPayslips: (id) => api.get(`/employees/${id}/payslips`),
  getAttendance: (id, params) => api.get(`/employees/${id}/attendance`, { params }),
  getLeaves: (id) => api.get(`/employees/${id}/leaves`),
}
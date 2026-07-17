import api from './axios'

export const performanceAPI = {
  getByEmployee: (employeeId) => api.get(`/performance/employee/${employeeId}`),
  getById: (id) => api.get(`/performance/${id}`),
  create: (data) => api.post('/performance', data),
  update: (id, data) => api.patch(`/performance/${id}`, data),
  delete: (id) => api.delete(`/performance/${id}`),
}
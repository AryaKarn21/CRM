import api from './axios'

export const leavesAPI = {
  getAll: (params) => api.get('/leaves', { params }),
  getById: (id) => api.get(`/leaves/${id}`),
  create: (data) => api.post('/leaves', data),
  update: (id, data) => api.patch(`/leaves/${id}`, data),
  approve: (id, remarks) => api.patch(`/leaves/${id}/approve`, { remarks }),
  reject: (id, remarks) => api.patch(`/leaves/${id}/reject`, { remarks }),
  cancel: (id) => api.patch(`/leaves/${id}/cancel`),
  getLeaveTypes: () => api.get('/leaves/types'),
  getBalance: (employeeId) => api.get(`/leaves/balance/${employeeId}`),
}
import api from './axios'

export const accountsAPI = {
  getAll: (params) => api.get('/accounts', { params }),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.patch(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
  getContacts: (id) => api.get(`/accounts/${id}/contacts`),
  getOpportunities: (id) => api.get(`/accounts/${id}/opportunities`),
  getTimeline: (id) => api.get(`/accounts/${id}/timeline`),
}
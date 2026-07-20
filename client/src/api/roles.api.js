import api from './axios'

export const rolesAPI = {
  getAll: (params) => api.get('/roles', { params }),
  getStats: () => api.get('/roles/stats'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.patch(`/roles/${id}`, data),
  clone: (id) => api.post(`/roles/${id}/clone`),
  activate: (id) => api.patch(`/roles/${id}/activate`),
  deactivate: (id) => api.patch(`/roles/${id}/deactivate`),
  delete: (id) => api.delete(`/roles/${id}`),
  restore: (id) => api.patch(`/roles/${id}/restore`),
  permanentDelete: (id) => api.delete(`/roles/${id}/permanent`),
  bulkActivate: (ids) => api.post('/roles/bulk-activate', { ids }),
  bulkDeactivate: (ids) => api.post('/roles/bulk-deactivate', { ids }),
  bulkDelete: (ids) => api.post('/roles/bulk-delete', { ids }),
}
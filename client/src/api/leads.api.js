import api from './axios'

export const leadsAPI = {
  getAll: (params) => api.get('/leads', { params }),

  getById: (id) => api.get(`/leads/${id}`),

  create: (data) => api.post('/leads', data),

  update: (id, data) => api.patch(`/leads/${id}`, data),

  delete: (id) => api.delete(`/leads/${id}`),

  updateStage: (id, stage) => api.patch(`/leads/${id}/stage`, { stage }),

  addNote: (id, note) => api.post(`/leads/${id}/notes`, { note }),

  convert: (id, data) => api.post(`/leads/${id}/convert`, data),

  getTimeline: (id) => api.get(`/leads/${id}/timeline`),

  bulkUpdate: (ids, data) => api.patch('/leads/bulk', { ids, ...data }),

  export: (params) => api.get('/leads/export', { params, responseType: 'blob' }),
}
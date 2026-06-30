import api from './axios'

export const opportunitiesAPI = {
  getAll: (params) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.patch(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`),
  updateStage: (id, stage) => api.patch(`/opportunities/${id}/stage`, { stage }),
  getTimeline: (id) => api.get(`/opportunities/${id}/timeline`),
}
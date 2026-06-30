import api from './axios'

export const projectsAPI = {
  // Get all projects
  getAll: (params) => api.get('/projects', { params }),

  // Get one project
  getById: (id) => api.get(`/projects/${id}`),

  // Create project
  create: (data) => api.post('/projects', data),

  // Update project
  update: (id, data) => api.patch(`/projects/${id}`, data),

  // Delete project
  delete: (id) => api.delete(`/projects/${id}`),
}
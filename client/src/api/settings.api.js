import api from './axios'
export const settingsAPI = {

  // Company APIs
  getCompanies: () => api.get('/settings/companies'),

  addCompany: (data) =>
    api.post('/settings/companies', data),

  updateCompany: (id, data) =>
    api.patch(`/settings/companies/${id}`, data),

  deleteCompany: (id) =>
    api.delete(`/settings/companies/${id}`),

  // User APIs
  getUsers: (params) =>
    api.get('/settings/users', { params }),

  getUserById: (id) =>
    api.get(`/settings/users/${id}`),

  createUser: (data) =>
    api.post('/settings/users', data),

  updateUser: (id, data) =>
    api.patch(`/settings/users/${id}`, data),

  deleteUser: (id) =>
    api.delete(`/settings/users/${id}`),

  changeUserStatus: (id, data) =>
    api.patch(`/settings/users/${id}/status`, data),

  resetPassword: (id, data) =>
    api.patch(`/settings/users/${id}/password`, data),

  deactivateUser: (id) =>
    api.patch(`/settings/users/${id}/status`, {
        status: 'inactive'
    }),

    getUserById: (id) =>
  api.get(`/settings/users/${id}`),

}

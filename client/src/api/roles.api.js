import api from './axios'

export const rolesAPI = {
  getAll() {
    return api.get('/roles')
  },

  create(data) {
    return api.post('/roles', data)
  },

  update(id, data) {
    return api.patch(`/roles/${id}`, data)
  },

  delete(id) {
    return api.delete(`/roles/${id}`)
  },
}
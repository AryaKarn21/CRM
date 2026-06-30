import api from './axios'

export const supportAPI = {
  getTickets: (params) => api.get('/support', { params }),

  getTicketById: (id) => api.get(`/support/${id}`),

  createTicket: (data) => api.post('/support', data),

  updateTicket: (id, data) => api.patch(`/support/${id}`, data),

  addReply: (id, data) => api.post(`/support/${id}/replies`, data),

  deleteTicket: (id) => api.delete(`/support/${id}`),
}
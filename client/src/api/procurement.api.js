import api from './axios'

export const procurementAPI = {
  // Purchase Orders
  getPurchaseOrders: (params) =>
    api.get('/procurement/orders', { params }),

  getPurchaseOrder(id) {
    return api.get(`/procurement/orders/${id}`)
  },
 
  updatePurchaseOrder(id, data) {
    return api.patch(`/procurement/orders/${id}`, data)
  },
 
  getPOById: (id) =>
    api.get(`/procurement/orders/${id}`),

  createPO: (data) =>
    api.post('/procurement/orders', data),

  updatePO: (id, data) =>
    api.put(`/procurement/orders/${id}`, data),

  approvePO: (id) =>
    api.patch(`/procurement/orders/${id}/approve`),

  cancelPO: (id) =>
    api.patch(`/procurement/orders/${id}/cancel`),

  receivePO: (id, data) =>
    api.patch(`/procurement/orders/${id}/receive`, data),

  // Vendors
  getVendors: (params) =>
    api.get('/procurement/vendors', { params }),

  getVendorById: (id) =>
    api.get(`/procurement/vendors/${id}`),

  createVendor: (data) =>
    api.post('/procurement/vendors', data),

  updateVendor: (id, data) =>
    api.patch(`/procurement/vendors/${id}`, data),
}
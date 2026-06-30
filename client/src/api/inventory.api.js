import api from './axios'

export const inventoryAPI = {
  getItems: (params) => api.get('/inventory/items', { params }),
  getItemById: (id) => api.get(`/inventory/items/${id}`),
  createItem: (data) => api.post('/inventory/items', data),
  updateItem: (id, data) => api.patch(`/inventory/items/${id}`, data),
  deleteItem: (id) => api.delete(`/inventory/items/${id}`),
  getWarehouses: () => api.get('/inventory/warehouses'),
  createWarehouse: (data) => api.post('/inventory/warehouses', data),
  getAssets: (params) => api.get('/inventory/assets', { params }),
  createAsset: (data) => api.post('/inventory/assets', data),
  updateAsset: (id, data) => api.patch(`/inventory/assets/${id}`, data),
  getStockMovements: (itemId) => api.get(`/inventory/items/${itemId}/movements`),
}
import api from "./axios";

export const inventoryAPI = {
  getItems: (params) => api.get("/inventory/items", { params }),
  getItemById: (id) => api.get(`/inventory/items/${id}`),
  createItem: (data) => api.post("/inventory/items", data),
  updateItem: (id, data) => api.patch(`/inventory/items/${id}`, data),
  deleteItem: (id) => api.delete(`/inventory/items/${id}`),
  getWarehouses: () => api.get("/inventory/warehouses"),
  createWarehouse: (data) => api.post("/inventory/warehouses", data),
  getAssets: (params) => api.get("/inventory/assets", { params }),
  createAsset: (data) => api.post("/inventory/assets", data),
  updateAsset: (id, data) => api.patch(`/inventory/assets/${id}`, data),
  getStockMovements: (itemId) =>
    api.get(`/inventory/items/${itemId}/movements`),
  updateWarehouse: (id, data) => api.patch(`/inventory/warehouses/${id}`, data),
  deleteWarehouse: (id) => api.delete(`/inventory/warehouses/${id}`),
  getWarehouseById: (id) => api.get(`/inventory/warehouses/${id}`),

// ── Stock Transfers ───────────────────────────

getTransfers: (params) =>
  api.get("/inventory/transfers", { params }),

getTransferById: (id) =>
  api.get(`/inventory/transfers/${id}`),

createTransfer: (data) =>
  api.post("/inventory/transfers", data),

updateTransfer: (id, data) =>
  api.patch(`/inventory/transfers/${id}`, data),

deleteTransfer: (id) =>
  api.delete(`/inventory/transfers/${id}`),







};

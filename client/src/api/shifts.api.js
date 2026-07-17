import api from "./axios";

export const shiftsAPI = {
  getAll: () => api.get("/shifts"),
  create: (data) => api.post("/shifts", data),
  update: (id, data) => api.patch(`/shifts/${id}`, data),
  delete: (id) => api.delete(`/shifts/${id}`),
};
import api from "./axios";

export const usersAPI = {
  getAll: () => api.get("/users"),
};
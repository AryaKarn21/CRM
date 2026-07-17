import api from "./axios";

export const notificationsAPI = {
  // Get notifications
  getAll: (params = {}) =>
    api.get("/notifications", {
      params: {
        page: 1,
        limit: 20,
        ...params,
      },
    }),

  // Get unread notification count
  getUnreadCount: () =>
    api.get("/notifications/unread-count"),

  // Mark notification as read
  markAsRead: (id) =>
    api.patch(`/notifications/${id}/read`),

  // Mark all notifications as read
  markAllAsRead: () =>
    api.patch("/notifications/read-all"),

  // Delete notification
  delete: (id) =>
    api.delete(`/notifications/${id}`),
};
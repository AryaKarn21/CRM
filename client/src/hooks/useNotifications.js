import { useEffect, useState } from "react";
import { notificationsAPI } from "@/api/notifications.api";
import toast from "react-hot-toast";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const res = await notificationsAPI.getAll();

      console.log("Notifications API:", res.data);

      setNotifications(res.data.rows || []);

      // Use unreadCount if backend provides it,
      // otherwise fall back to count.
      setCount(
        res.data.unreadCount ??
        res.data.count ??
        0
      );
    } catch (error) {
  console.log("Full Error:", error);

  console.log("Response:", error.response);

  console.log("Data:", error.response?.data);

  console.log("Status:", error.response?.status);

  toast.error(error.response?.data?.message || "Something went wrong");

    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await notificationsAPI.getUnreadCount();
      setCount(res.data.count || 0);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const refresh = async () => {
    await Promise.all([
      loadNotifications(),
      loadUnreadCount(),
    ]);
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();

      toast.success("All notifications marked as read");

      await refresh();
    } catch (error) {
      toast.error("Failed to mark notifications as read");
      console.error(error);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);

      await refresh();
    } catch (error) {
      toast.error("Unable to update notification");
      console.error(error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);

      toast.success("Notification deleted");

      await refresh();
    } catch (error) {
      toast.error("Failed to delete notification");
      console.error(error);
    }
  };

  return {
    notifications,
    count,
    loading,
    refresh,
    refreshCount: loadUnreadCount,
    markAllRead,
    markNotificationRead,
    deleteNotification,
  };
}
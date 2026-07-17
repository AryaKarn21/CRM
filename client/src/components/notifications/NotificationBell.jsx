import { useState } from "react";
import { Bell } from "lucide-react";

import NotificationBadge from "./NotificationBadge";
import NotificationDropdown from "./NotificationDropdown";

import useNotifications from "@/hooks/useNotifications";
import { notificationsAPI } from "@/api/notifications.api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const {
    notifications,
    count,
    loading,
    refresh,
    refreshCount,
  } = useNotifications();

  const handleRead = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationsAPI.markAsRead(notification.id);
      }

      await refresh();
      await refreshCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();

      await refresh();
      await refreshCount();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      {/* Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative btn btn-ghost btn-icon"
      >
        <Bell size={20} />

        <NotificationBadge count={count} />
      </button>

      {/* Dropdown */}
      {open && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onRead={handleRead}
          onMarkAllRead={handleMarkAllRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
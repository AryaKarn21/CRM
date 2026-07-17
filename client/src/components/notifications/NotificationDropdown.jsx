import { Link } from "react-router-dom";
import NotificationItem from "./NotificationItem";

export default function NotificationDropdown({
  notifications = [],
  loading = false,
  onRead,
  onMarkAllRead,
  onClose,
}) {
  return (
    <div
      className="absolute right-0 mt-3 w-[400px] rounded-xl shadow-2xl border z-50 overflow-hidden"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <h3
          className="font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Notifications
        </h3>

        <button
          onClick={onMarkAllRead}
          className="text-xs hover:underline"
          style={{ color: "var(--primary)" }}
        >
          Mark all as read
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[450px] overflow-y-auto">
        {loading ? (
          <div
            className="p-6 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="p-8 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            No notifications yet.
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={onRead}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="border-t p-3 text-center"
        style={{ borderColor: "var(--border)" }}
      >
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--primary)" }}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}


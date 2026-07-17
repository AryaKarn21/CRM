import {
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  Package,
  Shield,
  Settings,
  Bell,
  Trash2,
  FolderKanban,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function formatTime(date) {
  const now = new Date();
  const created = new Date(date);

  const diff = Math.floor((now - created) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;

  return created.toLocaleDateString();
}

function getModuleIcon(module) {
  switch (module) {
    case "calendar":
      return <Calendar size={18} />;

    case "crm":
      return <Briefcase size={18} />;

    case "hr":
      return <Users size={18} />;

    case "finance":
      return <DollarSign size={18} />;

    case "inventory":
      return <Package size={18} />;

    case "procurement":
      return <ShoppingCart size={18} />;

    case "projects":
      return <FolderKanban size={18} />;

    case "settings":
      return <Settings size={18} />;

    case "security":
      return <Shield size={18} />;

    default:
      return <Bell size={18} />;
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case "urgent":
      return "#dc2626";

    case "high":
      return "#ef4444";

    case "medium":
      return "#f59e0b";

    default:
      return "#2563eb";
  }
}

export default function NotificationItem({
  notification,
  onRead,
  onDelete,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.isRead && onRead) {
      onRead(notification.id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex gap-3 p-4 cursor-pointer transition-all border rounded-xl hover:bg-[var(--surface-2)]"
      style={{
        background: notification.isRead
          ? "var(--surface)"
          : "var(--surface-2)",
        borderLeft: `4px solid ${getPriorityColor(
          notification.priority
        )}`,
        borderColor: "var(--border)",
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "var(--surface-3)",
          color: "var(--primary)",
        }}
      >
        {getModuleIcon(notification.module)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4
            className="font-semibold text-sm truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {notification.title}
          </h4>

          {!notification.isRead && (
            <span
              className="w-2 h-2 rounded-full mt-2"
              style={{ background: "var(--primary)" }}
            />
          )}
        </div>

        <p
          className="text-sm mt-1 line-clamp-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {notification.message}
        </p>

        <div className="flex justify-between items-center mt-3">
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {formatTime(notification.createdAt)}
          </span>

          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-medium px-2 py-1 rounded-full capitalize"
              style={{
                background: getPriorityColor(
                  notification.priority
                ),
                color: "#fff",
              }}
            >
              {notification.priority}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();

                if (onDelete) {
                  onDelete(notification.id);
                }
              }}
              className="p-2 rounded-lg hover:bg-red-100 transition"
              title="Delete Notification"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
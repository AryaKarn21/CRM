import { useState } from "react";
import { Search, Bell } from "lucide-react";
import useNotifications from "@/hooks/useNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";

export default function NotificationCenter() {
  const {
    notifications,
    count,
    loading,
    markAllRead,
    markNotificationRead,
    deleteNotification,
  } = useNotifications();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Meetings", value: "calendar" },
    { label: "CRM", value: "crm" },
    { label: "HR", value: "hr" },
    { label: "Finance", value: "finance" },
    { label: "Inventory", value: "inventory" },
    { label: "Procurement", value: "procurement" },
    { label: "Projects", value: "projects" },
    { label: "Support", value: "support" },
    { label: "Settings", value: "settings" },
  ];

  const filteredNotifications = notifications.filter((notification) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      notification.title?.toLowerCase().includes(keyword) ||
      notification.message?.toLowerCase().includes(keyword);

    const matchesFilter =
      activeFilter === "all"
        ? true
        : activeFilter === "unread"
        ? !notification.isRead
        : notification.module === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <button
          onClick={markAllRead}
          className="px-4 py-2 rounded-lg font-medium"
          style={{
            background: "var(--primary)",
            color: "#fff",
          }}
        >
          Mark All Read
        </button>

        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Notifications
          </h1>

          <p
            className="mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Stay updated with everything happening across your CRM.
          </p>
        </div>

        <div
          className="rounded-xl border px-5 py-3 text-center min-w-[110px]"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <p
            className="text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Total
          </p>

          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--primary)" }}
          >
            {notifications.length}
          </h2>

          <p
            className="text-xs mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            Unread: {count}
          </p>
        </div>

      </div>

      {/* Search */}
      <div
        className="rounded-xl border p-4 mb-6"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />

          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg outline-none"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />

        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className="px-4 py-2 rounded-lg border transition"
            style={{
              background:
                activeFilter === filter.value
                  ? "var(--primary)"
                  : "var(--surface)",

              color:
                activeFilter === filter.value
                  ? "#fff"
                  : "var(--text-primary)",

              borderColor: "var(--border)",
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="rounded-xl border p-10 text-center"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <p style={{ color: "var(--text-secondary)" }}>
            Loading notifications...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredNotifications.length === 0 && (
        <div
          className="rounded-xl border p-12 text-center"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <Bell
            size={48}
            className="mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />

          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            No Notifications Found
          </h2>

          <p
            className="mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            You're all caught up.
          </p>
        </div>
      )}

      {/* Notification List */}
      {!loading && filteredNotifications.length > 0 && (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markNotificationRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
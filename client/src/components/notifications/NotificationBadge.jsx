export default function NotificationBadge({ count }) {
  if (!count || count <= 0) return null;

  return (
    <span
      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
      style={{
        background: "#ef4444",
        color: "#ffffff",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
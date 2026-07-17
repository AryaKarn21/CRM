import { Users, Search, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usersAPI } from "@/api/users.api";

export default function AttendeesSection({ selectedIds, onChange }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    usersAPI
      .getAll()
      .then((res) => setUsers(res.data.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()));
  const selected = users.filter((u) => selectedIds.includes(u.id));

  const toggle = (id) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  return (
    <div className="space-y-3" ref={ref}>
      <div>
        <h3 className="text-[15px] font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Users size={18} />
          Invite Attendees
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Select people to invite.
        </p>
      </div>

      {/* Trigger + panel now share ONE relative wrapper, fixing the overlap bug */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="input flex items-center justify-between text-left w-full"
        >
          <span style={{ color: selected.length ? "var(--text-primary)" : "var(--text-muted)" }}>
            {selected.length ? `${selected.length} selected` : "Select people..."}
          </span>
          <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
        </button>

        {open && (
          <div
            className="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl border shadow-lg"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-8 py-2 text-sm"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto">
              {loading && <p className="text-sm p-4" style={{ color: "var(--text-muted)" }}>Loading...</p>}
              {!loading && filtered.length === 0 && (
                <p className="text-sm p-4" style={{ color: "var(--text-muted)" }}>No users found.</p>
              )}
              {filtered.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center justify-between px-4 py-2.5 cursor-pointer"
                  style={{ background: selectedIds.includes(u.id) ? "var(--primary-light)" : "transparent" }}
                  onMouseDown={(ev) => ev.preventDefault()}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center font-semibold text-xs"
                      style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                    >
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggle(u.id)} className="h-4 w-4 accent-[var(--primary)]" />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((u) => (
            <span key={u.id} className="badge badge-info flex items-center gap-1">
              {u.name}
              <button type="button" onClick={() => toggle(u.id)}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
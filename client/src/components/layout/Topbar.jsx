import { Search, Sun, Moon, Plus, Command, Menu } from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Topbar() {
  const { theme, toggleTheme, openCommandPalette, sidebarCollapsed } = useUIStore();
  const { logout, user, companies, activeCompany, setActiveCompany } = useAuthStore();

  const queryClient = useQueryClient();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setActiveCompany(companyId);
    queryClient.invalidateQueries();
    toast.success("Company switched successfully");
  };

  return (
    <header
      className="fixed top-0 right-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-6 z-20 border-b transition-all duration-300"
      style={{
        height: "var(--topbar-height)",
        background: "var(--surface)",
        borderColor: "var(--border)",
        // On mobile the sidebar is an off-canvas drawer, not a permanent
        // column — the topbar spans the full width like the content does.
        // A left padding reserves room for the floating hamburger button
        // that Sidebar.jsx renders at top-left so they don't overlap.
        left: isMobile ? 0 : sidebarCollapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        paddingLeft: isMobile ? "3.25rem" : undefined,
      }}
    >
      {/* Global Search — full flexible width on desktop, shrinks on mobile
          so it doesn't crowd out the icons on the right */}
      <button
        onClick={openCommandPalette}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-lg border text-[13px] flex-1 max-w-sm text-left transition-colors min-w-0"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <Search size={14} className="shrink-0" />
        <span className="hidden sm:inline truncate">Search everything...</span>
        <span className="sm:hidden">Search</span>
        <kbd
          className="ml-auto hidden md:flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded shrink-0"
          style={{ background: "var(--border)", color: "var(--text-muted)" }}
        >
          <Command size={10} /> K
        </kbd>
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
        {/* Company switcher — hidden on phones (already in the sidebar's
            CompanySwitcher); shown from sm up where there's room */}
        {companies.length > 0 && (
          <select
            value={activeCompany || ""}
            onChange={handleCompanyChange}
            className="hidden sm:block px-3 py-2 rounded-lg border text-sm max-w-[140px] md:max-w-none"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        )}

        {/* Quick Create — icon-only on phones, label from sm up */}
        <button className="btn btn-primary btn-sm px-2.5 sm:px-3">
          <Plus size={14} />
          <span className="hidden sm:inline">New</span>
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="btn btn-ghost btn-icon" title="Toggle theme">
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
            style={{ background: "var(--primary)" }}
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </button>
          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-lg py-1 z-50 animate-fade-in"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  {user?.name}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings/profile");
                }}
                className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[var(--surface-2)] transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
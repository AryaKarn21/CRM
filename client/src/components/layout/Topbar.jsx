import { Search, Sun, Moon, Plus, Command } from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
//import { useAuthStore } from '@/store/auth.store'
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import NotificationBell from "@/components/notifications/NotificationBell";
export default function Topbar() {
  const { theme, toggleTheme, openCommandPalette, sidebarCollapsed } =
    useUIStore();
  const { logout, user, companies, activeCompany, setActiveCompany } =
    useAuthStore();

  const queryClient = useQueryClient();
  //const { logout, user } = useAuthStore()
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };
  const handleCompanyChange = (e) => {
    const companyId = e.target.value;

    setActiveCompany(companyId);

    // Reload all React Query data
    queryClient.invalidateQueries();

    toast.success("Company switched successfully");
  };

  //console.log("Companies:", companies)
  //console.log("Active Company:", activeCompany)
  return (
    <header
      className="fixed top-0 right-0 flex items-center gap-3 px-6 z-20 border-b transition-all duration-300"
      style={{
        height: "var(--topbar-height)",
        background: "var(--surface)",
        borderColor: "var(--border)",
        left: sidebarCollapsed
          ? "var(--sidebar-collapsed-width)"
          : "var(--sidebar-width)",
      }}
    >
      {/* Global Search */}
      <button
        onClick={openCommandPalette}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] flex-1 max-w-sm text-left transition-colors"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <Search size={14} />
        <span>Search everything...</span>
        <kbd
          className="ml-auto flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: "var(--border)", color: "var(--text-muted)" }}
        >
          <Command size={10} /> K
        </kbd>
      </button>

      <div className="flex items-center gap-2 ml-auto">
        {companies.length > 0 && (
          <select
            value={activeCompany || ""}
            onChange={handleCompanyChange}
            className="px-3 py-2 rounded-lg border text-sm"
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
        {/* Quick Create */}
        <button className="btn btn-primary btn-sm">
          <Plus size={14} /> New
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-icon"
          title="Toggle theme"
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Notifications */}
      
        <NotificationBell />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ background: "var(--primary)" }}
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </button>
          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-lg py-1 z-50 animate-fade-in"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user?.name}
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {user?.email}
                </p>
              </div>
              <button
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

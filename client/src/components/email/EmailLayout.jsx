import { Outlet } from "react-router-dom";
import EmailSidebar from "./EmailSidebar";
import EmailToolbar from "./EmailToolbar";

export default function EmailLayout() {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <EmailSidebar />

      {/* Main Section */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Toolbar */}
        <EmailToolbar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
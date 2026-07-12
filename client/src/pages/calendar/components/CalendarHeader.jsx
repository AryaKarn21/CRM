import { CalendarDays, Plus } from "lucide-react";

export default function CalendarHeader({ onCreateMeeting }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: "var(--primary-light)" }}>
          <CalendarDays className="h-6 w-6" style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Calendar & Meetings
          </h1>
          <p className="mt-1" style={{ color: "var(--text-muted)" }}>
            Manage company meetings, schedules and appointments.
          </p>
        </div>
      </div>

      <button onClick={onCreateMeeting} className="btn btn-primary btn-lg">
        <Plus size={18} />
        New Meeting
      </button>
    </div>
  );
}
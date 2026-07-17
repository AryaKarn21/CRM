import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarToolbar({ search, setSearch, calendarRef, activeView, setActiveView }) {
  const calendarApi = calendarRef?.current?.getApi();

  const changeView = (view) => {
    calendarApi?.changeView(view);
    setActiveView?.(view);
  };

  const viewBtn = (view, label) => (
    <button
      onClick={() => changeView(view)}
      className="btn btn-sm"
      style={
        activeView === view
          ? { background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" }
          : { background: "var(--surface)", color: "var(--text-secondary)", borderColor: "var(--border)" }
      }
    >
      {label}
    </button>
  );

  return (
    <div className="card p-5 mb-6">
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--text-muted)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search meetings..."
          className="input pl-11"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => calendarApi?.prev()} className="btn btn-secondary btn-icon">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => calendarApi?.today()} className="btn btn-primary">Today</button>
          <button onClick={() => calendarApi?.next()} className="btn btn-secondary btn-icon">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex gap-2">
          {viewBtn("dayGridMonth", "Month")}
          {viewBtn("timeGridWeek", "Week")}
          {viewBtn("timeGridDay", "Day")}
          {viewBtn("listWeek", "List")}
        </div>
      </div>
    </div>
  );
}
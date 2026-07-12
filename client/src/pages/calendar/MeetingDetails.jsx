import { meetingAttendeesAPI } from "@/api/meetingAttendees.api";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Flag,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
export default function MeetingDetails({
  meeting,
  open,
  onClose,
  onEdit,
  onDelete,
}) {
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  useEffect(() => {
    if (open && meeting?.id) {
      setLoadingAttendees(true);
      meetingAttendeesAPI
        .getAttendees(meeting.id)
        .then((res) => setAttendees(res.data.data || []))
        .catch(() => setAttendees([]))
        .finally(() => setLoadingAttendees(false));
    }
  }, [open, meeting?.id]);

  if (!open || !meeting) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)" }}
      />

      <div
        className="fixed right-0 top-0 h-screen w-full sm:w-[420px] z-50 shadow-2xl overflow-y-auto border-l"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Meeting Details
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {meeting.title}
            </h3>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {meeting.extendedProps.description || "No description"}
            </p>
          </div>

          <div className="space-y-4">
            <InfoRow
              icon={<Calendar size={18} />}
              label="Date"
              value={new Date(meeting.start).toDateString()}
            />
            <InfoRow
              icon={<Clock size={18} />}
              label="Time"
              value={`${new Date(meeting.start).toLocaleTimeString()} - ${new Date(meeting.end).toLocaleTimeString()}`}
            />
            <InfoRow
              icon={<Video size={18} />}
              label="Meeting Type"
              value={meeting.extendedProps.meetingType}
            />
            <InfoRow
              icon={<MapPin size={18} />}
              label="Location"
              value={meeting.extendedProps.location || "-"}
            />
            <InfoRow
              icon={<Flag size={18} />}
              label="Priority"
              value={meeting.extendedProps.priority}
            />
            <InfoRow
              icon={<CheckCircle2 size={18} />}
              label="Status"
              value={meeting.extendedProps.status}
            />
          </div>
          <div>
            <h4
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Attendees {attendees.length > 0 && `(${attendees.length})`}
            </h4>

            {loadingAttendees && (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Loading...
              </p>
            )}
            {!loadingAttendees && attendees.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No attendees invited.
              </p>
            )}

            <div className="space-y-2">
              {attendees.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {a.user?.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {a.user?.email}
                    </p>
                  </div>
                  <span
                    className={`badge ${
                      a.status === "accepted"
                        ? "badge-success"
                        : a.status === "declined"
                          ? "badge-danger"
                          : "badge-gray"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="btn btn-primary flex-1 justify-center"
            >
              <Pencil size={16} /> Edit
            </button>
            <button
              onClick={onDelete}
              className="btn btn-danger flex-1 justify-center"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div style={{ color: "var(--primary)" }}>{icon}</div>
      <div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
} from "lucide-react";

export default function UpcomingMeetings({ meetings = [] }) {
  return (
    
      <div className="card p-5 h-full">
      <div className="flex items-center gap-2 mb-5">
        <CalendarDays className="text-blue-500" size={20} />

        <h3 className="text-lg font-semibold text-white">
          Upcoming Meetings
        </h3>
      </div>

      {meetings.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No upcoming meetings
        </div>
      )}

      <div className="space-y-4">

        {meetings.map((meeting) => (

          <div
            key={meeting.id}
            className="rounded-xl border border-slate-700 bg-slate-800 p-4 hover:border-blue-500 transition"
          >

            <div className="flex justify-between">

              <h4 className="font-semibold text-white">
                {meeting.title}
              </h4>

              <span
                className={`px-2 py-1 rounded-full text-xs

                ${
                  meeting.priority === "high"
                    ? "bg-red-500/20 text-red-400"
                    : meeting.priority === "medium"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-green-500/20 text-green-400"
                }
                `}
              >
                {meeting.priority}
              </span>

            </div>

            <div className="mt-3 space-y-2 text-sm text-slate-300">

              <div className="flex items-center gap-2">
                <Clock size={15} />
                {new Date(meeting.start).toLocaleString()}
              </div>

              {meeting.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={15} />
                  {meeting.location}
                </div>
              )}

              {meeting.extendedProps?.meetingType === "online" && (
                <div className="flex items-center gap-2">
                  <Video size={15} />
                  Online Meeting
                </div>
              )}

            </div>

          </div>

        ))}

      </div>
    </div>
  );
}
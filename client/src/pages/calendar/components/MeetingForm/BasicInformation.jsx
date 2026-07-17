import { Video, MapPin } from "lucide-react";

export default function BasicInformation({ register, errors, watch }) {
  const meetingType = watch("meetingType");

  return (
    <div className="space-y-6">
      {/* Meeting Title */}
      <div>
        <label
          className="block text-sm font-semibold mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Meeting Title
        </label>

        <input
          type="text"
          placeholder="Weekly Sales Review"
          {...register("title", {
            required: "Meeting title is required",
          })}
          className="input"
        />

        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          className="block text-sm font-semibold mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Description
        </label>

        <textarea
          rows={5}
          placeholder="Write meeting agenda..."
          {...register("description")}
          className="input resize-none"
        />
      </div>

      {/* Meeting Type */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Meeting Type
        </label>

        <select
          {...register("meetingType")}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="online">Google Meet</option>
          <option value="zoom">Zoom</option>
          <option value="teams">Microsoft Teams</option>
          <option value="offline">Offline</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      {(meetingType === "online" ||
        meetingType === "zoom" ||
        meetingType === "teams" ||
        meetingType === "hybrid") && (
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Video size={16} />
            Meeting Link
          </label>

          <input
            type="url"
            placeholder="https://meet.google.com/..."
            {...register("meetingLink")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3
            focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {(meetingType === "offline" || meetingType === "hybrid") && (
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <MapPin size={16} />
            Location
          </label>

          <input
            type="text"
            placeholder="Conference Room A"
            {...register("location")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3
            focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}

import { CalendarDays, Clock, Flag } from "lucide-react";

export default function ScheduleSection({
  register,
  errors,
}) {
  return (
    <div className="space-y-6">

      {/* Section Title */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Schedule
        </h3>

        <p className="text-sm text-slate-500">
          Select meeting date, time and priority.
        </p>
      </div>

      {/* Start & End Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <CalendarDays size={16} />
            Start Time
          </label>

          <input
            type="datetime-local"
            {...register("startTime", {
              required: "Start time is required",
            })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3
            focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          {errors.startTime && (
            <p className="text-red-500 text-sm mt-1">
              {errors.startTime.message}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Clock size={16} />
            End Time
          </label>

          <input
            type="datetime-local"
            {...register("endTime", {
              required: "End time is required",
            })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3
            focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          {errors.endTime && (
            <p className="text-red-500 text-sm mt-1">
              {errors.endTime.message}
            </p>
          )}
        </div>

      </div>

      {/* Priority */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <Flag size={16} />
          Priority
        </label>

        <select
          {...register("priority")}
          className="w-full rounded-xl border border-slate-300 px-4 py-3
          focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </div>

    </div>
  );
}
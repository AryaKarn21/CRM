import { Bell } from "lucide-react";

const reminders = [
  { label: "No Reminder", value: 0 },
  { label: "5 Minutes Before", value: 5 },
  { label: "10 Minutes Before", value: 10 },
  { label: "15 Minutes Before", value: 15 },
  { label: "30 Minutes Before", value: 30 },
  { label: "1 Hour Before", value: 60 },
  { label: "1 Day Before", value: 1440 },
];

export default function ReminderSection({
  register,
  watch,
  setValue,
}) {
  const selectedReminder = watch("reminderMinutes");

  return (
    <div className="space-y-5">

      {/* Heading */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Bell size={20} />
          Reminder
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          Choose when attendees should receive a reminder.
        </p>
      </div>

      {/* Hidden Input */}
      <input
        type="hidden"
        {...register("reminderMinutes")}
      />

      {/* Reminder Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        {reminders.map((item) => (
          <button
            type="button"
            key={item.value}
            onClick={() => setValue("reminderMinutes", item.value)}
            className={`rounded-xl border p-4 transition-all text-left

            ${
              Number(selectedReminder) === item.value
                ? "border-blue-600 bg-blue-50 shadow"
                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
            }`}
          >
            <div className="font-medium text-slate-900">
              {item.label}
            </div>

            <div className="text-xs text-slate-500 mt-1">
              Notify participants
            </div>

          </button>
        ))}

      </div>

    </div>
  );
}
import { useMemo } from "react";
import {
  Users,
  UserX,
  Clock,
  Timer,
  CalendarOff,
  TrendingUp,
  Percent,
  Hourglass,
} from "lucide-react";
import { SkeletonKpiCard } from "@/components/ui/Skeleton";
import { computeOvertimeMinutes } from "@/lib/attendanceUtils";

const COLOR_MAP = {
  primary: { bg: "var(--primary-light)", icon: "var(--primary)" },
  success: { bg: "var(--success-bg)", icon: "var(--success)" },
  warning: { bg: "var(--warning-bg)", icon: "var(--warning)" },
  danger: { bg: "var(--danger-bg)", icon: "var(--danger)" },
  info: { bg: "var(--info-bg)", icon: "var(--info)" },
  gray: { bg: "var(--surface-2)", icon: "var(--text-muted)" },
};

export default function AttendanceStatCards({ records = [], loading = false }) {
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const halfDay = records.filter((r) => r.status === "half_day").length;
    const leave = records.filter((r) => r.status === "holiday").length;
    const overtime = records.filter((r) => computeOvertimeMinutes(r) > 0).length;
    const attendancePct = total
      ? Math.round(((present + late + halfDay) / total) * 100)
      : 0;
    const withHours = records.filter((r) => r.hoursWorked != null);
    const avgHours = withHours.length
      ? withHours.reduce((sum, r) => sum + Number(r.hoursWorked || 0), 0) /
        withHours.length
      : 0;
    return { total, present, absent, late, halfDay, leave, overtime, attendancePct, avgHours };
  }, [records]);

  const cards = [
    { label: "Present", value: stats.present, icon: Users, color: "success" },
    { label: "Absent", value: stats.absent, icon: UserX, color: "danger" },
    { label: "Late", value: stats.late, icon: Clock, color: "warning" },
    { label: "Half Day", value: stats.halfDay, icon: Timer, color: "info" },
    { label: "Leave / Holiday", value: stats.leave, icon: CalendarOff, color: "gray" },
    { label: "Overtime", value: stats.overtime, icon: TrendingUp, color: "primary" },
    { label: "Attendance %", value: `${stats.attendancePct}%`, icon: Percent, color: "success" },
    { label: "Avg. Hours", value: `${stats.avgHours.toFixed(1)}h`, icon: Hourglass, color: "info" },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4 px-4 sm:px-6 pt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4 px-4 sm:px-6 pt-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const colors = COLOR_MAP[c.color] || COLOR_MAP.gray;
        return (
          <div
            key={c.label}
            className="card p-3 sm:p-4 flex flex-col justify-between min-w-0"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p
                className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {c.label}
              </p>
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: colors.bg }}
              >
                <Icon size={14} style={{ color: colors.icon }} />
              </div>
            </div>
            <p
              className="text-[18px] sm:text-[20px] font-bold leading-none truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {c.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
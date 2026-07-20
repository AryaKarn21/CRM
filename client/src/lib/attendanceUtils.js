// Pure helpers for deriving enterprise attendance metrics (late minutes,
// early exits, overtime) from raw checkIn/checkOut timestamps + shift
// windows. No backend changes required — everything here is computed
// client-side from data the API already returns.

const DEFAULT_SHIFT_MINUTES = 8 * 60;

function parseTimeToMinutes(t) {
  if (!t) return null;
  const [h, m] = String(t).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function dateToMinutesOfDay(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.getHours() * 60 + d.getMinutes();
}

export function shiftDurationMinutes(shift) {
  const start = parseTimeToMinutes(shift?.startTime);
  const end = parseTimeToMinutes(shift?.endTime);
  if (start == null || end == null) return DEFAULT_SHIFT_MINUTES;
  let duration = end - start;
  if (duration <= 0) duration += 24 * 60; // overnight shift
  return duration;
}

// Minutes the employee checked in after their shift's start time.
export function computeLateMinutes(record) {
  const shiftStart = parseTimeToMinutes(record?.shift?.startTime);
  const checkInMinutes = dateToMinutesOfDay(record?.checkIn);
  if (shiftStart == null || checkInMinutes == null) return null;
  return Math.max(0, checkInMinutes - shiftStart);
}

// Minutes the employee checked out before their shift's end time.
export function computeEarlyExitMinutes(record) {
  if (!record?.checkOut) return null;
  const shiftEnd = parseTimeToMinutes(record?.shift?.endTime);
  const checkOutMinutes = dateToMinutesOfDay(record?.checkOut);
  if (shiftEnd == null || checkOutMinutes == null) return null;
  return Math.max(0, shiftEnd - checkOutMinutes);
}

// Minutes worked beyond the shift's (or default 8h) duration.
export function computeOvertimeMinutes(record) {
  if (record?.hoursWorked == null) return 0;
  const workedMinutes = Math.round(Number(record.hoursWorked) * 60);
  const expected = record?.shift
    ? shiftDurationMinutes(record.shift)
    : DEFAULT_SHIFT_MINUTES;
  return Math.max(0, workedMinutes - expected);
}

export function formatMinutes(mins) {
  if (mins == null) return "—";
  if (mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "half_day", label: "Half Day" },
  { value: "holiday", label: "Holiday" },
];

export const APPROVAL_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export const APPROVAL_VARIANT = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};
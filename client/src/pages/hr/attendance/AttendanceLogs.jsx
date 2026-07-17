import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, LogOut, Pencil } from "lucide-react";
import { attendanceAPI } from "@/api/attendance.api";
import { employeesAPI } from "@/api/employees.api";
import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import FormModal from "@/components/shared/FormModal";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

export default function AttendanceLogs() {
  const today = format(new Date(), "yyyy-MM-dd");
  const queryClient = useQueryClient();
  const [params, setParams] = useState({
    page: 1,
    limit: 25,
    search: "",
    date: today,
    status: "",
  });
  const [checkInModal, setCheckInModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["attendance", params],
    queryFn: () => attendanceAPI.getAll(params).then((r) => r.data),
  });

  const { data: empData } = useQuery({
    queryKey: ["employees-all"],
    queryFn: () => employeesAPI.getAll({ limit: 200 }).then((r) => r.data),
  });
  const employees = empData?.employees || [];
  const { data: shiftData } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => attendanceAPI.getShifts().then((r) => r.data),
  });

  const shifts = shiftData || [];

  const {
    register: regCI,
    handleSubmit: hCI,
    reset: resetCI,
    formState: { errors: errCI },
  } = useForm({
    defaultValues: {
      employee: "",
      date: today,
      checkIn: "",
      checkOut: "",
      status: "present",
      notes: "",
    },
  });

  const {
    register: regEdit,
    handleSubmit: hEdit,
    reset: resetEdit,
  } = useForm();

  const checkInMutation = useMutation({
    mutationFn: (d) => attendanceAPI.checkIn(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setCheckInModal(false);
      resetCI();
      toast.success("Attendance logged");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to log attendance"),
  });

  const checkOutMutation = useMutation({
    mutationFn: (id) => attendanceAPI.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Checked out");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to check out"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => attendanceAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setEditModal(false);
      toast.success("Record updated");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update"),
  });

  const openEdit = (row) => {
    setEditRecord(row);
    resetEdit({
      status: row.status || "present",
      checkIn: row.checkIn
        ? format(new Date(row.checkIn), "yyyy-MM-dd'T'HH:mm")
        : "",
      checkOut: row.checkOut
        ? format(new Date(row.checkOut), "yyyy-MM-dd'T'HH:mm")
        : "",
      notes: row.notes || "",
    });
    setEditModal(true);
  };

  const statusMap = {
    present: "success",
    absent: "danger",
    late: "warning",
    half_day: "info",
  };

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (val) =>
        val ? (
          <div className="flex items-center gap-2">
            <Avatar name={`${val.firstName} ${val.lastName}`} size="sm" />
            <div>
              <p
                className="text-[13px] font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {val.firstName} {val.lastName}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {val.department}
              </p>
            </div>
          </div>
        ) : (
          "—"
        ),
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: "checkIn",
      label: "Check In",
      render: (val) => (val ? format(new Date(val), "hh:mm a") : "—"),
    },
    {
      key: "checkOut",
      label: "Check Out",
      render: (val) =>
        val ? (
          format(new Date(val), "hh:mm a")
        ) : (
          <span style={{ color: "var(--text-muted)" }}>Pending</span>
        ),
    },
    {
      key: "hoursWorked",
      label: "Hours",
      render: (val) =>
        val ? <span className="font-medium">{val.toFixed(1)}h</span> : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (val = "present") => (
        <Badge variant={statusMap[val] || "gray"}>
          {val?.replace("_", " ")}
        </Badge>
      ),
    },
    { key: "shift", label: "Shift", render: (val) => val?.name || "Default" },
    {
      key: "id",
      label: "",
      render: (id, row) => (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {!row.checkOut && (
            <button
              className="btn btn-ghost btn-sm flex items-center gap-1"
              onClick={() => {
                if (confirm("Mark check-out now?")) checkOutMutation.mutate(id);
              }}
              title="Check Out"
            >
              <LogOut size={13} /> Out
            </button>
          )}
          <button
            className="btn btn-ghost btn-sm flex items-center gap-1"
            onClick={() => openEdit(row)}
            title="Edit"
          >
            <Pencil size={13} /> Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1
            className="text-[18px] font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Attendance Logs
          </h1>
          <p
            className="text-[12px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {data?.total ?? 0} records
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setCheckInModal(true)}
        >
          <Plus size={14} /> Log Attendance
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Search employee..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: ["present", "absent", "late", "half_day"].map((v) => ({
              label: v.replace("_", " "),
              value: v,
            })),
          },
        ]}
        values={params}
        onChange={(k, v) => setParams((p) => ({ ...p, [k]: v, page: 1 }))}
      />

      <div className="mx-6 mb-6 card overflow-hidden">
        <div
          className="px-4 py-3 border-b flex items-center gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          <label className="form-label mb-0">Date</label>
          <input
            type="date"
            className="input w-auto"
            value={params.date}
            onChange={(e) =>
              setParams((p) => ({ ...p, date: e.target.value, page: 1 }))
            }
          />
        </div>
        <DataTable
          columns={columns}
          data={data?.attendance || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          onPageChange={(page) => setParams((p) => ({ ...p, page }))}
          emptyTitle="No attendance records"
          emptyDescription="No records found for the selected date and filters"
        />
      </div>

      {/* Log Attendance Modal */}
      <FormModal
        open={checkInModal}
        onClose={() => {
          setCheckInModal(false);
          resetCI();
        }}
        title="Log Attendance"
        onSubmit={hCI((d) => {
          const payload = {
            employeeId: d.employee,
            date: d.date,
            status: d.status,
            notes: d.notes,
            ...(d.checkIn
              ? { checkIn: new Date(`${d.date}T${d.checkIn}`) }
              : {}),
            ...(d.checkOut
              ? { checkOut: new Date(`${d.date}T${d.checkOut}`) }
              : {}),
          };
          checkInMutation.mutate(payload);
        })}
        loading={checkInMutation.isPending}
        submitLabel="Log Attendance"
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select
              className="input"
              {...regCI("employee", { required: true })}
            >
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} — {e.department}
                </option>
              ))}
            </select>
            {errCI.employee && (
              <p className="text-[11px] text-red-500">Employee is required</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="input"
                {...regCI("date", { required: true })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select className="input" {...regCI("status")}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Check In Time</label>
              <input type="time" className="input" {...regCI("checkIn")} />
            </div>
            <div className="form-group">
              <label className="form-label">Check Out Time</label>
              <input type="time" className="input" {...regCI("checkOut")} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Any additional notes..."
              {...regCI("notes")}
            />
          </div>
        </div>
      </FormModal>

      {/* Edit Record Modal */}
      <FormModal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Attendance Record"
        onSubmit={hEdit((d) =>
          updateMutation.mutate({ id: editRecord._id, data: d }),
        )}
        loading={updateMutation.isPending}
        submitLabel="Save Changes"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="input" {...regEdit("status")}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
              </select>
            </div>
            <div className="form-group col-span-1" />
            <div className="form-group">
              <label className="form-label">Check In</label>
              <input
                type="datetime-local"
                className="input"
                {...regEdit("checkIn")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Check Out</label>
              <input
                type="datetime-local"
                className="input"
                {...regEdit("checkOut")}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="input" rows={2} {...regEdit("notes")} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Shift</label>

          <select className="input" {...regCI("shiftId")}>
            <option value="">Select Shift</option>

            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name}
              </option>
            ))}
          </select>
        </div>
      </FormModal>
    </div>
  );
}

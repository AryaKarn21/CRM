import { useState ,useRef} from "react";

import ExpenseFilters from "@/components/finance/ExpenseFilters";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { financeAPI } from "@/api/finance.api";
import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import Badge from "@/components/ui/Badge";
import FormModal from "@/components/shared/FormModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema } from "@/lib/validations";
import { formatDate, formatCurrency } from "@/lib/utils";
import ExpenseStats from "@/components/finance/ExpenseStats";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const EXPENSE_CATEGORIES = [
  "Travel",
  "Office Supplies",
  "Software",
  "Marketing",
  "Utilities",
  "Salaries",
  "Rent",
  "Other",
];

export default function ExpensesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    search: "",
    category: "",
  });
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["expenses", params],
    queryFn: () => financeAPI.getExpenses(params).then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0] },
  });

const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
      const res = await employeesAPI.exportEmployees({
        department: params.department,
        status: params.status,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `employees-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  const importMutation = useMutation({
    mutationFn: (formData) => employeesAPI.importEmployees(formData).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(`Imported: ${data.created} created, ${data.skipped} skipped, ${data.failed} failed`);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Import failed"),
  });

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    importMutation.mutate(formData);
    e.target.value = ""; // allow re-importing the same file
  };


  const createMutation = useMutation({
    mutationFn: financeAPI.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setModalOpen(false);
      reset();
      toast.success("Expense recorded");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: financeAPI.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted");
    },
  });

  const statusColors = {
    Approved: "success",
    Pending: "warning",
    Rejected: "danger",
  };

  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: "title",
      label: "Title",
      render: (val, row) => (
        <div>
          <p
            className="text-[13px] font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {val}
          </p>
          {row.description && (
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (val) => <Badge variant="gray">{val}</Badge>,
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-red-600">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val = "Pending") => (
        <Badge variant={statusColors[val] || "warning"} dot>
          {val}
        </Badge>
      ),
    },
    {
      key: "submittedBy",
      label: "Submitted By",
      render: (val) => (val ? val.name || val.email || "—" : "—"),
    },
    {
      key: "id",
      label: "Actions",
      render: (id) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/finance/expenses/${id}`)}
          >
            View
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/finance/expenses/${id}/edit`)}
          >
            Edit
          </button>

          <button
            className="btn btn-ghost btn-sm text-red-500"
            onClick={() => {
              if (confirm("Delete this expense?")) {
                deleteMutation.mutate(id);
              }
            }}
          >
            Delete
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
            Expenses
          </h1>
          <p
            className="text-[12px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {data?.total ?? 0} records
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Add Expense
        </button>
      </div>
      <ExpenseStats
        totalExpense={245000}
        pending={18}
        approved={145}
        rejected={12}
      />
      <ExpenseFilters
        search={params.search}
        setSearch={(value) =>
          setParams((p) => ({
            ...p,
            page: 1,
            search: value,
          }))
        }
        category={params.category}
        setCategory={(value) =>
          setParams((p) => ({
            ...p,
            page: 1,
            category: value,
          }))
        }
        status={params.status || ""}
        setStatus={(value) =>
          setParams((p) => ({
            ...p,
            page: 1,
            status: value,
          }))
        }
        onAddExpense={() => setModalOpen(true)}
      />

      <div className="mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.expenses || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          onPageChange={(page) => setParams((p) => ({ ...p, page }))}
          emptyTitle="No expenses recorded"
          emptyDescription="Track company expenses by adding them here"
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          reset();
        }}
        title="Record Expense"
        onSubmit={handleSubmit((d) => createMutation.mutate(d))}
        loading={createMutation.isPending}
        submitLabel="Record Expense"
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="input"
              placeholder="e.g. Office supplies purchase"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-[11px] text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Amount (NPR) *</label>
              <input
                className="input"
                type="number"
                step="0.01"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-[11px] text-red-500">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="input" {...register("category")}>
                <option value="">Select category</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[11px] text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input className="input" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-[11px] text-red-500">
                  {errors.date.message}
                </p>
              )}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Additional details..."
              {...register("description")}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}

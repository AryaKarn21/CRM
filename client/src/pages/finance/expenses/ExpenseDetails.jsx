import { useParams, useNavigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ArrowLeft,
  Calendar,
  Wallet,
  User,
  Building,
  FileText,
  Download,
  Eye,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";

import toast from "react-hot-toast";

import Badge from "@/components/ui/Badge";
import { financeAPI } from "@/api/finance.api";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_COLORS = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export default function ExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* ----------------------- Query ----------------------- */

  const { data, isLoading } = useQuery({
    queryKey: ["expense", id],
    queryFn: () =>
      financeAPI.getExpense(id).then((res) => res.data),
    enabled: !!id,
  });

  /* -------------------- Upload Receipt -------------------- */

  const uploadMutation = useMutation({
    mutationFn: ({ id, formData }) =>
      financeAPI.uploadReceipt(id, formData),

    onSuccess: () => {
      toast.success("Receipt uploaded.");

      queryClient.invalidateQueries({
        queryKey: ["expense", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
    },

    onError: () => {
      toast.error("Upload failed.");
    },
  });

  /* -------------------- Approve -------------------- */

  const approveMutation = useMutation({
    mutationFn: () =>
      financeAPI.approveExpense(id),

    onSuccess: () => {
      toast.success("Expense approved.");

      queryClient.invalidateQueries({
        queryKey: ["expense", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
    },

    onError: () => {
      toast.error("Approval failed.");
    },
  });

  /* -------------------- Reject -------------------- */

  const rejectMutation = useMutation({
    mutationFn: () =>
      financeAPI.rejectExpense(
        id,
        "Rejected"
      ),

    onSuccess: () => {
      toast.success("Expense rejected.");

      queryClient.invalidateQueries({
        queryKey: ["expense", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
    },

    onError: () => {
      toast.error("Reject failed.");
    },
  });

  /* -------------------- Delete Receipt -------------------- */

  const deleteReceiptMutation = useMutation({
    mutationFn: () =>
      financeAPI.deleteReceipt(id),

    onSuccess: () => {
      toast.success("Receipt deleted.");

      queryClient.invalidateQueries({
        queryKey: ["expense", id],
      });
    },

    onError: () => {
      toast.error("Delete failed.");
    },
  });

  /* -------------------- Upload Receipt -------------------- */

  const handleReceiptUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("receipt", file);

    uploadMutation.mutate({
      id,
      formData,
    });
  };

  /* -------------------- View Receipt -------------------- */

  const handleViewReceipt = async () => {
    try {
      const response =
        await financeAPI.viewReceipt(id);

      const blob = new Blob([response.data]);

      const url =
        window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);

    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        "Unable to view receipt."
      );
    }
  };

  /* -------------------- Download Receipt -------------------- */

  const handleDownloadReceipt = async () => {
    try {
      const response =
        await financeAPI.downloadReceipt(id);

      const blob = new Blob([response.data]);

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        expense.receiptOriginalName ||
        "Receipt";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success(
        "Receipt downloaded."
      );

    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        "Unable to download receipt."
      );
    }
  };

  /* -------------------- Download Report -------------------- */

  const handleDownloadReport = async () => {
    try {
      const response =
        await financeAPI.downloadExpenseReport(id);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = `Expense-${
        expense?.expenseNo || id
      }.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success(
        "Expense report downloaded."
      );

    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        "Unable to download report."
      );
    }
  };

  /* -------------------- Helpers -------------------- */

  const formatFileSize = (bytes) => {

    if (!bytes) return "-";

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;

  };

  const getFileType = (mime) => {

    if (!mime) return "Document";

    if (mime.includes("pdf"))
      return "PDF Document";

    if (mime.includes("image"))
      return "Image";

    if (mime.includes("csv"))
      return "CSV File";

    if (
      mime.includes("excel") ||
      mime.includes("sheet")
    )
      return "Excel File";

    if (mime.includes("word"))
      return "Word Document";

    return "Document";
  };

  /* ----------------------- Render ----------------------- */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2
          className="animate-spin"
          size={34}
        />
      </div>
    );
  }

  const expense = data || {};

  return (
    <div className="animate-fade-in p-6 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/finance/expenses")}
            className="w-10 h-10 rounded-lg border hover:bg-gray-50 flex items-center justify-center transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {expense.title || "Expense"}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {expense.category} • {formatDate(expense.date)}
            </p>
          </div>

          <Badge variant={STATUS_COLORS[expense.status] || "warning"} dot>
            {expense.status ? expense.status.charAt(0).toUpperCase() + expense.status.slice(1) : "Pending"}
          </Badge>
        </div>

        {expense.status === "pending" && (
          <div className="flex gap-3">
            <button
              className="btn btn-primary"
              style={{ background: "var(--success)", borderColor: "var(--success)" }}
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
            >
              Approve
            </button>
            <button
              className="btn btn-danger"
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Expense Info */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Info icon={Wallet} label="Amount" value={formatCurrency(expense.amount)} />
          <Info icon={Calendar} label="Date" value={formatDate(expense.date)} />
          <Info icon={Building} label="Category" value={expense.category} />
          <Info icon={User} label="Submitted By" value={expense.submittedBy?.name} />
        </div>

        {expense.description && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Description</p>
            <p className="text-sm">{expense.description}</p>
          </div>
        )}

        {expense.status === "rejected" && expense.rejectionReason && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Rejection Reason</p>
            <p className="text-sm text-red-600">{expense.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="card p-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

          <div>

            <h2 className="text-xl font-semibold flex items-center gap-2">

              <FileText size={22} />

              Documents

            </h2>

            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              Upload, view, replace and download expense documents.
            </p>

          </div>

        </div>

        {expense.receipt ? (

          <div className="border rounded-xl p-5">

            <div className="flex flex-col xl:flex-row xl:justify-between gap-6">

              {/* Left */}

              <div className="flex gap-4">

                <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">

                  <FileText
                    size={28}
                    className="text-red-600"
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-lg">

                    {expense.receiptOriginalName ||
                      "Receipt"}

                  </h3>

                  <p
                    className="text-sm mt-1"
                    style={{
                      color:
                        "var(--text-muted)",
                    }}
                  >
                    {getFileType(
                      expense.receiptMimeType
                    )}

                    {" • "}

                    {formatFileSize(
                      expense.receiptSize
                    )}

                  </p>

                  <p
                    className="text-sm mt-1"
                    style={{
                      color:
                        "var(--text-muted)",
                    }}
                  >
                    Uploaded on{" "}

                    {expense.receiptUploadedAt
                      ? formatDate(
                          expense.receiptUploadedAt
                        )
                      : "-"}

                  </p>

                </div>

              </div>

              {/* Right */}

              <div className="grid grid-cols-2 gap-3">

                <button
                  className="btn btn-secondary"
                  onClick={handleViewReceipt}
                >
                  <Eye size={16} />
                  View
                </button>

                <button
                  className="btn btn-primary"
                  onClick={
                    handleDownloadReceipt
                  }
                >
                  <Download size={16} />
                  Receipt
                </button>

                <button
                  className="btn btn-success"
                  onClick={
                    handleDownloadReport
                  }
                >
                  <Download size={16} />
                  Report
                </button>

                <label className="btn btn-warning cursor-pointer">

                  <Upload size={16} />

                  Replace

                  <input
                    hidden
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx"
                    onChange={
                      handleReceiptUpload
                    }
                  />

                </label>

                <button
                  className="btn btn-danger col-span-2"
                  onClick={() => {

                    if (
                      window.confirm(
                        "Delete this receipt?"
                      )
                    ) {

                      deleteReceiptMutation.mutate();

                    }

                  }}
                >

                  <Trash2 size={16} />

                  Delete Receipt

                </button>

              </div>

            </div>

          </div>

        ) : (

          <div className="border-2 border-dashed rounded-xl p-10 text-center">

            <Upload
              size={54}
              className="mx-auto text-blue-500 mb-5"
            />

            <h3 className="text-lg font-semibold">

              No Receipt Uploaded

            </h3>

            <p
              className="mt-2 mb-6"
              style={{
                color:
                  "var(--text-muted)",
              }}
            >
              Upload invoices or supporting
              documents for this expense.
            </p>

            <label
              className={`btn btn-primary cursor-pointer ${
                uploadMutation.isPending
                  ? "opacity-60 pointer-events-none"
                  : ""
              }`}
            >

              {uploadMutation.isPending ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />

                  Upload Receipt
                </>
              )}

              <input
                hidden
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx"
                onChange={
                  handleReceiptUpload
                }
              />

            </label>

          </div>

        )}

      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-4">

      <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">

        <Icon size={18} />

      </div>

      <div>

        <p
          className="text-sm"
          style={{
            color:
              "var(--text-muted)",
          }}
        >
          {label}
        </p>

        <p className="font-semibold">
          {value || "-"}
        </p>

      </div>

    </div>
  )
}
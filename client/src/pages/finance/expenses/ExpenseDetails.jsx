import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Pencil, CheckCircle, XCircle, Receipt, Calendar,
  Wallet, User, Building, FileText, Download, Eye, Upload, Trash2, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import Badge from "@/components/ui/Badge";
import { financeAPI } from "@/api/finance.api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["expense", id],
    queryFn: () => financeAPI.getExpense(id).then((res) => res.data),
    enabled: !!id,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, formData }) => financeAPI.uploadReceipt(id, formData),
    onSuccess: () => {
      toast.success("Receipt uploaded.");
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: () => toast.error("Upload failed."),
  });

  const approveMutation = useMutation({
    mutationFn: () => financeAPI.approveExpense(id),
    onSuccess: () => {
      toast.success("Expense approved.");
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
    },
    onError: () => toast.error("Approval failed."),
  });

  const rejectMutation = useMutation({
    mutationFn: () => financeAPI.rejectExpense(id, "Rejected"),
    onSuccess: () => {
      toast.success("Expense rejected.");
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
    },
    onError: () => toast.error("Reject failed."),
  });

  const deleteReceiptMutation = useMutation({
    mutationFn: () => financeAPI.deleteReceipt(id),
    onSuccess: () => {
      toast.success("Receipt deleted.");
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
    },
    onError: () => toast.error("Delete failed."),
  });

  const handleReceiptUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("receipt", file);
    uploadMutation.mutate({ id, formData });
  };

  const handleViewReceipt = async () => {
    try {
      const response = await financeAPI.viewReceipt(id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to view receipt.");
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await financeAPI.downloadReceipt(id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = expense?.receiptOriginalName || "Receipt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Receipt downloaded.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to download receipt.");
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await financeAPI.downloadExpenseReport(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Expense-${expense?.expenseNo || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Expense report downloaded.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to download report.");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileType = (mime) => {
    if (!mime) return "Document";
    if (mime.includes("pdf")) return "PDF Document";
    if (mime.includes("image")) return "Image";
    if (mime.includes("csv")) return "CSV File";
    if (mime.includes("excel") || mime.includes("sheet")) return "Excel File";
    if (mime.includes("word")) return "Word Document";
    return "Document";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin" size={34} />
      </div>
    );
  }

  const expense = data || {};

  return (
    <div className="animate-fade-in">
      {/*
        Header
        - Stacks: back+title on their own row, status+actions wrap below
          on mobile instead of squeezing onto one line.
        - Buttons shrink to icon-only labels via smaller text on phones.
      */}
      <div className="page-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            className="btn btn-ghost btn-sm shrink-0"
            onClick={() => navigate("/finance/expenses")}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1
              className="text-[15px] sm:text-[18px] font-bold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {expense.title || "Expense Details"}
            </h1>
            <p
              className="text-[10px] sm:text-[12px] mt-0.5 truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {expense.expenseNo || expense.id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              expense.status === "approved" ? "success" :
              expense.status === "rejected" ? "danger" : "warning"
            }
            dot
          >
            {expense.status || "pending"}
          </Badge>

          {expense.status === "pending" && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
              >
                <CheckCircle size={14} />
                <span className="hidden xs:inline">Approve</span>
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
              >
                <XCircle size={14} />
                <span className="hidden xs:inline">Reject</span>
              </button>
            </>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/finance/expenses/${id}/edit`)}
          >
            <Pencil size={14} />
            <span className="hidden xs:inline">Edit</span>
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6">
        {/* Expense Info */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Expense Information</h2>

          {/*
            1 column on phones, 2 columns from sm (640px) up. Previously
            fixed at md:grid-cols-2, which left a single narrow column on
            small tablets too — sm: kicks in earlier for less wasted space.
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Info icon={Receipt} label="Category" value={expense.category} />
            <Info icon={Wallet} label="Amount" value={formatCurrency(expense.amount || 0)} />
            <Info icon={Calendar} label="Expense Date" value={expense.date ? formatDate(expense.date) : "-"} />
            <Info icon={User} label="Submitted By" value={expense.submittedBy?.name || expense.submittedBy?.email} />
            {expense.approvedBy && (
              <Info icon={User} label="Approved By" value={expense.approvedBy?.name} />
            )}
            {expense.company?.name && (
              <Info icon={Building} label="Company" value={expense.company.name} />
            )}
          </div>

          {expense.description && (
            <div className="mt-4 sm:mt-6">
              <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Description</p>
              <p className="text-[13px] sm:text-[14px] break-words">{expense.description}</p>
            </div>
          )}

          {expense.status === "rejected" && expense.rejectionReason && (
            <div className="mt-4 sm:mt-6 p-3 rounded-lg bg-red-50">
              <p className="text-sm font-medium text-red-700">Rejection Reason</p>
              <p className="text-sm text-red-600">{expense.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="card p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <FileText size={20} />
              Documents
            </h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Upload, view, replace and download expense documents.
            </p>
          </div>

          {expense.receipt ? (
            <div className="border rounded-xl p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <FileText size={24} className="text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg truncate">
                      {expense.receiptOriginalName || "Receipt"}
                    </h3>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                      {getFileType(expense.receiptMimeType)} {" • "} {formatFileSize(expense.receiptSize)}
                    </p>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                      Uploaded on {expense.receiptUploadedAt ? formatDate(expense.receiptUploadedAt) : "-"}
                    </p>
                  </div>
                </div>

                {/*
                  Action buttons: 2 columns on phones (fits 44px+ tap
                  targets without crowding), still 2 columns at wider
                  sizes too — 4-across was cramped even on desktop.
                */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button className="btn btn-secondary text-xs sm:text-sm" onClick={handleViewReceipt}>
                    <Eye size={15} /> View
                  </button>
                  <button className="btn btn-primary text-xs sm:text-sm" onClick={handleDownloadReceipt}>
                    <Download size={15} /> Receipt
                  </button>
                  <button className="btn btn-success text-xs sm:text-sm" onClick={handleDownloadReport}>
                    <Download size={15} /> Report
                  </button>
                  <label className="btn btn-warning text-xs sm:text-sm cursor-pointer">
                    <Upload size={15} /> Replace
                    <input
                      hidden
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx"
                      onChange={handleReceiptUpload}
                    />
                  </label>
                  <button
                    className="btn btn-danger col-span-2 text-xs sm:text-sm"
                    onClick={() => {
                      if (window.confirm("Delete this receipt?")) {
                        deleteReceiptMutation.mutate();
                      }
                    }}
                  >
                    <Trash2 size={15} /> Delete Receipt
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-xl p-6 sm:p-10 text-center">
              <Upload size={42} className="mx-auto text-blue-500 mb-4 sm:mb-5" />
              <h3 className="text-base sm:text-lg font-semibold">No Receipt Uploaded</h3>
              <p className="mt-2 mb-5 sm:mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
                Upload invoices or supporting documents for this expense.
              </p>
              <label
                className={`btn btn-primary cursor-pointer ${
                  uploadMutation.isPending ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
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
                  onChange={handleReceiptUpload}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 sm:gap-4">
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="font-semibold text-sm sm:text-base break-words">{value || "-"}</p>
      </div>
    </div>
  );
}
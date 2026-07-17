import {
  ArrowLeft,
  Plus,
  Upload,
  Download,
  Printer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LedgerHeader({
  onAdd,
  onImport,
  onExport,
  onPrint,
}) {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <div className="flex items-center gap-4">
        <button
          className="btn btn-ghost"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <h1 className="text-2xl font-bold">
            General Ledger
          </h1>

          <p
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Manage accounting transactions, journals and balances
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="btn btn-secondary"
          onClick={onImport}
        >
          <Upload size={16} />
          Import
        </button>

        <button
          className="btn btn-secondary"
          onClick={onExport}
        >
          <Download size={16} />
          Export
        </button>

        <button
          className="btn btn-secondary"
          onClick={onPrint}
        >
          <Printer size={16} />
          Print
        </button>

        <button
          className="btn btn-primary"
          onClick={onAdd}
        >
          <Plus size={16} />
          Add Entry
        </button>
      </div>
    </div>
  );
}
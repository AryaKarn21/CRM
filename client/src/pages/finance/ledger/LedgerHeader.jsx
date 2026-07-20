import { Plus, Download, Upload } from 'lucide-react'

export default function LedgerHeader({ total = 0, onAddEntry, onExport, onImportFile }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
          General Ledger
        </h1>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {total} entries
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn btn-secondary" onClick={onExport}>
          <Download size={14} /> Export CSV
        </button>

        <label className="btn btn-secondary cursor-pointer">
          <Upload size={14} /> Import CSV
          <input type="file" accept=".csv" hidden onChange={onImportFile} />
        </label>

        <button className="btn btn-primary" onClick={onAddEntry}>
          <Plus size={14} /> Add Entry
        </button>
      </div>
    </div>
  )
}
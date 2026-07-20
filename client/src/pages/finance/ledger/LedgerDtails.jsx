import { X, Pencil, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function LedgerDtails({ entry, onClose, onEdit, onDelete }) {
  if (!entry) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-white shadow-xl p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Ledger Entry</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Row label="Date" value={formatDate(entry.date)} />
          <Row label="Reference" value={entry.reference || '—'} />
          <Row label="Description" value={entry.description} />
          <Row label="Account" value={entry.accountName || '—'} />
          <Row
            label="Type"
            value={<Badge variant={entry.type === 'debit' ? 'danger' : 'success'}>{entry.type}</Badge>}
          />
          <Row
            label="Debit"
            value={
              entry.debit
                ? <span className="text-red-600 font-medium">{formatCurrency(entry.debit)}</span>
                : '—'
            }
          />
          <Row
            label="Credit"
            value={
              entry.credit
                ? <span className="text-green-600 font-medium">{formatCurrency(entry.credit)}</span>
                : '—'
            }
          />
          <Row
            label="Balance"
            value={
              entry.balance != null
                ? <span className="font-semibold">{formatCurrency(entry.balance)}</span>
                : '—'
            }
          />
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-3 mt-8 pt-6 border-t">
            {onEdit && (
              <button
                className="btn btn-secondary flex-1"
                onClick={() => {
                  onEdit(entry)
                  onClose()
                }}
              >
                <Pencil size={14} /> Edit
              </button>
            )}
            {onDelete && (
              <button
                className="btn btn-danger flex-1"
                onClick={() => {
                  if (window.confirm('Delete this ledger entry?')) {
                    onDelete(entry.id)
                    onClose()
                  }
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <div className="text-[14px] mt-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  )
}
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', confirmVariant = 'danger', loading = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title=" "
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className={`btn btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {confirmLabel}...
              </span>
            ) : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--danger-bg)' }}>
          <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          {description && <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{description}</p>}
        </div>
      </div>
    </Modal>
  )
}
import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Eye, Pencil, Copy, Power, PowerOff, Trash2, RotateCcw, XCircle } from 'lucide-react'

export default function RoleActionsMenu({
  role,
  onView,
  onEdit,
  onClone,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const item = (icon, label, onClick, danger = false) => (
    <button
      type="button"
      className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left hover:bg-[var(--surface-2)] transition-colors ${
        danger ? 'text-red-500' : ''
      }`}
      style={{ color: danger ? undefined : 'var(--text-secondary)' }}
      onClick={() => {
        setOpen(false)
        onClick()
      }}
    >
      {icon} {label}
    </button>
  )

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="btn btn-ghost btn-icon btn-sm"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${role.name}`}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-lg py-1 z-30 animate-fade-in"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {role.isDeleted ? (
            <>
              {item(<RotateCcw size={14} />, 'Restore', onRestore)}
              {item(<XCircle size={14} />, 'Delete Permanently', onPermanentDelete, true)}
            </>
          ) : (
            <>
              {item(<Eye size={14} />, 'View Permissions', onView)}
              {item(<Pencil size={14} />, 'Edit Role', onEdit)}
              {item(<Copy size={14} />, 'Clone Role', onClone)}
              {role.isActive
                ? item(<PowerOff size={14} />, 'Deactivate', onDeactivate)
                : item(<Power size={14} />, 'Activate', onActivate)}
              {item(<Trash2 size={14} />, 'Move to Trash', onDelete, true)}
            </>
          )}
        </div>
      )}
    </div>
  )
}
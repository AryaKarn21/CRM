import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'No data', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--surface-2)' }}>
        <Inbox size={20} style={{ color: 'var(--text-muted)' }} />
      </div>
      <h3 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && <p className="text-[13px] max-w-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
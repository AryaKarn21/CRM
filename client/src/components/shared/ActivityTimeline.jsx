import { formatRelativeTime } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

export default function ActivityTimeline({ items = [], loading = false }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--border)] animate-pulse flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 bg-[var(--border)] rounded animate-pulse w-3/4" />
              <div className="h-2 bg-[var(--border)] rounded animate-pulse w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="py-10 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
        No activity yet
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
      <div className="flex flex-col">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 px-4 py-3 relative hover:bg-[var(--surface-2)] transition-colors">
            <Avatar name={item.user?.name || '?'} size="sm" className="relative z-10 ring-2 ring-[var(--surface)]" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
                <span className="font-medium">{item.user?.name || 'System'}</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{item.description}</span>
              </p>
              {item.detail && (
                <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{item.detail}</p>
              )}
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {formatRelativeTime(item.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
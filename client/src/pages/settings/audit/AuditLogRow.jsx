import { useState } from 'react'
import { ChevronDown, ChevronRight, Monitor, Smartphone, Tablet } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'

const DEVICE_ICONS = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet }

export default function AuditLogRow({ log }) {
  const [expanded, setExpanded] = useState(false)
  const DeviceIcon = DEVICE_ICONS[log.device] || Monitor
  const hasChanges = log.changes && Object.keys(log.changes).length > 0

  return (
    <div className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <button
        type="button"
        className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-[var(--surface-2)] transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        {hasChanges ? (
          expanded ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        <Avatar name={log.user?.name || 'System'} size="xs" />

        <div className="min-w-0 flex-1">
          <p className="text-[12px] sm:text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>
            <span className="font-medium">{log.user?.name || 'System'}</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>{log.action.replace(/_/g, ' ')}</span>
          </p>
          <p className="text-[10px] sm:text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
            {log.resource}
            {log.resourceId ? ` · ${log.resourceId.slice(0, 8)}` : ''}
          </p>
        </div>

        <Badge variant="gray" className="hidden sm:inline-flex shrink-0">
          {log.module || '—'}
        </Badge>

        <div className="hidden md:flex items-center gap-1 text-[11px] shrink-0" style={{ color: 'var(--text-muted)' }}>
          <DeviceIcon size={12} />
          {log.browser || 'Unknown'}
        </div>

        <Badge variant={log.status === 'failed' ? 'danger' : 'success'} dot className="shrink-0">
          {log.status}
        </Badge>

        <span className="text-[10px] sm:text-[11px] shrink-0 w-20 sm:w-32 text-right" style={{ color: 'var(--text-muted)' }}>
          {formatDate(log.createdAt, 'MMM d, HH:mm')}
        </span>
      </button>

      {expanded && hasChanges && (
        <div className="px-4 pb-3 pl-10">
          <pre
            className="text-[11px] p-3 rounded-lg overflow-x-auto"
            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
          >
            {JSON.stringify(log.changes, null, 2)}
          </pre>
          {log.ipAddress && (
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
              IP: {log.ipAddress}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
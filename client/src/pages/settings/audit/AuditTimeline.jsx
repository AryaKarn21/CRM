import { Monitor, Smartphone, Tablet } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'

const DEVICE_ICONS = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet }

// Groups a flat log list into { "Jul 19, 2026": [log, log, ...], ... }
// so the timeline reads as day-by-day sections instead of one long list.
function groupByDay(logs) {
  const groups = {}
  for (const log of logs) {
    const day = formatDate(log.createdAt, 'MMM d, yyyy')
    if (!groups[day]) groups[day] = []
    groups[day].push(log)
  }
  return groups
}

export default function AuditTimeline({ logs }) {
  if (!logs.length) {
    return (
      <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
        No activity to show.
      </div>
    )
  }

  const grouped = groupByDay(logs)

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-5">
      {Object.entries(grouped).map(([day, dayLogs]) => (
        <div key={day}>
          <p
            className="text-[11px] font-semibold uppercase tracking-wide mb-3 sticky top-0"
            style={{ color: 'var(--text-muted)' }}
          >
            {day}
          </p>

          <div className="relative pl-5 sm:pl-6 flex flex-col gap-4">
            <div className="absolute left-[7px] sm:left-2 top-1 bottom-1 w-px" style={{ background: 'var(--border)' }} />

            {dayLogs.map((log) => {
              const DeviceIcon = DEVICE_ICONS[log.device] || Monitor
              return (
                <div key={log.id} className="relative flex items-start gap-3">
                  <div
                    className="absolute -left-5 sm:-left-6 top-1.5 w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: log.status === 'failed' ? '#ef4444' : 'var(--primary, #4f46e5)' }}
                  />

                  <Avatar name={log.user?.name || 'System'} size="xs" />

                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] sm:text-[13px]" style={{ color: 'var(--text-primary)' }}>
                      <span className="font-medium">{log.user?.name || 'System'}</span>{' '}
                      <span style={{ color: 'var(--text-muted)' }}>{log.action.replace(/_/g, ' ')}</span>
                      {log.resource && (
                        <span style={{ color: 'var(--text-muted)' }}> · {log.resource}</span>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] sm:text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(log.createdAt, 'HH:mm')}
                      </span>
                      {log.module && (
                        <Badge variant="gray" className="hidden sm:inline-flex">
                          {log.module}
                        </Badge>
                      )}
                      <span className="hidden md:flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <DeviceIcon size={11} />
                        {log.browser || 'Unknown'}
                      </span>
                      <Badge variant={log.status === 'failed' ? 'danger' : 'success'} dot>
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
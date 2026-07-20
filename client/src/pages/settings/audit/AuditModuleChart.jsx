import { useQuery } from '@tanstack/react-query'
import { settingsAPI } from '@/api/settings.api'
import ChartWidget from '@/components/shared/ChartWidget'

export default function AuditModuleChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => settingsAPI.getAuditStats().then((r) => r.data),
  })

  const rows = (data?.byModule || [])
    .filter((m) => m.module && m.module !== 'unknown')
    .sort((a, b) => b.count - a.count)
    .slice(0, 8) // top 8 modules — keeps the bar chart readable on mobile

  return (
    <div className="card p-4 sm:p-6">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Activity by Module
        </h3>
        <p className="text-[11px] sm:text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Event volume across the last logged period
        </p>
      </div>

      {isLoading ? (
        <div className="h-[220px] rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
          No activity recorded yet.
        </div>
      ) : (
        <ChartWidget
          type="apex-bar"
          title=""
          data={rows}
          dataKey="count"
          xKey="module"
          height={240}
          color="#6366f1"
        />
      )}
    </div>
  )
}
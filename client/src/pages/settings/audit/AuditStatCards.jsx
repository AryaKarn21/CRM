import { useQuery } from '@tanstack/react-query'
import { Activity, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { settingsAPI } from '@/api/settings.api'

export default function AuditStatCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => settingsAPI.getAuditStats().then((r) => r.data),
    staleTime: 30_000,
  })

  const successRate =
    data && data.total > 0 ? Math.round((data.success / data.total) * 100) : null

  const cards = [
    { label: 'Total Events', value: data?.total, icon: Activity, color: 'bg-blue-600' },
    { label: 'Successful', value: data?.success, icon: CheckCircle2, color: 'bg-green-600' },
    { label: 'Failed', value: data?.failed, icon: XCircle, color: 'bg-red-600' },
    {
      label: 'Success Rate',
      value: successRate != null ? `${successRate}%` : undefined,
      icon: TrendingUp,
      color: 'bg-purple-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <div key={c.label} className="card p-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                {c.label}
              </p>
              {isLoading ? (
                <div className="h-6 w-10 mt-1.5 rounded animate-pulse" style={{ background: 'var(--border)' }} />
              ) : (
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {c.value ?? 0}
                </p>
              )}
            </div>
            <div className={`${c.color} w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0`}>
              <Icon size={18} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
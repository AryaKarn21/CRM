import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StatCard({ title, value, change, changeLabel, icon: Icon, color = 'primary', loading = false }) {
  const colorMap = {
  primary: { bg: 'var(--primary-light)', icon: 'var(--primary)' },
  success: { bg: 'var(--success-bg)', icon: 'var(--success)' },
  warning: { bg: 'var(--warning-bg)', icon: 'var(--warning)' },
  danger: { bg: 'var(--danger-bg)', icon: 'var(--danger)' },
  info: { bg: 'var(--info-bg)', icon: 'var(--info)' },
  gray: { bg: 'var(--surface-2)', icon: 'var(--text-muted)' },
}
const colors = colorMap[color] || colorMap.gray

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-[12px] font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{title}</p>
          {loading
            ? <div className="h-7 w-24 rounded animate-pulse" style={{ background: 'var(--border)' }} />
            : <p className="text-[24px] font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
          }
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: colors.bg }}>
          {Icon && <Icon size={18} style={{ color: colors.icon }} />}
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          {change >= 0
            ? <TrendingUp size={13} className="text-green-500" />
            : <TrendingDown size={13} className="text-red-500" />
          }
          <span className={cn('text-[12px] font-semibold', change >= 0 ? 'text-green-600' : 'text-red-600')}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          {changeLabel && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
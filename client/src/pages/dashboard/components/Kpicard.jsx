import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const colorMap = {
  primary: { bg: 'var(--primary-light)', icon: 'var(--primary)' },
  success: { bg: 'var(--success-bg)', icon: 'var(--success)' },
  warning: { bg: 'var(--warning-bg)', icon: 'var(--warning)' },
  danger:  { bg: 'var(--danger-bg)',  icon: 'var(--danger)'  },
  info:    { bg: 'var(--info-bg)',    icon: 'var(--info)'    },
  gray:    { bg: 'var(--surface-2)',  icon: 'var(--text-muted)' },
}

export default function KpiCard({ title, value, change, changeLabel, icon: Icon, color = 'primary', loading = false, delay = 0 }) {
  const colors = colorMap[color] || colorMap.gray
  const hasChange = change !== undefined && change !== null
  const isFlat = hasChange && Number(change) === 0

  return (
    <div className="dash-kpi-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-[12px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {title}
        </p>
        <div
          className="dash-kpi-icon-wrap w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg }}
        >
          {Icon && <Icon size={18} style={{ color: colors.icon }} />}
        </div>
      </div>

      {loading ? (
        <div className="dash-skeleton h-7 w-24 mb-2" />
      ) : (
        <p className="dash-kpi-value text-[26px] font-bold leading-none mb-2" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
      )}

      {hasChange && !loading && (
        <div className="flex items-center gap-1.5">
          {isFlat ? (
            <Minus size={13} style={{ color: 'var(--text-muted)' }} />
          ) : change > 0 ? (
            <TrendingUp size={13} style={{ color: 'var(--success)' }} />
          ) : (
            <TrendingDown size={13} style={{ color: 'var(--danger)' }} />
          )}
          <span
            className="text-[12px] font-semibold"
            style={{ color: isFlat ? 'var(--text-muted)' : change > 0 ? 'var(--success)' : 'var(--danger)' }}
          >
            {change > 0 ? '+' : ''}{change}%
          </span>
          {changeLabel && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
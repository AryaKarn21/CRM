import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const BAR_COLORS = ['var(--primary)', 'var(--info)', 'var(--success)', 'var(--warning)', 'var(--danger)', '#8b5cf6', '#06b6d4', '#ec4899']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div
      className="rounded-lg px-3 py-2 text-[12px]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
    >
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.payload.stage}</p>
      <p style={{ color: 'var(--text-secondary)' }}>{formatCurrency(p.value)}</p>
    </div>
  )
}

export default function PipelineChart({ data = [], loading }) {
  const chartData = [...data].sort((a, b) => b.value - a.value).slice(0, 6)

  return (
    <div className="dash-card overflow-hidden">
      <div className="dash-card-head">
        <div className="flex items-center gap-2">
          <PieIcon size={15} style={{ color: 'var(--primary)' }} />
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Pipeline by Stage</h3>
        </div>
      </div>
      <div className="p-4" style={{ height: 300 }}>
        {loading ? (
          <div className="dash-skeleton w-full h-full" />
        ) : chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
              <YAxis
                type="category"
                dataKey="stage"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22} animationDuration={600}>
                {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
            No open pipeline yet
          </div>
        )}
      </div>
    </div>
  )
}
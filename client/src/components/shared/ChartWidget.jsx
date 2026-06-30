import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts'

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 shadow-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[13px] font-semibold" style={{ color: p.color }}>
          {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function ChartWidget({ type = 'line', data = [], dataKey, xKey = 'label', color = 'var(--primary)', height = 220, formatter, title }) {
  const commonProps = {
    data,
    margin: { top: 4, right: 4, left: 0, bottom: 0 },
  }

  const axisProps = {
    style: { fontSize: 11, fill: 'var(--text-muted)' },
    tickLine: false,
    axisLine: false,
  }

  const Chart = { line: LineChart, bar: BarChart, area: AreaChart }[type]

  return (
    <div>
      {title && <p className="text-[13px] font-semibold mb-3 px-1" style={{ color: 'var(--text-primary)' }}>{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <Chart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} width={50} />
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          {type === 'line' && <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />}
          {type === 'bar' && <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />}
          {type === 'area' && (
            <>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#areaGrad)" dot={false} />
            </>
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}
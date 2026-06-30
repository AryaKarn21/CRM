import { useQuery } from '@tanstack/react-query'
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react'
import { financeAPI } from '@/api/finance.api'
import StatCard from '@/components/shared/StatCard'
import ChartWidget from '@/components/shared/ChartWidget'
import { formatCurrency } from '@/lib/utils'

export default function FinanceOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['finance-overview'],
    queryFn: () => financeAPI.getOverview().then(r => r.data),
  })

  const { data: monthlyRevenue, isLoading: chartLoading } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: () => financeAPI.getReports('revenue-by-month').then(r => r.data),
  })

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Finance Overview</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Real-time financial summary</p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={data?.revenue ? formatCurrency(data.revenue) : '—'} change={data?.revenueChange} changeLabel="vs last month" icon={TrendingUp} color="success" loading={isLoading} />
          <StatCard title="Total Expenses" value={data?.expenses ? formatCurrency(data.expenses) : '—'} change={data?.expensesChange} icon={TrendingDown} color="danger" loading={isLoading} />
          <StatCard title="Net Profit" value={data?.profit ? formatCurrency(data.profit) : '—'} change={data?.profitChange} icon={DollarSign} color="primary" loading={isLoading} />
          <StatCard title="Pending Payables" value={data?.payables ? formatCurrency(data.payables) : '—'} icon={CreditCard} color="warning" loading={isLoading} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            {chartLoading
              ? <div className="h-[220px] rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
              : <ChartWidget
                  type="area"
                  title="Monthly Revenue"
                  data={monthlyRevenue?.data || []}
                  dataKey="revenue"
                  xKey="month"
                  formatter={(v) => formatCurrency(v)}
                />
            }
          </div>
          <div className="card p-5">
            {chartLoading
              ? <div className="h-[220px] rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
              : <ChartWidget
                  type="bar"
                  title="Monthly Expenses"
                  data={monthlyRevenue?.data || []}
                  dataKey="expenses"
                  xKey="month"
                  color="var(--danger)"
                  formatter={(v) => formatCurrency(v)}
                />
            }
          </div>
        </div>

        {/* Recent transactions */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
          </div>
          <div className="divide-y" style={{ divideColor: 'var(--border)' }}>
            {data?.recentTransactions?.length ? data.recentTransactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--surface-2)] transition-colors">
                <div>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{tx.category} • {tx.date}</p>
                </div>
                <span className={`text-[14px] font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                </span>
              </div>
            )) : (
              <div className="px-5 py-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>No recent transactions</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
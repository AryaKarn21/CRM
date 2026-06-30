import { useQuery } from '@tanstack/react-query'
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'
import { reportsAPI } from '@/api/reports.api'
import StatCard from '@/components/shared/StatCard'
import ChartWidget from '@/components/shared/ChartWidget'
import { formatCurrency } from '@/lib/utils'

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => reportsAPI.getDashboardStats().then(r => r.data),
  })

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-by-month'],
    queryFn: () => reportsAPI.getRevenueByMonth(new Date().getFullYear()).then(r => r.data),
  })

  const { data: salesData } = useQuery({
    queryKey: ['sales-report'],
    queryFn: () => reportsAPI.getSalesReport().then(r => r.data),
  })

  const { data: forecastData } = useQuery({
    queryKey: ['sales-forecast'],
    queryFn: () => reportsAPI.getSalesForecast().then(r => r.data),
  })

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Business intelligence across all modules</p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={data?.totalRevenue ? formatCurrency(data.totalRevenue) : '—'} change={data?.revenueGrowth} changeLabel="YoY" icon={DollarSign} color="success" loading={isLoading} />
          <StatCard title="Won Deals" value={data?.wonDeals ?? '—'} change={data?.dealsGrowth} icon={TrendingUp} color="primary" loading={isLoading} />
          <StatCard title="Active Employees" value={data?.employees ?? '—'} icon={Users} color="info" loading={isLoading} />
          <StatCard title="Open Tickets" value={data?.openTickets ?? '—'} change={data?.ticketChange} icon={BarChart3} color="warning" loading={isLoading} />
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            {revenueLoading
              ? <div className="h-[220px] animate-pulse rounded-lg" style={{ background: 'var(--border)' }} />
              : <ChartWidget type="area" title="Revenue Trend" data={revenueData?.data || []} dataKey="revenue" xKey="month" formatter={(v) => formatCurrency(v)} />
            }
          </div>
          <div className="card p-5">
            {revenueLoading
              ? <div className="h-[220px] animate-pulse rounded-lg" style={{ background: 'var(--border)' }} />
              : <ChartWidget type="bar" title="Deals Closed by Month" data={salesData?.data || []} dataKey="deals" xKey="month" />
            }
          </div>
        </div>

        {/* Forecast */}
        <div className="card p-5">
          {revenueLoading
            ? <div className="h-[180px] animate-pulse rounded-lg" style={{ background: 'var(--border)' }} />
            : <ChartWidget type="line" title="Sales Forecast" data={forecastData?.data || []} dataKey="forecast" xKey="month" color="var(--warning)" formatter={(v) => formatCurrency(v)} height={180} />
          }
        </div>

        {/* Pipeline & Lead Source tables */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Pipeline by Stage</h3>
            </div>
            <div className="divide-y">
              {(Array.isArray(data?.pipeline) ? data.pipeline : []).map((stage, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{stage.name}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--border)]">
                      <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${stage.percent}%` }} />
                    </div>
                  </div>
                  <span className="ml-4 text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(stage.value)}</span>
                </div>
              )) || <div className="px-5 py-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>No pipeline data</div>}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Leads by Source</h3>
            </div>
            <div className="divide-y">
              {(Array.isArray(data?.leadSources) ? data.leadSources : []).map((src, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{src.source}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--border)]">
                      <div className="h-full rounded-full" style={{ width: `${src.percent}%`, background: 'var(--success)' }} />
                    </div>
                  </div>
                  <span className="ml-4 text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{src.count}</span>
                </div>
              )) || <div className="px-5 py-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>No source data</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

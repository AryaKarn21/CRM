import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, TrendingUp, DollarSign, Ticket, UserCheck, Package } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'
import { formatCurrency } from '@/lib/utils'
import api from '@/api/axios'

// Queries real API endpoint — no mock data
const useDashboardStats = () => useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: () => api.get('/dashboard/stats').then(r => r.data),
  refetchInterval: 1000 * 60 * 5, // refresh every 5 min
})

const useRecentActivity = () => useQuery({
  queryKey: ['dashboard-activity'],
  queryFn: () => api.get('/dashboard/activity').then(r => r.data),
})

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: activity } = useRecentActivity()

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Welcome back. Here's what's happening today.
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Leads" value={stats?.leads?.total ?? '—'} change={stats?.leads?.change} changeLabel="vs last month" icon={TrendingUp} color="primary" loading={isLoading} />
          <StatCard title="Active Accounts" value={stats?.accounts?.total ?? '—'} change={stats?.accounts?.change} icon={UserCheck} color="success" loading={isLoading} />
          <StatCard title="Pipeline Value" value={stats?.pipeline?.value ? formatCurrency(stats.pipeline.value) : '—'} change={stats?.pipeline?.change} icon={DollarSign} color="warning" loading={isLoading} />
          <StatCard title="Employees" value={stats?.employees?.total ?? '—'} icon={Users} color="info" loading={isLoading} />
          <StatCard title="Open Tickets" value={stats?.tickets?.open ?? '—'} change={stats?.tickets?.change} icon={Ticket} color="danger" loading={isLoading} />
          <StatCard title="Inventory Items" value={stats?.inventory?.total ?? '—'} icon={Package} color="gray" loading={isLoading} />
        </div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity - 2 col */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
            </div>
            <div className="divide-y" style={{ '--tw-divide-opacity': 1 }}>
              {activity?.items?.length ? activity.items.map((item, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-[var(--surface-2)] transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {item.user?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{item.description}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.timeAgo}</p>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Quick actions - 1 col */}
          <div className="card p-5">
            <h3 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Add New Lead', to: '/crm/leads', icon: TrendingUp },
                { label: 'Add Employee', to: '/hr/employees', icon: Users },
                { label: 'Create Project', to: '/projects', icon: Package },
                { label: 'Open Ticket', to: '/support', icon: Ticket },
              ].map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-lg border hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all group" style={{ borderColor: 'var(--border)' }}>
                  <Icon size={15} style={{ color: 'var(--primary)' }} />
                  <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
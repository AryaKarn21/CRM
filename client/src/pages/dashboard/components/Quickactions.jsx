import { Link } from 'react-router-dom'
import { TrendingUp, Users, FolderPlus, LifeBuoy, ChevronRight, Sparkles } from 'lucide-react'

const ACTIONS = [
  { label: 'Add New Lead', desc: 'Capture a new prospect', to: '/crm/leads', icon: TrendingUp },
  { label: 'Add Employee', desc: 'Onboard a team member', to: '/hr/employees', icon: Users },
  { label: 'Create Project', desc: 'Kick off new work', to: '/projects', icon: FolderPlus },
  { label: 'Open Ticket', desc: 'Log a support request', to: '/support', icon: LifeBuoy },
]

export default function QuickActions() {
  return (
    <div className="dash-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={15} style={{ color: 'var(--primary)' }} />
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
      </div>
      <div className="flex flex-col gap-2">
        {ACTIONS.map(({ label, desc, to, icon: Icon }) => (
          <Link key={to} to={to} className="dash-quick-action" style={{ borderColor: 'var(--border)' }}>
            <div className="dash-quick-action-icon">
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
            <ChevronRight size={15} className="dash-quick-action-arrow" />
          </Link>
        ))}
      </div>
    </div>
  )
}
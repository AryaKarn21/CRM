import { useQuery } from '@tanstack/react-query'
import { Shield, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import { rolesAPI } from '@/api/roles.api'

export default function RoleStatCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['roles-stats'],
    queryFn: () => rolesAPI.getStats().then((r) => r.data),
    staleTime: 30_000,
  })

  const cards = [
    { label: 'Total Roles', value: data?.total, icon: Shield, color: 'bg-blue-600' },
    { label: 'Active', value: data?.active, icon: ShieldCheck, color: 'bg-green-600' },
    { label: 'Inactive', value: data?.inactive, icon: ShieldOff, color: 'bg-yellow-500' },
    { label: 'In Trash', value: data?.deleted, icon: Trash2, color: 'bg-red-600' },
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
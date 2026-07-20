import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, CheckCircle2, Circle } from 'lucide-react'
import { settingsAPI } from '@/api/settings.api'
import Badge from '@/components/ui/Badge'
import { PERMISSION_MODULES, summarizeByModule } from './permissionMeta'
import { formatDate } from '@/lib/utils'

export default function PermissionMatrixDrawer({ role, onClose }) {
  const { data: auditData } = useQuery({
    queryKey: ['role-audit', role?.id],
    queryFn: () =>
      settingsAPI
        .getAuditLogs({ resource: 'Role', resourceId: role.id, limit: 10 })
        .then((r) => r.data),
    enabled: !!role,
  })

  useEffect(() => {
    if (!role) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [role, onClose])

  if (!role) return null

  const summary = summarizeByModule(role.permissions)
  const safePermissions =
    role.permissions && typeof role.permissions === 'object' && !Array.isArray(role.permissions)
      ? role.permissions
      : {}

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg h-full overflow-y-auto shadow-xl"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Permission matrix for ${role.name}`}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {role.name}
            </h2>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Permission Matrix
            </p>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm shrink-0" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-8">
          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Module Coverage
            </h3>
            <div className="flex flex-col gap-2">
              {summary.map((m) => {
                const pct = m.total > 0 ? (m.granted / m.total) * 100 : 0
                return (
                  <div key={m.key} className="flex items-center gap-3">
                    <span className="text-[12px] w-20 shrink-0 truncate" style={{ color: 'var(--text-secondary)' }}>
                      {m.title}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: pct > 0 ? 'var(--primary, #4f46e5)' : 'transparent' }}
                      />
                    </div>
                    <span className="text-[11px] w-10 text-right shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {m.granted}/{m.total}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Permissions
            </h3>
            <div className="flex flex-col gap-4">
              {PERMISSION_MODULES.map((mod) => (
                <div key={mod.key}>
                  <p className="text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {mod.title}
                  </p>
                  <div className="flex flex-col gap-1 pl-1">
                    {mod.permissions.map((p) => {
                      const granted = !!safePermissions[p.key]
                      return (
                        <div
                          key={p.key}
                          className="flex items-center gap-2 text-[13px]"
                          style={{ color: granted ? 'var(--text-primary)' : 'var(--text-muted)' }}
                        >
                          {granted ? (
                            <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                          ) : (
                            <Circle size={14} className="shrink-0" style={{ color: 'var(--border)' }} />
                          )}
                          {p.label}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Recent Activity
            </h3>
            {!auditData?.logs?.length ? (
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                No recorded activity for this role yet.
              </p>
            ) : (
              <div className="relative pl-4 flex flex-col gap-4">
                <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: 'var(--border)' }} />
                {auditData.logs.map((log) => (
                  <div key={log.id} className="relative">
                    <div
                      className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full"
                      style={{ background: 'var(--primary, #4f46e5)' }}
                    />
                    <p className="text-[12px]" style={{ color: 'var(--text-primary)' }}>
                      {log.action.replace(/_/g, ' ')}{' '}
                      <span style={{ color: 'var(--text-muted)' }}>by {log.user?.name || 'System'}</span>
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(log.createdAt, 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Status
            </span>
            {role.isDeleted ? (
              <Badge variant="danger" dot>
                Trashed
              </Badge>
            ) : (
              <Badge variant={role.isActive ? 'success' : 'gray'} dot>
                {role.isActive ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
import Badge from '@/components/ui/Badge'
import RoleActionsMenu from './RoleActionsMenu'
import { summarizeByModule } from './permissionMeta'
import { formatDate } from '@/lib/utils'

export default function RoleTable({
  roles,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onEdit,
  onClone,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}) {
  const allSelected = roles.length > 0 && roles.every((r) => selectedIds.includes(r.id))

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr
              className="border-b text-[11px] uppercase tracking-wide"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <th className="p-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded"
                  aria-label="Select all roles"
                />
              </th>
              <th className="p-3">Role</th>
              <th className="p-3">Modules</th>
              <th className="p-3">Users</th>
              <th className="p-3">Status</th>
              <th className="p-3">Last Updated</th>
              <th className="p-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const summary = summarizeByModule(role.permissions).filter((m) => m.granted > 0)
              return (
                <tr
                  key={role.id}
                  className="border-b last:border-0 hover:bg-[var(--surface-2)] transition-colors"
                  style={{ borderColor: 'var(--border)', opacity: role.isDeleted ? 0.6 : 1 }}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded"
                      checked={selectedIds.includes(role.id)}
                      onChange={() => onToggleSelect(role.id)}
                      aria-label={`Select ${role.name}`}
                    />
                  </td>
                  <td className="p-3">
                    <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {role.name}
                    </p>
                    {role.description && (
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {role.description}
                      </p>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {summary.length === 0 ? (
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          —
                        </span>
                      ) : (
                        summary.slice(0, 3).map((m) => (
                          <span
                            key={m.key}
                            className="px-1.5 py-0.5 text-[10px] rounded"
                            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
                          >
                            {m.title}
                          </span>
                        ))
                      )}
                      {summary.length > 3 && (
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          +{summary.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-[13px]">{role.userCount ?? 0}</td>
                  <td className="p-3">
                    {role.isDeleted ? (
                      <Badge variant="danger" dot>
                        Trashed
                      </Badge>
                    ) : (
                      <Badge variant={role.isActive ? 'success' : 'gray'} dot>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    {role.updatedAt ? formatDate(role.updatedAt) : '—'}
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <RoleActionsMenu
                      role={role}
                      onView={() => onView(role)}
                      onEdit={() => onEdit(role)}
                      onClone={() => onClone(role)}
                      onActivate={() => onActivate(role)}
                      onDeactivate={() => onDeactivate(role)}
                      onDelete={() => onDelete(role)}
                      onRestore={() => onRestore(role)}
                      onPermanentDelete={() => onPermanentDelete(role)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default function PermissionGroup({ title, icon, permissions, labels = {}, register, watch, setValue }) {
  const groupValues = permissions.map((key) => watch?.(`permissions.${key}`))
  const allChecked = groupValues.length > 0 && groupValues.every(Boolean)

  const toggleGroup = () => {
    if (!setValue) return
    const next = !allChecked
    permissions.forEach((key) => setValue(`permissions.${key}`, next))
  }

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </div>
        {setValue && (
          <button type="button" onClick={toggleGroup} className="text-[12px] text-blue-600 hover:underline">
            {allChecked ? 'Unselect All' : 'Select All'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {permissions.map((key) => (
          <label
            key={key}
            className="flex items-center gap-2 text-[13px] px-2 py-1.5 rounded-lg cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <input type="checkbox" className="w-4 h-4 rounded" {...register(`permissions.${key}`)} />
            <span>{labels[key] || key}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
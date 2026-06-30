import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { useEffect, useState } from 'react'

export default function FilterBar({ searchPlaceholder, filters = [], values, onChange }) {
  const [localSearch, setLocalSearch] = useState(values.search || '')
  const debouncedSearch = useDebounce(localSearch, 350)

  useEffect(() => {
    onChange('search', debouncedSearch)
  }, [debouncedSearch])

  const hasFilters = filters.some(f => values[f.key])

  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="relative flex-1 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="input pl-8 pr-8"
          placeholder={searchPlaceholder}
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
        />
        {localSearch && (
          <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setLocalSearch('')}>
            <X size={12} style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {filters.map(filter => (
        <select
          key={filter.key}
          className="input w-auto min-w-[120px]"
          value={values[filter.key] || ''}
          onChange={e => onChange(filter.key, e.target.value)}
        >
          <option value="">All {filter.label}s</option>
          {filter.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}

      {hasFilters && (
        <button
          className="btn btn-ghost btn-sm text-[var(--primary)]"
          onClick={() => filters.forEach(f => onChange(f.key, ''))}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, TrendingUp, Users, DollarSign, FolderKanban, Settings } from 'lucide-react'
import { useUIStore } from '@/store/ui.store'
import { cn } from '@/lib/utils'

const COMMANDS = [
  { label: 'Go to Dashboard', to: '/', icon: TrendingUp },
  { label: 'Leads — List View', to: '/crm/leads', icon: TrendingUp },
  { label: 'Leads — Kanban View', to: '/crm/leads/kanban', icon: TrendingUp },
  { label: 'Accounts', to: '/crm/accounts', icon: TrendingUp },
  { label: 'Contacts', to: '/crm/contacts', icon: TrendingUp },
  { label: 'Opportunities Kanban', to: '/crm/opportunities/kanban', icon: TrendingUp },
  { label: 'Employees', to: '/hr/employees', icon: Users },
  { label: 'Attendance Logs', to: '/hr/attendance', icon: Users },
  { label: 'Payroll Runs', to: '/hr/payroll', icon: DollarSign },
  { label: 'Finance Overview', to: '/finance', icon: DollarSign },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export default function CommandPalette() {
  const { closeCommandPalette } = useUIStore()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const filtered = query
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (e) => {
      if (e.key === 'Escape') closeCommandPalette()
      if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, filtered.length - 1))
      if (e.key === 'ArrowUp') setSelected(s => Math.max(s - 1, 0))
      if (e.key === 'Enter' && filtered[selected]) {
        navigate(filtered[selected].to)
        closeCommandPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [filtered, selected])

  useEffect(() => setSelected(0), [query])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={closeCommandPalette}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 py-4 text-[14px] outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
            placeholder="Search pages, actions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={closeCommandPalette} className="btn btn-ghost btn-icon btn-sm">
            <X size={14} />
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
              No results for "{query}"
            </p>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.to + i}
              className={cn('w-full flex items-center gap-3 px-4 py-3 text-[13px] transition-colors text-left', i === selected && 'bg-[var(--primary-light)]')}
              style={{ color: i === selected ? 'var(--primary)' : 'var(--text-primary)' }}
              onMouseEnter={() => setSelected(i)}
              onClick={() => { navigate(cmd.to); closeCommandPalette() }}
            >
              <cmd.icon size={14} />
              {cmd.label}
            </button>
          ))}
        </div>
        <div className="border-t px-4 py-2.5 flex items-center gap-4 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  )
}
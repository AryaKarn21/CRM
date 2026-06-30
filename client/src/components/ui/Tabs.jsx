import { cn } from '@/lib/utils'

export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex items-center border-b" style={{ borderColor: 'var(--border)' }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-4 py-3 text-[13px] font-medium border-b-2 transition-colors -mb-px',
            activeTab === tab.key
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent hover:text-[var(--text-primary)]'
          )}
          style={{ color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn('ml-2 px-1.5 py-0.5 text-[10px] rounded-full font-semibold', activeTab === tab.key ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
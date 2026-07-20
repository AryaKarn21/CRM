import { cn } from '@/lib/utils'

export function Tabs({ tabs, activeTab, onChange }) {
  return (
    // overflow-x-auto => the strip scrolls instead of clipping the last tab.
    // The inline style thins/hides the scrollbar so it doesn't look heavy.
    <div
      className="flex items-center border-b overflow-x-auto"
      style={{ borderColor: 'var(--border)', scrollbarWidth: 'thin' }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            // shrink-0 + whitespace-nowrap => labels never wrap to two lines
            // and buttons never get squeezed.
            'shrink-0 whitespace-nowrap px-4 py-3 text-[13px] font-medium border-b-2 transition-colors -mb-px',
            activeTab === tab.key
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent hover:text-[var(--text-primary)]'
          )}
          style={{ color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'ml-2 px-1.5 py-0.5 text-[10px] rounded-full font-semibold',
                activeTab === tab.key
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--border)] text-[var(--text-muted)]'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
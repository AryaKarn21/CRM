import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import CommandPalette from './CommandPalette'
import { useUIStore } from '@/store/ui.store'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function AppShell() {
  const { sidebarCollapsed, commandPaletteOpen } = useUIStore()
  const isMobile = useIsMobile()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        style={{
          // On mobile the sidebar is an off-canvas drawer (fixed, translated
          // off-screen) rather than a permanent column, so content must not
          // reserve space for it — otherwise everything gets squeezed into
          // a narrow strip exactly like the bug in your screenshot.
          marginLeft: isMobile ? 0 : (sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'),
        }}
      >
        <Topbar />
        <main
          className="flex-1 overflow-y-auto animate-fade-in"
          style={{ paddingTop: 'var(--topbar-height)' }}
        >
          <Outlet />
        </main>
      </div>
      {commandPaletteOpen && <CommandPalette />}
    </div>
  )
}
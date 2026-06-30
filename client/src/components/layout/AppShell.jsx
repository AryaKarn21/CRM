import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import CommandPalette from './CommandPalette'
import { useUIStore } from '@/store/ui.store'

export default function AppShell() {
  const { sidebarCollapsed, commandPaletteOpen } = useUIStore()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
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
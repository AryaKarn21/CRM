import { useState, useEffect } from 'react'

// Must match the breakpoint used in Sidebar.jsx — both files import this
// hook so they can never disagree about whether we're in mobile mode.
export const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}
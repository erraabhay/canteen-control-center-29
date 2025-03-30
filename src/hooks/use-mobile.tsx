
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initialize with the current window width when available
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    // Skip if SSR
    if (typeof window === 'undefined') return
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Set initial value
    handleResize()
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

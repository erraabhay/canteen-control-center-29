
import * as React from "react";

// Standard mobile breakpoint for consistency across the app
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initialize with the current window width when available
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false;
  });

  React.useEffect(() => {
    // Skip if SSR
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Add event listener with better debouncing for performance
    let timeoutId: number | null = null;
    const debouncedResize = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', debouncedResize);
    
    // Set initial value
    handleResize();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return isMobile;
}

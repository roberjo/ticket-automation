/**
 * Mobile Detection Hook
 * 
 * This custom React hook provides mobile device detection functionality
 * by monitoring screen width and media query changes. It helps components
 * adapt their behavior and layout based on the device type.
 * 
 * Purpose:
 * - Detect if the current device is mobile based on screen width
 * - Provide responsive behavior for components
 * - Enable conditional rendering based on device type
 * - Support responsive design patterns
 * 
 * Features:
 * - Real-time screen width monitoring
 * - Media query change detection
 * - Automatic cleanup of event listeners
 * - SSR-safe implementation with undefined initial state
 * 
 * Usage:
 * - Responsive navigation components
 * - Mobile-specific UI adaptations
 * - Conditional feature availability
 * - Layout adjustments for different screen sizes
 */

import * as React from "react"

// Mobile breakpoint in pixels - screens smaller than this are considered mobile
const MOBILE_BREAKPOINT = 768

/**
 * useIsMobile Hook
 * 
 * A custom React hook that detects if the current device is mobile
 * based on screen width. The hook monitors window resize events and
 * media query changes to provide real-time mobile detection.
 * 
 * Logic Flow:
 * 1. Initialize state as undefined (SSR-safe)
 * 2. Set up media query listener for screen width changes
 * 3. Check initial screen width and set mobile state
 * 4. Update state when media query changes
 * 5. Clean up event listener on unmount
 * 
 * @returns boolean - True if device is mobile (screen width < 768px), false otherwise
 * 
 * Expected Behavior:
 * - Returns true for screens smaller than 768px
 * - Returns false for screens 768px and larger
 * - Updates automatically when window is resized
 * - Handles SSR gracefully with undefined initial state
 * 
 * Usage Example:
 * ```tsx
 * function MyComponent() {
 *   const isMobile = useIsMobile()
 *   
 *   return (
 *     <div>
 *       {isMobile ? <MobileLayout /> : <DesktopLayout />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useIsMobile() {
  // Initialize state as undefined for SSR safety
  // This prevents hydration mismatches between server and client
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Create media query listener for mobile breakpoint
    // Uses max-width to detect screens smaller than the breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Event handler for media query changes
    const onChange = () => {
      // Update mobile state based on current window width
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listener for media query changes
    mql.addEventListener("change", onChange)
    
    // Set initial mobile state based on current window width
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup function to remove event listener on unmount
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return boolean value, converting undefined to false for SSR safety
  return !!isMobile
}

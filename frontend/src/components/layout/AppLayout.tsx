/**
 * Application Layout Component
 * 
 * This component provides the main layout structure for the application.
 * It handles authentication state, renders the sidebar, header, and main content area,
 * and provides a consistent layout across all pages.
 * 
 * Purpose:
 * - Provide consistent application layout structure
 * - Handle authentication state and loading states
 * - Manage sidebar and header components
 * - Ensure proper responsive layout
 * - Provide main content area for page components
 * 
 * Features:
 * - Authentication state checking
 * - Loading state for unauthenticated users
 * - Responsive sidebar and header layout
 * - Main content area with proper spacing
 * - MobX observer for reactive updates
 * 
 * Layout Structure:
 * - Sidebar: Navigation and user controls
 * - Header: Top navigation and user information
 * - Main Content: Page-specific content area
 * - Loading State: For unauthenticated users
 */

import React from 'react';
import { observer } from 'mobx-react-lite';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { authStore } from '@/stores/AuthStore';

/**
 * AppLayout Props Interface
 * 
 * Defines the props accepted by the AppLayout component.
 */
interface AppLayoutProps {
  children: React.ReactNode; // Page content to be rendered in the main area
}

/**
 * AppLayout Component
 * 
 * Main layout component that provides the application structure.
 * Uses MobX observer to reactively update based on authentication state changes.
 * 
 * Logic Flow:
 * 1. Check if user is authenticated
 * 2. If not authenticated: Show loading state
 * 3. If authenticated: Render full layout with sidebar, header, and content
 * 
 * @param children - React components to render in the main content area
 * @returns JSX.Element - Complete application layout or loading state
 * 
 * Expected Behavior:
 * - Shows loading state for unauthenticated users
 * - Renders full layout for authenticated users
 * - Provides responsive sidebar and header
 * - Maintains consistent layout across all pages
 */
export const AppLayout: React.FC<AppLayoutProps> = observer(({ children }) => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Render loading state for unauthenticated users
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
        <div className="text-center space-y-4">
          {/* Application title with gradient styling */}
          <h1 className="text-4xl font-bold gradient-text">ServiceNow Automation</h1>
          {/* Loading message */}
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  // Render full application layout for authenticated users
  return (
    // SidebarProvider: Provides context for sidebar state management
    <SidebarProvider>
      {/* Main container with full height and background */}
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar: Navigation and user controls */}
        <AppSidebar />
        
        {/* Main content area with header and page content */}
        <div className="flex flex-col flex-1">
          {/* Header: Top navigation and user information */}
          <AppHeader />
          
          {/* Main content area: Page-specific content with padding and scrolling */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
});

// Set display name for debugging and development tools
AppLayout.displayName = 'AppLayout';
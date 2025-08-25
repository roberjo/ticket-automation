/**
 * Application Header Component
 * 
 * This component provides the top navigation bar for the application.
 * It displays user information, navigation controls, demo mode toggle,
 * user impersonation controls, and user menu functionality.
 * 
 * Purpose:
 * - Provide top-level navigation and user controls
 * - Display user information and status indicators
 * - Enable demo mode and user impersonation controls
 * - Provide access to user settings and logout functionality
 * - Show application branding and status badges
 * 
 * Features:
 * - User avatar and profile information
 * - Demo mode toggle with visual indicators
 * - User impersonation controls for admins
 * - Notification system with badge
 * - Responsive design with mobile sidebar trigger
 * - User dropdown menu with profile options
 * 
 * Components:
 * - Application branding and title
 * - Demo mode and impersonation badges
 * - Demo mode toggle button
 * - User impersonation component (admin only)
 * - Notification button with badge
 * - User dropdown menu with profile options
 */

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Bell, Settings, User, LogOut, Eye, EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { authStore } from '@/stores/AuthStore';
import { UserImpersonation } from '../demo/UserImpersonation';

/**
 * AppHeader Component
 * 
 * Main header component that provides top navigation and user controls.
 * Uses MobX observer to reactively update based on authentication state changes.
 * 
 * Logic Flow:
 * 1. Extract user and authentication state from authStore
 * 2. Generate user initials for avatar display
 * 3. Render header with navigation and user controls
 * 4. Show appropriate controls based on user role and state
 * 
 * @returns JSX.Element - Complete header with navigation and user controls
 * 
 * Expected Behavior:
 * - Displays user information and status
 * - Provides demo mode and impersonation controls
 * - Shows notification system
 * - Enables user profile and logout functionality
 * - Responsive design for mobile and desktop
 */
export const AppHeader: React.FC = observer(() => {
  // Extract authentication state and user information from store
  const { activeUser, currentUser, isImpersonating, isDemoMode, toggleDemoMode, stopImpersonation } = authStore;

  // Return null if no active user (should not happen in normal flow)
  if (!activeUser) return null;

  // Generate user initials from name for avatar display
  const userInitials = activeUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    // Header container with border, background, and shadow
    <header className="h-16 border-b border-border bg-card shadow-sm">
      {/* Header content container with flex layout */}
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side: Sidebar trigger, branding, and status badges */}
        <div className="flex items-center gap-4">
          {/* Mobile sidebar trigger - only visible on large screens and below */}
          <SidebarTrigger className="lg:hidden" />
          
          {/* Branding and status indicators */}
          <div className="flex items-center gap-3">
            {/* Application title with gradient styling */}
            <h1 className="text-xl font-semibold gradient-text">ServiceNow Automation</h1>
            
            {/* Demo mode badge - shows when demo mode is active */}
            {isDemoMode && (
              <Badge variant="secondary" className="text-xs">
                Demo Mode
              </Badge>
            )}
            
            {/* Impersonation badge - shows when admin is impersonating another user */}
            {isImpersonating && (
              <Badge variant="destructive" className="text-xs">
                Impersonating: {activeUser.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Right side: User controls and menu */}
        <div className="flex items-center gap-4">
          {/* Demo Mode Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDemoMode}
            className="gap-2"
          >
            {/* Toggle icon based on demo mode state */}
            {isDemoMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {/* Toggle text based on demo mode state */}
            {isDemoMode ? 'Exit Demo' : 'Demo Mode'}
          </Button>

          {/* User Impersonation Component - only for admin users */}
          {currentUser?.role === 'admin' && <UserImpersonation />}

          {/* Notifications Button with Badge */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {/* Notification count badge */}
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
              3
            </Badge>
          </Button>

          {/* User Dropdown Menu */}
          <DropdownMenu>
            {/* Dropdown trigger with user avatar and information */}
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 p-2">
                {/* User avatar with initials fallback */}
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {/* User information - hidden on mobile */}
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">{activeUser.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {activeUser.role.replace('_', ' ')}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            {/* Dropdown menu content */}
            <DropdownMenuContent align="end" className="w-56">
              {/* User profile information */}
              <DropdownMenuLabel>
                <div>
                  <div className="font-medium">{activeUser.name}</div>
                  <div className="text-sm text-muted-foreground">{activeUser.email}</div>
                  <div className="text-xs text-muted-foreground capitalize mt-1">
                    {activeUser.department} • {activeUser.role.replace('_', ' ')}
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              {/* Profile menu item */}
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              
              {/* Settings menu item */}
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              
              {/* Stop impersonation option - only shown when impersonating */}
              {isImpersonating && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={stopImpersonation}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Stop Impersonation
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              
              {/* Logout menu item */}
              <DropdownMenuItem onClick={() => authStore.logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
});

// Set display name for debugging and development tools
AppHeader.displayName = 'AppHeader';
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

export const AppHeader: React.FC = observer(() => {
  const { activeUser, currentUser, isImpersonating, isDemoMode, toggleDemoMode, stopImpersonation } = authStore;

  if (!activeUser) return null;

  const userInitials = activeUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 border-b border-border bg-card shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold gradient-text">ServiceNow Automation</h1>
            
            {isDemoMode && (
              <Badge variant="secondary" className="text-xs">
                Demo Mode
              </Badge>
            )}
            
            {isImpersonating && (
              <Badge variant="destructive" className="text-xs">
                Impersonating: {activeUser.name}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Demo Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDemoMode}
            className="gap-2"
          >
            {isDemoMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isDemoMode ? 'Exit Demo' : 'Demo Mode'}
          </Button>

          {/* User Impersonation */}
          {currentUser?.role === 'admin' && <UserImpersonation />}

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">{activeUser.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {activeUser.role.replace('_', ' ')}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
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
              
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              
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

AppHeader.displayName = 'AppHeader';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { UserCheck, Users } from 'lucide-react';
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
import { authStore } from '@/stores/AuthStore';

export const UserImpersonation: React.FC = observer(() => {
  const { demoUsers, impersonateUser, canImpersonate, isImpersonating } = authStore;

  if (!canImpersonate && !isImpersonating) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          Impersonate User
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Demo Users
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {demoUsers.map(({ user, scenarios }) => {
          const userInitials = user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();

          return (
            <DropdownMenuItem
              key={user.id}
              onClick={() => impersonateUser(user)}
              className="p-4 cursor-pointer"
            >
              <div className="flex items-start gap-3 w-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm">{user.name}</div>
                    <Badge 
                      variant={user.role === 'admin' ? 'destructive' : 'secondary'} 
                      className="text-xs"
                    >
                      {user.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {user.email}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {user.department}
                  </div>
                  
                  {scenarios.length > 0 && (
                    <div className="text-xs text-primary mt-2">
                      Demo: {scenarios[0].title}
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

UserImpersonation.displayName = 'UserImpersonation';
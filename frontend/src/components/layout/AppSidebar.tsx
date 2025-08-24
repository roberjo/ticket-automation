import React from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation, Link } from 'react-router-dom';
import {
  BarChart3,
  CheckSquare,
  Ticket,
  FileText,
  Users,
  Settings,
  FolderKanban,
  TrendingUp
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { authStore } from '@/stores/AuthStore';

const getNavigationItems = (role: string) => {
  const baseItems = [
    {
      title: 'Dashboard',
      url: '/',
      icon: BarChart3,
      roles: ['admin', 'manager', 'user', 'servicenow_admin']
    },
    {
      title: 'Tasks',
      url: '/tasks',
      icon: CheckSquare,
      roles: ['admin', 'manager', 'user', 'servicenow_admin']
    },
    {
      title: 'Tickets',
      url: '/tickets',
      icon: Ticket,
      roles: ['admin', 'manager', 'servicenow_admin']
    }
  ];

  const adminItems = [
    {
      title: 'Templates',
      url: '/templates',
      icon: FileText,
      roles: ['admin', 'servicenow_admin']
    },
    {
      title: 'Users',
      url: '/users',
      icon: Users,
      roles: ['admin']
    },
    {
      title: 'Reports',
      url: '/reports',
      icon: TrendingUp,
      roles: ['admin', 'manager']
    }
  ];

  const managerItems = [
    {
      title: 'Team Management',
      url: '/team',
      icon: FolderKanban,
      roles: ['manager']
    }
  ];

  const allItems = [...baseItems, ...adminItems, ...managerItems];
  return allItems.filter(item => item.roles.includes(role));
};

export const AppSidebar: React.FC = observer(() => {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { activeUser } = authStore;

  if (!activeUser) return null;

  const navigationItems = getNavigationItems(activeUser.role);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar
      className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar text-sidebar-foreground">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <div className="font-semibold text-sidebar-foreground">TaskFlow</div>
                <div className="text-xs text-sidebar-accent-foreground">ServiceNow Automation</div>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-accent-foreground">
            {!collapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`${isActive(item.url) ? 'nav-item active' : 'nav-item'} w-full justify-start`}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="nav-item w-full justify-start">
                  <Link to="/settings" className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    {!collapsed && <span>Settings</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="p-4 mt-auto">
            <div className="text-xs text-sidebar-accent-foreground">
              Version 1.0.0
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
});

AppSidebar.displayName = 'AppSidebar';
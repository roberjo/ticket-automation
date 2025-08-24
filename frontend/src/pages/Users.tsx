import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Plus, Search, UserCheck, UserX, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { authStore } from '@/stores/AuthStore';
import { User } from '@/types';

const UserCard: React.FC<{ user: User }> = ({ user }) => {
  const userInitials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'status-error';
      case 'manager': return 'status-warning';
      case 'servicenow_admin': return 'status-info';
      case 'user': return 'status-success';
      default: return 'status-info';
    }
  };

  return (
    <Card className="card-enterprise hover-scale">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{user.name}</CardTitle>
              {user.isActive ? (
                <UserCheck className="h-4 w-4 text-success" />
              ) : (
                <UserX className="h-4 w-4 text-destructive" />
              )}
            </div>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getRoleBadgeClass(user.role)}>
            {user.role.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge variant="outline">
            {user.department}
          </Badge>
          <Badge variant={user.isActive ? 'default' : 'secondary'}>
            {user.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <div>Department: <span className="font-medium">{user.department}</span></div>
          <div>Created: <span className="font-medium">{user.createdAt.toLocaleDateString()}</span></div>
          {user.lastLogin && (
            <div>Last Login: <span className="font-medium">{user.lastLogin.toLocaleDateString()}</span></div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            ID: {user.id}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Edit className="h-3 w-3" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => authStore.impersonateUser(user)}
              disabled={!authStore.canImpersonate}
            >
              Impersonate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Users: React.FC = observer(() => {
  const { activeUser, demoUsers } = authStore;
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  if (!activeUser || activeUser.role !== 'admin') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="card-enterprise">
          <CardContent className="p-8 text-center">
            <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You need administrator privileges to access user management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allUsers = demoUsers.map(du => du.user);

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const getQuickStats = () => {
    return {
      total: allUsers.length,
      active: allUsers.filter(u => u.isActive).length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      managers: allUsers.filter(u => u.role === 'manager').length,
      users: allUsers.filter(u => u.role === 'user').length
    };
  };

  const stats = getQuickStats();
  const departments = Array.from(new Set(allUsers.map(u => u.department)));
  const roles = Array.from(new Set(allUsers.map(u => u.role)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button className="btn-enterprise gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">{stats.admins}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">{stats.managers}</div>
            <div className="text-sm text-muted-foreground">Managers</div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-info">{stats.users}</div>
            <div className="text-sm text-muted-foreground">Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="card-enterprise">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <UserCard key={user.id} user={user} />
          ))
        ) : (
          <div className="col-span-full">
            <Card className="card-enterprise">
              <CardContent className="p-8 text-center">
                <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
});

export default Users;
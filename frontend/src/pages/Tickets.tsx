import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Search, Filter, ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { authStore } from '@/stores/AuthStore';
import { taskStore } from '@/stores/TaskStore';
import { ServiceNowTicket } from '@/types';

const TicketCard: React.FC<{ ticket: ServiceNowTicket }> = ({ ticket }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed': 
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in_progress': 
        return <Clock className="h-4 w-4 text-info" />;
      case 'new':
      case 'pending': 
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default: 
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'status-success';
      case 'in_progress':
        return 'status-info';
      case 'new':
      case 'pending':
        return 'status-warning';
      case 'cancelled':
        return 'status-error';
      default:
        return 'status-info';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'critical': return 'status-error';
      case 'high': return 'status-warning';
      case 'medium': return 'status-info';
      case 'low': return 'status-success';
      default: return 'status-info';
    }
  };

  const relatedTask = taskStore.tasks.find(t => t.id === ticket.taskId);

  return (
    <Card className="card-enterprise hover-scale">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{ticket.ticketNumber}</CardTitle>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-base font-normal">{ticket.title}</CardTitle>
            <CardDescription className="mt-1">
              {ticket.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(ticket.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getStatusBadgeClass(ticket.status)}>
            {ticket.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getPriorityBadgeClass(ticket.priority)}>
            {ticket.priority.toUpperCase()}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <div>Assignment Group: <span className="font-medium">{ticket.assignmentGroup}</span></div>
          {ticket.assignee && (
            <div>Assignee: <span className="font-medium">{ticket.assignee}</span></div>
          )}
          <div>Duration: <span className="font-medium">{ticket.durationDays} days</span></div>
          <div>Created: <span className="font-medium">{ticket.createdAt.toLocaleDateString()}</span></div>
          <div>Updated: <span className="font-medium">{ticket.updatedAt.toLocaleDateString()}</span></div>
        </div>

        {relatedTask && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Related Task: <span className="font-medium text-primary">{relatedTask.title}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            ID: {ticket.id}
          </span>
          <Button variant="outline" size="sm">
            View in ServiceNow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const Tickets: React.FC = observer(() => {
  const { activeUser } = authStore;
  const { tickets, tasks } = taskStore;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignmentGroupFilter, setAssignmentGroupFilter] = useState('all');

  if (!activeUser) return null;

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesAssignmentGroup = assignmentGroupFilter === 'all' || 
                                  ticket.assignmentGroup === assignmentGroupFilter;
    
    // Role-based filtering
    if (activeUser.role === 'user') {
      const relatedTask = tasks.find(t => t.id === ticket.taskId);
      return relatedTask?.requestorId === activeUser.id && matchesSearch && matchesStatus && matchesAssignmentGroup;
    }
    
    return matchesSearch && matchesStatus && matchesAssignmentGroup;
  });

  const getQuickStats = () => {
    const userTickets = activeUser.role === 'user' 
      ? tickets.filter(ticket => {
          const relatedTask = tasks.find(t => t.id === ticket.taskId);
          return relatedTask?.requestorId === activeUser.id;
        })
      : tickets;
    
    return {
      total: userTickets.length,
      new: userTickets.filter(t => t.status === 'new').length,
      inProgress: userTickets.filter(t => t.status === 'in_progress').length,
      resolved: userTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
      avgDuration: userTickets.length > 0 
        ? Math.round(userTickets.reduce((sum, t) => sum + t.durationDays, 0) / userTickets.length * 10) / 10
        : 0
    };
  };

  const stats = getQuickStats();
  
  const assignmentGroups = Array.from(new Set(tickets.map(t => t.assignmentGroup)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">ServiceNow Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage ServiceNow tickets created from task automation
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tickets</div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">{stats.new}</div>
            <div className="text-sm text-muted-foreground">New</div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-info">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{stats.resolved}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.avgDuration}</div>
            <div className="text-sm text-muted-foreground">Avg Duration (days)</div>
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
                placeholder="Search tickets by number, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <select
              value={assignmentGroupFilter}
              onChange={(e) => setAssignmentGroupFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
            >
              <option value="all">All Groups</option>
              {assignmentGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        ) : (
          <div className="col-span-full">
            <Card className="card-enterprise">
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || assignmentGroupFilter !== 'all'
                    ? 'Try adjusting your search or filters' 
                    : 'Tickets will appear here when tasks create ServiceNow tickets'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
});

export default Tickets;
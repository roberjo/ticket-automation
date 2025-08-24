import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Plus, Search, Filter, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authStore } from '@/stores/AuthStore';
import { taskStore } from '@/stores/TaskStore';
import { Task } from '@/types';

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-info" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'status-success';
      case 'in_progress': return 'status-info';
      case 'pending': return 'status-warning';
      case 'rejected': return 'status-error';
      default: return 'status-info';
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

  return (
    <Card className="card-enterprise hover-scale">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription className="mt-1">
              {task.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getStatusBadgeClass(task.status)}>
            {task.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getPriorityBadgeClass(task.priority)}>
            {task.priority.toUpperCase()}
          </Badge>
          <Badge variant="outline">
            {task.type.toUpperCase()}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <div>Requested by: <span className="font-medium">{task.requestor.name}</span></div>
          <div>Department: <span className="font-medium">{task.department}</span></div>
          <div>Created: <span className="font-medium">{task.createdAt.toLocaleDateString()}</span></div>
          {task.dueDate && (
            <div>Due: <span className="font-medium">{task.dueDate.toLocaleDateString()}</span></div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            ID: {task.id}
          </span>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CreateTaskDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium' as const,
    department: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { activeUser } = authStore;
    if (!activeUser) return;

    taskStore.createTask({
      ...formData,
      requestorId: activeUser.id,
      requestor: activeUser,
      department: formData.department || activeUser.department
    });

    onClose();
    setFormData({
      title: '',
      description: '',
      type: 'general',
      priority: 'medium',
      department: ''
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
          <CardDescription>
            Submit a new task request for processing
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what needs to be done"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="general">General</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="application">Application</option>
                  <option value="security">Security</option>
                  <option value="access">Access Request</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="btn-enterprise flex-1">
                Create Task
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export const Tasks: React.FC = observer(() => {
  const { activeUser } = authStore;
  const { tasks } = taskStore;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (!activeUser) return null;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    // Role-based filtering
    if (activeUser.role === 'user') {
      return task.requestorId === activeUser.id && matchesSearch && matchesStatus;
    }
    
    return matchesSearch && matchesStatus;
  });

  const getQuickStats = () => {
    const userTasks = activeUser.role === 'user' 
      ? tasks.filter(t => t.requestorId === activeUser.id)
      : tasks;
    
    return {
      total: userTasks.length,
      pending: userTasks.filter(t => t.status === 'pending').length,
      inProgress: userTasks.filter(t => t.status === 'in_progress').length,
      completed: userTasks.filter(t => t.status === 'completed').length
    };
  };

  const stats = getQuickStats();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Task Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, track, and manage your ServiceNow automation tasks
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="btn-enterprise gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
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
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="card-enterprise">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
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
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="col-span-full">
            <Card className="card-enterprise">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Create your first task to get started'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button onClick={() => setShowCreateDialog(true)} className="btn-enterprise">
                    Create First Task
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
      />
    </div>
  );
});

export default Tasks;
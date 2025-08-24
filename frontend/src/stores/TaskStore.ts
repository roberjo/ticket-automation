import { makeAutoObservable } from 'mobx';
import { Task, ServiceNowTicket, TaskTemplate, DashboardMetrics } from '../types';

export class TaskStore {
  tasks: Task[] = [];
  templates: TaskTemplate[] = [];
  tickets: ServiceNowTicket[] = [];
  metrics: DashboardMetrics = {
    taskCompletionRate: 0,
    avgTaskDuration: 0,
    avgTicketDuration: 0,
    avgCycleTime: 0,
    totalTasks: 0,
    totalTickets: 0,
    pendingApprovals: 0,
    overdueTasks: 0
  };

  constructor() {
    makeAutoObservable(this);
    this.loadDemoData();
  }

  loadDemoData() {
    // Generate demo tasks
    this.tasks = [
      {
        id: 't1',
        title: 'New Employee Infrastructure Setup',
        description: 'Setup infrastructure for new developer - VM, network access, security clearance',
        type: 'infrastructure',
        status: 'completed',
        priority: 'high',
        requestorId: '1',
        requestor: {
          id: '1',
          email: 'john.manager@company.com',
          name: 'John Smith',
          role: 'manager',
          department: 'Infrastructure',
          isActive: true,
          createdAt: new Date('2024-01-15')
        },
        department: 'Infrastructure',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-05'),
        formData: {
          employeeName: 'Alice Cooper',
          startDate: '2024-03-15',
          department: 'Development',
          accessLevel: 'Standard Developer'
        }
      },
      {
        id: 't2',
        title: 'Application Access Request',
        description: 'Request access to development tools and production monitoring',
        type: 'application',
        status: 'in_progress',
        priority: 'medium',
        requestorId: '3',
        requestor: {
          id: '3',
          email: 'mike.user@company.com',
          name: 'Mike Davis',
          role: 'user',
          department: 'Development',
          isActive: true,
          createdAt: new Date('2024-02-01')
        },
        department: 'Development',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-12'),
        formData: {
          applications: ['Jenkins', 'SonarQube', 'Grafana'],
          justification: 'New team member needs development environment access'
        }
      },
      {
        id: 't3',
        title: 'Security Review Request',
        description: 'Security review for new API endpoints',
        type: 'security',
        status: 'pending',
        priority: 'high',
        requestorId: '3',
        requestor: {
          id: '3',
          email: 'mike.user@company.com',
          name: 'Mike Davis',
          role: 'user',
          department: 'Development',
          isActive: true,
          createdAt: new Date('2024-02-01')
        },
        department: 'Security',
        dueDate: new Date('2024-03-25'),
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        formData: {
          apiEndpoints: ['/api/users', '/api/orders'],
          securityLevel: 'High'
        }
      }
    ];

    // Generate demo tickets
    this.tickets = [
      {
        id: 'sn1',
        ticketNumber: 'INC0001234',
        title: 'VM Provisioning Request',
        description: 'Provision virtual machine for new developer',
        status: 'resolved',
        priority: 'high',
        assignmentGroup: 'Infrastructure Team',
        assignee: 'Infrastructure Admin',
        taskId: 't1',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-03'),
        durationDays: 2
      },
      {
        id: 'sn2',
        ticketNumber: 'INC0001235',
        title: 'Network Access Configuration',
        description: 'Configure network access for new employee',
        status: 'resolved',
        priority: 'high',
        assignmentGroup: 'Network Team',
        assignee: 'Network Admin',
        taskId: 't1',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-04'),
        durationDays: 3
      },
      {
        id: 'sn3',
        ticketNumber: 'INC0001236',
        title: 'Security Clearance Processing',
        description: 'Process security clearance for new employee',
        status: 'resolved',
        priority: 'medium',
        assignmentGroup: 'Security Team',
        assignee: 'Security Admin',
        taskId: 't1',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-05'),
        durationDays: 4
      },
      {
        id: 'sn4',
        ticketNumber: 'INC0001237',
        title: 'Jenkins Access Request',
        description: 'Provide Jenkins access for development team member',
        status: 'in_progress',
        priority: 'medium',
        assignmentGroup: 'DevOps Team',
        assignee: 'DevOps Admin',
        taskId: 't2',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-12'),
        durationDays: 2
      },
      {
        id: 'sn5',
        ticketNumber: 'INC0001238',
        title: 'Monitoring Access Setup',
        description: 'Setup monitoring dashboard access',
        status: 'in_progress',
        priority: 'low',
        assignmentGroup: 'Monitoring Team',
        assignee: 'Monitoring Admin',
        taskId: 't2',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-12'),
        durationDays: 2
      }
    ];

    this.calculateMetrics();
  }

  calculateMetrics() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = this.tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = this.tasks.filter(t => 
      t.dueDate && new Date() > t.dueDate && t.status !== 'completed'
    ).length;

    const totalTickets = this.tickets.length;
    const avgTicketDuration = this.tickets.reduce((sum, ticket) => sum + ticket.durationDays, 0) / totalTickets;

    // Calculate average task duration (completed tasks only)
    const completedTasksWithDuration = this.tasks.filter(t => t.status === 'completed');
    const avgTaskDuration = completedTasksWithDuration.reduce((sum, task) => {
      const duration = (task.updatedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return sum + duration;
    }, 0) / completedTasksWithDuration.length;

    // Calculate cycle time (from task creation to all tickets closed)
    const avgCycleTime = completedTasksWithDuration.reduce((sum, task) => {
      const taskTickets = this.tickets.filter(t => t.taskId === task.id);
      if (taskTickets.length === 0) return sum;
      const maxTicketDuration = Math.max(...taskTickets.map(t => t.durationDays));
      return sum + maxTicketDuration;
    }, 0) / completedTasksWithDuration.length;

    this.metrics = {
      taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      avgTaskDuration: Math.round(avgTaskDuration * 10) / 10,
      avgTicketDuration: Math.round(avgTicketDuration * 10) / 10,
      avgCycleTime: Math.round(avgCycleTime * 10) / 10,
      totalTasks,
      totalTickets,
      pendingApprovals: pendingTasks,
      overdueTasks
    };
  }

  createTask(taskData: Partial<Task>): Task {
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: taskData.title || '',
      description: taskData.description || '',
      type: taskData.type || 'general',
      status: 'pending',
      priority: taskData.priority || 'medium',
      requestorId: taskData.requestorId || '',
      requestor: taskData.requestor!,
      department: taskData.department || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      formData: taskData.formData || {}
    };

    this.tasks.push(newTask);
    this.calculateMetrics();
    return newTask;
  }

  updateTaskStatus(taskId: string, status: Task['status']) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
      this.calculateMetrics();
    }
  }

  getTasksByUser(userId: string): Task[] {
    return this.tasks.filter(t => t.requestorId === userId);
  }

  getTasksByDepartment(department: string): Task[] {
    return this.tasks.filter(t => t.department === department);
  }

  getPendingApprovals(): Task[] {
    return this.tasks.filter(t => t.status === 'pending');
  }

  getTicketsByTask(taskId: string): ServiceNowTicket[] {
    return this.tickets.filter(t => t.taskId === taskId);
  }
}

export const taskStore = new TaskStore();
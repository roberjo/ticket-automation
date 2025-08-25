/**
 * Task Management Store
 * 
 * This MobX store manages task data, ServiceNow tickets, and dashboard metrics.
 * It provides centralized task management functionality including task creation,
 * status updates, metrics calculation, and ServiceNow ticket integration.
 * 
 * Purpose:
 * - Manage task lifecycle and status tracking
 * - Handle ServiceNow ticket creation and management
 * - Calculate and maintain dashboard metrics
 * - Provide task filtering and querying capabilities
 * - Support demo data for development and testing
 * 
 * State Management:
 * - tasks: Array of all tasks in the system
 * - templates: Task templates for quick creation
 * - tickets: ServiceNow tickets associated with tasks
 * - metrics: Calculated dashboard metrics and KPIs
 * 
 * Key Features:
 * - Task creation and status management
 * - ServiceNow ticket integration
 * - Real-time metrics calculation
 * - Task filtering by user, department, and status
 * - Demo data generation for development
 */

import { makeAutoObservable } from 'mobx';
import { Task, ServiceNowTicket, TaskTemplate, DashboardMetrics } from '../types';

export class TaskStore {
  // Array of all tasks in the system
  tasks: Task[] = [];
  
  // Task templates for quick task creation
  templates: TaskTemplate[] = [];
  
  // ServiceNow tickets associated with tasks
  tickets: ServiceNowTicket[] = [];
  
  // Calculated dashboard metrics and KPIs
  metrics: DashboardMetrics = {
    taskCompletionRate: 0,      // Percentage of completed tasks
    avgTaskDuration: 0,         // Average task duration in days
    avgTicketDuration: 0,       // Average ServiceNow ticket duration
    avgCycleTime: 0,            // Average cycle time from task to completion
    totalTasks: 0,              // Total number of tasks
    totalTickets: 0,            // Total number of ServiceNow tickets
    pendingApprovals: 0,        // Number of tasks awaiting approval
    overdueTasks: 0             // Number of overdue tasks
  };

  /**
   * Constructor
   * 
   * Initializes the MobX store with auto-observable properties and loads
   * demo data for development and testing purposes.
   */
  constructor() {
    // Make all properties observable for reactive updates
    makeAutoObservable(this);
    
    // Load demo data for development and testing
    this.loadDemoData();
  }

  /**
   * Load Demo Data Method
   * 
   * Generates sample tasks and ServiceNow tickets for demonstration purposes.
   * This provides realistic data for testing the application's functionality
   * without requiring a backend connection.
   * 
   * Expected Result:
   * - tasks array is populated with sample tasks
   * - tickets array is populated with sample ServiceNow tickets
   * - metrics are calculated based on the demo data
   */
  loadDemoData() {
    // Generate demo tasks with realistic scenarios
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

    // Generate demo ServiceNow tickets associated with tasks
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

    // Calculate metrics based on the loaded demo data
    this.calculateMetrics();
  }

  /**
   * Calculate Metrics Method
   * 
   * Calculates dashboard metrics and KPIs based on current task and ticket data.
   * This method is called whenever task or ticket data changes to ensure
   * metrics are always up-to-date.
   * 
   * Metrics Calculated:
   * - Task completion rate (percentage of completed tasks)
   * - Average task duration (for completed tasks)
   * - Average ServiceNow ticket duration
   * - Average cycle time (from task creation to completion)
   * - Total counts for tasks and tickets
   * - Pending approvals and overdue tasks
   * 
   * Expected Result:
   * - metrics object is updated with calculated values
   */
  calculateMetrics() {
    // Calculate basic task statistics
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = this.tasks.filter(t => t.status === 'pending').length;
    
    // Calculate overdue tasks (tasks with due dates that have passed)
    const overdueTasks = this.tasks.filter(t => 
      t.dueDate && new Date() > t.dueDate && t.status !== 'completed'
    ).length;

    // Calculate ticket statistics
    const totalTickets = this.tickets.length;
    const avgTicketDuration = this.tickets.reduce((sum, ticket) => sum + ticket.durationDays, 0) / totalTickets;

    // Calculate average task duration (completed tasks only)
    const completedTasksWithDuration = this.tasks.filter(t => t.status === 'completed');
    const avgTaskDuration = completedTasksWithDuration.reduce((sum, task) => {
      // Calculate duration in days between creation and completion
      const duration = (task.updatedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return sum + duration;
    }, 0) / completedTasksWithDuration.length;

    // Calculate cycle time (from task creation to all tickets closed)
    const avgCycleTime = completedTasksWithDuration.reduce((sum, task) => {
      // Find all tickets associated with this task
      const taskTickets = this.tickets.filter(t => t.taskId === task.id);
      if (taskTickets.length === 0) return sum;
      
      // Use the longest ticket duration as the cycle time for this task
      const maxTicketDuration = Math.max(...taskTickets.map(t => t.durationDays));
      return sum + maxTicketDuration;
    }, 0) / completedTasksWithDuration.length;

    // Update metrics with calculated values
    this.metrics = {
      taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      avgTaskDuration: Math.round(avgTaskDuration * 10) / 10, // Round to 1 decimal place
      avgTicketDuration: Math.round(avgTicketDuration * 10) / 10, // Round to 1 decimal place
      avgCycleTime: Math.round(avgCycleTime * 10) / 10, // Round to 1 decimal place
      totalTasks,
      totalTickets,
      pendingApprovals: pendingTasks,
      overdueTasks
    };
  }

  /**
   * Create Task Method
   * 
   * Creates a new task with the provided data and adds it to the tasks array.
   * Automatically generates an ID and sets creation/update timestamps.
   * 
   * @param taskData - Partial task data to create the new task
   * @returns Task - The newly created task object
   * 
   * Expected Result:
   * - New task is added to the tasks array
   * - Task has unique ID and timestamps
   * - Metrics are recalculated
   * - Returns the created task object
   */
  createTask(taskData: Partial<Task>): Task {
    // Create new task with provided data and default values
    const newTask: Task = {
      id: `t${Date.now()}`, // Generate unique ID using timestamp
      title: taskData.title || '',
      description: taskData.description || '',
      type: taskData.type || 'general',
      status: 'pending', // New tasks start as pending
      priority: taskData.priority || 'medium',
      requestorId: taskData.requestorId || '',
      requestor: taskData.requestor!, // Requestor is required
      department: taskData.department || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      formData: taskData.formData || {}
    };

    // Add task to the array and recalculate metrics
    this.tasks.push(newTask);
    this.calculateMetrics();
    return newTask;
  }

  /**
   * Update Task Status Method
   * 
   * Updates the status of a specific task and recalculates metrics.
   * 
   * @param taskId - ID of the task to update
   * @param status - New status for the task
   * 
   * Expected Result:
   * - Task status is updated
   * - Task updatedAt timestamp is updated
   * - Metrics are recalculated
   */
  updateTaskStatus(taskId: string, status: Task['status']) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
      this.calculateMetrics();
    }
  }

  /**
   * Get Tasks By User Method
   * 
   * Filters tasks by the specified user ID.
   * 
   * @param userId - ID of the user to filter by
   * @returns Task[] - Array of tasks created by the specified user
   */
  getTasksByUser(userId: string): Task[] {
    return this.tasks.filter(t => t.requestorId === userId);
  }

  /**
   * Get Tasks By Department Method
   * 
   * Filters tasks by the specified department.
   * 
   * @param department - Department name to filter by
   * @returns Task[] - Array of tasks for the specified department
   */
  getTasksByDepartment(department: string): Task[] {
    return this.tasks.filter(t => t.department === department);
  }

  /**
   * Get Pending Approvals Method
   * 
   * Returns all tasks that are currently pending approval.
   * 
   * @returns Task[] - Array of tasks with 'pending' status
   */
  getPendingApprovals(): Task[] {
    return this.tasks.filter(t => t.status === 'pending');
  }

  /**
   * Get Tickets By Task Method
   * 
   * Returns all ServiceNow tickets associated with a specific task.
   * 
   * @param taskId - ID of the task to find tickets for
   * @returns ServiceNowTicket[] - Array of tickets associated with the task
   */
  getTicketsByTask(taskId: string): ServiceNowTicket[] {
    return this.tickets.filter(t => t.taskId === taskId);
  }
}

// Create and export a singleton instance of the TaskStore
// This ensures all components use the same task data and state
export const taskStore = new TaskStore();
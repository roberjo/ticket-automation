/**
 * TypeScript Type Definitions
 * 
 * This file contains all TypeScript type definitions and interfaces used throughout
 * the application. These types ensure type safety and provide clear contracts for
 * data structures used in components, stores, and API interactions.
 * 
 * Purpose:
 * - Define data structures for the application
 * - Ensure type safety across components
 * - Provide clear contracts for API responses
 * - Support IntelliSense and development experience
 * - Document data relationships and constraints
 * 
 * Categories:
 * - User Management: User profiles and authentication
 * - Task Management: Task lifecycle and data structures
 * - ServiceNow Integration: Ticket management and mapping
 * - Dashboard: Metrics and analytics data
 * - Demo Data: Development and testing structures
 */

/**
 * User Interface
 * 
 * Represents a user in the system with authentication and profile information.
 * Used for user management, authentication, and role-based access control.
 * 
 * Properties:
 * - id: Unique identifier for the user
 * - email: User's email address (used for login)
 * - name: User's display name
 * - role: User's role in the system (determines permissions)
 * - department: User's organizational department
 * - isActive: Whether the user account is active
 * - lastLogin: Timestamp of user's last login (optional)
 * - createdAt: Timestamp when user account was created
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user' | 'servicenow_admin';
  department: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

/**
 * Task Interface
 * 
 * Represents a task in the system with full lifecycle information.
 * Tasks are the primary work items that can generate ServiceNow tickets.
 * 
 * Properties:
 * - id: Unique identifier for the task
 * - title: Task title/name
 * - description: Detailed task description
 * - type: Task type/category
 * - status: Current status in the task lifecycle
 * - priority: Task priority level
 * - requestorId: ID of the user who created the task
 * - requestor: Full user object of the requestor
 * - assigneeId: ID of the assigned user (optional)
 * - assignee: Full user object of the assignee (optional)
 * - department: Department responsible for the task
 * - dueDate: Task due date (optional)
 * - createdAt: Timestamp when task was created
 * - updatedAt: Timestamp when task was last updated
 * - serviceNowTickets: Associated ServiceNow tickets (optional)
 * - attachments: File attachments (optional)
 * - formData: Dynamic form data specific to task type
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'draft' | 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requestorId: string;
  requestor: User;
  assigneeId?: string;
  assignee?: User;
  department: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  serviceNowTickets?: ServiceNowTicket[];
  attachments?: string[];
  formData: Record<string, any>;
}

/**
 * ServiceNow Ticket Interface
 * 
 * Represents a ServiceNow ticket that is created from a task.
 * Contains ServiceNow-specific fields and tracking information.
 * 
 * Properties:
 * - id: Unique identifier for the ticket
 * - ticketNumber: ServiceNow ticket number (e.g., INC0001234)
 * - title: Ticket title
 * - description: Ticket description
 * - status: Current ServiceNow ticket status
 * - priority: Ticket priority level
 * - assignmentGroup: ServiceNow assignment group
 * - assignee: ServiceNow assignee (optional)
 * - taskId: ID of the associated task
 * - createdAt: Timestamp when ticket was created
 * - updatedAt: Timestamp when ticket was last updated
 * - durationDays: Number of days the ticket has been open
 */
export interface ServiceNowTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignmentGroup: string;
  assignee?: string;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
  durationDays: number;
}

/**
 * Task Template Interface
 * 
 * Represents a template for creating tasks with predefined configurations.
 * Templates define the form structure and ServiceNow mapping for different task types.
 * 
 * Properties:
 * - id: Unique identifier for the template
 * - name: Template name
 * - description: Template description
 * - category: Template category/type
 * - formSchema: JSON schema defining the form structure
 * - serviceNowMapping: Mapping configuration for ServiceNow integration
 * - isActive: Whether the template is active
 * - version: Template version number
 * - createdAt: Timestamp when template was created
 */
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  formSchema: Record<string, any>;
  serviceNowMapping: ServiceNowMapping[];
  isActive: boolean;
  version: number;
  createdAt: Date;
}

/**
 * ServiceNow Mapping Interface
 * 
 * Defines how task data maps to ServiceNow ticket fields.
 * Used in task templates to configure ServiceNow integration.
 * 
 * Properties:
 * - ticketType: Type of ServiceNow ticket to create
 * - priority: Default priority for the ticket
 * - assignmentGroup: Default assignment group
 * - fieldMappings: Mapping of task fields to ServiceNow fields
 */
export interface ServiceNowMapping {
  ticketType: string;
  priority: string;
  assignmentGroup: string;
  fieldMappings: Record<string, string>;
}

/**
 * Dashboard Metrics Interface
 * 
 * Represents key performance indicators and metrics displayed on the dashboard.
 * These metrics are calculated from task and ticket data.
 * 
 * Properties:
 * - taskCompletionRate: Percentage of completed tasks
 * - avgTaskDuration: Average task duration in days
 * - avgTicketDuration: Average ServiceNow ticket duration in days
 * - avgCycleTime: Average cycle time from task creation to completion
 * - totalTasks: Total number of tasks in the system
 * - totalTickets: Total number of ServiceNow tickets
 * - pendingApprovals: Number of tasks awaiting approval
 * - overdueTasks: Number of overdue tasks
 */
export interface DashboardMetrics {
  taskCompletionRate: number;
  avgTaskDuration: number;
  avgTicketDuration: number;
  avgCycleTime: number;
  totalTasks: number;
  totalTickets: number;
  pendingApprovals: number;
  overdueTasks: number;
}

/**
 * Chart Data Interface
 * 
 * Represents data points for dashboard charts and analytics.
 * Used for time-series data visualization.
 * 
 * Properties:
 * - date: Date for the data point
 * - completed: Number of completed tasks on this date
 * - created: Number of created tasks on this date
 * - avgDuration: Average task duration for this date
 */
export interface ChartData {
  date: string;
  completed: number;
  created: number;
  avgDuration: number;
}

/**
 * Demo User Interface
 * 
 * Represents a demo user with associated scenarios for development and testing.
 * Used in demo mode to provide realistic user experiences.
 * 
 * Properties:
 * - user: User profile information
 * - scenarios: Array of demo scenarios for this user
 */
export interface DemoUser {
  user: User;
  scenarios: DemoScenario[];
}

/**
 * Demo Scenario Interface
 * 
 * Represents a demo scenario that demonstrates application functionality.
 * Used for development, testing, and user training.
 * 
 * Properties:
 * - id: Unique identifier for the scenario
 * - title: Scenario title
 * - description: Scenario description
 * - taskType: Type of task this scenario demonstrates
 * - expectedTickets: Number of ServiceNow tickets expected to be created
 * - department: Department associated with the scenario
 */
export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  taskType: string;
  expectedTickets: number;
  department: string;
}

/**
 * Type Aliases
 * 
 * Convenience type aliases for commonly used union types.
 * These provide semantic meaning and improve code readability.
 */

// User role types for role-based access control
export type UserRole = 'admin' | 'manager' | 'user' | 'servicenow_admin';

// Task status types for task lifecycle management
export type TaskStatus = 'draft' | 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';

// ServiceNow ticket status types
export type TicketStatus = 'new' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'cancelled';

// Priority levels for tasks and tickets
export type Priority = 'low' | 'medium' | 'high' | 'critical';
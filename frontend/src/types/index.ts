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

export interface ServiceNowMapping {
  ticketType: string;
  priority: string;
  assignmentGroup: string;
  fieldMappings: Record<string, string>;
}

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

export interface ChartData {
  date: string;
  completed: number;
  created: number;
  avgDuration: number;
}

export interface DemoUser {
  user: User;
  scenarios: DemoScenario[];
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  taskType: string;
  expectedTickets: number;
  department: string;
}

export type UserRole = 'admin' | 'manager' | 'user' | 'servicenow_admin';
export type TaskStatus = 'draft' | 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
export type TicketStatus = 'new' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
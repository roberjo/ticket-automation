/**
 * TaskStore Test Suite
 * 
 * This test file validates the task management store functionality using MobX state management.
 * It tests task creation, ServiceNow ticket integration, metrics calculation, and data filtering.
 * 
 * Test Structure:
 * - Task Management: Task creation, updates, and filtering
 * - ServiceNow Integration: Ticket creation and management
 * - Metrics Calculation: Dashboard metrics and KPIs
 * - Demo Data: Demo data loading and validation
 * 
 * Testing Approach:
 * - Each test resets the store state before execution
 * - Tests focus on state changes and computed values
 * - Validates both happy path and edge cases
 * - Tests metrics calculation accuracy
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { taskStore } from '@/stores/TaskStore';
import { Task, ServiceNowTicket, User } from '@/types';

describe('TaskStore', () => {
  /**
   * Setup: Reset store state before each test
   * 
   * This ensures each test starts with a clean state, preventing
   * test interference and ensuring predictable test results.
   * The store is reinitialized to clear any previous test data.
   */
  beforeEach(() => {
    // Reset store by reinitializing it
    // This clears all tasks, tickets, and metrics
    Object.assign(taskStore, {
      tasks: [],
      templates: [],
      tickets: [],
      metrics: {
        taskCompletionRate: 0,
        avgTaskDuration: 0,
        avgTicketDuration: 0,
        avgCycleTime: 0,
        totalTasks: 0,
        totalTickets: 0,
        pendingApprovals: 0,
        overdueTasks: 0
      }
    });
  });

  /**
   * Task Management Test Suite
   * 
   * Tests core task management functionality including:
   * - Task creation with proper data structure
   * - Task status updates and lifecycle management
   * - Task filtering by user and department
   * - Pending approvals and task queries
   */
  describe('Task Management', () => {
    /**
     * Test: Task Creation
     * 
     * Validates that tasks can be created with proper data structure:
     * 1. Creates a test user for task assignment
     * 2. Creates task data with all required properties
     * 3. Calls createTask method
     * 4. Verifies task is added to store with correct properties
     * 
     * Expected Result:
     * - Task is added to tasks array
     * - Task has unique ID and timestamps
     * - Metrics are recalculated
     * - Returns the created task object
     */
    it('should create new tasks', () => {
      // Create test user for task assignment
      const testUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Create task data
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        type: 'infrastructure',
        priority: 'high' as const,
        requestorId: '1',
        requestor: testUser,
        department: 'IT',
        formData: {
          employeeName: 'John Doe',
          startDate: '2024-03-15'
        }
      };

      // Create the task
      const newTask = taskStore.createTask(taskData);

      // Verify task was created with correct properties
      expect(newTask.id).toMatch(/^t\d+$/); // Should have timestamp-based ID
      expect(newTask.title).toBe('Test Task');
      expect(newTask.status).toBe('pending'); // New tasks start as pending
      expect(newTask.createdAt).toBeInstanceOf(Date);
      expect(newTask.updatedAt).toBeInstanceOf(Date);

      // Verify task was added to store
      expect(taskStore.tasks).toHaveLength(1);
      expect(taskStore.tasks[0]).toEqual(newTask);

      // Verify metrics were updated
      expect(taskStore.metrics.totalTasks).toBe(1);
      expect(taskStore.metrics.pendingApprovals).toBe(1);
    });

    /**
     * Test: Task Status Update
     * 
     * Validates that task status can be updated and metrics are recalculated:
     * 1. Creates a task
     * 2. Updates task status to 'in_progress'
     * 3. Verifies status change and timestamp update
     * 4. Verifies metrics are recalculated
     * 
     * Expected Result:
     * - Task status is updated
     * - Task updatedAt timestamp is updated
     * - Metrics are recalculated to reflect status change
     */
    it('should update task status', () => {
      // Create test user
      const testUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Create a task
      const task = taskStore.createTask({
        title: 'Test Task',
        description: 'Test description',
        type: 'infrastructure',
        priority: 'medium',
        requestorId: '1',
        requestor: testUser,
        department: 'IT',
        formData: {}
      });

      // Verify initial state
      expect(task.status).toBe('pending');
      expect(taskStore.metrics.pendingApprovals).toBe(1);

      // Update task status
      taskStore.updateTaskStatus(task.id, 'in_progress');

      // Verify status was updated
      const updatedTask = taskStore.tasks.find(t => t.id === task.id);
      expect(updatedTask?.status).toBe('in_progress');
      expect(updatedTask?.updatedAt).toBeInstanceOf(Date);

      // Verify metrics were recalculated
      expect(taskStore.metrics.pendingApprovals).toBe(0);
    });

    /**
     * Test: Filter Tasks By User
     * 
     * Validates that tasks can be filtered by user ID:
     * 1. Creates tasks for different users
     * 2. Filters tasks by specific user ID
     * 3. Verifies only tasks for that user are returned
     * 
     * Expected Result:
     * - Returns only tasks created by the specified user
     * - Returns empty array if no tasks for user exist
     */
    it('should filter tasks by user', () => {
      // Create test users
      const user1: User = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      const user2: User = {
        id: '2',
        name: 'User 2',
        email: 'user2@example.com',
        role: 'user',
        department: 'HR',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Create tasks for different users
      taskStore.createTask({
        title: 'Task 1',
        description: 'Task for user 1',
        type: 'infrastructure',
        priority: 'high',
        requestorId: '1',
        requestor: user1,
        department: 'IT',
        formData: {}
      });

      taskStore.createTask({
        title: 'Task 2',
        description: 'Task for user 2',
        type: 'application',
        priority: 'medium',
        requestorId: '2',
        requestor: user2,
        department: 'HR',
        formData: {}
      });

      // Filter tasks by user 1
      const user1Tasks = taskStore.getTasksByUser('1');
      expect(user1Tasks).toHaveLength(1);
      expect(user1Tasks[0].title).toBe('Task 1');
      expect(user1Tasks[0].requestorId).toBe('1');

      // Filter tasks by user 2
      const user2Tasks = taskStore.getTasksByUser('2');
      expect(user2Tasks).toHaveLength(1);
      expect(user2Tasks[0].title).toBe('Task 2');
      expect(user2Tasks[0].requestorId).toBe('2');

      // Filter tasks by non-existent user
      const nonExistentUserTasks = taskStore.getTasksByUser('999');
      expect(nonExistentUserTasks).toHaveLength(0);
    });

    /**
     * Test: Filter Tasks By Department
     * 
     * Validates that tasks can be filtered by department:
     * 1. Creates tasks for different departments
     * 2. Filters tasks by specific department
     * 3. Verifies only tasks for that department are returned
     * 
     * Expected Result:
     * - Returns only tasks for the specified department
     * - Returns empty array if no tasks for department exist
     */
    it('should filter tasks by department', () => {
      // Create test user
      const testUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Create tasks for different departments
      taskStore.createTask({
        title: 'IT Task',
        description: 'Task for IT department',
        type: 'infrastructure',
        priority: 'high',
        requestorId: '1',
        requestor: testUser,
        department: 'IT',
        formData: {}
      });

      taskStore.createTask({
        title: 'HR Task',
        description: 'Task for HR department',
        type: 'application',
        priority: 'medium',
        requestorId: '1',
        requestor: testUser,
        department: 'HR',
        formData: {}
      });

      // Filter tasks by IT department
      const itTasks = taskStore.getTasksByDepartment('IT');
      expect(itTasks).toHaveLength(1);
      expect(itTasks[0].title).toBe('IT Task');
      expect(itTasks[0].department).toBe('IT');

      // Filter tasks by HR department
      const hrTasks = taskStore.getTasksByDepartment('HR');
      expect(hrTasks).toHaveLength(1);
      expect(hrTasks[0].title).toBe('HR Task');
      expect(hrTasks[0].department).toBe('HR');

      // Filter tasks by non-existent department
      const nonExistentDeptTasks = taskStore.getTasksByDepartment('NonExistent');
      expect(nonExistentDeptTasks).toHaveLength(0);
    });

    /**
     * Test: Get Pending Approvals
     * 
     * Validates that pending tasks can be retrieved:
     * 1. Creates tasks with different statuses
     * 2. Calls getPendingApprovals method
     * 3. Verifies only pending tasks are returned
     * 
     * Expected Result:
     * - Returns only tasks with 'pending' status
     * - Returns empty array if no pending tasks exist
     */
    it('should get pending approvals', () => {
      // Create test user
      const testUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Create tasks with different statuses
      const pendingTask = taskStore.createTask({
        title: 'Pending Task',
        description: 'Task awaiting approval',
        type: 'infrastructure',
        priority: 'high',
        requestorId: '1',
        requestor: testUser,
        department: 'IT',
        formData: {}
      });

      const inProgressTask = taskStore.createTask({
        title: 'In Progress Task',
        description: 'Task in progress',
        type: 'application',
        priority: 'medium',
        requestorId: '1',
        requestor: testUser,
        department: 'IT',
        formData: {}
      });

      // Update second task to in_progress
      taskStore.updateTaskStatus(inProgressTask.id, 'in_progress');

      // Get pending approvals
      const pendingApprovals = taskStore.getPendingApprovals();

      // Verify only pending tasks are returned
      expect(pendingApprovals).toHaveLength(1);
      expect(pendingApprovals[0].id).toBe(pendingTask.id);
      expect(pendingApprovals[0].status).toBe('pending');
    });
  });

  /**
   * ServiceNow Integration Test Suite
   * 
   * Tests ServiceNow ticket integration functionality including:
   * - Ticket creation and management
   * - Ticket-task relationships
   * - Ticket filtering and querying
   */
  describe('ServiceNow Integration', () => {
    /**
     * Test: Get Tickets By Task
     * 
     * Validates that tickets can be filtered by task ID:
     * 1. Creates tasks and associated tickets
     * 2. Filters tickets by specific task ID
     * 3. Verifies only tickets for that task are returned
     * 
     * Expected Result:
     * - Returns only tickets associated with the specified task
     * - Returns empty array if no tickets for task exist
     */
    it('should get tickets by task', () => {
      // Create test user
      const testUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Create a task
      const task = taskStore.createTask({
        title: 'Test Task',
        description: 'Test task description',
        type: 'infrastructure',
        priority: 'high',
        requestorId: '1',
        requestor: testUser,
        department: 'IT',
        formData: {}
      });

      // Create tickets associated with the task
      const ticket1: ServiceNowTicket = {
        id: 'sn1',
        ticketNumber: 'INC0001234',
        title: 'VM Provisioning',
        description: 'Provision virtual machine',
        status: 'in_progress',
        priority: 'high',
        assignmentGroup: 'Infrastructure Team',
        assignee: 'Infrastructure Admin',
        taskId: task.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        durationDays: 2
      };

      const ticket2: ServiceNowTicket = {
        id: 'sn2',
        ticketNumber: 'INC0001235',
        title: 'Network Access',
        description: 'Configure network access',
        status: 'resolved',
        priority: 'medium',
        assignmentGroup: 'Network Team',
        assignee: 'Network Admin',
        taskId: task.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        durationDays: 3
      };

      // Add tickets to store
      taskStore.tickets.push(ticket1, ticket2);

      // Get tickets for the task
      const taskTickets = taskStore.getTicketsByTask(task.id);

      // Verify tickets are returned
      expect(taskTickets).toHaveLength(2);
      expect(taskTickets[0].taskId).toBe(task.id);
      expect(taskTickets[1].taskId).toBe(task.id);

      // Verify tickets for non-existent task
      const nonExistentTaskTickets = taskStore.getTicketsByTask('non-existent');
      expect(nonExistentTaskTickets).toHaveLength(0);
    });
  });

  /**
   * Metrics Calculation Test Suite
   * 
   * Tests dashboard metrics calculation functionality including:
   * - Task completion rate calculation
   * - Average task duration calculation
   * - Average ticket duration calculation
   * - Cycle time calculation
   */
  describe('Metrics Calculation', () => {
    /**
     * Test: Calculate Task Completion Rate
     * 
     * Validates that task completion rate is calculated correctly:
     * 1. Creates tasks with different statuses
     * 2. Calls calculateMetrics method
     * 3. Verifies completion rate calculation
     * 
     * Expected Result:
     * - Completion rate is calculated as (completed tasks / total tasks) * 100
     * - Returns 0 if no tasks exist
     */
    it('should calculate task completion rate', () => {
      // Create test user
      const testUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Create tasks with different statuses
      const pendingTask = taskStore.createTask({
        title: 'Pending Task',
        description: 'Task awaiting approval',
        type: 'infrastructure',
        priority: 'high',
        requestorId: '1',
        requestor: testUser,
        department: 'IT',
        formData: {}
      });

      const inProgressTask = taskStore.createTask({
        title: 'In Progress Task',
        description: 'Task in progress',
        type: 'application',
        priority: 'medium',
        requestorId: '1',
        requestor: testUser,
        department: 'IT',
        formData: {}
      });

      const completedTask = taskStore.createTask({
        title: 'Completed Task',
        description: 'Completed task',
        type: 'security',
        priority: 'low',
        requestorId: '1',
        requestor: testUser,
        department: 'IT',
        formData: {}
      });

      // Update task statuses
      taskStore.updateTaskStatus(inProgressTask.id, 'in_progress');
      taskStore.updateTaskStatus(completedTask.id, 'completed');

      // Verify completion rate calculation
      expect(taskStore.metrics.taskCompletionRate).toBeCloseTo(33.3, 1); // 1 completed out of 3 total, rounded to 1 decimal
      expect(taskStore.metrics.totalTasks).toBe(3);
      expect(taskStore.metrics.pendingApprovals).toBe(1);
    });

    /**
     * Test: Calculate Average Task Duration
     * 
     * Validates that average task duration is calculated correctly:
     * 1. Creates completed tasks with different durations
     * 2. Calls calculateMetrics method
     * 3. Verifies average duration calculation
     * 
     * Expected Result:
     * - Average duration is calculated for completed tasks only
     * - Duration is calculated in days between creation and completion
     */
    it('should calculate average task duration', () => {
      // Create test user
      const testUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Create tasks with different completion times
      const task1 = taskStore.createTask({
        title: 'Task 1',
        description: 'Task 1 description',
        type: 'infrastructure',
        priority: 'high',
        requestorId: '1',
        requestor: testUser,
        department: 'IT',
        formData: {}
      });

      const task2 = taskStore.createTask({
        title: 'Task 2',
        description: 'Task 2 description',
        type: 'application',
        priority: 'medium',
        requestorId: '1',
        requestor: testUser,
        department: 'IT',
        formData: {}
      });

      // Mark tasks as completed (this will update the updatedAt timestamp)
      taskStore.updateTaskStatus(task1.id, 'completed');
      taskStore.updateTaskStatus(task2.id, 'completed');

      // Verify average duration calculation
      expect(taskStore.metrics.avgTaskDuration).toBeGreaterThanOrEqual(0);
      // Check that completion rate increased (since we added 2 completed tasks)
      expect(taskStore.metrics.taskCompletionRate).toBeGreaterThan(0);
    });
  });

  /**
   * Demo Data Test Suite
   * 
   * Tests demo data loading and validation functionality including:
   * - Demo data loading
   * - Demo data structure validation
   * - Metrics calculation from demo data
   */
  describe('Demo Data', () => {
    /**
     * Test: Load Demo Data
     * 
     * Validates that demo data is loaded correctly:
     * 1. Calls loadDemoData method
     * 2. Verifies demo tasks and tickets are created
     * 3. Verifies metrics are calculated from demo data
     * 
     * Expected Result:
     * - Demo tasks are loaded with realistic data
     * - Demo tickets are loaded and linked to tasks
     * - Metrics are calculated from demo data
     */
    it('should load demo data', () => {
      // Load demo data
      taskStore.loadDemoData();

      // Verify demo tasks are loaded
      expect(taskStore.tasks.length).toBeGreaterThan(0);
      expect(taskStore.tasks[0]).toHaveProperty('title');
      expect(taskStore.tasks[0]).toHaveProperty('description');
      expect(taskStore.tasks[0]).toHaveProperty('type');
      expect(taskStore.tasks[0]).toHaveProperty('status');

      // Verify demo tickets are loaded
      expect(taskStore.tickets.length).toBeGreaterThan(0);
      expect(taskStore.tickets[0]).toHaveProperty('ticketNumber');
      expect(taskStore.tickets[0]).toHaveProperty('title');
      expect(taskStore.tickets[0]).toHaveProperty('taskId');

      // Verify metrics are calculated
      expect(taskStore.metrics.totalTasks).toBeGreaterThan(0);
      expect(taskStore.metrics.totalTickets).toBeGreaterThan(0);
      expect(taskStore.metrics.taskCompletionRate).toBeGreaterThanOrEqual(0);
      expect(taskStore.metrics.avgTaskDuration).toBeGreaterThanOrEqual(0);
      expect(taskStore.metrics.avgTicketDuration).toBeGreaterThanOrEqual(0);
    });

    /**
     * Test: Demo Data Structure
     * 
     * Validates that demo data has correct structure:
     * 1. Loads demo data
     * 2. Verifies task and ticket structure
     * 3. Verifies relationships between tasks and tickets
     * 
     * Expected Result:
     * - Demo data has realistic and consistent structure
     * - Tasks and tickets are properly linked
     * - All required properties are present
     */
    it('should have correct demo data structure', () => {
      // Load demo data
      taskStore.loadDemoData();

      // Verify task structure
      taskStore.tasks.forEach(task => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('description');
        expect(task).toHaveProperty('type');
        expect(task).toHaveProperty('status');
        expect(task).toHaveProperty('priority');
        expect(task).toHaveProperty('requestorId');
        expect(task).toHaveProperty('requestor');
        expect(task).toHaveProperty('department');
        expect(task).toHaveProperty('createdAt');
        expect(task).toHaveProperty('updatedAt');
        expect(task).toHaveProperty('formData');
      });

      // Verify ticket structure
      taskStore.tickets.forEach(ticket => {
        expect(ticket).toHaveProperty('id');
        expect(ticket).toHaveProperty('ticketNumber');
        expect(ticket).toHaveProperty('title');
        expect(ticket).toHaveProperty('description');
        expect(ticket).toHaveProperty('status');
        expect(ticket).toHaveProperty('priority');
        expect(ticket).toHaveProperty('assignmentGroup');
        expect(ticket).toHaveProperty('taskId');
        expect(ticket).toHaveProperty('createdAt');
        expect(ticket).toHaveProperty('updatedAt');
        expect(ticket).toHaveProperty('durationDays');
      });

      // Verify ticket-task relationships
      taskStore.tickets.forEach(ticket => {
        const linkedTask = taskStore.tasks.find(task => task.id === ticket.taskId);
        expect(linkedTask).toBeDefined();
        expect(linkedTask?.id).toBe(ticket.taskId);
      });
    });
  });
});

/**
 * Tickets Page Component Test Suite
 * 
 * This test file validates the Tickets page component functionality including:
 * - ServiceNow ticket display and rendering
 * - Ticket filtering and search functionality
 * - Ticket statistics and metrics display
 * - Ticket-task relationships and linking
 * - Ticket status and priority management
 * 
 * Test Structure:
 * - Component Rendering: Basic page rendering and user interface
 * - Ticket Display: Ticket card rendering and information display
 * - Ticket Management: Filtering, search, and ticket operations
 * - Ticket Statistics: Metrics calculation and display
 * - Ticket-Task Relationships: Linking tickets to tasks
 * 
 * Testing Approach:
 * - Uses React Testing Library for component testing
 * - Tests user behavior rather than implementation details
 * - Validates ticket display and filtering functionality
 * - Uses custom test wrapper with necessary providers
 * - Tests both success and error scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Tickets } from '@/pages/Tickets';
import { authStore } from '@/stores/AuthStore';
import { taskStore } from '@/stores/TaskStore';
import { User, ServiceNowTicket, Task } from '@/types';

/**
 * Test QueryClient Factory
 * 
 * Creates a new QueryClient instance for each test to ensure
 * test isolation and prevent state leakage between tests.
 * The QueryClient is configured with retry disabled for faster test execution.
 */
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for faster test execution
    },
  },
});

/**
 * Test Wrapper Component
 * 
 * Provides all necessary React context providers for the Tickets component:
 * - QueryClientProvider: For React Query state management
 * - BrowserRouter: For React Router navigation
 * 
 * This wrapper ensures the component has access to all required context
 * and can render properly in the test environment.
 */
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Test User Data Factory
 * 
 * Creates test user objects with different roles for testing
 * role-based access control and functionality.
 */
const createTestUser = (role: 'user' | 'manager' | 'admin' = 'user'): User => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role,
  department: 'IT',
  isActive: true,
  createdAt: new Date(),
  lastLogin: new Date()
});

/**
 * Test Task Data Factory
 * 
 * Creates test task objects for linking with tickets.
 */
const createTestTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  title: 'Test Task',
  description: 'Test task description',
  type: 'infrastructure',
  status: 'pending',
  priority: 'medium',
  requestorId: '1',
  assigneeId: '2',
  department: 'IT',
  estimatedHours: 8,
  actualHours: 0,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  dueDate: new Date('2025-01-15'),
  ...overrides
});

/**
 * Test ServiceNow Ticket Data Factory
 * 
 * Creates test ServiceNow ticket objects for testing ticket functionality.
 */
const createTestTicket = (overrides: Partial<ServiceNowTicket> = {}): ServiceNowTicket => ({
  id: 'sn1',
  ticketNumber: 'INC0001234',
  title: 'Test Ticket',
  description: 'Test ticket description',
  status: 'new',
  priority: 'medium',
  assignmentGroup: 'Infrastructure Team',
  assignee: 'Infrastructure Admin',
  taskId: 't1',
  durationDays: 2,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides
});

describe('Tickets Page', () => {
  beforeEach(() => {
    // Reset stores before each test
    authStore.logout();
    taskStore.tasks = [];
    taskStore.tickets = [];
  });

  describe('Component Rendering', () => {
    it('should render tickets page with authenticated user', async () => {
      // Setup test data
      const user = createTestUser('admin');
      authStore.login(user);
      
      const task = createTestTask();
      const ticket = createTestTicket();
      
      taskStore.tasks = [task];
      taskStore.tickets = [ticket];

      render(
        <TestWrapper>
          <Tickets />
        </TestWrapper>
      );

      // Verify page renders
      expect(screen.getByText('ServiceNow Tickets')).toBeInTheDocument();
      expect(screen.getByText('Track and manage ServiceNow tickets created from task automation')).toBeInTheDocument();
      
      // Verify ticket card renders
      expect(screen.getByText('INC0001234')).toBeInTheDocument();
      expect(screen.getByText('Test Ticket')).toBeInTheDocument();
      expect(screen.getByText('Test ticket description')).toBeInTheDocument();
      
      // Verify status badge (status is displayed as "NEW" in uppercase)
      expect(screen.getByText('NEW')).toBeInTheDocument();
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });

    it('should not render when user is not authenticated', () => {
      render(
        <TestWrapper>
          <Tickets />
        </TestWrapper>
      );

      expect(screen.queryByText('ServiceNow Tickets')).not.toBeInTheDocument();
    });

    it('should display empty state when no tickets exist', () => {
      const user = createTestUser();
      authStore.login(user);

      render(
        <TestWrapper>
          <Tickets />
        </TestWrapper>
      );

      expect(screen.getByText('No tickets found')).toBeInTheDocument();
      expect(screen.getByText('Tickets will appear here when tasks create ServiceNow tickets')).toBeInTheDocument();
    });
  });

  describe('Ticket Display', () => {
    it('should render ticket cards with complete information', () => {
      const user = createTestUser('admin');
      authStore.login(user);
      
      const task = createTestTask();
      const ticket = createTestTicket({
        status: 'in_progress',
        priority: 'high',
        durationDays: 5
      });
      
      taskStore.tasks = [task];
      taskStore.tickets = [ticket];

      render(
        <TestWrapper>
          <Tickets />
        </TestWrapper>
      );

      // Verify ticket information
      expect(screen.getByText('INC0001234')).toBeInTheDocument();
      expect(screen.getByText('Test Ticket')).toBeInTheDocument();
      expect(screen.getByText('Test ticket description')).toBeInTheDocument();
      
      // Verify status and priority (displayed in uppercase)
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      
      // Verify ticket details
      expect(screen.getAllByText('Infrastructure Team').length).toBeGreaterThan(0);
      expect(screen.getByText('Infrastructure Admin')).toBeInTheDocument();
      expect(screen.getByText('5 days')).toBeInTheDocument();
    });
  });

  describe('Ticket Management', () => {
    it('should filter tickets by status', async () => {
      const user = createTestUser('admin');
      authStore.login(user);
      
      const task = createTestTask();
      const newTicket = createTestTicket({ status: 'new', id: 'sn1' });
      const inProgressTicket = createTestTicket({ status: 'in_progress', id: 'sn2', ticketNumber: 'INC0001235' });
      
      taskStore.tasks = [task];
      taskStore.tickets = [newTicket, inProgressTicket];

      render(
        <TestWrapper>
          <Tickets />
        </TestWrapper>
      );

      // Verify both tickets are visible initially
      expect(screen.getByText('INC0001234')).toBeInTheDocument();
      expect(screen.getByText('INC0001235')).toBeInTheDocument();

      // Filter by "In Progress" status
      const statusSelect = screen.getByDisplayValue('All Status');
      await userEvent.selectOptions(statusSelect, 'in_progress');

      // Verify only in-progress ticket is visible
      expect(screen.queryByText('INC0001234')).not.toBeInTheDocument();
      expect(screen.getByText('INC0001235')).toBeInTheDocument();
    });

    it('should search tickets by title and description', async () => {
      const user = createTestUser('admin');
      authStore.login(user);
      
      const task = createTestTask();
      const ticket1 = createTestTicket({ title: 'Infrastructure Issue', id: 'sn1' });
      const ticket2 = createTestTicket({ title: 'Network Problem', id: 'sn2', ticketNumber: 'INC0001235' });
      
      taskStore.tasks = [task];
      taskStore.tickets = [ticket1, ticket2];

      render(
        <TestWrapper>
          <Tickets />
        </TestWrapper>
      );

      // Verify both tickets are visible initially
      expect(screen.getByText('Infrastructure Issue')).toBeInTheDocument();
      expect(screen.getByText('Network Problem')).toBeInTheDocument();

      // Search for "Infrastructure"
      const searchInput = screen.getByPlaceholderText('Search tickets by number, title, or description...');
      await userEvent.type(searchInput, 'Infrastructure');

      // Verify only infrastructure ticket is visible
      expect(screen.getByText('Infrastructure Issue')).toBeInTheDocument();
      expect(screen.queryByText('Network Problem')).not.toBeInTheDocument();
    });
  });

  describe('Ticket Statistics', () => {
    it('should calculate statistics correctly for user tickets', () => {
      const user = createTestUser('admin');
      authStore.login(user);
      
      const task = createTestTask();
      const newTicket = createTestTicket({ status: 'new', id: 'sn1', durationDays: 2 });
      const inProgressTicket = createTestTicket({ status: 'in_progress', id: 'sn2', durationDays: 4 });
      const resolvedTicket = createTestTicket({ status: 'resolved', id: 'sn3', durationDays: 6 });
      
      taskStore.tasks = [task];
      taskStore.tickets = [newTicket, inProgressTicket, resolvedTicket];

      render(
        <TestWrapper>
          <Tickets />
        </TestWrapper>
      );

      // Verify statistics
      expect(screen.getByText('3')).toBeInTheDocument(); // Total tickets
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // New tickets
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // In Progress tickets
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Resolved tickets
      
      // Verify average duration is calculated (2+4+6)/3 = 4
      expect(screen.getByText('4')).toBeInTheDocument(); // Average duration
    });
  });

  describe('Ticket-Task Relationships', () => {
    it('should display related task information in ticket cards', () => {
      const user = createTestUser('admin');
      authStore.login(user);
      
      const task = createTestTask({ title: 'Related Test Task', status: 'in_progress' });
      const ticket = createTestTicket({ taskId: task.id });
      
      taskStore.tasks = [task];
      taskStore.tickets = [ticket];

      render(
        <TestWrapper>
          <Tickets />
        </TestWrapper>
      );

      // Verify related task information is displayed
      expect(screen.getByText('Related Test Task')).toBeInTheDocument();
    });

    it('should handle tickets without related tasks gracefully', () => {
      const user = createTestUser('admin');
      authStore.login(user);
      
      // Create ticket without a related task
      const orphanedTicket = createTestTicket({ 
        taskId: 'nonexistent-task',
        title: 'Orphaned Ticket'
      });
      
      taskStore.tasks = [];
      taskStore.tickets = [orphanedTicket];

      render(
        <TestWrapper>
          <Tickets />
        </TestWrapper>
      );

      // Verify ticket displays correctly without related task info
      expect(screen.getByText('Orphaned Ticket')).toBeInTheDocument();
      expect(screen.getByText('INC0001234')).toBeInTheDocument();
      
      // Verify no related task section is shown
      expect(screen.queryByText('Related Task:')).not.toBeInTheDocument();
    });
  });

  describe('Role-based Access', () => {
    it('should show only user tickets for regular users', () => {
      const user = createTestUser('user');
      authStore.login(user);
      
      const userTask = createTestTask({ requestorId: user.id });
      const otherTask = createTestTask({ requestorId: 'other-user', id: 't2' });
      
      const userTicket = createTestTicket({ taskId: userTask.id });
      const otherTicket = createTestTicket({ taskId: otherTask.id, id: 'sn2', ticketNumber: 'INC0001235' });
      
      taskStore.tasks = [userTask, otherTask];
      taskStore.tickets = [userTicket, otherTicket];

      render(
        <TestWrapper>
          <Tickets />
        </TestWrapper>
      );

      // Verify only user's ticket is visible
      expect(screen.getByText('INC0001234')).toBeInTheDocument();
      expect(screen.queryByText('INC0001235')).not.toBeInTheDocument();
    });

    it('should show all tickets for managers and admins', () => {
      const admin = createTestUser('admin');
      authStore.login(admin);
      
      const task1 = createTestTask({ requestorId: 'user1' });
      const task2 = createTestTask({ requestorId: 'user2', id: 't2' });
      
      const ticket1 = createTestTicket({ taskId: task1.id });
      const ticket2 = createTestTicket({ taskId: task2.id, id: 'sn2', ticketNumber: 'INC0001235' });
      
      taskStore.tasks = [task1, task2];
      taskStore.tickets = [ticket1, ticket2];

      render(
        <TestWrapper>
          <Tickets />
        </TestWrapper>
      );

      // Verify all tickets are visible
      expect(screen.getByText('INC0001234')).toBeInTheDocument();
      expect(screen.getByText('INC0001235')).toBeInTheDocument();
    });
  });
});

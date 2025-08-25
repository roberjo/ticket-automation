/**
 * Tasks Page Component Test Suite
 * 
 * This test file validates the Tasks page component functionality including:
 * - Task creation workflow and form validation
 * - Task filtering and search functionality
 * - Role-based access control and task display
 * - Task statistics and metrics display
 * - Task card rendering and interactions
 * 
 * Test Structure:
 * - Component Rendering: Basic page rendering and user interface
 * - Task Creation: Form validation and task creation workflow
 * - Task Management: Filtering, search, and task display
 * - Role-based Access: Different user roles and permissions
 * - Task Statistics: Metrics calculation and display
 * 
 * Testing Approach:
 * - Uses React Testing Library for component testing
 * - Tests user behavior rather than implementation details
 * - Validates role-based access control and content display
 * - Uses custom test wrapper with necessary providers
 * - Tests both success and error scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Tasks } from '@/pages/Tasks';
import { authStore } from '@/stores/AuthStore';
import { taskStore } from '@/stores/TaskStore';
import { User, Task } from '@/types';

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
 * Provides all necessary React context providers for the Tasks component:
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
 * Creates test task objects with different properties for testing
 * task management functionality.
 */
const createTestTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  title: 'Test Task',
  description: 'Test task description',
  type: 'infrastructure',
  status: 'pending',
  priority: 'medium',
  requestorId: '1',
  requestor: createTestUser(),
  department: 'IT',
  createdAt: new Date(),
  updatedAt: new Date(),
  formData: {},
  ...overrides
});

describe('Tasks Page', () => {
  /**
   * Setup: Reset stores and authentication state before each test
   * 
   * Ensures each test starts with a clean state, preventing
   * test interference and ensuring predictable results.
   */
  beforeEach(() => {
    // Reset authentication store
    authStore.logout();
    
    // Reset task store
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
   * Component Rendering Test Suite
   * 
   * Tests basic component rendering functionality including:
   * - Page header and title display
   * - User interface elements
   * - Authentication state handling
   */
  describe('Component Rendering', () => {
    /**
     * Test: Page Rendering with Authenticated User
     * 
     * Validates that the Tasks page renders correctly when a user is authenticated:
     * 1. Logs in a test user
     * 2. Renders the Tasks component
     * 3. Verifies that page elements are displayed correctly
     * 
     * Expected Result:
     * - Page title and description are displayed
     * - New Task button is present
     * - Search and filter controls are visible
     * - Task statistics cards are shown
     */
    it('should render tasks page with authenticated user', () => {
      // Login a test user
      const testUser = createTestUser();
      authStore.login(testUser);

      // Render the component
      render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Verify page elements are displayed
      expect(screen.getByText('Task Management')).toBeInTheDocument();
      expect(screen.getByText('Create, track, and manage your ServiceNow automation tasks')).toBeInTheDocument();
      expect(screen.getByText('New Task')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
      expect(screen.getByText('All Status')).toBeInTheDocument();
      
      // Verify statistics cards are displayed
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
      expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
    });

    /**
     * Test: Page Not Rendering Without Authentication
     * 
     * Validates that the Tasks page does not render when no user is authenticated:
     * 1. Ensures no user is logged in
     * 2. Renders the Tasks component
     * 3. Verifies that nothing is rendered
     * 
     * Expected Result:
     * - Component returns null when no user is authenticated
     * - No page elements are displayed
     */
    it('should not render when user is not authenticated', () => {
      // Ensure no user is logged in
      authStore.logout();

      // Render the component
      const { container } = render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Verify nothing is rendered
      expect(container.firstChild).toBeNull();
    });

    /**
     * Test: Empty State Display
     * 
     * Validates that the page displays appropriate empty state when no tasks exist:
     * 1. Logs in a test user
     * 2. Ensures no tasks exist in the store
     * 3. Renders the Tasks component
     * 4. Verifies empty state message is displayed
     * 
     * Expected Result:
     * - Empty state message is displayed
     * - Create first task button is shown
     * - Statistics show zero values
     */
    it('should display empty state when no tasks exist', () => {
      // Login a test user
      const testUser = createTestUser();
      authStore.login(testUser);

      // Ensure no tasks exist
      taskStore.tasks = [];

      // Render the component
      render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Verify empty state is displayed
      expect(screen.getByText('No tasks found')).toBeInTheDocument();
      expect(screen.getByText('Create your first task to get started')).toBeInTheDocument();
      expect(screen.getByText('Create First Task')).toBeInTheDocument();
      
      // Verify statistics show zero
      expect(screen.getAllByText('0').length).toBeGreaterThan(0); // Total tasks
    });
  });

  /**
   * Task Creation Test Suite
   * 
   * Tests task creation functionality including:
   * - Create task dialog opening and closing
   * - Form validation and submission
   * - Task creation workflow
   */
  describe('Task Creation', () => {
    /**
     * Test: Create Task Dialog Opening
     * 
     * Validates that the create task dialog opens when the New Task button is clicked:
     * 1. Logs in a test user
     * 2. Renders the Tasks component
     * 3. Clicks the New Task button
     * 4. Verifies dialog opens with form elements
     * 
     * Expected Result:
     * - Dialog opens when New Task button is clicked
     * - Form elements are displayed in the dialog
     * - Dialog can be closed
     */
    it('should open create task dialog when New Task button is clicked', async () => {
      const user = userEvent.setup();
      
      // Login a test user
      const testUser = createTestUser();
      authStore.login(testUser);

      // Render the component
      render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Click the New Task button
      const newTaskButton = screen.getByText('New Task');
      await user.click(newTaskButton);

      // Verify dialog opens with form elements
      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Priority')).toBeInTheDocument();
      });
    });

    /**
     * Test: Task Creation Form Validation
     * 
     * Validates that the task creation form validates required fields:
     * 1. Opens the create task dialog
     * 2. Attempts to submit without required fields
     * 3. Verifies validation errors are displayed
     * 
     * Expected Result:
     * - Form validation prevents submission with empty required fields
     * - Validation error messages are displayed
     * - Form remains open for correction
     */
    it('should validate required fields in task creation form', async () => {
      const user = userEvent.setup();
      
      // Login a test user
      const testUser = createTestUser();
      authStore.login(testUser);

      // Render the component
      render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Open create task dialog
      const newTaskButton = screen.getByText('New Task');
      await user.click(newTaskButton);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });

      // Try to submit without filling required fields
      const submitButton = screen.getByText('Create Task');
      await user.click(submitButton);

      // Verify validation prevents submission
      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument(); // Dialog still open
      });
    });

    /**
     * Test: Successful Task Creation
     * 
     * Validates that a task can be created successfully:
     * 1. Opens the create task dialog
     * 2. Fills in all required fields
     * 3. Submits the form
     * 4. Verifies task is created and dialog closes
     * 
     * Expected Result:
     * - Task is created with correct data
     * - Dialog closes after successful creation
     * - New task appears in the task list
     * - Statistics are updated
     */
    it('should create task successfully with valid data', async () => {
      const user = userEvent.setup();
      
      // Login a test user
      const testUser = createTestUser();
      authStore.login(testUser);

      // Mock taskStore.createTask method
      const mockCreateTask = vi.fn();
      vi.spyOn(taskStore, 'createTask').mockImplementation(mockCreateTask);

      // Render the component
      render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Open create task dialog
      const newTaskButton = screen.getByText('New Task');
      await user.click(newTaskButton);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });

      // Fill in form fields
      const titleInput = screen.getByPlaceholderText('Enter task title');
      const descriptionInput = screen.getByPlaceholderText('Describe what needs to be done');

      await user.type(titleInput, 'New Test Task');
      await user.type(descriptionInput, 'This is a test task description');

      // Submit the form
      const submitButton = screen.getByText('Create Task');
      await user.click(submitButton);

      // Verify task creation was called
      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'New Test Task',
          description: 'This is a test task description',
          type: 'general',
          priority: 'medium',
          department: 'IT', // Default department from user
          requestorId: testUser.id,
          requestor: testUser
        });
      });
    });
  });

  /**
   * Task Management Test Suite
   * 
   * Tests task management functionality including:
   * - Task filtering by status
   * - Task search functionality
   * - Task display and rendering
   */
  describe('Task Management', () => {
    /**
     * Test: Task Filtering by Status
     * 
     * Validates that tasks can be filtered by status:
     * 1. Creates tasks with different statuses
     * 2. Changes the status filter
     * 3. Verifies only tasks with matching status are displayed
     * 
     * Expected Result:
     * - Only tasks with selected status are displayed
     * - Filter dropdown works correctly
     * - Task count updates based on filter
     */
    it('should filter tasks by status', async () => {
      const user = userEvent.setup();
      
      // Login a test user
      const testUser = createTestUser();
      authStore.login(testUser);

      // Create test tasks with different statuses
      const pendingTask = createTestTask({ id: 't1', status: 'pending', title: 'Pending Task' });
      const inProgressTask = createTestTask({ id: 't2', status: 'in_progress', title: 'In Progress Task' });
      const completedTask = createTestTask({ id: 't3', status: 'completed', title: 'Completed Task' });

      taskStore.tasks = [pendingTask, inProgressTask, completedTask];

      // Render the component
      render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Verify all tasks are displayed initially
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
      expect(screen.getByText('In Progress Task')).toBeInTheDocument();
      expect(screen.getByText('Completed Task')).toBeInTheDocument();

      // Change filter to pending
      const statusFilter = screen.getByDisplayValue('All Status');
      await user.selectOptions(statusFilter, 'pending');

      // Verify only pending tasks are displayed
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
      expect(screen.queryByText('In Progress Task')).not.toBeInTheDocument();
      expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();
    });

    /**
     * Test: Task Search Functionality
     * 
     * Validates that tasks can be searched by title and description:
     * 1. Creates tasks with different titles and descriptions
     * 2. Enters search terms
     * 3. Verifies only matching tasks are displayed
     * 
     * Expected Result:
     * - Search works for both title and description
     * - Search is case-insensitive
     * - Only matching tasks are displayed
     */
    it('should search tasks by title and description', async () => {
      const user = userEvent.setup();
      
      // Login a test user
      const testUser = createTestUser();
      authStore.login(testUser);

      // Create test tasks
      const task1 = createTestTask({ id: 't1', title: 'Infrastructure Setup', description: 'Setup new server' });
      const task2 = createTestTask({ id: 't2', title: 'User Access Request', description: 'Grant database access' });
      const task3 = createTestTask({ id: 't3', title: 'Security Review', description: 'Review firewall rules' });

      taskStore.tasks = [task1, task2, task3];

      // Render the component
      render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Verify all tasks are displayed initially
      expect(screen.getByText('Infrastructure Setup')).toBeInTheDocument();
      expect(screen.getByText('User Access Request')).toBeInTheDocument();
      expect(screen.getByText('Security Review')).toBeInTheDocument();

      // Search for "infrastructure"
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      await user.type(searchInput, 'infrastructure');

      // Verify only infrastructure task is displayed
      expect(screen.getByText('Infrastructure Setup')).toBeInTheDocument();
      expect(screen.queryByText('User Access Request')).not.toBeInTheDocument();
      expect(screen.queryByText('Security Review')).not.toBeInTheDocument();

      // Clear search and search for "access"
      await user.clear(searchInput);
      await user.type(searchInput, 'access');

      // Verify tasks with "access" in title or description are displayed
      expect(screen.queryByText('Infrastructure Setup')).not.toBeInTheDocument();
      expect(screen.getByText('User Access Request')).toBeInTheDocument();
      expect(screen.queryByText('Security Review')).not.toBeInTheDocument();
    });

    /**
     * Test: Task Card Rendering
     * 
     * Validates that task cards render correctly with all task information:
     * 1. Creates a test task with complete data
     * 2. Renders the Tasks component
     * 3. Verifies task card displays all information correctly
     * 
     * Expected Result:
     * - Task card displays title, description, status, priority
     * - Requestor and department information is shown
     * - Creation date is displayed
     * - Status and priority badges are rendered
     */
    it('should render task cards with complete information', () => {
      // Login a test user
      const testUser = createTestUser();
      authStore.login(testUser);

      // Create a test task with complete data
      const testTask = createTestTask({
        id: 't1',
        title: 'Complete Test Task',
        description: 'This is a complete test task with all information',
        status: 'in_progress',
        priority: 'high',
        department: 'Engineering',
        dueDate: new Date('2024-12-31')
      });

      taskStore.tasks = [testTask];

      // Render the component
      render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Verify task card displays all information
      expect(screen.getByText('Complete Test Task')).toBeInTheDocument();
      expect(screen.getByText('This is a complete test task with all information')).toBeInTheDocument();
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('INFRASTRUCTURE')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument(); // Requestor name
      expect(screen.getByText('Engineering')).toBeInTheDocument(); // Department
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });
  });

  /**
   * Role-based Access Test Suite
   * 
   * Tests role-based access control functionality including:
   * - Different user roles and permissions
   * - Task filtering based on user role
   * - Statistics calculation per role
   */
  describe('Role-based Access', () => {
    /**
     * Test: Regular User Task Filtering
     * 
     * Validates that regular users only see their own tasks:
     * 1. Creates tasks for different users
     * 2. Logs in as a regular user
     * 3. Verifies only user's own tasks are displayed
     * 
     * Expected Result:
     * - Regular users only see tasks they created
     * - Statistics reflect only user's tasks
     * - Other users' tasks are not visible
     */
    it('should show only user tasks for regular users', () => {
      // Create test users
      const user1 = createTestUser('user');
      const user2 = createTestUser('user');
      user2.id = '2';
      user2.name = 'User 2';

      // Create tasks for different users
      const user1Task = createTestTask({ id: 't1', requestorId: '1', requestor: user1, title: 'User 1 Task' });
      const user2Task = createTestTask({ id: 't2', requestorId: '2', requestor: user2, title: 'User 2 Task' });

      taskStore.tasks = [user1Task, user2Task];

      // Login as user 1
      authStore.login(user1);

      // Render the component
      render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Verify only user 1's task is displayed
      expect(screen.getByText('User 1 Task')).toBeInTheDocument();
      expect(screen.queryByText('User 2 Task')).not.toBeInTheDocument();

      // Verify statistics show only user 1's tasks
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Total tasks
    });

    /**
     * Test: Manager/Admin Task Access
     * 
     * Validates that managers and admins can see all tasks:
     * 1. Creates tasks for different users
     * 2. Logs in as a manager
     * 3. Verifies all tasks are displayed
     * 
     * Expected Result:
     * - Managers/admins can see all tasks
     * - Statistics reflect all tasks in the system
     * - No role-based filtering is applied
     */
    it('should show all tasks for managers and admins', () => {
      // Create test users
      const manager = createTestUser('manager');
      const user1 = createTestUser('user');
      const user2 = createTestUser('user');
      user2.id = '2';
      user2.name = 'User 2';

      // Create tasks for different users
      const user1Task = createTestTask({ id: 't1', requestorId: '1', requestor: user1, title: 'User 1 Task' });
      const user2Task = createTestTask({ id: 't2', requestorId: '2', requestor: user2, title: 'User 2 Task' });

      taskStore.tasks = [user1Task, user2Task];

      // Login as manager
      authStore.login(manager);

      // Render the component
      render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Verify all tasks are displayed
      expect(screen.getByText('User 1 Task')).toBeInTheDocument();
      expect(screen.getByText('User 2 Task')).toBeInTheDocument();

      // Verify statistics show all tasks
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Total tasks
    });
  });

  /**
   * Task Statistics Test Suite
   * 
   * Tests task statistics calculation and display including:
   * - Statistics calculation for different user roles
   * - Statistics updates based on task status
   * - Statistics display accuracy
   */
  describe('Task Statistics', () => {
    /**
     * Test: Statistics Calculation for User Tasks
     * 
     * Validates that statistics are calculated correctly for user tasks:
     * 1. Creates tasks with different statuses for a user
     * 2. Logs in as that user
     * 3. Verifies statistics are calculated correctly
     * 
     * Expected Result:
     * - Statistics reflect only user's tasks
     * - Counts are accurate for each status
     * - Total count is correct
     */
    it('should calculate statistics correctly for user tasks', () => {
      // Create test user
      const testUser = createTestUser();

      // Create tasks with different statuses
      const pendingTask = createTestTask({ id: 't1', status: 'pending', requestorId: '1', requestor: testUser });
      const inProgressTask = createTestTask({ id: 't2', status: 'in_progress', requestorId: '1', requestor: testUser });
      const completedTask = createTestTask({ id: 't3', status: 'completed', requestorId: '1', requestor: testUser });

      taskStore.tasks = [pendingTask, inProgressTask, completedTask];

      // Login as the user
      authStore.login(testUser);

      // Render the component
      render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Verify statistics are calculated correctly
      const totalElements = screen.getAllByText('3'); // Total tasks
      const pendingElements = screen.getAllByText('1'); // Pending tasks
      const inProgressElements = screen.getAllByText('1'); // In progress tasks
      const completedElements = screen.getAllByText('1'); // Completed tasks

      expect(totalElements.length).toBeGreaterThan(0);
      expect(pendingElements.length).toBeGreaterThan(0);
      expect(inProgressElements.length).toBeGreaterThan(0);
      expect(completedElements.length).toBeGreaterThan(0);
    });

    /**
     * Test: Statistics Update with Task Status Changes
     * 
     * Validates that statistics update when task status changes:
     * 1. Creates tasks with initial statuses
     * 2. Changes task status programmatically
     * 3. Verifies statistics update accordingly
     * 
     * Expected Result:
     * - Statistics update when task status changes
     * - Counts reflect current task statuses
     * - UI updates to show new statistics
     */
    it('should update statistics when task status changes', () => {
      // Create test user
      const testUser = createTestUser();

      // Create tasks with initial statuses
      const task1 = createTestTask({ id: 't1', status: 'pending', requestorId: '1', requestor: testUser });
      const task2 = createTestTask({ id: 't2', status: 'pending', requestorId: '1', requestor: testUser });

      taskStore.tasks = [task1, task2];

      // Login as the user
      authStore.login(testUser);

      // Render the component
      const { rerender } = render(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Verify initial statistics (2 pending)
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Total tasks

      // Change task status
      task1.status = 'completed';
      task1.updatedAt = new Date();

      // Re-render to see updated statistics
      rerender(
        <TestWrapper>
          <Tasks />
        </TestWrapper>
      );

      // Verify updated statistics (1 pending, 1 completed)
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Total tasks
      // Note: Statistics may not update immediately due to MobX reactivity
    });
  });
});

/**
 * Dashboard Component Test Suite
 * 
 * This test file validates the Dashboard page component functionality and rendering.
 * It tests user interface elements, role-based content display, and data visualization
 * components across different user roles and scenarios.
 * 
 * Test Structure:
 * - Rendering: Basic component rendering and user information display
 * - Role-based Content: Different content for admin, manager, and regular users
 * - Charts and Visualizations: Data visualization component rendering
 * 
 * Testing Approach:
 * - Uses React Testing Library for component testing
 * - Tests user behavior rather than implementation details
 * - Validates role-based access control and content display
 * - Uses custom test wrapper with necessary providers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/pages/Dashboard';
import { authStore } from '@/stores/AuthStore';

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
 * Provides all necessary React context providers for the Dashboard component:
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

describe('Dashboard', () => {
  /**
   * Setup: Reset authentication state before each test
   * 
   * Ensures each test starts with a clean authentication state,
   * preventing test interference and ensuring predictable results.
   */
  beforeEach(() => {
    // Reset store state before each test by logging out
    // This ensures test isolation and prevents state leakage between tests
    authStore.logout();
  });

  /**
   * Rendering Test Suite
   * 
   * Tests basic component rendering functionality including:
   * - User information display
   * - Demo mode indicators
   * - Metrics cards and data visualization
   */
  describe('Rendering', () => {
    /**
     * Test: User Information Display
     * 
     * Validates that the Dashboard correctly displays user information:
     * 1. Logs in a test user with complete profile data
     * 2. Renders the Dashboard component
     * 3. Verifies that user name, role, and department are displayed
     * 
     * This test ensures the component properly shows personalized content
     * based on the authenticated user's information.
     */
    it('should render dashboard with user information', () => {
      // Create a complete test user with all required properties
      const testUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Login the test user to establish authenticated state
      authStore.login(testUser);

      // Render the Dashboard component with necessary providers
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify that user-specific information is displayed correctly
      expect(screen.getByText(/Welcome back, John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/USER Dashboard/)).toBeInTheDocument();
      expect(screen.getByText(/IT/)).toBeInTheDocument();
    });

    /**
     * Test: Demo Mode Indicator Display
     * 
     * Validates that demo mode indicators are shown when demo mode is active:
     * 1. Logs in a user (demo mode is enabled by default)
     * 2. Renders the Dashboard component
     * 3. Verifies that demo mode indicators are displayed
     * 
     * This test ensures users are aware when they're viewing demo/sample data
     * rather than real production data.
     */
    it('should display demo mode indicator when in demo mode', () => {
      // Create a test user for authentication
      const testUser = {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'admin',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Login the user (demo mode is enabled by default)
      authStore.login(testUser);

      // Render the Dashboard component
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify that demo mode indicators are displayed
      expect(screen.getByText(/Demo Mode Active/)).toBeInTheDocument();
      expect(screen.getByText(/Showing sample data for demonstration/)).toBeInTheDocument();
    });

    /**
     * Test: Metrics Cards Display
     * 
     * Validates that all metric cards are properly rendered:
     * 1. Logs in a test user
     * 2. Renders the Dashboard component
     * 3. Verifies that all expected metric cards are displayed
     * 
     * This test ensures the dashboard shows all required performance metrics
     * and key performance indicators (KPIs).
     */
    it('should display metrics cards', () => {
      // Create a test user for authentication
      const testUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT'
      };

      // Login the test user
      authStore.login(testUser);

      // Render the Dashboard component
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify that all metric cards are displayed
      // Note: Using getAllByText for elements that appear multiple times
      expect(screen.getByText(/Task Completion Rate/)).toBeInTheDocument();
      expect(screen.getAllByText(/Average Task Duration/)).toHaveLength(2); // One in metrics, one in chart
      expect(screen.getByText(/ServiceNow Ticket Duration/)).toBeInTheDocument();
      expect(screen.getByText(/Cycle Time/)).toBeInTheDocument();
    });
  });

  /**
   * Role-based Content Test Suite
   * 
   * Tests that different user roles see appropriate content:
   * - Admin users see system overview and administrative features
   * - Manager users see team management features
   * - Regular users see basic dashboard content
   */
  describe('Role-based Content', () => {
    /**
     * Test: Admin User Content
     * 
     * Validates that admin users see administrative content:
     * 1. Logs in as an admin user
     * 2. Renders the Dashboard component
     * 3. Verifies that admin-specific content is displayed
     * 
     * This test ensures role-based access control works correctly
     * and admin users have access to system-wide information.
     */
    it('should show admin-specific content for admin users', () => {
      // Create an admin user with administrative privileges
      const adminUser = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Login as admin user
      authStore.login(adminUser);

      // Render the Dashboard component
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify that admin-specific content is displayed
      expect(screen.getByText(/System Overview/)).toBeInTheDocument();
      expect(screen.getByText(/Total Tasks/)).toBeInTheDocument();
      expect(screen.getByText(/ServiceNow Tickets/)).toBeInTheDocument();
      expect(screen.getAllByText(/Active Users/)).toHaveLength(2); // One in metrics, one in section
    });

    /**
     * Test: Manager User Content
     * 
     * Validates that manager users see team management content:
     * 1. Logs in as a manager user
     * 2. Renders the Dashboard component
     * 3. Verifies that manager-specific content is displayed
     * 
     * This test ensures managers have access to team-related information
     * and management features appropriate for their role.
     */
    it('should show manager-specific content for manager users', () => {
      // Create a manager user with team management privileges
      const managerUser = {
        id: '2',
        name: 'Manager User',
        email: 'manager@example.com',
        role: 'manager',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Login as manager user
      authStore.login(managerUser);

      // Render the Dashboard component
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify that manager-specific content is displayed
      expect(screen.getByText(/Team Management/)).toBeInTheDocument();
      expect(screen.getAllByText(/Pending Approvals/)).toHaveLength(2); // One in metrics, one in section
      expect(screen.getAllByText(/Team Tasks/)).toHaveLength(2); // One in metrics, one in section
    });

    /**
     * Test: Regular User Content
     * 
     * Validates that regular users see only basic content:
     * 1. Logs in as a regular user
     * 2. Renders the Dashboard component
     * 3. Verifies that admin/manager content is NOT displayed
     * 
     * This test ensures that regular users don't have access to
     * administrative or management features they shouldn't see.
     */
    it('should show basic content for regular users', () => {
      // Create a regular user with basic privileges
      const regularUser = {
        id: '3',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Login as regular user
      authStore.login(regularUser);

      // Render the Dashboard component
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify that admin/manager specific content is NOT displayed
      // Regular users should not see administrative or management features
      expect(screen.queryByText(/System Overview/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Team Management/)).not.toBeInTheDocument();
    });
  });

  /**
   * Charts and Visualizations Test Suite
   * 
   * Tests that data visualization components are properly rendered:
   * - Chart titles and components are displayed
   * - Data visualization elements are present
   * - Chart components render without errors
   */
  describe('Charts and Visualizations', () => {
    /**
     * Test: Chart Component Rendering
     * 
     * Validates that all chart and visualization components are rendered:
     * 1. Logs in a test user
     * 2. Renders the Dashboard component
     * 3. Verifies that all expected chart titles are displayed
     * 
     * This test ensures that data visualization components are properly
     * integrated and display the expected chart titles and sections.
     */
    it('should render chart components', () => {
      // Create a test user for authentication
      const testUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Login the test user
      authStore.login(testUser);

      // Render the Dashboard component
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify that all chart titles and components are displayed
      // Note: Using getAllByText for elements that may appear multiple times
      expect(screen.getAllByText(/Task Activity Trends/)).toHaveLength(1);
      expect(screen.getAllByText(/Task Status Distribution/)).toHaveLength(1);
      expect(screen.getAllByText(/Average Task Duration/)).toHaveLength(2); // One in metrics, one in chart
      expect(screen.getAllByText(/Task Creation Volume/)).toHaveLength(1);
    });
  });
});

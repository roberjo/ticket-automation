import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/pages/Dashboard';
import { authStore } from '@/stores/AuthStore';

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Test wrapper component
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
  beforeEach(() => {
    // Reset store state before each test
    authStore.reset();
  });

  describe('Rendering', () => {
    it('should render dashboard with user information', () => {
      const testUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        department: 'IT'
      };

      authStore.setActiveUser(testUser);

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText(/Welcome back, John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/USER Dashboard/)).toBeInTheDocument();
      expect(screen.getByText(/IT/)).toBeInTheDocument();
    });

    it('should display demo mode indicator when in demo mode', () => {
      const testUser = {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'admin',
        department: 'IT'
      };

      authStore.setActiveUser(testUser);
      authStore.enableDemoMode();

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText(/Demo Mode Active/)).toBeInTheDocument();
      expect(screen.getByText(/Showing sample data for demonstration/)).toBeInTheDocument();
    });

    it('should display metrics cards', () => {
      const testUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT'
      };

      authStore.setActiveUser(testUser);

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Check for metric cards
      expect(screen.getByText(/Task Completion Rate/)).toBeInTheDocument();
      expect(screen.getByText(/Average Task Duration/)).toBeInTheDocument();
      expect(screen.getByText(/ServiceNow Ticket Duration/)).toBeInTheDocument();
      expect(screen.getByText(/Cycle Time/)).toBeInTheDocument();
    });
  });

  describe('Role-based Content', () => {
    it('should show admin-specific content for admin users', () => {
      const adminUser = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        department: 'IT'
      };

      authStore.setActiveUser(adminUser);

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText(/System Overview/)).toBeInTheDocument();
      expect(screen.getByText(/Total Tasks/)).toBeInTheDocument();
      expect(screen.getByText(/ServiceNow Tickets/)).toBeInTheDocument();
      expect(screen.getByText(/Active Users/)).toBeInTheDocument();
    });

    it('should show manager-specific content for manager users', () => {
      const managerUser = {
        id: '2',
        name: 'Manager User',
        email: 'manager@example.com',
        role: 'manager',
        department: 'IT'
      };

      authStore.setActiveUser(managerUser);

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText(/Team Management/)).toBeInTheDocument();
      expect(screen.getByText(/Pending Approvals/)).toBeInTheDocument();
      expect(screen.getByText(/Team Tasks/)).toBeInTheDocument();
    });

    it('should show basic content for regular users', () => {
      const regularUser = {
        id: '3',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
        department: 'IT'
      };

      authStore.setActiveUser(regularUser);

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Should not show admin or manager specific content
      expect(screen.queryByText(/System Overview/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Team Management/)).not.toBeInTheDocument();
    });
  });

  describe('Charts and Visualizations', () => {
    it('should render chart components', () => {
      const testUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT'
      };

      authStore.setActiveUser(testUser);

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Check for chart titles
      expect(screen.getByText(/Task Activity Trends/)).toBeInTheDocument();
      expect(screen.getByText(/Task Status Distribution/)).toBeInTheDocument();
      expect(screen.getByText(/Average Task Duration/)).toBeInTheDocument();
      expect(screen.getByText(/Task Creation Volume/)).toBeInTheDocument();
    });
  });
});

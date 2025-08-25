/**
 * Test Utilities and Helpers
 * 
 * This file provides common utilities, mock data, and helper functions
 * for testing React components and application functionality.
 * 
 * Purpose:
 * - Custom render function with all necessary providers
 * - Test data factories for consistent test data
 * - Mock API responses for testing API integration
 * - Helper functions for common testing patterns
 * - Re-export of React Testing Library utilities
 * 
 * Usage:
 * - Import custom render function instead of React Testing Library's render
 * - Use test data factories for consistent test data across tests
 * - Use mock API responses for testing API-dependent components
 * - Use helper functions for common testing operations
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * Test QueryClient Factory
 * 
 * Creates a new QueryClient instance for each test to ensure
 * test isolation and prevent state leakage between tests.
 * 
 * Configuration:
 * - Disables retries for faster test execution
 * - Provides clean state for each test
 * - Prevents test interference from cached queries
 */
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for faster test execution
    },
    mutations: {
      retry: false, // Disable retries for faster test execution
    },
  },
});

/**
 * AllTheProviders Component
 * 
 * Wraps components with all necessary React context providers
 * required for proper component rendering in tests.
 * 
 * Providers included:
 * - QueryClientProvider: For React Query state management
 * - TooltipProvider: For tooltip functionality
 * - BrowserRouter: For React Router navigation
 * 
 * This ensures components have access to all required context
 * and can render properly in the test environment.
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

/**
 * Custom Render Function
 * 
 * Enhanced version of React Testing Library's render function
 * that automatically includes all necessary providers.
 * 
 * Benefits:
 * - Reduces boilerplate in individual tests
 * - Ensures consistent provider setup across all tests
 * - Provides clean, isolated test environment
 * - Supports all React Testing Library options
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export all React Testing Library utilities
export * from '@testing-library/react';
// Export custom render function as the default render
export { customRender as render };

/**
 * Test User Data Factory
 * 
 * Provides consistent test user data across all tests.
 * Each user has different roles and permissions for testing
 * role-based access control and user-specific functionality.
 * 
 * User Types:
 * - admin: Full system access and administrative privileges
 * - manager: Team management and approval capabilities
 * - user: Basic user access and task management
 */
export const testUsers = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const, // Type assertion for TypeScript
    department: 'IT'
  },
  manager: {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'manager' as const, // Type assertion for TypeScript
    department: 'IT'
  },
  user: {
    id: '3',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user' as const, // Type assertion for TypeScript
    department: 'IT'
  }
};

/**
 * Mock Task Data
 * 
 * Provides realistic test data for tasks and metrics.
 * Used for testing components that display task information,
 * metrics, and data visualization components.
 * 
 * Data Structure:
 * - tasks: Array of task objects with various statuses and priorities
 * - metrics: Performance metrics and KPIs for dashboard display
 */
export const mockTaskData = {
  tasks: [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Test description',
      status: 'pending',
      priority: 'medium',
      assignee: 'user@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Another test description',
      status: 'in_progress',
      priority: 'high',
      assignee: 'manager@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  metrics: {
    taskCompletionRate: 75.5, // Percentage of completed tasks
    avgTaskDuration: 3.2, // Average task duration in days
    avgTicketDuration: 2.1, // Average ServiceNow ticket duration
    avgCycleTime: 4.5, // Average cycle time in days
    totalTasks: 25, // Total number of tasks
    totalTickets: 18, // Total number of ServiceNow tickets
    pendingApprovals: 3 // Number of tasks awaiting approval
  }
};

/**
 * Mock API Responses
 * 
 * Provides realistic API response data for testing components
 * that depend on API calls. Includes both success and error responses.
 * 
 * Response Types:
 * - success: Successful API responses with data
 * - error: Error responses for testing error handling
 * 
 * Usage:
 * - Mock API calls in tests using MSW (Mock Service Worker)
 * - Test error handling and loading states
 * - Validate component behavior with different API responses
 */
export const mockApiResponses = {
  tasks: {
    success: {
      data: mockTaskData.tasks, // Use the mock task data
      status: 200 // HTTP success status
    },
    error: {
      error: 'Failed to fetch tasks', // Error message
      status: 500 // HTTP error status
    }
  },
  metrics: {
    success: {
      data: mockTaskData.metrics, // Use the mock metrics data
      status: 200 // HTTP success status
    }
  }
};

/**
 * Wait Helper Function
 * 
 * Utility function to wait for a specified number of milliseconds.
 * Useful for testing async operations, animations, and timing-dependent behavior.
 * 
 * @param ms - Number of milliseconds to wait
 * @returns Promise that resolves after the specified delay
 * 
 * Usage:
 * - Wait for async operations to complete
 * - Test timing-dependent functionality
 * - Simulate real-world delays
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock Match Media Helper
 * 
 * Utility function to mock window.matchMedia for responsive design testing.
 * Allows tests to simulate different screen sizes and media query conditions.
 * 
 * @param matches - Boolean indicating if the media query should match
 * 
 * Usage:
 * - Test responsive design behavior
 * - Simulate mobile vs desktop layouts
 * - Test media query-dependent functionality
 * 
 * Note: This function uses jest.fn() which should be available in the test environment
 */
export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches, // Use the provided matches parameter
      media: query, // Store the original query string
      onchange: null, // Event handler for media query changes
      addListener: jest.fn(), // Mock function for deprecated API
      removeListener: jest.fn(), // Mock function for deprecated API
      addEventListener: jest.fn(), // Mock function for modern API
      removeEventListener: jest.fn(), // Mock function for modern API
      dispatchEvent: jest.fn(), // Mock function for event dispatching
    })),
  });
};

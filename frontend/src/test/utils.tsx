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
 * Shared Test QueryClient
 * 
 * Creates a single QueryClient instance shared across all tests to reduce
 * overhead and improve performance. This eliminates the need to create
 * a new QueryClient for each test.
 * 
 * Configuration:
 * - Disables retries for faster test execution
 * - Provides clean state for each test
 * - Prevents test interference from cached queries
 * - Improves performance by reducing object creation overhead
 */
const sharedQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for faster test execution
      staleTime: 0, // Always consider data stale for immediate refetch
      cacheTime: 0, // Don't cache data between tests
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
 * - QueryClientProvider: For React Query state management (shared instance)
 * - TooltipProvider: For tooltip functionality
 * - BrowserRouter: For React Router navigation
 * 
 * This ensures components have access to all required context
 * and can render properly in the test environment.
 * 
 * Performance Optimization:
 * - Uses shared QueryClient to reduce object creation overhead
 * - Minimizes provider nesting for better performance
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={sharedQueryClient}>
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
 * - Improved performance through shared providers
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
 * Creates test user objects with different roles for testing
 * role-based access control and functionality.
 * 
 * Performance Optimization:
 * - Uses object pooling to reduce memory allocation
 * - Provides consistent test data structure
 * - Supports role-based testing scenarios
 */
const userPool = new Map<string, User>();

const createTestUser = (role: 'user' | 'manager' | 'admin' = 'user'): User => {
  const key = `user-${role}`;
  if (userPool.has(key)) {
    return userPool.get(key)!;
  }
  
  const user: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role,
    department: 'IT',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date()
  };
  
  userPool.set(key, user);
  return user;
};

/**
 * Test Task Data Factory
 * 
 * Creates test task objects with different properties for testing
 * task management functionality.
 * 
 * Performance Optimization:
 * - Uses object pooling to reduce memory allocation
 * - Provides consistent test data structure
 * - Supports various task scenarios
 */
const taskPool = new Map<string, Task>();

const createTestTask = (overrides: Partial<Task> = {}): Task => {
  const key = JSON.stringify(overrides);
  if (taskPool.has(key)) {
    return { ...taskPool.get(key)! };
  }
  
  const defaultUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    department: 'IT',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date()
  };
  
  const task: Task = {
    id: 't1',
    title: 'Test Task',
    description: 'Test task description',
    type: 'infrastructure',
    status: 'pending',
    priority: 'medium',
    requestorId: '1',
    requestor: defaultUser,
    department: 'IT',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(),
    updatedAt: new Date(),
    formData: {},
    ...overrides
  };
  
  taskPool.set(key, task);
  return { ...task };
};

/**
 * Test ServiceNow Ticket Data Factory
 * 
 * Creates test ServiceNow ticket objects for testing ticket
 * management functionality.
 * 
 * Performance Optimization:
 * - Uses object pooling to reduce memory allocation
 * - Provides consistent test data structure
 * - Supports various ticket scenarios
 */
const ticketPool = new Map<string, ServiceNowTicket>();

const createTestTicket = (overrides: Partial<ServiceNowTicket> = {}): ServiceNowTicket => {
  const key = JSON.stringify(overrides);
  if (ticketPool.has(key)) {
    return { ...ticketPool.get(key)! };
  }
  
  const ticket: ServiceNowTicket = {
    id: 'INC0001234',
    number: 'INC0001234',
    title: 'Test Ticket',
    description: 'Test ticket description',
    status: 'new',
    priority: 'medium',
    assignmentGroup: 'Infrastructure Team',
    assignedTo: 'Infrastructure Admin',
    requestor: 'Test User',
    category: 'Infrastructure',
    subcategory: 'Network',
    impact: 'Medium',
    urgency: 'Medium',
    createdBy: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
    durationDays: 3,
    relatedTaskId: 't1',
    ...overrides
  };
  
  ticketPool.set(key, ticket);
  return { ...ticket };
};

/**
 * Mock API Responses
 * 
 * Provides mock API responses for testing API-dependent components.
 * These responses simulate real API behavior without requiring
 * actual network requests.
 */
export const mockApiResponses = {
  tasks: {
    success: {
      data: [
        createTestTask({ id: 't1', title: 'Task 1' }),
        createTestTask({ id: 't2', title: 'Task 2' }),
      ],
      status: 200,
    },
    error: {
      error: 'Failed to fetch tasks',
      status: 500,
    },
  },
  tickets: {
    success: {
      data: [
        createTestTicket({ id: 'INC0001234', title: 'Ticket 1' }),
        createTestTicket({ id: 'INC0001235', title: 'Ticket 2' }),
      ],
      status: 200,
    },
    error: {
      error: 'Failed to fetch tickets',
      status: 500,
    },
  },
};

/**
 * Helper Functions
 * 
 * Common utility functions for testing operations.
 */

/**
 * Wait for a condition to be true
 * 
 * Utility function to wait for asynchronous operations to complete.
 * Useful for testing state changes and API responses.
 */
export const waitFor = (condition: () => boolean, timeout = 1000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Condition not met within timeout'));
      } else {
        setTimeout(checkCondition, 10);
      }
    };
    
    checkCondition();
  });
};

/**
 * Mock matchMedia for responsive testing
 * 
 * Utility function to mock window.matchMedia for testing
 * responsive design components.
 */
export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Export test data factories
export { createTestUser, createTestTask, createTestTicket };

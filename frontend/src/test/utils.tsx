import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Custom render function that includes all necessary providers
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

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test user data
export const testUsers = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const,
    department: 'IT'
  },
  manager: {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'manager' as const,
    department: 'IT'
  },
  user: {
    id: '3',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user' as const,
    department: 'IT'
  }
};

// Mock data for testing
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
    taskCompletionRate: 75.5,
    avgTaskDuration: 3.2,
    avgTicketDuration: 2.1,
    avgCycleTime: 4.5,
    totalTasks: 25,
    totalTickets: 18,
    pendingApprovals: 3
  }
};

// Mock API responses
export const mockApiResponses = {
  tasks: {
    success: {
      data: mockTaskData.tasks,
      status: 200
    },
    error: {
      error: 'Failed to fetch tasks',
      status: 500
    }
  },
  metrics: {
    success: {
      data: mockTaskData.metrics,
      status: 200
    }
  }
};

// Helper function to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to mock window.matchMedia
export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

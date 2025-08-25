# Frontend Testing Documentation

## Table of Contents

1. [Overview](#overview)
2. [Testing Framework](#testing-framework)
3. [Testing Strategy](#testing-strategy)
4. [Setup and Configuration](#setup-and-configuration)
5. [Test Structure](#test-structure)
6. [How to Create Tests](#how-to-create-tests)
7. [How to Run Tests](#how-to-run-tests)
8. [How to Interpret Tests](#how-to-interpret-tests)
9. [Testing Best Practices](#testing-best-practices)
10. [Common Patterns](#common-patterns)
11. [Troubleshooting](#troubleshooting)
12. [Advanced Testing](#advanced-testing)

## Overview

This document provides comprehensive guidance for testing the ServiceNow Ticket Automation frontend application. The testing framework is built on modern tools and follows industry best practices to ensure code quality, reliability, and maintainability.

### Key Features

- **Modern Testing Stack**: Vitest + React Testing Library
- **Component Testing**: User-centric testing approach
- **Store Testing**: MobX state management testing
- **Integration Testing**: API and workflow testing
- **Mocking**: Comprehensive mock setup for external dependencies
- **CI/CD Ready**: Automated testing pipeline integration

## Testing Framework

### Core Technologies

#### **Vitest**
- **Purpose**: Fast unit testing framework
- **Benefits**: Native TypeScript support, fast execution, Vite integration
- **Version**: 1.0.0+

#### **React Testing Library**
- **Purpose**: Component testing utilities
- **Philosophy**: Test user behavior, not implementation details
- **Version**: 14.0.0+

#### **Jest DOM**
- **Purpose**: Custom DOM element matchers
- **Benefits**: Enhanced assertions for DOM testing
- **Version**: 6.1.0+

#### **JS DOM**
- **Purpose**: Browser environment simulation
- **Benefits**: DOM API mocking for Node.js testing
- **Version**: 23.0.0+

#### **Mock Service Worker (MSW)**
- **Purpose**: API mocking and interception
- **Benefits**: Realistic API testing without network calls
- **Version**: 2.0.0+

### Framework Architecture

```
Testing Stack
├── Vitest (Test Runner)
├── React Testing Library (Component Testing)
├── Jest DOM (DOM Matchers)
├── JS DOM (Browser Environment)
├── MSW (API Mocking)
└── Custom Test Utilities
```

## Testing Strategy

### Testing Pyramid

```
    /\
   /  \     E2E Tests (Few)
  /____\    Integration Tests (Some)
 /______\   Unit Tests (Many)
```

### Test Categories

#### **1. Unit Tests (Foundation)**
- **Scope**: Individual functions, components, stores
- **Coverage**: 70-80% of codebase
- **Speed**: Fast execution (< 100ms per test)
- **Examples**: Store methods, utility functions, component rendering

#### **2. Integration Tests (Middle Layer)**
- **Scope**: Component interactions, API integration
- **Coverage**: 15-20% of codebase
- **Speed**: Medium execution (100ms - 1s per test)
- **Examples**: Component communication, API service calls

#### **3. End-to-End Tests (Top Layer)**
- **Scope**: Complete user workflows
- **Coverage**: 5-10% of codebase
- **Speed**: Slow execution (1s+ per test)
- **Examples**: User registration, task creation workflow

### Testing Principles

#### **1. User-Centric Testing**
```typescript
// ❌ Bad: Testing implementation details
expect(component.state.isOpen).toBe(true);

// ✅ Good: Testing user behavior
expect(screen.getByRole('dialog')).toBeInTheDocument();
```

#### **2. Accessibility-First**
```typescript
// ✅ Good: Using semantic queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email address/i);
```

#### **3. Realistic Testing**
```typescript
// ✅ Good: Testing real user interactions
userEvent.click(screen.getByRole('button'));
userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
```

## Setup and Configuration

### Project Structure

```
frontend/
├── src/
│   ├── test/
│   │   ├── setup.ts          # Global test setup
│   │   ├── utils.tsx         # Test utilities
│   │   ├── AuthStore.test.ts # Store tests
│   │   └── Dashboard.test.tsx # Component tests
│   ├── components/
│   ├── pages/
│   └── stores/
├── package.json
└── vite.config.ts
```

### Configuration Files

#### **Vite Configuration** (`vite.config.ts`)
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  // ... existing config
  test: {
    globals: true,                    // Global test functions
    environment: 'jsdom',            // Browser environment
    setupFiles: ['./src/test/setup.ts'], // Test setup
    css: true,                       // CSS processing
  },
}));
```

#### **Test Setup** (`src/test/setup.ts`)
```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

#### **Test Utilities** (`src/test/utils.tsx`)
```typescript
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
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

export * from '@testing-library/react';
export { customRender as render };
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",                    // Run tests in watch mode
    "test:ui": "vitest --ui",           // Run tests with UI
    "test:run": "vitest run",           // Run tests once
    "test:coverage": "vitest run --coverage", // Run tests with coverage
    "test:watch": "vitest --watch"      // Run tests in watch mode
  }
}
```

## Test Structure

### Test File Organization

```
Test File Structure
├── Imports
├── Test Suite (describe)
│   ├── Setup (beforeEach/afterEach)
│   ├── Test Cases (it/test)
│   │   ├── Arrange (setup)
│   │   ├── Act (execute)
│   │   └── Assert (verify)
│   └── Cleanup (afterAll)
└── Helper Functions
```

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from '@/components/Component';

describe('Component', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset state, clear mocks, etc.
  });

  // Test suite for specific functionality
  describe('Rendering', () => {
    it('should render component correctly', () => {
      // Arrange
      const props = { title: 'Test Title' };
      
      // Act
      render(<Component {...props} />);
      
      // Assert
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
  });

  // Test suite for user interactions
  describe('User Interactions', () => {
    it('should handle button click', async () => {
      // Arrange
      const mockHandler = vi.fn();
      render(<Component onClick={mockHandler} />);
      
      // Act
      await userEvent.click(screen.getByRole('button'));
      
      // Assert
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });
});
```

## How to Create Tests

### Step-by-Step Guide

#### **1. Identify What to Test**

**Component Tests:**
- User interactions (clicks, form submissions)
- Rendering behavior (props, state changes)
- Accessibility features
- Error states and edge cases

**Store Tests:**
- State changes
- Action dispatching
- Computed values
- Error handling

#### **2. Choose Test Type**

```typescript
// Unit Test: Testing individual function
describe('utility function', () => {
  it('should format date correctly', () => {
    expect(formatDate('2024-01-01')).toBe('Jan 1, 2024');
  });
});

// Component Test: Testing user behavior
describe('Button component', () => {
  it('should call onClick when clicked', async () => {
    const mockClick = vi.fn();
    render(<Button onClick={mockClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalled();
  });
});

// Integration Test: Testing component interactions
describe('Form submission', () => {
  it('should submit form data', async () => {
    const mockSubmit = vi.fn();
    render(<Form onSubmit={mockSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/name/i), 'John');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({ name: 'John' });
  });
});
```

#### **3. Write Test Structure**

```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Reset state, clear mocks
  });

  // Test cases
  describe('Feature', () => {
    it('should do something', () => {
      // Test implementation
    });
  });
});
```

#### **4. Implement Test Logic**

```typescript
it('should display user information', () => {
  // Arrange: Set up test data and render component
  const user = { name: 'John Doe', email: 'john@example.com' };
  render(<UserProfile user={user} />);
  
  // Act: No action needed for rendering test
  
  // Assert: Verify expected behavior
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});
```

### Test Examples by Type

#### **Component Test Example**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should call onClick when clicked', async () => {
    const mockClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={mockClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### **Store Test Example**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { taskStore } from '@/stores/TaskStore';

describe('TaskStore', () => {
  beforeEach(() => {
    // Reset store state
    taskStore.reset();
  });

  it('should add new task', () => {
    const task = { id: '1', title: 'Test Task', status: 'pending' };
    
    taskStore.addTask(task);
    
    expect(taskStore.tasks).toHaveLength(1);
    expect(taskStore.tasks[0]).toEqual(task);
  });

  it('should update task status', () => {
    const task = { id: '1', title: 'Test Task', status: 'pending' };
    taskStore.addTask(task);
    
    taskStore.updateTaskStatus('1', 'completed');
    
    expect(taskStore.tasks[0].status).toBe('completed');
  });

  it('should calculate completion rate', () => {
    taskStore.addTask({ id: '1', title: 'Task 1', status: 'completed' });
    taskStore.addTask({ id: '2', title: 'Task 2', status: 'pending' });
    
    expect(taskStore.completionRate).toBe(50);
  });
});
```

#### **Integration Test Example**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { TaskList } from '@/components/TaskList';

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', title: 'Task 1', status: 'pending' },
      { id: '2', title: 'Task 2', status: 'completed' }
    ]));
  })
);

describe('TaskList Integration', () => {
  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('should load and display tasks', async () => {
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });
});
```

## How to Run Tests

### Basic Commands

#### **Run All Tests**
```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

#### **Run Specific Tests**
```bash
# Run specific test file
npm run test:run -- src/test/AuthStore.test.ts

# Run tests matching pattern
npm run test:run -- --grep "AuthStore"

# Run tests in specific directory
npm run test:run -- src/test/
```

#### **Run Tests with Coverage**
```bash
# Generate coverage report
npm run test:coverage

# Run with specific coverage threshold
npm run test:coverage -- --coverage.threshold.lines=80
```

### Watch Mode

```bash
# Start watch mode
npm run test:watch

# Watch specific files
npm run test:watch -- src/test/AuthStore.test.ts
```

### UI Mode

```bash
# Open test UI
npm run test:ui
```

The UI provides:
- Test runner interface
- Real-time test results
- Coverage visualization
- Test debugging tools

### Debugging Tests

#### **Debug Mode**
```bash
# Run tests in debug mode
npm run test:run -- --reporter=verbose

# Run single test with debug
npm run test:run -- --reporter=verbose src/test/AuthStore.test.ts
```

#### **Console Logging**
```typescript
it('should debug test', () => {
  console.log('Debug information');
  expect(true).toBe(true);
});
```

## How to Interpret Tests

### Test Output Understanding

#### **Passing Test**
```
✓ AuthStore > User Management > should login user (15ms)
```

**Interpretation:**
- `✓` = Test passed
- `AuthStore` = Test suite name
- `User Management` = Nested describe block
- `should login user` = Test case name
- `(15ms)` = Execution time

#### **Failing Test**
```
✗ AuthStore > User Management > should login user
TypeError: authStore.login is not a function
  at src/test/AuthStore.test.ts:25:15
```

**Interpretation:**
- `✗` = Test failed
- Error type and message
- File location and line number
- Stack trace for debugging

#### **Test Summary**
```
Test Files  2 passed (2)
Tests  14 passed (14)
Duration  80.06s
```

**Interpretation:**
- `2 passed (2)` = 2 test files passed out of 2 total
- `14 passed (14)` = 14 test cases passed out of 14 total
- `Duration` = Total execution time

### Coverage Reports

#### **Coverage Output**
```
% Statements   : 85.71 ( 6/7 )
% Branches     : 80.00 ( 4/5 )
% Functions    : 90.00 ( 9/10 )
% Lines        : 85.71 ( 6/7 )
```

**Interpretation:**
- `Statements` = Individual code statements executed
- `Branches` = Conditional branches (if/else) executed
- `Functions` = Functions called during testing
- `Lines` = Lines of code executed

#### **Coverage Thresholds**
```typescript
// In vite.config.ts
test: {
  coverage: {
    thresholds: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
}
```

### Performance Metrics

#### **Test Performance**
```
✓ AuthStore.test.ts (7) - 29.63s
✓ Dashboard.test.tsx (7) - 1745ms
```

**Interpretation:**
- File name and test count
- Execution time
- Performance bottlenecks identification

## Testing Best Practices

### 1. Test Organization

#### **File Naming Convention**
```
ComponentName.test.tsx    // Component tests
StoreName.test.ts         // Store tests
utility.test.ts          // Utility function tests
integration.test.ts      // Integration tests
```

#### **Test Structure**
```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  // Happy path tests
  describe('when component loads', () => {
    it('should render correctly', () => {
      // Test implementation
    });
  });

  // Edge cases
  describe('when data is missing', () => {
    it('should show loading state', () => {
      // Test implementation
    });
  });

  // Error cases
  describe('when error occurs', () => {
    it('should display error message', () => {
      // Test implementation
    });
  });
});
```

### 2. Test Data Management

#### **Test Data Factories**
```typescript
// test/factories/user.ts
export const createUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  department: 'IT',
  isActive: true,
  createdAt: new Date(),
  lastLogin: new Date(),
  ...overrides
});

// Usage in tests
const adminUser = createUser({ role: 'admin', name: 'Admin User' });
```

#### **Mock Data**
```typescript
// test/mocks/api.ts
export const mockApiResponses = {
  tasks: {
    success: {
      data: [
        { id: '1', title: 'Task 1', status: 'pending' },
        { id: '2', title: 'Task 2', status: 'completed' }
      ],
      status: 200
    },
    error: {
      error: 'Failed to fetch tasks',
      status: 500
    }
  }
};
```

### 3. Assertion Best Practices

#### **Use Descriptive Assertions**
```typescript
// ❌ Bad: Generic assertion
expect(result).toBeTruthy();

// ✅ Good: Specific assertion
expect(result).toHaveProperty('id', '123');
expect(result).toHaveLength(3);
```

#### **Test One Thing at a Time**
```typescript
// ❌ Bad: Multiple assertions in one test
it('should handle user data', () => {
  expect(user.name).toBe('John');
  expect(user.email).toBe('john@example.com');
  expect(user.role).toBe('admin');
});

// ✅ Good: Focused tests
it('should set user name', () => {
  expect(user.name).toBe('John');
});

it('should set user email', () => {
  expect(user.email).toBe('john@example.com');
});
```

### 4. Async Testing

#### **Proper Async Handling**
```typescript
// ✅ Good: Using async/await
it('should fetch data', async () => {
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});

// ✅ Good: Using userEvent
it('should handle form submission', async () => {
  const user = userEvent.setup();
  render(<Form />);
  
  await user.type(screen.getByLabelText(/name/i), 'John');
  await user.click(screen.getByRole('button'));
  
  expect(mockSubmit).toHaveBeenCalled();
});
```

## Common Patterns

### 1. Component Testing Patterns

#### **Render and Assert Pattern**
```typescript
it('should render component', () => {
  render(<Component />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

#### **Props Testing Pattern**
```typescript
it('should render with props', () => {
  render(<Component title="Test Title" />);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
});
```

#### **User Interaction Pattern**
```typescript
it('should handle user interaction', async () => {
  const user = userEvent.setup();
  const mockHandler = vi.fn();
  
  render(<Component onClick={mockHandler} />);
  await user.click(screen.getByRole('button'));
  
  expect(mockHandler).toHaveBeenCalled();
});
```

### 2. Store Testing Patterns

#### **State Change Pattern**
```typescript
it('should update state', () => {
  const initialState = store.value;
  store.updateValue('new value');
  expect(store.value).toBe('new value');
  expect(store.value).not.toBe(initialState);
});
```

#### **Computed Value Pattern**
```typescript
it('should compute derived value', () => {
  store.addItem({ id: '1', completed: true });
  store.addItem({ id: '2', completed: false });
  
  expect(store.completedCount).toBe(1);
  expect(store.completionRate).toBe(50);
});
```

### 3. API Testing Patterns

#### **Mock API Pattern**
```typescript
const server = setupServer(
  rest.get('/api/data', (req, res, ctx) => {
    return res(ctx.json({ data: 'test' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### **Error Handling Pattern**
```typescript
it('should handle API errors', async () => {
  server.use(
    rest.get('/api/data', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );
  
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues and Solutions

#### **1. Test Not Finding Elements**

**Problem:**
```typescript
// Error: Unable to find element with text: "Submit"
```

**Solutions:**
```typescript
// Use more specific queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/submit form/i);
screen.getByTestId('submit-button');

// Wait for async operations
await waitFor(() => {
  expect(screen.getByText('Submit')).toBeInTheDocument();
});
```

#### **2. Async Test Failures**

**Problem:**
```typescript
// Error: Expected element to be in document but it wasn't
```

**Solutions:**
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// Use findBy queries
const element = await screen.findByText('Data loaded');
expect(element).toBeInTheDocument();
```

#### **3. Mock Not Working**

**Problem:**
```typescript
// Error: mock function not called
```

**Solutions:**
```typescript
// Ensure mock is properly set up
const mockFn = vi.fn();
vi.mock('@/utils/api', () => ({
  fetchData: mockFn
}));

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

#### **4. Component Not Rendering**

**Problem:**
```typescript
// Error: Component not rendering expected content
```

**Solutions:**
```typescript
// Check if providers are needed
render(
  <Provider>
    <Component />
  </Provider>
);

// Check for required props
render(<Component requiredProp="value" />);

// Check for error boundaries
render(<ErrorBoundary><Component /></ErrorBoundary>);
```

### Debugging Techniques

#### **1. Console Logging**
```typescript
it('should debug test', () => {
  console.log('Component props:', props);
  console.log('Component state:', component.state);
  expect(true).toBe(true);
});
```

#### **2. Screen Debugging**
```typescript
it('should debug screen', () => {
  render(<Component />);
  screen.debug(); // Logs entire DOM
  screen.debug(screen.getByRole('button')); // Logs specific element
});
```

#### **3. Test Isolation**
```typescript
it.only('should run only this test', () => {
  // This test will run alone
});

it.skip('should skip this test', () => {
  // This test will be skipped
});
```

## Advanced Testing

### 1. Custom Hooks Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### 2. Context Testing

```typescript
const TestWrapper = ({ children, value }) => (
  <MyContext.Provider value={value}>
    {children}
  </MyContext.Provider>
);

it('should use context value', () => {
  const contextValue = { user: { name: 'John' } };
  
  render(
    <TestWrapper value={contextValue}>
      <Component />
    </TestWrapper>
  );
  
  expect(screen.getByText('John')).toBeInTheDocument();
});
```

### 3. Router Testing

```typescript
import { MemoryRouter } from 'react-router-dom';

it('should navigate to correct route', async () => {
  const user = userEvent.setup();
  
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  
  await user.click(screen.getByText(/dashboard/i));
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});
```

### 4. Performance Testing

```typescript
it('should render within performance budget', () => {
  const startTime = performance.now();
  
  render(<HeavyComponent />);
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  expect(renderTime).toBeLessThan(100); // 100ms budget
});
```

### 5. Visual Regression Testing

```typescript
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

it('should match visual snapshot', async () => {
  render(<Component />);
  
  const element = screen.getByTestId('component');
  const screenshot = await element.screenshot();
  
  expect(screenshot).toMatchImageSnapshot();
});
```

## Conclusion

This comprehensive testing documentation provides the foundation for maintaining high-quality, reliable frontend code. By following these guidelines and best practices, you can ensure that your tests are:

- **Maintainable**: Well-organized and easy to understand
- **Reliable**: Consistent and not flaky
- **Comprehensive**: Covering all critical functionality
- **Fast**: Efficient execution for quick feedback
- **User-focused**: Testing behavior rather than implementation

Remember that testing is an iterative process. Start with the basics and gradually add more sophisticated tests as your application grows. The goal is to build confidence in your code changes and catch issues early in the development cycle.

For additional resources and advanced testing techniques, refer to:
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

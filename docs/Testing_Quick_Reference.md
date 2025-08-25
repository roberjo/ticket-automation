# Testing Quick Reference Guide

## Quick Commands

### Run Tests
```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test:run -- src/test/AuthStore.test.ts

# Run tests with coverage
npm run test:coverage
```

### Debug Tests
```bash
# Run with verbose output
npm run test:run -- --reporter=verbose

# Run single test
npm run test:run -- --grep "should login user"
```

## Common Test Patterns

### Component Testing

#### Basic Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { Component } from '@/components/Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

#### User Interaction Test
```typescript
import { userEvent } from '@testing-library/user-event';

it('should handle click', async () => {
  const user = userEvent.setup();
  const mockClick = vi.fn();
  
  render(<Button onClick={mockClick}>Click me</Button>);
  await user.click(screen.getByRole('button'));
  
  expect(mockClick).toHaveBeenCalled();
});
```

#### Form Testing
```typescript
it('should submit form', async () => {
  const user = userEvent.setup();
  const mockSubmit = vi.fn();
  
  render(<Form onSubmit={mockSubmit} />);
  
  await user.type(screen.getByLabelText(/name/i), 'John');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(mockSubmit).toHaveBeenCalledWith({ name: 'John' });
});
```

### Store Testing

#### Basic Store Test
```typescript
import { store } from '@/stores/Store';

describe('Store', () => {
  beforeEach(() => {
    store.reset(); // Reset state
  });

  it('should update state', () => {
    store.setValue('test');
    expect(store.value).toBe('test');
  });
});
```

#### Computed Value Test
```typescript
it('should calculate derived value', () => {
  store.addItem({ id: '1', completed: true });
  store.addItem({ id: '2', completed: false });
  
  expect(store.completionRate).toBe(50);
});
```

### API Testing

#### Mock API Response
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/data', (req, res, ctx) => {
    return res(ctx.json({ data: 'test' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### Error Handling Test
```typescript
it('should handle API error', async () => {
  server.use(
    rest.get('/api/data', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );
  
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
```

## Common Queries

### Finding Elements
```typescript
// By role (preferred)
screen.getByRole('button');
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });

// By label
screen.getByLabelText(/email address/i);

// By text
screen.getByText('Submit');
screen.getByText(/submit/i); // Case insensitive

// By test ID
screen.getByTestId('submit-button');

// By placeholder
screen.getByPlaceholderText('Enter email');

// By display value
screen.getByDisplayValue('john@example.com');
```

### Multiple Elements
```typescript
// Get all elements
screen.getAllByRole('button');
screen.getAllByText(/task/i);

// Query (returns null if not found)
screen.queryByText('Not found'); // Returns null
screen.queryByRole('button'); // Returns null if no button
```

### Async Elements
```typescript
// Wait for element to appear
await screen.findByText('Data loaded');
await screen.findByRole('button');

// Wait for with timeout
await screen.findByText('Data loaded', {}, { timeout: 5000 });
```

## Common Assertions

### Element Presence
```typescript
expect(screen.getByText('Hello')).toBeInTheDocument();
expect(screen.queryByText('Error')).not.toBeInTheDocument();
```

### Element Properties
```typescript
expect(screen.getByRole('button')).toBeEnabled();
expect(screen.getByRole('button')).toBeDisabled();
expect(screen.getByRole('checkbox')).toBeChecked();
expect(screen.getByRole('checkbox')).not.toBeChecked();
```

### Element Content
```typescript
expect(screen.getByRole('button')).toHaveTextContent('Submit');
expect(screen.getByRole('textbox')).toHaveValue('test@example.com');
expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
```

### Function Calls
```typescript
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledTimes(1);
expect(mockFunction).toHaveBeenCalledWith('argument');
expect(mockFunction).not.toHaveBeenCalled();
```

## Test Data Factories

### User Factory
```typescript
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

// Usage
const adminUser = createUser({ role: 'admin', name: 'Admin User' });
```

### Task Factory
```typescript
export const createTask = (overrides = {}) => ({
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: 'pending',
  priority: 'medium',
  assignee: 'user@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});
```

## Common Setup Patterns

### Test Wrapper
```typescript
const TestWrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    <BrowserRouter>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

// Usage
render(
  <TestWrapper>
    <Component />
  </TestWrapper>
);
```

### Mock Setup
```typescript
beforeEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Reset stores
  authStore.logout();
  taskStore.reset();
  
  // Clear localStorage
  localStorage.clear();
});
```

## Debugging Techniques

### Console Logging
```typescript
it('should debug', () => {
  console.log('Props:', props);
  console.log('State:', component.state);
  expect(true).toBe(true);
});
```

### Screen Debug
```typescript
it('should debug screen', () => {
  render(<Component />);
  screen.debug(); // Log entire DOM
  screen.debug(screen.getByRole('button')); // Log specific element
});
```

### Test Isolation
```typescript
it.only('should run only this test', () => {
  // Only this test runs
});

it.skip('should skip this test', () => {
  // This test is skipped
});
```

## Common Issues & Solutions

### Element Not Found
```typescript
// Problem: Element not found
// Solution: Use more specific queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email address/i);
screen.getByTestId('submit-button');
```

### Async Test Failures
```typescript
// Problem: Test fails due to async operations
// Solution: Use waitFor or findBy
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// Or use findBy
const element = await screen.findByText('Data loaded');
expect(element).toBeInTheDocument();
```

### Mock Not Working
```typescript
// Problem: Mock function not called
// Solution: Ensure proper setup
const mockFn = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Component Not Rendering
```typescript
// Problem: Component not rendering
// Solution: Check providers and props
render(
  <Provider>
    <Component requiredProp="value" />
  </Provider>
);
```

## Performance Tips

### Fast Tests
```typescript
// Use specific queries instead of generic ones
screen.getByRole('button'); // Fast
screen.getByText('Submit'); // Slower

// Use test IDs for complex elements
screen.getByTestId('complex-component');
```

### Efficient Setup
```typescript
// Use beforeEach for common setup
beforeEach(() => {
  // Setup that applies to all tests
});

// Use beforeAll for expensive setup
beforeAll(() => {
  // Expensive setup (API mocks, etc.)
});
```

## Coverage Commands

### Generate Coverage
```bash
npm run test:coverage
```

### Coverage Thresholds
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

## Best Practices Checklist

- [ ] Test user behavior, not implementation
- [ ] Use semantic queries (getByRole, getByLabelText)
- [ ] Test one thing at a time
- [ ] Use descriptive test names
- [ ] Clean up between tests
- [ ] Mock external dependencies
- [ ] Test error states and edge cases
- [ ] Use test data factories
- [ ] Keep tests fast and focused
- [ ] Write maintainable test code

## Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Docs](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [MSW Docs](https://mswjs.io/)

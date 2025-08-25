# Testing Workflow Guide

## Overview

This guide outlines the complete testing workflow for the ServiceNow Ticket Automation frontend project. It provides step-by-step instructions for implementing, running, and maintaining tests throughout the development lifecycle.

## Testing Workflow Overview

```
Development Workflow
├── Write Code
├── Write Tests
├── Run Tests
├── Fix Issues
├── Review Coverage
└── Commit Changes
```

## Phase 1: Test Planning

### 1.1 Identify Test Requirements

**Before writing any code, ask:**
- What functionality needs to be tested?
- What are the critical user paths?
- What edge cases should be covered?
- What error scenarios need testing?

**Example Test Planning:**
```typescript
// Component: UserProfile
// Test Requirements:
// ✅ Render user information
// ✅ Handle missing user data
// ✅ Update user information
// ✅ Handle form validation errors
// ✅ Submit form successfully
```

### 1.2 Choose Test Types

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

**Integration Tests:**
- Component interactions
- API integration
- User workflows

## Phase 2: Test Implementation

### 2.1 Create Test File Structure

```bash
# Create test file
touch src/test/ComponentName.test.tsx

# Create test utilities if needed
touch src/test/utils/componentHelpers.ts
```

### 2.2 Write Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from '@/components/Component';

describe('Component', () => {
  // Setup
  beforeEach(() => {
    // Reset state, clear mocks
  });

  // Test suites
  describe('Rendering', () => {
    // Rendering tests
  });

  describe('User Interactions', () => {
    // Interaction tests
  });

  describe('Error Handling', () => {
    // Error tests
  });
});
```

### 2.3 Implement Test Cases

**Step 1: Write Basic Rendering Test**
```typescript
it('should render component correctly', () => {
  render(<Component title="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

**Step 2: Add User Interaction Tests**
```typescript
it('should handle user interaction', async () => {
  const user = userEvent.setup();
  const mockHandler = vi.fn();
  
  render(<Component onClick={mockHandler} />);
  await user.click(screen.getByRole('button'));
  
  expect(mockHandler).toHaveBeenCalled();
});
```

**Step 3: Add Error State Tests**
```typescript
it('should display error message', () => {
  render(<Component error="Something went wrong" />);
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

### 2.4 Test Data Setup

**Create Test Data Factories:**
```typescript
// src/test/factories/user.ts
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
```

**Use in Tests:**
```typescript
const adminUser = createUser({ role: 'admin', name: 'Admin User' });
const regularUser = createUser({ role: 'user', name: 'Regular User' });
```

## Phase 3: Test Execution

### 3.1 Run Tests During Development

```bash
# Run tests in watch mode (recommended during development)
npm run test:watch

# Run specific test file
npm run test:watch -- src/test/ComponentName.test.tsx

# Run tests matching pattern
npm run test:watch -- --grep "ComponentName"
```

### 3.2 Test Execution Workflow

**Step 1: Write Test**
```typescript
it('should handle form submission', async () => {
  // Test implementation
});
```

**Step 2: Run Test (Should Fail)**
```bash
npm run test:run -- --grep "should handle form submission"
```

**Step 3: Implement Feature**
```typescript
// Implement the feature to make test pass
```

**Step 4: Run Test Again (Should Pass)**
```bash
npm run test:run -- --grep "should handle form submission"
```

### 3.3 Debugging Tests

**When Tests Fail:**
1. **Read the error message carefully**
2. **Check the test output for details**
3. **Use debugging techniques**

```typescript
// Add debugging to test
it('should debug failing test', () => {
  render(<Component />);
  screen.debug(); // Log entire DOM
  expect(true).toBe(true);
});
```

**Common Debugging Commands:**
```bash
# Run with verbose output
npm run test:run -- --reporter=verbose

# Run single test
npm run test:run -- --grep "specific test name"

# Run with UI for visual debugging
npm run test:ui
```

## Phase 4: Test Validation

### 4.1 Coverage Analysis

**Generate Coverage Report:**
```bash
npm run test:coverage
```

**Review Coverage:**
- **Statements**: Individual code statements executed
- **Branches**: Conditional branches (if/else) executed
- **Functions**: Functions called during testing
- **Lines**: Lines of code executed

**Coverage Targets:**
- **Overall**: 80% minimum
- **Stores**: 90% minimum (critical business logic)
- **Components**: 70% minimum
- **Utilities**: 85% minimum

### 4.2 Test Quality Review

**Checklist:**
- [ ] Tests are readable and maintainable
- [ ] Tests follow naming conventions
- [ ] Tests are focused and test one thing
- [ ] Tests use appropriate assertions
- [ ] Tests handle async operations correctly
- [ ] Tests clean up after themselves

**Code Review Questions:**
- Do the tests cover the main functionality?
- Are edge cases and error states tested?
- Are the tests user-focused (not implementation-focused)?
- Are the tests fast and reliable?

## Phase 5: Continuous Integration

### 5.1 Pre-commit Testing

**Setup Pre-commit Hook:**
```bash
# Run tests before commit
npm run test:run

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### 5.2 CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

### 5.3 Test Maintenance

**Regular Maintenance Tasks:**
1. **Update tests when components change**
2. **Remove obsolete tests**
3. **Refactor tests for better maintainability**
4. **Update test data as needed**

## Testing Workflow Checklist

### Before Writing Code
- [ ] Identify test requirements
- [ ] Plan test structure
- [ ] Set up test data factories
- [ ] Choose appropriate test types

### During Development
- [ ] Write tests alongside code
- [ ] Run tests frequently
- [ ] Debug failing tests immediately
- [ ] Refactor tests as needed

### Before Committing
- [ ] Run all tests
- [ ] Check test coverage
- [ ] Review test quality
- [ ] Ensure tests are maintainable

### After Deployment
- [ ] Monitor test results in CI/CD
- [ ] Update tests for new features
- [ ] Remove obsolete tests
- [ ] Optimize test performance

## Common Workflow Patterns

### TDD (Test-Driven Development)

**Red-Green-Refactor Cycle:**
1. **Red**: Write failing test
2. **Green**: Write code to make test pass
3. **Refactor**: Improve code and tests

```typescript
// 1. Red: Write failing test
it('should calculate total price', () => {
  const cart = new ShoppingCart();
  cart.addItem({ price: 10 });
  cart.addItem({ price: 20 });
  expect(cart.getTotal()).toBe(30);
});

// 2. Green: Implement feature
class ShoppingCart {
  private items = [];
  
  addItem(item) {
    this.items.push(item);
  }
  
  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

// 3. Refactor: Improve implementation
```

### BDD (Behavior-Driven Development)

**Given-When-Then Structure:**
```typescript
describe('Shopping Cart', () => {
  describe('when adding items', () => {
    it('should calculate total correctly', () => {
      // Given: Shopping cart with items
      const cart = new ShoppingCart();
      cart.addItem({ price: 10 });
      cart.addItem({ price: 20 });
      
      // When: Getting total
      const total = cart.getTotal();
      
      // Then: Total should be correct
      expect(total).toBe(30);
    });
  });
});
```

## Performance Optimization

### Test Performance Best Practices

**Fast Tests:**
```typescript
// ✅ Good: Use specific queries
screen.getByRole('button');
screen.getByTestId('submit-button');

// ❌ Bad: Use generic queries
screen.getByText('Submit'); // Slower
```

**Efficient Setup:**
```typescript
// ✅ Good: Use beforeEach for common setup
beforeEach(() => {
  // Common setup
});

// ✅ Good: Use beforeAll for expensive setup
beforeAll(() => {
  // Expensive setup (API mocks, etc.)
});
```

**Parallel Execution:**
```typescript
// ✅ Good: Independent tests
it('should test feature A', () => {
  // Independent test
});

it('should test feature B', () => {
  // Independent test
});
```

## Troubleshooting Workflow

### When Tests Are Failing

**Step 1: Identify the Problem**
```bash
# Run with verbose output
npm run test:run -- --reporter=verbose
```

**Step 2: Isolate the Issue**
```typescript
// Use .only to run single test
it.only('should debug this test', () => {
  // Only this test runs
});
```

**Step 3: Add Debugging**
```typescript
it('should debug failing test', () => {
  console.log('Debug info');
  screen.debug();
  expect(true).toBe(true);
});
```

**Step 4: Fix the Issue**
- Update test if component changed
- Fix component if test is correct
- Update mocks if needed

### When Tests Are Slow

**Identify Slow Tests:**
```bash
# Run with timing information
npm run test:run -- --reporter=verbose
```

**Optimize Slow Tests:**
- Use more specific queries
- Reduce setup complexity
- Mock expensive operations
- Use test data factories

## Best Practices Summary

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow consistent naming conventions
- Keep tests focused and independent

### Test Data Management
- Use test data factories
- Create reusable mock data
- Keep test data realistic
- Clean up test data between tests

### Test Maintenance
- Update tests when components change
- Remove obsolete tests
- Refactor tests for better maintainability
- Keep tests fast and reliable

### Team Collaboration
- Review test code in pull requests
- Share testing best practices
- Document complex test scenarios
- Maintain consistent testing standards

## Conclusion

This testing workflow guide provides a comprehensive approach to implementing and maintaining high-quality tests. By following these guidelines, you can ensure that your tests are:

- **Reliable**: Consistent and not flaky
- **Maintainable**: Easy to understand and modify
- **Comprehensive**: Covering all critical functionality
- **Fast**: Efficient execution for quick feedback
- **User-focused**: Testing behavior rather than implementation

Remember that testing is an iterative process. Start with the basics and gradually improve your testing practices as your application grows. The goal is to build confidence in your code changes and catch issues early in the development cycle.

For additional guidance, refer to:
- [Testing Documentation](./Testing_Documentation.md)
- [Testing Quick Reference](./Testing_Quick_Reference.md)
- [Testing Implementation Summary](./Frontend_Testing_Implementation_Summary.md)

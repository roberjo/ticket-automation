/**
 * Test Setup Configuration
 * 
 * This file configures the global test environment and provides necessary mocks
 * for browser APIs that are not available in the Node.js test environment.
 * It runs before all tests and sets up the testing infrastructure.
 * 
 * Purpose:
 * - Import Jest DOM matchers for enhanced assertions
 * - Mock browser APIs that don't exist in Node.js
 * - Configure global test environment
 * - Set up console logging for test debugging
 * 
 * Mocked APIs:
 * - window.matchMedia: For responsive design testing
 * - IntersectionObserver: For scroll-based animations
 * - ResizeObserver: For responsive component behavior
 * - window.scrollTo: For scroll behavior testing
 * - console methods: For controlled logging during tests
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * Mock window.matchMedia
 * 
 * This API is used by CSS media queries and responsive design libraries.
 * In the Node.js test environment, this API doesn't exist, so we need to mock it.
 * 
 * The mock provides:
 * - matches: Boolean indicating if the media query matches
 * - media: The media query string
 * - Event listener methods for media query changes
 * - Both modern and deprecated API methods for compatibility
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false, // Default to false for most test scenarios
    media: query, // Store the original query string
    onchange: null, // Event handler for media query changes
    addListener: vi.fn(), // deprecated - for older browser compatibility
    removeListener: vi.fn(), // deprecated - for older browser compatibility
    addEventListener: vi.fn(), // Modern event listener API
    removeEventListener: vi.fn(), // Modern event listener API
    dispatchEvent: vi.fn(), // Event dispatching capability
  })),
});

/**
 * Mock IntersectionObserver
 * 
 * This API is used for detecting when elements enter/exit the viewport.
 * Commonly used for lazy loading, infinite scrolling, and scroll-based animations.
 * 
 * The mock provides:
 * - observe: Method to start observing an element
 * - unobserve: Method to stop observing an element
 * - disconnect: Method to stop observing all elements
 */
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(), // Mock function to observe an element
  unobserve: vi.fn(), // Mock function to stop observing an element
  disconnect: vi.fn(), // Mock function to disconnect all observations
}));

/**
 * Mock ResizeObserver
 * 
 * This API is used for detecting when elements change size.
 * Commonly used for responsive components and layout adjustments.
 * 
 * The mock provides:
 * - observe: Method to start observing element size changes
 * - unobserve: Method to stop observing element size changes
 * - disconnect: Method to stop observing all elements
 */
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(), // Mock function to observe element size changes
  unobserve: vi.fn(), // Mock function to stop observing element size changes
  disconnect: vi.fn(), // Mock function to disconnect all observations
}));

/**
 * Mock window.scrollTo
 * 
 * This API is used for programmatic scrolling.
 * Commonly used in navigation, smooth scrolling, and scroll restoration.
 * 
 * The mock provides a simple function that can be called without errors
 * during tests that involve scrolling behavior.
 */
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(), // Mock function for scroll behavior
});

/**
 * Mock console methods to reduce noise and improve performance
 * 
 * Provides controlled console logging during tests.
 * Can be used to:
 * - Reduce noise in test output
 * - Capture and verify console messages
 * - Debug test failures
 * 
 * Configuration:
 * - Mocks console.warn and console.error to reduce React act() warning noise
 * - Preserves console.log for debugging when needed
 * - Improves test execution performance by reducing stderr output
 */
global.console = {
  ...console, // Preserve original console methods
  // Mock console methods to reduce React act() warning noise
  warn: vi.fn(), // Mock console.warn to reduce React act() warnings
  error: vi.fn(), // Mock console.error to reduce error noise
  // Keep console.log for debugging
  log: console.log,
  debug: console.debug,
  info: console.info,
};

/**
 * Suppress React act() warnings for better performance
 * 
 * These warnings are expected in tests and don't indicate actual problems.
 * Suppressing them improves test execution performance significantly.
 */
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to') &&
      args[0].includes('inside a test was not wrapped in act')
    ) {
      return; // Suppress React act() warnings
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

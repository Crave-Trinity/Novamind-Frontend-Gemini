/**
 * Test Environment Setup
 *
 * Configures the test environment with all necessary mocks and utilities.
 */
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { tailwindMock } from './tailwind-mock';

// Log the start of setup
console.log('[setup.ts] Initializing test environment');

/**
 * Global setup before all tests
 */
beforeAll(() => {
  // Mock matchMedia
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
  
  console.log('[setup.ts] Global matchMedia mock applied.');

  // Initialize document
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('light');
  }

  // Initialize Tailwind CSS mock for testing
  tailwindMock.initialize();
  console.log('[setup.ts] Tailwind CSS mock initialized for tests.');

  // Mock IntersectionObserver
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  console.log('[setup.ts] IntersectionObserver mock applied.');

  // Mock ResizeObserver
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
  console.log('[setup.ts] ResizeObserver mock applied.');

  // Extend expect with jest-dom matchers
  console.log('[setup.ts] expect extended with jest-dom matchers (after mocks).');
});

/**
 * After each test
 */
afterEach(() => {
  // Clean up any components rendered with React Testing Library
  cleanup();
});

/**
 * After all tests
 */
afterAll(() => {
  // Clean up global mocks
  vi.restoreAllMocks();
});

console.log('[setup.ts] Setup file execution complete.');

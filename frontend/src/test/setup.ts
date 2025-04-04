/**
 * Global test setup for the Novamind Digital Twin frontend application
 * 
 * This file is loaded automatically before any test files are run.
 * It sets up the testing environment with necessary mocks and configurations.
 */
import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import './tailwind-mock'; // Import Tailwind mock for CSS class testing
import './tailwind-mock';

// Mock browser APIs and globals
const mockMediaQueryList = {
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Setup global mocks before all tests
beforeAll(() => {
  // Mock localStorage
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  } as unknown as Storage;

  // Mock window.matchMedia to avoid errors in tests related to ThemeProvider
  global.matchMedia = vi.fn().mockImplementation((query) => ({
    ...mockMediaQueryList,
    matches: query.includes('dark') ? false : true,
    media: query,
  }));

  // Setup document for Tailwind dark mode support
  if (!document.documentElement.classList.contains('light')) {
    document.documentElement.classList.add('light');
  }

  // Mock requestAnimationFrame and cancelAnimationFrame to prevent test hangs
  global.requestAnimationFrame = vi.fn((callback) => setTimeout(callback, 0));
  global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Silence console errors in tests (comment this out for debugging)
  // console.error = vi.fn();
  // console.warn = vi.fn();
});

// Clean up after each test
afterEach(() => {
  // Reset all mocks between tests
  vi.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  // Any global cleanup needed
});

// Global test timeouts to prevent hanging
vi.setConfig({
  testTimeout: 10000, // 10 seconds
  hookTimeout: 10000,
});

/**
 * Unified Test Environment Setup
 *
 * This is the single source of truth for all test environment configuration.
 * It properly initializes JSDOM, sets up mocks, and configures the testing library.
 */
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// ==== DOM Environment Setup ====
// Log startup message
console.log('[setup.unified.ts] Initializing test environment');

// Ensure DOM elements exist for tests that use document
beforeAll(() => {
  // Mock browser APIs
  if (typeof window !== 'undefined') {
    // Mock matchMedia for responsive testing
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
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
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock ResizeObserver
    // Mock ResizeObserver: Provide expected methods and potentially call callback
    window.ResizeObserver = vi.fn().mockImplementation((callback: ResizeObserverCallback) => { // Added type annotation
      const observer = {
        observe: vi.fn((element) => {
          // Immediately invoke callback with mock data if a callback is provided
          // This might be necessary for hooks like react-use-measure
          if (callback) {
            // Define a default mock rect, adjust if needed
            const mockRect: DOMRectReadOnly = { width: 100, height: 100, top: 0, left: 0, bottom: 100, right: 100, x: 0, y: 0, toJSON: () => ({ x: 0, y: 0, width: 100, height: 100, top: 0, left: 0, bottom: 100, right: 100 }) }; // Added missing properties and type
            callback([{
              target: element,
              contentRect: mockRect,
              borderBoxSize: [{ inlineSize: 100, blockSize: 100 }], // Mock value
              contentBoxSize: [{ inlineSize: 100, blockSize: 100 }], // Mock value
              devicePixelContentBoxSize: [{ inlineSize: 100, blockSize: 100 }] // Mock value
            }], observer);
          }
        }),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
      return observer;
    });

    console.log('[setup.unified.ts] Browser API mocks applied');
  }

  // Initialize document with default light theme
  if (typeof document !== 'undefined' && document.documentElement) {
    // Initialize with light theme
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    // Manual Tailwind class injection removed - Vitest CSS processing handles this now
    console.log('[setup.unified.ts] DOM structure initialized');
  }
});

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Clean up after all tests
afterAll(() => {
  vi.restoreAllMocks();
});

// Export a helper to toggle dark mode in tests
export const tailwindHelper = {
  enableDarkMode: () => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      return true;
    }
    return false;
  },

  disableDarkMode: () => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      return true;
    }
    return false;
  },

  isDarkMode: () => {
    if (typeof document !== 'undefined' && document.documentElement) {
      // Directly query the document element within the function
      return document.querySelector('html')?.classList.contains('dark') ?? false;
    }
    return false;
  },
};

console.log('[setup.unified.ts] Setup complete');

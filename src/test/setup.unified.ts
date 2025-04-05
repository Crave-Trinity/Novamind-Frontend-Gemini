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
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    // Mock ResizeObserver
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

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
  }
};

console.log('[setup.unified.ts] Setup complete');
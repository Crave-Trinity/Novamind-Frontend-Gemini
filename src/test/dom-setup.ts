/**
 * Comprehensive DOM Setup for Tests
 * This file provides a robust DOM environment setup for all component tests
 */
import { afterEach, beforeEach, vi, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom';

// Extend Vitest's expect with Jest DOM matchers
expect.extend(matchers);

// Initialize DOM environment if not present (fallback mechanism)
if (typeof window === 'undefined') {
  console.warn('[DOM-SETUP] Window object not detected, tests may fail');
}

// Add DOM-specific setup
console.log('[DOM TEST SETUP] Initializing DOM-specific test environment...');

// ----- Mock Browser APIs -----
// Keep tests working by mocking essential browser APIs

// Mock localStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
};

// Setup for every test
beforeEach(() => {
  // Create global mocks that tests expect to be available
  if (typeof window !== 'undefined') {
    // LocalStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: createStorageMock(),
      writable: true,
    });

    // SessionStorage mock
    Object.defineProperty(window, 'sessionStorage', {
      value: createStorageMock(),
      writable: true,
    });

    // MatchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark') ? false : true, // Default to light mode
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated but might be used in older libraries
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // IntersectionObserver mock
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: () => [],
    }));

    // ResizeObserver mock
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Create document elements if not present
    if (typeof document !== 'undefined') {
      // Ensure document.documentElement exists and has necessary properties
      document.documentElement.classList.add('light');
    }
  }
});

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Helpers for tests
export const domTestUtils = {
  setDarkMode: (isDark: boolean = true) => {
    if (typeof document !== 'undefined' && document.documentElement) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  },
  
  // Helper to set localStorage values for tests
  setLocalStorage: (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },

  // Helper to clear localStorage values
  clearLocalStorage: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  }
};

console.log('[DOM TEST SETUP] DOM-specific test environment setup complete.');
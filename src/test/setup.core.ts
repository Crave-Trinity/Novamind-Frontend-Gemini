/**
 * CORE TEST SETUP
 * This provides essential test environment configuration for all tests
 */

// Import testing libraries and setup jsdom environment
import '@testing-library/jest-dom';
import { expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// ==========================================
// ADD DIRECT MATCHERS FOR TESTING LIBRARY
// ==========================================
// Direct integration of Jest-DOM matchers to avoid dependency issues
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

// Add explicit matcher for toHaveTextContent that was failing
expect.extend({
  toHaveTextContent(received, expected) {
    if (received && typeof received.textContent === 'string') {
      const textContent = received.textContent;
      const pass =
        expected instanceof RegExp ? expected.test(textContent) : textContent === expected;

      return {
        pass,
        message: () =>
          `Expected element ${pass ? 'not ' : ''}to have text content "${expected}" but got "${textContent}"`,
      };
    }

    return {
      pass: false,
      message: () => `Element does not have textContent property`,
    };
  },
});

// ==========================================
// MOCK BROWSER ENVIRONMENT
// ==========================================
beforeEach(() => {
  // Mock localStorage
  const createStorageMock = () => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index: number) => Object.keys(store)[index] || null),
    };
  };

  Object.defineProperty(window, 'localStorage', {
    value: createStorageMock(),
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: createStorageMock(),
    writable: true,
    configurable: true,
  });

  // Mock matchMedia for theme tests - critical fix
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('(prefers-color-scheme: dark)'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });

  // Reset document classes
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.classList.remove(
      'dark',
      'light',
      'system',
      'theme-dark',
      'theme-light'
    );
    document.documentElement.classList.add('light');
  }

  // Mock other browser APIs commonly used
  if (typeof window !== 'undefined') {
    // Observer APIs
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn().mockReturnValue([]),
    }));

    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // URL methods
    if (window.URL) {
      window.URL.createObjectURL = vi.fn(() => 'mock-object-url');
      window.URL.revokeObjectURL = vi.fn();
    }

    // CustomEvent for auth tests
    if (typeof CustomEvent !== 'function') {
      window.CustomEvent = class CustomEvent extends Event {
        detail: any;
        constructor(type: string, options: any = {}) {
          super(type, options);
          this.detail = options.detail || {};
        }
      } as any;
    }
  }
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Log setup completion
console.log('[CORE TEST SETUP] Test environment initialized');

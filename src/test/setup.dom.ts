/**
 * DOM Testing Environment Setup
 *
 * This file provides essential DOM-specific setup for React component tests.
 * It's used as a common import across test files that need DOM manipulation.
 */

import '@testing-library/jest-dom'; // Import jest-dom matchers

// Mock window.matchMedia for tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('(prefers-color-scheme: dark)'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Set up localStorage mock for tests
  if (!window.localStorage) {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
      writable: true,
      configurable: true,
    });
  }

  // Set up sessionStorage mock for tests
  if (!window.sessionStorage) {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
      writable: true,
      configurable: true,
    });
  }
}

// Ensure vi is defined globally to prevent reference errors
import { vi } from 'vitest';
globalThis.vi = vi;

console.log('[DOM TEST ENV] DOM testing environment initialized');

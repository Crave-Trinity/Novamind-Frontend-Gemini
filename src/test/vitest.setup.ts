import { expect, beforeEach, afterEach, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Extend Vitest assertions with jest-dom matchers
expect.extend(matchers);

// Set up global mocks
beforeEach(() => {
  // Ensure window, document, localStorage are available for tests
  if (typeof window !== 'undefined') {
    // Create localStorage mock
    const localStorageMock = (() => {
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
        length: Object.keys(store).length,
        key: (index: number) => Object.keys(store)[index] || null,
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark') ? false : true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  if (typeof document !== 'undefined') {
    // Set default theme class
    document.documentElement.classList.remove('dark', 'system');
    document.documentElement.classList.add('light');
  }
});

// Clean up DOM after each test
afterEach(() => {
  cleanup();
});

// Make sure this runs and is visible
console.log('[VITEST SETUP] DOM testing environment initialized with jest-dom matchers');

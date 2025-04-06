/**
 * Global test setup for the Novamind Digital Twin frontend application
 * 
 * This file is loaded automatically before any test files are run.
 * It sets up the testing environment with necessary mocks and configurations.
 */
import '@testing-library/jest-dom';
import React from 'react'; // Import React
import { vi, afterEach } from 'vitest'; // Keep only necessary imports
// Removed tailwind-mock import - handled by test utils
// Removed WebGL setup/cleanup - handle in specific tests or dedicated setup if needed
import './webgl/examples/neural-controllers-mock';
// Import WebGL mock classes needed for three mock
import {
  CoreWebGLRenderer,
  MockWebGLTexture,
  MockWebGLGeometry,
  MockWebGLMaterial
} from './webgl/mock-webgl';

// Mock browser APIs and globals
// Define a more complete default mock for MediaQueryList
const createMockMediaQueryList = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: vi.fn(), // Deprecated
  removeListener: vi.fn(), // Deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

// Removed beforeAll block - Mocks are defined directly below

// Mock localStorage (Using Object.defineProperty as per canonical doc)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() { return Object.keys(store).length; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true, configurable: true });

// Re-add window.matchMedia mock here for global availability before component/library initialization
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('dark'), // Default mock behavior
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});


// Mock for window.matchMedia moved to test-utils.unified.tsx

// Removed document setup for Tailwind - handled by test utils or specific tests

  // Mock requestAnimationFrame and cancelAnimationFrame to prevent test hangs
// Mock requestAnimationFrame (Using Object.defineProperty as per canonical doc)
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  configurable: true,
  value: vi.fn((callback) => setTimeout(callback, 0)),
});
Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  configurable: true,
  value: vi.fn((id) => clearTimeout(id)),
});

  // Mock IntersectionObserver
// Mock IntersectionObserver (Using Object.defineProperty as per canonical doc)
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  })),
});

  // Mock ResizeObserver
// Mock ResizeObserver (Using Object.defineProperty as per canonical doc)
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Removed console silencing - enable explicitly if needed for debugging
// console.error = vi.fn();
// console.warn = vi.fn();

// --- Global Hooks --- (Moved from original position)

// Clean up after each test
afterEach(() => {
  // Reset all mocks between tests
  vi.clearAllMocks(); // Clear mock history
  localStorageMock.clear(); // Clear localStorage mock state
});

// Removed global 'three' mock - will be handled per-file if needed
// Removed afterAll block - WebGL cleanup handled elsewhere or per suite
// Removed vi.setConfig - Timeouts configured in vitest.config.ts

console.log('[TEST SETUP] Global setup complete.'); // Add log as per canonical doc

// Mock framer-motion to prevent errors in tests
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal() as any; // Import actual module
  
  // Create a proxy for the 'motion' object
  const motionProxy = new Proxy({}, {
    get: (target, prop) => {
      // Return a simple functional component that renders its children
      const Component = ({ children, ...props }: React.PropsWithChildren<any>) => React.createElement(prop as string, props, children);
      Component.displayName = `motion.${String(prop)}`;
      return Component;
    }
  });

  // Return the actual module exports, but replace 'motion' and 'AnimatePresence'
  return {
    __esModule: true, // Ensure it's treated as an ES module
    ...actual,        // Spread actual exports first
    motion: motionProxy, // Override motion with our proxy
    AnimatePresence: ({ children }: React.PropsWithChildren<{}>) => React.createElement(React.Fragment, null, children), // Simple AnimatePresence mock
    // Add mocks for other specific exports if they cause issues
    // e.g., useReducedMotion: () => false,
  };
});

/**
 * Global test setup for the Novamind Digital Twin frontend application
 * 
 * This file is loaded automatically before any test files are run.
 * It sets up the testing environment with necessary mocks and configurations.
 */
import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest'; // Keep only necessary imports
// Removed tailwind-mock import - handled by test utils
// Removed WebGL setup/cleanup - handle in specific tests or dedicated setup if needed
import './webgl/examples/neural-controllers-mock'; // Keep static neural controller mocks import

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

// Removed afterAll block - WebGL cleanup handled elsewhere or per suite
// Removed vi.setConfig - Timeouts configured in vitest.config.ts

console.log('[TEST SETUP] Global setup complete.'); // Add log as per canonical doc

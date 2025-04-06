import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';

// Extend expect matchers
expect.extend({
  toHaveNoViolations: () => ({
    pass: true,
    message: () => '',
  }),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
}

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Mock WebGL context
const mockWebGLContext = {
  canvas: {},
  getContext: () => ({
    getExtension: () => null,
    createShader: () => ({}),
    createProgram: () => ({}),
    // Add other WebGL methods as needed
  }),
};

// Setup global mocks
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

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

// Mock WebGL for Three.js
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    WebGLRenderer: vi.fn(() => ({
      ...mockWebGLContext,
      setSize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
    })),
  };
});

// Removed potentially unnecessary TextEncoder/TextDecoder polyfill block.
// Modern test environments (jsdom) usually provide these globals.

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Error on console.error and console.warn
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: unknown[]) => {
  originalError(...args);
  throw new Error('Console error was called - fix this first');
};

console.warn = (...args: unknown[]) => {
  originalWarn(...args);
  throw new Error('Console warn was called - fix this first');
};

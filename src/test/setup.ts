/**
 * Global test setup for the Novamind Digital Twin frontend application
 *
 * This file is loaded automatically before any test files are run.
 * It sets up the testing environment with necessary mocks and configurations.
 */
import React from 'react'; // Keep React import
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react'; // Keep cleanup import
import { afterEach, beforeAll, vi } from 'vitest'; // Keep combined vitest imports
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'; // Keep type import

// Keep Vitest Assertion extension
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {} // Disable rules for module augmentation
}

// Keep Mock extension
declare module 'vitest' {
  interface Mock {
    mockReturnValue<T>(val: T): Mock;
    mockImplementation<T, Y extends unknown[]>(fn: (...args: Y) => T): Mock;
  }
}

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
  // Add takeRecords to satisfy the interface
  takeRecords: () => [],
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock localStorage
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
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = (() => {
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
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock WebGL context (Simpler version from Incoming)
const createMockWebGLContext = () => ({
  canvas: document.createElement('canvas'),
  drawingBufferWidth: 0,
  drawingBufferHeight: 0,
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  HIGH_FLOAT: 36338,
  MEDIUM_FLOAT: 36337,
  LOW_FLOAT: 36336,
  HIGH_INT: 36341,
  MEDIUM_INT: 36340,
  LOW_INT: 36339,
  getShaderPrecisionFormat: vi.fn(() => ({ precision: 23, rangeMin: 127, rangeMax: 127 })),
  getExtension: vi.fn(() => null),
  createShader: vi.fn(() => ({})),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  getShaderParameter: vi.fn(() => true),
  getShaderInfoLog: vi.fn(() => ''),
  createProgram: vi.fn(() => ({})),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  getProgramInfoLog: vi.fn(() => ''),
  deleteShader: vi.fn(),
  useProgram: vi.fn(),
  createBuffer: vi.fn(() => ({})),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  clear: vi.fn(),
  drawArrays: vi.fn(),
  // Add missing methods based on previous mocks if needed
  getParameter: vi.fn(),
  createTexture: vi.fn(() => ({})),
  bindTexture: vi.fn(),
  texImage2D: vi.fn(),
  texParameteri: vi.fn(),
  clearColor: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  blendFunc: vi.fn(),
  depthFunc: vi.fn(),
  drawElements: vi.fn(),
  viewport: vi.fn(),
  createVertexArray: vi.fn(() => ({})),
  bindVertexArray: vi.fn(),
  finish: vi.fn(),
});

const originalGetContext = HTMLCanvasElement.prototype.getContext;
// Assign the mock function directly, casting the function expression itself to 'any'
HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  contextId: string,
  options?: unknown
): RenderingContext | null {
  if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
    // Cast the return type of createMockWebGLContext if necessary,
    // or ensure it returns a type compatible with RenderingContext | null
    return createMockWebGLContext() as unknown as RenderingContext | null;
  } else if (contextId === '2d') {
    return null;
  }

  // Ensure originalGetContext is callable for other types
  if (typeof originalGetContext === 'function') {
    // Use Function.prototype.call for type safety with 'this'
    return Function.prototype.call.call(originalGetContext, this, contextId, options);
  }
  return null; // Fallback if original context is somehow unavailable
} as typeof HTMLCanvasElement.prototype.getContext; // Apply more specific cast

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// Global error handler (from Incoming)
beforeAll(() => {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Suppress specific React 18 warning
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };
});

// --- Library Mocks ---

import type * as FramerMotion from 'framer-motion'; // Type import for mocking

// Mock framer-motion (from HEAD)
vi.mock('framer-motion', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof FramerMotion;

  const motionProxy = new Proxy(
    {},
    {
      get: (target, prop) => {
        const Component = ({
          children,
          ...props
        }: React.PropsWithChildren<Record<string, unknown>>) =>
          React.createElement(prop as string, props, children);
        Component.displayName = `motion.${String(prop)}`;
        return Component;
      },
    }
  );

  return {
    __esModule: true,
    ...actual,
    motion: motionProxy,
    AnimatePresence: (
      { children }: React.PropsWithChildren<unknown> // Replace {} with unknown
    ) => React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
    useScroll: () => ({ scrollYProgress: { onChange: vi.fn(), current: 0 } }),
    useSpring: () => ({ onChange: vi.fn(), current: 0 }),
    useTransform: () => ({ onChange: vi.fn(), current: 0 }),
  };
});

// --- Setup Complete ---
console.log('[TEST SETUP] Global setup complete.');

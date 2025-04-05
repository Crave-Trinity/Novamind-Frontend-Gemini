/**
 * Global test setup for the Novamind Digital Twin frontend application
 * 
 * This file is loaded automatically before any test files are run.
 * It sets up the testing environment with necessary mocks and configurations.
 */
import React from 'react';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import './webgl/examples/neural-controllers-mock';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  interface Assertion<T = any>
    extends TestingLibraryMatchers<T, void> {}
}

// Extend vi.fn() type to include mock methods
declare module 'vitest' {
  interface Mock {
    mockReturnValue<T>(val: T): Mock;
    mockImplementation<T, Y extends any[]>(fn: (...args: Y) => T): Mock;
  }
}

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
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

// Mock WebGL context
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
});

const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(contextId: string, options?: any) {
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return createMockWebGLContext();
  }
  return originalGetContext.call(this, contextId, options);
};

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// Global error handler
beforeAll(() => {
  const originalConsoleError = console.error;
  console.error = (...args) => {
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

// Mock framer-motion
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal() as any;
  
  const motionProxy = new Proxy({}, {
    get: (target, prop) => {
      const Component = ({ children, ...props }: React.PropsWithChildren<any>) => 
        React.createElement(prop as string, props, children);
      Component.displayName = `motion.${String(prop)}`;
      return Component;
    }
  });

  return {
    __esModule: true,
    ...actual,
    motion: motionProxy,
    AnimatePresence: ({ children }: React.PropsWithChildren<{}>) => 
      React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
    useScroll: () => ({ scrollYProgress: { onChange: vi.fn(), current: 0 } }),
    useSpring: () => ({ onChange: vi.fn(), current: 0 }),
    useTransform: () => ({ onChange: vi.fn(), current: 0 }),
  };
});

// --- Setup Complete ---
console.log('[TEST SETUP] Global setup complete.');

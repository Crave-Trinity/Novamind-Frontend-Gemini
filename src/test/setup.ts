/**
 * Global test setup for the Novamind Digital Twin frontend application
 */
import React from 'react';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Vitest Assertion extension
declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
}
// Mock extension
declare module 'vitest' {
  interface Mock {
    mockReturnValue<T>(val: T): Mock;
    mockImplementation<T, Y extends unknown[]>(fn: (...args: Y) => T): Mock;
  }
}

// --- Minimal Browser API Mocks ---

// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: () => [],
}));

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia (Simple global version - needed for non-enhanced tests)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, // Default to false (light mode)
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

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
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

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
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
  configurable: true,
});

// --- Minimal WebGL Mock ---
// Provide only the absolute minimum for non-R3F tests that might import related utils
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  contextId: string,
  options?: unknown
): RenderingContext | null {
  if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
    // Return a very basic object, or null if even this causes issues
    return {
      canvas: this,
      getParameter: vi.fn(),
      getExtension: vi.fn(() => null),
      // Add other methods *only if* explicitly required by non-R3F code paths
    } as unknown as RenderingContext | null;
  } else if (contextId === '2d') {
    return {
      // Basic 2D mock
      canvas: this,
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(0) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(0) })),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
  }
  if (typeof originalGetContext === 'function') {
    return Function.prototype.call.call(originalGetContext, this, contextId, options);
  }
  return null;
} as typeof HTMLCanvasElement.prototype.getContext;
// --- End WebGL Mock ---

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorageMock.clear();
  sessionStorageMock.clear();
  // Reset global matchMedia override if used
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).__vitest_matchMedia_matches;
});

// Global error handler
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
    // Suppress Radix UI warnings if needed
    // if (typeof args[0] === 'string' && args[0].includes('radix-ui')) { return; }
    originalConsoleError.call(console, ...args);
  };
});

// --- Library Mocks ---
import type * as FramerMotion from 'framer-motion';

// Mock framer-motion (Keep simplified version)
vi.mock('framer-motion', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof FramerMotion;
  const proxy = new Proxy(
    {},
    {
      get:
        (_target, prop) =>
        ({ children }: { children?: React.ReactNode }) =>
          React.createElement(prop as string, {}, children),
    }
  );
  return {
    __esModule: true,
    ...actual,
    motion: proxy,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
    useScroll: () => ({ scrollYProgress: { onChange: vi.fn(), get: () => 0 } }),
    useSpring: () => ({ onChange: vi.fn(), get: () => 0 }),
    useTransform: () => ({ onChange: vi.fn(), get: () => 0 }),
  };
});

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface MockWebGLRenderingContext extends WebGLRenderingContext {}

// Mock WebGLRenderingContext partially
vi.mock('three', async (importOriginal) => {
  // Await the dynamic import first. Let TypeScript infer the type.
  const threeModule = await importOriginal();
  // Spread the actual module exports. Cast to 'any' if type inference is insufficient.
  return {
    ...(threeModule as any),
    WebGLRenderingContext: vi.fn().mockImplementation(() => ({
      getExtension: vi.fn(),
      getParameter: vi.fn(),
      createShader: vi.fn(() => ({})),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn((shader, pname) => {
        if (pname === WebGLRenderingContext.COMPILE_STATUS) {
          return true;
        }
        return null;
      }),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getProgramParameter: vi.fn((program, pname) => {
        if (pname === WebGLRenderingContext.LINK_STATUS) {
          return true;
        }
        return null;
      }),
      createProgram: vi.fn(() => ({})),
      // Add other methods as needed by tests
      viewport: vi.fn(),
      clearColor: vi.fn(),
      clear: vi.fn(),
      enable: vi.fn(),
      depthFunc: vi.fn(),
      cullFace: vi.fn(),
      frontFace: vi.fn(),
      bindBuffer: vi.fn(),
      createBuffer: vi.fn(() => ({})),
      bufferData: vi.fn(),
      vertexAttribPointer: vi.fn(),
      enableVertexAttribArray: vi.fn(),
      drawArrays: vi.fn(),
      drawElements: vi.fn(),
      useProgram: vi.fn(),
      getUniformLocation: vi.fn(() => ({})),
      uniformMatrix4fv: vi.fn(),
      uniform1i: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform3f: vi.fn(),
      uniform4f: vi.fn(),
      activeTexture: vi.fn(),
      bindTexture: vi.fn(),
      createTexture: vi.fn(() => ({})),
      texParameteri: vi.fn(),
      texImage2D: vi.fn(),
      pixelStorei: vi.fn(),
    })) as MockWebGLRenderingContext,
  };
});

// --- Setup Complete ---
console.log('[TEST SETUP] Global setup complete (with simplified mocks).');

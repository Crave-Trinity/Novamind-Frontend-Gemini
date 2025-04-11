/**
 * Global test setup for the Novamind Digital Twin frontend application
 */
// Remove unused React import
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Vitest Assertion extension
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion extends TestingLibraryMatchers<any, void> {
    // Phantom property to satisfy TS no-empty-interface rule
    _brand: 'vitest-assertion';
  }
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
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage (if needed)
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
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock URL.createObjectURL and revokeObjectURL
window.URL.createObjectURL = vi.fn(() => 'mock-object-url');
window.URL.revokeObjectURL = vi.fn();

// Mock CanvasRenderingContext2D methods (add more as needed)
// This avoids errors when libraries try to use canvas methods in tests
const mockCanvasContext: Partial<CanvasRenderingContext2D> = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(0),
    width: 0,
    height: 0,
    colorSpace: 'srgb' as PredefinedColorSpace,
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(0),
    width: 0,
    height: 0,
    colorSpace: 'srgb' as PredefinedColorSpace,
  })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn(() => ({
    width: 0,
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    fontBoundingBoxAscent: 0,
    fontBoundingBoxDescent: 0,
    emHeightAscent: 0,
    emHeightDescent: 0,
    hangingBaseline: 0,
    alphabeticBaseline: 0,
    ideographicBaseline: 0,
  })),
  // Add other 2D context methods if tests fail due to missing implementations
};

// Extend the prototype if necessary, or mock getContext
// Mock HTMLCanvasElement.prototype.getContext to return our mock context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  configurable: true,
  value: vi.fn((contextId) => {
    if (contextId === '2d') {
      return mockCanvasContext;
    }
    // Return a basic WebGL mock if requested, handled by vi.mock('three', ...) below
    if (contextId === 'webgl' || contextId === 'webgl2') {
      // This will be overridden by the vi.mock('three', ...) below for more detail
      // but provides a fallback.
      return {
        getParameter: vi.fn(),
        getExtension: vi.fn(),
        // Add minimal required methods if needed
      };
    }
    return null; // Default case
  }),
});

// --- Global Mocks ---

// Example: Mocking a global function or module if needed
// vi.mock('some-module', () => ({
//   default: vi.fn(),
//   someNamedExport: vi.fn(),
// }));

// --- Cleanup ---

// Ensure DOM is cleaned up after each test
afterEach(() => {
  cleanup();
});

// Optional: Reset mocks before each test if needed
// beforeEach(() => {
//   vi.clearAllMocks(); // Or vi.resetAllMocks(); depending on desired behavior
// });

// Optional: Global setup before all tests
beforeAll(() => {
  console.log('[TEST SETUP] Running global setup...');
  // Setup global state or mocks needed before any test runs
});

// Mock WebGLRenderingContext partially
vi.mock('three', async (importOriginal) => {
  // Await the dynamic import first. Let TypeScript infer the type.
  const threeModule = (await importOriginal()) as Record<string, unknown>;

  return {
    ...threeModule,
    WebGLRenderingContext: vi.fn().mockImplementation(() => ({
      getExtension: vi.fn(),
      getParameter: vi.fn(),
      createShader: vi.fn(() => ({})),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn((/* shader, pname */) => {
        // Simplified logic for mock
        return true;
      }),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getProgramParameter: vi.fn((/* program, pname */) => {
        // Simplified logic for mock
        return true;
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
      // Re-add the cast to use the interface
    })),
  };
});

// --- Setup Complete ---
console.log('[TEST SETUP] Global setup complete (with simplified mocks).');

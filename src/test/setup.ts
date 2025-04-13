
/**
 * CANONICAL TEST ENVIRONMENT SETUP
 *
 * This is a complete, clean solution for all test environment needs.
 * No patchwork, no legacy code - just a proper foundation.
 */

// Import Vitest globals first to make them available
import { expect, vi, afterEach, beforeEach } from 'vitest';
// Then import libraries that extend Vitest globals
// Removed side-effect import: import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// PROPER JEST-DOM SETUP - FIXED VERSION
// Import direct matchers (not through require which can cause issues)
import * as matchers from '@testing-library/jest-dom/matchers';

// Register matchers directly
expect.extend(matchers);

// Rely on the standard matchers imported and extended above

// 2. Type augmentation and global mock definitions
declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, void> {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  }
  // Define global types for our mocks using var
  var mockLocalStorage: {
      getItem: ReturnType<typeof vi.fn>;
      setItem: ReturnType<typeof vi.fn>;
      removeItem: ReturnType<typeof vi.fn>;
      clear: ReturnType<typeof vi.fn>;
  };
  var mockMatchMedia: ReturnType<typeof vi.fn>;
  var mockMediaQueryListInstance: { // Make the instance globally accessible if needed
      matches: boolean;
      media: string;
      onchange: null;
      addEventListener: ReturnType<typeof vi.fn>;
      removeEventListener: ReturnType<typeof vi.fn>;
      dispatchEvent: ReturnType<typeof vi.fn>;
      addListener: ReturnType<typeof vi.fn>;
      removeListener: ReturnType<typeof vi.fn>;
      _triggerChange?: (matches: boolean) => void;
  };
  var globalCurrentMatchesState: boolean;
}

// BROWSER API MOCKS
// Define global mocks
(globalThis as any).mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

let globalMediaQueryChangeListener: ((e: Partial<MediaQueryListEvent>) => void) | null = null;
// Initialize the state on globalThis
(globalThis as any).globalCurrentMatchesState = false;

(globalThis as any).mockMediaQueryListInstance = {
    matches: (globalThis as any).globalCurrentMatchesState, // Read from globalThis
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn((event, listener) => { if (event === 'change') globalMediaQueryChangeListener = listener; }),
    removeEventListener: vi.fn((event, listener) => { if (event === 'change' && globalMediaQueryChangeListener === listener) globalMediaQueryChangeListener = null; }),
    dispatchEvent: vi.fn(),
    addListener: vi.fn((listener) => { globalMediaQueryChangeListener = listener; }), // Deprecated
    removeListener: vi.fn((listener) => { if (globalMediaQueryChangeListener === listener) globalMediaQueryChangeListener = null; }), // Deprecated
    _triggerChange: (newMatchesState: boolean) => {
        (globalThis as any).globalCurrentMatchesState = newMatchesState; // Write to globalThis
        (globalThis as any).mockMediaQueryListInstance.matches = newMatchesState;
        if (globalMediaQueryChangeListener) {
            globalMediaQueryChangeListener({ matches: newMatchesState } as Partial<MediaQueryListEvent>);
        }
    }
};

// Define the mock function structure but leave implementation for beforeEach
(globalThis as any).mockMatchMedia = vi.fn();

beforeEach(() => {
  // Reset global mocks state
  (globalThis as any).mockLocalStorage.getItem.mockReset();
  (globalThis as any).mockLocalStorage.setItem.mockReset();
  (globalThis as any).mockLocalStorage.removeItem.mockReset();
  (globalThis as any).mockLocalStorage.clear.mockReset();
  // Reset matchMedia listener capture and state
  globalMediaQueryChangeListener = null;
  (globalThis as any).globalCurrentMatchesState = false; // Default to light here
  if ((globalThis as any).mockMediaQueryListInstance) {
      (globalThis as any).mockMediaQueryListInstance.matches = false;
  }

  // Define the mock implementation *within* beforeEach
  const matchMediaImplementation = (query: string): MediaQueryList => {
      if (!(globalThis as any).mockMediaQueryListInstance) {
           console.error("CRITICAL SETUP ERROR: mockMediaQueryListInstance is not defined!");
           return { matches: false, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() } as unknown as MediaQueryList;
      }
      if (query === '(prefers-color-scheme: dark)') {
          (globalThis as any).mockMediaQueryListInstance.matches = (globalThis as any).globalCurrentMatchesState;
          return (globalThis as any).mockMediaQueryListInstance as unknown as MediaQueryList;
      }
      return { matches: false, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() } as unknown as MediaQueryList;
  };
  
  // Clear previous mocks/implementations and set the new one
  (globalThis as any).mockMatchMedia.mockClear().mockImplementation(matchMediaImplementation);

  // Ensure mocks are attached to the window object if it exists (JSDOM)
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: (globalThis as any).mockLocalStorage,
      writable: true,
      configurable: true
    });
    // Attach the freshly configured mock
    Object.defineProperty(window, 'matchMedia', {
      value: (globalThis as any).mockMatchMedia,
      writable: true,
      configurable: true,
    });
    // Basic mock for sessionStorage if needed by other tests
    Object.defineProperty(window, 'sessionStorage', {
       value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
       writable: true,
       configurable: true
    });

    // Mock other browser APIs needed
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: () => [],
    }));
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    if (window.URL) {
      window.URL.createObjectURL = vi.fn(() => 'mock-object-url');
      window.URL.revokeObjectURL = vi.fn();
    }

    // Reset document state for theme tests
    if (document.documentElement) {
      document.documentElement.removeAttribute('class');
      // Optionally set a default class if needed, but resetting is safer
      // document.documentElement.classList.add('light');
    }
  }
});

// CANVAS & WEBGL MOCKS
if (typeof window !== 'undefined' && typeof HTMLCanvasElement !== 'undefined') {
  // Mock canvas context
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
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    // Add other methods as needed
  };

  // Mock getContext method
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    configurable: true,
    value: vi.fn((contextId) => {
      if (contextId === '2d') {
        return mockCanvasContext;
      }
      if (contextId === 'webgl' || contextId === 'webgl2') {
        return {
          getParameter: vi.fn(),
          getExtension: vi.fn(),
          createShader: vi.fn(() => ({})),
          shaderSource: vi.fn(),
          compileShader: vi.fn(),
          getShaderParameter: vi.fn(() => true),
          createProgram: vi.fn(() => ({})),
          attachShader: vi.fn(),
          linkProgram: vi.fn(),
          getProgramParameter: vi.fn(() => true),
        };
      }
      return null;
    }),
  });
}

// THREE.JS MOCK
vi.mock('three', async (importOriginal) => {
  const threeModule = (await importOriginal()) as Record<string, unknown>;
  
  return {
    ...threeModule,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      setClearColor: vi.fn(),
      setPixelRatio: vi.fn(),
      domElement: document.createElement('canvas'),
      dispose: vi.fn(),
    })),
  };
});

// CLEANUP
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Test helper utilities
export const TestHelpers = {
  setTheme: (theme: 'light' | 'dark' | 'system' | 'clinical') => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.remove('light', 'dark', 'system', 'clinical');
      document.documentElement.classList.add(theme);
    }
  }
};

console.log('[CANONICAL SETUP] Clean test environment initialized');
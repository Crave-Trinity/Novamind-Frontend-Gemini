/**
 * CANONICAL TEST ENVIRONMENT SETUP
 * 
 * This is a complete, clean solution for all test environment needs.
 * No patchwork, no legacy code - just a proper foundation.
 */

// Import base testing libraries
import '@testing-library/jest-dom';
import { expect, vi, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// PROPER JEST-DOM SETUP
// 1. Import and register matchers correctly
expect.extend(require('@testing-library/jest-dom').matchers);

// 2. Type augmentation that correctly extends Vitest
declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, void> {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  }
}

// BROWSER API MOCKS
beforeEach(() => {
  if (typeof window !== 'undefined') {
    // LOCAL STORAGE
    const createStorageMock = () => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (index: number) => Object.keys(store)[index] || null,
      };
    };

    Object.defineProperty(window, 'localStorage', {
      value: createStorageMock(),
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(window, 'sessionStorage', {
      value: createStorageMock(),
      writable: true,
      configurable: true
    });
    
    // MATCH MEDIA (Critical for ThemeProvider tests)
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
    
    // INTERSECTION OBSERVER
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: () => [],
    }));
    
    // RESIZE OBSERVER
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    // URL OBJECT
    if (window.URL) {
      window.URL.createObjectURL = vi.fn(() => 'mock-object-url');
      window.URL.revokeObjectURL = vi.fn();
    }
    
    // DOCUMENT DEFAULTS
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.remove('dark', 'light', 'system', 'clinical');
      document.documentElement.classList.add('light');
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
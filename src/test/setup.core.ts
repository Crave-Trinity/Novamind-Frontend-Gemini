/**
 * Core Test Setup for Novamind Frontend
 * 
 * This file is the SINGLE SOURCE OF TRUTH for core test environment setup.
 * It handles all the necessary browser API mocks and global setup.
 * 
 * IMPORTANT: This file should be loaded AFTER jest-dom.setup.ts to ensure
 * matchers are already available.
 */
import { afterEach, beforeEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// -------- BROWSER API MOCKS --------

// Create a mock storage implementation (localStorage, sessionStorage)
const createStorageMock = () => {
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
};

// Set up mocks before each test
beforeEach(() => {
  if (typeof window !== 'undefined') {
    // Create fresh mocks for each test to avoid state leakage
    
    // LocalStorage and SessionStorage
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
    
    // matchMedia - important for theme/responsive testing
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('(prefers-color-scheme: dark)') ? false : true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    // IntersectionObserver
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: () => [],
    }));
    
    // ResizeObserver
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    // URL object methods
    if (window.URL) {
      window.URL.createObjectURL = vi.fn(() => 'mock-object-url');
      window.URL.revokeObjectURL = vi.fn();
    }
    
    // Set up document theme classes
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.remove('dark', 'system');
      document.documentElement.classList.add('light');
    }
  }
});

// Canvas mocking for WebGL/2D contexts
if (typeof window !== 'undefined' && typeof HTMLCanvasElement !== 'undefined') {
  // Create a mock canvas context with common methods
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
  };

  // Mock the getContext method on canvas elements
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

// Mock Three.js for all tests
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

// Clean up after each test
afterEach(() => {
  cleanup(); // Cleanup testing-library rendered components
  vi.clearAllMocks(); // Clear all mock call history
});

beforeAll(() => {
  console.log('[CORE SETUP] Novamind test environment initialized');
});

// Export utility helpers that tests might need
export const testUtils = {
  setTheme: (theme: 'light' | 'dark' | 'system') => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.remove('light', 'dark', 'system');
      document.documentElement.classList.add(theme);
    }
  },
  
  setLocalStorageItem: (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  }
};
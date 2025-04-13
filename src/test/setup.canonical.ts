/**
 * Canonical Test Environment Setup for Novamind Frontend
 * 
 * This is the primary test setup file based on TESTING_GUIDELINES.md
 * and serves as the single source of truth for test environment configuration.
 */
import React from 'react';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, vi, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// --- Vitest Augmentation ---
// Extend Vitest's expect with Jest DOM matchers
expect.extend(matchers);

// Type extensions for better TypeScript support
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

// --- Browser API Mocks ---
beforeEach(() => {
  // Only mock browser APIs if window exists (browser environment)
  if (typeof window !== 'undefined') {
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

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('(prefers-color-scheme: dark)') ? false : true,
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

    Object.defineProperty(window, 'localStorage', { value: createStorageMock() });
    Object.defineProperty(window, 'sessionStorage', { value: createStorageMock() });

    // Mock URL.createObjectURL and revokeObjectURL
    if (window.URL) {
      window.URL.createObjectURL = vi.fn(() => 'mock-object-url');
      window.URL.revokeObjectURL = vi.fn();
    }

    // Initialize document with default light theme
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.remove('dark', 'system');
      document.documentElement.classList.add('light');
    }
  }
});

// --- Canvas Mocking ---
if (typeof window !== 'undefined' && typeof HTMLCanvasElement !== 'undefined') {
  // Mock CanvasRenderingContext2D methods
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

  // Mock HTMLCanvasElement.prototype.getContext
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    configurable: true,
    value: vi.fn((contextId) => {
      if (contextId === '2d') {
        return mockCanvasContext;
      }
      // Return a basic WebGL mock if requested
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
      return null; // Default case
    }),
  });
}

// --- Global Hooks ---

// Ensure DOM is cleaned up after each test
afterEach(() => {
  cleanup();
  // Reset any applied themes
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.classList.remove('dark', 'system');
    document.documentElement.classList.add('light');
  }
});

// Global setup
beforeAll(() => {
  console.log('[TEST SETUP] Canonical test environment setup complete.');
});

// --- Three.js Mocking ---
vi.mock('three', async (importOriginal) => {
  // Await the dynamic import. Let TypeScript infer the type.
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

// Exports available to tests
export const testUtils = {
  setDarkMode: (isDark: boolean = true) => {
    if (typeof document !== 'undefined' && document.documentElement) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  },
};
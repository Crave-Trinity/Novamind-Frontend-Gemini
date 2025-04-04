/**
 * Global Test Setup
 * 
 * Configure the test environment before all tests run.
 * This file is used by Vitest to set up the test environment.
 */

import '@testing-library/jest-dom';
import { afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Import test utilities and mocks
import { initTailwindMock } from './tailwind-mock';

// For tracking animation frames
const animationFrameIds: number[] = [];

// Mock objects for browser APIs that aren't available in JSDOM
beforeAll(() => {
  // Initialize the Tailwind mock system
  initTailwindMock();
  
  // Set up document for Tailwind dark mode
  document.documentElement.classList.add('light');

  // Mock window.matchMedia, which isn't available in JSDOM
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock window.ResizeObserver which isn't available in JSDOM
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  });

  // Mock IntersectionObserver which isn't available in JSDOM
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
    })),
  });

  // Simple counter-based animation frame handling to avoid type issues
  let animationFrameCounter = 0;
  
  // Mock requestAnimationFrame 
  window.requestAnimationFrame = ((callback: FrameRequestCallback): number => {
    const id = ++animationFrameCounter;
    animationFrameIds.push(id);
    setTimeout(() => callback(performance.now()), 0);
    return id;
  });

  // Mock cancelAnimationFrame
  window.cancelAnimationFrame = ((id: number): void => {
    const index = animationFrameIds.indexOf(id);
    if (index > -1) {
      animationFrameIds.splice(index, 1);
    }
  });

  // Mock WebGL contexts
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    value: vi.fn((contextType) => {
      if (contextType === 'webgl' || contextType === 'webgl2') {
        return {
          createShader: vi.fn(() => ({})),
          createProgram: vi.fn(() => ({})),
          createBuffer: vi.fn(() => ({})),
          createTexture: vi.fn(() => ({})),
          useProgram: vi.fn(),
          bindBuffer: vi.fn(),
          vertexAttribPointer: vi.fn(),
          enableVertexAttribArray: vi.fn(),
          bindTexture: vi.fn(),
          drawArrays: vi.fn(),
          drawElements: vi.fn(),
          getAttribLocation: vi.fn(() => 0),
          getUniformLocation: vi.fn(() => ({})),
          uniform1f: vi.fn(),
          uniform2f: vi.fn(),
          uniform3f: vi.fn(),
          uniform4f: vi.fn(),
          uniformMatrix4fv: vi.fn(),
          enable: vi.fn(),
          disable: vi.fn(),
          blendFunc: vi.fn(),
          clearColor: vi.fn(),
          clear: vi.fn(),
          viewport: vi.fn(),
          getExtension: vi.fn(() => null),
          createFramebuffer: vi.fn(() => ({})),
          bindFramebuffer: vi.fn(),
          scissor: vi.fn(),
        };
      }
      return null;
    }),
  });
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  
  // Clear animation frame IDs
  animationFrameIds.length = 0;
});

// Apply mocks before each test
beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

// Utility to detect memory leaks
const memoryLeakDetector = {
  start: (testName: string) => {
    // Record heap usage at start of test (for Node environments)
    if (typeof global.gc === 'function' && process.memoryUsage) {
      global.gc(); // Force garbage collection
      memoryLeakDetector.startHeap = process.memoryUsage().heapUsed;
      memoryLeakDetector.testName = testName;
    }
  },
  end: () => {
    // Check heap usage at end (for Node environments)
    if (typeof global.gc === 'function' && process.memoryUsage && memoryLeakDetector.startHeap) {
      global.gc(); // Force garbage collection
      const endHeap = process.memoryUsage().heapUsed;
      const diff = endHeap - memoryLeakDetector.startHeap;
      
      // If the difference is large, log it as potential memory leak
      if (diff > 5 * 1024 * 1024) { // 5MB threshold
        console.warn(
          `Potential memory leak in test "${memoryLeakDetector.testName}": ${(diff / 1024 / 1024).toFixed(2)}MB`
        );
      }
    }
  },
  startHeap: 0,
  testName: '',
};

// Export memory leak detector for use in specific tests
export { memoryLeakDetector };

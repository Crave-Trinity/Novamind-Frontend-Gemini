/**
 * NOVAMIND Neural Test Suite
 * Global test setup with quantum precision
 * 
 * This file handles all the global setup for tests, ensuring consistent behavior
 * across the entire test suite and preventing common issues like hanging tests.
 */

import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach } from 'vitest';

// Log the test environment initialization
console.log('[setup.ts] Initializing test environment');

// =======================
// Global Browser Polyfills
// =======================

// Mock matchMedia for components that use media queries
if (!window.matchMedia) {
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
  console.log('[setup.ts] Global matchMedia mock applied.');
}

// Fix for URL not being defined in some test environments
function patchURL() {
  if (typeof URL.createObjectURL === 'undefined') {
    Object.defineProperty(URL, 'createObjectURL', { value: vi.fn() });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn() });
    console.log('[setup.ts] URL fix applied successfully!');
  }
}

// Properly implemented TextEncoder polyfill
class MockTextEncoder {
  encode(input: string): Uint8Array {
    // Create a proper Uint8Array
    const buf = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
      buf[i] = input.charCodeAt(i);
    }
    return buf;
  }
}

// =======================
// Global Mocks
// =======================

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  callback: IntersectionObserverCallback;
  root = null;
  rootMargin = '';
  thresholds = [0];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  callback: ResizeObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Mock @react-spring/three hooks
vi.mock('@react-spring/three', () => ({
  useSpring: () => ({
    scale: 1.0,
    emissiveIntensity: 1.0,
    opacity: 1.0
  }),
  animated: {
    mesh: (props: any) => ({ ...props, type: 'animated.mesh' }),
    group: (props: any) => ({ ...props, type: 'animated.group' })
  },
  a: {
    mesh: (props: any) => ({ ...props, type: 'animated.mesh' }),
    group: (props: any) => ({ ...props, type: 'animated.group' })
  },
  config: {
    default: {},
    gentle: {},
    wobbly: {},
    stiff: {},
    slow: {},
    molasses: {}
  }
}));

// =======================
// Global Setup Hooks
// =======================

// Before all tests in the suite
beforeAll(() => {
  // Apply URL patch
  patchURL();
  
  // Apply TextEncoder polyfill
  if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = MockTextEncoder as any;
    console.log('[setup.ts] TextEncoder polyfill applied.');
  }
  
  // Apply IntersectionObserver mock
  if (typeof global.IntersectionObserver === 'undefined') {
    global.IntersectionObserver = MockIntersectionObserver as any;
    console.log('[setup.ts] IntersectionObserver mock applied.');
  }
  
  // Apply ResizeObserver mock
  if (typeof global.ResizeObserver === 'undefined') {
    global.ResizeObserver = MockResizeObserver as any;
    console.log('[setup.ts] ResizeObserver mock applied.');
  }
  
  // Apply requestAnimationFrame mock if needed
  if (typeof global.requestAnimationFrame === 'undefined') {
    global.requestAnimationFrame = (callback: FrameRequestCallback) => {
      return setTimeout(callback, 0);
    };
    console.log('[setup.ts] requestAnimationFrame polyfill applied.');
  }
  
  // Extend expect with jest-dom matchers
  console.log('[setup.ts] expect extended with jest-dom matchers (after mocks).');
});

// After each test
afterEach(() => {
  // Prevent memory leaks by cleaning up any mocks that may persist between tests
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.resetAllMocks();
});

// Log when setup is complete
console.log('[setup.ts] Setup file execution complete.');

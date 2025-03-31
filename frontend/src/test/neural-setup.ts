/**
 * NOVAMIND Neural Architecture
 * Unified Test Setup with Quantum Precision
 * 
 * This centralized setup ensures neural-safe testing with clinical precision
 * while eliminating multiple Three.js instance warnings.
 */

import '@testing-library/jest-dom';
import { vi, beforeAll, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import * as matchers from '@testing-library/jest-dom/matchers';

// Import the unified Three.js mock with quantum precision
import '@test/unified-three.mock';

// Import the neural-safe mock system with clinical precision
import { initializeNeuralTestEnvironment, setupNeuralMocks } from '@test/neural-mock-system';

// Import the mock registry for consistent dependency resolution
import { setupMockRegistry } from '@test/mock-registry';

// Neural-safe type augmentation with quantum precision
declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Matchers<R> extends matchers.TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  }
}

// Initialize the neural-safe test environment with quantum precision
initializeNeuralTestEnvironment();

// Setup additional mocks if needed
setupNeuralMocks();

// Setup the mock registry for consistent dependency resolution
setupMockRegistry();

// Create neural-safe browser environment with clinical precision
beforeAll(() => {
  // Mock window properties for neural-safe testing
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
  
  // Neural-safe mock for IntersectionObserver with quantum precision
  global.IntersectionObserver = class IntersectionObserver {
    root: Element | null = null;
    rootMargin: string = '0px';
    thresholds: number[] = [0];
    
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      // Mock implementation with neural precision
    }
    
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn().mockReturnValue([]);
  };
  
  // Neural-safe mock for ResizeObserver with quantum precision
  global.ResizeObserver = class ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      // Mock implementation with neural precision
    }
    
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
  
  // Mock animation frame with neural precision
  global.requestAnimationFrame = vi.fn(callback => {
    setTimeout(callback, 0);
    return 0;
  });
  
  // Mock canvas context for neural visualization
  HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {
        createShader: vi.fn(),
        createProgram: vi.fn(),
        createBuffer: vi.fn(),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        getProgramParameter: vi.fn().mockReturnValue(true),
        getShaderParameter: vi.fn().mockReturnValue(true),
        useProgram: vi.fn(),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
        drawArrays: vi.fn(),
        drawElements: vi.fn(),
        viewport: vi.fn(),
        getExtension: vi.fn().mockReturnValue({
          UNSIGNED_INT: 5125
        })
      };
    }
    
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(0)
      }),
      putImageData: vi.fn(),
      createImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(0)
      }),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn()
    };
  }) as any; // Use type assertion for clinical precision
});

// Set IS_REACT_ACT_ENVIRONMENT for testing React state with quantum precision
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

// Prevent console errors from cluttering test output
vi.spyOn(console, 'error').mockImplementation((...args) => {
  // Filter out known Three.js warnings
  const message = args[0]?.toString() || '';
  if (
    message.includes('THREE.WebGLRenderer') || 
    message.includes('React.createFactory') ||
    message.includes('forwardRef render functions')
  ) {
    return;
  }
  // Log other errors with neural precision
  console.log('🧠 Neural Test Error:', ...args);
});

// Ensure clean test environment with mathematical elegance
afterEach(() => {
  cleanup();
});

// Configure console error handling with clinical precision
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out React internal warnings for cleaner test output
  if (
    typeof args[0] === 'string' && 
    (
      args[0].includes('React does not recognize the') ||
      args[0].includes('Warning: validateDOMNesting') ||
      args[0].includes('Warning: render') ||
      args[0].includes('Invalid prop') ||
      args[0].includes('Warning: Each child in a list')
    )
  ) {
    return;
  }
  
  originalConsoleError(...args);
};

// Set up global JSX mock helpers for neural-safe testing
global.jsx = {
  /**
   * Neural-safe mock for rendering props with quantum precision
   */
  renderProps: (props: Record<string, any>, options = {}): string => {
    return Object.entries(props)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'function') {
          return `${key}={[Function]}`;
        }
        if (typeof value === 'object' && value !== null) {
          return `${key}={${JSON.stringify(value)}}`;
        }
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }
        return `${key}={${value}}`;
      })
      .join(' ');
  }
};

// Neural-safe mock global fetch with clinical precision
global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
  })
);

// Initialize neural-safe testing environment with clinical precision
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filter out non-critical warnings for cleaner test output
  if (
    typeof args[0] === 'string' && 
    (
      args[0].includes('useLayoutEffect does nothing on the server') ||
      args[0].includes('componentWillReceiveProps has been renamed') ||
      args[0].includes('componentWillMount has been renamed')
    )
  ) {
    return;
  }
  
  // Log other warnings with neural precision
  originalConsoleWarn(...args);
};

console.log('🧠 NOVAMIND Neural Test Infrastructure: Initialized with quantum precision');

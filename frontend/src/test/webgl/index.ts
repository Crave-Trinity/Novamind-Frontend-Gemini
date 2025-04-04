/**
 * WebGL Testing Mocks
 *
 * This module provides comprehensive mocks for Three.js and WebGL functionality
 * to prevent test hangs and detect memory leaks in components that use 3D visualizations.
 *
 * Key features:
 * 1. Prevent test hanging in JSDOM environments
 * 2. Track memory usage and detect leaks
 * 3. Provide robust mocks for Three.js objects
 * 4. Support proper cleanup and resource management
 */

import { vi } from 'vitest';
import {
  startMemoryMonitoring,
  stopMemoryMonitoring,
  trackObject,
  markDisposed,
  getMemorySnapshot,
  type MemoryReport
} from './memory-monitor';

// Track mocks for cleanup
const mocks = new Set<() => void>();

// WebGL Context Mock
class WebGLRenderingContextMock {
  canvas: HTMLCanvasElement;
  drawingBufferWidth: number;
  drawingBufferHeight: number;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.drawingBufferWidth = canvas.width;
    this.drawingBufferHeight = canvas.height;
  }
  
  // Add common WebGL methods that may be called by Three.js
  getExtension() { return {}; }
  getParameter() { return 0; }
  getShaderPrecisionFormat() { return { precision: 1, rangeMin: 1, rangeMax: 1 }; }
  getContextAttributes() { return { antialias: true, alpha: true }; }
  createTexture() { return {}; }
  createBuffer() { return {}; }
  createProgram() { return {}; }
  createShader() { return {}; }
  clear() {}
  viewport() {}
  bufferData() {}
  bindTexture() {}
  bindBuffer() {}
  useProgram() {}
  uniform1i() {}
  uniform1f() {}
  uniform2fv() {}
  uniform3fv() {}
  uniform4fv() {}
  uniformMatrix4fv() {}
}

// Export the ThreeMocks object for direct access if needed
export const ThreeMocks = {
  // Camera mocks
  PerspectiveCamera: vi.fn().mockImplementation(() => ({
    aspect: 1,
    fov: 75,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 0, z: 5, set: vi.fn() },
    quaternion: { set: vi.fn() },
    lookAt: vi.fn(),
    updateProjectionMatrix: vi.fn(),
    clone: vi.fn().mockReturnThis(),
  })),
  
  // Core Three.js mocks
  Scene: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
    background: null,
    environment: null,
  })),
  
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    domElement: document.createElement('canvas'),
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    render: vi.fn(),
    shadowMap: { enabled: false },
    outputEncoding: 'sRGB',
    toneMapping: 'ACESFilmicToneMapping',
    toneMappingExposure: 1,
    dispose: vi.fn(),
  })),
  
  // Geometry mocks
  BoxGeometry: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
  })),
  SphereGeometry: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
  })),
  BufferGeometry: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
    setAttribute: vi.fn(),
  })),
  
  // Material mocks
  MeshStandardMaterial: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
  })),
  MeshBasicMaterial: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
  })),
  
  // Object3D and derived classes
  Object3D: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0, set: vi.fn() },
    rotation: { x: 0, y: 0, z: 0, set: vi.fn() },
    scale: { x: 1, y: 1, z: 1, set: vi.fn() },
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
  })),
  Mesh: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0, set: vi.fn() },
    rotation: { x: 0, y: 0, z: 0, set: vi.fn() },
    scale: { x: 1, y: 1, z: 1, set: vi.fn() },
    geometry: { dispose: vi.fn() },
    material: { dispose: vi.fn() },
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
  })),
  Group: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0, set: vi.fn() },
    rotation: { x: 0, y: 0, z: 0, set: vi.fn() },
    scale: { x: 1, y: 1, z: 1, set: vi.fn() },
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
  })),
  
  // Math utils
  Vector3: vi.fn().mockImplementation(() => ({
    x: 0, y: 0, z: 0,
    set: vi.fn().mockReturnThis(),
    copy: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    sub: vi.fn().mockReturnThis(),
    multiplyScalar: vi.fn().mockReturnThis(),
    normalize: vi.fn().mockReturnThis(),
    cross: vi.fn().mockReturnThis(),
    dot: vi.fn().mockReturnValue(0),
    clone: vi.fn().mockReturnThis(),
  })),
  
  // Animation
  Clock: vi.fn().mockImplementation(() => ({
    getElapsedTime: vi.fn().mockReturnValue(0),
    getDelta: vi.fn().mockReturnValue(0.016),
  })),
  
  // Constants
  REVISION: '149',
  
  // Color
  Color: vi.fn().mockImplementation(() => ({
    r: 1, g: 1, b: 1,
    set: vi.fn().mockReturnThis(),
  })),
};

/**
 * Setup WebGL mocks for testing Three.js components with optional memory monitoring
 *
 * @param options Configuration options
 * @returns WebGL context that can be used in tests
 */
export function setupWebGLMocks(options: {
  monitorMemory?: boolean;
  debugMode?: boolean;
} = {}) {
  // Start memory monitoring if requested
  if (options.monitorMemory) {
    startMemoryMonitoring();
  }

  // Mock getContext to return our WebGL mock
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const mockGetContext = function(this: HTMLCanvasElement, contextId: string) {
    if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
      const context = new WebGLRenderingContextMock(this);
      if (options.monitorMemory) {
        trackObject(context, 'WebGLRenderingContext');
      }
      if (options.debugMode) {
        console.log('Created mock WebGL context');
      }
      return context;
    }
    return originalGetContext.apply(this, [contextId]);
  };
  
  HTMLCanvasElement.prototype.getContext = mockGetContext as any;
  mocks.add(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });
  
  // Mock requestAnimationFrame to execute immediately instead of async
  const originalRAF = window.requestAnimationFrame;
  window.requestAnimationFrame = (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  };
  mocks.add(() => {
    window.requestAnimationFrame = originalRAF;
  });
  
  // Mock cancelAnimationFrame
  const originalCAF = window.cancelAnimationFrame;
  window.cancelAnimationFrame = vi.fn();
  mocks.add(() => {
    window.cancelAnimationFrame = originalCAF;
  });
  
  // Mock ResizeObserver if needed by visualization components
  if (!window.ResizeObserver) {
    (window as any).ResizeObserver = class ResizeObserver {
      constructor(callback: any) {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    mocks.add(() => {
      delete (window as any).ResizeObserver;
    });
  }
  
  // Mock Three.js module (used by components directly importing Three)
  vi.mock('three', () => {
    return ThreeMocks;
  });
  
  // Mock React Three Fiber hooks if used in components
  vi.mock('@react-three/fiber', async () => {
    const actual = await vi.importActual('@react-three/fiber');
    return {
      ...actual as any,
      useThree: vi.fn().mockImplementation(() => ({
        gl: ThreeMocks.WebGLRenderer(),
        scene: ThreeMocks.Scene(),
        camera: ThreeMocks.PerspectiveCamera(),
        size: { width: 800, height: 600 },
        viewport: { width: 800, height: 600 },
        set: vi.fn(),
        get: vi.fn(),
        setSize: vi.fn(),
        invalidate: vi.fn(),
      })),
      useFrame: vi.fn().mockImplementation((callback) => {
        // Execute the frame callback once immediately
        if (callback) {
          const state = {
            clock: { getElapsedTime: () => 0, getDelta: () => 0.016 },
            camera: ThreeMocks.PerspectiveCamera(),
            scene: ThreeMocks.Scene(),
            gl: ThreeMocks.WebGLRenderer(),
          };
          callback(state, 0.016);
        }
      }),
      Canvas: ({ children }: { children: any }) => {
        // Use createElement instead of JSX since this is a .ts file
        return {
          type: 'div',
          props: {
            'data-testid': 'r3f-canvas',
            children
          }
        };
      },
    };
  });
  
  // Mock @react-three/drei if used
  vi.mock('@react-three/drei', async () => {
    const actual = await vi.importActual('@react-three/drei');
    return {
      ...(actual || {}) as any,
      // Add specific drei components that might be used
      OrbitControls: vi.fn().mockImplementation(() => null),
      Html: ({ children }: { children: any }) => ({
        type: 'div',
        props: { children }
      }),
      Text: vi.fn().mockImplementation(() => null),
      useGLTF: vi.fn().mockReturnValue({
        scene: ThreeMocks.Scene(),
        nodes: {},
        materials: {},
      }),
    };
  });
  
  console.log('WebGL mocks set up');
}

/**
 * Clean up WebGL mocks after tests and generate a memory report if monitoring was enabled
 *
 * @returns Memory report if monitoring was enabled, otherwise null
 */
export function cleanupWebGLMocks(): MemoryReport | null {
  // Restore all mocked functions
  mocks.forEach(restore => restore());
  mocks.clear();
  
  // Clear Three.js mocks
  vi.restoreAllMocks();

  // Stop memory monitoring and get report if it was enabled
  let memoryReport: MemoryReport | null = null;
  try {
    memoryReport = stopMemoryMonitoring();
    if (memoryReport.leakedObjectCount > 0) {
      console.warn(`Memory leak detected: ${memoryReport.leakedObjectCount} objects not properly disposed`);
      console.warn('Leaked objects by type:', memoryReport.leakedObjectTypes);
    }
  } catch (e) {
    // Memory monitoring wasn't started
    memoryReport = null;
  }
  
  console.log('WebGL mocks cleaned up');
  return memoryReport;
}

/**
 * Run a test with WebGL mocks and memory monitoring
 *
 * This is a convenience function for setting up WebGL mocks with memory monitoring
 * and cleaning up afterward, while catching any errors that might occur.
 *
 * @param testFn The test function to run
 * @returns A promise that resolves when the test completes
 */
export async function runWithWebGLMocks(
  testFn: () => void | Promise<void>,
  options: {
    monitorMemory?: boolean;
    failOnLeak?: boolean;
    debugMode?: boolean;
  } = {}
): Promise<{success: boolean; error?: any; memoryReport?: MemoryReport | null}> {
  setupWebGLMocks({
    monitorMemory: options.monitorMemory ?? true,
    debugMode: options.debugMode ?? false
  });
  
  try {
    const result = testFn();
    if (result instanceof Promise) {
      await result;
    }
    
    const memoryReport = cleanupWebGLMocks();
    
    if (options.failOnLeak && memoryReport && memoryReport.leakedObjectCount > 0) {
      throw new Error(`Memory leak detected: ${memoryReport.leakedObjectCount} objects not properly disposed`);
    }
    
    return { success: true, memoryReport: memoryReport };
  } catch (error) {
    const memoryReport = cleanupWebGLMocks();
    return { success: false, error, memoryReport: memoryReport };
  }
}

// Export memory monitoring utilities
export const memoryMonitor = {
  startMonitoring: startMemoryMonitoring,
  stopMonitoring: stopMemoryMonitoring,
  trackObject,
  markDisposed,
  getSnapshot: getMemorySnapshot
};
// Export enhanced interface
export type { MemoryReport } from './memory-monitor';

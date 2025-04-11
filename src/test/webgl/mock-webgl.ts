/* eslint-disable */
/**
 * WebGL/Three.js Mock for Testing Environment
 *
 * This module provides comprehensive mocks for WebGL and Three.js objects
 * to prevent test hangs and memory issues when testing Three.js components.
 *
 * It addresses multiple issues:
 * 1. JSDOM doesn't support WebGL - Mock implementation prevents errors
 * 2. Memory management - Proper dispose() methods to prevent memory leaks
 * 3. Animation frame handling - Deterministic animation for testing
 */

// Type for mock functions - compatible with test frameworks but not dependent on them
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFunction<T extends (...args: any // eslint-disable-line @typescript-eslint/no-explicit-any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T>;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockFunction<T>;
  mockReset: () => void;
  mock: {
    calls: Parameters<T>[][];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    results: { type: 'return' | 'throw'; value: any // eslint-disable-line @typescript-eslint/no-explicit-any }[];
  };
};

// Create a minimal mock function implementation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockFunction<T extends (...args: any // eslint-disable-line @typescript-eslint/no-explicit-any[]) => any>(
  implementation?: T
): MockFunction<T> {
  const calls: Parameters<T>[][] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: { type: 'return' | 'throw'; value: any // eslint-disable-line @typescript-eslint/no-explicit-any }[] = [];

// eslint-disable-next-line
  const mockFn = ((...args: Parameters<T>): ReturnType<T> => {
    calls.push([...args]);
    try {
      const result = implementation
        ? implementation(...args)
        : (undefined as unknown as ReturnType<T>);
      results.push({ type: 'return', value: result });
      return result;
    } catch (error) {
      results.push({ type: 'throw', value: error });
      throw error;
    }
  }) as MockFunction<T>;

  mockFn.mock = { calls, results };

// eslint-disable-next-line
  mockFn.mockImplementation = (newImplementation: T) => {
    implementation = newImplementation;
    return mockFn;
  };

// eslint-disable-next-line
  mockFn.mockReturnValue = (value: ReturnType<T>) => {
    implementation = (() => value) as unknown as T;
    return mockFn;
  };

// eslint-disable-next-line
  mockFn.mockReset = () => {
    calls.length = 0;
    results.length = 0;
  };

  return mockFn;
}

// Create mock functions with our implementation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fn = <T extends (...args: any // eslint-disable-line @typescript-eslint/no-explicit-any[]) => any>(impl?: T) => createMockFunction<T>(impl);

// Mock canvas getContext to return our fake WebGL context
class MockWebGLRenderingContext {
  canvas: HTMLCanvasElement;
  drawingBufferWidth: number = 800;
  drawingBufferHeight: number = 600;

  // Track resources for proper disposal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  private shaders: any // eslint-disable-line @typescript-eslint/no-explicit-any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  private programs: any // eslint-disable-line @typescript-eslint/no-explicit-any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buffers: any // eslint-disable-line @typescript-eslint/no-explicit-any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  private textures: any // eslint-disable-line @typescript-eslint/no-explicit-any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  private framebuffers: any // eslint-disable-line @typescript-eslint/no-explicit-any[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  // Minimal WebGL API implementation - expand as needed
  createShader() {
    const shader = {};
    this.shaders.push(shader);
    return shader;
  }

  createProgram() {
    const program = {};
    this.programs.push(program);
    return program;
  }

  createBuffer() {
    const buffer = {};
    this.buffers.push(buffer);
    return buffer;
  }

  createTexture() {
    const texture = {};
    this.textures.push(texture);
    return texture;
  }

  createFramebuffer() {
    const framebuffer = {};
    this.framebuffers.push(framebuffer);
    return framebuffer;
  }

  // Stub remaining WebGL methods with no-ops
  viewport() {}
  clearColor() {}
  clearDepth() {}
  clear() {}
  enable() {}
  disable() {}
  blendFunc() {}
  depthFunc() {}
  getParameter() {
    return null;
  }
  getShaderParameter() {
    return true;
  }
  getProgramParameter() {
    return true;
  }
  getUniformLocation() {
    return {};
  }
  getAttribLocation() {
    return 0;
  }
  useProgram() {}
  bindBuffer() {}
  bindTexture() {}
  bindFramebuffer() {}
  pixelStorei() {}
  uniformMatrix4fv() {}
  uniform1i() {}
  uniform1f() {}
  uniform2f() {}
  uniform3f() {}
  uniform4f() {}
  uniform3fv() {}
  drawArrays() {}
  drawElements() {}

  getExtension(extensionName: string) {
    // Add mock getExtension
    if (extensionName === 'WEBGL_lose_context') {
      return { loseContext: fn() }; // Mock the lose context extension
    }
    // Add other common extensions if needed by tests
    // e.g., OES_texture_float, ANGLE_instanced_arrays
    return null; // Return null for unmocked extensions
  }

  // Cleanup method to prevent memory leaks
  dispose() {
    this.shaders = [];
    this.programs = [];
    this.buffers = [];
    this.textures = [];
    this.framebuffers = [];
  }
}

// Mock WebGL2 context - extends WebGL1 with additional features
class MockWebGL2RenderingContext extends MockWebGLRenderingContext {
  createVertexArray() {
    return {};
  }
  bindVertexArray() {}
  createQuery() {
    return {};
  }
  beginQuery() {}
  endQuery() {}
}

// Store original method to restore later
const originalGetContext = HTMLCanvasElement.prototype.getContext;

// Patch HTMLCanvasElement to return our mock WebGL context
// eslint-disable-next-line
function patchCanvasGetContext() {
  // Use type assertion to avoid TypeScript errors with explicit this type
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextType: string,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...rest: any // eslint-disable-line @typescript-eslint/no-explicit-any[]
  ) {
    if (contextType === 'webgl' || contextType === 'experimental-webgl') {
      return new MockWebGLRenderingContext(this) as unknown as WebGLRenderingContext;
    }
    if (contextType === 'webgl2') {
      return new MockWebGL2RenderingContext(this) as unknown as WebGL2RenderingContext;
    }
    return originalGetContext.call(this, contextType, ...rest);
  } as typeof HTMLCanvasElement.prototype.getContext;
}

// Mock requestAnimationFrame for deterministic testing
// eslint-disable-next-line
function patchAnimationFrame() {
// eslint-disable-next-line
  window.requestAnimationFrame = fn((callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 16) as unknown as number;
  });

// eslint-disable-next-line
  window.cancelAnimationFrame = fn((handle: number) => {
    clearTimeout(handle);
  });
}

// Mock matchMedia for responsive testing
// eslint-disable-next-line
function patchMatchMedia() {
// eslint-disable-next-line
  if (typeof window.matchMedia !== 'function') {
// eslint-disable-next-line
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
// eslint-disable-next-line
      value: fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: fn(),
        removeListener: fn(),
        addEventListener: fn(),
        removeEventListener: fn(),
        dispatchEvent: fn(),
      })),
    });
  }
}

// Create and export Three.js specific mocks
export class CoreWebGLRenderer {
  domElement: HTMLCanvasElement;
  shadowMap = { enabled: false, type: 0 };
  outputEncoding = 0;
  toneMapping = 0;
  toneMappingExposure = 1;

  constructor() {
    this.domElement = document.createElement('canvas');
  }

  setSize() {}
  setPixelRatio() {}
  render() {}
  dispose() {}
}

export class MockWebGLTexture {
  dispose() {}
}

export class MockWebGLGeometry {
  dispose() {}
}

export class MockWebGLMaterial {
  dispose() {}
}

// Set up global cleanup function for tests
// eslint-disable-next-line
export function cleanupWebGLMocks() {
  // Reset the canvas getContext to original implementation
  HTMLCanvasElement.prototype.getContext = originalGetContext;
}

// Helper function to initialize mocks for a test
// eslint-disable-next-line
export function setupWebGLMocks() {
  patchCanvasGetContext();
  patchAnimationFrame();
  patchMatchMedia();

  // Return a context for tests that need direct access
  const canvas = document.createElement('canvas');
  return canvas.getContext('webgl');
}

// Automatically apply mocks (can be disabled by importing and calling cleanup)
setupWebGLMocks();

export default {
  setupWebGLMocks,
  cleanupWebGLMocks,
  CoreWebGLRenderer,
  MockWebGLTexture,
  MockWebGLGeometry,
  MockWebGLMaterial,
};

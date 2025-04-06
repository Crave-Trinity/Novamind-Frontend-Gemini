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
type MockFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T>;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockFunction<T>;
  mockReset: () => void;
  mock: {
    calls: Parameters<T>[][];
    results: { type: 'return' | 'throw'; value: any }[];
  };
};

// Create a minimal mock function implementation
function createMockFunction<T extends (...args: any[]) => any>(
  implementation?: T
): MockFunction<T> {
  const calls: Parameters<T>[][] = [];
  const results: { type: 'return' | 'throw'; value: any }[] = [];

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

  mockFn.mockImplementation = (newImplementation: T) => {
    implementation = newImplementation;
    return mockFn;
  };

  mockFn.mockReturnValue = (value: ReturnType<T>) => {
    implementation = (() => value) as unknown as T;
    return mockFn;
  };

  mockFn.mockReset = () => {
    calls.length = 0;
    results.length = 0;
  };

  return mockFn;
}

// Create mock functions with our implementation
const fn = <T extends (...args: any[]) => any>(impl?: T) => createMockFunction<T>(impl);

// Mock canvas getContext to return our fake WebGL context
class MockWebGLRenderingContext {
  canvas: HTMLCanvasElement;
  drawingBufferWidth: number = 800;
  drawingBufferHeight: number = 600;

  // Track resources for proper disposal
  private shaders: any[] = [];
  private programs: any[] = [];
  private buffers: any[] = [];
  private textures: any[] = [];
  private framebuffers: any[] = [];

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

  getExtension(extensionName: string) { // Add mock getExtension
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
function patchCanvasGetContext() {
  // Use type assertion to avoid TypeScript errors with explicit this type
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextType: string,
    ...rest: any[]
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
function patchAnimationFrame() {
  window.requestAnimationFrame = fn((callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 16) as unknown as number;
  });

  window.cancelAnimationFrame = fn((handle: number) => {
    clearTimeout(handle);
  });
}

// Mock matchMedia for responsive testing
function patchMatchMedia() {
  if (typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
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
export function cleanupWebGLMocks() {
  // Reset the canvas getContext to original implementation
  HTMLCanvasElement.prototype.getContext = originalGetContext;
}

// Helper function to initialize mocks for a test
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

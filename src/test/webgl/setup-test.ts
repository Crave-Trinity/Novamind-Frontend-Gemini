/**
 * NOVAMIND WebGL Test Setup
 * 
 * Provides quantum-level test configuration for WebGL-based neurological visualization components
 */

import { vi } from 'vitest';

// Mock WebGL context and capabilities
export function setupWebGLMocks() {
  // Create a canvas element for the tests
  const mockCanvas = document.createElement('canvas');
  
  // Create mock WebGL context with all necessary methods
  const mockWebGLContext = {
    canvas: mockCanvas,
    drawingBufferWidth: 800,
    drawingBufferHeight: 600,
    viewport: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    createProgram: vi.fn().mockReturnValue({}),
    createShader: vi.fn().mockReturnValue({}),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn().mockReturnValue(true),
    getShaderInfoLog: vi.fn().mockReturnValue(''),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn().mockReturnValue(true),
    getProgramInfoLog: vi.fn().mockReturnValue(''),
    useProgram: vi.fn(),
    getUniformLocation: vi.fn().mockReturnValue({}),
    getAttribLocation: vi.fn().mockReturnValue(0),
    createBuffer: vi.fn().mockReturnValue({}),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    uniform1i: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn(),
    uniform4f: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    createTexture: vi.fn().mockReturnValue({}),
    bindTexture: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    activeTexture: vi.fn(),
    deleteShader: vi.fn(),
    deleteProgram: vi.fn(),
    deleteBuffer: vi.fn(),
    deleteTexture: vi.fn(),
    getExtension: vi.fn().mockImplementation(() => ({
      UNPACK_FLIP_Y_WEBGL: 0,
      UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0,
    })),
    isContextLost: vi.fn().mockReturnValue(false),
  };

  // Mock canvas getContext method
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType) => {
    if (contextType === 'webgl' || contextType === 'webgl2' || contextType === 'experimental-webgl') {
      return mockWebGLContext;
    }
    return null;
  });

  // Mock WebGLRenderingContext
  global.WebGLRenderingContext = vi.fn().mockImplementation(() => mockWebGLContext);

  // Mock requestAnimationFrame for animation testing
  global.requestAnimationFrame = vi.fn().mockImplementation((callback) => {
    return setTimeout(callback, 0);
  });

  // Mock three.js objects used in visualization
  const mockThreeObjects = {
    Object3D: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      children: [],
      add: vi.fn(),
      remove: vi.fn(),
      traverse: vi.fn(),
      dispose: vi.fn()
    })),
    Scene: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      remove: vi.fn()
    })),
    PerspectiveCamera: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 5 },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn()
    })),
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      domElement: mockCanvas,
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn()
    }))
  };

  // Add to global for easy reference
  global.__MOCK_THREE__ = mockThreeObjects;

  return {
    canvas: mockCanvas,
    gl: mockWebGLContext,
    originalGetContext,
    threeObjects: mockThreeObjects
  };
}

// Cleanup WebGL mocks after tests
export function cleanupWebGLMocks() {
  // Restore original canvas getContext
  if (HTMLCanvasElement.prototype.getContext.mockRestore) {
    HTMLCanvasElement.prototype.getContext.mockRestore();
  }

  // Clean up global requestAnimationFrame mock
  if (global.requestAnimationFrame.mockRestore) {
    global.requestAnimationFrame.mockRestore();
  }

  // Clean up global three.js mocks
  delete global.__MOCK_THREE__;

  return {
    leakedObjects: 0, // Mock memory monitoring report
    disposedObjects: 0,
    memoryUsage: '0 MB'
  };
}

// Setup for test with neural activity data
export function setupWebGLForTest() {
  return setupWebGLMocks();
}

// Cleanup after test with neural activity data
export function cleanupWebGLAfterTest() {
  return cleanupWebGLMocks();
}

// Run test with WebGL setup
export function runTestWithWebGL(testFn: () => void) {
  const mocks = setupWebGLMocks();
  try {
    testFn();
  } finally {
    cleanupWebGLMocks();
  }
  return mocks;
}
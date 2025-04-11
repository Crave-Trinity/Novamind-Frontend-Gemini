/**
 * NOVAMIND Neural Digital Twin
 * WebGL Testing Infrastructure
 * 
 * This module provides the foundation for testing 3D visualization components
 * with mathematical precision and architectural elegance.
 */

import { vi } from 'vitest';

// WebGL Constants
const WebGLConstants = {
  DEPTH_TEST: 2929,
  DEPTH_FUNC: 2932,
  LEQUAL: 515,
  BLEND: 3042,
  SRC_ALPHA: 770,
  ONE_MINUS_SRC_ALPHA: 771,
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963,
  STATIC_DRAW: 35044,
  DYNAMIC_DRAW: 35048,
  FRAGMENT_SHADER: 35632,
  VERTEX_SHADER: 35633,
  COMPILE_STATUS: 35713,
  LINK_STATUS: 35714,
  COLOR_BUFFER_BIT: 16384,
  DEPTH_BUFFER_BIT: 256,
  TRIANGLES: 4,
  FLOAT: 5126,
  UNSIGNED_SHORT: 5123,
  TEXTURE_2D: 3553,
  TEXTURE_MIN_FILTER: 10241,
  TEXTURE_MAG_FILTER: 10240,
  TEXTURE_WRAP_S: 10242,
  TEXTURE_WRAP_T: 10243,
  LINEAR: 9729,
  CLAMP_TO_EDGE: 33071,
  RGBA: 6408,
  UNSIGNED_BYTE: 5121,
};

// Create a sophisticated mock WebGL context
const mockContext = {
  canvas: null as HTMLCanvasElement | null,
  drawingBufferWidth: 800,
  drawingBufferHeight: 600,
  ...WebGLConstants,
  getExtension: vi.fn().mockReturnValue({}),
  getParameter: vi.fn().mockReturnValue({}),
  getShaderPrecisionFormat: vi.fn().mockReturnValue({ precision: 1, rangeMin: 1, rangeMax: 1 }),
  createBuffer: vi.fn().mockReturnValue({}),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  createShader: vi.fn().mockReturnValue({}),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  getShaderParameter: vi.fn().mockReturnValue(true),
  createProgram: vi.fn().mockReturnValue({}),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn().mockReturnValue(true),
  useProgram: vi.fn(),
  getUniformLocation: vi.fn().mockReturnValue({}),
  uniform1f: vi.fn(),
  uniform2f: vi.fn(),
  uniform3f: vi.fn(),
  uniform4f: vi.fn(),
  uniformMatrix4fv: vi.fn(),
  getAttribLocation: vi.fn().mockReturnValue(0),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
  clear: vi.fn(),
  clearColor: vi.fn(),
  clearDepth: vi.fn(),
  disable: vi.fn(),
  enable: vi.fn(),
  blendFunc: vi.fn(),
  depthFunc: vi.fn(),
  viewport: vi.fn(),
  createTexture: vi.fn().mockReturnValue({}),
  bindTexture: vi.fn(),
  texParameteri: vi.fn(),
  texImage2D: vi.fn(),
  activeTexture: vi.fn(),
};

// Store original methods for restoration
const originalCreateElement = document.createElement;
const originalRAF = window.requestAnimationFrame;
const originalCAF = window.cancelAnimationFrame;

// Setup mock for WebGL context
export function setupWebGLMock() {
  document.createElement = function(tagName: string) {
    if (tagName.toLowerCase() === 'canvas') {
      const canvas = originalCreateElement.call(document, tagName) as HTMLCanvasElement;
      const originalGetContext = canvas.getContext;
      
      // Override getContext with cleanly typed implementation
      canvas.getContext = function(contextType: string, contextAttributes?: Record<string, unknown>) {
        if (
          contextType === 'webgl' ||
          contextType === 'webgl2' ||
          contextType === 'experimental-webgl'
        ) {
          return mockContext;
        }
        return originalGetContext.call(this, contextType, contextAttributes);
      };
      return canvas;
    }
    return originalCreateElement.call(document, tagName);
  };

  // Mock animation frame methods
  let animFrameId = 0;
  window.requestAnimationFrame = (callback: FrameRequestCallback) => {
    animFrameId += 1;
    setTimeout(() => callback(performance.now()), 0);
    return animFrameId;
  };
  
  window.cancelAnimationFrame = vi.fn();
}

// Clean up the WebGL mock
export function cleanupWebGLMock() {
  document.createElement = originalCreateElement;
  window.requestAnimationFrame = originalRAF;
  window.cancelAnimationFrame = originalCAF;
}

// Export the mock for direct manipulation
export { mockContext };
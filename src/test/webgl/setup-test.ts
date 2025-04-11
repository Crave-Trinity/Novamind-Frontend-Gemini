/**
 * NOVAMIND Neural Digital Twin
 * WebGL Testing Utilities
 * 
 * This module provides quantum-level utilities for testing Three.js and WebGL components
 * with mathematical elegance and architectural perfection.
 */

import { vi } from 'vitest';
import { render, RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

// Mock essential WebGL context and Three.js objects
const mockWebGLContext = {
  canvas: null as HTMLCanvasElement | null,
  getContext: vi.fn().mockReturnValue({
    getExtension: vi.fn().mockReturnValue({}),
    getParameter: vi.fn().mockReturnValue({}),
    getShaderPrecisionFormat: vi.fn().mockReturnValue({
      precision: 1,
      rangeMin: 1,
      rangeMax: 1,
    }),
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
  }),
};

// Mock for requestAnimationFrame and cancelAnimationFrame
let mockAnimationFrameId = 0;
const mockRequestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  mockAnimationFrameId += 1;
  setTimeout(() => callback(performance.now()), 0);
  return mockAnimationFrameId;
});

const mockCancelAnimationFrame = vi.fn((id: number) => {
  // noop implementation
});

/**
 * Setup WebGL mocks for testing
 * Sets up all necessary WebGL and Three.js mocks for testing
 */
export function setupWebGLForTest() {
  // Mock the canvas and WebGL context
  const mockCanvas = document.createElement('canvas');
  mockWebGLContext.canvas = mockCanvas;
  
  // Create spy for webgl context creation
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    (contextType: string) => {
      if (contextType === 'webgl' || contextType === 'webgl2') {
        return mockWebGLContext.getContext();
      }
      // Return 2D context for other cases
      return document.createElement('canvas').getContext('2d');
    }
  );

  // Mock window.requestAnimationFrame
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(mockRequestAnimationFrame);
  
  // Mock window.cancelAnimationFrame
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(mockCancelAnimationFrame);
}

/**
 * Clean up WebGL mocks after testing
 * Restores all mocked functions and performs memory cleanup
 */
export function cleanupWebGLAfterTest() {
  // Restore all mocks
  vi.restoreAllMocks();
  
  // Clear canvas reference
  mockWebGLContext.canvas = null;
  
  // Reset animation frame counter
  mockAnimationFrameId = 0;
}

/**
 * Runs a test with WebGL mocking
 * @param ui React element to render
 * @param callback Test callback function
 */
export async function runTestWithWebGL(
  ui: ReactElement,
  callback: (result: RenderResult) => Promise<void> | void
): Promise<void> {
  setupWebGLForTest();
  try {
    const renderResult = render(ui);
    await callback(renderResult);
  } finally {
    cleanupWebGLAfterTest();
  }
}

/**
 * WebGL Testing Config
 * Provides configuration for WebGL testing
 */
export const webGLTestConfig = {
  setupTimeout: 5000, // ms
  renderTimeout: 1000, // ms
  animationFrameLimit: 10, // Max number of animation frames to allow
  memoryLimit: 100 * 1024 * 1024, // 100MB limit
};

// Export the mock objects for direct test manipulation if needed
export const webGLMocks = {
  context: mockWebGLContext,
  requestAnimationFrame: mockRequestAnimationFrame,
  cancelAnimationFrame: mockCancelAnimationFrame,
};
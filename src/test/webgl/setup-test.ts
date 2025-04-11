/**
 * WebGL/Three.js Test Setup Module
 * 
 * Comprehensive setup for WebGL and Three.js testing environment.
 * This module initializes all necessary mocks and utilities needed for
 * deterministic, memory-efficient testing of Three.js components.
 * 
 * Provides a clean API for test files to import and use.
 */

import { setupWebGLMocks, cleanupWebGLMocks } from './mock-webgl';

// Automatically setup mocks when this module is imported
setupWebGLMocks();

// Create a global cleanup function for afterAll hooks
global.cleanupWebGLMocksAfterAll = cleanupWebGLMocks;

// Export everything from the mock-webgl module
export * from './mock-webgl';

// Custom helper functions for tests
export const createMockCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
};

// Neural pattern data generator for visualization tests
export const generateNeuralPatternData = (
  regionCount: number = 10,
  patternIntensity: number = 0.75
): { regions: string[]; intensities: number[] } => {
  const regions = Array.from({ length: regionCount }, (_, i) => `region-${i + 1}`);
  const intensities = Array.from({ length: regionCount }, () => Math.random() * patternIntensity);
  
  return { regions, intensities };
};

// Function to mock a performant animation frame
export const mockAnimationFrame = (callback: (time: number) => void): void => {
  let frameCount = 0;
  const maxFrames = 5; // Limit frames for test efficiency
  
  const runFrame = (timestamp: number): void => {
    if (frameCount < maxFrames) {
      callback(timestamp);
      frameCount++;
      requestAnimationFrame(runFrame);
    }
  };
  
  requestAnimationFrame(runFrame);
};

// Helper to create mock shader materials
export const createMockShaderMaterial = () => {
  return {
    uniforms: {
      time: { value: 0 },
      intensity: { value: 1.0 },
      color: { value: { r: 1, g: 1, b: 1 } }
    },
    vertexShader: `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }`,
    dispose: () => {}
  };
};

// Export default setup function for explicit initialization
export default function setupTestEnvironment(): void {
  setupWebGLMocks();
  
  // Return cleanup function
  return cleanupWebGLMocks;
}
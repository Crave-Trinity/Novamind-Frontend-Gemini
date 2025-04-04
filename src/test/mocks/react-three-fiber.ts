/**
 * React Three Fiber Mock for Testing
 * 
 * This mock provides test-safe versions of react-three-fiber hooks and components
 * that won't cause animation loops or WebGL context issues in the test environment.
 */
import { vi } from 'vitest';
import React from 'react';
import { mockThreeObjects, cleanupThreeAnimations } from './three';

// Mock canvas context and frame loop management
const mockCanvasContext = {
  gl: {
    domElement: document.createElement('canvas'),
    render: vi.fn(),
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    setClearColor: vi.fn(),
    clear: vi.fn(),
  },
  scene: {
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
    background: null,
  },
  camera: {
    position: { x: 0, y: 0, z: 5 },
    lookAt: vi.fn(),
    updateProjectionMatrix: vi.fn(),
  },
  raycaster: {
    setFromCamera: vi.fn(),
    intersectObjects: vi.fn().mockReturnValue([]),
  },
  clock: {
    getElapsedTime: vi.fn().mockReturnValue(0),
    getDelta: vi.fn().mockReturnValue(0.016),
  },
  size: { width: 800, height: 600 },
  viewport: { width: 8, height: 6, factor: 100 },
  mouse: { x: 0, y: 0 },
  invalidate: vi.fn(),
  subscribe: vi.fn(),
  setSize: vi.fn(),
  setDpr: vi.fn(),
  onPointerMissed: vi.fn(),
};

// Canvas component mock (named export)
export const Canvas = vi.fn().mockImplementation(({ children, ...props }) => {
  // Provide a basic context provider if needed, or just render children
  // For simplicity, just rendering children within a div
  return React.createElement('div', {
    'data-testid': 'mock-canvas',
    className: 'mock-three-canvas',
    style: { width: '100%', height: '100%' },
    ...props,
  }, children);
});

// Hook mocks (named exports)
export const useThree = vi.fn().mockImplementation(() => mockCanvasContext);
export const useFrame = vi.fn().mockImplementation((callback) => {
  // Simulate a few frames (e.g., 3) to allow potential async operations
  // or state updates within the frame loop to progress, without causing an infinite loop.
  const maxFrames = 3;
  if (typeof callback === 'function') {
    for (let i = 0; i < maxFrames; i++) {
      try {
         // Pass slightly increasing time delta if needed, or keep constant
         callback(mockCanvasContext, 0.016 * (i + 1));
      } catch (e) {
         console.error(`Error in mocked useFrame callback (frame ${i + 1}):`, e);
         break; // Stop simulation if an error occurs
      }
    }
  }
  // R3F useFrame returns undefined
  return undefined;
});

export const useLoader = vi.fn().mockImplementation(() => ({
  // Return a basic mock object, specific tests might need more detail
  clone: vi.fn().mockReturnThis(),
}));

// Common primitive mocks (named exports)
// These are often components in R3F, mocking as simple divs for testing structure
export const mesh = vi.fn().mockImplementation(({ children, ...props }) =>
  React.createElement('div', {
    'data-testid': 'mock-mesh',
    className: 'mock-three-mesh',
    ...props,
  }, children)
);

export const group = vi.fn().mockImplementation(({ children, ...props }) =>
  React.createElement('div', {
    'data-testid': 'mock-group',
    className: 'mock-three-group',
    ...props,
  }, children)
);

// Utility for cleaning up (can be exported if needed by tests)
export const cleanupR3FMock = () => {
  cleanupThreeAnimations(); // Ensure base three mocks are cleaned
  
  // Reset all mock functions defined in this file
  useThree.mockClear();
  useFrame.mockClear();
  useLoader.mockClear();
  Canvas.mockClear();
  mesh.mockClear();
  group.mockClear();
};

// No default export needed with named exports
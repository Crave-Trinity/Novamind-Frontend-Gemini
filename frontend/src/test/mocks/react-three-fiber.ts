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

// Canvas component mock
const Canvas = vi.fn().mockImplementation(({ children, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'mock-canvas',
    className: 'mock-three-canvas',
    style: { width: '100%', height: '100%' },
    ...props,
    children,
  });
});

// Hook mocks
const useThree = vi.fn().mockImplementation(() => mockCanvasContext);
const useFrame = vi.fn().mockImplementation((callback) => {
  // Call the callback once with mock values but don't set up an animation loop
  if (typeof callback === 'function') {
    callback(mockCanvasContext, 0.016);
  }
  return undefined;
});

const useLoader = vi.fn().mockImplementation(() => ({
  clone: vi.fn().mockReturnThis(),
}));

// Common primitive mocks
const mesh = vi.fn().mockImplementation(({ children, ...props }) => 
  React.createElement('div', { 
    'data-testid': 'mock-mesh',
    className: 'mock-three-mesh',
    ...props,
    children 
  })
);

const group = vi.fn().mockImplementation(({ children, ...props }) => 
  React.createElement('div', { 
    'data-testid': 'mock-group',
    className: 'mock-three-group',
    ...props,
    children 
  })
);

// Mock the standard components from @react-three/fiber
export const reactThreeFiberMock = {
  // Entry component
  Canvas,
  
  // Hooks
  useThree,
  useFrame,
  useLoader,
  
  // Common primitives
  mesh,
  group,
  
  // Utility for cleaning up
  cleanup: () => {
    cleanupThreeAnimations();
    
    // Reset all mock functions
    useThree.mockClear();
    useFrame.mockClear();
    useLoader.mockClear();
    Canvas.mockClear();
    mesh.mockClear();
    group.mockClear();
  }
};

export default reactThreeFiberMock;
/**
 * NOVAMIND Neural Architecture
 * Unified Three.js Mock with Quantum Precision
 * 
 * This file provides a single source of truth for all Three.js and React Three Fiber mocks.
 * It eliminates conflicting implementations and provides a consistent interface for tests.
 */

import { vi } from 'vitest';

/**
 * Create a unified mock for Three.js and React Three Fiber
 * This is the ONLY place where these libraries should be mocked
 */
export function createUnifiedThreeMock() {
  // Core Three.js mock with quantum precision
  const mockThree = {
    // Basic Three.js classes
    Object3D: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      add: vi.fn(),
      remove: vi.fn()
    })),
    
    Scene: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      children: []
    })),
    
    Group: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      add: vi.fn(),
      remove: vi.fn(),
      children: []
    })),
    
    Mesh: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: null,
      geometry: null
    })),
    
    PerspectiveCamera: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 5 },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn()
    })),
    
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      domElement: { nodeName: 'CANVAS' }
    })),
    
    Color: vi.fn().mockImplementation(() => ({ r: 1, g: 1, b: 1 })),
    Vector3: vi.fn().mockImplementation((x = 0, y = 0, z = 0) => ({ x, y, z })),
    
    // Materials
    MeshStandardMaterial: vi.fn().mockImplementation(() => ({})),
    MeshBasicMaterial: vi.fn().mockImplementation(() => ({})),
    
    // Geometries
    SphereGeometry: vi.fn().mockImplementation(() => ({})),
    BoxGeometry: vi.fn().mockImplementation(() => ({})),
    
    // Lights
    AmbientLight: vi.fn().mockImplementation(() => ({})),
    DirectionalLight: vi.fn().mockImplementation(() => ({}))
  };
  
  // React Three Fiber mock with clinical precision
  const mockReactThreeFiber = {
    Canvas: vi.fn().mockImplementation(({ children }) => {
      return {
        type: 'div',
        props: {
          'data-testid': 'r3f-canvas',
          children
        }
      };
    }),
    
    useThree: vi.fn().mockReturnValue({
      scene: mockThree.Scene(),
      camera: mockThree.PerspectiveCamera(),
      gl: mockThree.WebGLRenderer()
    }),
    
    useFrame: vi.fn()
  };
  
  // React Three Drei mock with mathematical elegance
  const mockReactThreeDrei = {
    OrbitControls: vi.fn().mockImplementation(() => null),
    Html: vi.fn().mockImplementation(({ children }) => children)
  };
  
  // React Three A11y mock with quantum precision
  const mockReactThreeA11y = {
    A11y: vi.fn().mockImplementation(({ children }) => children)
  };
  
  return {
    three: mockThree,
    reactThreeFiber: mockReactThreeFiber,
    reactThreeDrei: mockReactThreeDrei,
    reactThreeA11y: mockReactThreeA11y
  };
}

/**
 * Register all Three.js and React Three Fiber mocks
 * This should be called once in the setup file
 */
export function registerUnifiedThreeMock() {
  const mocks = createUnifiedThreeMock();
  
  // Register mocks with quantum precision
  vi.mock('three', () => mocks.three);
  vi.mock('@react-three/fiber', () => mocks.reactThreeFiber);
  vi.mock('@react-three/drei', () => mocks.reactThreeDrei);
  vi.mock('@react-three/a11y', () => mocks.reactThreeA11y);
  
  return mocks;
}

export default {
  createUnifiedThreeMock,
  registerUnifiedThreeMock
};

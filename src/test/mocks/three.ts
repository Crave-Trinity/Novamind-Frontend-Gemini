/**
 * Three.js Mock
 * 
 * Provides lightweight mocks of Three.js objects to prevent actual rendering
 * in test environments. This eliminates WebGL-related test hanging issues.
 */

import { vi } from 'vitest';

// Mock Geometry classes
class MockGeometry {
  dispose = vi.fn();
  attributes = {
    position: { array: new Float32Array([0, 0, 0]) },
    normal: { array: new Float32Array([0, 0, 1]) },
    uv: { array: new Float32Array([0, 0]) }
  };
}

// Mock Material classes
class MockMaterial {
  dispose = vi.fn();
  side = 0; // FrontSide
  transparent = false;
  opacity = 1;
  color = { r: 1, g: 1, b: 1, set: vi.fn() };
  emissive = { r: 0, g: 0, b: 0, set: vi.fn() };
  needsUpdate = false;
}

// Mock Scene
class MockScene {
  children: any[] = [];
  background = null;
  add = vi.fn((obj: any) => {
    this.children.push(obj);
    return obj;
  });
  remove = vi.fn((obj: any) => {
    const index = this.children.indexOf(obj);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  });
  traverse = vi.fn((callback: (obj: any) => void) => {
    this.children.forEach(callback);
  });
}

// Mock Camera
class MockCamera {
  position = { x: 0, y: 0, z: 5, set: vi.fn() };
  lookAt = vi.fn();
  updateProjectionMatrix = vi.fn();
  aspect = 1;
}

// Mock Vector classes
class MockVector3 {
  x = 0;
  y = 0;
  z = 0;
  set = vi.fn(() => this);
  copy = vi.fn(() => this);
  add = vi.fn(() => this);
  sub = vi.fn(() => this);
  multiplyScalar = vi.fn(() => this);
  normalize = vi.fn(() => this);
  length = vi.fn(() => 1);
}

class MockVector2 {
  x = 0;
  y = 0;
  set = vi.fn(() => this);
  copy = vi.fn(() => this);
}

// Mock Color
class MockColor {
  r = 1;
  g = 1;
  b = 1;
  set = vi.fn(() => this);
}

// Mock Mesh
class MockMesh {
  position = { x: 0, y: 0, z: 0, set: vi.fn() };
  rotation = { x: 0, y: 0, z: 0, set: vi.fn() };
  scale = { x: 1, y: 1, z: 1, set: vi.fn() };
  geometry = new MockGeometry();
  material = new MockMaterial();
  visible = true;
  children: any[] = [];
  add = vi.fn((obj: any) => {
    this.children.push(obj);
    return obj;
  });
  remove = vi.fn((obj: any) => {
    const index = this.children.indexOf(obj);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  });
}

// Mock Group (same as Mesh but no geometry or material)
class MockGroup {
  position = { x: 0, y: 0, z: 0, set: vi.fn() };
  rotation = { x: 0, y: 0, z: 0, set: vi.fn() };
  scale = { x: 1, y: 1, z: 1, set: vi.fn() };
  visible = true;
  children: any[] = [];
  add = vi.fn((obj: any) => {
    this.children.push(obj);
    return obj;
  });
  remove = vi.fn((obj: any) => {
    const index = this.children.indexOf(obj);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  });
  traverse = vi.fn((callback: (obj: any) => void) => {
    this.children.forEach(callback);
  });
}

// Utility functions to help with animation cleanup
export const mockThreeObjects = {
  renderers: [] as MockWebGLRenderer[],
  scenes: [] as MockScene[],
  meshes: [] as MockMesh[]
};

export const cleanupThreeAnimations = (): void => {
  // Clean up any rendering objects
  mockThreeObjects.renderers.forEach(renderer => renderer.dispose());
  mockThreeObjects.renderers = [];
};

// Mock Renderer
class MockWebGLRenderer {
  domElement = document.createElement('canvas');
  shadowMap = { enabled: false };
  setSize = vi.fn();
  setPixelRatio = vi.fn();
  render = vi.fn();
  dispose = vi.fn();
  setClearColor = vi.fn();
  clear = vi.fn();
  info = { 
    render: { calls: 0, triangles: 0, points: 0, lines: 0 } 
  };
  forceContextLoss = vi.fn();
}

// Mock Raycaster
class MockRaycaster {
  setFromCamera = vi.fn();
  intersectObjects = vi.fn(() => []);
}

// Mock Animation-related objects
const Clock = vi.fn().mockImplementation(() => ({
  getElapsedTime: vi.fn(() => 0),
  getDelta: vi.fn(() => 0.016),
  start: vi.fn(),
  stop: vi.fn(),
}));

// Create Three.js mock module
const ThreeMock = {
  // Basic objects
  Object3D: vi.fn().mockImplementation(() => new MockGroup()),
  Scene: vi.fn().mockImplementation(() => new MockScene()),
  Group: vi.fn().mockImplementation(() => new MockGroup()),
  Mesh: vi.fn().mockImplementation(() => new MockMesh()),
  
  // Geometries
  BoxGeometry: vi.fn().mockImplementation(() => new MockGeometry()),
  SphereGeometry: vi.fn().mockImplementation(() => new MockGeometry()),
  CylinderGeometry: vi.fn().mockImplementation(() => new MockGeometry()),
  PlaneGeometry: vi.fn().mockImplementation(() => new MockGeometry()),
  BufferGeometry: vi.fn().mockImplementation(() => new MockGeometry()),
  
  // Materials
  MeshBasicMaterial: vi.fn().mockImplementation(() => new MockMaterial()),
  MeshStandardMaterial: vi.fn().mockImplementation(() => new MockMaterial()),
  MeshPhongMaterial: vi.fn().mockImplementation(() => new MockMaterial()),
  MeshLambertMaterial: vi.fn().mockImplementation(() => new MockMaterial()),
  LineBasicMaterial: vi.fn().mockImplementation(() => new MockMaterial()),
  
  // Cameras
  PerspectiveCamera: vi.fn().mockImplementation(() => new MockCamera()),
  OrthographicCamera: vi.fn().mockImplementation(() => new MockCamera()),
  
  // Math
  Vector3: vi.fn().mockImplementation(() => new MockVector3()),
  Vector2: vi.fn().mockImplementation(() => new MockVector2()),
  Color: vi.fn().mockImplementation(() => new MockColor()),
  
  // Rendering
  WebGLRenderer: vi.fn().mockImplementation(() => new MockWebGLRenderer()),
  
  // Raycasting
  Raycaster: vi.fn().mockImplementation(() => new MockRaycaster()),
  
  // Clock and animation
  Clock,
  
  // Constants
  FrontSide: 0,
  BackSide: 1,
  DoubleSide: 2,
  
  // Texture handling
  TextureLoader: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockImplementation(() => ({
      image: new Image(),
      dispose: vi.fn(),
    })),
  })),
  
  // Other necessary utilities
  MathUtils: {
    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,
    clamp: vi.fn((value, min, max) => Math.min(Math.max(value, min), max)),
    lerp: vi.fn((start, end, alpha) => start + (end - start) * alpha),
  },
};

export default ThreeMock;

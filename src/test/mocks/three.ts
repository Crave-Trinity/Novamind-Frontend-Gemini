/**
 * Three.js Mock
 * 
 * Provides lightweight mocks of Three.js objects to prevent actual rendering
 * in test environments. This eliminates WebGL-related test hanging issues.
 */

import { vi } from 'vitest';

// Mock Geometry classes (using named exports)
export class MockGeometry { // Renamed for clarity if needed elsewhere
  dispose = vi.fn();
  attributes = {
    position: { array: new Float32Array([0, 0, 0]) },
    normal: { array: new Float32Array([0, 0, 1]) },
    uv: { array: new Float32Array([0, 0]) }
  };
}
export const BoxGeometry = vi.fn().mockImplementation(() => new MockGeometry());
export const SphereGeometry = vi.fn().mockImplementation(() => new MockGeometry());
export const CylinderGeometry = vi.fn().mockImplementation(() => new MockGeometry());
export const PlaneGeometry = vi.fn().mockImplementation(() => new MockGeometry());
export const BufferGeometry = vi.fn().mockImplementation(() => new MockGeometry());

// Mock Material classes (using named exports)
export class MockMaterial { // Renamed for clarity if needed elsewhere
  dispose = vi.fn();
  side = 0; // FrontSide
  transparent = false;
  opacity = 1;
  color = { r: 1, g: 1, b: 1, set: vi.fn() };
  emissive = { r: 0, g: 0, b: 0, set: vi.fn() };
  needsUpdate = false;
}
export const MeshBasicMaterial = vi.fn().mockImplementation(() => new MockMaterial());
export const MeshStandardMaterial = vi.fn().mockImplementation(() => new MockMaterial());
export const MeshPhongMaterial = vi.fn().mockImplementation(() => new MockMaterial());
export const MeshLambertMaterial = vi.fn().mockImplementation(() => new MockMaterial());
export const LineBasicMaterial = vi.fn().mockImplementation(() => new MockMaterial());

// Mock Scene (using named export)
export class Scene {
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

// Mock Camera (using named exports)
export class MockCamera {
  // Initialize position with the mocked Vector3 for correct structure
  position = new Vector3(0, 0, 5);
  lookAt = vi.fn();
  updateProjectionMatrix = vi.fn();
  aspect = 1;
}
export const PerspectiveCamera = vi.fn().mockImplementation(() => new MockCamera());
export const OrthographicCamera = vi.fn().mockImplementation(() => new MockCamera());

// Mock Vector classes (using named exports)
export class Vector3 {
  x = 0;
  y = 0;
  z = 0;
  constructor(x = 0, y = 0, z = 0) { // Add constructor
      this.x = x;
      this.y = y;
      this.z = z;
  }
  set = vi.fn(() => this);
  copy = vi.fn(() => this);
  add = vi.fn(() => this);
  sub = vi.fn(() => this);
  multiplyScalar = vi.fn(() => this);
  normalize = vi.fn(() => this);
  length = vi.fn(() => 1);
}

export class Vector2 {
  x = 0;
  y = 0;
  constructor(x = 0, y = 0) { // Add constructor
      this.x = x;
      this.y = y;
  }
  set = vi.fn(() => this);
  copy = vi.fn(() => this);
}

// Mock Color (using named export)
export class Color {
  r = 1;
  g = 1;
  b = 1;
  constructor(r = 1, g = 1, b = 1) { // Add constructor
      this.r = r;
      this.g = g;
      this.b = b;
  }
  set = vi.fn(() => this);
}

// Mock Mesh (using named export)
export class Mesh {
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

// Mock Group (using named export)
export class Group {
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
export const Object3D = vi.fn().mockImplementation(() => new Group()); // Alias Object3D to Group

// Utility functions to help with animation cleanup
export const mockThreeObjects = {
  renderers: [] as WebGLRenderer[], // Use exported class name
  scenes: [] as Scene[],           // Use exported class name
  meshes: [] as Mesh[]             // Use exported class name
};

export const cleanupThreeAnimations = (): void => {
  // Clean up any rendering objects
  mockThreeObjects.renderers.forEach(renderer => renderer.dispose());
  mockThreeObjects.renderers = [];
};

// Mock Renderer (using named export)
export class WebGLRenderer {
  domElement = document.createElement('canvas');
  shadowMap = { enabled: false };
  setSize = vi.fn();
  setPixelRatio = vi.fn();
  // Mock render to accept scene and camera, matching the real signature
  render = vi.fn((scene: any, camera: any) => {});
  dispose = vi.fn();
  setClearColor = vi.fn();
  clear = vi.fn();
  info = {
    render: { calls: 0, triangles: 0, points: 0, lines: 0 }
  };
  forceContextLoss = vi.fn();
}

// Mock Raycaster (using named export)
export class Raycaster {
  setFromCamera = vi.fn();
  intersectObjects = vi.fn(() => []);
}

// Mock Animation-related objects (using named export)
export const Clock = vi.fn().mockImplementation(() => ({
  getElapsedTime: vi.fn(() => 0),
  getDelta: vi.fn(() => 0.016),
  start: vi.fn(),
  stop: vi.fn(),
}));

// Constants (using named exports)
// Mock Texture
export class Texture {
  image: HTMLImageElement | null = null;
  needsUpdate = false;
  dispose = vi.fn();
  constructor(image?: HTMLImageElement) {
    this.image = image || null;
  }
}

export const FrontSide = 0;
export const BackSide = 1;
export const DoubleSide = 2;

// Texture handling (using named export)
export const TextureLoader = vi.fn().mockImplementation(() => ({
  load: vi.fn().mockImplementation(() => ({
    image: new Image(),
    dispose: vi.fn(),
  })),
}));

// Other necessary utilities (using named export)
export const MathUtils = {
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,
  clamp: vi.fn((value, min, max) => Math.min(Math.max(value, min), max)),
  lerp: vi.fn((start, end, alpha) => start + (end - start) * alpha),
};

// No default export needed anymore

/**
 * Comprehensive Three.js mocks for testing
 * Simulates Three.js objects without actual WebGL rendering
 */

import { vi } from 'vitest';

// Mock Vector classes
export class Vector2 {
  x: number;
  y: number;
  
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  set = vi.fn().mockReturnThis();
  copy = vi.fn().mockReturnThis();
  add = vi.fn().mockReturnThis();
  sub = vi.fn().mockReturnThis();
  multiply = vi.fn().mockReturnThis();
  divide = vi.fn().mockReturnThis();
  length = vi.fn().mockReturnValue(1);
  normalize = vi.fn().mockReturnThis();
  clone = vi.fn().mockImplementation(() => new Vector2(this.x, this.y));
}

export class Vector3 {
  x: number;
  y: number;
  z: number;
  
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  set = vi.fn().mockReturnThis();
  copy = vi.fn().mockReturnThis();
  add = vi.fn().mockReturnThis();
  sub = vi.fn().mockReturnThis();
  multiply = vi.fn().mockReturnThis();
  divide = vi.fn().mockReturnThis();
  length = vi.fn().mockReturnValue(1);
  normalize = vi.fn().mockReturnThis();
  clone = vi.fn().mockImplementation(() => new Vector3(this.x, this.y, this.z));
  applyQuaternion = vi.fn().mockReturnThis();
  applyMatrix4 = vi.fn().mockReturnThis();
  cross = vi.fn().mockReturnThis();
  dot = vi.fn().mockReturnValue(0);
}

export class Euler {
  x: number;
  y: number;
  z: number;
  
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  set = vi.fn().mockReturnThis();
  copy = vi.fn().mockReturnThis();
  setFromQuaternion = vi.fn().mockReturnThis();
  setFromVector3 = vi.fn().mockReturnThis();
}

export class Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
  
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  
  set = vi.fn().mockReturnThis();
  copy = vi.fn().mockReturnThis();
  setFromEuler = vi.fn().mockReturnThis();
  multiply = vi.fn().mockReturnThis();
  slerp = vi.fn().mockReturnThis();
  equals = vi.fn().mockReturnValue(false);
  clone = vi.fn().mockImplementation(() => new Quaternion(this.x, this.y, this.z, this.w));
}

// Mock material classes
export class Material {
  uuid = 'mock-material-uuid';
  name = '';
  transparent = false;
  opacity = 1;
  visible = true;
  side = 0; // FrontSide
  
  dispose = vi.fn();
  clone = vi.fn().mockImplementation(() => new Material());
  copy = vi.fn().mockReturnThis();
}

export class MeshBasicMaterial extends Material {
  color = { r: 1, g: 1, b: 1 };
  map = null;
  wireframe = false;
  
  setValues = vi.fn().mockReturnThis();
  override clone = vi.fn().mockImplementation(() => new MeshBasicMaterial());
}

export class MeshStandardMaterial extends Material {
  color = { r: 1, g: 1, b: 1 };
  roughness = 1;
  metalness = 0;
  map = null;
  normalMap = null;
  
  setValues = vi.fn().mockReturnThis();
  override clone = vi.fn().mockImplementation(() => new MeshStandardMaterial());
}

export class ShaderMaterial extends Material {
  uniforms = {};
  vertexShader = '';
  fragmentShader = '';
  
  setValues = vi.fn().mockReturnThis();
  override clone = vi.fn().mockImplementation(() => new ShaderMaterial());
}

// Mock geometry classes
export class BufferGeometry {
  uuid = 'mock-geometry-uuid';
  attributes = {};
  index = null;
  
  setAttribute = vi.fn().mockReturnThis();
  setIndex = vi.fn().mockReturnThis();
  computeVertexNormals = vi.fn();
  computeBoundingSphere = vi.fn();
  dispose = vi.fn();
  clone = vi.fn().mockImplementation(() => new BufferGeometry());
}

export class SphereGeometry extends BufferGeometry {
  parameters = {
    radius: 1,
    widthSegments: 32,
    heightSegments: 16
  };
  
  override clone = vi.fn().mockImplementation(() => new SphereGeometry());
}

export class BoxGeometry extends BufferGeometry {
  parameters = {
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1
  };
  
  override clone = vi.fn().mockImplementation(() => new BoxGeometry());
}

// Mock object classes
export class Object3D {
  uuid = 'mock-object-uuid';
  name = '';
  type = 'Object3D';
  position = new Vector3();
  rotation = new Euler();
  quaternion = new Quaternion();
  scale = new Vector3(1, 1, 1);
  visible = true;
  children: Object3D[] = [];
  parent: Object3D | null = null;
  userData = {};
  matrixAutoUpdate = true;
  
  add = vi.fn().mockImplementation((child: Object3D) => {
    this.children.push(child);
    child.parent = this;
    return this;
  });
  
  remove = vi.fn().mockImplementation((child: Object3D) => {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
    return this;
  });
  
  traverse = vi.fn().mockImplementation((callback: (object: Object3D) => void) => {
    callback(this);
    this.children.forEach(child => child.traverse(callback));
  });
  
  updateMatrix = vi.fn();
  updateMatrixWorld = vi.fn();
  lookAt = vi.fn();
  clone = vi.fn().mockImplementation(() => {
    const clone = new Object3D();
    clone.position.copy(this.position);
    clone.rotation.copy(this.rotation);
    clone.scale.copy(this.scale);
    return clone;
  });
}

export class Group extends Object3D {
  override type = 'Group';
  override clone = vi.fn().mockImplementation(() => new Group());
}

export class Mesh extends Object3D {
  override type = 'Mesh';
  geometry: BufferGeometry;
  material: Material | Material[];
  
  constructor(geometry = new BufferGeometry(), material = new MeshBasicMaterial()) {
    super();
    this.geometry = geometry;
    this.material = material;
  }
  
  override clone = vi.fn().mockImplementation(() => {
    const clone = new Mesh();
    clone.geometry = this.geometry;
    clone.material = Array.isArray(this.material) 
      ? [...this.material] 
      : this.material;
    return clone;
  });
}

// Mock renderer
export class WebGLRenderer {
  domElement = document.createElement('canvas');
  
  constructor() {
    this.domElement.width = 800;
    this.domElement.height = 600;
  }
  
  setSize = vi.fn();
  setPixelRatio = vi.fn();
  setClearColor = vi.fn();
  render = vi.fn();
  dispose = vi.fn();
  forceContextLoss = vi.fn();
  clear = vi.fn();
}

// Mock camera
export class PerspectiveCamera extends Object3D {
  override type = 'PerspectiveCamera';
  fov = 50;
  aspect = 1;
  near = 0.1;
  far = 2000;
  
  updateProjectionMatrix = vi.fn();
  override clone = vi.fn().mockImplementation(() => new PerspectiveCamera());
}

// Mock scene
export class Scene extends Object3D {
  override type = 'Scene';
  background = null;
  environment = null;
  fog = null;
  
  override clone = vi.fn().mockImplementation(() => new Scene());
}

// Mock raycaster
export class Raycaster {
  ray = {
    origin: new Vector3(),
    direction: new Vector3()
  };
  near = 0;
  far = Infinity;
  
  set = vi.fn().mockReturnThis();
  setFromCamera = vi.fn();
  intersectObject = vi.fn().mockReturnValue([]);
  intersectObjects = vi.fn().mockReturnValue([]);
}

// Mock constants
export const FrontSide = 0;
export const BackSide = 1;
export const DoubleSide = 2;
export const NoBlending = 0;
export const NormalBlending = 1;
export const AdditiveBlending = 2;
export const SubtractiveBlending = 3;
export const MultiplyBlending = 4;

// Export all mocks for use in tests
export default {
  Vector2,
  Vector3,
  Euler,
  Quaternion,
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
  BufferGeometry,
  SphereGeometry,
  BoxGeometry,
  Object3D,
  Group,
  Mesh,
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Raycaster,
  FrontSide,
  BackSide,
  DoubleSide,
  NoBlending,
  NormalBlending,
  AdditiveBlending,
  SubtractiveBlending,
  MultiplyBlending
};
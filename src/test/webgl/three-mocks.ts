/* eslint-disable */
/**
 * Three.js Comprehensive Mock System
 *
 * This module provides complete mocks for Three.js objects and their lifecycle methods,
 * preventing memory leaks and test hangs when testing visualization components.
 *
 * These mocks are designed to work with the WebGL context mocks from mock-webgl.ts
 * to create a complete testing environment for Three.js components.
 */

import { vi } from 'vitest';

// Type aliases for easier reference
type Vector3Like = { x: number; y: number; z: number };
type Vector2Like = { x: number; y: number };

/**
 * Mock implementation of Three.js basic objects
 */
export class MockObject3D {
  id: number = Math.floor(Math.random() * 1000000);
  name: string = '';
  type: string = 'Object3D';
  position: Vector3Like = { x: 0, y: 0, z: 0 };
  rotation: Vector3Like = { x: 0, y: 0, z: 0 };
  scale: Vector3Like = { x: 1, y: 1, z: 1 };
  visible: boolean = true;
  children: MockObject3D[] = [];
  parent: MockObject3D | null = null;
  userData: Record<string, any> = {};
  matrixAutoUpdate: boolean = true;
  matrix: { elements: number[] } = { elements: new Array(16).fill(0) }; // Mock matrix
  matrixWorld: { elements: number[] } = { elements: new Array(16).fill(0) }; // Mock matrix world

  // Standard method definitions
  add(object: MockObject3D): this {
    this.children.push(object);
    object.parent = this;
    return this;
  }

  remove(object: MockObject3D): this {
    const index = this.children.indexOf(object);
    if (index !== -1) {
      this.children.splice(index, 1);
      object.parent = null;
    }
    return this;
  }

  updateMatrix(): void {}
  updateMatrixWorld(_force?: boolean): void {}
  lookAt(_vector: Vector3Like): void {}

  // Example implementation for traverse using vi.fn()
  traverse(callback: (object: MockObject3D) => void): void {
    callback(this);
    this.children.forEach((child) => child.traverse(callback));
  }

  dispose(): void {
    while (this.children.length > 0) {
      this.remove(this.children[0]);
    }
  }

  clone(): MockObject3D {
    const clone = new MockObject3D();
    clone.name = this.name;
    clone.visible = this.visible;
    // Copy other relevant properties if needed
    return clone;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raycast(_raycaster: any, _intersects: any[]): void {}

  // Define as a standard method with the mock logic inside
  getWorldPosition(target: Vector3Like): Vector3Like {
    // Simplified mock implementation
    target.x = this.position.x; // Assuming world position is same as local for mock
    target.y = this.position.y;
    target.z = this.position.z;
    return target; // Return the modified target vector
  }

  worldToLocal(vector: Vector3Like): Vector3Like { return vector; } // Identity for simplicity
  setRotationFromEuler(_euler: Vector3Like): void {}
  applyMatrix4(_matrix: { elements: number[] }): void {}
}

/**
 * Specific Three.js object mocks
 */
export class MockScene extends MockObject3D {
  override type = 'Scene';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  background: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  environment: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  fog: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
}

export class MockPerspectiveCamera extends MockObject3D {
  override type = 'PerspectiveCamera';
  fov: number = 50;
  aspect: number = 1;
  near: number = 0.1;
  far: number = 2000;
  zoom: number = 1;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  view: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
  filmGauge: number = 35;
  filmOffset: number = 0;

  updateProjectionMatrix = vi.fn().mockImplementation(() => {});
}

export class MockOrthographicCamera extends MockObject3D {
  override type = 'OrthographicCamera';
  left: number = -1;
  right: number = 1;
  top: number = 1;
  bottom: number = -1;
  near: number = 0.1;
  far: number = 2000;
  zoom: number = 1;

  updateProjectionMatrix = vi.fn().mockImplementation(() => {});
}

export class MockMesh extends MockObject3D {
  geometry: MockBufferGeometry;
  material: MockMaterial | MockMaterial[];

  constructor(
    geometry?: MockBufferGeometry,
    material?: MockMaterial | MockMaterial[],
  ) {
    super();
    this.geometry = geometry ?? new MockBufferGeometry();
    this.material = material ?? new MockMaterial();
  }

  // Override dispose to clean up geometry and material
// eslint-disable-next-line
  override dispose = vi.fn().mockImplementation(() => {
// eslint-disable-next-line
    if (this.geometry && typeof this.geometry.dispose === 'function') {
      this.geometry.dispose();
    }
    if (this.material) {
      if (Array.isArray(this.material)) {
        this.material.forEach(
          (mat) => mat && typeof mat.dispose === 'function' && mat.dispose(),
        );
// eslint-disable-next-line
      } else if (typeof this.material.dispose === 'function') {
        this.material.dispose();
      }
    }
    // Handle children disposal through remove
    while (this.children.length > 0) {
      this.remove(this.children[0]);
    }
  });
}

export class MockGroup extends MockObject3D {
  override type = 'Group';
}

export class MockLine extends MockObject3D {
  override type = 'Line';
  geometry: MockBufferGeometry;
  material: MockMaterial;

// eslint-disable-next-line
  constructor(geometry?: MockBufferGeometry, material?: MockMaterial) {
    super();
    this.geometry = geometry || new MockBufferGeometry();
    this.material = material || new MockMaterial();
  }

  // Override dispose to clean up geometry and material
// eslint-disable-next-line
  override dispose = vi.fn().mockImplementation(() => {
// eslint-disable-next-line
    if (this.geometry && typeof this.geometry.dispose === 'function') {
      this.geometry.dispose();
    }
// eslint-disable-next-line
    if (this.material && typeof this.material.dispose === 'function') {
      this.material.dispose();
    }
    // Handle children disposal through remove
    while (this.children.length > 0) {
      this.remove(this.children[0]);
    }
  });
}

/**
 * Material mocks
 */
export class MockMaterial {
  id: number = Math.floor(Math.random() * 1000000);
  name: string = '';
  type: string = 'Material';
  transparent: boolean = false;
  opacity: number = 1;
  visible: boolean = true;
  side: number = 0; // FrontSide
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  color: any // eslint-disable-line @typescript-eslint/no-explicit-any = { r: 1, g: 1, b: 1, set: () => {} };
  userData: Record<string, any> = {};

  dispose = vi.fn().mockImplementation(() => {});
// eslint-disable-next-line
  clone = vi.fn().mockImplementation((): MockMaterial => {
    const material = new MockMaterial();
    material.name = this.name;
    material.transparent = this.transparent;
    material.opacity = this.opacity;
    material.visible = this.visible;
    return material;
  });
}

export class MockMeshBasicMaterial extends MockMaterial {
  override type = 'MeshBasicMaterial';
  wireframe: boolean = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
}

export class MockMeshStandardMaterial extends MockMaterial {
  override type = 'MeshStandardMaterial';
  roughness: number = 0.5;
  metalness: number = 0.5;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  normalMap: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
}

export class MockLineBasicMaterial extends MockMaterial {
  override type = 'LineBasicMaterial';
  linewidth: number = 1;
}

export class MockLineDashedMaterial extends MockLineBasicMaterial {
  override type = 'LineDashedMaterial';
  dashSize: number = 3;
  gapSize: number = 1;
  scale: number = 1;
  dashOffset: number = 0; // This was mentioned as missing in the docs
}

/**
 * Geometry mocks
 */
export class MockBufferGeometry {
  id: number;
  type: string;
  attributes: { [name: string]: any };
  index: any;
  groups: any[];
  boundingBox: any;
  boundingSphere: any;
  userData: Record<string, any>;

  constructor() {
    this.id = Math.floor(Math.random() * 1000000);
    this.type = 'BufferGeometry';
    this.attributes = {};
    this.index = null;
    this.groups = [];
    this.boundingBox = null;
    this.boundingSphere = null;
    this.userData = {};
  }

  // Standard method definitions
  setAttribute(_name: string, _attribute: any): this { return this; }
  getAttribute(_name: string): any { return undefined; } // Return undefined or a mock attribute
  setIndex(_index: any): void {}
  toNonIndexed(): this { return this; }
  computeVertexNormals(): void {}
  computeBoundingBox(): void {}
  computeBoundingSphere(): void {}
  dispose(): void {}
  clone(): MockBufferGeometry {
    const clone = new MockBufferGeometry();
    clone.attributes = { ...this.attributes };
    clone.index = this.index;
    clone.groups = [...this.groups];
    clone.boundingBox = this.boundingBox; // Assuming these can be shallow copied
    clone.boundingSphere = this.boundingSphere;
    clone.userData = { ...this.userData };
    return clone;
  }
  setFromPoints(_points: Vector3Like[]): this { return this; }
  copy(_source: MockBufferGeometry): this { return this; }
  applyMatrix4(_matrix: { elements: number[] }): this { return this; }
}

export class MockSphereGeometry extends MockBufferGeometry {
  override type = 'SphereGeometry';
  parameters = {
    radius: 1,
    widthSegments: 8,
    heightSegments: 6,
    phiStart: 0,
    phiLength: Math.PI * 2,
    thetaStart: 0,
    thetaLength: Math.PI,
  };
}

export class MockBoxGeometry extends MockBufferGeometry {
  override type = 'BoxGeometry';
  parameters = {
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
  };
}

export class MockCylinderGeometry extends MockBufferGeometry {
  override type = 'CylinderGeometry';
  parameters = {
    radiusTop: 1,
    radiusBottom: 1,
    height: 1,
    radialSegments: 8,
    heightSegments: 1,
    openEnded: false,
    thetaStart: 0,
    thetaLength: Math.PI * 2,
  };
}

/**
 * Renderer mocks
 */
export class MockWebGLRenderer {
  domElement: HTMLCanvasElement;
  shadowMap = { enabled: false, type: 0 };
  outputEncoding = 0;
  toneMapping = 0;
  toneMappingExposure = 1;
  localClippingEnabled = false;
  gammaFactor = 2.0;
  info = { render: { calls: 0, triangles: 0, frame: 0 } };

  constructor(_parameters?: { antialias?: boolean; alpha?: boolean }) {
    // Prefixed unused parameters
    this.domElement = document.createElement('canvas');
    this.domElement.width = 800;
    this.domElement.height = 600;
  }

  // Standard method definitions
  setSize(_width: number, _height: number, _updateStyle?: boolean): void {}
  setPixelRatio(_value: number): void {}
  render(_scene: MockScene, _camera: MockPerspectiveCamera | MockOrthographicCamera): void {}
  dispose(): void {}
  setClearColor(_color: number | string, _alpha?: number): void {}
  setRenderTarget(_renderTarget: any): void {}
  clear(_color?: boolean, _depth?: boolean, _stencil?: boolean): void {}
}

/**
 * Controls mocks
 */
export class MockOrbitControls {
  enabled: boolean = true;
  target: Vector3Like = { x: 0, y: 0, z: 0 };
  minDistance: number = 0;
  maxDistance: number = Infinity;
  enableDamping: boolean = false;
  dampingFactor: number = 0.05;
  enablePan: boolean = true;
  autoRotate: boolean = false;

  constructor(_camera: MockPerspectiveCamera | MockOrthographicCamera, _domElement?: HTMLElement | Document) {}

  update = vi.fn().mockImplementation((): boolean => false);
  dispose = vi.fn().mockImplementation(() => {});
  saveState = vi.fn().mockImplementation(() => {});
  reset = vi.fn().mockImplementation(() => {});
}

/**
 * Texture mocks
 */
export class MockTexture {
  id: number = Math.floor(Math.random() * 1000000);
  name: string = '';
  uuid: string = 'texture-' + Math.random().toString(36).substring(2, 15);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  mipmaps: any // eslint-disable-line @typescript-eslint/no-explicit-any[] = [];
  mapping: number = 0;
  wrapS: number = 0;
  wrapT: number = 0;
  magFilter: number = 0;
  minFilter: number = 0;
  format: number = 0;
  type: number = 0;
  offset: Vector2Like = { x: 0, y: 0 };
  repeat: Vector2Like = { x: 1, y: 1 };
  center: Vector2Like = { x: 0, y: 0 };
  rotation: number = 0;
  matrixAutoUpdate: boolean = true;

  constructor(image?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement /* Add other valid types */) {
    this.image = image;
  }

  dispose = vi.fn();
  updateMatrix = vi.fn().mockImplementation(() => {});
  transformUv = vi.fn().mockImplementation((uv: Vector2Like): Vector2Like => uv);
  clone = vi.fn().mockImplementation((): MockTexture => new MockTexture(this.image));
}

/**
 * Export all mocks with a consistent interface for easy importing
 */
export const ThreeMocks = {
  // Core objects
  Object3D: MockObject3D,
  Scene: MockScene,
  Group: MockGroup,

  // Cameras
  PerspectiveCamera: MockPerspectiveCamera,
  OrthographicCamera: MockOrthographicCamera,

  // Renderables
  Mesh: MockMesh,
  Line: MockLine,

  // Materials
  Material: MockMaterial,
  MeshBasicMaterial: MockMeshBasicMaterial,
  MeshStandardMaterial: MockMeshStandardMaterial,
  LineBasicMaterial: MockLineBasicMaterial,
  LineDashedMaterial: MockLineDashedMaterial,

  // Geometries
  BufferGeometry: MockBufferGeometry,
  SphereGeometry: MockSphereGeometry,
  BoxGeometry: MockBoxGeometry,
  CylinderGeometry: MockCylinderGeometry,

  // Renderer
  WebGLRenderer: MockWebGLRenderer,

  // Controls
  OrbitControls: MockOrbitControls,

  // Textures
  Texture: MockTexture,
};

export default ThreeMocks;

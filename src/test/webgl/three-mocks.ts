/**
 * Three.js Comprehensive Mock System
 *
 * This module provides complete mocks for Three.js objects and their lifecycle methods,
 * preventing memory leaks and test hangs when testing visualization components.
 *
 * These mocks are designed to work with the WebGL context mocks from mock-webgl.ts
 * to create a complete testing environment for Three.js components.
 */

import type { MockFunction } from './mock-types';
import { createMockFunction } from './mock-utils'; // Removed unused fn import

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
  matrix: any = { identity: () => {}, copy: () => {}, multiply: () => {} };
  matrixWorld: any = { identity: () => {}, copy: () => {}, multiply: () => {} };

  add = vi.fn().mockImplementation((object: MockObject3D): this => {
    // Direct mock assignment
    this.children.push(object);
    object.parent = this;
    return this;
  });

  remove = vi.fn().mockImplementation((object: MockObject3D): this => {
    // Direct mock assignment
    const index = this.children.indexOf(object);
    if (index !== -1) {
      this.children.splice(index, 1);
      object.parent = null;
    }
    return this;
  });

  updateMatrix: MockFunction<() => void> = createMockFunction(() => {});
  updateMatrixWorld: MockFunction<(force?: boolean) => void> = createMockFunction(() => {});
  lookAt: MockFunction<(vector: Vector3Like) => void> = createMockFunction(
    (_vector: Vector3Like) => {}
  ); // Added parameter to match signature
  traverse: MockFunction<(callback: (object: MockObject3D) => void) => void> = createMockFunction(
    (callback) => {
      callback(this);
      for (const child of this.children) {
        child.traverse(callback);
      }
    }
  );

  dispose: MockFunction<() => void> = createMockFunction(() => {
    // Clean up children to prevent memory leaks
    while (this.children.length > 0) {
      this.remove(this.children[0]);
    }
  });

  clone: MockFunction<() => MockObject3D> = createMockFunction(() => {
    const clone = new MockObject3D();
    clone.name = this.name;
    clone.visible = this.visible;
    return clone;
  });
}

/**
 * Specific Three.js object mocks
 */
export class MockScene extends MockObject3D {
  override type = 'Scene';
  background: any = null;
  environment: any = null;
  fog: any = null;
}

export class MockPerspectiveCamera extends MockObject3D {
  override type = 'PerspectiveCamera';
  fov: number = 50;
  aspect: number = 1;
  near: number = 0.1;
  far: number = 2000;
  zoom: number = 1;
  view: any = null;
  filmGauge: number = 35;
  filmOffset: number = 0;

  updateProjectionMatrix: MockFunction<() => void> = createMockFunction(() => {});
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

  updateProjectionMatrix: MockFunction<() => void> = createMockFunction(() => {});
}

export class MockMesh extends MockObject3D {
  override type = 'Mesh';
  geometry: MockBufferGeometry;
  material: MockMaterial;

  constructor(geometry?: MockBufferGeometry, material?: MockMaterial) {
    super();
    this.geometry = geometry || new MockBufferGeometry();
    this.material = material || new MockMaterial();
  }

  // Override dispose to clean up geometry and material
  override dispose: MockFunction<() => void> = createMockFunction(() => {
    // Clean up children (similar to what the parent class does)
    while (this.children.length > 0) {
      this.remove(this.children[0]);
    }

    // Release references to parent
    if (this.parent) {
      this.parent = null;
    }

    // Dispose geometry and material
    this.geometry.dispose();

    if (Array.isArray(this.material)) {
      this.material.forEach((m) => m.dispose());
    } else {
      this.material.dispose();
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

  constructor(geometry?: MockBufferGeometry, material?: MockMaterial) {
    super();
    this.geometry = geometry || new MockBufferGeometry();
    this.material = material || new MockMaterial();
  }

  // Override dispose to clean up geometry and material
  override dispose: MockFunction<() => void> = createMockFunction(() => {
    // Clean up children (similar to what the parent class does)
    while (this.children.length > 0) {
      this.remove(this.children[0]);
    }

    // Release references to parent
    if (this.parent) {
      this.parent = null;
    }

    // Dispose geometry and material
    this.geometry.dispose();
    this.material.dispose();
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
  color: any = { r: 1, g: 1, b: 1, set: () => {} };
  userData: Record<string, any> = {};

  dispose: MockFunction<() => void> = createMockFunction(() => {});
  clone: MockFunction<() => MockMaterial> = createMockFunction(() => {
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
  override color: any = { r: 1, g: 1, b: 1, set: () => {} };
  wireframe: boolean = false;
  map: any = null;
}

export class MockMeshStandardMaterial extends MockMaterial {
  override type = 'MeshStandardMaterial';
  roughness: number = 0.5;
  metalness: number = 0.5;
  map: any = null;
  normalMap: any = null;
}

export class MockLineBasicMaterial extends MockMaterial {
  override type = 'LineBasicMaterial';
  override color: any = { r: 1, g: 1, b: 1, set: () => {} };
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
  id: number = Math.floor(Math.random() * 1000000);
  type: string = 'BufferGeometry';
  attributes: Record<string, any> = {};
  index: any = null;
  groups: any[] = [];
  boundingBox: any = null;
  boundingSphere: any = null;
  userData: Record<string, any> = {};

  setAttribute = vi.fn().mockImplementation((name: string, attribute: any): this => {
    // Direct mock assignment
    this.attributes[name] = attribute;
    return this;
  });

  getAttribute: MockFunction<(name: string) => any> = createMockFunction((name) => {
    return this.attributes[name];
  });

  dispose: MockFunction<() => void> = createMockFunction(() => {
    // Clean up to prevent memory leaks
    this.attributes = {};
    this.index = null;
    this.groups = [];
  });

  clone: MockFunction<() => MockBufferGeometry> = createMockFunction(() => {
    return new MockBufferGeometry();
  });

  setFromPoints = vi.fn().mockImplementation((_points: Vector3Like[]): this => {
    // Direct mock assignment
    // Mock implementation, actual logic might vary
    return this;
  });
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

  setSize: MockFunction<(width: number, height: number, updateStyle?: boolean) => void> =
    createMockFunction((_width: number, _height: number, _updateStyle?: boolean) => {}); // Added parameters
  setPixelRatio: MockFunction<(value: number) => void> = createMockFunction((_value: number) => {}); // Added parameter
  render: MockFunction<
    (scene: MockScene, camera: MockPerspectiveCamera | MockOrthographicCamera) => void
  > = createMockFunction(
    (_scene: MockScene, _camera: MockPerspectiveCamera | MockOrthographicCamera) => {}
  ); // Added parameters
  dispose: MockFunction<() => void> = createMockFunction(() => {});
  setClearColor: MockFunction<(color: any, alpha?: number) => void> = createMockFunction(
    (_color: any, _alpha?: number) => {}
  ); // Added parameters
  setRenderTarget: MockFunction<(renderTarget: any) => void> = createMockFunction(
    (_renderTarget: any) => {}
  ); // Added parameter
  clear: MockFunction<() => void> = createMockFunction(() => {});
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

  constructor(_camera: MockPerspectiveCamera | MockOrthographicCamera, _domElement?: HTMLElement) {
    // Prefixed unused camera, domElement
    // Constructor takes camera and optional domElement
  }

  update = vi.fn().mockImplementation((): boolean => true); // Direct mock assignment, return boolean
  dispose: MockFunction<() => void> = createMockFunction(() => {});
}

/**
 * Texture mocks
 */
export class MockTexture {
  id: number = Math.floor(Math.random() * 1000000);
  name: string = '';
  uuid: string = 'texture-' + Math.random().toString(36).substring(2, 15);
  image: any = null;
  mipmaps: any[] = [];
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

  dispose: MockFunction<() => void> = createMockFunction(() => {});
  updateMatrix: MockFunction<() => void> = createMockFunction(() => {});
  transformUv: MockFunction<(uv: Vector2Like) => Vector2Like> = createMockFunction((uv) => uv);
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

// /workspaces/Novamind-Backend/frontend/src/test/__mocks__/three.ts
import { vi } from 'vitest';

// --- START: Internal Mock Class Definitions ---
// (Copied and adapted from the factory function in setup.ts)

interface Vector3 {
  x: number; y: number; z: number;
  set: (x: number, y: number, z: number) => Vector3; clone: () => Vector3; normalize: () => Vector3;
  multiplyScalar: (scalar: number) => Vector3; length: () => number; add: (v: Vector3) => Vector3;
  subVectors: (a: Vector3, b: Vector3) => Vector3; applyMatrix4: (m: any) => Vector3; project: (camera: any) => Vector3;
}
interface Color { r: number; g: number; b: number; set: (color: any) => Color; clone: () => Color; }
interface Object3D {
  position: Vector3; rotation: Vector3; scale: Vector3; add: (object: Object3D) => void; remove: (object: Object3D) => void;
  clone: () => Object3D; traverse: (callback: (obj: Object3D) => void) => void; updateMatrixWorld: (force?: boolean) => void;
  matrixWorld: { decompose: (pos: Vector3, quat: any, scale: Vector3) => void };
}
interface Material {
  clone: () => Material; dispose: () => void; needsUpdate: boolean; color: Color; emissive?: Color; opacity: number; transparent: boolean;
  uniforms?: { [uniform: string]: { value: any } }; // Add uniforms for ShaderMaterial
}
interface BufferGeometry {
  setAttribute: (name: string, attribute: any) => void; setIndex: (index: any) => void; computeVertexNormals: () => void;
  dispose: () => void; setFromPoints: (points: Vector3[]) => void;
}
interface Mesh extends Object3D { material?: Material | Material[]; geometry?: BufferGeometry; }

class InternalVector3 implements Vector3 {
    x: number; y: number; z: number;
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; return this; }
    copy(v: { x: number; y: number; z: number }) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    add(v: { x: number; y: number; z: number }) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
    sub(v: { x: number; y: number; z: number }) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
    multiply(v: { x: number; y: number; z: number }) { this.x *= v.x; this.y *= v.y; this.z *= v.z; return this; }
    multiplyScalar(s: number) { this.x *= s; this.y *= s; this.z *= s; return this; }
    divide(v: { x: number; y: number; z: number }) { this.x /= v.x; this.y /= v.y; this.z /= v.z; return this; }
    length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
    normalize() { const l = this.length(); if (l > 0) { this.x /= l; this.y /= l; this.z /= l; } return this; }
    clone() { return new InternalVector3(this.x, this.y, this.z); }
    applyQuaternion() { return this; }
    toArray() { return [this.x, this.y, this.z]; }
    cross(v: { x: number; y: number; z: number }) { const ax = this.x, ay = this.y, az = this.z; const bx = v.x, by = v.y, bz = v.z; this.x = ay * bz - az * by; this.y = az * bx - ax * bz; this.z = ax * by - ay * bx; return this; }
    addVectors(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) { this.x = a.x + b.x; this.y = a.y + b.y; this.z = a.z + b.z; return this; }
    subVectors(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this; }
    applyMatrix4(m: any) { return this; }
    project(camera: any) { return this; }
}

class InternalColor implements Color {
  r = 1; g = 1; b = 1;
  constructor() {}
  set(colorValue: any): InternalColor { return this; }
  clone(): InternalColor { const c = new InternalColor(); c.r = this.r; c.g = this.g; c.b = this.b; return c; }
}

class InternalObject3D implements Object3D {
  position: Vector3 = new InternalVector3(); rotation: Vector3 = new InternalVector3(); scale: Vector3 = new InternalVector3(1, 1, 1);
  add = vi.fn(); remove = vi.fn(); clone = vi.fn(() => new InternalObject3D()); traverse = vi.fn(); updateMatrixWorld = vi.fn();
  matrixWorld = { decompose: vi.fn() };
}

class InternalMaterial implements Material {
  clone = vi.fn(() => new InternalMaterial()); dispose = vi.fn(); needsUpdate = false; color: Color; emissive: Color; opacity = 1; transparent = false;
  uniforms: { [uniform: string]: { value: any } } = {}; // Default uniforms
  constructor() { this.color = new InternalColor(); this.emissive = new InternalColor(); }
}

class InternalBufferGeometry implements BufferGeometry {
  setAttribute = vi.fn(); setIndex = vi.fn(); computeVertexNormals = vi.fn(); dispose = vi.fn(); setFromPoints = vi.fn();
}

class InternalMeshBasicMaterial extends InternalMaterial { constructor() { super(); } }
class InternalLineBasicMaterial extends InternalMaterial { constructor() { super(); } }
class InternalShaderMaterial extends InternalMaterial {
  override uniforms: { [uniform: string]: { value: any } };
  constructor() {
    super();
    this.uniforms = {
      selectionStrength: { value: 0 }, time: { value: 0 }, opacity: { value: 0.7 },
      selectionColor: { value: new InternalColor() }, rimPower: { value: 3.0 }, rimIntensity: { value: 1.5 },
      pulseSpeed: { value: 2.0 }, pulseIntensity: { value: 0.3 },
    };
  }
}

class InternalMesh extends InternalObject3D implements Mesh {
  material: Material | Material[]; geometry: BufferGeometry;
  constructor() { super(); this.material = new InternalMeshBasicMaterial(); this.geometry = new InternalBufferGeometry(); this.scale = new InternalVector3(1, 1, 1); }
}

class InternalLine extends InternalObject3D {
    material: Material; geometry: BufferGeometry;
    constructor() { super(); this.material = new InternalLineBasicMaterial(); this.geometry = new InternalBufferGeometry(); }
}

class InternalSphereGeometry {}
class InternalQuadraticBezierCurve3 {
    v0: Vector3; v1: Vector3; v2: Vector3;
    constructor(v0 = new InternalVector3(), v1 = new InternalVector3(), v2 = new InternalVector3()) { this.v0 = v0; this.v1 = v1; this.v2 = v2; }
    getPoints = vi.fn(() => [this.v0, this.v1, this.v2]);
}

// --- END: Internal Mock Class Definitions ---

// Export the mocked objects
export const Vector3 = vi.fn((x, y, z) => new InternalVector3(x, y, z));
export const Color = vi.fn().mockImplementation(() => new InternalColor());
export const MathUtils = {
  lerp: vi.fn((a, b, t) => a + (b - a) * t),
  mapLinear: vi.fn((x, a1, a2, b1, b2) => b1 + ((x - a1) * (b2 - b1)) / (a2 - a1)),
  randFloatSpread: vi.fn((range) => (Math.random() - 0.5) * range),
};
export class Group extends InternalObject3D { children: any[] = []; constructor() { super(); } }
export class Scene extends InternalObject3D { background = { set: vi.fn() }; constructor() { super(); } }
export class WebGLRenderer {
  domElement = typeof document !== 'undefined' ? document.createElement("canvas") : null; // Handle SSR/Node env
  setSize = vi.fn(); setPixelRatio = vi.fn(); render = vi.fn(); setClearColor = vi.fn(); dispose = vi.fn();
}
export { InternalMeshBasicMaterial as MeshBasicMaterial };
export { InternalLineBasicMaterial as LineBasicMaterial };
export { InternalMesh as Mesh };
export { InternalLine as Line };
export { InternalObject3D as Object3D };
export { InternalSphereGeometry as SphereGeometry };
export { InternalShaderMaterial as ShaderMaterial };
export { InternalBufferGeometry as BufferGeometry };
export { InternalQuadraticBezierCurve3 as QuadraticBezierCurve3 };
export const DoubleSide = 2;

// Add any other exports needed from 'three'
export const NormalBlending = 1; // Example: Add other constants if needed
export const FrontSide = 0;      // Example
export const BackSide = 1;       // Example
/**
 * NOVAMIND Neural Architecture
 * Unified Three.js Mock Implementation with Quantum Precision
 * 
 * This implementation creates a single source of truth for Three.js mocking
 * to eliminate multiple import warnings and ensure neural-safe testing.
 */

import { vi } from 'vitest';

// Prevent Three.js from loading multiple times with neurosurgical precision
vi.mock('three', () => {
  // Create a singleton handler to ensure we only have one Three.js instance
  const singletonHandler = {
    Vector3: class Vector3 {
      x: number = 0;
      y: number = 0;
      z: number = 0;
      
      constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
      }
      
      set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      }
      
      clone() {
        return new Vector3(this.x, this.y, this.z);
      }
      
      copy(v: Vector3) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
      }
      
      normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (length > 0) {
          this.x /= length;
          this.y /= length;
          this.z /= length;
        }
        return this;
      }
    },
    
    Color: class Color {
      r: number = 1;
      g: number = 1;
      b: number = 1;
      
      constructor(r?: number | string, g?: number, b?: number) {
        if (typeof r === 'string') {
          // Basic color parsing for tests
          if (r === '#ff0000') {
            this.r = 1; this.g = 0; this.b = 0;
          } else if (r === '#00ff00') {
            this.r = 0; this.g = 1; this.b = 0;
          } else if (r === '#0000ff') {
            this.r = 0; this.g = 0; this.b = 1;
          }
        } else if (r !== undefined) {
          this.r = r;
          this.g = g !== undefined ? g : r;
          this.b = b !== undefined ? b : r;
        }
      }
      
      set(value: any) {
        // Mock implementation
        return this;
      }
    },
    
    MathUtils: {
      mapLinear: (x: number, a1: number, a2: number, b1: number, b2: number) => {
        return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
      },
      clamp: (value: number, min: number, max: number) => {
        return Math.max(min, Math.min(max, value));
      },
      degToRad: (degrees: number) => degrees * (Math.PI / 180),
      radToDeg: (radians: number) => radians * (180 / Math.PI),
      lerp: (x: number, y: number, t: number) => (1 - t) * x + t * y,
      smoothstep: (x: number, min: number, max: number) => {
        if (x <= min) return 0;
        if (x >= max) return 1;
        const t = Math.max(0, Math.min(1, (x - min) / (max - min)));
        return t * t * (3 - 2 * t);
      }
    },
    
    Group: class Group {
      position: { x: number; y: number; z: number; set: Function };
      rotation: { x: number; y: number; z: number; set: Function };
      scale: { x: number; y: number; z: number; set: Function };
      children: any[];
      add: Function;
      remove: Function;
      
      constructor() {
        this.position = { x: 0, y: 0, z: 0, set: vi.fn() };
        this.rotation = { x: 0, y: 0, z: 0, set: vi.fn() };
        this.scale = { x: 1, y: 1, z: 1, set: vi.fn() };
        this.children = [];
        this.add = vi.fn((obj) => {
          this.children.push(obj);
          return this;
        });
        this.remove = vi.fn((obj) => {
          const index = this.children.indexOf(obj);
          if (index !== -1) {
            this.children.splice(index, 1);
          }
          return this;
        });
      }
    },
    
    Scene: class Scene {
      background: { set: Function };
      children: any[];
      add: Function;
      remove: Function;
      
      constructor() {
        this.children = [];
        this.background = { set: vi.fn() };
        this.add = vi.fn((obj) => {
          this.children.push(obj);
          return this;
        });
        this.remove = vi.fn((obj) => {
          const index = this.children.indexOf(obj);
          if (index !== -1) {
            this.children.splice(index, 1);
          }
          return this;
        });
      }
    },
    
    PerspectiveCamera: class PerspectiveCamera {
      fov: number;
      aspect: number;
      near: number;
      far: number;
      position: { x: number; y: number; z: number; set: Function };
      lookAt: Function;
      updateProjectionMatrix: Function;
      
      constructor(fov = 75, aspect = 1, near = 0.1, far = 1000) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = { x: 0, y: 0, z: 0, set: vi.fn() };
        this.lookAt = vi.fn();
        this.updateProjectionMatrix = vi.fn();
      }
    },
    
    WebGLRenderer: class WebGLRenderer {
      domElement: HTMLCanvasElement;
      shadowMap: { enabled: boolean };
      setSize: Function;
      setPixelRatio: Function;
      render: Function;
      setClearColor: Function;
      
      constructor() {
        this.domElement = document.createElement('canvas');
        this.shadowMap = { enabled: false };
        this.setSize = vi.fn();
        this.setPixelRatio = vi.fn();
        this.render = vi.fn();
        this.setClearColor = vi.fn();
      }
    },
    
    ShaderMaterial: class ShaderMaterial {
      uniforms: any;
      vertexShader: string;
      fragmentShader: string;
      transparent: boolean;
      
      constructor(params?: any) {
        this.uniforms = params?.uniforms || {};
        this.vertexShader = params?.vertexShader || '';
        this.fragmentShader = params?.fragmentShader || '';
        this.transparent = params?.transparent || false;
      }
    },
    
    Mesh: class Mesh {
      geometry: any;
      material: any;
      position: { x: number; y: number; z: number; set: Function };
      rotation: { x: number; y: number; z: number; set: Function };
      scale: { x: number; y: number; z: number; set: Function };
      
      constructor(geometry?: any, material?: any) {
        this.geometry = geometry;
        this.material = material;
        this.position = { x: 0, y: 0, z: 0, set: vi.fn() };
        this.rotation = { x: 0, y: 0, z: 0, set: vi.fn() };
        this.scale = { x: 1, y: 1, z: 1, set: vi.fn() };
      }
    },
    
    Box3: class Box3 {
      min: { x: number; y: number; z: number };
      max: { x: number; y: number; z: number };
      
      constructor(min?: any, max?: any) {
        this.min = min || { x: 0, y: 0, z: 0 };
        this.max = max || { x: 0, y: 0, z: 0 };
      }
      
      setFromObject(obj: any) {
        return this;
      }
      
      getCenter() {
        return { x: 0, y: 0, z: 0 };
      }
      
      getSize() {
        return { x: 1, y: 1, z: 1 };
      }
    },
    
    Object3D: class Object3D {
      position: { x: number; y: number; z: number; set: Function };
      rotation: { x: number; y: number; z: number; set: Function };
      scale: { x: number; y: number; z: number; set: Function };
      children: any[];
      
      constructor() {
        this.position = { x: 0, y: 0, z: 0, set: vi.fn() };
        this.rotation = { x: 0, y: 0, z: 0, set: vi.fn() };
        this.scale = { x: 1, y: 1, z: 1, set: vi.fn() };
        this.children = [];
      }
      
      add(child: any) {
        this.children.push(child);
        return this;
      }
      
      remove(child: any) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
          this.children.splice(index, 1);
        }
        return this;
      }
    }
  };
  
  return singletonHandler;
});

// Ensure Fiber and Drei use our mocked Three.js with neurosurgical precision
vi.mock('@react-three/fiber', async () => {
  const React = await import('react');
  const threeMock = await vi.importActual<any>('three');
  
  return {
    Canvas: ({ children, ...props }: any) => {
      return React.createElement('div', {
        'data-testid': 'neural-canvas',
        style: { width: '100%', height: '100%' },
        ...props
      }, children);
    },
    useThree: vi.fn().mockReturnValue({
      camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
      gl: { setPixelRatio: vi.fn(), setSize: vi.fn() },
      scene: { background: { set: vi.fn() } },
      set: vi.fn()
    }),
    useFrame: vi.fn((callback: Function) => {
      if (callback && typeof callback === 'function') {
        callback({ camera: { position: { x: 0, y: 0, z: 10 } } }, 0);
      }
      return undefined;
    }),
    extend: vi.fn()
  };
});

vi.mock('@react-three/drei', async () => {
  const React = await import('react');
  const threeMock = await vi.importActual<any>('three');
  
  return {
    Sphere: (props: any) => {
      return React.createElement('div', {
        'data-testid': 'neural-node',
        'data-position': Array.isArray(props.position) ? props.position.join(',') : 'none',
        'data-scale': props.scale,
        'data-color': props.color
      }, props.children || 'Node');
    },
    Line: (props: any) => {
      return React.createElement('div', {
        'data-testid': 'neural-line',
        'data-color': props.color
      }, Array.isArray(props.points) ? `${props.points.length} points` : 'No points');
    },
    Text: (props: any) => {
      return React.createElement('div', {
        'data-testid': 'neural-text',
        'data-color': props.color
      }, props.children);
    },
    Html: (props: any) => {
      return React.createElement('div', {
        'data-testid': 'neural-html'
      }, props.children);
    },
    OrbitControls: vi.fn().mockImplementation(() => ({
      enableDamping: true,
      enableZoom: true
    })),
    useTexture: vi.fn().mockReturnValue({ map: {} }),
    shaderMaterial: vi.fn().mockReturnValue({})
  };
});

// Export specific classes for direct use
export const { Vector3, Color, MathUtils, Group, Scene, Mesh } = await vi.importActual<any>('three');

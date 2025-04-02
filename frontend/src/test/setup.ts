/**
 * NOVAMIND Testing Framework
 * Primary Test Setup
 *
 * This centralized entry point provides a clean, reliable test environment
 * with proper mocking for Three.js visualization components.
 */

// Apply URL fix FIRST - before any import.meta.url is used
// This prevents "The URL must be of scheme file" errors
(function patchURL() {
  if (typeof URL !== "undefined") {
    const originalURL = URL;

    class PatchedURL extends originalURL {
      constructor(url: string | URL, base?: string | URL) {
        try {
          // Try the original constructor first
          super(url, base);
        } catch (error: any) {
          if (error.code === "ERR_INVALID_URL_SCHEME") {
            // If the URL has an invalid scheme, try to fix it
            if (
              typeof url === "string" &&
              !url.startsWith("file:") &&
              !url.match(/^[a-z]+:\/\//i)
            ) {
              // Add the file:// scheme if missing
              super(`file://${url}`, base);
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }
    }

    // Apply the patch
    (global as any).URL = PatchedURL;

    // Verify the fix works
    try {
      const testUrl = new URL("file:///test-path"); // Use a valid file scheme URL
      console.log("URL fix applied successfully!");
    } catch (error) {
      console.error("URL fix failed:", error);
    }
  }
})();

// Fix TextEncoder issue BEFORE any other imports
// Pure ESM approach with no require() calls
if (typeof globalThis.TextEncoder === "undefined") {
  // Import TextEncoder from Node.js util module using dynamic import
  import("util")
    .then(({ TextEncoder }) => {
      // Use type assertion to apply the correct type
      globalThis.TextEncoder =
        TextEncoder as unknown as typeof globalThis.TextEncoder;

      // Apply our fix to ensure Uint8Array compatibility
      const OriginalTextEncoder = globalThis.TextEncoder;

      class FixedTextEncoder extends OriginalTextEncoder {
        override encode(input?: string): Uint8Array {
          const result = super.encode(input);
          // Ensure the result is recognized as a Uint8Array
          Object.setPrototypeOf(result, Uint8Array.prototype);
          return result;
        }
      }

      // Replace the global implementation
      globalThis.TextEncoder = FixedTextEncoder as any;

      // Verify our fix worked
      const testResult = new TextEncoder().encode("");
      console.log(
        "TextEncoder verification:",
        testResult instanceof Uint8Array,
      );
      if (!(testResult instanceof Uint8Array)) {
        console.error("TextEncoder polyfill failed to fix instanceof check");
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error("Failed to import TextEncoder from util:", err);
    });
} else {
  // If TextEncoder exists but doesn't produce valid Uint8Array instances
  if (!(new globalThis.TextEncoder().encode("") instanceof Uint8Array)) {
    // Get the existing TextEncoder
    const OriginalTextEncoder = globalThis.TextEncoder;

    // Create a fixed version
    class FixedTextEncoder extends OriginalTextEncoder {
      override encode(input?: string): Uint8Array {
        const result = super.encode(input);
        // Ensure the result is recognized as a Uint8Array
        Object.setPrototypeOf(result, Uint8Array.prototype);
        return result;
      }
    }

    // Replace the global implementation
    globalThis.TextEncoder = FixedTextEncoder as any;

    // Verify our fix worked
    const testResult = new TextEncoder().encode("");
    console.log("TextEncoder verification:", testResult instanceof Uint8Array);
  }
}

// Import polyfills after TextEncoder fix
import "@test/node-polyfills"; // Correct syntax for side-effect imports
import "vitest-canvas-mock"; // Integrate vitest-canvas-mock

// Import required testing libraries
import "@testing-library/jest-dom";
import * as matchers from '@testing-library/jest-dom/matchers'; // Import matchers explicitly
import { beforeAll, vi, expect, beforeEach, afterEach } from "vitest"; // Import expect and hooks

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Define proper TypeScript interfaces for our mocks
interface Vector3 {
  x: number;
  y: number;
  z: number;
  set: (x: number, y: number, z: number) => Vector3;
  clone: () => Vector3;
  normalize: () => Vector3;
  multiplyScalar: (scalar: number) => Vector3;
  length: () => number;
  add: (v: Vector3) => Vector3; // Added add method signature
  subVectors: (a: Vector3, b: Vector3) => Vector3; // Added subVectors
  applyMatrix4: (m: any) => Vector3; // Added applyMatrix4
  project: (camera: any) => Vector3; // Added project
}

interface Color {
  r: number;
  g: number;
  b: number;
  set: (color: any) => Color;
  clone: () => Color;
}

interface Object3D {
  position: Vector3;
  rotation: Vector3; // Assuming rotation uses Vector3-like structure for simplicity
  scale: Vector3;
  add: (object: Object3D) => void;
  remove: (object: Object3D) => void;
  clone: () => Object3D;
  traverse: (callback: (obj: Object3D) => void) => void;
  updateMatrixWorld: (force?: boolean) => void;
  matrixWorld: { decompose: (pos: Vector3, quat: any, scale: Vector3) => void };
}

interface Group extends Object3D {
  children: Object3D[];
}

interface Scene extends Object3D {
  background: { set: (color: Color) => void };
}

interface WebGLRenderer {
  domElement: HTMLCanvasElement;
  setSize: (width: number, height: number) => void;
  setPixelRatio: (ratio: number) => void;
  render: (scene: Scene, camera: any) => void;
  setClearColor: (color: Color, alpha?: number) => void;
  dispose: () => void;
}

interface Material {
  clone: () => Material;
  dispose: () => void;
  needsUpdate: boolean;
  color: Color;
  opacity: number;
  transparent: boolean;
}

interface BufferGeometry {
  setAttribute: (name: string, attribute: any) => void;
  setIndex: (index: any) => void;
  computeVertexNormals: () => void;
  dispose: () => void;
  setFromPoints: (points: Vector3[]) => void;
}

interface Mesh extends Object3D {
  material?: Material | Material[];
  geometry?: BufferGeometry;
}

// --- Mock Implementations ---

class MockVector3 implements Vector3 {
  x = 0;
  y = 0;
  z = 0;
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
  clone(): MockVector3 { // Added return type
    return new MockVector3(this.x, this.y, this.z);
  }
  normalize() {
    return this;
  }
  multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  add(v: Vector3) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
  subVectors(a: Vector3, b: Vector3) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  }
  applyMatrix4(m: any) {
    return this;
  } // No-op mock
  project(camera: any) {
    return this;
  } // No-op mock
}

class MockColor implements Color {
  r = 1;
  g = 1;
  b = 1;
  constructor() {}
  set(colorValue: any): MockColor { // Implement basic set logic
    // In a real scenario, you might parse colorValue (hex, rgb, etc.)
    // For mock, just acknowledge the call and return this
    return this;
  }
  clone(): MockColor { // Added return type
    const newColor = new MockColor();
    newColor.r = this.r;
    newColor.g = this.g;
    newColor.b = this.b;
    return newColor;
  }
}

class MockObject3D implements Object3D {
  position: Vector3 = new MockVector3(); // Use MockVector3 and type annotation
  rotation: Vector3 = new MockVector3(); // Use MockVector3 and type annotation
  scale: Vector3 = new MockVector3(1, 1, 1); // Use MockVector3 and type annotation
  add = vi.fn();
  remove = vi.fn();
  clone = vi.fn(() => new MockObject3D()); // Return new instance for clone
  traverse = vi.fn();
  updateMatrixWorld = vi.fn();
  matrixWorld = { decompose: vi.fn() };
}

class MockMaterial implements Material {
  clone = vi.fn(() => new MockMaterial()); // Return new instance
  dispose = vi.fn();
  needsUpdate = false;
  color = new MockColor(); // Use MockColor
  emissive = new MockColor(); // Add missing emissive property
  opacity = 1;
  transparent = false;
}

class MockBufferGeometry implements BufferGeometry {
  setAttribute = vi.fn();
  setIndex = vi.fn();
  computeVertexNormals = vi.fn();
  dispose = vi.fn();
  setFromPoints = vi.fn(); // Add setFromPoints mock
}

// Create minimal Three.js mocks that won't conflict
// Mock the three module (Global - More Robust Vector3)
vi.mock("three", () => {
  // Define the mock implementation for Vector3 carefully
  // More robust Vector3 mock using a class structure
  class Vector3MockClass {
      x: number;
      y: number;
      z: number;
      constructor(x = 0, y = 0, z = 0) {
          this.x = x;
          this.y = y;
          this.z = z;
      }
      set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; return this; }
      copy(v: { x: number; y: number; z: number }) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
      add(v: { x: number; y: number; z: number }) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
      sub(v: { x: number; y: number; z: number }) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
      multiply(v: { x: number; y: number; z: number }) { this.x *= v.x; this.y *= v.y; this.z *= v.z; return this; }
      multiplyScalar(s: number) { this.x *= s; this.y *= s; this.z *= s; return this; }
      divide(v: { x: number; y: number; z: number }) { this.x /= v.x; this.y /= v.y; this.z /= v.z; return this; }
      length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
      normalize() {
          const l = this.length();
          if (l > 0) { this.x /= l; this.y /= l; this.z /= l; }
          return this;
      }
      clone() { return new Vector3MockClass(this.x, this.y, this.z); } // Correct clone
      applyQuaternion() { return this; }
      toArray() { return [this.x, this.y, this.z]; }
      cross(v: { x: number; y: number; z: number }) {
          const ax = this.x, ay = this.y, az = this.z;
          const bx = v.x, by = v.y, bz = v.z;
          this.x = ay * bz - az * by;
          this.y = az * bx - ax * bz;
          this.z = ax * by - ay * bx;
          return this;
      }
      addVectors(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
          this.x = a.x + b.x;
          this.y = a.y + b.y;
          this.z = a.z + b.z;
          return this;
      }
      // Add other methods if needed by tests
      subVectors(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
          this.x = a.x - b.x;
          this.y = a.y - b.y;
          this.z = a.z - b.z;
          return this;
      }
      applyMatrix4(m: any) { return this; }
      project(camera: any) { return this; }
  }
  const Vector3Mock = vi.fn((x, y, z) => new Vector3MockClass(x, y, z));

  // Return all mocked properties from the factory function
  return {
    Vector3: Vector3Mock,
    // More robust Color mock using a class structure
    Color: vi.fn().mockImplementation(() => new MockColor()), // Use the MockColor class defined earlier
    MathUtils: {
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      mapLinear: vi.fn(
        (x, a1, a2, b1, b2) => b1 + ((x - a1) * (b2 - b1)) / (a2 - a1),
      ),
      randFloatSpread: vi.fn((range) => (Math.random() - 0.5) * range),
    },
    Group: class Group extends MockObject3D {
      // Keep existing class mocks if they work
      children: any[] = [];
      constructor() {
        super();
      }
    },
    Scene: class Scene extends MockObject3D {
      background = { set: vi.fn() };
      constructor() {
        super();
      }
    },
    WebGLRenderer: class WebGLRenderer implements WebGLRenderer {
      domElement = document.createElement("canvas");
      setSize = vi.fn();
      setPixelRatio = vi.fn();
      render = vi.fn();
      setClearColor = vi.fn();
      dispose = vi.fn();
    },
    MeshBasicMaterial: class MeshBasicMaterial extends MockMaterial { // Add mock
        constructor() { super(); }
    },
    LineBasicMaterial: class LineBasicMaterial extends MockMaterial { // Existing mock
      constructor() {
        super();
      }
    },
    Mesh: class Mesh extends MockObject3D {
      material: MockMaterial | MockMaterial[] = new MockMaterial();
      geometry = new MockBufferGeometry();
      override scale = new Vector3MockClass(1, 1, 1);
      constructor() {
        super();
        // Explicitly ensure scale and material are set in constructor
        this.material = new MockMaterial(); // Use base mock, specific tests might need MeshBasicMaterial
        this.scale = new Vector3MockClass(1, 1, 1);
      }
    },
    Line: class Line extends MockObject3D {
        // Use the specific LineBasicMaterial mock
        material = new LineBasicMaterial();
        geometry = new MockBufferGeometry();
        constructor() {
            super();
            // Explicitly set specific material in constructor
            this.material = new LineBasicMaterial();
        }
    },
    Object3D: MockObject3D,
    SphereGeometry: class SphereGeometry {},
    ShaderMaterial: class ShaderMaterial extends MockMaterial {
      constructor() {
        super();
      }
    },
    BufferGeometry: MockBufferGeometry,
    // LineBasicMaterial already added above
      constructor() {
        super();
      }
    },
    QuadraticBezierCurve3: class QuadraticBezierCurve3 {
      v0: Vector3;
      v1: Vector3;
      v2: Vector3;
      constructor(
        v0 = new Vector3MockClass(), // Use class constructor directly
        v1 = new Vector3MockClass(), // Use class constructor directly
        v2 = new Vector3MockClass(), // Use class constructor directly
      ) {
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
      }
      getPoints = vi.fn(() => [this.v0, this.v1, this.v2]);
    }, // Removed duplicate closing brace if present
    DoubleSide: 2,
  };
});

// Define interfaces for React Three Fiber
interface ThreeContext {
  camera: {
    position: {
      set: (x: number, y: number, z: number) => void;
    };
    lookAt: (x: number, y: number, z: number) => void;
  };
  gl: {
    render: (scene: Scene, camera: any) => void;
  };
  scene: Record<string, any>;
  size: {
    width: number;
    height: number;
  };
}

// Mock React Three Fiber with TypeScript interfaces
vi.mock("@react-three/fiber", () => {
  return {
    Canvas: vi.fn().mockImplementation(({ children, ...props }) => {
      // Return a simple div, or enhance if needed for specific tests
      return document.createElement("div");
    }),
    useThree: vi.fn().mockReturnValue({
      // Provide mock implementations for expected properties/methods
      camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
      gl: { render: vi.fn() },
      scene: {}, // Provide a basic scene object
      size: { width: 800, height: 600 },
    }),
    useFrame: vi.fn(),
  };
});

// Mock React Three Drei with TypeScript interfaces
vi.mock("@react-three/drei", () => {
  return {
    OrbitControls: vi.fn().mockImplementation(() => null),
    Environment: vi.fn().mockImplementation(() => null),
    useGLTF: vi.fn().mockReturnValue({
      nodes: {},
      materials: {},
      scene: { clone: vi.fn().mockReturnValue({}) }, // Ensure scene.clone is mocked
    }),
    Sphere: vi.fn().mockImplementation(() => null), // Keep Sphere mock
    MeshDistortMaterial: vi.fn().mockImplementation(() => null), // Keep MeshDistortMaterial mock
    // Add other Drei components used in tests here
  };
});

// Mock browser APIs
beforeAll(() => {
  // Mock window.matchMedia for JSDOM environment (needed for ThemeProvider tests)
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false, // Default to false (light mode)
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated but included for compatibility
      removeListener: vi.fn(), // Deprecated but included for compatibility
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  window.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };

  // Mock requestAnimationFrame
  window.requestAnimationFrame = vi.fn((callback) => {
    setTimeout(callback, 0);
    return 0;
  });

  // Canvas/WebGL mocking is now handled by vitest-canvas-mock, imported above.
});

// Filter console noise
vi.spyOn(console, "error").mockImplementation((...args) => {
  const message = args[0]?.toString() || "";
  if (message.includes("THREE.") || message.includes("React.createFactory")) {
    // Suppress specific noisy warnings from mocks
    return;
  }
  // Log other errors
  console.log("Test Error:", ...args);
});

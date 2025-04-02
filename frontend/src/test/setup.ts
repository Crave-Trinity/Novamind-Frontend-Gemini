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
import { beforeAll, vi } from "vitest";

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
  clone() {
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
  set() {
    return this;
  } // Basic mock for set, returns this
  clone() {
    return new MockColor();
  } // Return a new instance
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
  const Vector3Mock = vi.fn().mockImplementation((x = 0, y = 0, z = 0) => {
    const self: any = { x, y, z };
    self.set = vi.fn().mockImplementation(function (newX, newY, newZ) {
      self.x = newX;
      self.y = newY;
      self.z = newZ;
      return self;
    });
    self.copy = vi.fn().mockImplementation(function (v) {
      self.x = v.x;
      self.y = v.y;
      self.z = v.z;
      return self;
    });
    self.add = vi.fn().mockImplementation(function (v) {
      self.x += v.x;
      self.y += v.y;
      self.z += v.z;
      return self;
    });
    self.sub = vi.fn().mockImplementation(function (v) {
      self.x -= v.x;
      self.y -= v.y;
      self.z -= v.z;
      return self;
    });
    self.multiply = vi.fn().mockImplementation(function (v) {
      self.x *= v.x;
      self.y *= v.y;
      self.z *= v.z;
      return self;
    });
    self.multiplyScalar = vi.fn().mockImplementation(function (s) {
      self.x *= s;
      self.y *= s;
      self.z *= s;
      return self;
    }); // Added multiplyScalar
    self.divide = vi.fn().mockImplementation(function (v) {
      self.x /= v.x;
      self.y /= v.y;
      self.z /= v.z;
      return self;
    });
    self.length = vi
      .fn()
      .mockImplementation(() =>
        Math.sqrt(self.x * self.x + self.y * self.y + self.z * self.z),
      );
    self.normalize = vi.fn().mockImplementation(function () {
      const l = self.length();
      if (l > 0) {
        self.x /= l;
        self.y /= l;
        self.z /= l;
      }
      return self;
    });
    self.clone = vi
      .fn()
      .mockImplementation(() => Vector3Mock(self.x, self.y, self.z));
    self.applyQuaternion = vi.fn().mockReturnThis();
    self.toArray = vi.fn().mockImplementation(() => [self.x, self.y, self.z]);
    self.cross = vi.fn().mockImplementation(function (v) {
      const ax = self.x,
        ay = self.y,
        az = self.z;
      const bx = v.x,
        by = v.y,
        bz = v.z;
      self.x = ay * bz - az * by;
      self.y = az * bx - ax * bz;
      self.z = ax * by - ay * bx;
      return self;
    });
    self.addVectors = vi.fn().mockImplementation(function (a, b) {
      self.x = a.x + b.x;
      self.y = a.y + b.y;
      self.z = a.z + b.z;
      return self;
    }); // Added addVectors
    return self;
  });

  // Return all mocked properties from the factory function
  return {
    Vector3: Vector3Mock,
    Color: MockColor, // Use the existing MockColor class
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
    Mesh: class Mesh extends MockObject3D {
      material = new MockMaterial();
      geometry = new MockBufferGeometry();
      constructor() {
        super();
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
    QuadraticBezierCurve3: class QuadraticBezierCurve3 {
      v0: Vector3;
      v1: Vector3;
      v2: Vector3;
      constructor(
        v0 = new Vector3Mock(),
        v1 = new Vector3Mock(),
        v2 = new Vector3Mock(),
      ) {
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
      }
      getPoints = vi.fn(() => [this.v0, this.v1, this.v2]);
    },
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

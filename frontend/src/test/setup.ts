/**
 * NOVAMIND Testing Framework
 * Primary Test Setup
 *
 * This centralized entry point provides a clean, reliable test environment
 * with proper mocking for Three.js visualization components.
 */

import React from 'react'; // Import React for creating elements
// Import required testing libraries FIRST
import "@testing-library/jest-dom";
import * as matchers from '@testing-library/jest-dom/matchers'; // Import matchers explicitly
import { beforeAll, vi, expect, beforeEach, afterEach } from "vitest"; // Import expect and hooks

// Mock global matchMedia SYNCHRONOUSLY before other setup
// This ensures it's available immediately when tests start importing modules
// Define the mock structure for MediaQueryList
const mockMediaQueryList = {
  matches: false,
  media: '',
  onchange: null,
  addListener: vi.fn(), // Deprecated
  removeListener: vi.fn(), // Deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

// Apply the mock using the defined structure
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => {
    // Return a fresh copy for each call, ensuring 'media' is set
    console.log(`[setup.ts] Mocked window.matchMedia called with query: ${query}`);
    return { ...mockMediaQueryList, media: query || '' };
  }),
});
console.log("[setup.ts] Global matchMedia mock applied."); // Log application

// Apply URL fix - This modifies global URL object
(function patchURL() {
  if (typeof URL !== "undefined") {
    const originalURL = URL;

    class PatchedURL extends originalURL {
      constructor(url: string | URL, base?: string | URL) {
        try {
          super(url, base);
        } catch (error: any) {
          if (error.code === "ERR_INVALID_URL_SCHEME") {
            if (
              typeof url === "string" &&
              !url.startsWith("file:") &&
              !url.match(/^[a-z]+:\/\//i)
            ) {
              super(`file://${url}`, base);
            } else { throw error; }
          } else { throw error; }
        }
      }
    }
    (global as any).URL = PatchedURL;
    try {
      new URL("file:///test-path");
      console.log("[setup.ts] URL fix applied successfully!");
    } catch (error) {
      console.error("[setup.ts] URL fix failed:", error);
    }
  }
})();


// TextEncoder fix - Kept separate for clarity, potentially move to textencoder-fix.ts later
if (typeof globalThis.TextEncoder === "undefined") {
  import("util")
    .then(({ TextEncoder }) => {
      globalThis.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder;
      const OriginalTextEncoder = globalThis.TextEncoder;
      class FixedTextEncoder extends OriginalTextEncoder {
        override encode(input?: string): Uint8Array {
          const result = super.encode(input);
          Object.setPrototypeOf(result, Uint8Array.prototype);
          return result;
        }
      }
      globalThis.TextEncoder = FixedTextEncoder as any;
      const testResult = new TextEncoder().encode("");
      console.log("[setup.ts] TextEncoder polyfill verification:", testResult instanceof Uint8Array);
      if (!(testResult instanceof Uint8Array)) {
         console.error("[setup.ts] TextEncoder polyfill failed instanceof check");
      }
    })
    .catch((err) => {
      console.error("[setup.ts] Failed to import TextEncoder from util:", err);
    });
} else {
  if (!(new globalThis.TextEncoder().encode("") instanceof Uint8Array)) {
    const OriginalTextEncoder = globalThis.TextEncoder;
    class FixedTextEncoder extends OriginalTextEncoder {
      override encode(input?: string): Uint8Array {
        const result = super.encode(input);
        Object.setPrototypeOf(result, Uint8Array.prototype);
        return result;
      }
    }
    globalThis.TextEncoder = FixedTextEncoder as any;
    console.log("[setup.ts] Existing TextEncoder patched for instanceof check.");
  }
}

// Import other polyfills AFTER core mocks/fixes
import "@test/node-polyfills";
import "vitest-canvas-mock";


// Define interfaces (can be moved to a types file if preferred)
interface Vector3Interface { x: number; y: number; z: number; set: (x: number, y: number, z: number) => Vector3Interface; clone: () => Vector3Interface; normalize: () => Vector3Interface; multiplyScalar: (scalar: number) => Vector3Interface; length: () => number; add: (v: Vector3Interface) => Vector3Interface; subVectors: (a: Vector3Interface, b: Vector3Interface) => Vector3Interface; applyMatrix4: (m: any) => Vector3Interface; project: (camera: any) => Vector3Interface; copy: (v: Vector3Interface) => Vector3Interface; }
interface ColorInterface { r: number; g: number; b: number; set: (color: any) => ColorInterface; clone: () => ColorInterface; setHSL: (h: number, s: number, l: number) => ColorInterface; getStyle: () => string; }
interface Object3DInterface { position: Vector3Interface; rotation: Vector3Interface; scale: Vector3Interface; add: (object: Object3DInterface) => void; remove: (object: Object3DInterface) => void; clone: () => Object3DInterface; traverse: (callback: (obj: Object3DInterface) => void) => void; updateMatrixWorld: (force?: boolean) => void; matrixWorld: { decompose: (pos: Vector3Interface, quat: any, scale: Vector3Interface) => void }; }
interface GroupInterface extends Object3DInterface { children: Object3DInterface[]; }
interface SceneInterface extends Object3DInterface { background: { set: (color: ColorInterface) => void }; }
interface WebGLRendererInterface { domElement: HTMLCanvasElement; setSize: (width: number, height: number) => void; setPixelRatio: (ratio: number) => void; render: (scene: SceneInterface, camera: any) => void; setClearColor: (color: ColorInterface, alpha?: number) => void; dispose: () => void; }
interface MaterialInterface { clone: () => MaterialInterface; dispose: () => void; needsUpdate: boolean; color: ColorInterface; emissive?: ColorInterface; opacity: number; transparent: boolean; }
interface BufferGeometryInterface { setAttribute: (name: string, attribute: any) => void; setIndex: (index: any) => void; computeVertexNormals: () => void; dispose: () => void; setFromPoints: (points: Vector3Interface[]) => BufferGeometryInterface; clone: () => BufferGeometryInterface; }
interface MeshInterface extends Object3DInterface { material?: MaterialInterface | MaterialInterface[]; geometry?: BufferGeometryInterface; }
interface ThreeContextInterface { camera: { position: { set: (x: number, y: number, z: number) => void; }; lookAt: (x: number, y: number, z: number) => void; }; gl: { render: (scene: SceneInterface, camera: any) => void; }; scene: Record<string, any>; size: { width: number; height: number; }; }


// Mock the 'three' library
vi.mock('three', async (importOriginal) => {
  const originalThree = await importOriginal<typeof import('three')>();

  // --- Vector3 Mock --- Class approach with refined clone
  class MockVector3 implements Vector3Interface {
    x = 0;
    y = 0;
    z = 0;
    set = vi.fn().mockReturnThis();
    clone = vi.fn().mockImplementation(function(this: MockVector3) {
        const newVec = new MockVector3(); // Create a new instance of the mock class
        newVec.x = this.x;
        newVec.y = this.y;
        newVec.z = this.z;
        // The new instance will inherently have the mocked 'add' method
        return newVec;
    });
    normalize = vi.fn().mockReturnThis();
    multiplyScalar = vi.fn().mockReturnThis();
    length = vi.fn().mockReturnValue(0);
    add = vi.fn().mockReturnThis(); // Ensure add returns 'this' for chaining
    subVectors = vi.fn().mockReturnThis();
    applyMatrix4 = vi.fn().mockReturnThis();
    project = vi.fn().mockReturnThis();
    copy = vi.fn().mockImplementation(function(this: MockVector3, source: MockVector3) {
        this.x = source.x;
        this.y = source.y;
        this.z = source.z;
        return this;
    });
  }

  // --- Color Mock ---
  class MockColor implements ColorInterface {
      r = 0; g = 0; b = 0;
      set = vi.fn().mockReturnThis();
      setHSL = vi.fn().mockReturnThis();
      clone = vi.fn().mockImplementation(function(this: MockColor) {
          const newColor = new MockColor();
          newColor.r = this.r;
          newColor.g = this.g;
          newColor.b = this.b;
          return newColor;
      });
      getStyle = vi.fn().mockReturnValue('rgb(0,0,0)');
  }

  const mockMaterial = {
    clone: vi.fn().mockImplementation(() => ({ ...mockMaterial })),
    dispose: vi.fn(),
    needsUpdate: false,
    color: new MockColor(),
    emissive: new MockColor(),
    opacity: 1,
    transparent: false,
  };

  // --- BufferGeometry Mock ---
  class MockBufferGeometry implements BufferGeometryInterface {
      setAttribute = vi.fn();
      setIndex = vi.fn();
      computeVertexNormals = vi.fn();
      dispose = vi.fn();
      setFromPoints = vi.fn().mockReturnThis();
      clone = vi.fn().mockImplementation(() => new MockBufferGeometry());
  }

  // Base instance
  const mockObject3D = {
    position: new MockVector3(),
    rotation: new MockVector3(),
    scale: new MockVector3(),
    add: vi.fn(),
    remove: vi.fn(),
    clone: vi.fn().mockImplementation(() => ({ ...mockObject3D })),
    traverse: vi.fn(),
    updateMatrixWorld: vi.fn(),
    matrixWorld: {
      decompose: vi.fn((pos, quat, scale) => {
        pos.copy?.(mockObject3D.position);
        scale.copy?.(mockObject3D.scale);
      }),
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  const mockMesh = {
    ...mockObject3D,
    material: { ...mockMaterial },
    geometry: new MockBufferGeometry(),
  };

  const mockLine = {
     ...mockObject3D,
     material: { ...mockMaterial },
     geometry: new MockBufferGeometry(),
  };

  const mockScene = {
    ...mockObject3D,
    background: { set: vi.fn() },
  };

  return {
    ...originalThree, // Keep original exports not explicitly mocked
    Vector3: MockVector3,
    Color: MockColor,
    MeshBasicMaterial: vi.fn().mockImplementation(() => ({ ...mockMaterial })),
    LineBasicMaterial: vi.fn().mockImplementation(() => ({ ...mockMaterial })),
    MeshStandardMaterial: vi.fn().mockImplementation(() => ({ ...mockMaterial })),
    BufferGeometry: MockBufferGeometry,
    Object3D: vi.fn().mockImplementation(() => ({ ...mockObject3D })),
    Mesh: vi.fn().mockImplementation(() => ({ ...mockMesh })),
    Line: vi.fn().mockImplementation(() => ({ ...mockLine })),
    Group: vi.fn().mockImplementation(() => ({ ...mockObject3D, children: [] })),
    Scene: vi.fn().mockImplementation(() => ({ ...mockScene })),
    Raycaster: vi.fn().mockImplementation(() => ({
        setFromCamera: vi.fn(),
        intersectObjects: vi.fn().mockReturnValue([]),
    })),
    Matrix4: vi.fn().mockImplementation(() => ({})),
    Quaternion: vi.fn().mockImplementation(() => ({})),
    Euler: vi.fn().mockImplementation(() => ({})),
    Layers: vi.fn().mockImplementation(() => ({})),
    EventDispatcher: vi.fn().mockImplementation(() => ({
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
  };
});


// Mock React Three Fiber hooks - Reverting to mocking extend
vi.mock("@react-three/fiber", async (importOriginal) => {
  // const actual = await importOriginal<typeof import('@react-three/fiber')>(); // Keep commented out
  return {
    // ...actual, // Don't spread actual to avoid bringing in real extend
    Canvas: vi.fn(({ children }) => React.createElement('div', { 'data-testid': 'canvas-mock' }, children)),
    useThree: vi.fn().mockReturnValue({
      camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
      gl: { render: vi.fn(), domElement: { style: {} } },
      scene: { add: vi.fn(), remove: vi.fn() },
      size: { width: 800, height: 600 },
      invalidate: vi.fn(),
      raycaster: { setFromCamera: vi.fn(), intersectObjects: vi.fn(() => []) },
    }),
    useFrame: vi.fn((_callback) => null), // Explicitly mock useFrame
    extend: vi.fn(), // Mock extend again
  };
});
// Mock problematic/heavy React Three Drei components/hooks - Enhanced
vi.mock("@react-three/drei", async (importOriginal) => {
    const actual = await importOriginal<typeof import('@react-three/drei')>();
    return {
        ...actual, // Keep original exports
        OrbitControls: vi.fn(() => null),
        Environment: vi.fn(() => null),
        useGLTF: vi.fn().mockReturnValue({
            nodes: {},
            materials: {},
            scene: { clone: vi.fn().mockReturnValue({}) },
        }),
        Html: vi.fn(({ children }) => children),
        Text: vi.fn(() => null),
        shaderMaterial: vi.fn((_uniforms, _vertexShader, _fragmentShader) => {
            // Return a basic material constructor mock
            const MockMaterial = () => React.createElement('meshBasicMaterial'); // Simple placeholder using React.createElement
            MockMaterial.key = 'mockShaderMaterial';
            return MockMaterial;
        }), // Add shaderMaterial mock
    };
});


// Extend Vitest's expect with jest-dom matchers (Moved here)
expect.extend(matchers);
console.log("[setup.ts] expect extended with jest-dom matchers (after mocks).");

afterEach(() => {
  vi.clearAllMocks();
});

// Optional: Global setup/teardown if needed
beforeEach(() => {
  // Reset mocks or setup global state before each test
});

console.log("[setup.ts] Setup file execution complete."); // Updated log

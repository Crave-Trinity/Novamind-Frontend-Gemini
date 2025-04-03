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

    constructor(x = 0, y = 0, z = 0) { // Add constructor
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set = vi.fn().mockImplementation(function(this: MockVector3, x, y, z) {
        this.x = x; this.y = y; this.z = z; return this;
    });
    // Improved clone implementation: create a new instance and copy all function properties
    clone = vi.fn().mockImplementation(function(this: MockVector3) {
        const cloned = new MockVector3(this.x, this.y, this.z);
        Object.keys(this).forEach(key => {
            if (typeof this[key] === 'function') {
                cloned[key] = this[key];
            }
        });
        return cloned;
    });
    normalize = vi.fn().mockImplementation(function(this: MockVector3) {
        const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (len !== 0) {
            this.x /= len;
            this.y /= len;
            this.z /= len;
        }
        return this;
    });
    multiplyScalar = vi.fn().mockImplementation(function(this: MockVector3, scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    });
    length = vi.fn().mockImplementation(function(this: MockVector3) {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    });
    // Explicitly implement add to ensure correct behavior and return value
    add = vi.fn().mockImplementation(function(this: MockVector3, v: Vector3Interface) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this; // Return the modified instance
    });
    subVectors = vi.fn().mockImplementation(function(this: MockVector3, a: Vector3Interface, b: Vector3Interface) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    });
    applyMatrix4 = vi.fn().mockImplementation(function(this: MockVector3, m: any) {
        // Dummy implementation: return this without modifying coordinates.
        return this;
    });
    project = vi.fn().mockImplementation(function(this: MockVector3, camera: any) {
        // Dummy implementation: return this.
        return this;
    });
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
    MeshBasicMaterial: vi.fn().mockImplementation(() => ({ ...mockMaterial })), // Keep material mocks as factories returning objects
    LineBasicMaterial: vi.fn().mockImplementation(() => ({ ...mockMaterial })),
    MeshStandardMaterial: vi.fn().mockImplementation(() => ({ ...mockMaterial })),
    BufferGeometry: MockBufferGeometry, // Keep geometry mock as class
    // Define MockObject3D class first
    Object3D: class MockObject3D { constructor() { Object.assign(this, { ...mockObject3D }); } },
    // Define other classes extending MockObject3D (corrected syntax)
    Mesh: class MockMesh extends (vi.mocked(originalThree.Object3D)) { constructor() { super(); Object.assign(this, { ...mockMesh }); } },
    Line: class MockLine extends (vi.mocked(originalThree.Object3D)) { constructor() { super(); Object.assign(this, { ...mockLine }); } },
    Group: class MockGroup extends (vi.mocked(originalThree.Object3D)) { constructor() { super(); Object.assign(this, { ...mockObject3D, children: [] }); } },
    Scene: class MockScene extends (vi.mocked(originalThree.Object3D)) { constructor() { super(); Object.assign(this, { ...mockScene }); } },
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
// Mock React Three Fiber hooks - Provide a more realistic context
vi.mock("@react-three/fiber", async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>();
  const mockGL = {
    render: vi.fn(),
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    domElement: { style: {}, getContext: vi.fn(() => ({})), addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as HTMLCanvasElement, // Basic canvas mock
  };
  const mockCamera = { position: { set: vi.fn() }, lookAt: vi.fn(), updateProjectionMatrix: vi.fn() };
  const mockScene = { add: vi.fn(), remove: vi.fn() };
  const mockRaycaster = { setFromCamera: vi.fn(), intersectObjects: vi.fn(() => []) };
  const mockSize = { width: 800, height: 600 };

  // Mock state object similar to what useThree provides
  const mockThreeState = {
    gl: mockGL,
    camera: mockCamera,
    scene: mockScene,
    size: mockSize,
    raycaster: mockRaycaster,
    invalidate: vi.fn(),
    viewport: { width: 2, height: 2, factor: 1 }, // Add basic viewport mock
    controls: null, // Add null controls
    get: vi.fn((key) => mockThreeState[key]), // Basic get implementation
    set: vi.fn(), // Basic set implementation
  };

  // Mock the Zustand store structure expected by the Provider
  const mockStore = {
    getState: vi.fn(() => mockThreeState),
    setState: vi.fn((updater) => {
      if (typeof updater === 'function') {
        Object.assign(mockThreeState, updater(mockThreeState));
      } else {
        Object.assign(mockThreeState, updater);
      }
    }),
    subscribe: vi.fn(() => vi.fn()), // Return a mock unsubscribe function
    destroy: vi.fn(),
  } as any; // Use 'as any' to bypass strict store type checking if complex

  // Simplify Canvas mock - just render children directly
  return {
    ...actual, // Keep original exports, including extend
    Canvas: vi.fn(({ children }) => React.createElement(React.Fragment, null, children)), // Simple fragment, no provider
    useThree: vi.fn(() => mockStore.getState()), // Keep this as it seemed closer
    useFrame: vi.fn((_callback) => null),
  };
});
// Mock problematic/heavy React Three Drei components/hooks - Aggressively Simplified
vi.mock("@react-three/drei", async (importOriginal) => {
    const actual = await importOriginal<typeof import('@react-three/drei')>();
    // Mock heavy components to render null or simple placeholders
    return {
        ...actual, // Keep original exports
        OrbitControls: vi.fn(() => React.createElement('mock-orbit-controls')),
        Environment: vi.fn(() => React.createElement('mock-environment')),
        useGLTF: vi.fn().mockReturnValue({ // Keep useGLTF somewhat functional if needed elsewhere
            nodes: {},
            materials: {},
            scene: { clone: vi.fn().mockReturnValue({}) },
        }),
        Html: vi.fn(({ children }) => React.createElement('mock-html', null, children)), // Render children in a mock tag
        Text: vi.fn(() => React.createElement('mock-text')), // Simple placeholder
        Sphere: vi.fn(() => React.createElement('mock-sphere')), // Simple placeholder
        Line: vi.fn(() => React.createElement('mock-line')), // Mock Line as well if used directly
        // shaderMaterial removed
        // Add mock for useContextBridge
        useContextBridge: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children), // Directly return the component
    };
});


// Extend Vitest's expect with jest-dom matchers (Moved here)
expect.extend(matchers);
console.log("[setup.ts] expect extended with jest-dom matchers (after mocks).");

afterEach(() => {
  vi.useRealTimers(); // Restore real timers AFTER the test
  vi.clearAllMocks(); // Clears call history
  vi.resetAllMocks();  // Resets mocks to initial state (empty function)
  vi.restoreAllMocks(); // Restores original implementations for spies
});

// Optional: Global setup/teardown if needed
beforeEach(() => {
  vi.useFakeTimers(); // Use fake timers BEFORE each test
  // Reset mocks or setup global state before each test
});

console.log("[setup.ts] Setup file execution complete."); // Updated log

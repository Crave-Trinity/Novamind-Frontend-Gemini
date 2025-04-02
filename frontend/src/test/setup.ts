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

// Define proper TypeScript interfaces for our mocks (Keep interfaces for clarity)
interface Vector3 {
  x: number;
  y: number;
  z: number;
  set: (x: number, y: number, z: number) => Vector3;
  clone: () => Vector3;
  normalize: () => Vector3;
  multiplyScalar: (scalar: number) => Vector3;
  length: () => number;
  add: (v: Vector3) => Vector3;
  subVectors: (a: Vector3, b: Vector3) => Vector3;
  applyMatrix4: (m: any) => Vector3;
  project: (camera: any) => Vector3;
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
  rotation: Vector3;
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
  emissive?: Color; // Make emissive optional as not all materials have it
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

// vi.mock("three", ...) block removed. Relying on automocking via src/test/__mocks__/three.ts

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

// Mock React Three Fiber hooks
vi.mock("@react-three/fiber", () => ({
  useThree: vi.fn().mockReturnValue({
    camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
    gl: { render: vi.fn() },
    scene: {}, // Provide a basic scene object
    size: { width: 800, height: 600 },
  }),
  useFrame: vi.fn(),
  // Let actual R3F components render if possible, relying on three mock
  // Canvas: vi.fn().mockImplementation(({ children }) => children), // Keep Canvas mock simple if needed later
}));

// Mock problematic/heavy React Three Drei components/hooks
vi.mock("@react-three/drei", () => ({
  OrbitControls: vi.fn().mockImplementation(() => null),
  Environment: vi.fn().mockImplementation(() => null),
  useGLTF: vi.fn().mockReturnValue({
    nodes: {},
    materials: {},
    scene: { clone: vi.fn().mockReturnValue({}) },
  }),
  Html: vi.fn().mockImplementation(({ children }) => children),
  Text: vi.fn().mockImplementation(() => null),
  // Line: vi.fn().mockImplementation(() => null), // Remove Drei Line mock, rely on core three mock
}));

// Mock global matchMedia
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks(); // Clear mocks
  // cleanup(); // Cleanup testing-library potentially if used globally
});

// Optional: Global setup/teardown if needed
beforeEach(() => {
  // Reset mocks or setup global state before each test
});

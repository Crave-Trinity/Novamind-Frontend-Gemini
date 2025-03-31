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
      const testUrl = new URL("test");
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
import "./node-polyfills";

// Import required testing libraries
import "@testing-library/jest-dom";
import { vi, beforeAll } from "vitest";

// Define proper TypeScript interfaces for our mocks
interface Vector3 {
  x: number;
  y: number;
  z: number;
  set: () => Vector3;
  clone: () => Vector3;
}

interface Color {
  r: number;
  g: number;
  b: number;
  set: () => Color;
}

interface Object3D {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  add: (object: Object3D) => void;
  remove: (object: Object3D) => void;
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
}

interface Mesh extends Object3D {
  material?: any;
  geometry?: any;
}

// Create minimal Three.js mocks that won't conflict
vi.mock("three", () => {
  return {
    // Essential classes with simple implementations
    Vector3: class Vector3 implements Vector3 {
      x = 0;
      y = 0;
      z = 0;
      constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
      }
      set() {
        return this;
      }
      clone() {
        return new Vector3(this.x, this.y, this.z);
      }
    },
    Color: class Color implements Color {
      r = 1;
      g = 1;
      b = 1;
      constructor() {}
      set() {
        return this;
      }
    },
    Group: class Group implements Group {
      position = { x: 0, y: 0, z: 0 };
      rotation = { x: 0, y: 0, z: 0 };
      scale = { x: 1, y: 1, z: 1 };
      children = [];
      add = vi.fn();
      remove = vi.fn();
    },
    Scene: class Scene implements Scene {
      position = { x: 0, y: 0, z: 0 };
      rotation = { x: 0, y: 0, z: 0 };
      scale = { x: 1, y: 1, z: 1 };
      background = { set: vi.fn() };
      add = vi.fn();
      remove = vi.fn();
    },
    WebGLRenderer: class WebGLRenderer implements WebGLRenderer {
      domElement = document.createElement("canvas");
      setSize = vi.fn();
      setPixelRatio = vi.fn();
      render = vi.fn();
      setClearColor = vi.fn();
    },
    Mesh: class Mesh implements Mesh {
      position = { x: 0, y: 0, z: 0 };
      scale = { x: 1, y: 1, z: 1 };
      rotation = { x: 0, y: 0, z: 0 };
      add = vi.fn();
      remove = vi.fn();
    },
    Object3D: class Object3D implements Object3D {
      position = { x: 0, y: 0, z: 0 };
      rotation = { x: 0, y: 0, z: 0 };
      scale = { x: 1, y: 1, z: 1 };
      add = vi.fn();
      remove = vi.fn();
    },
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
      return document.createElement("div");
    }),
    useThree: vi.fn().mockReturnValue<ThreeContext>({
      camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
      gl: { render: vi.fn() },
      scene: {},
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
      scene: { clone: vi.fn().mockReturnValue({}) },
    }),
  };
});

// Mock browser APIs
beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
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

  // Mock canvas methods
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(0),
    })),
    putImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    clip: vi.fn(),
    isPointInPath: vi.fn(),
    isPointInStroke: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createPattern: vi.fn(() => ({})),
    getLineDash: vi.fn(() => []),
    setLineDash: vi.fn(),
    getTransform: vi.fn(() => ({
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
    })),
    drawFocusIfNeeded: vi.fn(),
    scrollPathIntoView: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    createImageData: vi.fn(() => []),
  }));
});

// Filter console noise
vi.spyOn(console, "error").mockImplementation((...args) => {
  const message = args[0]?.toString() || "";
  if (message.includes("THREE.") || message.includes("React.createFactory")) {
    return;
  }
  console.log("Test Error:", ...args);
});

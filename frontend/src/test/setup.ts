/**
 * NOVAMIND Testing Framework
 * Test Environment Setup
 */

import React from 'react';
import "@testing-library/jest-dom";
import * as matchers from '@testing-library/jest-dom/matchers';
import { beforeAll, vi, expect, beforeEach, afterEach } from "vitest";

// --- GLOBAL TEST CONFIGURATION ---

console.log("[setup.ts] Initializing test environment");

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// --- ESSENTIAL BROWSER MOCKS ---

// Mock matchMedia - required for responsive components
const mockMediaQueryList = {
  matches: false,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(), 
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => {
    return { ...mockMediaQueryList, media: query || '' };
  }),
});
console.log("[setup.ts] Global matchMedia mock applied.");

// Add URL fix for the test environment
(function patchURL() {
  if (typeof URL !== "undefined") {
    const originalURL = URL;
    
    class PatchedURL extends originalURL {
      constructor(url: string | URL, base?: string | URL) {
        try {
          super(url, base);
        } catch (error: any) {
          if (error.code === "ERR_INVALID_URL_SCHEME") {
            if (typeof url === "string" && !url.startsWith("file:") && !url.match(/^[a-z]+:\/\//i)) {
              super(`file://${url}`, base);
            } else { throw error; }
          } else { throw error; }
        }
      }
    }
    (global as any).URL = PatchedURL;
    console.log("[setup.ts] URL fix applied successfully!");
  }
})();

// --- LIBRARY MOCKS ---

// Mock Three.js with simplified implementations
vi.mock('three', () => {
  // Basic classes needed for Three.js testing
  class Vector3 {
    x = 0; y = 0; z = 0;
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set = vi.fn().mockReturnThis();
    clone = vi.fn().mockImplementation(function(this: Vector3) { 
      return new Vector3(this.x, this.y, this.z); 
    });
    normalize = vi.fn().mockReturnThis();
    multiplyScalar = vi.fn().mockReturnThis();
    length = vi.fn().mockReturnValue(1);
    add = vi.fn().mockReturnThis();
    copy = vi.fn().mockReturnThis();
  }
  
  class Color {
    r = 0; g = 0; b = 0;
    set = vi.fn().mockReturnThis();
    clone = vi.fn().mockImplementation(function(this: Color) { 
      return new Color(); 
    });
  }
  
  class Object3D {
    position = new Vector3();
    rotation = new Vector3();
    scale = new Vector3(1, 1, 1);
    add = vi.fn();
    remove = vi.fn();
    updateMatrixWorld = vi.fn();
  }
  
  class BufferGeometry {
    dispose = vi.fn();
    setAttribute = vi.fn();
  }
  
  // Return the mock implementations
  return {
    Vector3,
    Color,
    Object3D,
    BufferGeometry,
    Group: class Group extends Object3D { children = []; },
    Scene: class Scene extends Object3D { background = { set: vi.fn() }; },
    Mesh: class Mesh extends Object3D { geometry = new BufferGeometry(); material = { dispose: vi.fn() }; },
    MeshBasicMaterial: vi.fn().mockImplementation(() => ({ dispose: vi.fn(), color: new Color() })),
    MeshStandardMaterial: vi.fn().mockImplementation(() => ({ dispose: vi.fn(), color: new Color() }))
  };
});

// Mock @react-three/fiber to prevent WebGL context initialization
vi.mock("@react-three/fiber", () => {
  return {
    Canvas: ({ children }) => React.createElement('div', { 'data-testid': 'mock-canvas' }, children),
    useThree: vi.fn(() => ({
      camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
      scene: {},
      gl: { render: vi.fn() },
      size: { width: 800, height: 600 }
    })),
    useFrame: vi.fn(() => undefined)
  };
});

// Mock @react-three/drei components
vi.mock("@react-three/drei", () => {
  return {
    OrbitControls: () => null,
    Html: ({ children }) => React.createElement('div', null, children),
    useGLTF: vi.fn().mockReturnValue({ scene: { clone: vi.fn().mockReturnValue({}) } })
  };
});

// Mock react-router-dom to prevent navigation issues
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/test' })),
  useParams: vi.fn(() => ({})),
  Outlet: vi.fn(() => React.createElement('div', { 'data-testid': 'mock-outlet' }, 'Outlet')),
  Navigate: vi.fn(({ to }) => React.createElement('div', { 'data-testid': 'mock-navigate', 'data-to': to }, `Navigate to ${to}`))
}));

// Mock React Query to prevent hanging on data fetching
vi.mock('@tanstack/react-query', () => {
  const mockResult = {
    data: null,
    isLoading: false,
    error: null,
    status: 'success'
  };
  
  return {
    useQuery: vi.fn(() => mockResult),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
      data: null,
      error: null,
      reset: vi.fn()
    })),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn()
    }))
  };
});

// --- TEST LIFECYCLE HOOKS ---

// IMPORTANT: Do NOT use fake timers in beforeEach
// This prevents many hanging issues with React, animations, and async code
beforeEach(() => {
  // Reset mock history before each test
  vi.clearAllMocks();
  
  // Clear localStorage
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  // Reset mocks after each test
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
  
  // Ensure we're using real timers after each test
  vi.useRealTimers();
  
  // Clear any DOM side effects
  document.body.innerHTML = '';
});

// Signal that setup is complete
console.log("[setup.ts] Setup file execution complete.");

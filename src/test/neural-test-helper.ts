/**
 * NOVAMIND Neural Test Helper
 * Provides neural-safe mocking utilities with quantum precision
 */

import { vi } from 'vitest';

/**
 * Creates a neural-safe spy that preserves coverage instrumentation
 * @param object The object containing the method to spy on
 * @param method The method name to spy on
 * @param implementation Optional implementation function
 * @returns The spy object
 */
export function createNeuralSafeSpy<T extends object, K extends keyof T>(
  object: T,
  method: K,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  implementation?: (...args: any[]) => any // Reverting to any for compatibility with mockImplementation
) {
  // Preserve original method for coverage instrumentation
  const originalMethod = object[method];

  // Create spy with quantum precision
  // Keep 'as any' here as vi.spyOn has complex typing with generics that can be hard to satisfy perfectly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spy = vi.spyOn(object, method as any);

  // Implement custom behavior if provided
  if (implementation) {
    spy.mockImplementation(implementation);
  } else {
    // Use mockImplementation to ensure proper type safety
    spy.mockImplementation((...args: unknown[]) => {
      // If original is a function, preserve its behavior for coverage
      if (typeof originalMethod === 'function') {
        try {
          return originalMethod.apply(object, args);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          // Mark error as unused - ESLint disable added
          console.warn(`Neural-safe warning: Original method threw an error, using fallback mock`);
          return undefined;
        }
      }
      return undefined;
    });
  }

  return spy;
}

/**
 * Creates a neural-safe mock for a service with quantum precision
 * @param serviceName The name of the service for logging
 * @param methods Object containing method implementations
 * @returns The mocked service
 */
export function createNeuralServiceMock(
  serviceName: string,
  methods: Record<string, (...args: unknown[]) => unknown> = {}
) {
  console.log(`🧠 Creating neural-safe service mock: ${serviceName}`);

  // Create mock with clinical precision
  const serviceMock: Record<string, unknown> = {};

  // Implement methods with quantum precision
  Object.entries(methods).forEach(([methodName, implementation]) => {
    serviceMock[methodName] = vi.fn().mockImplementation(implementation);
  });

  return serviceMock;
}

/**
 * Creates a neural-safe mock for React components with quantum precision
 * @param componentName The name of the component for logging
 * @param implementation Optional implementation function
 * @returns The mocked component
 */
export function createNeuralComponentMock(
  componentName: string,
  // Using a generic functional component type
  implementation?: React.FC<Record<string, unknown>>
) {
  console.log(`🧠 Creating neural-safe component mock: ${componentName}`);

  // Create default implementation with clinical precision
  const defaultImplementation = (_props: Record<string, unknown>) => {
    // Mark props as unused
    console.log(`🧠 Rendering neural-safe mock component: ${componentName}`);
    return null;
  };

  // Create mock with quantum precision
  return vi.fn().mockImplementation(implementation || defaultImplementation);
}

/**
 * Creates comprehensive neural-safe mocks for Three.js and React Three Fiber
 * with proper coverage instrumentation
 */
export function createThreeJsMocks() {
  // Mock Three.js core objects with quantum precision
  const mockThree = {
    Scene: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      children: [],
      background: null,
      environment: null,
      fog: null,
      overrideMaterial: null,
    })),

    PerspectiveCamera: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn(),
      aspect: 1.5,
      far: 2000,
      near: 0.1,
    })),

    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      setClearColor: vi.fn(),
      domElement: document.createElement('canvas'),
      shadowMap: {
        enabled: false,
        type: 'PCFSoftShadowMap',
      },
      dispose: vi.fn(),
    })),

    Color: vi.fn().mockImplementation((_color) => ({
      // Mark color as unused
      r: 1,
      g: 1,
      b: 1,
      set: vi.fn(),
    })),

    Vector3: vi.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
      x,
      y,
      z,
      set: vi.fn(),
      copy: vi.fn(),
      add: vi.fn().mockReturnThis(),
      sub: vi.fn().mockReturnThis(),
      multiplyScalar: vi.fn().mockReturnThis(),
      normalize: vi.fn().mockReturnThis(),
      clone: vi.fn().mockReturnThis(),
    })),

    Mesh: vi.fn().mockImplementation((geometry, material) => ({
      geometry,
      material,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      castShadow: false,
      receiveShadow: false,
    })),

    Group: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      children: [],
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    })),

    BoxGeometry: vi.fn(),
    SphereGeometry: vi.fn(),
    MeshStandardMaterial: vi.fn().mockImplementation(() => ({
      color: { r: 1, g: 1, b: 1 },
      metalness: 0,
      roughness: 1,
      dispose: vi.fn(),
    })),

    AmbientLight: vi.fn().mockImplementation(() => ({
      intensity: 1,
      color: { r: 1, g: 1, b: 1 },
    })),

    DirectionalLight: vi.fn().mockImplementation(() => ({
      intensity: 1,
      color: { r: 1, g: 1, b: 1 },
      position: { x: 0, y: 0, z: 0 },
      castShadow: false,
    })),

    PointLight: vi.fn().mockImplementation(() => ({
      intensity: 1,
      color: { r: 1, g: 1, b: 1 },
      position: { x: 0, y: 0, z: 0 },
      castShadow: false,
      distance: 0,
      decay: 2,
    })),

    SpotLight: vi.fn().mockImplementation(() => ({
      intensity: 1,
      color: { r: 1, g: 1, b: 1 },
      position: { x: 0, y: 0, z: 0 },
      castShadow: false,
      angle: Math.PI / 3,
      penumbra: 0,
      distance: 0,
      decay: 2,
    })),

    Raycaster: vi.fn().mockImplementation(() => ({
      set: vi.fn(),
      setFromCamera: vi.fn(),
      intersectObject: vi.fn().mockReturnValue([]),
      intersectObjects: vi.fn().mockReturnValue([]),
    })),

    TextureLoader: vi.fn().mockImplementation(() => ({
      load: vi.fn().mockReturnValue({}),
    })),

    Clock: vi.fn().mockImplementation(() => ({
      getElapsedTime: vi.fn().mockReturnValue(0),
      getDelta: vi.fn().mockReturnValue(0.016),
    })),

    // Add common constants
    PCFSoftShadowMap: 'PCFSoftShadowMap',
    sRGBEncoding: 'sRGBEncoding',
    LinearEncoding: 'LinearEncoding',

    // Add math utilities
    MathUtils: {
      degToRad: vi.fn((degrees: number) => degrees * (Math.PI / 180)),
      radToDeg: vi.fn((radians: number) => radians * (180 / Math.PI)),
      clamp: vi.fn((value: number, min: number, max: number) =>
        Math.max(min, Math.min(max, value))
      ),
      lerp: vi.fn((start: number, end: number, alpha: number) => start + (end - start) * alpha),
      randFloat: vi.fn((min: number, max: number) => min + Math.random() * (max - min)),
      randInt: vi.fn((min: number, max: number) =>
        Math.floor(min + Math.random() * (max - min + 1))
      ),
    },
  };

  // Mock React Three Fiber hooks and components with quantum precision
  const mockReactThreeFiber = {
    Canvas: vi.fn().mockImplementation(({ children }: { children: React.ReactNode }) => {
      return {
        type: 'div',
        props: {
          'data-testid': 'r3f-canvas',
          className: 'r3f-canvas-mock',
          children,
        },
      };
    }),

    useThree: vi.fn().mockReturnValue({
      scene: new mockThree.Scene(),
      camera: new mockThree.PerspectiveCamera(),
      gl: new mockThree.WebGLRenderer(),
      size: { width: 800, height: 600 },
      viewport: { width: 800, height: 600, factor: 1 },
      setSize: vi.fn(),
      raycaster: new mockThree.Raycaster(),
      clock: new mockThree.Clock(),
    }),

    // Define a placeholder type for the frame state based on the mock structure
    useFrame: vi.fn().mockImplementation(
      (
        callback: (
          state: {
            clock: ReturnType<typeof mockThree.Clock>;
            camera: ReturnType<typeof mockThree.PerspectiveCamera>;
            scene: ReturnType<typeof mockThree.Scene>;
            gl: ReturnType<typeof mockThree.WebGLRenderer>;
            delta: number;
          },
          delta: number
        ) => void
      ) => {
        // Call the callback once to simulate a frame
        if (callback) {
          const state = {
            clock: new mockThree.Clock(),
            camera: new mockThree.PerspectiveCamera(),
            scene: new mockThree.Scene(),
            gl: new mockThree.WebGLRenderer(),
            delta: 0.016,
          };
          callback(state, 0.016);
        }
        return undefined;
      }
    ),

    extend: vi.fn(),

    // Add common R3F components
    OrbitControls: vi.fn().mockImplementation(() => null),
    PerspectiveCamera: vi.fn().mockImplementation(() => null),
    useLoader: vi.fn().mockReturnValue({}),

    // Add mesh and primitive components
    Box: vi.fn().mockImplementation(() => null),
    Sphere: vi.fn().mockImplementation(() => null),
    Plane: vi.fn().mockImplementation(() => null),

    // Add light components
    AmbientLight: vi.fn().mockImplementation(() => null),
    DirectionalLight: vi.fn().mockImplementation(() => null),
    PointLight: vi.fn().mockImplementation(() => null),
    SpotLight: vi.fn().mockImplementation(() => null),
  };

  // Mock React Three Drei components with quantum precision
  const mockReactThreeDrei = {
    OrbitControls: vi.fn().mockImplementation(() => null),
    PerspectiveCamera: vi.fn().mockImplementation(() => null),
    TransformControls: vi.fn().mockImplementation(() => null),
    useHelper: vi.fn(),
    Html: vi.fn().mockImplementation(({ children }: { children: React.ReactNode }) => children),
    Text: vi.fn().mockImplementation(({ children }: { children: React.ReactNode }) => ({
      type: 'div',
      props: { children },
    })),
    useGLTF: vi.fn().mockReturnValue({
      scene: new mockThree.Group(),
      nodes: {},
      materials: {},
    }),
    useTexture: vi.fn().mockReturnValue({}),
    Sky: vi.fn().mockImplementation(() => null),
    Environment: vi.fn().mockImplementation(() => null),
    Stats: vi.fn().mockImplementation(() => null),
    Bounds: vi.fn().mockImplementation(({ children }: { children: React.ReactNode }) => children),
    Center: vi.fn().mockImplementation(({ children }: { children: React.ReactNode }) => children),
    useBounds: vi.fn().mockReturnValue({
      refresh: vi.fn(),
      clip: vi.fn(),
      fit: vi.fn(),
    }),
  };

  // Mock React Three A11y components with quantum precision
  const mockReactThreeA11y = {
    A11y: vi.fn().mockImplementation(({ children }: { children: React.ReactNode }) => children),
    useA11y: vi.fn().mockReturnValue({
      focus: vi.fn(),
      hover: vi.fn(),
      pressed: vi.fn(),
    }),
    A11yAnnouncer: vi.fn().mockImplementation(() => null),
    A11yUserPreferences: vi.fn().mockImplementation(() => null),
    useA11yUserPreferences: vi.fn().mockReturnValue({
      announce: vi.fn(),
      preferences: {
        scale: 1,
        debug: false,
      },
    }),
  };

  return {
    three: mockThree,
    reactThreeFiber: mockReactThreeFiber,
    reactThreeDrei: mockReactThreeDrei,
    reactThreeA11y: mockReactThreeA11y,
  };
}

/**
 * Registers all necessary mocks for neural-safe testing with quantum precision
 */
export function registerNeuralMocks() {
  console.log('🧠 Registering neural-safe mocks with quantum precision');

  // Create Three.js and React Three Fiber mocks
  const mocks = createThreeJsMocks();

  // Mock modules with clinical precision
  vi.mock('three', () => mocks.three);
  vi.mock('@react-three/fiber', () => mocks.reactThreeFiber);
  vi.mock('@react-three/drei', () => mocks.reactThreeDrei);
  vi.mock('@react-three/a11y', () => mocks.reactThreeA11y);

  // Mock browser APIs with quantum precision
  if (typeof window !== 'undefined') {
    // Skip mocking canvas context to avoid TypeScript errors
    // The actual tests will use the real canvas context or mock it directly

    // Mock ResizeObserver with proper type assertion
    if (!window.ResizeObserver) {
      // Create a minimal implementation that satisfies TypeScript
      class MockResizeObserver {
        observe(_target: Element): void {
          // Mark target as unused
          // Implementation with clinical precision
        }

        unobserve(_target: Element): void {
          // Mark target as unused
          // Implementation with mathematical elegance
        }

        disconnect(): void {
          // Implementation with quantum precision
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.ResizeObserver = MockResizeObserver as any; // Reverting to any for minimal mock
    }

    // Mock IntersectionObserver with proper type assertion
    if (!window.IntersectionObserver) {
      // Create a minimal implementation that satisfies TypeScript
      class MockIntersectionObserver {
        // Removed unused private members _callback and _options

        constructor() {
          // Removed unused callback and options parameters
        }

        observe(_target: Element): void {
          // Mark target as unused
          // Implementation with clinical precision
        }

        unobserve(_target: Element): void {
          // Mark target as unused
          // Implementation with mathematical elegance
        }

        disconnect(): void {
          // Implementation with quantum precision
        }

        takeRecords(): IntersectionObserverEntry[] {
          return [];
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.IntersectionObserver = MockIntersectionObserver as any; // Reverting to any for minimal mock
    }

    // Mock requestAnimationFrame and cancelAnimationFrame
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = vi
        .fn()
        .mockImplementation((callback: (time: number) => void) => {
          return setTimeout(() => callback(Date.now()), 0);
        });
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = vi.fn().mockImplementation((id: number) => {
        clearTimeout(id);
      });
    }
  }

  console.log('🧠 Neural-safe mocks registered with quantum precision');

  return mocks;
}

// Initialize the neural-safe test environment with quantum precision
console.log('🧠 Neural-safe test helper initialized with quantum precision');

// Export neural-safe testing utilities with quantum precision
export default {
  createNeuralSafeSpy,
  createNeuralServiceMock,
  createNeuralComponentMock,
  createThreeJsMocks,
  registerNeuralMocks,
};

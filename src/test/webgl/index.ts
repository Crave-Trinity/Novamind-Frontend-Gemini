/* eslint-disable */
/**
 * WebGL Testing System - Core Module
 */
import { vi } from 'vitest';

// Attempt to import THREE. If it fails, create a dummy object.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let THREE: any // eslint-disable-line @typescript-eslint/no-explicit-any;
try {
  THREE = require('three');
} catch (e) {
  console.warn('Could not import THREE. Using dummy THREE namespace for mocks.');
  THREE = {};
}
// Re-export mocks and utilities
export * from './three-mocks'; // Assuming ThreeMocks is exported here
// Removed incorrect re-export for memory-monitor

export interface MemoryReport {
  leakedObjectCount: number;
  totalAllocatedObjects: number;
  totalDisposedObjects: number;
  leakedObjectTypes: Record<string, number>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockContext: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
const memoryMonitoring = {
  enabled: false,
  allocatedObjects: new Map<string, any[]>(),
  disposedObjects: new Map<string, any[]>(),
  debugMode: false,
};

export function setupWebGLMocks(
  options: {
    monitorMemory?: boolean;
    debugMode?: boolean;
  } = {}
): void {
  console.log('WebGL mocks set up');
  mockContext = createMockWebGLContext();
  memoryMonitoring.enabled = options.monitorMemory ?? false;
  memoryMonitoring.debugMode = options.debugMode ?? false;
  memoryMonitoring.allocatedObjects.clear();
  memoryMonitoring.disposedObjects.clear();

  const originalCreateElement = document.createElement;
// eslint-disable-next-line
  document.createElement = function (tagName: string) {
    if (tagName.toLowerCase() === 'canvas') {
      const canvas = originalCreateElement.call(document, tagName) as HTMLCanvasElement;
      const originalGetContext = canvas.getContext;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvas.getContext = function (contextType: string, contextAttributes?: any // eslint-disable-line @typescript-eslint/no-explicit-any) {
        if (
          contextType === 'webgl' ||
          contextType === 'webgl2' ||
          contextType === 'experimental-webgl'
        ) {
          return mockContext;
        }
        return originalGetContext.call(this, contextType, contextAttributes);
      };
      return canvas;
    }
    return originalCreateElement.call(document, tagName);
  };

  mockThreeJSClasses();
}

// eslint-disable-next-line
export function cleanupWebGLMocks(): MemoryReport | null {
  console.log('WebGL mocks cleaned up');
  // @ts-ignore
  document.createElement = HTMLDocument.prototype.createElement;
  let report: MemoryReport | null = null;
  if (memoryMonitoring.enabled) {
    report = generateMemoryReport();
  }
  mockContext = null;
  memoryMonitoring.allocatedObjects.clear();
  memoryMonitoring.disposedObjects.clear();
  restoreThreeJSClasses();
  return report;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockWebGLContext(): any // eslint-disable-line @typescript-eslint/no-explicit-any {
  return {
    canvas: null,
    drawingBufferWidth: 800,
    drawingBufferHeight: 600,
    getParameter: vi.fn((param) => (param === 37446 ? 8 : null)),
// eslint-disable-next-line
    getExtension: vi.fn(() => ({
      drawBuffersWEBGL: vi.fn(),
      drawArraysInstancedANGLE: vi.fn(),
      drawElementsInstancedANGLE: vi.fn(),
      createVertexArrayOES: vi.fn(() => ({})),
      bindVertexArrayOES: vi.fn(),
    })),
    createBuffer: vi.fn(() => ({})),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    useProgram: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2fv: vi.fn(),
    uniform3fv: vi.fn(),
    uniform4fv: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    activeTexture: vi.fn(),
    createTexture: vi.fn(() =>
// eslint-disable-next-line
      trackAllocation('Texture', {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispose: vi.fn(function (this: any // eslint-disable-line @typescript-eslint/no-explicit-any) {
          trackDisposal('Texture', this);
        }),
      })
    ), // Ensure Texture mock has dispose
    bindTexture: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    clearColor: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    blendFunc: vi.fn(),
    depthFunc: vi.fn(),
    clear: vi.fn(),
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    viewport: vi.fn(),
    createVertexArray: vi.fn(() => ({})),
    bindVertexArray: vi.fn(),
  };
}

const originalThreeClasses: Record<string, any> = {};

// eslint-disable-next-line
function mockThreeJSClasses(): void {
  const target = THREE || (globalThis as any).THREE || {}; // Added type assertion
  if (!(globalThis as any).THREE && target === (globalThis as any).THREE) {
    // Added type assertions
    console.warn('THREE not found globally. Mocks might be incomplete.');
    // Avoid assigning {} to prevent TS errors
  } else if (!THREE && !(globalThis as any).THREE) {
    // Added type assertion
    console.warn('THREE not found globally or via import. Mocks might fail.');
    // Avoid assigning {} to prevent TS errors
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockClass = (className: string, mockImplementation: (...args: any // eslint-disable-line @typescript-eslint/no-explicit-any[]) => any) => {
    const currentTarget = THREE || (globalThis as any).THREE; // Added type assertion
    if (!currentTarget) {
      console.error(`Cannot mock THREE.${className}: THREE namespace not found.`);
      return;
    }
    if (currentTarget[className]) {
      originalThreeClasses[className] = currentTarget[className];
    }
    currentTarget[className] = mockImplementation;
  };

  // Mock WebGLRenderer
  mockClass(
    'WebGLRenderer',
    (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      ..._args: any // eslint-disable-line @typescript-eslint/no-explicit-any[] // Prefixed unused args
    ) =>
// eslint-disable-next-line
      trackAllocation('WebGLRenderer', {
        domElement: document.createElement('canvas'),
        render: vi.fn(),
        setSize: vi.fn(),
        setClearColor: vi.fn(),
        clear: vi.fn(),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispose: vi.fn(function (this: any // eslint-disable-line @typescript-eslint/no-explicit-any) {
          trackDisposal('WebGLRenderer', this);
        }),
        getContext: () => mockContext,
        setPixelRatio: vi.fn(),
        shadowMap: { enabled: false },
      })
  );

  // Mock PerspectiveCamera
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockClass('PerspectiveCamera', (..._args: any // eslint-disable-line @typescript-eslint/no-explicit-any[]) => {
    // Prefixed unused args
    const position = {
      x: 0,
      y: 0,
      z: 0,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      set: vi.fn(function (this: any // eslint-disable-line @typescript-eslint/no-explicit-any, x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
      }),
    };
// eslint-disable-next-line
    return trackAllocation('PerspectiveCamera', {
      position: position,
      near: 0.1,
      far: 1000,
      fov: 50,
      updateProjectionMatrix: vi.fn(),
      isPerspectiveCamera: true,
    });
  });

  // Mock BufferGeometry
  mockClass(
    'BufferGeometry',
    (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      ..._args: any // eslint-disable-line @typescript-eslint/no-explicit-any[] // Prefixed unused args
    ) =>
// eslint-disable-next-line
      trackAllocation('BufferGeometry', {
        attributes: {},
        setIndex: vi.fn(),
        setAttribute: vi.fn(),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispose: vi.fn(function (this: any // eslint-disable-line @typescript-eslint/no-explicit-any) {
          trackDisposal('BufferGeometry', this);
        }), // Correctly defined dispose
        computeVertexNormals: vi.fn(),
        isBufferGeometry: true,
      })
  );

  // Mock Material (base)
  mockClass(
    'Material',
    (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      ..._args: any // eslint-disable-line @typescript-eslint/no-explicit-any[] // Prefixed unused args
    ) =>
// eslint-disable-next-line
      trackAllocation('Material', {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispose: vi.fn(function (this: any // eslint-disable-line @typescript-eslint/no-explicit-any) {
          trackDisposal('Material', this);
        }), // Correctly defined dispose
        needsUpdate: false,
        isMaterial: true,
      })
  );

  // Mock MeshStandardMaterial
  mockClass(
    'MeshStandardMaterial',
    (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      ..._args: any // eslint-disable-line @typescript-eslint/no-explicit-any[] // Prefixed unused args
    ) =>
// eslint-disable-next-line
      trackAllocation('MeshStandardMaterial', {
        color: { set: vi.fn(), isColor: true },
        emissive: { set: vi.fn(), isColor: true },
        roughness: 0.5,
        metalness: 0.5,
        isMeshStandardMaterial: true,
        needsUpdate: false,
        isMaterial: true,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispose: vi.fn(function (this: any // eslint-disable-line @typescript-eslint/no-explicit-any) {
          trackDisposal('MeshStandardMaterial', this);
        }), // Correctly defined dispose
      })
  );

  // Mock MeshBasicMaterial (inherits from Material)
  mockClass(
    'MeshBasicMaterial',
    (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      ..._args: any // eslint-disable-line @typescript-eslint/no-explicit-any[] // Prefixed unused args
    ) =>
// eslint-disable-next-line
      trackAllocation('MeshBasicMaterial', {
        color: { set: vi.fn(), isColor: true },
        needsUpdate: false,
        isMaterial: true,
        isMeshBasicMaterial: true,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispose: vi.fn(function (this: any // eslint-disable-line @typescript-eslint/no-explicit-any) {
          trackDisposal('MeshBasicMaterial', this);
        }), // Correctly defined dispose
      })
  );

  // Mock Scene
  mockClass(
    'Scene',
    (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      ..._args: any // eslint-disable-line @typescript-eslint/no-explicit-any[] // Prefixed unused args
    ) =>
// eslint-disable-next-line
      trackAllocation('Scene', {
        add: vi.fn(),
        remove: vi.fn(),
        children: [],
        isScene: true,
        background: null,
      })
  );

  // Mock Mesh
  mockClass(
    'Mesh',
    (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      ..._args: any // eslint-disable-line @typescript-eslint/no-explicit-any[] // Prefixed unused args
    ) =>
// eslint-disable-next-line
      trackAllocation('Mesh', {
        position: { x: 0, y: 0, z: 0, set: vi.fn() },
        rotation: { x: 0, y: 0, z: 0, set: vi.fn() },
        scale: { x: 1, y: 1, z: 1, set: vi.fn() },
        geometry: { dispose: vi.fn(), isBufferGeometry: true }, // Use mock geometry
        material: { dispose: vi.fn(), isMaterial: true }, // Use mock material
        isMesh: true,
      })
  );
}

// eslint-disable-next-line
function restoreThreeJSClasses(): void {
  const target = THREE || (globalThis as any).THREE; // Added type assertion
  if (!target) return;
  for (const className in originalThreeClasses) {
    if (target[className]) target[className] = originalThreeClasses[className];
  }
  Object.keys(originalThreeClasses).forEach((key) => delete originalThreeClasses[key]);
}

// eslint-disable-next-line
function trackAllocation<T>(type: string, obj: T): T {
  if (!memoryMonitoring.enabled) return obj;
  if (!memoryMonitoring.allocatedObjects.has(type)) memoryMonitoring.allocatedObjects.set(type, []);
  memoryMonitoring.allocatedObjects.get(type)!.push(obj);
  if (memoryMonitoring.debugMode) console.log(`[WebGL Memory] Allocated ${type}`);
  return obj;
}

// eslint-disable-next-line
function trackDisposal<T>(type: string, obj: T): void {
  if (!memoryMonitoring.enabled) return;
  if (!memoryMonitoring.disposedObjects.has(type)) memoryMonitoring.disposedObjects.set(type, []);
  memoryMonitoring.disposedObjects.get(type)!.push(obj);
  if (memoryMonitoring.debugMode) console.log(`[WebGL Memory] Disposed ${type}`);
}

// eslint-disable-next-line
function generateMemoryReport(): MemoryReport {
  const leakedObjectTypes: Record<string, number> = {};
  let totalAllocated = 0,
    totalDisposed = 0,
    overallLeakCount = 0;
// eslint-disable-next-line
  for (const [type, allocatedList] of memoryMonitoring.allocatedObjects.entries()) {
    const disposedList = memoryMonitoring.disposedObjects.get(type) || [];
    const allocatedSet = new Set(allocatedList);
    const disposedSet = new Set(disposedList);
    let leakCount = 0;
// eslint-disable-next-line
    allocatedSet.forEach((obj) => {
      if (!disposedSet.has(obj)) leakCount++;
    });
    totalAllocated += allocatedList.length;
    totalDisposed += disposedList.length;
    if (leakCount > 0) leakedObjectTypes[type] = leakCount;
  }
  const allAllocated = Array.from(memoryMonitoring.allocatedObjects.values()).flat();
  const allDisposed = new Set(Array.from(memoryMonitoring.disposedObjects.values()).flat());
  overallLeakCount = allAllocated.filter((obj) => !allDisposed.has(obj)).length;

  return {
    leakedObjectCount: overallLeakCount,
    totalAllocatedObjects: totalAllocated,
    totalDisposedObjects: totalDisposed,
    leakedObjectTypes,
  };
}

export const __testing = {
  trackAllocation,
  trackDisposal,
  generateMemoryReport,
  mockThreeJSClasses,
  restoreThreeJSClasses,
  getMemoryMonitoringState: () => memoryMonitoring,
};

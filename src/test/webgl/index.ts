/**
 * WebGL Testing System - Core Module
 * 
 * This module provides WebGL mocking capabilities for tests involving
 * Three.js and WebGL components. It helps prevent tests from hanging
 * and provides memory leak detection.
 */

// Types for memory monitoring
export interface MemoryReport {
  leakedObjectCount: number;
  totalAllocatedObjects: number;
  totalDisposedObjects: number;
  leakedObjectTypes: Record<string, number>;
}

// Mock WebGL context and renderer
let mockContext: any = null;
let memoryMonitoring = {
  enabled: false,
  allocatedObjects: new Map<string, any[]>(),
  disposedObjects: new Map<string, any[]>(),
  debugMode: false,
};

/**
 * Set up WebGL mocks for testing
 */
export function setupWebGLMocks(options: {
  monitorMemory?: boolean;
  debugMode?: boolean;
} = {}): void {
  console.log('WebGL mocks set up');
  
  // Create mock WebGL context
  mockContext = createMockWebGLContext();
  
  // Configure memory monitoring
  memoryMonitoring.enabled = options.monitorMemory ?? false;
  memoryMonitoring.debugMode = options.debugMode ?? false;
  
  // Mock document.createElement to intercept canvas creation
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string) {
    if (tagName.toLowerCase() === 'canvas') {
      const canvas = originalCreateElement.call(document, tagName) as HTMLCanvasElement;
      
      // Mock the getContext method to return our WebGL context
      const originalGetContext = canvas.getContext;
      canvas.getContext = function(contextType: string) {
        if (contextType === 'webgl' || contextType === 'webgl2' || contextType === 'experimental-webgl') {
          return mockContext;
        }
        return originalGetContext.apply(this, [contextType]);
      };
      
      return canvas;
    }
    return originalCreateElement.call(document, tagName);
  };
  
  // Mock Three.js classes
  mockThreeJSClasses();
}

/**
 * Clean up WebGL mocks and generate memory report
 */
export function cleanupWebGLMocks(): MemoryReport | null {
  console.log('WebGL mocks cleaned up');
  
  // Restore original document.createElement
  // @ts-ignore
  document.createElement = HTMLDocument.prototype.createElement;
  
  // Generate memory report
  let report: MemoryReport | null = null;
  
  if (memoryMonitoring.enabled) {
    report = generateMemoryReport();
  }
  
  // Clean up
  mockContext = null;
  memoryMonitoring.allocatedObjects.clear();
  memoryMonitoring.disposedObjects.clear();
  
  return report;
}

/**
 * Create a mock WebGL context
 */
function createMockWebGLContext(): any {
  return {
    canvas: null,
    drawingBufferWidth: 800,
    drawingBufferHeight: 600,
    
    // WebGL 1.0 methods
    createBuffer: () => ({}),
    bindBuffer: () => {},
    bufferData: () => {},
    createShader: () => ({}),
    shaderSource: () => {},
    compileShader: () => {},
    getShaderParameter: () => true,
    createProgram: () => ({}),
    attachShader: () => {},
    linkProgram: () => {},
    getProgramParameter: () => true,
    useProgram: () => {},
    getAttribLocation: () => 0,
    getUniformLocation: () => ({}),
    enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {},
    uniform1f: () => {},
    uniform1i: () => {},
    uniform2fv: () => {},
    uniform3fv: () => {},
    uniform4fv: () => {},
    uniformMatrix4fv: () => {},
    activeTexture: () => {},
    createTexture: () => trackAllocation('Texture', {}),
    bindTexture: () => {},
    texImage2D: () => {},
    texParameteri: () => {},
    clearColor: () => {},
    enable: () => {},
    disable: () => {},
    blendFunc: () => {},
    depthFunc: () => {},
    clear: () => {},
    drawArrays: () => {},
    drawElements: () => {},
    
    // WebGL 2.0 methods
    createVertexArray: () => ({}),
    bindVertexArray: () => {},
    
    // Extensions
    getExtension: () => ({
      drawBuffersWEBGL: () => {},
      drawArraysInstancedANGLE: () => {},
      drawElementsInstancedANGLE: () => {},
      createVertexArrayOES: () => ({}),
      bindVertexArrayOES: () => {},
    }),
  };
}

/**
 * Mock Three.js classes to prevent actual WebGL usage
 */
function mockThreeJSClasses(): void {
  // Mock global WebGLRenderer if it exists
  if (globalThis.WebGLRenderer) {
    const originalWebGLRenderer = globalThis.WebGLRenderer;
    // @ts-ignore
    globalThis.WebGLRenderer = function(...args: any[]) {
      const instance = trackAllocation('WebGLRenderer', {
        domElement: document.createElement('canvas'),
        render: () => {},
        setSize: () => {},
        setClearColor: () => {},
        clear: () => {},
        dispose: function() {
          trackDisposal('WebGLRenderer', this);
        },
      });
      return instance;
    };
  }
  
  // Mock various Three.js objects that get created during tests
  // Mocking is done through ES modules, so we just register the mocks for monitoring
  registerThreeJSMocks();
}

/**
 * Register Three.js mocks for monitoring
 */
function registerThreeJSMocks(): void {
  // These are registered for memory tracking in real implementations
  // In our simplified example, we're just setting up the structure
}

/**
 * Track allocation of an object for memory leak detection
 */
function trackAllocation<T>(type: string, obj: T): T {
  if (!memoryMonitoring.enabled) return obj;
  
  if (!memoryMonitoring.allocatedObjects.has(type)) {
    memoryMonitoring.allocatedObjects.set(type, []);
  }
  
  memoryMonitoring.allocatedObjects.get(type)!.push(obj);
  
  if (memoryMonitoring.debugMode) {
    console.log(`[WebGL Memory] Allocated ${type}`);
  }
  
  return obj;
}

/**
 * Track disposal of an object for memory leak detection
 */
function trackDisposal<T>(type: string, obj: T): void {
  if (!memoryMonitoring.enabled) return;
  
  if (!memoryMonitoring.disposedObjects.has(type)) {
    memoryMonitoring.disposedObjects.set(type, []);
  }
  
  memoryMonitoring.disposedObjects.get(type)!.push(obj);
  
  if (memoryMonitoring.debugMode) {
    console.log(`[WebGL Memory] Disposed ${type}`);
  }
}

/**
 * Generate a memory report for detecting leaks
 */
function generateMemoryReport(): MemoryReport {
  const leakedObjectTypes: Record<string, number> = {};
  let totalAllocated = 0;
  let totalDisposed = 0;
  
  // Calculate leaks for each object type
  for (const [type, allocatedObjects] of memoryMonitoring.allocatedObjects.entries()) {
    const disposedObjects = memoryMonitoring.disposedObjects.get(type) || [];
    const leakCount = allocatedObjects.length - disposedObjects.length;
    
    totalAllocated += allocatedObjects.length;
    totalDisposed += disposedObjects.length;
    
    if (leakCount > 0) {
      leakedObjectTypes[type] = leakCount;
    }
  }
  
  return {
    leakedObjectCount: totalAllocated - totalDisposed,
    totalAllocatedObjects: totalAllocated,
    totalDisposedObjects: totalDisposed,
    leakedObjectTypes,
  };
}

// Export for testing
export const __testing = {
  trackAllocation,
  trackDisposal,
  generateMemoryReport,
};

/* eslint-disable */
/**
 * WebGL Testing Framework - Comprehensive Neural Implementation
 * 
 * Provides a quantum-level architecture for testing WebGL/Three.js components
 * with architectural elegance and mathematical precision.
 */

import { vi } from 'vitest';
import { setupWebGLMocks as setupMocks, cleanupWebGLMocks as cleanupMocks } from './mock-webgl';

// Re-export core WebGL mocking functionality with enhanced capabilities
// eslint-disable-next-line
export function setupWebGLMocks(options = { monitorMemory: false, debugMode: false }) {
  const mockContext = setupMocks();
  
  // Additional configuration based on options
  if (options.monitorMemory) {
    // Enable memory tracking for neural visualization
    global.__WEBGL_MEMORY_TRACKING__ = {
      allocatedObjects: new Set(),
      disposedObjects: new Set(),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      trackObject: (obj: any // eslint-disable-line @typescript-eslint/no-explicit-any) => {
        global.__WEBGL_MEMORY_TRACKING__.allocatedObjects.add(obj);
      },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      untrackObject: (obj: any // eslint-disable-line @typescript-eslint/no-explicit-any) => {
        global.__WEBGL_MEMORY_TRACKING__.allocatedObjects.delete(obj);
        global.__WEBGL_MEMORY_TRACKING__.disposedObjects.add(obj);
      }
    };
  }

  return mockContext;
}

// Enhanced cleanup with memory leak detection
// eslint-disable-next-line
export function cleanupWebGLMocks() {
  cleanupMocks();
  
  // Return memory tracking report if enabled
  if (global.__WEBGL_MEMORY_TRACKING__) {
    const report = {
      leakedObjectCount: global.__WEBGL_MEMORY_TRACKING__.allocatedObjects.size,
      disposedObjectCount: global.__WEBGL_MEMORY_TRACKING__.disposedObjects.size,
      leakedObjects: Array.from(global.__WEBGL_MEMORY_TRACKING__.allocatedObjects)
    };
    
    // Clean up tracking
    delete global.__WEBGL_MEMORY_TRACKING__;
    
    return report;
  }
  
  return null;
}

// Export the utility functions and class mocks
export * from './mock-webgl';
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
    // Define the structure for memory tracking on globalThis
    (globalThis as any).__WEBGL_MEMORY_TRACKING__ = {
      allocatedObjects: new Set<any>(), // Use Set<any> for simplicity
      disposedObjects: new Set<any>(),
      trackObject: (obj: any) => {
        (globalThis as any).__WEBGL_MEMORY_TRACKING__?.allocatedObjects.add(obj);
      },
      untrackObject: (obj: any) => {
        if ((globalThis as any).__WEBGL_MEMORY_TRACKING__) {
          (globalThis as any).__WEBGL_MEMORY_TRACKING__.allocatedObjects.delete(obj);
          (globalThis as any).__WEBGL_MEMORY_TRACKING__.disposedObjects.add(obj);
        }
      },
    };
  }

  return mockContext;
}

// Enhanced cleanup with memory leak detection
// eslint-disable-next-line
export function cleanupWebGLMocks() {
  cleanupMocks();

  // Return memory tracking report if enabled, using globalThis
  const trackingData = (globalThis as any).__WEBGL_MEMORY_TRACKING__;
  if (trackingData) {
    const report = {
      leakedObjectCount: trackingData.allocatedObjects.size,
      disposedObjectCount: trackingData.disposedObjects.size,
      leakedObjects: Array.from(trackingData.allocatedObjects),
    };

    // Clean up tracking
    // Clean up tracking from globalThis
    delete (globalThis as any).__WEBGL_MEMORY_TRACKING__;

    return report;
  }

  return null;
}

// Export the utility functions and class mocks
export * from './mock-webgl';

/**
 * WebGL Testing Setup
 * 
 * This file provides utilities for setting up WebGL mocks in tests.
 * It's designed to work with the WebGL mocking system defined in index.ts.
 */

import { setupWebGLMocks, cleanupWebGLMocks, MemoryReport } from './index';
import type { SetupOptions } from './types';

/**
 * Set up WebGL mocks for a test suite
 */
export function setupWebGLForTest(options: SetupOptions = {}): void {
  setupWebGLMocks({
    monitorMemory: options.monitorMemory ?? true,
    debugMode: options.debugMode ?? false,
  });

  // Apply neural controller mocks if requested
  if (options.useNeuralControllerMocks) {
    try {
      // Dynamic import to avoid dependency when not needed
      import('./examples/neural-controllers-mock').then(({ applyNeuralControllerMocks }) => {
        if (typeof applyNeuralControllerMocks === 'function') {
          applyNeuralControllerMocks();
        }
      });
    } catch (error) {
      console.warn('Failed to load neural controller mocks:', error);
    }
  }
}

/**
 * Clean up WebGL mocks after a test suite
 */
export function cleanupWebGLAfterTest(options: { failOnLeak?: boolean } = {}): MemoryReport | null {
  // Clean up neural controller mocks if they were applied
  try {
    import('./examples/neural-controllers-mock').then(({ cleanupNeuralControllerMocks }) => {
      if (typeof cleanupNeuralControllerMocks === 'function') {
        cleanupNeuralControllerMocks();
      }
    });
  } catch (error) {
    // Ignore errors during cleanup
  }

  // Clean up WebGL mocks and report memory leaks
  const report = cleanupWebGLMocks();

  // Handle memory leaks
  if (report && report.leakedObjectCount > 0) {
    const message = `Memory leak detected: ${report.leakedObjectCount} objects not properly disposed`;
    console.warn(`⚠️ ${message}`);
    console.warn('Leaked objects by type:', JSON.stringify(report.leakedObjectTypes, null, 2));

    // Throw an error if requested
    if (options.failOnLeak) {
      throw new Error(message);
    }
  }

  return report;
}

/**
 * Run a test with WebGL mocks
 * 
 * This utility combines setup and cleanup in a single function,
 * which is useful for individual tests that need WebGL mocking.
 */
export async function runTestWithWebGL(
  testFn: () => void | Promise<void>,
  options: SetupOptions & { failOnLeak?: boolean } = {}
): Promise<MemoryReport | null> {
  // Set up WebGL mocks
  setupWebGLForTest(options);

  try {
    // Run the test
    await testFn();
  } finally {
    // Clean up WebGL mocks
    return cleanupWebGLAfterTest({ failOnLeak: options.failOnLeak });
  }
}

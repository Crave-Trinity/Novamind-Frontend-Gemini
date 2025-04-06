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

  // Neural controller mocks are now applied statically via top-level vi.mock
  // in neural-controllers-mock.ts. We just need to ensure that file is imported
  // somewhere in the test setup process (e.g., in src/test/setup.ts).
  // The conditional logic based on options.useNeuralControllerMocks is removed here,
  // assuming the mocks should apply if the setupWebGLForTest is called.
  // If finer control is needed, conditional imports in setup.ts might be required.
}

/**
 * Clean up WebGL mocks after a test suite
 */
export function cleanupWebGLAfterTest(options: { failOnLeak?: boolean } = {}): MemoryReport | null {
  // Cleanup for neural controller mocks is handled automatically by Vitest
  // as vi.mock calls are now top-level.

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
    // Conditionally pass failOnLeak only if it's defined, due to exactOptionalPropertyTypes
    return cleanupWebGLAfterTest(
      options.failOnLeak !== undefined ? { failOnLeak: options.failOnLeak } : {}
    );
  }
}

// Enhanced Vitest configuration with timeouts to prevent hanging
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Add global timeout to prevent tests from hanging indefinitely
    testTimeout: 10000,
    // Stop on first test failure
    bail: 1,
    // Use more granular teardown
    teardownTimeout: 5000,
    hookTimeout: 10000,
    // Run with 1 worker to reduce resource contention
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    // Minimize browser global mocks that could cause issues
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
});
/**
 * WebGL Testing Configuration for Vitest
 * 
 * This configuration extends the unified config with WebGL-specific setup.
 */
import { defineConfig, mergeConfig } from 'vitest/config';
import unifiedConfig from './vitest.config.unified.ts';

export default mergeConfig(unifiedConfig, defineConfig({
  test: {
    name: 'webgl',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/webgl/test-setup.js'],
    testTimeout: 60000,
    ui: false, // Disable UI to avoid dependency issues
    environmentOptions: {
      jsdom: {
        resources: 'usable'
      }
    },
  }
}));

/**
 * NOVAMIND Neural Architecture
 * Minimal Testing Configuration with Quantum Precision
 * 
 * This configuration provides a minimal setup for testing with Vitest,
 * focusing on stability and reliability rather than comprehensive features.
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Core aliases only
      '@': resolve(__dirname, 'src'),
      '@domain': resolve(__dirname, 'src/domain'),
      '@application': resolve(__dirname, 'src/application'),
      '@presentation': resolve(__dirname, 'src/presentation'),
      '@infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@test': resolve(__dirname, 'src/test'),
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [], // No setup files to avoid potential conflicts
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    reporters: ['verbose'],
    deps: {
      // Minimal dependency handling
      inline: [/^(?!.*vitest).*$/] // Inline all dependencies except vitest
    },
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**/*',
        'src/**/*.d.ts',
      ],
      all: false, // Don't require all files to be covered
      statements: 0,
      functions: 0,
      branches: 0,
      lines: 0
    },
    // Simple pool configuration
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true // Use a single thread for simplicity
      }
    }
  }
});

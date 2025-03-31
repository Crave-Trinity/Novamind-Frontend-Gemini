/**
 * NOVAMIND Neural Architecture
 * Minimal Vitest Configuration with Quantum Precision
 * 
 * This configuration provides a streamlined setup for testing with Vitest,
 * focusing on stability and reliability rather than comprehensive features.
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Core aliases with quantum precision
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
    setupFiles: ['./src/test/minimal-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    reporters: ['verbose'],
    deps: {
      // External dependencies to avoid conflicts with clinical precision
      inline: [
        /solid-js/,
      ],
      // External dependencies to avoid mocking with quantum precision
      external: [
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        '@react-three/a11y'
      ]
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**/*',
        'src/**/*.d.ts',
      ],
      // Disable coverage thresholds for initial testing with clinical precision
      all: false,
      statements: 0,
      functions: 0,
      branches: 0,
      lines: 0
    },
    // Simple pool configuration with quantum precision
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    // Increase timeout for stability with clinical precision
    testTimeout: 30000,
    // Avoid hanging with quantum precision
    hookTimeout: 30000,
    // Force exit after tests complete with mathematical elegance
    forceExit: true
  }
});

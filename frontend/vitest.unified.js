/**
 * NOVAMIND Neural Architecture
 * Unified Testing Configuration
 * 
 * This configuration achieves quantum-level precision for testing Three.js visualization
 * components without triggering multiple instance warnings or requiring a full build.
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      // Enhanced neural-safe path resolution with quantum precision
      loose: true, // Allow more flexible path resolution
    }),
  ],
  resolve: {
    alias: {
      // Critical: Ensure a single Three.js instance with quantum precision
      'three': resolve(__dirname, 'node_modules/three'),
      // Neural Architecture Path Aliases with cross-environment compatibility
      '@domain': resolve(__dirname, 'src/domain'),
      '@application': resolve(__dirname, 'src/application'),
      '@presentation': resolve(__dirname, 'src/presentation'),
      '@infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@test': resolve(__dirname, 'src/test'),
      '@': resolve(__dirname, 'src'),
      // Atomic Design Component Aliases
      '@atoms': resolve(__dirname, 'src/presentation/components/atoms'),
      '@molecules': resolve(__dirname, 'src/presentation/components/molecules'),
      '@organisms': resolve(__dirname, 'src/presentation/components/organisms'),
      '@templates': resolve(__dirname, 'src/presentation/components/templates'),
      '@pages': resolve(__dirname, 'src/presentation/pages'),
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/neural-setup.ts', './src/test/jest-dom-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    reporters: ['verbose'],
    deps: {
      // Use the optimizer for neural-safe module handling with clinical precision
      optimizer: {
        web: {
          include: ['@react-three/fiber', '@react-three/drei', 'three']
        }
      }
    },
    coverage: {
      provider: 'v8', // Use V8 provider for improved neural-safe instrumentation
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**/*',
        'src/**/*.d.ts',
        'src/infrastructure/api/mocks/**/*'
      ],
      all: true, // Required for accurate neural coverage metrics with quantum precision
      instrument: true, // Critical for proper neural instrumentation
      statements: 0,
      functions: 0,
      branches: 0,
      lines: 0,
      reportsDirectory: './coverage',
      clean: true, // Clean previous coverage artifacts with quantum precision
      skipFull: false // Don't skip files with full coverage for neural precision
    },
    // Single-threaded execution for neural-safe instrumentation with quantum precision
    pool: 'forks', // Use forks for stable coverage instrumentation
    poolOptions: {
      forks: {
        isolate: true, // Isolate test contexts for neural precision
      }
    },
    // Enhanced error reporting for neural-safe debugging
    onConsoleLog(log, type) {
      if (type === 'stderr' && log.includes('Error:')) {
        console.error(`Neural Test Error: ${log}`);
      }
      return false; // Show all logs
    }
  }
});

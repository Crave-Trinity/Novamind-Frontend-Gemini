/**
 * Unified Vitest Configuration
 * 
 * This is the canonical configuration for all tests in the Novamind frontend.
 * It replaces all legacy configurations with a single source of truth.
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react() as any,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@atoms': path.resolve(__dirname, './src/presentation/atoms'),
      '@molecules': path.resolve(__dirname, './src/presentation/molecules'),
      '@organisms': path.resolve(__dirname, './src/presentation/organisms'),
      '@templates': path.resolve(__dirname, './src/presentation/templates'),
      '@pages': path.resolve(__dirname, './src/presentation/pages'),
      '@services': path.resolve(__dirname, './src/infrastructure/services'),
      '@hooks': path.resolve(__dirname, './src/application/hooks'),
      '@utils': path.resolve(__dirname, './src/application/utils'),
      '@contexts': path.resolve(__dirname, './src/application/contexts'),
      '@types': path.resolve(__dirname, './src/domain/types'),
      '@models': path.resolve(__dirname, './src/domain/models'),
      '@assets': path.resolve(__dirname, './src/presentation/assets'),
      '@shaders': path.resolve(__dirname, './src/shaders'),
      '@store': path.resolve(__dirname, './src/application/store'),
      '@styles': path.resolve(__dirname, './src/presentation/styles'),
      '@api': path.resolve(__dirname, './src/infrastructure/api'),
      '@config': path.resolve(__dirname, './src/infrastructure/config'),
      '@constants': path.resolve(__dirname, './src/domain/constants'),
      '@validation': path.resolve(__dirname, './src/domain/validation'),
      '@visualizations': path.resolve(__dirname, './src/presentation/visualizations'),
      '@test': path.resolve(__dirname, './src/test'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/test/setup.unified.ts',
    ],
    include: ['src/**/*.{test,spec,unified.test}.{ts,tsx}'],
    exclude: ['node_modules', '.git', 'dist'],
    testTimeout: 15000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    passWithNoTests: true,
    bail: 1, // Stop after first test failure
    poolOptions: {
      threads: {
        singleThread: true, // Run in single thread to prevent resource contention
      },
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    isolate: true,
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
        'src/**/*.types.ts',
        'src/vite-env.d.ts',
        'src/**/*.stories.tsx',
        'src/**/*.styles.ts',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      }
    },
  },
});
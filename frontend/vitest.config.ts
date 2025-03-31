/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * NOVAMIND Neural Testing Framework
 * Quantum-precise test configuration with clinical-grade reliability
 */
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      root: __dirname,
      projects: [path.resolve(__dirname, './tsconfig.json')]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@test': path.resolve(__dirname, './src/test'),
      // Precise atom component resolution
      '@presentation/atoms/Badge': path.resolve(__dirname, './src/presentation/atoms/Badge.tsx'),
      '@presentation/atoms/Button': path.resolve(__dirname, './src/presentation/atoms/Button.tsx'),
      '@presentation/atoms/Card': path.resolve(__dirname, './src/presentation/atoms/Card.tsx'),
      '@presentation/atoms/Tooltip': path.resolve(__dirname, './src/presentation/atoms/Tooltip.tsx'),
      '@presentation/atoms/Tabs': path.resolve(__dirname, './src/presentation/atoms/Tabs.tsx'),
      '@presentation/atoms/Progress': path.resolve(__dirname, './src/presentation/atoms/Progress.tsx'),
      '@presentation/atoms/ScrollArea': path.resolve(__dirname, './src/presentation/atoms/ScrollArea.tsx'),
      'lucide-react': path.resolve(__dirname, './node_modules/lucide-react'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.git', 'dist'],
    testTimeout: 20000,
    pool: 'forks', // Use forks for better isolation between tests
    isolate: true, // Ensure tests don't affect each other
    mockReset: true, // Reset mocks between tests
    restoreMocks: true, // Restore original behavior after mocking
    clearMocks: true, // Clear all mocks between tests
    testTransformMode: {
      web: ['.[jt]sx?$'],
    },
    // Thread configuration is managed by the pool setting
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

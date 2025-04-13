/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// Project root definition for consistent path resolution
const projectRoot = '/Users/ray/Desktop/GITHUB/Novamind-Frontend';

export default defineConfig({
  plugins: [
    react(), // Standard React plugin
    tsconfigPaths(), // Use paths from tsconfig.json
  ],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src'),
      '@domain': path.resolve(projectRoot, 'src/domain'),
      '@application': path.resolve(projectRoot, 'src/application'),
      '@infrastructure': path.resolve(projectRoot, 'src/infrastructure'),
      '@presentation': path.resolve(projectRoot, 'src/presentation'),
      '@shared': path.resolve(projectRoot, 'src/shared'),
      '@atoms': path.resolve(projectRoot, 'src/presentation/atoms'),
      '@molecules': path.resolve(projectRoot, 'src/presentation/molecules'),
      '@organisms': path.resolve(projectRoot, 'src/presentation/organisms'),
      '@templates': path.resolve(projectRoot, 'src/presentation/templates'),
      '@pages': path.resolve(projectRoot, 'src/presentation/pages'),
      '@hooks': path.resolve(projectRoot, 'src/application/hooks'),
      '@contexts': path.resolve(projectRoot, 'src/application/contexts'),
      '@providers': path.resolve(projectRoot, 'src/application/providers'),
      '@stores': path.resolve(projectRoot, 'src/application/stores'),
      '@services': path.resolve(projectRoot, 'src/application/services'),
      '@api': path.resolve(projectRoot, 'src/infrastructure/api'),
      '@clients': path.resolve(projectRoot, 'src/infrastructure/clients'),
      '@utils': path.resolve(projectRoot, 'src/shared/utils'),
      '@constants': path.resolve(projectRoot, 'src/shared/constants'),
      '@config': path.resolve(projectRoot, 'config'),
      '@test': path.resolve(projectRoot, 'test'),
      '@public': path.resolve(projectRoot, 'public'),
      
      // Special module resolutions for compatibility
      './node_modules/react-dnd/dist/index.js': path.resolve(
        projectRoot,
        'node_modules/react-dnd/dist/cjs/index.js'
      ),
      './node_modules/react-dnd-html5-backend/dist/index.js': path.resolve(
        projectRoot,
        'node_modules/react-dnd-html5-backend/dist/cjs/index.js'
      ),
      './web-workers/connectivity.worker.js?worker': path.resolve(
        projectRoot,
        'src/infrastructure/workers/connectivity.worker.ts?worker'
      ),
    },
  },
  test: {
    // --- Core Settings ---
    globals: true, // Enable global test APIs (describe, it, etc)
    environment: 'jsdom', // Use JSDOM for browser environment simulation
    
    // Mock handling options
    mockReset: true, // Reset mocks between tests
    restoreMocks: true, // Restore original implementations after tests
    clearMocks: true, // Clear mock call history between tests
    
    // Timeout settings
    testTimeout: 15000, // Default timeout per test
    hookTimeout: 15000, // Default timeout for hooks
    
    // --- Setup Files ---
    // Order is critical! jest-dom must be first, then core setup
    setupFiles: [
      './src/test/setup.jest-dom.ts', // Load Jest-DOM matchers FIRST
      './src/test/setup.core.ts',     // Then load core setup (browser API mocks, etc)
    ],
    
    // --- Coverage Configuration ---
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**/*',
        'src/main.tsx',
        'src/**/index.ts',
        'src/**/types.ts',
        'src/vite-env.d.ts',
      ],
      all: true, // Report coverage on all files, not just tested ones
    },
    
    // --- File Patterns ---
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'test/**/*.test.{ts,tsx}',
    ],
    
    exclude: [
      'node_modules/**/*',
      'dist/**/*',
      'coverage/**/*',
      'config/**/*', // Exclude config directory itself
      'test-puppeteer/**/*', // Puppeteer tests have separate runner
    ],
  },
});
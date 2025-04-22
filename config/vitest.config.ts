/// <reference types="vitest" />
/*
 * Monkey-patch tinypool at config load time to prevent stack overflow on worker termination.
 */
import * as tinypool from 'tinypool';
if ((tinypool as any).ProcessWorker?.prototype) {
  (tinypool as any).ProcessWorker.prototype.terminate = () => Promise.resolve();
}
if ((tinypool as any).ThreadPool?.prototype?._removeWorker) {
  (tinypool as any).ThreadPool.prototype._removeWorker = () => {};
}
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// Project root definition for consistent path resolution
const projectRoot = path.resolve(__dirname, '..'); // Define project root dynamically

export default defineConfig({
  plugins: [
    // Stub out tinypool at the Vite resolver level to override shutdown before transforms
    {
      name: 'stub-tinypool',
      enforce: 'pre',
      resolveId(source) {
        if (source === 'tinypool')
          return path.resolve(__dirname, 'tinypool-stub.ts');
        return null;
      },
    },
    react(), // React plugin for JSX support
    tsconfigPaths(), // Use paths from tsconfig.json
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'], // Resolve extensions properly
    alias: {
      // Core path aliases
      '@': path.resolve(projectRoot, 'src'),
      '@domain': path.resolve(projectRoot, 'src/domain'),
      '@application': path.resolve(projectRoot, 'src/application'),
      '@infrastructure': path.resolve(projectRoot, 'src/infrastructure'),
      '@presentation': path.resolve(projectRoot, 'src/presentation'),
      '@shared': path.resolve(projectRoot, 'src/shared'),
      
      // Component path aliases
      '@atoms': path.resolve(projectRoot, 'src/presentation/atoms'),
      '@molecules': path.resolve(projectRoot, 'src/presentation/molecules'),
      '@organisms': path.resolve(projectRoot, 'src/presentation/organisms'),
      '@templates': path.resolve(projectRoot, 'src/presentation/templates'),
      '@pages': path.resolve(projectRoot, 'src/presentation/pages'),
      
      // Feature path aliases
      '@hooks': path.resolve(projectRoot, 'src/application/hooks'),
      '@contexts': path.resolve(projectRoot, 'src/application/contexts'),
      '@providers': path.resolve(projectRoot, 'src/application/providers'),
      '@stores': path.resolve(projectRoot, 'src/application/stores'),
      '@services': path.resolve(projectRoot, 'src/application/services'),
      '@api': path.resolve(projectRoot, 'src/infrastructure/api'),
      '@clients': path.resolve(projectRoot, 'src/infrastructure/clients'),
      '@utils': path.resolve(projectRoot, 'src/shared/utils'),
      '@constants': path.resolve(projectRoot, 'src/shared/constants'),
      
      // Other path aliases
      '@config': path.resolve(projectRoot, 'config'),
      '@test': path.resolve(projectRoot, 'test'),
      '@public': path.resolve(projectRoot, 'public'),
      
      // Module resolutions that need special handling
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
    // Disable worker threads and parallel file execution to avoid tinypool stack issues
    threads: false,
    fileParallelism: false,
    // Core settings
    globals: true, // Enable global test APIs
    environment: 'jsdom', // Use JSDOM for browser environment
    
    // Mock behavior configuration
    mockReset: true, // Reset mocks between tests
    restoreMocks: true, // Restore original implementations after tests
    clearMocks: true, // Clear mock call history between tests
    
    // Timeout configuration
    testTimeout: 20000, // Increase default timeout per test
    hookTimeout: 20000, // Increase default timeout for hooks
    
    // Single setup file that properly includes all needed functionality
    setupFiles: [
      './src/test/setup.ts', // Use the canonical setup file
    ],
    
    // Coverage configuration
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
    
    // File patterns
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'test/**/*.test.{ts,tsx}',
    ],
    
    exclude: [
      'node_modules/**/*',
      'dist/**/*',
      'coverage/**/*',
      'config/**/*',
      'test-puppeteer/**/*', // Puppeteer tests need separate runner
    ],
  },
});
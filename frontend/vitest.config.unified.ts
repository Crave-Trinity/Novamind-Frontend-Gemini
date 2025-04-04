/**
 * Unified Vitest Configuration for Novamind Digital Twin
 * 
 * This configuration provides enhanced settings for testing with:
 * - Tailwind CSS mocking support
 * - Proper timeouts to prevent hanging tests
 * - Improved error handling and reporting
 * - Consistent module resolution
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react() as any],
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
      '@hooks': path.resolve(__dirname, './src/application/hooks'),
      '@contexts': path.resolve(__dirname, './src/application/contexts'),
      '@providers': path.resolve(__dirname, './src/application/providers'),
      '@services': path.resolve(__dirname, './src/infrastructure/services'),
      '@api': path.resolve(__dirname, './src/infrastructure/api'),
      '@utils': path.resolve(__dirname, './src/application/utils'),
      '@types': path.resolve(__dirname, './src/domain/types'),
      '@models': path.resolve(__dirname, './src/domain/models'),
      '@test': path.resolve(__dirname, './src/test'),
      '@shaders': path.resolve(__dirname, './src/presentation/shaders')
    }
  },
  test: {
    // Use enhanced JSDOM environment
    environment: 'jsdom',
    
    // Only use globals from DOM and Vitest APIs
    globals: true,
    
    // Automatically include setup file
    setupFiles: ['./src/test/setup.ts'],
    
    // Global timeouts to prevent hanging tests
    testTimeout: 10000, // 10 seconds
    hookTimeout: 10000,
    
    // Thread configuration to balance performance
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // Enhanced error handling
    onConsoleLog(log) {
      // Filter out certain expected warnings
      if (log.includes('Warning: ReactDOM.render is no longer supported')) {
        return false;
      }
      // Return void for all other logs (not false)
      return;
    },
    
    // Enhanced output
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-reports/index.html'
    },
    
    // Code coverage config
    coverage: {
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './test-reports/coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.{ts,tsx}',
        '**/test/**',
      ]
    },
    
    // Handle specific test filtering
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**', 
      '**/dist/**',
      '**/.{idea,git,cache,output}/**'
    ],
    
    // Auto-exit on test completion to prevent hanging
    watch: false,
    
    // Improved isolation for tests
    isolate: true,
    
    // Cleanup after tests
    restoreMocks: true,
    clearMocks: true,
    
    // Improved error messages
    dangerouslyIgnoreUnhandledErrors: false,
    
    // Improved performance for large test suites
    bail: 5, // Stop after 5 failures
    
    // Improved debugging
    logHeapUsage: true,
  }
});

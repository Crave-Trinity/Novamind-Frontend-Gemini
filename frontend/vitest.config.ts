/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * NOVAMIND Testing Framework
 * Pure TypeScript-only test configuration with ESM modules
 */
export default defineConfig({
  plugins: [
    tsconfigPaths({ // Restore plugin for general alias resolution
      root: __dirname,
      projects: [path.resolve(__dirname, './tsconfig.json')]
    }),
    react() as any,
  ],
  // optimizeDeps removed
  // Removed explicit resolve.alias for 'three'. Relying on automocking.
  test: {
    globals: true,
    environment: 'jsdom',  // MUST BE JSDOM
    setupFiles: [
      // 'tsconfig-paths/register',     // Removed: Handled by vite-tsconfig-paths plugin
      './src/test/textencoder-fix.ts',
      './src/test/url-fix.ts',
      './src/test/setup.ts'
    ],
    include: ['src/**/*.{test,spec,type-test,runtime.test,minimal.test}.{ts,tsx}'], // Added minimal.test and runtime.test
    exclude: ['node_modules', '.git', 'dist'],
    testTimeout: 40000, // Increased timeout to 40 seconds
    // Use newer server.deps syntax
    // Explicitly inline contexts to potentially resolve module issues in test env
    server: {
      deps: { // This is server.deps
        inline: [
          // Add pattern for contexts or specific file if needed
          // /src\/contexts\//, // Keep commented out unless needed for context issues
          // 'three', // Removed to test automocking without forced inlining
          // '@react-three/fiber', // Removed
          // '@react-three/drei', // Removed
        ]
      }
      // experimentalOptimizer removed from server config
    },
    // deps object removed from test config

    // Ensure proper isolation and cleanup
    isolate: true,
    // Correct placement for deps is directly under the 'test' object
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
    // deps object removed from here, will be placed at top level
  },
});

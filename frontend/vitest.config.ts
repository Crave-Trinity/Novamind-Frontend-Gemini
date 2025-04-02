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
    tsconfigPaths({ // Run tsconfigPaths before react plugin
      root: __dirname,
      projects: [path.resolve(__dirname, './tsconfig.json')]
    }),
    react() as any,
  ],
  // Removed manual resolve.alias block. Relying on vite-tsconfig-paths plugin.
  test: {
    globals: true,
    environment: 'jsdom',  // MUST BE JSDOM
    setupFiles: [
      'tsconfig-paths/register',        // Attempt runtime path registration here
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
      deps: {
        inline: [
          // Add pattern for contexts or specific file if needed
          /src\/contexts\//,
        ]
      }
    },
    
    // Ensure proper isolation and cleanup
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

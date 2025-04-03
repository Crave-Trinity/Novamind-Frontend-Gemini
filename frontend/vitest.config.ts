/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths'; // Enable plugin

/**
 * NOVAMIND Testing Framework
 * Pure TypeScript-only test configuration with ESM modules
 */
export default defineConfig({
  plugins: [
    tsconfigPaths(), // Add the plugin instance
    react() as any,
  ],
  // Remove the manual resolve.alias block, tsconfigPaths handles it
  test: {
    globals: true,
    environment: 'jsdom',  // MUST BE JSDOM
    setupFiles: [ // Keep setup files uncommented
      './src/test/setup.ts',
      // 'tsconfig-paths/register',
      './src/test/textencoder-fix.ts',
      './src/test/url-fix.ts'
    ],
    include: ['src/**/*.{test,spec,type-test,runtime.test,minimal.test}.{ts,tsx}'],
    exclude: ['node_modules', '.git', 'dist'],
    testTimeout: 40000,
    // server: { // Keep server block commented out
    //   deps: {
    //     inline: [
    //       'three',
    //       '@react-three/fiber',
    //       '@react-three/drei',
    //     ]
    //   }
    // },
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

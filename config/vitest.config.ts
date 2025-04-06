/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
// import { resolve } from 'path'; // Removed unused import TS6133

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__mocks__/*',
        '**/test/**',
      ],
    },
    testTimeout: 20000,
    hookTimeout: 20000,
    maxConcurrency: 10,
    sequence: {
      shuffle: true,
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './test-reports/junit.xml',
    },
  },
}); 
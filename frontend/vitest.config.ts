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
    react() as any, // Cast to bypass type mismatch
    tsconfigPaths({
      root: __dirname,
      projects: [path.resolve(__dirname, './tsconfig.json')]
    }) as any // Cast to bypass type mismatch
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
    environment: 'jsdom',  // MUST BE JSDOM
    setupFiles: [
      './src/test/textencoder-fix.ts',  // MUST BE FIRST
      './src/test/url-fix.ts',          // URL fix second
      './src/test/setup.ts'             // Regular setup last
    ],
    include: ['src/**/*.{test,spec,type-test,runtime.test,minimal.test}.{ts,tsx}'], // Added minimal.test and runtime.test
    exclude: ['node_modules', '.git', 'dist'],
    testTimeout: 20000,
    
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

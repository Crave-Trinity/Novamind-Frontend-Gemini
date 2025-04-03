/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
// import tsconfigPaths from 'vite-tsconfig-paths'; // Disabled plugin import

/**
 * NOVAMIND Testing Framework
 * Pure TypeScript-only test configuration with ESM modules
 */
export default defineConfig({
  plugins: [
    react() as any,
  ],
  resolve: { // Add explicit aliases as per documentation
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
      '@services': path.resolve(__dirname, './src/infrastructure/services'), // Adjusted based on likely structure
      '@hooks': path.resolve(__dirname, './src/application/hooks'),
      '@utils': path.resolve(__dirname, './src/application/utils'), // Assuming utils are in application
      '@contexts': path.resolve(__dirname, './src/application/contexts'),
      '@types': path.resolve(__dirname, './src/domain/types'),
      '@models': path.resolve(__dirname, './src/domain/models'),
      '@assets': path.resolve(__dirname, './src/presentation/assets'), // Assuming assets are presentation
      '@shaders': path.resolve(__dirname, './src/shaders'), // Assuming shaders are top-level src
      '@store': path.resolve(__dirname, './src/application/store'), // Assuming store is application
      '@styles': path.resolve(__dirname, './src/presentation/styles'), // Assuming styles are presentation
      '@api': path.resolve(__dirname, './src/infrastructure/api'),
      '@config': path.resolve(__dirname, './src/infrastructure/config'), // Assuming config is infra
      '@constants': path.resolve(__dirname, './src/domain/constants'), // Assuming constants are domain
      '@validation': path.resolve(__dirname, './src/domain/validation'), // Assuming validation is domain
      '@visualizations': path.resolve(__dirname, './src/presentation/visualizations'), // Assuming visualizations are presentation
      '@test': path.resolve(__dirname, './src/test'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',  // MUST BE JSDOM
    setupFiles: [ // Keep setup files uncommented
      './src/test/setup.ts',
      // 'tsconfig-paths/register', // Disable direct registration
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

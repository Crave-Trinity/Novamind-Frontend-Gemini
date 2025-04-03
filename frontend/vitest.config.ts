/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
// import tsconfigPaths from 'vite-tsconfig-paths'; // Keep plugin disabled

/**
 * NOVAMIND Testing Framework
 * Pure TypeScript-only test configuration with ESM modules
 */
export default defineConfig({
  plugins: [
    // tsconfigPaths removed
    react() as any,
  ],
  resolve: { // Restore manual alias block
    alias: [
      // Manually define all aliases from tsconfig.json
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@domain', replacement: path.resolve(__dirname, 'src/domain') },
      { find: '@application', replacement: path.resolve(__dirname, 'src/application') },
      { find: '@infrastructure', replacement: path.resolve(__dirname, 'src/infrastructure') },
      { find: '@presentation', replacement: path.resolve(__dirname, 'src/presentation') },
      { find: '@atoms', replacement: path.resolve(__dirname, 'src/presentation/atoms') },
      { find: '@molecules', replacement: path.resolve(__dirname, 'src/presentation/molecules') },
      { find: '@organisms', replacement: path.resolve(__dirname, 'src/presentation/organisms') },
      { find: '@templates', replacement: path.resolve(__dirname, 'src/presentation/templates') },
      { find: '@pages', replacement: path.resolve(__dirname, 'src/presentation/pages') },
      { find: '@services', replacement: path.resolve(__dirname, 'src/infrastructure/services') },
      { find: '@hooks', replacement: path.resolve(__dirname, 'src/application/hooks') },
      { find: '@utils', replacement: path.resolve(__dirname, 'src/application/utils') },
      { find: '@contexts', replacement: path.resolve(__dirname, 'src/application/contexts') },
      { find: '@types', replacement: path.resolve(__dirname, 'src/domain/types') },
      { find: '@models', replacement: path.resolve(__dirname, 'src/domain/models') },
      { find: '@assets', replacement: path.resolve(__dirname, 'src/presentation/assets') },
      { find: '@shaders', replacement: path.resolve(__dirname, 'src/presentation/shaders') },
      { find: '@store', replacement: path.resolve(__dirname, 'src/application/store') },
      { find: '@styles', replacement: path.resolve(__dirname, 'src/presentation/styles') },
      { find: '@api', replacement: path.resolve(__dirname, 'src/infrastructure/api') },
      { find: '@config', replacement: path.resolve(__dirname, 'src/infrastructure/config') },
      { find: '@constants', replacement: path.resolve(__dirname, 'src/domain/constants') },
      { find: '@validation', replacement: path.resolve(__dirname, 'src/domain/validation') },
      { find: '@visualizations', replacement: path.resolve(__dirname, 'src/presentation/visualizations') },
      { find: '@test', replacement: path.resolve(__dirname, 'src/test') },
      // Keep the explicit 'three' alias as well
      { find: 'three', replacement: path.resolve(__dirname, 'node_modules/three') },
    ],
  },
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

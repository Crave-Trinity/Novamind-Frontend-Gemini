/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
// import tsconfigPaths from 'vite-tsconfig-paths'; // Removed plugin
import { defineConfig } from 'vitest/config';
import path from 'path'; // Need path for manual alias resolution
// import { resolve } from 'path'; // Removed unused import TS6133

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()], // Removed tsconfigPaths()
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'), // Adjusted path relative to config/
      '@domain': path.resolve(__dirname, '../src/domain'),
      '@application': path.resolve(__dirname, '../src/application'),
      '@infrastructure': path.resolve(__dirname, '../src/infrastructure'),
      '@presentation': path.resolve(__dirname, '../src/presentation'),
      '@shared': path.resolve(__dirname, '../src/shared'),
      '@atoms': path.resolve(__dirname, '../src/presentation/atoms'),
      '@molecules': path.resolve(__dirname, '../src/presentation/molecules'),
      '@organisms': path.resolve(__dirname, '../src/presentation/organisms'),
      '@templates': path.resolve(__dirname, '../src/presentation/templates'),
      '@pages': path.resolve(__dirname, '../src/presentation/pages'),
      '@hooks': path.resolve(__dirname, '../src/application/hooks'),
      '@contexts': path.resolve(__dirname, '../src/application/contexts'),
      '@providers': path.resolve(__dirname, '../src/application/providers'),
      '@stores': path.resolve(__dirname, '../src/application/stores'),
      '@services': path.resolve(__dirname, '../src/application/services'),
      '@clients': path.resolve(__dirname, '../src/infrastructure/clients'),
      '@api': path.resolve(__dirname, '../src/infrastructure/api'),
      '@utils': path.resolve(__dirname, '../src/shared/utils'),
      '@types': path.resolve(__dirname, '../src/domain/types'),
      '@models': path.resolve(__dirname, '../src/domain/models'),
      '@constants': path.resolve(__dirname, '../src/domain/constants'),
      '@validation': path.resolve(__dirname, '../src/domain/validation'),
      '@assets': path.resolve(__dirname, '../src/presentation/assets'),
      '@styles': path.resolve(__dirname, '../src/presentation/styles'),
      '@shaders': path.resolve(__dirname, '../src/presentation/shaders'),
      '@test': path.resolve(__dirname, '../src/test'),
      '@config': path.resolve(__dirname, '../config'), // Points to config dir itself
    },
  },
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
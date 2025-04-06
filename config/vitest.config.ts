/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
// import tsconfigPaths from 'vite-tsconfig-paths'; // Removed plugin
import { defineConfig } from 'vitest/config';
import path from 'path'; // Need path for manual alias resolution

const projectRoot = '/Users/ray/Desktop/GITHUB/Novamind-Frontend'; // Define project root

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()], // Removed tsconfigPaths()
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src'),
      '@domain': path.resolve(projectRoot, 'src/domain'),
      '@application': path.resolve(projectRoot, 'src/application'),
      '@infrastructure': path.resolve(projectRoot, 'src/infrastructure'),
      '@presentation': path.resolve(projectRoot, 'src/presentation'),
      '@shared': path.resolve(projectRoot, 'src/shared'),
      '@atoms': path.resolve(projectRoot, 'src/presentation/atoms'),
      '@molecules': path.resolve(projectRoot, 'src/presentation/molecules'),
      '@organisms': path.resolve(projectRoot, 'src/presentation/organisms'),
      '@templates': path.resolve(projectRoot, 'src/presentation/templates'),
      '@pages': path.resolve(projectRoot, 'src/presentation/pages'),
      '@hooks': path.resolve(projectRoot, 'src/application/hooks'),
      '@contexts': path.resolve(projectRoot, 'src/application/contexts'),
      '@providers': path.resolve(projectRoot, 'src/application/providers'),
      '@stores': path.resolve(projectRoot, 'src/application/stores'),
      '@services': path.resolve(projectRoot, 'src/application/services'),
      '@clients': path.resolve(projectRoot, 'src/infrastructure/clients'),
      '@api': path.resolve(projectRoot, 'src/infrastructure/api'),
      '@utils': path.resolve(projectRoot, 'src/shared/utils'),
      '@types': path.resolve(projectRoot, 'src/domain/types'),
      '@models': path.resolve(projectRoot, 'src/domain/models'),
      '@constants': path.resolve(projectRoot, 'src/domain/constants'),
      '@validation': path.resolve(projectRoot, 'src/domain/validation'),
      '@assets': path.resolve(projectRoot, 'src/presentation/assets'),
      '@styles': path.resolve(projectRoot, 'src/presentation/styles'),
      '@shaders': path.resolve(projectRoot, 'src/presentation/shaders'),
      '@test': path.resolve(projectRoot, 'src/test'),
      '@config': path.resolve(projectRoot, 'config'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'], // Path relative to project root
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage', // Path relative to project root
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
      junit: './test-reports/junit.xml', // Path relative to project root
    },
  },
}); 
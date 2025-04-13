/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig, UserConfig } from 'vitest/config'; // Import UserConfig type
import path from 'path'; // Need path for manual alias resolution
import tsconfigPaths from 'vite-tsconfig-paths'; // Re-added plugin

const projectRoot = '/Users/ray/Desktop/GITHUB/Novamind-Frontend'; // Define project root

// Common configuration shared across projects
const commonPlugins = [react(), tsconfigPaths()];
const commonResolve = {
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
    '@api': path.resolve(projectRoot, 'src/infrastructure/api'), // Add missing API alias
    '@clients': path.resolve(projectRoot, 'src/infrastructure/clients'),
    '@utils': path.resolve(projectRoot, 'src/shared/utils'),
    '@constants': path.resolve(projectRoot, 'src/shared/constants'),
    '@config': path.resolve(projectRoot, 'config'),
    '@test': path.resolve(projectRoot, 'test'),
    '@public': path.resolve(projectRoot, 'public'),
    // Add specific worker aliases if needed, otherwise rely on tsconfigPaths
    // Example: './path/to/worker.js?worker': path.resolve(projectRoot, 'src/path/to/worker.js?worker'),
    // Ensure these match tsconfig.json paths for consistency
    './node_modules/react-dnd/dist/index.js': path.resolve(
      projectRoot,
      'node_modules/react-dnd/dist/cjs/index.js'
    ),
    './node_modules/react-dnd-html5-backend/dist/index.js': path.resolve(
      projectRoot,
      'node_modules/react-dnd-html5-backend/dist/cjs/index.js'
    ),
    // Alias for worker import - adjust path as necessary
    './web-workers/connectivity.worker.js?worker': path.resolve(
      projectRoot,
      'src/infrastructure/workers/connectivity.worker.ts?worker'
    ),
  },
};

// Define the projects configuration
const vitestConfig: UserConfig['test'] = {
  globals: true,
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    reportsDirectory: './coverage',
    include: ['src/**/*.{ts,tsx}'],
    exclude: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'src/test/**/*',
      'src/main.tsx', // Exclude entry point if not needed for coverage
      'src/**/index.ts', // Exclude index files if they only export
      'src/**/types.ts', // Exclude type definition files
      'src/vite-env.d.ts',
    ],
    all: true, // Ensure coverage is reported for all files included, even untested ones
  },
  // Define projects here inside the 'test' object
  // This structure seems problematic based on the error. Let's try defineConfig with top-level test config
};

export default defineConfig({
  plugins: commonPlugins,
  resolve: commonResolve,
  test: {
    ...vitestConfig, // Spread the common test config
    // Environment configuration will be project-specific
    // Define projects as an array of configuration objects
    // according to Vitest documentation - THIS PART WAS LIKELY THE ISSUE
    // Comment out deprecated environmentMatchGlobs but keep as reference for now
    // environmentMatchGlobs: [
    //   ['src/**', 'jsdom'],
    //   ['test/**', 'jsdom'],
    //   ['test-puppeteer/**', 'node'],
    // ],
    
    // Use environment directly instead of workspace to avoid TypeScript errors
    environment: 'jsdom', // Default environment for all tests
    setupFiles: [
      // The jest-dom setup must come first to ensure matchers are properly extended
      './src/test/jest-dom.setup.ts',
      './src/test/setup.ts',
      './src/test/dom-setup.ts',
      './src/test/vitest.setup.ts'
    ],
    
    // Special handling for puppeteer tests to run in node environment
    // We'll detect this in setup.ts and adjust accordingly
    

    // Include patterns for test files
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'test/**/*.test.{ts,tsx}',
      // Remove Puppeteer tests from Vitest runs as they use a different structure
    ],
    // Exclude patterns
    exclude: [
      'node_modules/**/*',
      'dist/**/*',
      'coverage/**/*',
      'config/**/*', // Exclude config directory itself
      'test-puppeteer/**/*', // Explicitly exclude Puppeteer tests from Vitest runs
    ],
  },
});

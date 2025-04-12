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
    // The 'projects' config isn't directly supported in defineConfig like this.
    // We need separate config files or a different approach if using projects.
    // Let's REVERT to environmentMatchGlobs as the project structure caused issues.
    environmentMatchGlobs: [
      // JSDOM environment for React component tests
      ['src/**', 'jsdom'],
      ['test/**', 'jsdom'], // Assuming unit tests are here too
      // Node environment for Puppeteer tests
      ['test-puppeteer/**', 'node'],
    ],
    setupFiles: ['./src/test/setup.ts'], // Setup applied based on environmentMatchGlobs
    // Ensure Puppeteer tests (node env) don't run the jsdom setup
    // Vitest should handle this separation correctly with environmentMatchGlobs

    // Include patterns for test files
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'test/**/*.test.{ts,tsx}',
      'test-puppeteer/**/*.test.{js,ts}', // Include Puppeteer tests
    ],
    // Exclude patterns
    exclude: [
      'node_modules/**/*',
      'dist/**/*',
      'coverage/**/*',
      'config/**/*', // Exclude config directory itself
    ],
  },
});

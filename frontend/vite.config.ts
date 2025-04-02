/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths'; // Added import for the plugin
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths() // Added tsconfigPaths plugin
  ],
  resolve: {
    alias: { // Revert back to object format
      '@': path.resolve(__dirname, 'src'),
      // Re-add specific aliases from tsconfig.json that might be needed
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@presentation': path.resolve(__dirname, 'src/presentation'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@models': path.resolve(__dirname, 'src/domain/models'),
      '@api': path.resolve(__dirname, 'src/infrastructure/api'),
      '@test': path.resolve(__dirname, 'src/test'),
      '@atoms': path.resolve(__dirname, 'src/presentation/atoms'),
      '@molecules': path.resolve(__dirname, 'src/presentation/molecules'),
      '@organisms': path.resolve(__dirname, 'src/presentation/organisms'),
      '@templates': path.resolve(__dirname, 'src/presentation/templates'),
      // Explicitly add potentially problematic paths
      '@/domain/types/temporal/dynamics': path.resolve(__dirname, 'src/domain/types/temporal/dynamics.ts'),
      '@/application/services/temporal/temporal.service': path.resolve(__dirname, 'src/application/services/temporal/temporal.service.ts'),
      // Add other aliases from tsconfig if needed
      // Remove specific aliases previously defined here to avoid conflicts:
      // '@hooks': path.resolve(__dirname, 'src/hooks'),
      // '@application': path.resolve(__dirname, 'src/application'),
      // '@pages': path.resolve(__dirname, 'src/pages'),
      // '@presentation': path.resolve(__dirname, 'src/presentation'),
      // '@contexts': path.resolve(__dirname, 'src/contexts'),
      // '@components': path.resolve(__dirname, 'src/components'),
      // '@domain': path.resolve(__dirname, 'src/domain'),
      // '@models': path.resolve(__dirname, 'src/domain/models'),
      // '@api': path.resolve(__dirname, 'src/infrastructure/api'),
      // '@test': path.resolve(__dirname, 'src/test'),
      // '@atoms': path.resolve(__dirname, 'src/presentation/atoms'),
      // '@molecules': path.resolve(__dirname, 'src/presentation/molecules'),
      // '@organisms': path.resolve(__dirname, 'src/presentation/organisms'),
      // '@templates': path.resolve(__dirname, 'src/presentation/templates'),
    }
    }
  }, // Added comma
  // The following "test" field is specific to Vitest.
  // Casting the configuration to "any" bypasses type restrictions.
  test: {
    environment: 'jsdom'
  }
} as any); // Re-added 'as any' cast for Vitest compatibility

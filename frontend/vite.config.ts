/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@presentation': path.resolve(__dirname, 'src/presentation'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@models': path.resolve(__dirname, 'src/domain/models'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@api': path.resolve(__dirname, 'src/infrastructure/api'),
      '@test': path.resolve(__dirname, 'src/test'),
      '@atoms': path.resolve(__dirname, 'src/presentation/atoms'),
      '@molecules': path.resolve(__dirname, 'src/presentation/molecules'),
      '@organisms': path.resolve(__dirname, 'src/presentation/organisms'),
      '@templates': path.resolve(__dirname, 'src/presentation/templates'),
      '@': path.resolve(__dirname, 'src')
      // Add further alias mappings as needed.
    },
  },
  // The following "test" field is specific to Vitest.
  // Casting the configuration to "any" bypasses type restrictions.
  test: {
    environment: 'jsdom'
  }
} as any);

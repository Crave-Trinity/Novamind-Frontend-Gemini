/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react({
      // Enable processing of CSS including PostCSS plugins
      babel: {
        plugins: [
          // Add any babel plugins if needed
        ],
      },
    }),
    tsconfigPaths()
  ],
  
  css: {
    // Enable CSS modules and PostCSS processing
    modules: {
      localsConvention: 'camelCase',
    },
    postcss: {
      // Ensure PostCSS plugins are loaded from postcss.config.js
    },
    // Enable CSS source maps for better debugging
    devSourcemap: true,
  },
  
  // Ensure static assets are properly handled
  publicDir: 'public',
  
  // Enable HMR for faster development
  server: {
    hmr: true,
    watch: {
      usePolling: false,
    },
  },

  // Vitest configuration
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  }
} as any);

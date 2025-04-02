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
  // resolve: { // Removed manual aliases - rely on tsconfigPaths plugin
  //   alias: { ... }
  // },
  // The following "test" field is specific to Vitest.
  // Casting the configuration to "any" bypasses type restrictions.
  test: {
    environment: 'jsdom'
  }
} as any); // Re-added 'as any' cast for Vitest compatibility

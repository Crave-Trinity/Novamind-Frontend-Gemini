/// <reference types="vitest" />
import { defineConfig, UserConfig } from 'vite';
import { UserConfig as VitestUserConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths'; // Import the plugin

// Vitest configuration is defined in separate vitest.config.ts files
// interface MergedConfig extends UserConfig {
//   test: VitestUserConfig['test']; // Removed test property
// }

// Export the configuration using the merged type
export default defineConfig(({ command, mode }): UserConfig => ({ // Use UserConfig directly
  plugins: [react(), tsconfigPaths()],
  // Enable CSS processing (including PostCSS/Tailwind) for tests
  css: {
    postcss: './postcss.config.cjs'
  },

  resolve: {
    // alias: { ... } // Rely on tsconfigPaths plugin
  },

  // Build configuration optimized for performance
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing']
        }
      }
    }
  },

  // Dev server configuration
  server: {
    port: 3002, // Changed port again
    strictPort: true,
    host: true,
  },

  // Optimizations for Three.js and WebGL
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
      'react',
      'react-dom'
    ],
    exclude: [
      // '@react-three/fiber', // Let Vite process these
      // '@react-three/postprocessing',
      // 'zustand', // Removed from exclude to allow Vite processing
      // 'suspend-react', // Removed from exclude
      // 'its-fine', // Removed from exclude
      // 'scheduler', // Removed from exclude
      'react-use-measure'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },

  // Vitest configuration is now managed in vitest.config.ts files
}));

/// <reference types="vitest" />
import { defineConfig, UserConfig } from 'vite';
import { UserConfig as VitestUserConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths'; // Import the plugin

// Define a merged configuration type that includes Vitest's 'test' property
interface MergedConfig extends UserConfig {
  test: VitestUserConfig['test'];
}

// Export the configuration using the merged type
export default defineConfig(({ command, mode }): MergedConfig => ({
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

  // Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.unified.ts',
    // css: { ... } // Moved to top level
    // Optional: Add coverage configuration if needed
    // coverage: {
    //   provider: 'v8', // or 'istanbul'
    //   reporter: ['text', 'json', 'html'],
    // },
    testTimeout: 30000, // Increase global timeout to 30s
  }
}));

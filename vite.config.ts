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
  plugins: [react(), tsconfigPaths()], // Add the plugin

  resolve: {
    alias: {
      // Core architecture path alias
      '@': path.resolve(__dirname, './src'),

      /* Clean Architecture Layers */
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),

      /* Atomic Design Components */
      '@atoms': path.resolve(__dirname, './src/presentation/atoms'),
      '@molecules': path.resolve(__dirname, './src/presentation/molecules'),
      '@organisms': path.resolve(__dirname, './src/presentation/organisms'),
      '@templates': path.resolve(__dirname, './src/presentation/templates'),
      '@pages': path.resolve(__dirname, './src/presentation/pages'),

      /* Domain-Driven Architecture Shortcuts */
      '@services': path.resolve(__dirname, './src/infrastructure/services'),
      '@hooks': path.resolve(__dirname, './src/application/hooks'),
      '@utils': path.resolve(__dirname, './src/application/utils'),
      '@contexts': path.resolve(__dirname, './src/application/contexts'),
      '@types': path.resolve(__dirname, './src/domain/types'),
      '@models': path.resolve(__dirname, './src/domain/models'),
      '@assets': path.resolve(__dirname, './src/presentation/assets'),
      '@shaders': path.resolve(__dirname, './src/presentation/shaders'),
      '@store': path.resolve(__dirname, './src/application/store'),
      '@styles': path.resolve(__dirname, './src/presentation/styles'),
      '@api': path.resolve(__dirname, './src/infrastructure/api'),
      '@config': path.resolve(__dirname, './src/infrastructure/config'),
      '@constants': path.resolve(__dirname, './src/domain/constants'),
      '@validation': path.resolve(__dirname, './src/domain/validation'),
      '@visualizations': path.resolve(__dirname, './src/presentation/visualizations'),
      '@test': path.resolve(__dirname, './src/test'),
    }
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
    port: 3000,
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
      '@react-three/fiber',
      '@react-three/postprocessing',
      'zustand',
      'suspend-react',
      'its-fine',
      'scheduler',
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
    // Replicate aliases for Vitest
    // alias: { ... }, // Remove manual alias replication, tsconfigPaths handles it
    // Optional: Add coverage configuration if needed
    // coverage: {
    //   provider: 'v8', // or 'istanbul'
    //   reporter: ['text', 'json', 'html'],
    // },
    testTimeout: 30000, // Increase global timeout to 30s
  }
}));

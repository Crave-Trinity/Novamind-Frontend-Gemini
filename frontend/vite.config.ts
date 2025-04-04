/**
 * Vite Configuration for Novamind Digital Twin
 * 
 * Pure TypeScript ESM configuration for Vite.
 */

import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Optimizations for dependency resolution
  optimizeDeps: {
    include: [
      'three',
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
      },
      jsx: 'automatic'
    }
  },
  
  // Mark problematic dependencies as external
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      external: [
        'zustand',
        'suspend-react',
        'its-fine',
        'scheduler',
        'react-use-measure',
        '@babel/runtime/helpers/esm/extends'
      ]
    }
  },
  
  
  // Resolve aliases for imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      
      // Clean Architecture Layers
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      
      // Atomic Design Components
      '@atoms': path.resolve(__dirname, './src/presentation/atoms'),
      '@molecules': path.resolve(__dirname, './src/presentation/molecules'),
      '@organisms': path.resolve(__dirname, './src/presentation/organisms'),
      '@templates': path.resolve(__dirname, './src/presentation/templates'),
      '@pages': path.resolve(__dirname, './src/presentation/pages'),
      
      // Legacy paths for backward compatibility during migration
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/application/hooks'),
      '@contexts': path.resolve(__dirname, './src/application/contexts'),
      '@services': path.resolve(__dirname, './src/infrastructure/services'),
      '@utils': path.resolve(__dirname, './src/application/utils'),
      '@types': path.resolve(__dirname, './src/domain/types'),
      '@test': path.resolve(__dirname, './src/test')
    }
  },
  
  // Server configuration
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false // Disable error overlay
    }
  },
  
});

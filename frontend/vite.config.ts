import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import compression from 'vite-plugin-compression';

/**
 * NOVAMIND Vite Configuration
 * 
 * Implements neural-level optimization for React rendering with
 * clean architecture path structure aligned with tsconfig.json.
 */
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      // TypeScript path resolution - unified with tsconfig.json
      tsconfigPaths(),
      
      // React optimization
      react({
        babel: {
          // Quantum-level React optimization
          plugins: isProduction ? [
            ['transform-react-remove-prop-types', { removeImport: true }],
            // Remove console.log in production
            'transform-remove-console',
          ] : [],
          // Neural-safe JSX features
          parserOpts: {
            plugins: ['jsx', 'typescript']
          },
        },
      }),
      
      // Production-only compression for neural performance
      isProduction && compression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      
      // Brotli compression for maximum neural pathway efficiency
      isProduction && compression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
    ],
    
    // Path aliases - aligned with clean architecture in tsconfig.json
    resolve: {
      alias: {
        // Core Clean Architecture Layers
        '@': resolve(__dirname, 'src'),
        '@domain': resolve(__dirname, 'src/domain'),
        '@application': resolve(__dirname, 'src/application'),
        '@infrastructure': resolve(__dirname, 'src/infrastructure'),
        '@presentation': resolve(__dirname, 'src/presentation'),
        
        // Atomic Design Components
        '@components': resolve(__dirname, 'src/presentation/components'),
        '@atoms': resolve(__dirname, 'src/presentation/components/atoms'),
        '@molecules': resolve(__dirname, 'src/presentation/components/molecules'),
        '@organisms': resolve(__dirname, 'src/presentation/components/organisms'),
        '@templates': resolve(__dirname, 'src/presentation/components/templates'),
        '@pages': resolve(__dirname, 'src/presentation/pages'),
        
        // Domain-Driven Architecture Shortcuts
        '@services': resolve(__dirname, 'src/infrastructure/services'),
        '@hooks': resolve(__dirname, 'src/application/hooks'),
        '@utils': resolve(__dirname, 'src/application/utils'),
        '@contexts': resolve(__dirname, 'src/application/contexts'),
        '@types': resolve(__dirname, 'src/domain/types'),
        '@models': resolve(__dirname, 'src/domain/models'),
        '@assets': resolve(__dirname, 'src/presentation/assets'),
        '@shaders': resolve(__dirname, 'src/presentation/shaders'),
        '@store': resolve(__dirname, 'src/application/store'),
        '@styles': resolve(__dirname, 'src/presentation/styles'),
        '@api': resolve(__dirname, 'src/infrastructure/api'),
        '@config': resolve(__dirname, 'src/infrastructure/config'),
        '@constants': resolve(__dirname, 'src/domain/constants'),
        '@validation': resolve(__dirname, 'src/domain/validation'),
        '@visualizations': resolve(__dirname, 'src/presentation/visualizations'),
      },
    },
    
    // Neural network build optimization
    build: {
      target: 'esnext',  // Modern browsers support
      outDir: 'dist',
      assetsDir: 'assets',
      cssCodeSplit: true,
      minify: 'terser',
      sourcemap: !isProduction,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : undefined,
      rollupOptions: {
        output: {
          manualChunks: {
            // Optimal neural pathway chunking strategy
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'visualization-vendor': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
            'data-vendor': ['zustand', '@tanstack/react-query', 'zod'],
            'ui-vendor': ['classnames', 'framer-motion', '@headlessui/react', '@heroicons/react'],
          },
        },
      },
    },
    
    // Neural-optimized server settings
    server: {
      port: 3000,
      strictPort: false,
      open: true,
      cors: true,
      hmr: {
        overlay: true,
      },
    },
    
    // Neural-enhanced dev tools
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-router-dom',
        'zustand',
        '@tanstack/react-query',
        'framer-motion',
        'three',
        '@react-three/fiber',
      ],
      exclude: [
        // Large dependencies that slow down dev rebuilds
        'large-visualization-lib',
      ],
    },
    
    // Neural-safe error handling
    esbuild: {
      logOverride: {
        'this-is-undefined-in-esm': 'silent',
      },
    },
  };
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Production-ready Vite configuration
 * 
 * This configuration is optimized for deployment with:
 * - Proper API routing for both mock and real backend
 * - Optimized bundle size with proper code splitting
 * - Performance optimizations for production builds
 */
export default defineConfig({
  plugins: [
    react({
      // React optimization
      babel: {
        // Remove JSX source plugin in production
        plugins: [] 
      },
    }),
  ],
  
  // Path aliases aligned with clean architecture
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Domain layer
      '@domain': resolve(__dirname, 'src/domain'),
      '@models': resolve(__dirname, 'src/domain/models'),
      // Application layer
      '@application': resolve(__dirname, 'src/application'),
      '@contexts': resolve(__dirname, 'src/application/contexts'),
      '@providers': resolve(__dirname, 'src/application/providers'),
      '@hooks': resolve(__dirname, 'src/application/hooks'),
      // Presentation layer
      '@components': resolve(__dirname, 'src/presentation'),
      '@atoms': resolve(__dirname, 'src/presentation/atoms'),
      '@molecules': resolve(__dirname, 'src/presentation/molecules'),
      '@organisms': resolve(__dirname, 'src/presentation/organisms'),
      '@templates': resolve(__dirname, 'src/presentation/templates'),
      '@pages': resolve(__dirname, 'src/presentation/pages'),
      // Infrastructure layer
      '@infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@services': resolve(__dirname, 'src/services'),
      '@api': resolve(__dirname, 'src/infrastructure/api'),
      // Shared
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@shaders': resolve(__dirname, 'src/shaders'),
    },
  },
  
  // Enhanced build optimizations for production
  build: {
    target: 'esnext', // Modern browsers support
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    minify: 'esbuild', // Using esbuild instead of terser for faster minification
    sourcemap: false, // No source maps in production
    reportCompressedSize: true, // Report accurate compressed size
    chunkSizeWarningLimit: 500, // Increase warning threshold for chunks
    
    // Tree-shaking optimization
    commonjsOptions: {
      transformMixedEsModules: true, // Better tree-shaking for mixed modules
    },
    
    // Advanced code splitting strategy
    rollupOptions: {
      output: {
        // Ensure smaller chunks for better caching
        manualChunks: (id) => {
          // React and core dependencies
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/')) {
            return 'vendor-react';
          }
          
          // Three.js and visualization libraries
          if (id.includes('node_modules/three/') ||
              id.includes('node_modules/@react-three/') ||
              id.includes('node_modules/postprocessing/')) {
            return 'vendor-three';
          }
          
          // Data handling and utils
          if (id.includes('node_modules/axios/') ||
              id.includes('node_modules/lodash/') ||
              id.includes('node_modules/date-fns/')) {
            return 'vendor-utils';
          }
          
          // Keep the rest as dynamic imports per route
          return undefined;
        },
        // Optimize entry points
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  
  // Server configuration for production preview
  // This allows testing the production build locally
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
    cors: true,
  },
  
  // Enhanced environment variables for production
  define: {
    // Use env variables with fallbacks for flexible deployment
    'process.env.VITE_API_MODE': JSON.stringify(process.env.VITE_API_MODE || 'real'),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://api.novamind.health'),
    'process.env.VITE_VERSION': JSON.stringify(process.env.npm_package_version),
    'process.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
    // HIPAA Compliance settings
    'process.env.VITE_SESSION_TIMEOUT': JSON.stringify(process.env.VITE_SESSION_TIMEOUT || '900000'), // 15 min default
    'process.env.VITE_ENABLE_AUDIT_LOGGING': JSON.stringify(process.env.VITE_ENABLE_AUDIT_LOGGING || 'true'),
    // Performance flags
    'process.env.VITE_ENABLE_PERFORMANCE_TRACKING': JSON.stringify(process.env.VITE_ENABLE_PERFORMANCE_TRACKING || 'true'),
    'process.env.VITE_ENABLE_MEMORY_PROFILING': JSON.stringify(process.env.VITE_ENABLE_MEMORY_PROFILING || 'false'),
    // Feature flags
    'process.env.VITE_ENABLE_ADVANCED_VISUALIZATIONS': JSON.stringify(process.env.VITE_ENABLE_ADVANCED_VISUALIZATIONS || 'true'),
    'process.env.VITE_ENABLE_DEMO_MODE': JSON.stringify(process.env.VITE_ENABLE_DEMO_MODE || 'false'),
  },
});
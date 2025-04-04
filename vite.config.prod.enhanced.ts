import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
// import { terser } from 'rollup-plugin-terser'; // Removed terser
import legacy from '@vitejs/plugin-legacy';
import compress from 'vite-plugin-compression';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // React plugin with production optimizations
    react({
      babel: {
        plugins: [
          // Plugin for optimizing React code
          ['transform-react-remove-prop-types', { removeImport: true }],
          // Filter console.* in production
          ['transform-remove-console', { exclude: ['error', 'warn'] }]
        ]
      }
    }),
    
    // Generate legacy builds for older browsers
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    
    // Compress output with Brotli and Gzip
    compress({
      algorithm: 'brotliCompress',
      threshold: 1024, // only compress files > 1kb
    }),
    compress({
      algorithm: 'gzip',
      threshold: 1024,
    }),
    
    // Bundle visualization for analysis
    visualizer({ 
      open: false, 
      filename: 'build-analysis/bundle-stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  // Explicitly define PostCSS plugins
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },

  build: {
    // Vite 5 uses esbuild for minification by default
    
    // Split CSS instead of inlining it
    cssCodeSplit: true,
    
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1600,
    
    // Turn off source maps for production
    sourcemap: false,
    
    // Output directory
    outDir: 'dist',
    
    // Ensure assets are properly hashed
    assetsDir: 'assets',
    
    // Advanced rollup options for better optimization
    rollupOptions: {
      output: {
        // Ensure assets are served from CDN
        assetFileNames: 'assets/[name]-[hash].[ext]',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        
        // Manual code-splitting optimizations
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          'vendor-utils': ['axios', 'lodash', 'date-fns'],
          'vendor-ui': ['@headlessui/react', '@heroicons/react', 'react-hook-form'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
        },
      },
      
      // External dependencies that should not be bundled
      external: [],
    },
  },
  
  // Resolve aliases (consistent with tsconfig paths)
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@domain': resolve(__dirname, 'src/domain'),
      '@application': resolve(__dirname, 'src/application'),
      '@infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@presentation': resolve(__dirname, 'src/presentation'),
    },
  },
  
  // Enable various optimizations
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'three', 
      '@react-three/fiber',
      'axios',
      'lodash',
    ],
    exclude: [],
    esbuildOptions: {
      // Enable minification even in development
      minify: true,
      treeShaking: true,
      // Target for build
      target: 'es2020',
    }
  },
  
  // Server configuration
  server: {
    host: '0.0.0.0',
    port: 3000,
    cors: true,
    hmr: {
      // For GitHub Codespaces
      clientPort: 443,
    },
  },
  
  // Preview configuration (for production build preview)
  preview: {
    port: 4173,
    host: '0.0.0.0',
    cors: true,
  },
});

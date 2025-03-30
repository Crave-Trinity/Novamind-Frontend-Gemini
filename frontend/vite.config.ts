import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react({
        // React optimization
        babel: {
          // Remove JSX source plugin to fix duplicate __source props
          plugins: [] 
        },
      }),
    ],
    
    // Path aliases - essential for clean imports
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@contexts': resolve(__dirname, 'src/contexts'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@services': resolve(__dirname, 'src/services'),
        '@types': resolve(__dirname, 'src/types'),
        '@assets': resolve(__dirname, 'src/assets'),
      },
    },
    
    // Build optimization
    build: {
      target: 'esnext', // Modern browsers support
      outDir: 'dist',
      assetsDir: 'assets',
      cssCodeSplit: true,
      minify: 'terser',
      sourcemap: !isProduction,
      
      // Production optimizations
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : undefined,
      
      // Code splitting strategy
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-three': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          },
        },
      },
    },
    
    // Development server
    server: {
      port: 3000, // Changed port to avoid conflict with existing 8080 server
      strictPort: false, // Allow fallback to another port
      host: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    
    // Include important dependencies for faster startup
    optimizeDeps: {
      include: [
        'react', 
        'react-dom',
        'react-router-dom',
        'three',
        '@react-three/fiber',
        'axios',
      ],
    },
  };
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
// import path from 'path'; // Removed unused import TS6133
import type { UserConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  loadEnv(mode, process.cwd(), ''); // Load env variables but don't assign if unused

  const config: UserConfig = {
    plugins: [
      react({
        // Add displayName to components in development
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
            // Conditionally add source plugin for development
            ...(mode === 'development' ? ['@babel/plugin-transform-react-jsx-source'] : []),
          ],
        },
      }),
      // Support TypeScript path aliases
      tsconfigPaths(),
    ],

    build: {
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
            'ui-vendor': ['@radix-ui/react-icons', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          },
        },
      },
      // Minification options
      minify: 'esbuild',
      cssMinify: true,
    },

    server: {
      port: 3000,
      strictPort: true,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'three',
        '@react-three/fiber',
        '@react-three/drei'
      ],
      exclude: ['@react-three/postprocessing']
    },
  };

  if (command === 'serve') {
    // Development specific config
    return {
      ...config,
      // Add development specific options here
      define: {
        'process.env.NODE_ENV': '"development"',
      },
    };
  }

  // Production specific config
  return {
    ...config,
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    build: {
      ...config.build,
      // Add production specific build options here
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000,
    },
  };
}); 
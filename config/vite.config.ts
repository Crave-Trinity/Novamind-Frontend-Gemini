import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// import tsconfigPaths from 'vite-tsconfig-paths'; // Plugin removed as explicit aliases are used
import path from 'path'; // Import path module
import type { UserConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  loadEnv(mode, process.cwd(), ''); // Load env variables but don't assign if unused

  // Define the base config
  const baseConfig: UserConfig = {
    plugins: [
      react({
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
            ...(mode === 'development' ? ['@babel/plugin-transform-react-jsx-source'] : []),
          ],
        },
      }),
      // tsconfigPaths(), // Plugin removed
      nodePolyfills(), // Add Node polyfills plugin
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
      // Add proxy configuration
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // Corrected: Target backend server (running on the same port as frontend dev server)
          changeOrigin: true,
          // secure: false, // Uncomment if backend uses self-signed cert
          // rewrite: (path) => path.replace(/^\/api/, ''), // Uncomment if backend doesn't expect /api prefix
        },
      },
    },
    optimizeDeps: {
      include: [
        'react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'
      ],
      exclude: ['@react-three/postprocessing', '@react-three/a11y']
    },
    resolve: {
      alias: [ // Use array format for aliases
        { find: '@', replacement: path.resolve(__dirname, '../src') },
        { find: '@domain', replacement: path.resolve(__dirname, '../src/domain') },
        { find: '@application', replacement: path.resolve(__dirname, '../src/application') },
        { find: '@infrastructure', replacement: path.resolve(__dirname, '../src/infrastructure') },
        { find: '@presentation', replacement: path.resolve(__dirname, '../src/presentation') },
        { find: '@shared', replacement: path.resolve(__dirname, '../src/shared') },
        { find: '@atoms', replacement: path.resolve(__dirname, '../src/presentation/atoms') },
        { find: '@molecules', replacement: path.resolve(__dirname, '../src/presentation/molecules') },
        { find: '@organisms', replacement: path.resolve(__dirname, '../src/presentation/organisms') },
        { find: '@templates', replacement: path.resolve(__dirname, '../src/presentation/templates') },
        { find: '@pages', replacement: path.resolve(__dirname, '../src/presentation/pages') },
        { find: '@hooks', replacement: path.resolve(__dirname, '../src/application/hooks') },
        { find: '@contexts', replacement: path.resolve(__dirname, '../src/application/contexts') },
        { find: '@providers', replacement: path.resolve(__dirname, '../src/application/providers') },
        { find: '@stores', replacement: path.resolve(__dirname, '../src/application/stores') },
        { find: '@services', replacement: path.resolve(__dirname, '../src/application/services') },
        { find: '@clients', replacement: path.resolve(__dirname, '../src/infrastructure/clients') },
        { find: '@api', replacement: path.resolve(__dirname, '../src/infrastructure/api') },
        { find: '@utils', replacement: path.resolve(__dirname, '../src/shared/utils') },
        { find: '@types', replacement: path.resolve(__dirname, '../src/domain/types') },
        { find: '@models', replacement: path.resolve(__dirname, '../src/domain/models') },
        { find: '@constants', replacement: path.resolve(__dirname, '../src/domain/constants') },
        { find: '@validation', replacement: path.resolve(__dirname, '../src/domain/validation') },
        { find: '@assets', replacement: path.resolve(__dirname, '../src/presentation/assets') },
        { find: '@styles', replacement: path.resolve(__dirname, '../src/presentation/styles') },
        { find: '@shaders', replacement: path.resolve(__dirname, '../src/presentation/shaders') },
        { find: '@test', replacement: path.resolve(__dirname, '../src/test') },
        { find: '@config', replacement: path.resolve(__dirname) }, // Points to config directory itself
      ],
    },
    // Explicitly define PostCSS config path for Vite
    css: {
      postcss: './config/postcss/postcss.config.cjs',
    },
    // Initialize define object here
    define: {},
  };

  // Apply conditional modifications
  if (command === 'serve') {
    // Development specific config
    baseConfig.define = {
      ...baseConfig.define,
      'process.env.NODE_ENV': '"development"',
    };
  } else {
    // Production specific config
    baseConfig.define = {
      ...baseConfig.define,
      'process.env.NODE_ENV': '"production"',
    };
    // Ensure build object exists before spreading into it
    baseConfig.build = {
      ...baseConfig.build,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000,
    };
  }

  // Return the modified baseConfig object
  return baseConfig;
});
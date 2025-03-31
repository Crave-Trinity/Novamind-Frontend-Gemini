
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/test/standalone-brain-test.spec.tsx'],
    reporters: ['verbose'],
    testTimeout: 30000,
    forceExit: true
  }
});

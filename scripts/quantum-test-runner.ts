/**
 * NOVAMIND Neural Architecture
 * Quantum Test Runner with Neural Precision
 * 
 * This script provides a direct approach to running tests with minimal
 * configuration and dependencies, focusing on stability and reliability.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Calculate __dirname equivalent in ES modules with quantum precision
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Neural computation paths with quantum precision
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const DEFAULT_TEST_FILE = 'src/test/standalone-brain-test.spec.tsx';

// Parse command line arguments with clinical precision
const args = process.argv.slice(2);
const testFile = args[0] || DEFAULT_TEST_FILE;
const testFilePath = path.resolve(FRONTEND_ROOT, testFile);

console.log(`🧠 NOVAMIND Quantum Test Runner: Running test for ${testFile} with quantum precision`);

// Ensure the test file exists with clinical precision
if (!fs.existsSync(testFilePath)) {
  console.error(`🧠 Neural Error: Test file not found: ${testFilePath}`);
  process.exit(1);
}

// Create a minimal Vitest configuration inline with mathematical elegance
const minimalVitestConfig = `
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['${testFile}'],
    reporters: ['verbose'],
    testTimeout: 30000,
    forceExit: true
  }
});
`;

// Write the minimal config to a temporary file with quantum precision
const tempConfigPath = path.join(FRONTEND_ROOT, 'vitest.quantum.js');
fs.writeFileSync(tempConfigPath, minimalVitestConfig);

try {
  // Run Vitest directly with minimal arguments with clinical precision
  const command = `npx vitest run --config ${tempConfigPath}`;
  console.log(`🧠 Executing: ${command}`);
  
  // Execute the command and capture output with quantum precision
  execSync(command, { 
    cwd: FRONTEND_ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      // Disable unnecessary features for stability
      VITEST_SEGFAULT_RETRY: '0',
      VITEST_MAX_THREADS: '1'
    }
  });
  
  console.log(`🧠 NOVAMIND Quantum Test Runner: Test completed successfully with quantum precision`);
} catch (error) {
  console.error(`🧠 NOVAMIND Quantum Test Runner: Test failed with error: ${error.message}`);
  process.exit(1);
} finally {
  // Clean up the temporary config file with clinical precision
  try {
    fs.unlinkSync(tempConfigPath);
  } catch (error) {
    console.warn(`🧠 Warning: Could not remove temporary config file: ${error.message}`);
  }
}

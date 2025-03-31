/**
 * NOVAMIND Direct Test Runner
 * A simplified test runner for debugging coverage instrumentation issues
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Calculate __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const testFile = args[0] || 'src/presentation/templates/BrainModelContainer.test.tsx';
const testFilePath = path.resolve(FRONTEND_ROOT, testFile);

console.log(`🧠 NOVAMIND Direct Test Runner: Running test for ${testFile}`);

// Ensure the test file exists
if (!fs.existsSync(testFilePath)) {
  console.error(`Error: Test file not found: ${testFilePath}`);
  process.exit(1);
}

try {
  // Run the test directly with Vitest
  const command = `npx vitest run ${testFile} --config vitest.unified.js --reporter verbose`;
  console.log(`Executing: ${command}`);
  
  // Execute the command and capture output
  const output = execSync(command, { 
    cwd: FRONTEND_ROOT,
    env: {
      ...process.env,
      NODE_OPTIONS: '--enable-source-maps',
      VITEST_POOL: 'threads',
      VITEST_POOL_SIZE: '1',
      VITEST_FORCE_EXIT: 'true'
    },
    stdio: 'inherit'
  });
  
  console.log(`🧠 NOVAMIND Direct Test Runner: Test completed successfully`);
} catch (error) {
  console.error(`🧠 NOVAMIND Direct Test Runner: Test failed with error: ${error.message}`);
  process.exit(1);
}

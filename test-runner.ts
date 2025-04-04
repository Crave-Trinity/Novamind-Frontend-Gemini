/**
 * NOVAMIND Testing Framework
 * TypeScript ESM-Compatible Test Runner
 * 
 * This file provides a clean, reliable test environment that works with TypeScript
 * and maintains proper ESM compatibility.
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Setup proper ESM paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define test file pattern
const TEST_FILE_PATTERN = /\.test\.(ts|tsx)$/;

// Find all test files
function findTestFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...findTestFiles(fullPath));
      } else if (TEST_FILE_PATTERN.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

// Run tests using vitest with our custom configuration
async function runTests(): Promise<void> {
  console.log('🧠 NOVAMIND TypeScript Test Runner');
  console.log('----------------------------------');
  
  // Use vitest with our custom configuration
  const vitestProcess = spawn('npx', ['vitest', 'run', '--config', 'vitest.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });
  
  return new Promise((resolve, reject) => {
    vitestProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ All tests passed!');
        resolve();
      } else {
        console.error(`\n❌ Tests failed with code ${code}`);
        reject(new Error(`Tests failed with code ${code}`));
      }
    });
    
    vitestProcess.on('error', (error) => {
      console.error('\n❌ Error running tests:', error);
      reject(error);
    });
  });
}

// Main function
async function main(): Promise<void> {
  try {
    await runTests();
  } catch (error) {
    console.error('Error in test runner:', error);
    process.exit(1);
  }
}

// Run the main function
main();

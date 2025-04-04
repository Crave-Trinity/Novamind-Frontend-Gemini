#!/usr/bin/env ts-node-esm

/**
 * Test runner with global timeout for Novamind Digital Twin
 * 
 * This script runs tests with a global timeout to prevent hanging tests.
 * It's particularly useful for tests involving Three.js and WebGL rendering
 * which can sometimes cause tests to hang indefinitely.
 * 
 * Usage:
 *   npm run test:safe [testPattern]
 */

import { spawn } from 'child_process';
import path from 'path';

// Configuration
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const KILL_GRACE_PERIOD = 5000; // 5 seconds

interface RunOptions {
  testPattern?: string;
  timeout?: number;
  config?: string;
}

/**
 * Run tests with a global timeout
 */
async function runTestsWithTimeout(options: RunOptions): Promise<number> {
  const {
    testPattern = '',
    timeout = DEFAULT_TIMEOUT,
    config = 'vitest.config.unified.ts'
  } = options;
  
  return new Promise((resolve) => {
    console.log(`🧪 Running tests with ${timeout / 1000}s timeout...`);
    
    // Build the test command
    const args = [
      'vitest', 'run',
      '--config', config,
      '--no-ui', // Explicitly disable UI to avoid dependency prompt
      '--reporter', 'default'
    ];
    
    // Add test pattern if provided
    if (testPattern) {
      args.push(testPattern);
    }
    
    // Start the test process
    const testProcess = spawn('npx', args, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      console.warn(`\n⚠️ Tests exceeded timeout of ${timeout / 1000}s. Terminating...`);
      
      // Give the process a chance to clean up
      testProcess.kill('SIGTERM');
      
      // Force kill after grace period
      const forceKillId = setTimeout(() => {
        console.error(`\n❌ Force killing test process after grace period...`);
        testProcess.kill('SIGKILL');
      }, KILL_GRACE_PERIOD);
      
      // Clear force kill timeout if process exits during grace period
      testProcess.on('exit', () => {
        clearTimeout(forceKillId);
        resolve(1); // Return non-zero exit code
      });
    }, timeout);
    
    // Handle process exit
    testProcess.on('close', (code) => {
      clearTimeout(timeoutId);
      console.log(`\n✅ Tests completed with exit code: ${code}`);
      resolve(code || 0);
    });
    
    // Handle process errors
    testProcess.on('error', (err) => {
      clearTimeout(timeoutId);
      console.error(`\n❌ Error executing tests:`, err);
      resolve(1); // Return non-zero exit code
    });
  });
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    // Get test pattern from command line args
    const args = process.argv.slice(2);
    const testPattern = args.length > 0 ? args[0] : '';
    
    // Run tests with timeout
    const exitCode = await runTestsWithTimeout({
      testPattern,
      timeout: DEFAULT_TIMEOUT,
      config: 'vitest.config.unified.ts'
    });
    
    // Exit with the same code as the test process
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  }
}

// Run the script
main();

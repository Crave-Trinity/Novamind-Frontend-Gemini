#!/usr/bin/env ts-node-esm

/**
 * Tailwind-aware test runner for Novamind Digital Twin
 * 
 * This script runs tests with proper Tailwind CSS mocking and ensures
 * that all tests have access to the Tailwind utility classes in the test environment.
 * 
 * Usage:
 *   npm run test:tailwind [testPattern]
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import fs from 'fs/promises';

// Configuration
const TEST_TIMEOUT = 30000; // 30 seconds
const VITEST_CONFIG = 'vitest.config.unified.ts';
const SETUP_FILE = 'src/test/setup.ts';

async function main() {
  try {
    // Get test pattern from command line args
    const args = process.argv.slice(2);
    const testPattern = args.length > 0 ? args[0] : '';
    
    console.log('🎨 Running tests with Tailwind CSS mocking...');
    
    // Verify that our test setup file exists and includes tailwind-mock
    await verifySetupFile();
    
    // Build the test command
    const testCommand = [
      'vitest', 'run',
      '--config', VITEST_CONFIG,
      '--timeout', TEST_TIMEOUT.toString()
    ];
    
    // Add test pattern if provided
    if (testPattern) {
      testCommand.push(testPattern);
    }
    
    // Execute the test command using npx
    const npx = spawn('npx', testCommand, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // Handle process exit
    npx.on('close', (code) => {
      process.exit(code || 0);
    });
    
    // Handle process errors
    npx.on('error', (err) => {
      console.error('❌ Error executing tests:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  }
}

/**
 * Verify that the setup file includes the tailwind-mock import
 */
async function verifySetupFile(): Promise<boolean> {
  try {
    const setupPath = resolve(process.cwd(), SETUP_FILE);
    const setupContent = await fs.readFile(setupPath, 'utf-8');
    
    // Check if the file imports tailwind-mock
    if (!setupContent.includes('./tailwind-mock')) {
      console.warn('⚠️  Warning: Test setup file does not import tailwind-mock');
      console.warn('   Consider adding: import \'./tailwind-mock\'; to your setup file');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error verifying setup file:', error);
    return false;
  }
}

// Run the script
main();
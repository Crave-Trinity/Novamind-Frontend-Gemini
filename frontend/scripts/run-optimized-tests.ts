#!/usr/bin/env ts-node
/**
 * NOVAMIND Optimized Test Runner
 * 
 * This script provides a complete solution for running the test suite
 * with optimized configuration and automatic fixing of hanging tests.
 */

/// <reference types="node" />

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Terminal colors for better readability
const Color = {
  Reset: '\x1b[0m',
  Red: '\x1b[31m',
  Green: '\x1b[32m',
  Yellow: '\x1b[33m',
  Blue: '\x1b[34m',
  Magenta: '\x1b[35m',
  Cyan: '\x1b[36m',
  Grey: '\x1b[90m'
};

// Flag to control automatic fixing
let autoFix = false;
// Flag to run only specific tests
let testPattern = '';

// Parse command-line arguments
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--fix') {
    autoFix = true;
  } else if (process.argv[i] === '--pattern' && i + 1 < process.argv.length) {
    testPattern = process.argv[i + 1];
    i++;
  }
}

/**
 * Print messages with color
 */
function log(message: string, color = Color.Reset) {
  console.log(`${color}${message}${Color.Reset}`);
}

/**
 * Run a command and return its result
 */
async function runCommand(command: string, args: string[]): Promise<{ code: number | null, output: string }> {
  return new Promise((resolve) => {
    const process = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    
    process.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text);
    });
    
    process.stderr?.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.error(text);
    });
    
    process.on('exit', (code) => {
      resolve({ code, output });
    });
  });
}

/**
 * Extract hanging test files from test output
 */
function extractHangingTests(output: string): string[] {
  const hangingTests: string[] = [];
  const regex = /src\/.*\.test\.(tsx?|jsx?).*hanging/g;
  
  let match;
  while ((match = regex.exec(output)) !== null) {
    const filePath = match[0].split(':')[0].trim();
    if (filePath && !hangingTests.includes(filePath)) {
      hangingTests.push(filePath);
    }
  }
  
  return hangingTests;
}

/**
 * Fix hanging tests
 */
async function fixHangingTests(testFiles: string[]): Promise<boolean> {
  if (testFiles.length === 0) {
    return true;
  }
  
  log(`\n🔧 Fixing ${testFiles.length} hanging tests...`, Color.Yellow);
  
  try {
    for (const file of testFiles) {
      log(`Fixing: ${file}`, Color.Yellow);
      await runCommand('npx', ['tsx', 'scripts/fix-page-tests.ts', file]);
    }
    return true;
  } catch (error) {
    log(`Error fixing tests: ${error}`, Color.Red);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  log('\n🧠 NOVAMIND QUANTUM TEST RUNNER', Color.Magenta);
  log('===================================\n');
  
  // Build the command arguments
  const args = ['tsx', 'scripts/test-hang-detector.ts'];
  if (testPattern) {
    args.push('--pattern', testPattern);
  }
  
  log(`Running tests with optimized configuration...`, Color.Cyan);
  
  // Run tests with the hang detector
  const { code, output } = await runCommand('npx', args);
  
  if (code !== 0) {
    log('\n❌ Some tests failed or hung.', Color.Red);
    
    if (autoFix) {
      // Extract hanging tests from output
      const hangingTests = extractHangingTests(output);
      
      if (hangingTests.length > 0) {
        log(`\nDetected ${hangingTests.length} hanging tests:`, Color.Yellow);
        hangingTests.forEach((test, i) => log(`${i + 1}. ${test}`, Color.Yellow));
        
        // Fix hanging tests
        const fixResult = await fixHangingTests(hangingTests);
        
        if (fixResult) {
          log('\n✅ All hanging tests fixed! Run tests again to verify.', Color.Green);
        } else {
          log('\n⚠️ Some tests could not be fixed automatically.', Color.Red);
          log('Please check docs/solutions/test-hanging-issues-fixed.md for manual solutions.', Color.Reset);
        }
      } else {
        log('\n⚠️ No hanging tests detected. Tests failed for other reasons.', Color.Red);
      }
    } else {
      log('\nTo automatically fix hanging tests, run with the --fix flag:', Color.Cyan);
      log('npx tsx scripts/run-optimized-tests.ts --fix', Color.Reset);
    }
  } else {
    log('\n✅ All tests passed successfully!', Color.Green);
  }
  
  log('\n💡 Usage Information:', Color.Blue);
  log('- Run all tests: npx tsx scripts/run-optimized-tests.ts', Color.Reset);
  log('- Auto-fix hanging tests: npx tsx scripts/run-optimized-tests.ts --fix', Color.Reset);
  log('- Run specific tests: npx tsx scripts/run-optimized-tests.ts --pattern "src/components/**/*.test.tsx"', Color.Reset);
  log('- Documentation: See docs/solutions/test-hanging-issues-fixed.md', Color.Reset);
}

// ES module approach for running as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log(`\nError: ${error}`, Color.Red);
    process.exit(1);
  });
}
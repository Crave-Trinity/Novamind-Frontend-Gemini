#!/usr/bin/env ts-node
/**
 * NOVAMIND Test Hang Detector & Runner
 * 
 * This script runs tests with specialized configuration to prevent hanging.
 * It analyzes test patterns, sets appropriate timeouts, and ensures
 * tests run in the correct order with proper resource cleanup.
 */

/// <reference types="node" />

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Terminal colors for better output readability
const Color = {
  Reset: '\x1b[0m',
  Red: '\x1b[31m',
  Green: '\x1b[32m',
  Yellow: '\x1b[33m',
  Blue: '\x1b[34m',
  Magenta: '\x1b[35m',
  Cyan: '\x1b[36m',
  Grey: '\x1b[90m'
} as const;

type ColorType = typeof Color[keyof typeof Color];

const log = (message: string, color: ColorType = Color.Reset): void => {
  console.log(`${color}${message}${Color.Reset}`);
};

// Configuration
const TEST_TIMEOUT_MS = 10000; // 10 seconds timeout for tests
const SRC_DIR = 'src';
const CONFIG_PATH = 'vitest.test-runner.config.ts';
const VISUALIZATION_PATTERNS = [
  'Brain',
  'Neural',
  'Visualization',
  'ThreeD',
  '3D',
  'Render',
  'Graph',
  'Chart',
  'Digital',
  'Twin',
  'Interactive',
  'Visual',
  'Region',
  'Assessment',
  'Panel',
  'Dashboard',
  'Timeline',
  'Metrics',
  'Stream',
  'Prediction',
  'Analytics',
  'Connection'
];

// Types for test categorization
type TestCategory = 'visualization' | 'standard' | 'minimal';
type TestFile = {
  path: string;
  category: TestCategory;
  priority: number; // Lower = run earlier
};

/**
 * Find all test files and categorize them
 */
async function findTestFiles(directory: string): Promise<TestFile[]> {
  const results: TestFile[] = [];
  
  function isVisualizationRelated(filePath: string): boolean {
    if (filePath.includes('minimal') || filePath.includes('sanity')) {
      return false;
    }
    
    const fileName = path.basename(filePath);
    return VISUALIZATION_PATTERNS.some(pattern => 
      fileName.includes(pattern) || 
      filePath.includes(`/${pattern}`) || 
      filePath.includes(`\\${pattern}`)
    );
  }
  
  function scanDirectory(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (
          (entry.name.endsWith('.test.tsx') || entry.name.endsWith('.test.ts'))
        ) {
          // Determine test category
          let category: TestCategory;
          let priority: number;
          
          if (fullPath.includes('minimal') || fullPath.includes('sanity')) {
            category = 'minimal';
            priority = 0; // Run minimal tests first
          } else if (isVisualizationRelated(fullPath)) {
            category = 'visualization';
            priority = 2; // Run visualization tests last
          } else {
            category = 'standard';
            priority = 1; // Run standard tests in the middle
          }
          
          results.push({ path: fullPath, category, priority });
        }
      }
    } catch (error) {
      log(`Error scanning directory ${dir}: ${error}`, Color.Red);
    }
  }
  
  scanDirectory(directory);
  
  // Sort by priority
  return results.sort((a, b) => a.priority - b.priority);
}

/**
 * Generate a Vitest configuration file optimized for preventing hangs
 */
function generateVitestConfig(): void {
  const configContent = `
import { defineConfig } from 'vitest/config';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      testTimeout: ${TEST_TIMEOUT_MS},
      hookTimeout: ${TEST_TIMEOUT_MS},
      isolate: true,
      threads: false,
      maxConcurrency: 1,
      reporters: ['default', 'json'],
      outputFile: {
        json: './test-reports/test-hang-results.json'
      },
      coverage: {
        reporter: ['text', 'json', 'html']
      }
    }
  })
);
`;

  fs.writeFileSync(CONFIG_PATH, configContent);
  log(`Generated optimized Vitest config at ${CONFIG_PATH}`, Color.Green);
}

/**
 * Run tests with a specialized configuration
 */
async function runTests(testFiles: TestFile[]): Promise<void> {
  log('\n🔍 NOVAMIND QUANTUM TEST RUNNER', Color.Magenta);
  log('===================================\n');
  
  // Group tests by category
  const minimalTests = testFiles.filter(t => t.category === 'minimal');
  const standardTests = testFiles.filter(t => t.category === 'standard');
  const visualizationTests = testFiles.filter(t => t.category === 'visualization');
  
  log(`Found ${testFiles.length} test files:`, Color.Cyan);
  log(`- ${minimalTests.length} minimal tests`, Color.Green);
  log(`- ${standardTests.length} standard tests`, Color.Blue);
  log(`- ${visualizationTests.length} visualization tests`, Color.Yellow);
  
  // Generate specialized Vitest config
  generateVitestConfig();
  
  // Test execution function
  const executeTests = async (tests: TestFile[], category: string, color: ColorType): Promise<boolean> => {
    return new Promise((resolve) => {
      log(`\nRunning ${tests.length} ${category} tests...`, color);
      
      // Create list of test files for Vitest
      const testPaths = tests.map(t => t.path);
      
      // Display the first 5 test files (for debugging)
      if (testPaths.length > 0) {
        log(`First ${Math.min(5, testPaths.length)} test files:`, Color.Grey);
        testPaths.slice(0, 5).forEach((p, i) => log(`${i + 1}. ${p}`, Color.Grey));
        if (testPaths.length > 5) {
          log(`...and ${testPaths.length - 5} more`, Color.Grey);
        }
      }
      
      const testProcess = spawn('npx', [
        'vitest', 'run', 
        '--config', CONFIG_PATH,
        ...testPaths
      ], {
        stdio: 'inherit' // This will show output in real-time
      });
      
      testProcess.on('exit', (code) => {
        if (code !== null && code !== 0) {
          log(`❌ ${category} tests failed with code ${code}`, Color.Red);
          resolve(false);
        } else {
          log(`✅ ${category} tests completed successfully`, Color.Green);
          resolve(true);
        }
      });
    });
  };
  
  // Run tests in the correct order to prevent resource contention
  log('\n🚀 STARTING TEST EXECUTION', Color.Magenta);
  log('===================================\n');
  
  let allPassed = true;
  
  // Run minimal tests first - these should always pass and be quick
  if (minimalTests.length > 0) {
    allPassed = allPassed && await executeTests(minimalTests, 'minimal', Color.Green);
  }
  
  // Run standard tests next
  if (standardTests.length > 0) {
    allPassed = allPassed && await executeTests(standardTests, 'standard', Color.Blue);
  }
  
  // Run visualization tests last, with special consideration
  if (visualizationTests.length > 0) {
    // Run visualization tests in smaller batches to prevent resource contention
    const BATCH_SIZE = 5;
    // Fix: Explicitly type the batches array
    const batches: TestFile[][] = [];
    
    for (let i = 0; i < visualizationTests.length; i += BATCH_SIZE) {
      batches.push(visualizationTests.slice(i, i + BATCH_SIZE));
    }
    
    log(`\nRunning visualization tests in ${batches.length} batches of ${BATCH_SIZE}`, Color.Yellow);
    
    for (let i = 0; i < batches.length; i++) {
      log(`\nBatch ${i + 1}/${batches.length}`, Color.Yellow);
      allPassed = allPassed && await executeTests(batches[i], `visualization (batch ${i + 1})`, Color.Yellow);
    }
  }
  
  // Clean up the config file
  try {
    fs.unlinkSync(CONFIG_PATH);
  } catch (e) {
    // Ignore errors
  }
  
  // Report results
  log('\n📊 TEST EXECUTION RESULTS', Color.Magenta);
  log('===================================\n');
  
  if (allPassed) {
    log('✅ All tests completed successfully!', Color.Green);
  } else {
    log('❌ Some tests failed. See above for details.', Color.Red);
  }
  
  log('\n💡 Recommendations:', Color.Cyan);
  log('1. For any failing visualization tests, apply the mocking pattern from docs/solutions/test-hanging-issues-fixed.md', Color.Reset);
  log('2. Run individual failing tests with: npx vitest run [test-path] --no-threads', Color.Reset);
  log('3. For persistent issues, use scripts/fix-page-tests.ts to auto-fix the hanging tests', Color.Reset);
}

// Main function
async function main() {
  try {
    // Find and categorize test files
    const testFiles = await findTestFiles(SRC_DIR);
    
    // Run tests in the correct order
    await runTests(testFiles);
  } catch (error) {
    log(`Error: ${error}`, Color.Red);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
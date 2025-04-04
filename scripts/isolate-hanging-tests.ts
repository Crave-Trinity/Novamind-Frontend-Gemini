#!/usr/bin/env ts-node
/**
 * NOVAMIND Test Hang Detector
 * 
 * This script identifies tests that are likely to hang by running them in isolation
 * with a timeout. Tests that exceed the timeout are flagged for mocking.
 */

// Add Node.js type reference at the top
/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawn } from 'child_process';
import * as readline from 'readline';

// Terminal colors for better output readability
const Color = {
  Reset: '\x1b[0m',
  Red: '\x1b[31m',
  Green: '\x1b[32m',
  Yellow: '\x1b[33m',
  Blue: '\x1b[34m',
  Magenta: '\x1b[35m',
  Cyan: '\x1b[36m'
} as const;

type ColorType = typeof Color[keyof typeof Color];

const log = (message: string, color: ColorType = Color.Reset): void => {
  console.log(`${color}${message}${Color.Reset}`);
};

// Configuration
const TEST_TIMEOUT_MS = 5000; // 5 seconds
const SRC_DIR = 'src';
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

// Already fixed tests
const ALREADY_FIXED_TESTS = [
  'src/presentation/pages/Login.test.tsx',
  'src/presentation/pages/PatientsList.test.tsx',
  'src/presentation/pages/Settings.test.tsx'
];

// Main functions
async function findTestFiles(directory: string): Promise<string[]> {
  const results: string[] = [];
  
  function isVisualizationRelated(filePath: string): boolean {
    // Check if the file is already in the fixed list
    if (ALREADY_FIXED_TESTS.includes(filePath)) {
      return false;
    }
    
    // Skip minimal test files
    if (filePath.includes('minimal') || filePath.includes('sanity')) {
      return false;
    }
    
    // Test if file matches any visualization patterns
    const fileName = path.basename(filePath);
    return VISUALIZATION_PATTERNS.some(pattern => 
      fileName.includes(pattern) || 
      filePath.includes(`/${pattern}`) || 
      filePath.includes(`\\${pattern}`)
    );
  }
  
  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (
        (entry.name.endsWith('.test.tsx') || entry.name.endsWith('.test.ts')) && 
        isVisualizationRelated(fullPath)
      ) {
        results.push(fullPath);
      }
    }
  }
  
  scanDirectory(directory);
  return results;
}

async function testFileForHanging(testFilePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    log(`Testing file for hanging: ${testFilePath}`, Color.Blue);
    
    const testProcess = spawn('npx', ['vitest', 'run', testFilePath, '--no-threads'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    
    testProcess.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    testProcess.stderr?.on('data', (data) => {
      output += data.toString();
    });
    
    // Set timeout to detect hanging tests
    const timeout = setTimeout(() => {
      log(`Test ${testFilePath} is hanging (exceeded ${TEST_TIMEOUT_MS}ms)`, Color.Red);
      testProcess.kill('SIGTERM');
      resolve(true); // Test is hanging
    }, TEST_TIMEOUT_MS);
    
    testProcess.on('exit', (code) => {
      clearTimeout(timeout);
      if (code !== null && code !== 0) {
        log(`Test ${testFilePath} failed with code ${code}`, Color.Yellow);
        resolve(false); // Test is not hanging, just failing
      } else {
        log(`Test ${testFilePath} completed successfully`, Color.Green);
        resolve(false); // Test is not hanging
      }
    });
  });
}

async function runTests() {
  log('\n🔍 NOVAMIND TEST HANG DETECTOR', Color.Magenta);
  log('===================================\n');
  
  // Find all test files related to visualizations
  const testFiles = await findTestFiles(SRC_DIR);
  log(`Found ${testFiles.length} visualization-related test files to analyze`, Color.Cyan);
  
  const hangingTests: string[] = [];
  
  // Test each file in isolation
  for (const testFile of testFiles) {
    const isHanging = await testFileForHanging(testFile);
    if (isHanging) {
      hangingTests.push(testFile);
    }
  }
  
  // Report results
  log('\n📊 ANALYSIS RESULTS', Color.Magenta);
  log('===================================\n');
  
  if (hangingTests.length === 0) {
    log('✅ No hanging tests detected!', Color.Green);
  } else {
    log(`❌ Found ${hangingTests.length} hanging tests:`, Color.Red);
    hangingTests.forEach((test, index) => {
      log(`${index + 1}. ${test}`, Color.Yellow);
    });
    
    // Generate mocking recommendations
    generateMockingRecommendations(hangingTests);
  }
}

function generateMockingRecommendations(hangingTests: string[]) {
  log('\n💡 RECOMMENDED ACTIONS', Color.Magenta);
  log('===================================\n');
  
  log('Apply the following mocking strategy to each hanging test:', Color.Cyan);
  log(`
1. Place all vi.mock() calls at the top of the file, before any imports
2. Mock all external hooks and context providers
3. Replace the actual component implementation with a controlled mock
4. Use a factory function to create different mock implementations for different tests
5. Clean up mocks in beforeEach/afterEach hooks
  `, Color.Reset);
  
  // Create a script to automatically fix the hanging tests
  const scriptContent = `#!/usr/bin/env ts-node
/**
 * NOVAMIND Hanging Test Fixer
 * 
 * Auto-generated script to fix hanging tests detected by isolate-hanging-tests.ts
 */

import { fixHangingTest } from './fix-page-tests';

// List of tests that need fixing
const testsToFix = [
  ${hangingTests.map(test => `  '${test}'`).join(',\n')}
];

// Run the fixer on each test
async function fixAllTests() {
  console.log('\\n🔧 FIXING HANGING TESTS');
  console.log('===================================\\n');
  
  for (const testPath of testsToFix) {
    await fixHangingTest(testPath);
  }
  
  console.log('\\n✅ All fixes applied!');
}

fixAllTests().catch(console.error);
`;

  // Write the script to a file
  const scriptPath = 'scripts/fix-hanging-tests.ts';
  fs.writeFileSync(scriptPath, scriptContent);
  
  log(`Script generated at ${scriptPath}`, Color.Green);
  log(`Run it with: npx tsx ${scriptPath}`, Color.Green);
}

// Run the main function
runTests().catch(console.error);
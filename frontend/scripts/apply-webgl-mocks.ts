/**
 * WebGL Mocks Application Script
 * 
 * This script automatically applies WebGL mocks to test files that are prone to hanging
 * due to Three.js/WebGL issues. It performs the following operations:
 * 
 * 1. Identifies tests that are likely to be problematic (Three.js/WebGL related)
 * 2. Adds the necessary imports for the WebGL mock system
 * 3. Adds setup/cleanup hooks to each test file
 * 4. Optionally runs the tests to verify they're now working
 * 
 * Usage:
 *   npx ts-node frontend/scripts/apply-webgl-mocks.ts [options]
 * 
 * Options:
 *   --dir=<path>    Directory to scan for test files (default: src/presentation/visualizations)
 *   --run           Run tests after patching them
 *   --files=<path>  Path to a file containing a list of test files to patch
 *   --verify        Run tests with timing info to verify no hanging
 */

// Add Node.js type reference
/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';
import { execSync, type ExecSyncOptions } from 'child_process';

// Configuration
const DEFAULT_TEST_DIR = 'src/presentation/visualizations';
const TEST_FILE_PATTERN = /\.(test|spec)\.(ts|tsx)$/;
const RISKY_PATTERN = /(three|3d|webgl|canvas|visual|region|brain|neural)/i;
const TIMEOUT_MS = 10000; // 10 seconds timeout for potentially hanging tests

// Parse command line args
const args = process.argv.slice(2);
const options = {
  dir: args.find(arg => arg.startsWith('--dir='))?.split('=')[1] || DEFAULT_TEST_DIR,
  run: args.includes('--run'),
  verify: args.includes('--verify'),
  files: args.find(arg => arg.startsWith('--files='))?.split('=')[1] || null,
};

/**
 * Find test files that match the criteria
 */
function findTestFiles(searchDir: string): string[] {
  console.log(`Scanning directory: ${searchDir}`);
  
  try {
    const result: string[] = [];
    const files = fs.readdirSync(searchDir);
    
    for (const file of files) {
      const fullPath = path.join(searchDir, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        result.push(...findTestFiles(fullPath));
      } else if (TEST_FILE_PATTERN.test(file)) {
        // Check if the file contains risky patterns
        const content = fs.readFileSync(fullPath, 'utf8');
        if (RISKY_PATTERN.test(content)) {
          result.push(fullPath);
        }
      }
    }
    
    return result;
  } catch (err) {
    console.error(`Error scanning directory ${searchDir}:`, err);
    return [];
  }
}

/**
 * Patch a test file to use WebGL mocks
 */
function patchTestFile(filePath: string): boolean {
  console.log(`Patching file: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already using our mocks
    if (content.includes('@test/webgl') || content.includes('setupWebGLMocks')) {
      console.log(`  File already uses WebGL mocks, skipping.`);
      return false;
    }
    
    // Add imports
    if (content.includes('vitest')) {
      // If using vitest directly
      content = content.replace(
        /import\s+\{([^}]+)\}\s+from\s+(['"])vitest\2/,
        (match, imports) => {
          const importList = imports.split(',')
            .map(i => i.trim())
            .filter(i => i.length > 0);
          
          // Add beforeEach and afterEach if not present
          if (!importList.includes('beforeEach')) importList.push('beforeEach');
          if (!importList.includes('afterEach')) importList.push('afterEach');
          
          return `import { ${importList.join(', ')} } from "vitest"`;
        }
      );
    } else {
      // If no vitest import, add it at the top
      content = `import { describe, it, expect, beforeEach, afterEach } from 'vitest';\n${content}`;
    }
    
    // Add WebGL mocks import
    if (!content.includes('@test/webgl')) {
      content = content.replace(
        /import[^;]+;(\s*)/, 
        (match) => `${match}import { setupWebGLMocks, cleanupWebGLMocks, ThreeMocks } from '@test/webgl';\n\n`
      );
    }
    
    // Add setup/cleanup hooks for each describe block
    content = content.replace(
      /describe\(\s*(['"])(.*)\1\s*,\s*(\(\s*\)\s*=>|function\s*\(\s*\)\s*)\s*{/g,
      (match, quote, name) => {
        return `${match}\n` +
        `  beforeEach(() => {\n` +
        `    setupWebGLMocks();\n` +
        `  });\n\n` +
        `  afterEach(() => {\n` +
        `    cleanupWebGLMocks();\n` +
        `  });\n`;
      }
    );
    
    // Write the updated file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  File successfully patched.`);
    return true;
  } catch (err) {
    console.error(`Error patching file ${filePath}:`, err);
    return false;
  }
}

/**
 * Run a test file and verify it doesn't hang
 */
function verifyTestFile(filePath: string): boolean {
  console.log(`Running test: ${filePath}`);
  
  try {
    // Run the test with a timeout
    const result = execSync(`npx vitest run ${filePath} --silent`, {
      timeout: TIMEOUT_MS,
      stdio: 'inherit',
    });
    
    console.log(`  Test passed without hanging.`);
    return true;
  } catch (err) {
    console.error(`  Test failed or timed out: ${filePath}`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  let testFiles: string[] = [];
  
  // Get test files from file list or by scanning
  if (options.files) {
    console.log(`Reading test files from: ${options.files}`);
    const fileList = fs.readFileSync(options.files, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    testFiles = fileList;
  } else {
    console.log(`Finding test files in: ${options.dir}`);
    testFiles = findTestFiles(options.dir);
  }
  
  console.log(`Found ${testFiles.length} test files to patch.`);
  
  // Process each file
  let patched = 0;
  let verified = 0;
  
  for (const file of testFiles) {
    const didPatch = patchTestFile(file);
    if (didPatch) patched++;
    
    if ((options.run || options.verify) && didPatch) {
      const didPass = verifyTestFile(file);
      if (didPass) verified++;
    }
  }
  
  // Report results
  console.log('\nResults:');
  console.log(`  Total files examined: ${testFiles.length}`);
  console.log(`  Files patched: ${patched}`);
  
  if (options.run || options.verify) {
    console.log(`  Tests verified: ${verified}/${patched}`);
  }
}

// Execute
main().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});

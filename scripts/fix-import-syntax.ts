/**
 * Import Syntax Fixer
 * Fixes corrupted import statements in test files
 */

import fs from 'fs/promises';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Setup for ESM compatibility
const require = createRequire(import.meta.url);
const Glob = require('glob').Glob;

// Define pattern to search for test files
const TEST_FILE_PATTERN = 'src/**/*.test.{ts,tsx}';

/**
 * Find files matching a pattern
 * @param pattern Glob pattern
 * @param baseDir Base directory
 * @returns Array of file paths
 */
async function findFiles(pattern: string, baseDir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    new Glob(pattern, { cwd: baseDir }, (err: Error | null, matches: string[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(matches);
      }
    });
  });
}

/**
 * Fix corrupted import statements in a file
 * @param filePath Path to the file to fix
 * @returns true if file was fixed, false otherwise
 */
function fixImportSyntax(filePath: string): boolean {
  try {
    // Read file content (using sync for simplicity)
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for corrupted import patterns
    const hasCorruptedImport = content.includes('import { import {') || 
                               content.match(/}\s*from\s*"[^"]*";\s*}\s*from\s*"[^"]*";/);
    
    if (!hasCorruptedImport) {
      return false;
    }
    
    console.log(`Fixing corrupted imports in: ${filePath}`);
    
    // Fix patterns
    let fixedContent = content;
    
    // Fix double import patterns
    fixedContent = fixedContent.replace(/import\s*{\s*import\s*{/g, 'import {');
    
    // Fix double closing import patterns
    fixedContent = fixedContent.replace(/}\s*from\s*"[^"]*";\s*}\s*from\s*"[^"]*";/g, '} from "";');
    
    // Write fixed content back to file (using sync for simplicity)
    writeFileSync(filePath, fixedContent, 'utf-8');
    
    return true;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🧠 NOVAMIND Import Syntax Fixer');
  console.log('------------------------------------------');
  
  // Get base directory
  const baseDir = process.cwd();
  console.log(`Scanning directory: ${baseDir}`);
  
  // Find all test files
  const files = await findFiles(TEST_FILE_PATTERN, baseDir);
  console.log(`Found ${files.length} test files to process.`);
  console.log('------------------------------------------');
  
  // Process each file
  let fixedCount = 0;
  for (const file of files) {
    const filePath = path.join(baseDir, file);
    const wasFixed = fixImportSyntax(filePath);
    if (wasFixed) {
      fixedCount++;
    }
  }
  
  // Print summary
  console.log('------------------------------------------');
  console.log('Fix Summary:');
  console.log(`  Total test files found: ${files.length}`);
  console.log(`  Files fixed: ${fixedCount}`);
  console.log(`  Files unchanged: ${files.length - fixedCount}`);
}

// Run the script
main().catch(console.error);

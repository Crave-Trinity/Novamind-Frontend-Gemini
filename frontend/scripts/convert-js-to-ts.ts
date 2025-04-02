/**
 * Convert JavaScript files to TypeScript
 * This script converts JavaScript files in the scripts directory to TypeScript with ESM syntax
 */

import fs from 'fs/promises';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Setup for ESM compatibility
const require = createRequire(import.meta.url);
const Glob = require('glob').Glob;

// Define pattern to search for JavaScript files
const JS_FILE_PATTERN = 'scripts/*.js';

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
 * Convert a JavaScript file to TypeScript
 * @param filePath Path to the JavaScript file
 * @returns true if file was converted, false otherwise
 */
function convertJsToTs(filePath: string): boolean {
  try {
    // Skip if already converted
    const tsFilePath = filePath.replace(/\.js$/, '.ts');
    if (existsSync(tsFilePath)) {
      console.log(`Skipping ${filePath} - TypeScript version already exists`);
      return false;
    }

    // Read file content
    const content = readFileSync(filePath, 'utf-8');
    
    // Convert CommonJS to ESM
    let tsContent = content;
    
    // Replace require statements with import statements
    tsContent = tsContent.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 'import $1 from "$2";');
    
    // Replace module.exports with export default
    tsContent = tsContent.replace(/module\.exports\s*=\s*/g, 'export default ');
    
    // Add TypeScript type annotations
    tsContent = tsContent.replace(/function\s+(\w+)\s*\(([^)]*)\)/g, (match, funcName, params) => {
      // Simple type annotation for parameters and return type
      const typedParams = params.split(',')
        .map((param: string) => param.trim() ? `${param.trim()}: any` : '')
        .join(', ');
      return `function ${funcName}(${typedParams}): any`;
    });
    
    // Write TypeScript file
    console.log(`Converting ${filePath} to TypeScript`);
    writeFileSync(tsFilePath, tsContent, 'utf-8');
    
    return true;
  } catch (error) {
    console.error(`Error converting ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🧠 NOVAMIND JavaScript to TypeScript Converter');
  console.log('------------------------------------------');
  
  // Get base directory
  const baseDir = process.cwd();
  console.log(`Scanning directory: ${baseDir}`);
  
  // Find all JavaScript files
  const files = await findFiles(JS_FILE_PATTERN, baseDir);
  console.log(`Found ${files.length} JavaScript files to process.`);
  console.log('------------------------------------------');
  
  // Process each file
  let convertedCount = 0;
  for (const file of files) {
    const filePath = path.join(baseDir, file);
    const wasConverted = convertJsToTs(filePath);
    if (wasConverted) {
      convertedCount++;
    }
  }
  
  // Print summary
  console.log('------------------------------------------');
  console.log('Conversion Summary:');
  console.log(`  Total JavaScript files found: ${files.length}`);
  console.log(`  Files converted: ${convertedCount}`);
  console.log(`  Files skipped: ${files.length - convertedCount}`);
  console.log('------------------------------------------');
  console.log('Next steps:');
  console.log('1. Review the converted TypeScript files');
  console.log('2. Add proper type annotations');
  console.log('3. Update package.json scripts to use the TypeScript versions');
  console.log('4. Test the TypeScript scripts');
}

// Run the script
main().catch(console.error);
/**
 * Type Import Path Fixer
 * Fixes import paths from @types/ to @domain/types/
 */

import fs from 'fs/promises';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Setup for ESM compatibility
const require = createRequire(import.meta.url);
const Glob = require('glob').Glob;

// Define pattern to search for files with @types/ imports
const FILE_PATTERN = 'src/**/*.{ts,tsx}';

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
 * Fix import paths in a file
 * @param filePath Path to the file to fix
 * @returns true if file was fixed, false otherwise
 */
function fixImportPaths(filePath: string): boolean {
  try {
    // Read file content (using sync for simplicity)
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for @types/ imports
    const hasTypesImport = content.includes('from "@types/');
    
    if (!hasTypesImport) {
      return false;
    }
    
    // Fix import paths
    let fixedContent = content;
    
    // Replace @types/ with @domain/types/
    const oldImportRegex = /from\s+["']@types\/([^"']+)["']/g;
    fixedContent = fixedContent.replace(oldImportRegex, 'from "@domain/types/$1"');
    
    // Check if there are duplicate imports after the replacement
    const lines = fixedContent.split('\n');
    const importLines = new Map<string, number[]>();
    
    // Find all import lines and group them by import path
    lines.forEach((line, index) => {
      const importMatch = line.match(/import\s+.*\s+from\s+["'](@domain\/types\/[^"']+)["']/);
      if (importMatch) {
        const importPath = importMatch[1];
        if (!importLines.has(importPath)) {
          importLines.set(importPath, []);
        }
        importLines.get(importPath)!.push(index);
      }
    });
    
    // Remove duplicate imports
    const linesToRemove = new Set<number>();
    importLines.forEach((indices, importPath) => {
      if (indices.length > 1) {
        // Keep the first occurrence, mark others for removal
        for (let i = 1; i < indices.length; i++) {
          linesToRemove.add(indices[i]);
        }
      }
    });
    
    // Filter out the lines to remove
    if (linesToRemove.size > 0) {
      fixedContent = lines
        .filter((_, index) => !linesToRemove.has(index))
        .join('\n');
    }
    
    // Only write if content has changed
    if (fixedContent !== content) {
      console.log(`Fixing imports in: ${filePath}`);
      writeFileSync(filePath, fixedContent, 'utf-8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🧠 NOVAMIND Type Import Path Fixer');
  console.log('------------------------------------------');
  
  // Get base directory
  const baseDir = process.cwd();
  console.log(`Scanning directory: ${baseDir}`);
  
  // Find all TypeScript files
  const files = await findFiles(FILE_PATTERN, baseDir);
  console.log(`Found ${files.length} TypeScript files to process.`);
  console.log('------------------------------------------');
  
  // Process each file
  let fixedCount = 0;
  for (const file of files) {
    const filePath = path.join(baseDir, file);
    const wasFixed = fixImportPaths(filePath);
    if (wasFixed) {
      fixedCount++;
    }
  }
  
  // Print summary
  console.log('------------------------------------------');
  console.log('Fix Summary:');
  console.log(`  Total TypeScript files found: ${files.length}`);
  console.log(`  Files fixed: ${fixedCount}`);
  console.log(`  Files unchanged: ${files.length - fixedCount}`);
}

// Run the script
main().catch(console.error);
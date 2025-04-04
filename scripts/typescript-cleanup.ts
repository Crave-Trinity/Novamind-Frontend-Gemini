/**
 * NOVAMIND TypeScript Cleanup Tool
 * 
 * This script identifies JavaScript files that have TypeScript equivalents
 * and optionally deletes them to maintain a TypeScript-only codebase.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');

// Configuration
const rootDir = path.resolve(process.cwd());
const srcDir = path.join(rootDir, 'src');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

/**
 * Log a message with optional color
 */
function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Find all JavaScript files in the project
 */
function findJavaScriptFiles(rootDir: string): string[] {
  try {
    const cmd = `find ${rootDir} -name "*.js" | grep -v "node_modules" | grep -v "dist"`;
    const output = execSync(cmd, { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error(`Error finding JavaScript files: ${error}`);
    return [];
  }
}

/**
 * Check if a TypeScript equivalent exists for a JavaScript file
 */
function hasTypeScriptEquivalent(jsFilePath: string): { hasEquivalent: boolean; tsFilePath: string } {
  // Get the base name and directory
  const dir = path.dirname(jsFilePath);
  const baseName = path.basename(jsFilePath, '.js');
  
  // Check for .ts equivalent
  const tsFilePath = path.join(dir, `${baseName}.ts`);
  if (fs.existsSync(tsFilePath)) {
    return { hasEquivalent: true, tsFilePath };
  }
  
  // Check for .tsx equivalent (for React components)
  const tsxFilePath = path.join(dir, `${baseName}.tsx`);
  if (fs.existsSync(tsxFilePath)) {
    return { hasEquivalent: true, tsFilePath: tsxFilePath };
  }
  
  // Special case for .minimal.test.js files
  if (baseName.endsWith('.minimal.test')) {
    const baseWithoutExt = baseName.replace('.minimal.test', '');
    const tsMinimalTestPath = path.join(dir, `${baseWithoutExt}.minimal.test.ts`);
    const tsxMinimalTestPath = path.join(dir, `${baseWithoutExt}.minimal.test.tsx`);
    
    if (fs.existsSync(tsMinimalTestPath)) {
      return { hasEquivalent: true, tsFilePath: tsMinimalTestPath };
    }
    
    if (fs.existsSync(tsxMinimalTestPath)) {
      return { hasEquivalent: true, tsFilePath: tsxMinimalTestPath };
    }
  }
  
  // No TypeScript equivalent found
  return { hasEquivalent: false, tsFilePath: '' };
}

/**
 * Delete a JavaScript file
 */
function deleteJavaScriptFile(filePath: string): boolean {
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}: ${error}`);
    return false;
  }
}

/**
 * Main function to clean up JavaScript files
 */
function cleanupJavaScriptFiles(rootDir: string, options: { dryRun: boolean; verbose: boolean }): void {
  const { dryRun, verbose } = options;
  
  log('🧠 NOVAMIND TypeScript Cleanup Tool', 'bright');
  log('------------------------------------------', 'dim');
  log(`Scanning directory: ${rootDir}`);
  
  if (dryRun) {
    log('Running in DRY RUN mode - no files will be modified', 'yellow');
  }
  
  // Find all JavaScript files
  const jsFiles = findJavaScriptFiles(rootDir);
  log(`Found ${jsFiles.length} JavaScript files to process.`);
  
  // Track files to delete and keep
  const filesToDelete: string[] = [];
  const filesToKeep: string[] = [];
  
  // Process each JavaScript file
  for (const jsFilePath of jsFiles) {
    const { hasEquivalent, tsFilePath } = hasTypeScriptEquivalent(jsFilePath);
    
    if (hasEquivalent) {
      if (verbose) {
        log('Found JavaScript file with TypeScript equivalent:', 'green');
        log(`  JavaScript: ${jsFilePath}`, 'dim');
        log(`  TypeScript: ${tsFilePath}`, 'dim');
      }
      
      if (!dryRun) {
        log(`  Deleting JavaScript file...`, 'yellow');
        deleteJavaScriptFile(jsFilePath);
      }
      
      filesToDelete.push(jsFilePath);
    } else {
      if (verbose) {
        log(`JavaScript file without TypeScript equivalent: ${jsFilePath}`, 'dim');
      }
      
      filesToKeep.push(jsFilePath);
    }
  }
  
  // Summary
  log('------------------------------------------', 'dim');
  log('Cleanup Summary:', 'bright');
  log(`  Total JavaScript files found: ${jsFiles.length}`);
  log(`  Files to delete: ${filesToDelete.length}`, filesToDelete.length > 0 ? 'green' : 'dim');
  log(`  Files to keep: ${filesToKeep.length}`, 'dim');
  
  if (dryRun && filesToDelete.length > 0) {
    log('\nTo actually delete these files, run without the --dry-run flag.', 'yellow');
  }
}

// Run the cleanup
cleanupJavaScriptFiles(rootDir, { dryRun, verbose });

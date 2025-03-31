/**
 * Fix Theme-related imports in test files
 * 
 * This script handles fixing imports for ThemeContext and ThemeProvider
 * which often have import issues in the test files
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

// Setup for ESM compatibility
const require = createRequire(import.meta.url);
const glob = require('glob');

async function findFiles(pattern: string, baseDir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, { cwd: baseDir }, (err: Error | null, matches: string[]) => {
      if (err) reject(err);
      else resolve(matches);
    });
  });
}

function fixThemeImports(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Detect problematic imports
    const hasThemeContextImport = content.includes('ThemeContext');
    const hasThemeProviderImport = content.includes('ThemeProvider');
    
    if (!hasThemeContextImport && !hasThemeProviderImport) {
      return false;
    }
    
    // Fix imports
    let fixedContent = content;
    
    // Fix import errors by using the direct export approach
    const badImportPatterns = [
      /import.*ThemeProvider.*from.*['"](\.\.\/)+contexts\/ThemeContext['"];/g,
      /import.*\{.*ThemeProvider.*\}.*from.*['"](\.\.\/)+contexts\/ThemeContext['"];/g,
      /import.*ThemeContext.*\{.*ThemeProvider.*\}.*from.*['"](\.\.\/)+contexts\/ThemeContext['"];/g
    ];
    
    for (const pattern of badImportPatterns) {
      if (pattern.test(fixedContent)) {
        // Replace with correct imports
        fixedContent = fixedContent.replace(pattern, (match) => {
          const importPath = match.match(/(['"]\.\.\/.*?['"])/)?.[1] || '""';
          return `// Fixed imports for Theme components
import ThemeContext from ${importPath};
import { ThemeProvider } from ${importPath};`;
        });
        
        console.log(`Fixed ThemeContext imports in: ${filePath}`);
        break;
      }
    }
    
    // Write back the fixed content if changes were made
    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf-8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('🧠 NOVAMIND Theme Import Fixer');
  console.log('------------------------------------------');
  
  const baseDir = process.cwd();
  console.log(`Working directory: ${baseDir}`);
  
  // Find all TypeScript test files
  const testFiles = await findFiles('src/**/*.test.{ts,tsx}', baseDir);
  console.log(`Found ${testFiles.length} test files`);
  
  // Also check utility files that might use ThemeContext
  const utilFiles = await findFiles('src/test/**/*.{ts,tsx}', baseDir);
  console.log(`Found ${utilFiles.length} test utility files`);
  
  const allFiles = [...testFiles, ...utilFiles];
  console.log(`Processing ${allFiles.length} total files`);
  console.log('------------------------------------------');
  
  // Process each file
  let fixedCount = 0;
  for (const file of allFiles) {
    const filePath = path.join(baseDir, file);
    const wasFixed = fixThemeImports(filePath);
    if (wasFixed) {
      fixedCount++;
    }
  }
  
  console.log('------------------------------------------');
  console.log('Summary:');
  console.log(`  Files processed: ${allFiles.length}`);
  console.log(`  Files fixed: ${fixedCount}`);
}

main().catch(console.error);

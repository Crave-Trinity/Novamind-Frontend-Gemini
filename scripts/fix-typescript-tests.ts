/**
 * NOVAMIND TypeScript Test Fixer
 * 
 * This script automatically fixes common TypeScript issues in test files
 * to ensure a TypeScript-only codebase with proper type safety.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get proper ESM-compatible directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Define TypeScript interfaces for our fix process
interface FixOptions {
  dryRun: boolean;
  verbose: boolean;
  rootDir: string;
  pattern: string;
}

interface TestFile {
  path: string;
  content: string;
  fixedContent?: string;
  issues: string[];
}

// Common TypeScript import fixes
const importFixes = [
  // Fix default imports that should be named imports
  {
    pattern: /import\s+(\w+)\s+from\s+['"](.+)['"];/g,
    replacement: (match: string, importName: string, importPath: string) => {
      // Skip React imports, which are correctly default imports
      if (importPath === 'react' && importName === 'React') {
        return match;
      }
      
      return `import { ${importName} } from "${importPath}";`;
    }
  },
  
  // Add missing imports
  {
    pattern: /RiskLevel\./g,
    check: (content: string) => !content.includes('import { RiskLevel }'),
    replacement: (match: string, content: string) => {
      if (typeof content !== 'string') {
        console.error('Content is not a string:', content);
        return match;
      }
      
      const importStatement = 'import { RiskLevel } from "../../domain/types/RiskLevel";\n';
      
      // Find the last import statement
      const lastImportIndex = content.lastIndexOf('import');
      if (lastImportIndex === -1) {
        return content;
      }
      
      const lastImportLineEnd = content.indexOf(';', lastImportIndex) + 1;
      
      return content.slice(0, lastImportLineEnd) + 
             '\n' + importStatement + 
             content.slice(lastImportLineEnd);
    }
  },
  
  // Add missing patient types import
  {
    pattern: /PatientData/g,
    check: (content: string) => !content.includes('import { PatientData }'),
    replacement: (match: string, content: string) => {
      if (typeof content !== 'string') {
        console.error('Content is not a string:', content);
        return match;
      }
      
      const importStatement = 'import { PatientData } from "../../domain/types/patient";\n';
      
      // Find the last import statement
      const lastImportIndex = content.lastIndexOf('import');
      if (lastImportIndex === -1) {
        return content;
      }
      
      const lastImportLineEnd = content.indexOf(';', lastImportIndex) + 1;
      
      return content.slice(0, lastImportLineEnd) + 
             '\n' + importStatement + 
             content.slice(lastImportLineEnd);
    }
  }
];

// Common TypeScript interface fixes
const interfaceFixes = [
  // Fix LoadingIndicator props
  {
    pattern: /"(small|medium|large)"/g,
    check: (content: string) => content.includes('LoadingIndicator'),
    replacement: (match: string, size: string) => {
      const sizeMap: Record<string, string> = {
        'small': 'sm',
        'medium': 'md',
        'large': 'lg'
      };
      
      return `"${sizeMap[size] || size}"`;
    }
  },
  
  // Fix BrainRegion interface
  {
    pattern: /\{\s*id:\s*['"]region-\d+['"]\s*,\s*name:\s*['"][^'"]+['"]\s*,\s*activityLevel:\s*[\d\.]+\s*\}/g,
    check: (content: string) => content.includes('BrainRegion'),
    replacement: (match: string) => {
      // Extract the existing properties
      const idMatch = match.match(/id:\s*['"]([^'"]+)['"]/);
      const nameMatch = match.match(/name:\s*['"]([^'"]+)['"]/);
      const activityLevelMatch = match.match(/activityLevel:\s*([\d\.]+)/);
      
      const id = idMatch ? idMatch[1] : 'region-1';
      const name = nameMatch ? nameMatch[1] : 'Unknown Region';
      const activityLevel = activityLevelMatch ? parseFloat(activityLevelMatch[1]) : 0.5;
      
      // Create a complete BrainRegion object
      return `{
        id: "${id}",
        name: "${name}",
        activityLevel: ${activityLevel},
        position: { x: 0, y: 0, z: 0 },
        color: "#4285F4",
        connections: [],
        isActive: ${activityLevel > 0.5}
      }`;
    }
  }
];

// Common TypeScript method fixes
const methodFixes = [
  // Fix RiskAssessmentService.assessRisk calls
  {
    pattern: /RiskAssessmentService\.assessRisk/g,
    replacement: 'RiskAssessmentService.getInstance().assessRisk'
  }
];

/**
 * Find all TypeScript test files in the project
 */
function findTestFiles(rootDir: string, pattern: string): string[] {
  // Handle pattern with braces by expanding it
  let findPattern = pattern;
  if (pattern.includes('{') && pattern.includes('}')) {
    // Extract the pattern parts
    const match = pattern.match(/(.*)\.test\.\{([^}]+)\}$/);
    if (match) {
      const prefix = match[1];
      const extensions = match[2].split(',');
      
      // Use multiple find commands and combine results
      const results: string[] = [];
      for (const ext of extensions) {
        const cmd = `find ${rootDir} -name "${prefix}.test.${ext}" | grep -v "node_modules" | grep -v "dist"`;
        try {
          const output = execSync(cmd, { encoding: 'utf8' });
          results.push(...output.split('\n').filter(Boolean));
        } catch (error) {
          // Ignore errors if no files match
        }
      }
      return results;
    }
  }
  
  // Fall back to direct pattern if no braces or if extraction failed
  try {
    const cmd = `find ${rootDir} -name "${findPattern}" | grep -v "node_modules" | grep -v "dist"`;
    const output = execSync(cmd, { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error(`Error finding files: ${error}`);
    return [];
  }
}

/**
 * Fix TypeScript issues in a test file
 */
function fixTestFile(filePath: string, options: FixOptions): TestFile {
  const { dryRun, verbose } = options;
  
  const content = fs.readFileSync(filePath, 'utf8');
  let fixedContent = content;
  const issues: string[] = [];
  
  // Apply import fixes
  for (const fix of importFixes) {
    if (fix.check && !fix.check(fixedContent)) {
      continue;
    }
    
    if (fix.pattern.test(fixedContent)) {
      if (typeof fix.replacement === 'function' && fix.replacement.length === 3) {
        // This is a global content replacement
        const originalContent = fixedContent;
        try {
          // Call the replacement function with the match and content
          fixedContent = fix.replacement('', fixedContent, '');
          
          if (originalContent !== fixedContent) {
            issues.push(`Fixed import: ${fix.pattern}`);
          }
        } catch (error) {
          console.error(`Error applying fix to ${filePath}:`, error);
        }
      } else {
        // This is a pattern replacement
        const originalContent = fixedContent;
        try {
          fixedContent = fixedContent.replace(fix.pattern, fix.replacement as any);
          
          if (originalContent !== fixedContent) {
            issues.push(`Fixed import: ${fix.pattern}`);
          }
        } catch (error) {
          console.error(`Error applying fix to ${filePath}:`, error);
        }
      }
    }
  }
  
  // Apply interface fixes
  for (const fix of interfaceFixes) {
    if (fix.check && !fix.check(fixedContent)) {
      continue;
    }
    
    if (fix.pattern.test(fixedContent)) {
      const originalContent = fixedContent;
      try {
        fixedContent = fixedContent.replace(fix.pattern, fix.replacement as any);
        
        if (originalContent !== fixedContent) {
          issues.push(`Fixed interface: ${fix.pattern}`);
        }
      } catch (error) {
        console.error(`Error applying interface fix to ${filePath}:`, error);
      }
    }
  }
  
  // Apply method fixes
  for (const fix of methodFixes) {
    if (fix.pattern.test(fixedContent)) {
      const originalContent = fixedContent;
      try {
        fixedContent = fixedContent.replace(fix.pattern, fix.replacement as any);
        
        if (originalContent !== fixedContent) {
          issues.push(`Fixed method: ${fix.pattern}`);
        }
      } catch (error) {
        console.error(`Error applying method fix to ${filePath}:`, error);
      }
    }
  }
  
  // Write the fixed content back to the file
  if (!dryRun && issues.length > 0) {
    fs.writeFileSync(filePath, fixedContent);
  }
  
  return {
    path: filePath,
    content,
    fixedContent: issues.length > 0 ? fixedContent : undefined,
    issues
  };
}

/**
 * Fix TypeScript issues in all test files
 */
function fixTypeScriptTests(options: FixOptions): void {
  const { dryRun, verbose, rootDir, pattern } = options;
  
  console.log('🧠 NOVAMIND TypeScript Test Fixer');
  console.log('------------------------------------------');
  console.log(`Scanning directory: ${rootDir}`);
  console.log(`Pattern: ${pattern}`);
  
  if (dryRun) {
    console.log('Running in DRY RUN mode - no files will be modified');
  }
  
  // Find all TypeScript test files
  const testFiles = findTestFiles(rootDir, pattern);
  
  if (testFiles.length === 0) {
    console.log('No TypeScript test files found.');
    return;
  }
  
  console.log(`Found ${testFiles.length} TypeScript test files to process.`);
  
  // Process each test file
  let fixedCount = 0;
  let unchangedCount = 0;
  
  for (const filePath of testFiles) {
    if (verbose) {
      console.log(`\nProcessing: ${filePath}`);
    }
    
    const result = fixTestFile(filePath, options);
    
    if (result.issues.length > 0) {
      console.log(`\nFixed TypeScript issues in: ${path.relative(rootDir, filePath)}`);
      
      for (const issue of result.issues) {
        console.log(`  - ${issue}`);
      }
      
      fixedCount++;
    } else {
      if (verbose) {
        console.log(`No issues found in: ${path.relative(rootDir, filePath)}`);
      }
      
      unchangedCount++;
    }
  }
  
  console.log('\n------------------------------------------');
  console.log('Fix Summary:');
  console.log(`  Total TypeScript test files found: ${testFiles.length}`);
  console.log(`  Files fixed: ${fixedCount}`);
  console.log(`  Files unchanged: ${unchangedCount}`);
  
  if (dryRun && fixedCount > 0) {
    console.log('\nTo actually fix these files, run without the --dry-run flag.');
  }
}

// Run the fix process if this script is executed directly
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const pattern = args.find(arg => !arg.startsWith('--') && arg.includes('*')) || '*.test.{ts,tsx}';
const rootDir = args.find(arg => !arg.startsWith('--') && !arg.includes('*')) || path.resolve(projectRoot, 'src');

fixTypeScriptTests({
  dryRun,
  verbose,
  rootDir: path.resolve(rootDir),
  pattern
});

/**
 * NOVAMIND Neural Architecture
 * Standardize Test Imports with Quantum Precision
 * 
 * This script updates all test files to use standardized path aliases
 * ensuring neural-safe imports with mathematical elegance.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Constants with neural precision
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

console.log('🧠 NOVAMIND TEST IMPORT STANDARDIZATION');
console.log('Implementing neural-safe import patterns with quantum precision...\n');

// Find all test files with clinical precision
function findTestFiles(directory: any): any {
  const results = [];
  
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search subdirectories, excluding node_modules
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        results.push(...findTestFiles(filePath));
      }
    } else if (
      (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) && 
      !file.includes('d.ts')
    ) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Standardize imports in a test file with quantum precision
function standardizeImports(filePath: any): any {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;
    
    // Replace relative Three.js mock imports with path alias
    const relativeImportRegexes = [
      /import\s+['"](\.\.\/)+test\/unified-three\.mock['"];?/g,
      /import\s+['"](\.\.\/)+test\/three\.mock['"];?/g,
      /import\s+['"](\.\.\/)+test\/temporary-three\.mock['"];?/g,
      /import\s+['"](\.\.\/)+test\/setup['"];?/g,
      /import\s+['"](\.\.\/)+test\/neural-setup['"];?/g
    ];
    
    // Update all Three.js mock imports to use @test alias
    relativeImportRegexes.forEach(regex => {
      if (regex.test(content)) {
        if (content.includes('unified-three.mock')) {
          content = content.replace(regex, `import '@test/unified-three.mock';`);
        } else if (content.includes('neural-setup')) {
          content = content.replace(regex, `import '@test/neural-setup';`);
        } else if (content.includes('setup')) {
          content = content.replace(regex, `import '@test/neural-setup';`);
        } else {
          content = content.replace(regex, `import '@test/unified-three.mock';`);
        }
        hasChanges = true;
      }
    });
    
    // Write back if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing file: ${filePath}`);
    console.error(error.message);
    return false;
  }
}

// Execute standardization with clinical precision
async function executeStandardization(): any {
  console.log('🔍 Finding test files with neural precision...');
  const testFiles = findTestFiles(SRC_DIR);
  console.log(`Found ${testFiles.length} test files to process`);
  
  let updatedCount = 0;
  
  console.log('\n🔄 Standardizing imports with quantum precision...');
  
  testFiles.forEach(filePath => {
    const updated = standardizeImports(filePath);
    
    if (updated) {
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      console.log(`✅ Updated: ${relativePath}`);
      updatedCount++;
    }
  });
  
  console.log(`\n✅ Updated imports in ${updatedCount} test files with neural precision`);
  console.log(`🧮 ${testFiles.length - updatedCount} files already using standardized imports`);
  
  // Create a README file to document the test infrastructure
  createTestReadme();
}

// Create a README file for the test infrastructure
function createTestReadme(): any {
  console.log('\n📝 Creating test infrastructure documentation with clinical precision...');
  
  const readmePath = path.join(SRC_DIR, 'test', 'README.md');
  
  const readmeContent = `# NOVAMIND Neural-Safe Testing Infrastructure

## Overview

This directory contains the unified testing infrastructure for the NOVAMIND Digital Twin frontend, implemented with quantum precision and clinical accuracy.

## Key Components

- \`unified-three.mock.ts\`: Single source of truth for Three.js mocking with quantum precision
- \`neural-setup.ts\`: Unified test setup with comprehensive jsdom environment configuration

## Usage Guidelines

1. Always import the unified Three.js mock using the path alias:
   \`\`\`typescript
   import '@test/unified-three.mock';
   \`\`\`

2. Import the neural setup in your tests:
   \`\`\`typescript
   import '@test/neural-setup';
   \`\`\`

3. Use the vitest.unified.js configuration for all tests:
   \`\`\`bash
   npx vitest run --config vitest.unified.js
   \`\`\`

## Module System

All tests use ES Modules for compatibility with the project's module system.

## Path Aliases

All imports should use the standardized path aliases defined in tsconfig.json:

- \`@domain/*\`: Domain layer components
- \`@application/*\`: Application layer components
- \`@presentation/*\`: Presentation layer components
- \`@infrastructure/*\`: Infrastructure layer components
- \`@test/*\`: Test utilities and mocks

## Neural-Safe Testing Best Practices

1. Use atomic tests focusing on a single component behavior
2. Mock external dependencies with clinical precision
3. Test visualization components with quantum-level accuracy
4. Implement clean setup and teardown for each test
5. Use type-safe assertions for all validations

`;
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`✅ Created: ${path.relative(PROJECT_ROOT, readmePath)}`);
}

// Execute standardization with quantum precision
executeStandardization();

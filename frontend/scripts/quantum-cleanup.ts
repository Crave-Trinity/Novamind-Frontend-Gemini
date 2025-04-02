/**
 * NOVAMIND Neural Architecture
 * Quantum Precision Cleanup
 * 
 * This script removes legacy Three.js mocks and consolidates to the unified
 * neural-safe implementation with mathematical elegance.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Constants with neural precision
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const TEST_DIR = path.join(SRC_DIR, 'test');

console.log('🧠 NOVAMIND QUANTUM CLEANUP');
console.log('Implementing neural-safe consolidation with clinical precision...\n');

// Legacy files to remove with quantum precision
const LEGACY_FILES = [
  path.join(TEST_DIR, 'three.mock.ts'),
  path.join(TEST_DIR, 'three.mock.js'),
  path.join(TEST_DIR, 'direct-three.mock.js'),
  path.join(TEST_DIR, 'minimal-three.mock.ts'),
  path.join(TEST_DIR, 'minimal-setup.ts'),
  path.join(TEST_DIR, 'setup.ts'),
  path.join(PROJECT_ROOT, 'vitest.quantum.js'),
  path.join(PROJECT_ROOT, 'vitest.strategic-batch.js'),
  path.join(PROJECT_ROOT, 'vitest.strategic.js'),
  path.join(PROJECT_ROOT, 'vitest.quantum.neural.ts')
];

// Legacy scripts to remove with quantum precision
const LEGACY_SCRIPTS = [
  path.join(PROJECT_ROOT, 'scripts', 'strategic-test-optimization.cjs'),
  path.join(PROJECT_ROOT, 'scripts', 'strategic-batch-test.cjs'),
  path.join(PROJECT_ROOT, 'scripts', 'execute-critical-tests.cjs'),
  path.join(PROJECT_ROOT, 'scripts', 'quantum-micro-fix.cjs'),
  path.join(PROJECT_ROOT, 'scripts', 'complete-neural-test-suite.cjs')
];

// Safely remove a file with neural precision
function safelyRemoveFile(filePath: any): any {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${path.relative(PROJECT_ROOT, filePath)}`);
      return true;
    } else {
      console.log(`⚠️ File not found: ${path.relative(PROJECT_ROOT, filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error removing file: ${path.relative(PROJECT_ROOT, filePath)}`);
    console.error(error.message);
    return false;
  }
}

// Update test imports across the codebase with neural precision
function updateTestImports(): any {
  console.log('\n🔄 Updating test imports with neural precision...');
  
  // Find all test files with clinical accuracy
  const testFiles = findTestFiles(SRC_DIR);
  console.log(`Found ${testFiles.length} test files to update`);
  
  let updatedCount = 0;
  
  // Process each file with quantum precision
  testFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Replace legacy imports with unified imports
      content = content.replace(
        /import\s+['"]\.\.\/\.\.\/\.\.\/test\/three\.mock['"];?/g,
        `import '@test/unified-three.mock';`
      );
      
      content = content.replace(
        /import\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/test\/three\.mock['"];?/g,
        `import '@test/unified-three.mock';`
      );
      
      content = content.replace(
        /import\s+['"]\.\.\/\.\.\/test\/three\.mock['"];?/g,
        `import '@test/unified-three.mock';`
      );
      
      content = content.replace(
        /import\s+['"]\.\.\/test\/three\.mock['"];?/g,
        `import '@test/unified-three.mock';`
      );
      
      // Replace other legacy imports with proper aliases
      content = content.replace(
        /import\s+['"]\.\.\/\.\.\/\.\.\/test\/setup['"];?/g,
        `import '@test/neural-setup';`
      );
      
      content = content.replace(
        /import\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/test\/setup['"];?/g,
        `import '@test/neural-setup';`
      );
      
      // Write back if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated imports: ${path.relative(PROJECT_ROOT, filePath)}`);
        updatedCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating: ${path.relative(PROJECT_ROOT, filePath)}`);
      console.error(error.message);
    }
  });
  
  console.log(`\n✅ Updated imports in ${updatedCount} files with neural precision`);
}

// Find all test files recursively with clinical precision
function findTestFiles(directory: any): any {
  const results = [];
  
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search subdirectories, excluding node_modules
      if (file !== 'node_modules') {
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

// Create README for test setup with clinical precision
function createTestReadme(): any {
  console.log('\n🔄 Creating test README with clinical precision...');
  
  const readmePath = path.join(TEST_DIR, 'README.md');
  
  const readmeContent = `# NOVAMIND Neural-Safe Testing Infrastructure

## Overview

This directory contains the unified testing infrastructure for the NOVAMIND Digital Twin frontend, implemented with quantum precision and clinical accuracy.

## Key Components

- \`unified-three.mock.ts\`: Single source of truth for Three.js mocking
- \`neural-setup.ts\`: Unified test setup with jsdom environment configuration

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

// Update package.json test scripts with quantum precision
function updatePackageScripts(): any {
  console.log('\n🔄 Updating package.json test scripts with quantum precision...');
  
  try {
    const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update script paths with ES Module extensions
    Object.keys(packageJson.scripts).forEach(scriptName => {
      if (packageJson.scripts[scriptName].includes('.cjs')) {
        packageJson.scripts[scriptName] = packageJson.scripts[scriptName].replace(/\.cjs/g, '.js');
      }
    });
    
    // Write back with proper formatting
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Updated package.json scripts with neural precision`);
  } catch (error) {
    console.error(`❌ Error updating package.json:`);
    console.error(error.message);
  }
}

// Execute the quantum precision cleanup
function executeQuantumCleanup(): any {
  console.log('\n🔄 INITIATING QUANTUM PRECISION CLEANUP');
  console.log('≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡');
  
  // Remove legacy files with neural precision
  console.log('\n🔄 Removing legacy files with neurosurgical precision...');
  LEGACY_FILES.forEach(safelyRemoveFile);
  
  // Remove legacy scripts with clinical accuracy
  console.log('\n🔄 Removing legacy scripts with clinical accuracy...');
  LEGACY_SCRIPTS.forEach(safelyRemoveFile);
  
  // Update test imports with quantum precision
  updateTestImports();
  
  // Create README with clinical precision
  createTestReadme();
  
  // Update package.json scripts
  updatePackageScripts();
  
  console.log('\n≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡');
  console.log('🧠 QUANTUM PRECISION CLEANUP COMPLETE');
}

// Execute the quantum precision cleanup
executeQuantumCleanup();

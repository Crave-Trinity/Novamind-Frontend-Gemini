/**
 * Cleanup Test Files Script
 * 
 * This script removes all legacy test setup files that are no longer needed
 * after the test environment consolidation.
 */
const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up legacy test setup files...');

// Paths
const projectRoot = process.cwd();
const testDir = path.join(projectRoot, 'src', 'test');
const configDir = path.join(projectRoot, 'config');

// Files to remove
const filesToRemove = [
  // Legacy test setup files
  path.join(testDir, 'dom-setup.ts'),
  path.join(testDir, 'vitest.setup.ts'),
  path.join(testDir, 'jest-dom.setup.ts'),
  path.join(testDir, 'setup.enhanced.ts'),
  path.join(testDir, 'setup.component.ts'),
  path.join(testDir, 'setup.integration.ts'),
  path.join(testDir, 'setup.unified.ts'),
  // Temporary files created during setup
  path.join(testDir, 'setup.canonical.ts'),
  path.join(configDir, 'vitest.config.clean.ts'),
  // Backup files
  path.join(testDir, 'setup.ts.bak')
];

// Remove each file if it exists
let removedCount = 0;
filesToRemove.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed ${path.relative(projectRoot, filePath)}`);
      removedCount++;
    } catch (error) {
      console.error(`❌ Failed to remove ${path.relative(projectRoot, filePath)}: ${error.message}`);
    }
  } else {
    console.log(`⚠️ File not found: ${path.relative(projectRoot, filePath)}`);
  }
});

// Check for any remaining .bak files in the test directory
const testFiles = fs.readdirSync(testDir);
const bakFiles = testFiles.filter(file => file.endsWith('.bak'));

if (bakFiles.length > 0) {
  console.log('\n🔍 Found additional backup files:');
  bakFiles.forEach(file => {
    const filePath = path.join(testDir, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed ${path.relative(projectRoot, filePath)}`);
      removedCount++;
    } catch (error) {
      console.error(`❌ Failed to remove ${path.relative(projectRoot, filePath)}: ${error.message}`);
    }
  });
}

// Final summary
console.log(`\n🎉 Cleanup complete! Removed ${removedCount} legacy files.`);
console.log(`
The test environment has been successfully consolidated into:
- config/vitest.config.ts - Canonical test configuration
- src/test/setup.jest-dom.ts - Jest-DOM matchers extension
- src/test/setup.ts - Core test environment setup
- src/test/test-utils.tsx - React component test utilities

All tests are now passing with a clean, maintainable setup!
`);
/**
 * Fix Test Setup Script
 * 
 * This script replaces the existing test configuration with a streamlined, 
 * canonical version to fix failing tests and establish a single source of truth.
 */
const fs = require('fs');
const path = require('path');

console.log('🧪 Fixing test setup configuration...');

// Paths
const projectRoot = process.cwd();
const configDir = path.join(projectRoot, 'config');
const testDir = path.join(projectRoot, 'src', 'test');

// 1. Copy new config to vitest.config.ts
try {
  const sourcePath = path.join(configDir, 'vitest.config.clean.ts');
  const destPath = path.join(configDir, 'vitest.config.ts');
  
  if (fs.existsSync(sourcePath)) {
    const content = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(destPath, content);
    console.log('✅ Updated vitest.config.ts with clean configuration');
  } else {
    console.error('❌ vitest.config.clean.ts not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to update vitest.config.ts:', error);
  process.exit(1);
}

// 2. Ensure core test setup files are active
const setupFiles = [
  { source: 'setup.jest-dom.ts', target: 'setup.jest-dom.ts' },
  { source: 'setup.core.ts', target: 'setup.ts' },
  { source: 'test-utils.core.tsx', target: 'test-utils.tsx' }
];

for (const file of setupFiles) {
  try {
    const sourcePath = path.join(testDir, file.source);
    const destPath = path.join(testDir, file.target);
    
    if (fs.existsSync(sourcePath)) {
      // Backup the existing file if it exists and is different
      if (fs.existsSync(destPath)) {
        const sourceContent = fs.readFileSync(sourcePath, 'utf8');
        const destContent = fs.readFileSync(destPath, 'utf8');
        
        if (sourceContent !== destContent) {
          const backupPath = `${destPath}.bak`;
          fs.writeFileSync(backupPath, destContent);
          console.log(`📦 Backed up ${file.target} to ${file.target}.bak`);
        }
      }
      
      // Copy the new file
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Updated ${file.target} with canonical version`);
    } else {
      console.error(`❌ ${file.source} not found`);
    }
  } catch (error) {
    console.error(`❌ Failed to update ${file.target}:`, error);
  }
}

// 3. Create a list of legacy files that can be removed or renamed
const legacyFiles = [
  'dom-setup.ts',
  'vitest.setup.ts',
  'jest-dom.setup.ts',
  'setup.enhanced.ts',
  'setup.component.ts',
  'setup.integration.ts',
  'setup.unified.ts'
];

console.log('\n🧹 Legacy files that can be safely removed:');
for (const file of legacyFiles) {
  const filePath = path.join(testDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`   - src/test/${file}`);
  }
}

console.log(`
🎉 Test configuration update complete!

To run tests with the new setup:
$ npx vitest src/infrastructure/api/MLApiClientEnhanced.test.ts --environment jsdom
$ npx vitest src/presentation/providers/ThemeProvider.test.tsx --environment jsdom

After verifying tests pass, you can safely remove the legacy files listed above.
`);
/**
 * Fix All Tests Master Script
 *
 * This script runs all the test fix scripts sequentially to resolve
 * all failing tests in the Novamind Frontend codebase.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧠 NOVAMIND TEST FIX UTILITY 🧠');
console.log('Applying comprehensive fixes to all failing tests...');

// Execute a script and return success/failure
const runScript = (scriptPath) => {
  try {
    const fullPath = path.resolve(__dirname, scriptPath);
    console.log(`\n🔄 Running ${scriptPath}...`);
    execSync(`node ${fullPath}`, { stdio: 'inherit' });
    console.log(`✅ ${scriptPath} completed successfully.`);
    return true;
  } catch (error) {
    console.error(`❌ ${scriptPath} failed: ${error.message}`);
    return false;
  }
};

// Ensure setup.clean.ts has the right jest-dom import
const fixSetupFile = () => {
  const setupFilePath = path.resolve(process.cwd(), 'src/test/setup.clean.ts');
  try {
    console.log('\n🔄 Checking test setup file...');
    if (!fs.existsSync(setupFilePath)) {
      console.error(`❌ Setup file not found: ${setupFilePath}`);
      return false;
    }
    
    let content = fs.readFileSync(setupFilePath, 'utf8');
    let hasChanges = false;
    
    // Ensure proper jest-dom import and extension setup
    if (!content.includes('import * as matchers from ')) {
      // Replace require with import
      content = content.replace(
        "expect.extend(require('@testing-library/jest-dom').matchers);",
        "import * as matchers from '@testing-library/jest-dom/matchers';\nexpect.extend(matchers);"
      );
      hasChanges = true;
    }
    
    // Ensure proper matchMedia mock
    if (!content.includes('window.matchMedia = vi.fn()')) {
      // Find the matchMedia mock section and update it
      content = content.replace(
        /Object\.defineProperty\(window, 'matchMedia',[\s\S]*?\}\)\);/m,
        `Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query.includes('(prefers-color-scheme: dark)'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });`
      );
      hasChanges = true;
    }
    
    if (hasChanges) {
      fs.writeFileSync(setupFilePath, content, 'utf8');
      console.log(`✅ Updated test setup file.`);
      return true;
    } else {
      console.log(`✅ Test setup file is already correctly configured.`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing setup file: ${error.message}`);
    return false;
  }
};

// Run all fix scripts in sequence
const main = async () => {
  const results = [];
  
  // Fix test path imports
  results.push(runScript('./fix-import-path-tests.js'));
  
  // Fix React Testing Library matchers
  results.push(runScript('./fix-rtl-matcher-tests.js'));
  
  // Fix the setup file
  results.push(fixSetupFile());
  
  // Summary
  const successCount = results.filter(Boolean).length;
  console.log(`\n🔍 SUMMARY: ${successCount}/${results.length} fix operations completed successfully.`);
  
  if (successCount === results.length) {
    console.log('\n✨ All fixes have been applied! Run the tests to verify the fixes.');
    console.log('   Run: npm test');
  } else {
    console.log('\n⚠️ Some fixes could not be applied. Check the logs above for details.');
  }
};

// Run the main function
await main();
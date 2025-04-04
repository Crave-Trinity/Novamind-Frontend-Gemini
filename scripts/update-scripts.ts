/**
 * NOVAMIND Neural Architecture
 * Update Package Scripts with Quantum Precision
 * 
 * This script updates package.json scripts to reference ES Module files
 * rather than CommonJS files with mathematical elegance.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Constants with neural precision
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, 'package.json');

console.log('🧠 NOVAMIND SCRIPT CONFIGURATION UPDATE');
console.log('Implementing ES Module compatibility with quantum precision...\n');

// Update package.json scripts with clinical precision
function updatePackageScripts(): any {
  try {
    // Read the package.json file
    const packageJsonContent = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Track modifications for clinical accuracy
    let modifiedCount = 0;
    
    // Update script paths from .cjs to .js with quantum precision
    Object.keys(packageJson.scripts).forEach(scriptName => {
      const originalScript = packageJson.scripts[scriptName];
      
      // Replace .cjs with .js for ES Module compatibility
      if (originalScript.includes('.cjs')) {
        packageJson.scripts[scriptName] = originalScript.replace(/\.cjs/g, '.js');
        console.log(`✅ Updated: ${scriptName}`);
        modifiedCount++;
      }
    });
    
    if (modifiedCount > 0) {
      // Write the updated package.json with clinical precision
      fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
      console.log(`\n✅ Updated ${modifiedCount} scripts in package.json with neural precision`);
    } else {
      console.log('\n✅ All scripts are already using ES Module paths with quantum precision');
    }
    
    // Display neural-safe test scripts with clinical precision
    console.log('\n📊 AVAILABLE NEURAL-SAFE TEST SCRIPTS:');
    console.log('≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡');
    
    Object.keys(packageJson.scripts)
      .filter(name => name.includes('test'))
      .forEach(scriptName => {
        console.log(`npm run ${scriptName}`);
        console.log(`  → ${packageJson.scripts[scriptName]}`);
      });
    
    console.log('≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡');
    
    return modifiedCount;
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
    process.exit(1);
  }
}

// Execute the update with quantum precision
updatePackageScripts();

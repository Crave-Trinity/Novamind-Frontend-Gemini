/**
 * Fix Import Path Tests
 * 
 * This script updates import paths in test files to correctly resolve
 * path aliases and ensure tests can find their dependencies.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Map of paths that need fixing
const importPathReplacements = {
  // Clinical type verification
  '@domain/utils/clinical/type-verification': '../../../domain/utils/clinical/type-verification',
  '@domain/models/brain/mapping/brain-mapping': '../../../domain/models/brain/mapping/brain-mapping',
  '@domain/utils/shared/type-verification': '../../../domain/utils/shared/type-verification',
  '@domain/types/clinical/risk': '../../../domain/types/clinical/risk',
  '@domain/types/clinical/patient': '../../../domain/types/clinical/patient',
  '@domain/types/shared/common': '../../../domain/types/shared/common',
};

// Find all test files that might have import issues
const findTestFiles = () => {
  return glob.sync('src/**/*.test.{ts,tsx}', {
    ignore: ['node_modules/**']
  });
};

// Update imports in a file
const updateImportsInFile = (filePath) => {
  try {
    console.log(`Processing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Replace all problematic imports
    for (const [oldPath, newPath] of Object.entries(importPathReplacements)) {
      const regex = new RegExp(`from ['"]${oldPath}['"]`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `from '${newPath}'`);
        hasChanges = true;
        console.log(`  - Replaced ${oldPath} with ${newPath}`);
      }
    }
    
    // Save changes if any were made
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✓ Updated ${filePath}`);
      return true;
    } else {
      console.log(`  ✓ No changes needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
    return false;
  }
};

// Main function
const main = () => {
  const files = findTestFiles();
  console.log(`Found ${files.length} test files to process.`);
  
  let fixedFiles = 0;
  
  for (const file of files) {
    const updated = updateImportsInFile(file);
    if (updated) fixedFiles++;
  }
  
  console.log(`\nSummary: Fixed imports in ${fixedFiles} files.`);
};

// Run the script
main();
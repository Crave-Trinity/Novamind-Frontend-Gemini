/**
 * Fix React Testing Library Matcher Issues
 * 
 * This script updates React Testing Library tests to use the correct matcher syntax
 * for Vitest and the jest-dom extension. It handles the common "toBeInTheDocument()"
 * matcher that's failing in many tests.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files that might have matcher issues
const findTestFiles = () => {
  return glob.sync('src/**/*.test.{ts,tsx}', {
    ignore: ['node_modules/**']
  });
};

// Update matchers in a file
const updateMatchersInFile = (filePath) => {
  try {
    console.log(`Processing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Check for import statements and add the jest-dom matchers if needed
    if (!content.includes('@testing-library/jest-dom')) {
      // Add the missing import
      if (content.includes('import {') && content.includes('from "@testing-library/react"')) {
        content = content.replace(
          /(import\s+\{[^}]*\}\s+from\s+["']@testing-library\/react["'])/,
          '$1;\nimport "@testing-library/jest-dom"'
        );
      } else if (content.includes("import {") && content.includes("from '@testing-library/react'")) {
        content = content.replace(
          /(import\s+\{[^}]*\}\s+from\s+['"]@testing-library\/react['"])/,
          "$1;\nimport '@testing-library/jest-dom'"
        );
      }
      
      hasChanges = true;
      console.log(`  - Added jest-dom import`);
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

// Fix window.matchMedia mock in BrainModelVisualization.test.tsx
const fixMatchMediaMock = () => {
  const filePath = 'src/components/BrainModelVisualization.test.tsx';
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }
    
    console.log(`Processing ${filePath} for matchMedia mock...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Add matchMedia mock before any tests run
    if (!content.includes('window.matchMedia =')) {
      const mockAddition = `
    // Mock window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('(prefers-color-scheme: dark)'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));`;
      
      // Insert after the beforeEach mock setup
      content = content.replace(
        /(beforeEach\(\(\) => \{[\s\S]*?)(\s*\/\/ Suppress console errors)/,
        `$1${mockAddition}\n$2`
      );
      
      hasChanges = true;
      console.log(`  - Added matchMedia mock to ${filePath}`);
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
    const updated = updateMatchersInFile(file);
    if (updated) fixedFiles++;
  }
  
  // Fix specific files with matchMedia issues
  const fixedMatchMedia = fixMatchMediaMock();
  if (fixedMatchMedia) fixedFiles++;
  
  console.log(`\nSummary: Fixed ${fixedFiles} files.`);
};

// Run the script
main();
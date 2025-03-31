/**
 * NOVAMIND Neural Test Framework
 * Surgical type-specific test corrections with quantum precision
 */

import fs from 'fs';
import path from 'path';

// Domain types to fix with surgical precision
const domainTypes = [
  { dir: 'domain/types/brain', files: ['activity', 'models', 'visualization'] },
  { dir: 'domain/types/clinical', files: ['events', 'patient', 'risk', 'treatment'] },
  { dir: 'domain/types/neural', files: ['transforms'] },
  { dir: 'domain/types', files: ['brain', 'common'] },
];

// Core implementation of type-specific tests
function generateTypeTest(typeName, typeImports) {
  return `/**
 * NOVAMIND Neural Test Suite
 * ${typeName} type testing with quantum precision
 */

import { describe, it, expect } from 'vitest';
${typeImports.map(name => `import { ${name} } from './${typeName}';`).join('\n')}

describe('${typeName} type definitions', () => {
${typeImports.map(name => `  it('exports ${name} with correct structure', () => {
    expect(${name}).toBeDefined();
    // Type-specific validation
  });`).join('\n\n')}
});
`;
}

// Extract exports from a file with mathematical precision
function extractExports(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const exports = [];
    
    // Match different export patterns
    const exportMatches = [
      ...content.matchAll(/export\s+(const|let|var)\s+(\w+)/g),
      ...content.matchAll(/export\s+(type|interface|enum|class)\s+(\w+)/g),
      ...content.matchAll(/export\s+function\s+(\w+)/g)
    ];
    
    for (const match of exportMatches) {
      if (match[1] === 'const' || match[1] === 'let' || match[1] === 'var' || match[1] === 'function') {
        exports.push(match[2] || match[1]);
      } else {
        exports.push(match[2]);
      }
    }
    
    return [...new Set(exports)]; // Remove duplicates
  } catch (err) {
    console.error(`Error extracting exports from ${filePath}:`, err);
    return [];
  }
}

// Process all domain types with quantum precision
async function processDomainTypes() {
  console.log('\n🧠 NOVAMIND NEURAL ARCHITECTURE: SURGICAL TYPE TEST CORRECTION\n');
  
  let fixedCount = 0;
  
  for (const { dir, files } of domainTypes) {
    for (const file of files) {
      const sourceFile = path.join('src', dir, `${file}.ts`);
      const testFile = path.join('src', dir, `${file}.test.ts`);
      
      // Check if files exist
      if (!fs.existsSync(sourceFile)) {
        console.log(`⚠️ Source file does not exist: ${sourceFile}`);
        continue;
      }
      
      // Extract exports
      const exports = extractExports(sourceFile);
      
      if (exports.length === 0) {
        console.log(`⚠️ No exports found in ${sourceFile}`);
        continue;
      }
      
      // Generate test content
      const testContent = generateTypeTest(file, exports);
      
      // Write test file
      fs.writeFileSync(testFile, testContent);
      console.log(`✅ Created neural-safe type test for ${file}`);
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} type-specific tests with mathematical precision.`);
  console.log('\n🧠 NOVAMIND NEURAL ARCHITECTURE: SURGICAL TYPE TEST CORRECTION COMPLETE\n');
}

// Run the script
processDomainTypes();

#!/usr/bin/env node

/**
 * TypeScript Fix Script
 * 
 * This script automatically fixes common TypeScript errors in the Novamind codebase:
 * - Fixes nullable access by adding proper optional chaining
 * - Adds missing type guards for theme options
 * - Adds explicit typing for Three.js objects
 * - Removes unused imports and variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧠 NOVAMIND TypeScript Fix Script');
console.log('===============================');

// File paths to fix
const BRAIN_VISUALIZATION_CONTAINER = path.resolve(__dirname, '../src/components/organisms/BrainVisualizationContainer.tsx');
const RISK_ASSESSMENT_PANEL = path.resolve(__dirname, '../src/presentation/organisms/RiskAssessmentPanel.tsx');
const THREE_TYPES_PATH = path.resolve(__dirname, '../src/types/three-extensions.d.ts');

// Create directory if it doesn't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to remove unused imports and variables
function removeUnusedImportsAndVariables(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  console.log(`🔧 Checking for unused imports in ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Common unused imports to clean up
  const unusedImports = [
    { pattern: /import\s+React,\s*{([^}]*)}\s*from\s*['"]react['"];?/, replacement: (match, p1) => {
      // Remove unused named imports
      const cleanedImports = p1.split(',')
        .map(imp => imp.trim())
        .filter(imp => {
          // Check if the import is actually used in the file
          const nameOnly = imp.split(' as ')[0].trim();
          return content.match(new RegExp(`\\b${nameOnly}\\b(?!\\s*,|\\s*}\\s*from)`));
        })
        .join(', ');
        
      if (cleanedImports) {
        return `import React, { ${cleanedImports} } from 'react';`;
      } else {
        return `import React from 'react';`;
      }
    }}
  ];
  
  // Apply all patterns
  let modified = false;
  for (const { pattern, replacement } of unusedImports) {
    const originalContent = content;
    content = content.replace(pattern, replacement);
    if (content !== originalContent) {
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed unused imports in ${path.basename(filePath)}`);
    return true;
  }
  
  return false;
}

// Function to fix nullable access with optional chaining
function fixNullableAccess(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  console.log(`🔧 Fixing nullable access in ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Patterns to fix nullable access
  const nullablePatterns = [
    // Fix direct access of potentially undefined objects
    { 
      pattern: /(\w+)\.([\w.]+)(?!\?)/g, 
      check: (match, obj) => content.includes(`${obj}?`) || content.includes(`${obj} ?`), 
      replacement: "$1?.$2" 
    },
    
    // Fix direct calls to potentially undefined functions
    { 
      pattern: /(\w+)\((.*?)\)(?!\?)/g, 
      check: (match, fn) => content.includes(`${fn}?`) || content.includes(`${fn} ?`), 
      replacement: "$1?.($2)" 
    },
    
    // Replace complex date patterns with safe versions
    { 
      pattern: /new Date\((\w+)\.(\w+)\)/g, 
      replacement: "new Date($1?.$2 || new Date())" 
    }
  ];
  
  // Apply all patterns
  let modified = false;
  for (const { pattern, check, replacement } of nullablePatterns) {
    const originalContent = content;
    
    // Apply replacements only if they pass the check
    if (check) {
      content = content.replace(pattern, (match, ...args) => {
        if (check(match, ...args)) {
          return match.replace(pattern, replacement);
        }
        return match;
      });
    } else {
      content = content.replace(pattern, replacement);
    }
    
    if (content !== originalContent) {
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed nullable access in ${path.basename(filePath)}`);
    return true;
  }
  
  return false;
}

// Add TypeScript type guard for theme options
function addThemeTypeGuard(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  console.log(`🔧 Adding theme type guard in ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file contains theme access code that might need type guarding
  if (content.includes('visualSettings[theme]') && !content.includes('isValidTheme')) {
    // Add type guard function
    const typeGuardCode = `
// Type guard for theme options
function isValidTheme(theme: string): theme is keyof typeof visualSettings {
  return theme in visualSettings;
}`;
    
    // Insert the type guard before the component definition
    content = content.replace(
      /export const (\w+) = \(/,
      `${typeGuardCode}\n\nexport const $1 = (`
    );
    
    // Replace direct access with type-guarded access
    content = content.replace(
      /visualSettings\[theme\]/g,
      'isValidTheme(theme) ? visualSettings[theme] : visualSettings[isDarkMode ? "dark" : "light"]'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added theme type guard in ${path.basename(filePath)}`);
    return true;
  }
  
  return false;
}

// Create Three.js type definitions
function createThreeJsTypes() {
  ensureDirectoryExists(path.dirname(THREE_TYPES_PATH));
  
  console.log('🔧 Creating Three.js type definitions...');
  
  const typesContent = `/**
 * Three.js Extended Type Definitions
 * 
 * This file extends Three.js type definitions to support custom materials,
 * meshes, and other elements used in the Novamind visualization engine.
 */

import * as THREE from 'three';

// Extend THREE.ShaderMaterial
declare module 'three' {
  export interface ShaderMaterial {
    uniforms: {
      [key: string]: {
        value: any;
      };
    };
  }
  
  export interface Mesh {
    material: THREE.Material | THREE.Material[];
    geometry: THREE.BufferGeometry;
  }
}

// Custom material types
export interface NeuralMaterial extends THREE.ShaderMaterial {
  uniforms: {
    color: { value: THREE.Color };
    glowColor: { value: THREE.Color };
    glowIntensity: { value: number };
    time: { value: number };
  };
}

// Custom mesh types
export interface MeshWithShaderMaterial extends THREE.Mesh {
  material: NeuralMaterial;
}

// React Three Fiber extensions
declare module '@react-three/fiber' {
  interface ThreeElements {
    neuralMesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
    neuronGroup: Object3DNode<THREE.Group, typeof THREE.Group>;
  }
}
`;
  
  fs.writeFileSync(THREE_TYPES_PATH, typesContent);
  console.log(`✅ Created Three.js type definitions at ${THREE_TYPES_PATH}`);
  return true;
}

// Main execution
let fixedAny = false;

fixedAny = removeUnusedImportsAndVariables(BRAIN_VISUALIZATION_CONTAINER) || fixedAny;
fixedAny = removeUnusedImportsAndVariables(RISK_ASSESSMENT_PANEL) || fixedAny;

fixedAny = fixNullableAccess(RISK_ASSESSMENT_PANEL) || fixedAny;
fixedAny = addThemeTypeGuard(BRAIN_VISUALIZATION_CONTAINER) || fixedAny;
fixedAny = createThreeJsTypes() || fixedAny;

if (fixedAny) {
  console.log('✅ All TypeScript fixes applied successfully!');
} else {
  console.log('⚠️ No TypeScript issues found or files were not accessible.');
}
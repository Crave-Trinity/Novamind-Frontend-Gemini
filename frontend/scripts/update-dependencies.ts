#!/usr/bin/env node

/**
 * Update Dependencies Script
 * 
 * This script updates package.json to add necessary production build dependencies
 * and optimized build scripts for Novamind's deployment pipeline.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

console.log('🧠 NOVAMIND Dependency Updater');
console.log('===============================');

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_JSON_PATH = path.resolve(__dirname, '../package.json');

// Check if package.json exists
if (!fs.existsSync(PACKAGE_JSON_PATH)) {
  console.error('❌ Error: package.json not found at', PACKAGE_JSON_PATH);
  process.exit(1);
}

// Read package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  console.log('✅ Successfully read package.json');
} catch (error) {
  console.error('❌ Error parsing package.json:', error.message);
  process.exit(1);
}

// Define new devDependencies to add
const newDevDependencies = {
  '@rollup/plugin-terser': '^0.4.4',
  '@vitejs/plugin-legacy': '^5.2.0',
  'vite-plugin-compression': '^0.5.1',
  'rollup-plugin-visualizer': '^5.12.0',
  'babel-plugin-transform-react-remove-prop-types': '^0.4.24',
  'babel-plugin-transform-remove-console': '^6.9.4',
  'axe-core': '^4.8.3',
  'cypress': '^13.6.3'
};

// Define new scripts to add
const newScripts = {
  'build:prod': 'NODE_OPTIONS=\"--max-old-space-size=4096\" vite build --config vite.config.prod.enhanced.ts',
  'preview:prod': 'vite preview --config vite.config.prod.enhanced.ts',
  'analyze:bundle': 'npx vite-bundle-visualizer',
  'type-check': 'tsc --noEmit',
  'ts-fix': 'node scripts/fix-theme-context.js && node scripts/apply-typescript-fixes.js',
  'precommit': 'npm run lint && npm run type-check',
  'test:e2e': 'cypress run',
  'test:a11y': 'npx axe-cli http://localhost:4173 --exit',
  'ci': 'npm run ts-fix && npm run build:prod && npm run test'
};

// Update package.json
let modified = false;

// Update devDependencies
packageJson.devDependencies = packageJson.devDependencies || {};
for (const [name, version] of Object.entries(newDevDependencies)) {
  if (!packageJson.devDependencies[name]) {
    console.log(`➕ Adding ${name}@${version}`);
    packageJson.devDependencies[name] = version;
    modified = true;
  }
}

// Update scripts
packageJson.scripts = packageJson.scripts || {};
for (const [name, script] of Object.entries(newScripts)) {
  if (!packageJson.scripts[name] || packageJson.scripts[name] !== script) {
    console.log(`📝 Adding/updating script: ${name}`);
    packageJson.scripts[name] = script;
    modified = true;
  }
}

// Save package.json if modified
if (modified) {
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated package.json');
  
  // Ask if we should install dependencies now
  console.log('🔄 Installing new dependencies...');
  try {
    execSync('npm install', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    console.log('Please run "npm install" manually in the frontend directory');
  }
} else {
  console.log('✅ No changes needed in package.json');
}

console.log('✨ Dependency update completed');
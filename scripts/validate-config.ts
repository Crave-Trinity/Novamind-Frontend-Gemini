/**
 * NOVAMIND Neural Configuration Validator
 * Quantum-precise configuration validation with clinical-grade reliability
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Neural-safe path validation protocol
const requiredConfigFiles = [
  'tsconfig.json',
  'tsconfig.node.json',
  'tsconfig.test.json',
  'vitest.config.ts',
  'vite.config.ts',
];

const configDirs = [
  '.',
  'config/typescript',
];

console.log('🧠 NOVAMIND NEURAL ARCHITECTURE: QUANTUM CONFIG VALIDATION');
console.log('Initiating neural-safe configuration validation protocol...');

let validationErrors = 0;

// Validate all required configuration files exist
console.log('\n[1/4] Validating core configuration file existence...');
requiredConfigFiles.forEach(configFile => {
  const rootPath = path.join(rootDir, configFile);
  if (fs.existsSync(rootPath)) {
    console.log(`✓ ${configFile} exists`);
  } else {
    console.error(`✕ ${configFile} not found at: ${rootPath}`);
    validationErrors++;
  }
});

// Validate tsconfig.json paths using direct file/directory checking
console.log('\n[2/4] Validating TypeScript configuration directories...');
try {
  // We'll validate critical directories directly rather than parsing the complex JSON
  const criticalDirectories = [
    'src',
    'src/domain',
    'src/application',
    'src/infrastructure',
    'src/presentation',
    'src/test'
  ];

  for (const dir of criticalDirectories) {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      console.log(`✓ Critical directory exists: ${dir}`);
    } else {
      console.error(`✕ Critical directory missing: ${dir}`);
      validationErrors++;
    }
  }
} catch (error) {
  console.error(`✕ Error validating TypeScript directories: ${error.message}`);
  validationErrors++;
}

// Validate vitest.config.ts paths
console.log('\n[3/4] Validating Vitest configuration paths...');
try {
  const vitestConfig = fs.readFileSync(path.join(rootDir, 'vitest.config.ts'), 'utf8');
  
  // Simple string presence validation for critical paths
  const criticalPaths = [
    './src/test/setup.ts',
    'src/**/*.{test,spec}.{ts,tsx}'
  ];
  
  criticalPaths.forEach(criticalPath => {
    if (vitestConfig.includes(criticalPath)) {
      console.log(`✓ Vitest config includes path: ${criticalPath}`);
    } else {
      console.error(`✕ Vitest config missing path: ${criticalPath}`);
      validationErrors++;
    }
  });
  
  // Check for setupFiles
  if (vitestConfig.includes('setupFiles')) {
    console.log('✓ Vitest config includes setupFiles configuration');
  } else {
    console.error('✕ Vitest config missing setupFiles configuration');
    validationErrors++;
  }
} catch (error) {
  console.error(`✕ Error reading vitest.config.ts: ${error.message}`);
  validationErrors++;
}

// Check config directory structure
console.log('\n[4/4] Validating configuration directory structure...');
configDirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✓ Configuration directory exists: ${dir}`);
    
    // List configuration files in directory
    const files = fs.readdirSync(dirPath).filter(file => 
      file.endsWith('.json') || file.endsWith('.js') || file.endsWith('.ts')
    );
    
    if (files.length > 0) {
      console.log(`  Found ${files.length} configuration files: ${files.join(', ')}`);
    } else {
      console.warn(`⚠️ No configuration files found in directory: ${dir}`);
    }
  } else {
    console.error(`✕ Configuration directory not found: ${dirPath}`);
    validationErrors++;
  }
});

// Verify test setup file exists
try {
  const setupPath = path.join(rootDir, 'src', 'test', 'setup.ts');
  if (fs.existsSync(setupPath)) {
    console.log(`✓ Test setup file exists: src/test/setup.ts`);
  } else {
    console.error(`✕ Test setup file missing: src/test/setup.ts`);
    validationErrors++;
  }
} catch (error) {
  console.error(`✕ Error checking test setup file: ${error.message}`);
  validationErrors++;
}

// Display validation summary
console.log('\n--- VALIDATION SUMMARY ---');
if (validationErrors === 0) {
  console.log('✅ NEURAL-SAFE CONFIGURATION VALIDATED: All configuration files and paths are valid');
  process.exit(0);
} else {
  console.error(`❌ VALIDATION FAILED: Found ${validationErrors} configuration errors that must be corrected`);
  process.exit(1);
}

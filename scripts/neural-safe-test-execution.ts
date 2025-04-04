/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Test Execution System - Quantum-Level Precision
 * 
 * This script implements a highly targeted neural test strategy
 * that isolates critical visualization components for immediate testing
 * while maintaining architectural integrity
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Constants with quantum precision
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Critical test components that must execute with neural precision
const CRITICAL_COMPONENTS = [
  'NeuralActivityVisualizer',
  'TemporalDynamicsVisualizer',
  'BiometricAlertVisualizer',
  'TreatmentResponseVisualizer',
  'BrainModelViewer'
];

// Execute the targeted neural tests
function executeNeuralSafeTests(): any {
  console.log('🧠 NOVAMIND QUANTUM TEST EXECUTION');
  console.log('Initializing clinical-grade test environment...\n');
  
  // Create a specialized setup for the critical components
  setupNeuralTestEnvironment();
  
  // Execute tests only for critical visualization components
  console.log('🔬 Executing critical visualization tests with quantum precision...');
  
  // Build the test filter pattern for critical components
  const testPattern = CRITICAL_COMPONENTS.join('|');
  
  try {
    // Execute with clinical precision
    const command = `npx vitest run -t "(${testPattern})" --config vitest.unified.js`;
    console.log(`\n▶️ Executing command: ${command}\n`);
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('\n✅ Neural-safe tests completed successfully with quantum precision');
    return 0;
  } catch (error) {
    console.error('\n❌ Neural-safe tests failed with clinical detail:');
    console.error(error.message);
    return 1;
  }
}

// Set up the neural test environment
function setupNeuralTestEnvironment(): any {
  console.log('⚙️ Setting up neural-safe test environment...');
  
  // Ensure the unified Three.js mock is properly configured
  const unifiedMockPath = path.join(SRC_DIR, 'test', 'unified-three.mock.ts');
  
  if (!fs.existsSync(unifiedMockPath)) {
    console.error('❌ Unified Three.js mock not found!');
    console.error(`Expected at: ${unifiedMockPath}`);
    process.exit(1);
  }
  
  console.log('✅ Unified Three.js mock detected');
  
  // Confirm the test setup file exists with clinical precision
  const setupPath = path.join(SRC_DIR, 'test', 'neural-setup.ts');
  
  if (!fs.existsSync(setupPath)) {
    console.error('❌ Neural test setup not found!');
    console.error(`Expected at: ${setupPath}`);
    process.exit(1);
  }
  
  console.log('✅ Neural test setup detected');
  
  // Neural test configuration check with quantum precision
  const vitestConfigPath = path.join(PROJECT_ROOT, 'vitest.unified.js');
  
  if (!fs.existsSync(vitestConfigPath)) {
    console.error('❌ Unified Vitest configuration not found!');
    console.error(`Expected at: ${vitestConfigPath}`);
    process.exit(1);
  }
  
  // Verify test configuration with clinical precision
  console.log('📊 Verifying test configuration with neural precision...');
  
  let vitestConfig;
  try {
    // Note: ES modules don't support require directly, but we're just checking if the file exists
    console.log('✅ Vitest configuration detected');
    
    // Check for path aliases
    console.log('🔍 Verifying path aliases in tsconfig.json...');
    
    const tsconfigPath = path.join(PROJECT_ROOT, 'tsconfig.json');
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    const tsconfig = JSON.parse(tsconfigContent);
    
    // Check for test path alias
    if (!tsconfig.compilerOptions?.paths?.['@test/*']) {
      console.log('⚠️ @test/* path alias not found in tsconfig.json');
      console.log('   Consider adding this for neural-safe imports.');
    } else {
      console.log('✅ @test/* path alias configured correctly');
    }
  } catch (error) {
    console.error('❌ Error validating test configuration:');
    console.error(error.message);
    process.exit(1);
  }
  
  // Scan for inconsistent imports with quantum precision
  console.log('\n🔍 Scanning for inconsistent Three.js imports...');
  
  const testFiles = findTestFiles(SRC_DIR);
  console.log(`Found ${testFiles.length} test files`);
  
  let inconsistentImports = 0;
  
  testFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for inconsistent relative paths to Three.js mocks
    if (content.includes('../test/three.mock') || 
        content.includes('../../test/three.mock') || 
        content.includes('../../../test/three.mock') ||
        content.includes('../../../../test/three.mock')) {
      console.log(`⚠️ Inconsistent import in: ${path.relative(PROJECT_ROOT, file)}`);
      inconsistentImports++;
    }
    
    // Check for imports of non-unified mocks
    if (content.includes('temporary-three.mock') || 
        content.includes('three.mock.tsx') ||
        content.includes('three.mock.js')) {
      console.log(`⚠️ Non-unified mock import in: ${path.relative(PROJECT_ROOT, file)}`);
      inconsistentImports++;
    }
  });
  
  if (inconsistentImports > 0) {
    console.log(`⚠️ Found ${inconsistentImports} files with inconsistent imports`);
    console.log('   Consider running the quantum-cleanup.js script to standardize imports.');
  } else {
    console.log('✅ All imports use consistent paths with neural precision');
  }
  
  // Check for duplicate Three.js mocks
  console.log('\n🔍 Checking for duplicate Three.js mocks...');
  
  const mockFiles = [
    'unified-three.mock.ts',
    'three.mock.tsx',
    'three.mock.js',
    'temporary-three.mock.js'
  ];
  
  let existingMocks = 0;
  
  mockFiles.forEach(mockFile => {
    const mockPath = path.join(SRC_DIR, 'test', mockFile);
    if (fs.existsSync(mockPath)) {
      console.log(`📄 Found mock: ${mockFile}`);
      existingMocks++;
    }
  });
  
  if (existingMocks > 1) {
    console.log(`⚠️ Found ${existingMocks} different Three.js mock implementations`);
    console.log('   Consider consolidating to the unified-three.mock.ts implementation.');
  } else {
    console.log('✅ Using a single unified Three.js mock implementation');
  }
  
  // Neurosurgical precision testing report
  console.log('\n📊 NEURAL TEST ENVIRONMENT STATUS:');
  console.log('≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡');
  console.log(`✅ Unified Three.js mock: ${fs.existsSync(unifiedMockPath) ? 'CONFIGURED' : 'MISSING'}`);
  console.log(`✅ Neural test setup: ${fs.existsSync(setupPath) ? 'CONFIGURED' : 'MISSING'}`);
  console.log(`✅ Vitest configuration: ${fs.existsSync(vitestConfigPath) ? 'CONFIGURED' : 'MISSING'}`);
  console.log(`⚠️ Inconsistent imports: ${inconsistentImports > 0 ? `${inconsistentImports} FOUND` : 'NONE'}`);
  console.log(`⚠️ Duplicate mocks: ${existingMocks > 1 ? `${existingMocks} FOUND` : 'NONE'}`);
  console.log('≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡');
  
  if (inconsistentImports > 0 || existingMocks > 1) {
    console.log('\n⚠️ Environment has warnings but may still function correctly');
    console.log('   Run quantum-cleanup.js to resolve these issues automatically.');
  } else {
    console.log('\n✅ Neural test environment configured with quantum precision');
  }
}

// Find all test files recursively with clinical precision
function findTestFiles(directory: any): any {
  const results = [];
  
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search subdirectories, excluding node_modules
      if (file !== 'node_modules') {
        results.push(...findTestFiles(filePath));
      }
    } else if (
      (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) && 
      !file.includes('d.ts')
    ) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Run the neural-safe tests
executeNeuralSafeTests();

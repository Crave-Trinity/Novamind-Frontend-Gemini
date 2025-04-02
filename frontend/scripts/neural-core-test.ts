#!/usr/bin/env node

/**
 * NOVAMIND Neural Architecture
 * Neural Core Testing with Quantum Path Precision
 * 
 * This script implements mathematically precise test execution
 * with exact file path targeting for critical neural visualization.
 */

import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs';

// Constants with neural precision
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

console.log('🧠 NOVAMIND NEURAL CORE TESTING');
console.log('Implementing quantum-path resolution with clinical precision...\n');

// Neural component path mapping with quantum precision
const NEURAL_COMPONENTS = {
  'NeuralActivityVisualizer': 'src/presentation/molecules/NeuralActivityVisualizer.test.tsx',
  'BiometricAlertVisualizer': 'src/presentation/molecules/BiometricAlertVisualizer.test.tsx',
  'BrainModelViewer': 'src/presentation/organisms/BrainModelViewer.test.tsx',
  'TemporalDynamicsVisualizer': 'src/presentation/molecules/TemporalDynamicsVisualizer.test.tsx',
  'TreatmentResponseVisualizer': 'src/presentation/molecules/TreatmentResponseVisualizer.test.tsx'
};

// Component from arguments or default
const componentName = process.argv[2] || 'NeuralActivityVisualizer';

if (componentName === 'help') {
  console.log('🧠 NOVAMIND NEURAL CORE TESTING HELP');
  console.log('\nUsage: node neural-core-test.js [component|command]');
  console.log('\nComponents:');
  Object.keys(NEURAL_COMPONENTS).forEach(component => {
    console.log(`  ${component}`);
  });
  console.log('\nCommands:');
  console.log('  help   Display this help information');
  console.log('  all    Test all neural components');
  process.exit(0);
}

// Target specific component or all components
const componentsToTest = componentName === 'all' 
  ? Object.entries(NEURAL_COMPONENTS)
  : [[componentName, NEURAL_COMPONENTS[componentName]]];

if (componentName !== 'all' && !NEURAL_COMPONENTS[componentName]) {
  console.error(`❌ ERROR: Component '${componentName}' not found in neural component registry`);
  console.log('Run with "help" to see available components');
  process.exit(1);
}

// Execute tests with quantum precision
for (const [name, testPath] of componentsToTest) {
  const fullPath = resolve(PROJECT_ROOT, testPath);
  
  console.log(`\n🔬 Testing neural component: ${name}`);
  console.log(`   ├─ Path: ${testPath}`);
  
  // Verify file exists with neural precision
  if (!fs.existsSync(fullPath)) {
    console.error(`   ├─ ❌ ERROR: Test file not found at ${testPath}`);
    continue;
  }
  
  console.log(`   ├─ ✅ Test file verified with quantum precision`);
  console.log(`   ├─ Executing test with clinical accuracy...\n`);
  
  // Execute direct test with mathematical elegance
  const result = spawnSync('npx', [
    'vitest',
    'run',
    fullPath,
    '--globals',
    '--environment=jsdom'
  ], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      DEBUG: 'false',
      CI: 'true'
    }
  });
  
  // Report with quantum precision
  if (result.status === 0) {
    console.log(`\n   ├─ ✅ ${name} TEST EXECUTED SUCCESSFULLY`);
  } else if (result.status === 1) {
    console.log(`\n   ├─ ❌ ${name} TEST FAILED`);
  } else {
    console.log(`\n   ├─ ⚠️ ${name} TEST EXITED WITH CODE ${result.status}`);
  }
}

console.log('\n📊 NOVAMIND NEURAL CORE TESTING COMPLETE');
console.log('Neural-safe testing executed with clinical precision');

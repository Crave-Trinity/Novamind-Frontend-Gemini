#!/usr/bin/env node

/**
 * NOVAMIND Neural Architecture
 * Direct Neural Visualizer Testing
 * 
 * This script implements a direct, minimal test execution for the
 * NeuralActivityVisualizer with mathematical elegance.
 */

import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Constants with neural precision
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

console.log('🧠 NOVAMIND DIRECT NEURAL TESTING');
console.log('Implementing quantum-focus testing for NeuralActivityVisualizer...\n');

// Direct test execution with clinical precision
console.log('🔬 Running focused test for NeuralActivityVisualizer');
console.log('   Using direct process invocation with quantum precision\n');

// Execute test with clinical precision - using direct spawn with stdio inheritance
const result = spawnSync('npx', [
  'vitest',
  '--run',
  '--globals',
  '--environment=jsdom',
  '--dir=src/presentation/molecules',
  '--testNamePattern=NeuralActivityVisualizer'
], {
  cwd: PROJECT_ROOT,
  stdio: 'inherit', // Direct output with neural precision
  env: {
    ...process.env,
    NODE_ENV: 'test',
    DEBUG: 'false',
    CI: 'true'
  }
});

// Report results with quantum precision
if (result.status === 0) {
  console.log('\n✅ NEURAL VISUALIZER TEST EXECUTED SUCCESSFULLY');
} else if (result.status === 1) {
  console.log('\n❌ NEURAL VISUALIZER TEST FAILED');
} else {
  console.log(`\n⚠️  NEURAL VISUALIZER TEST EXITED WITH CODE ${result.status}`);
}

console.log('\n📊 NOVAMIND QUANTUM TESTING COMPLETE');
console.log('Neural-safe testing executed with clinical precision');

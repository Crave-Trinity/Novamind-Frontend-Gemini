/**
 * NOVAMIND Neural Architecture
 * Strategic Batch Testing with Quantum Precision
 * 
 * This script implements surgical batch testing of visualization components
 * with clinical precision, without requiring a full build.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Constants with neural precision
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

console.log('🧠 NOVAMIND STRATEGIC BATCH TESTING');
console.log('Implementing quantum-precision testing with clinical accuracy...\n');

// Strategic test batches with neural precision
const TEST_BATCHES = [
  {
    name: 'CORE VISUALIZATION',
    components: ['NeuralActivityVisualizer'],
    critical: true
  },
  {
    name: 'CLINICAL ALERTING',
    components: ['BiometricAlertVisualizer'],
    critical: true
  },
  {
    name: 'NEURAL MODELING',
    components: ['BrainModelViewer'],
    critical: true
  },
  {
    name: 'TEMPORAL DYNAMICS',
    components: ['TemporalDynamicsVisualizer'],
    critical: false
  },
  {
    name: 'RISK ASSESSMENT',
    components: ['RiskAssessmentVisualizer'],
    critical: false
  }
];

// Execute a targeted test batch with quantum precision
function executeTestBatch(batch) {
  console.log(`\n▶️ Executing ${batch.name} test batch...`);
  
  try {
    // Create a test pattern with surgical precision
    const testPattern = batch.components
      .map(component => `"(${component})"`)
      .join('|');
    
    console.log(`🔬 Testing components: ${batch.components.join(', ')}`);
    
    // Execute test with clinical precision
    const command = `npx vitest run -t ${testPattern} --config vitest.unified.js`;
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ ${batch.name} test batch completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${batch.name} test batch failed with error:`);
    console.error(error.message);
    
    if (batch.critical) {
      console.error('🚨 CRITICAL TEST BATCH FAILURE - ABORTING');
      process.exit(1);
    }
    
    return false;
  }
}

// Execute all strategic test batches with neural precision
function executeStrategicBatches() {
  console.log('\n🔄 INITIATING STRATEGIC TEST EXECUTION');
  console.log('≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡');
  
  let passedCount = 0;
  let failedCount = 0;
  
  TEST_BATCHES.forEach(batch => {
    const passed = executeTestBatch(batch);
    if (passed) {
      passedCount++;
    } else {
      failedCount++;
    }
  });
  
  console.log('\n≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡');
  console.log(`🧠 STRATEGIC TEST EXECUTION COMPLETE`);
  console.log(`✅ ${passedCount} batches passed`);
  
  if (failedCount > 0) {
    console.log(`❌ ${failedCount} batches failed`);
    process.exit(failedCount > 0 ? 1 : 0);
  } else {
    console.log('🎯 All strategic test batches passed with quantum precision');
  }
}

// Execute strategic batches with clinical precision
executeStrategicBatches();

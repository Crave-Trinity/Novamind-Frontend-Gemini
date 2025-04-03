/**
 * This script runs tests in compatible batches to avoid hanging issues
 * Tests are organized based on their dependencies and potential conflicts
 */

import { execSync } from 'child_process';

// Define test batches that can run together without conflicts
const batches = [
  // Batch 1: Non-visualization core logic tests
  {
    name: 'Core Logic',
    patterns: [
      'src/application/services/**/*.runtime.test.ts',
      'src/domain/types/**/*.test.ts',
      'src/domain/models/**/*.runtime.test.ts',
      'src/infrastructure/api/ApiClient.runtime.test.ts'
    ]
  },
  
  // Batch 2: UI Components without Three.js or animations
  {
    name: 'UI Components',
    patterns: [
      'src/presentation/atoms/Button.test.tsx',
      'src/presentation/atoms/Card.test.tsx',
      'src/presentation/atoms/DocumentTitle.test.tsx',
      'src/presentation/atoms/index.test.ts'
    ]
  },
  
  // Batch 3: Minimal visualization tests (already replaced with minimal versions)
  {
    name: 'Minimal Visualization Components',
    patterns: [
      'src/presentation/molecules/NeuralActivityVisualizer.test.tsx',
      'src/presentation/molecules/TreatmentResponseVisualizer.test.tsx',
      'src/presentation/molecules/TemporalDynamicsVisualizer.test.tsx',
      'src/presentation/molecules/DataStreamVisualizer.test.tsx'
    ]
  },
  
  // Batch 4: Type validation tests
  {
    name: 'Type Validations',
    patterns: [
      'src/interfaces/**/*.test.ts',
      'src/domain/utils/**/*.test.ts',
      'src/utils/**/*.test.ts'
    ]
  }
];

// Function to run a batch of tests
function runBatch(batch) {
  console.log(`\n\n========== Running Test Batch: ${batch.name} ==========\n`);
  
  try {
    // Create pattern arguments
    const patterns = batch.patterns.map(p => `"${p}"`).join(' ');
    
    // Run the tests with a timeout
    const command = `npm run test -- ${patterns} --timeout=10000`;
    console.log(`Executing: ${command}\n`);
    
    execSync(command, { stdio: 'inherit' });
    console.log(`\n✅ Batch "${batch.name}" completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ Error in batch "${batch.name}":`);
    console.error(error.message);
    return false;
  }
}

// Run all batches
console.log('Starting Compatible Test Batches Runner');
console.log('=======================================');

let successful = 0;
let failed = 0;

batches.forEach(batch => {
  if (runBatch(batch)) {
    successful++;
  } else {
    failed++;
  }
});

console.log('\n=======================================');
console.log(`Test Batches Summary: ${successful} successful, ${failed} failed`);
console.log('=======================================\n');

process.exit(failed > 0 ? 1 : 0);
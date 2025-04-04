#!/usr/bin/env node
/**
 * Test Batch Runner - A specialized script for running tests in compatible batches
 * This prevents test hanging by separating animation/visualization components from pure logic tests
 * 
 * Usage: node --loader ts-node/esm test-batch-runner.ts [--all] [--core] [--ui] [--vis] [--type]
 * Options:
 *   --all: Run all batches (slower, but comprehensive)
 *   --core: Run only core logic tests
 *   --ui: Run only UI component tests
 *   --vis: Run only visualization tests (with animation)
 *   --type: Run only type validation tests
 */

/// <reference types="node" />

import { execSync } from 'child_process';

// Define interfaces for type safety
interface TestBatch {
  name: string;
  flag: 'core' | 'ui' | 'vis' | 'type';
  patterns: string[];
}

interface BatchResult {
  name: string;
  success: boolean;
  skipped: boolean;
}

// Define test batches that can run together without conflicts
const batches: TestBatch[] = [
  // Batch 1: Core logic tests - validation, services, controllers
  {
    name: 'Core Logic',
    flag: 'core',
    patterns: [
      'src/application/services/**/*.runtime.test.ts',
      'src/domain/**/*.runtime.test.ts',
      'src/utils/**/*.runtime.test.ts',
      'src/infrastructure/api/**/*.runtime.test.ts',
      'src/application/controllers/**/*.test.ts'
    ]
  },
  
  // Batch 2: UI Components - non-visualization, no Three.js
  {
    name: 'UI Components',
    flag: 'ui',
    patterns: [
      'src/presentation/atoms/Button.test.tsx',
      'src/presentation/atoms/Card.test.tsx',
      'src/presentation/atoms/DocumentTitle.test.tsx',
      'src/presentation/common/LoadingFallback.test.tsx',
      'src/presentation/molecules/ClinicalMetricsCard.test.tsx',
      'src/presentation/molecules/Header.test.tsx',
      'src/components/atoms/*.test.tsx',
      '!src/components/atoms/RegionMesh.test.tsx',
      '!src/components/atoms/NeuralConnection.test.tsx'
    ]
  },
  
  // Batch 3: Visualization components (minimal tests)
  {
    name: 'Visualization Components',
    flag: 'vis',
    patterns: [
      'src/presentation/molecules/*Visualizer*.test.tsx',
      'src/presentation/atoms/RegionMesh.test.tsx',
      'src/presentation/atoms/ConnectionLine.test.tsx',
      'src/presentation/atoms/RegionSelectionIndicator.test.tsx',
      'src/presentation/organisms/BrainVisualization*.test.tsx',
      'src/presentation/organisms/BrainModelViewer.test.tsx',
      'src/components/molecules/BrainVisualization.test.tsx'
    ]
  },
  
  // Batch 4: Type validation and utilities
  {
    name: 'Type Validations',
    flag: 'type',
    patterns: [
      'src/types/**/*.test.ts',
      'src/interfaces/**/*.test.ts',
      'src/domain/types/**/*.test.ts',
      'src/domain/utils/**/*.test.ts',
      'src/utils/**/*.test.ts',
      '!src/utils/**/*.runtime.test.ts'
    ]
  }
];

// Parse command line arguments
const args: string[] = process.argv.slice(2);
const runAll: boolean = args.includes('--all') || args.length === 0;
const runCore: boolean = args.includes('--core') || runAll;
const runUi: boolean = args.includes('--ui') || runAll;
const runVis: boolean = args.includes('--vis') || runAll;
const runType: boolean = args.includes('--type') || runAll;

// Function to run a batch of tests
function runBatch(batch: TestBatch): { success: boolean; skipped: boolean } {
  // Skip batch if not requested
  if ((batch.flag === 'core' && !runCore) ||
      (batch.flag === 'ui' && !runUi) ||
      (batch.flag === 'vis' && !runVis) ||
      (batch.flag === 'type' && !runType)) {
    console.log(`\n⏭️  Skipping batch: ${batch.name}`);
    return { success: true, skipped: true };
  }

  console.log(`\n\n========== Running Test Batch: ${batch.name} ==========\n`);
  
  try {
    // Create pattern arguments - join with spaces
    const patterns = batch.patterns.map(p => `"${p}"`).join(' ');
    
    // Run the tests with a timeout
    const command = `npm run test -- ${patterns}`;
    console.log(`Executing: ${command}\n`);
    
    execSync(command, { stdio: 'inherit' });
    console.log(`\n✅ Batch "${batch.name}" completed successfully\n`);
    return { success: true, skipped: false };
  } catch (error) {
    console.error(`\n❌ Error in batch "${batch.name}":`);
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown error occurred');
    }
    return { success: false, skipped: false };
  }
}

// Run all batches
console.log('Starting Compatible Test Batches Runner');
console.log('=======================================');

const results: BatchResult[] = [];

for (const batch of batches) {
  const result = runBatch(batch);
  results.push({ name: batch.name, ...result });
}

// Summarize results
console.log('\n=======================================');
console.log('Test Batches Summary:');
console.log('=======================================');

let successCount = 0;
let failCount = 0;
let skipCount = 0;

for (const result of results) {
  if (result.skipped) {
    skipCount++;
    console.log(`⏭️  ${result.name}: SKIPPED`);
  } else if (result.success) {
    successCount++;
    console.log(`✅ ${result.name}: PASSED`);
  } else {
    failCount++;
    console.log(`❌ ${result.name}: FAILED`);
  }
}

console.log('=======================================');
console.log(`${successCount} passed, ${failCount} failed, ${skipCount} skipped`);
console.log('=======================================\n');

// Exit with error if any batch failed
const exitCode: 0 | 1 = failCount > 0 ? 1 : 0;
process.exit(exitCode);
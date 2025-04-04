#!/usr/bin/env node
/**
 * This script runs tests in compatible batches to avoid hanging issues
 * Tests are organized based on their dependencies and potential conflicts
 */

// Import from Node.js built-in modules using ESM syntax
import { execSync } from 'node:child_process';

// Define interfaces for type safety
interface TestBatch {
  name: string;
  patterns: string[];
}

// Define test batches that can run together without conflicts
const batches: TestBatch[] = [
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
function runBatch(batch: TestBatch): boolean {
  console.log(`\n\n========== Running Test Batch: ${batch.name} ==========\n`);
  
  try {
    // Create pattern arguments
    const patterns: string = batch.patterns.map(p => `"${p}"`).join(' ');
    

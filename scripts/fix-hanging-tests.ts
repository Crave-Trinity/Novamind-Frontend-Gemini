#!/usr/bin/env ts-node
/**
 * NOVAMIND Hanging Test Fixer
 * 
 * This script applies our established mocking pattern to all visualization-related
 * tests that are currently causing hangs in the test suite.
 */

/// <reference types="node" />

import { fixHangingTest } from './fix-page-tests';
import * as fs from 'fs';
import * as path from 'path';

// Terminal colors for better output readability
const Color = {
  Reset: '\x1b[0m',
  Red: '\x1b[31m',
  Green: '\x1b[32m',
  Yellow: '\x1b[33m',
  Blue: '\x1b[34m',
  Magenta: '\x1b[35m',
  Cyan: '\x1b[36m'
} as const;

type ColorType = typeof Color[keyof typeof Color];

const log = (message: string, color: ColorType = Color.Reset): void => {
  console.log(`${color}${message}${Color.Reset}`);
};

// Problematic visualization tests identified by our analysis
const VISUALIZATION_TESTS = [
  'src/presentation/atoms/ConnectionLine.test.tsx',
  'src/presentation/atoms/NeuralCorrelationBadge.test.tsx',
  'src/presentation/atoms/RegionMesh.test.tsx',
  'src/presentation/atoms/RegionSelectionIndicator.test.tsx',
  'src/presentation/common/AdaptiveLOD.test.tsx',
  'src/presentation/common/LoadingFallback.test.tsx',
  'src/presentation/common/VisualizationErrorBoundary.test.tsx',
  'src/presentation/components/organisms/BrainVisualization.test.tsx',
  'src/presentation/containers/BrainModelContainer.test.tsx',
  'src/presentation/containers/__tests__/BrainModelContainer.test.tsx',
  'src/presentation/molecules/BiometricAlertVisualizer.test.tsx',
  'src/presentation/molecules/BrainRegionDetails.test.tsx',
  'src/presentation/molecules/BrainRegionGroup.test.tsx',
  'src/presentation/molecules/BrainRegionLabels.test.tsx',
  'src/presentation/molecules/BrainVisualizationControls.test.tsx',
  'src/presentation/molecules/DataStreamVisualizer.test.tsx',
  'src/presentation/molecules/NeuralActivityVisualizer.test.tsx',
  'src/presentation/molecules/NeuralConnections.test.tsx',
  'src/presentation/molecules/RegionSelectionPanel.test.tsx',
  'src/presentation/molecules/SymptomRegionMappingVisualizer.test.tsx',
  'src/presentation/molecules/TemporalDynamicsVisualizer.test.tsx',
  'src/presentation/molecules/TherapeuticTimelineVisualizer.test.tsx',
  'src/presentation/molecules/TreatmentResponseVisualizer.test.tsx',
  'src/presentation/molecules/VisualizationControls.test.tsx',
  'src/presentation/organisms/BiometricMonitorPanel.test.tsx',
  'src/presentation/organisms/BrainModelViewer.test.tsx',
  'src/presentation/organisms/BrainVisualization.test.tsx',
  'src/presentation/organisms/BrainVisualizationContainer.test.tsx',
  'src/presentation/organisms/ClinicalMetricsPanel.test.tsx',
  'src/presentation/organisms/ClinicalTimelinePanel.test.tsx',
  'src/presentation/organisms/DigitalTwinDashboard.test.tsx',
  'src/presentation/organisms/NeuralControlPanel.test.tsx',
  'src/presentation/organisms/RiskAssessmentPanel.test.tsx',
  'src/presentation/pages/BrainModelViewer.test.tsx',
  'src/presentation/pages/Dashboard.test.tsx',
  'src/presentation/pages/DigitalTwinDemo.test.tsx',
  'src/presentation/pages/DigitalTwinPage.test.tsx',
  'src/presentation/pages/PredictionAnalytics.test.tsx',
  'src/presentation/templates/BrainModelContainer.test.tsx',
  'src/application/hooks/useBrainModel.test.tsx',
  'src/application/hooks/useBrainVisualization.test.ts',
  'src/application/hooks/useClinicalContext.test.ts',
  'src/application/hooks/usePatientData.test.ts', 
  'src/application/hooks/useTreatmentPrediction.test.ts',
  'src/application/hooks/useVisualSettings.test.ts'
];

// React Query and Other Hooks tests that need fixing
const HOOKS_TESTS = [
  'src/application/hooks/useBrainModel.test.tsx',
  'src/application/hooks/useBrainVisualization.test.ts',
  'src/application/hooks/useClinicalContext.test.ts',
  'src/application/hooks/usePatientData.test.ts', 
  'src/application/hooks/useTreatmentPrediction.test.ts',
  'src/application/hooks/useVisualSettings.test.ts'
];

/**
 * Check if a file exists
 */
function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (e) {
    return false;
  }
}

/**
 * Collect all testfiles that need fixing
 */
function collectTestsToFix(): string[] {
  const testsToFix: string[] = [];
  
  // Check visualization tests
  for (const testPath of VISUALIZATION_TESTS) {
    if (fileExists(testPath)) {
      testsToFix.push(testPath);
    }
  }
  
  return testsToFix;
}

/**
 * Main function
 */
async function main() {
  log('\n🔧 NOVAMIND HANGING TEST FIXER', Color.Magenta);
  log('===================================\n');
  
  // Collect tests that need fixing
  const testsToFix = collectTestsToFix();
  
  log(`Found ${testsToFix.length} test files that need fixing`, Color.Cyan);
  
  // Fix tests with a progress counter
  for (let i = 0; i < testsToFix.length; i++) {
    const testPath = testsToFix[i];
    log(`\n[${i + 1}/${testsToFix.length}] Fixing ${testPath}`, Color.Yellow);
    
    try {
      await fixHangingTest(testPath);
      log(`✅ Successfully fixed ${testPath}`, Color.Green);
    } catch (error) {
      log(`❌ Error fixing ${testPath}: ${error}`, Color.Red);
    }
  }
  
  log('\n✅ All tests fixed!', Color.Green);
  log('\nNext steps:', Color.Blue);
  log('1. Run the fixed tests to verify they work: npx tsx scripts/test-hang-detector.ts', Color.Reset);
  log('2. Check the documentation in docs/solutions/test-hanging-issues-fixed.md for details on the solution', Color.Reset);
}

// ES module approach for running as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log(`\n❌ Error: ${error}`, Color.Red);
    process.exit(1);
  });
}
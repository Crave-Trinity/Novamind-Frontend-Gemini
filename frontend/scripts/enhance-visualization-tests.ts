/**
 * Enhanced Visualization Tests Script
 * 
 * This script systematically applies the WebGL/Three.js mocking system with memory monitoring
 * to all visualization tests that were identified in test-hang-investigation.md as problematic.
 * 
 * Features:
 * 1. Targets known problematic visualization tests
 * 2. Applies comprehensive WebGL mocks with memory monitoring
 * 3. Verifies tests no longer hang and execute properly
 * 4. Generates detailed memory usage reports to identify leaks
 * 
 * Usage:
 *   npx ts-node frontend/scripts/enhance-visualization-tests.ts [options]
 * 
 * Options:
 *   --verify         Run tests after applying mocks to verify they pass
 *   --memory         Enable memory leak detection with detailed reports
 *   --output=<path>  Directory to output memory reports (default: test-reports/memory)
 *   --timeout=<ms>   Timeout for individual test execution (default: 10000ms)
 */

// Add Node.js type reference for ESM
/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';
import { execSync, type ExecSyncOptions } from 'child_process';

// Known problematic test files from test-hang-investigation.md and fix-remaining-hanging-tests.ts
const PROBLEMATIC_TESTS = [
  // Molecules
  'src/presentation/molecules/NeuralActivityVisualizer.test.tsx',
  'src/presentation/molecules/VisualizationControls.test.tsx',
  'src/presentation/molecules/BrainVisualizationControls.test.tsx',
  'src/presentation/molecules/BiometricAlertVisualizer.test.tsx',
  'src/presentation/molecules/SymptomRegionMappingVisualizer.test.tsx',
  'src/presentation/molecules/TemporalDynamicsVisualizer.test.tsx',
  'src/presentation/molecules/PatientHeader.test.tsx',
  'src/presentation/molecules/TimelineEvent.test.tsx',
  'src/presentation/molecules/TreatmentResponseVisualizer.test.tsx',
  
  // Controllers
  'src/application/controllers/NeuralActivityController.test.ts',
  
  // Organisms
  'src/presentation/organisms/BiometricMonitorPanel.test.tsx',
  'src/presentation/organisms/ClinicalTimelinePanel.test.tsx',
  'src/presentation/organisms/DigitalTwinDashboard.test.tsx',
  
  // Templates and Pages
  'src/presentation/templates/BrainModelContainer.test.tsx',
  'src/presentation/pages/DigitalTwinPage.test.tsx',
  'src/presentation/pages/PredictionAnalytics.test.tsx',
];

// Configuration
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MEMORY_REPORT_DIR = 'test-reports/memory';

// Parse command line args
const args = process.argv.slice(2);
const options = {
  verify: args.includes('--verify'),
  memory: args.includes('--memory'),
  output: args.find(arg => arg.startsWith('--output='))?.split('=')[1] || DEFAULT_MEMORY_REPORT_DIR,
  timeout: parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1] || DEFAULT_TIMEOUT_MS.toString(), 10),
};

/**
 * Apply WebGL mocks to a test file with enhanced memory monitoring
 */
function enhanceTestFile(filePath: string): boolean {
  console.log(`Enhancing test file: ${filePath}`);
  
  try {
    // Ensure file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already using our enhanced WebGL mocks
    if (content.includes('memoryMonitor')) {
      console.log(`  File already uses enhanced WebGL mocks, skipping.`);
      return false;
    }
    
    // Create backup of original file
    const backupPath = `${filePath}.bak`;
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
      console.log(`  Created backup at ${backupPath}`);
    }
    
    // Add imports for vitest if needed
    if (!content.includes('vitest')) {
      content = `import { describe, it, expect, beforeEach, afterEach } from 'vitest';\n${content}`;
    } else {
      // Make sure beforeEach and afterEach are imported
      content = content.replace(
        /import\s+\{([^}]+)\}\s+from\s+(['"])vitest\2/,
        (match, imports) => {
          const importList = imports.split(',')
            .map(i => i.trim())
            .filter(i => i.length > 0);
          
          if (!importList.includes('beforeEach')) importList.push('beforeEach');
          if (!importList.includes('afterEach')) importList.push('afterEach');
          
          return `import { ${importList.join(', ')} } from "vitest"`;
        }
      );
    }
    
    // Add imports for WebGL mocks with memory monitoring
    if (!content.includes('@test/webgl')) {
      content = content.replace(
        /import[^;]+;(\s*)/,
        (match) => `${match}import { setupWebGLMocks, cleanupWebGLMocks, ThreeMocks, memoryMonitor } from '@test/webgl';\n\n`
      );
    } else if (!content.includes('memoryMonitor')) {
      // Update the existing import to include memory monitoring
      content = content.replace(
        /import\s+\{([^}]+)\}\s+from\s+(['"])@test\/webgl\2/,
        (match, imports) => {
          const importList = imports.split(',')
            .map(i => i.trim())
            .filter(i => i.length > 0);
          
          if (!importList.includes('memoryMonitor')) importList.push('memoryMonitor');
          
          return `import { ${importList.join(', ')} } from "@test/webgl"`;
        }
      );
    }
    
    // Add enhanced setup/cleanup hooks with memory monitoring
    let hasSetupHooks = false;
    
    content = content.replace(
      /describe\(\s*(['"])(.*)\1\s*,\s*(\(\s*\)\s*=>|function\s*\(\s*\)\s*)\s*{/g,
      (match, quote, name, fn) => {
        hasSetupHooks = true;
        return `${match}\n` +
          `  // Setup WebGL mocks with memory monitoring\n` +
          `  beforeEach(() => {\n` +
          `    setupWebGLMocks({ monitorMemory: true, debugMode: ${options.memory} });\n` +
          `  });\n\n` +
          `  afterEach(() => {\n` +
          `    const memoryReport = cleanupWebGLMocks();\n` +
          `    if (memoryReport && memoryReport.leakedObjectCount > 0) {\n` +
          `      console.warn(\`Memory leak detected in "${name}": \${memoryReport.leakedObjectCount} objects not properly disposed\`);\n` +
          `      console.warn('Leaked objects by type:', memoryReport.leakedObjectTypes);\n` +
          `    }\n` +
          `  });\n`;
      }
    );
    
    // If no describe blocks were found (rare case), add a wrapper
    if (!hasSetupHooks) {
      const componentName = path.basename(filePath).replace(/\.test\.(tsx|ts)$/, '');
      content = `
import { setupWebGLMocks, cleanupWebGLMocks, ThreeMocks, memoryMonitor } from '@test/webgl';

describe('${componentName} with WebGL Mocks', () => {
  // Setup WebGL mocks with memory monitoring
  beforeEach(() => {
    setupWebGLMocks({ monitorMemory: true, debugMode: ${options.memory} });
  });

  afterEach(() => {
    const memoryReport = cleanupWebGLMocks();
    if (memoryReport && memoryReport.leakedObjectCount > 0) {
      console.warn(\`Memory leak detected in "${componentName}": \${memoryReport.leakedObjectCount} objects not properly disposed\`);
      console.warn('Leaked objects by type:', memoryReport.leakedObjectTypes);
    }
  });

${content}
});`;
    }
    
    // If test is using Three.js directly (not through @react-three/fiber),
    // update material/mesh creation to use the memory tracking
    content = content.replace(
      /new\s+(Mesh|SphereGeometry|BoxGeometry|MeshStandardMaterial|MeshBasicMaterial|BufferGeometry)\(/g,
      (match, className) => {
        return `/* Track Three.js object */ memoryMonitor.trackObject(new ${className}(`;
      }
    );
    
    content = content.replace(
      /\/\* Track Three\.js object \*\/\s+memoryMonitor\.trackObject\((new\s+\w+\([^)]*\))\)/g,
      (match, creation) => {
        return `(() => { const obj = ${creation}; memoryMonitor.trackObject(obj, '${creation.split('(')[0].trim()}'); return obj; })()`;
      }
    );
    
    // Add dispose() call tracking where missing
    content = content.replace(
      /(mesh|geometry|material|renderer|scene|camera|controls)\.dispose\(\)/g,
      (match, objectName) => {
        return `/* Capture dispose */ (() => { memoryMonitor.markDisposed(${objectName}, '${objectName.charAt(0).toUpperCase() + objectName.slice(1)}'); ${match}; })()`;
      }
    );
    
    // Write the enhanced test file
    fs.writeFileSync(filePath, content);
    console.log(`  Enhanced test file with WebGL mocks and memory monitoring.`);
    return true;
  } catch (err) {
    console.error(`Error enhancing file ${filePath}:`, err);
    return false;
  }
}

/**
 * Verify a test file passes without hanging
 */
function verifyTestFile(filePath: string): { pass: boolean; memoryLeak: boolean; time: number } {
  console.log(`Verifying test: ${filePath}`);
  
  // Create memory report directory if needed
  if (options.memory) {
    if (!fs.existsSync(options.output)) {
      fs.mkdirSync(options.output, { recursive: true });
    }
  }
  
  const startTime = Date.now();
  let pass = false;
  let memoryLeak = false;
  let output = '';
  
  try {
    // Run the test with timing information
    const result = execSync(`VERBOSE=true npx vitest run ${filePath} --silent`, {
      timeout: options.timeout,
      encoding: 'utf8'
    });
    
    output = result;
    pass = true;
  } catch (err: any) {
    output = err.stdout || '';
    pass = false;
  }
  
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  
  // Check for memory leaks in the output
  memoryLeak = output.includes('Memory leak detected');
  
  // Save output to memory report if enabled
  if (options.memory) {
    const filename = path.basename(filePath).replace(/\.(tsx|ts)$/, '.log');
    fs.writeFileSync(path.join(options.output, filename), output);
  }
  
  // Log success/failure
  if (pass) {
    console.log(`  Test passed in ${executionTime}ms`);
    if (memoryLeak) {
      console.warn(`  WARNING: Memory leak detected - see report for details`);
    }
  } else {
    console.error(`  Test failed in ${executionTime}ms`);
    if (output.includes('timed out')) {
      console.error(`  Test timed out after ${options.timeout}ms`);
    }
  }
  
  return { pass, memoryLeak, time: executionTime };
}

/**
 * Main execution function
 */
async function main() {
  console.log('Enhancing visualization tests with WebGL mocks and memory monitoring');
  console.log(`Options: verify=${options.verify}, memory=${options.memory}, timeout=${options.timeout}ms`);
  
  // Process each problematic test file
  let enhanced = 0;
  let verified = 0;
  let memoryLeaks = 0;
  const results: Record<string, { enhanced: boolean; verified?: boolean; memoryLeak?: boolean; time?: number }> = {};
  
  for (const testFile of PROBLEMATIC_TESTS) {
    const result: any = { enhanced: false };
    
    // Apply WebGL mocks with memory monitoring
    result.enhanced = enhanceTestFile(testFile);
    if (result.enhanced) enhanced++;
    
    // Verify the test passes if requested
    if (options.verify && result.enhanced) {
      const verifyResult = verifyTestFile(testFile);
      result.verified = verifyResult.pass;
      result.memoryLeak = verifyResult.memoryLeak;
      result.time = verifyResult.time;
      
      if (verifyResult.pass) verified++;
      if (verifyResult.memoryLeak) memoryLeaks++;
    }
    
    results[testFile] = result;
  }
  
  // Generate summary report
  console.log('\nEnhancement Summary:');
  console.log(`  Total files processed: ${PROBLEMATIC_TESTS.length}`);
  console.log(`  Files enhanced: ${enhanced}`);
  
  if (options.verify) {
    console.log(`  Tests verified: ${verified}/${enhanced}`);
    console.log(`  Memory leaks detected: ${memoryLeaks}/${enhanced}`);
  }
  
  // If memory reports were requested, generate a summary file
  if (options.memory) {
    const summaryPath = path.join(options.output, 'memory-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
    console.log(`\nDetailed memory report written to ${summaryPath}`);
  }
  
  // Show next steps
  console.log('\nNext Steps:');
  console.log('  1. Fix any failing tests or memory leaks detected');
  console.log('  2. Create integration tests for the WebGL mocks');
  console.log('  3. Add memory monitoring to CI pipeline');
}

// Execute the script
main().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});

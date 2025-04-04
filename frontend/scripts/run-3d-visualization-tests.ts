/**
 * WebGL/Three.js Visualization Tests Runner
 * 
 * A specialized test runner optimized for running visualization tests that use WebGL/Three.js.
 * This runner automatically sets up WebGL mocks, provides memory monitoring, and includes
 * protection against hanging tests.
 * 
 * Features:
 * 1. Automatically applies WebGL mocks to all tests
 * 2. Detects and reports memory leaks
 * 3. Prevents test hanging with configurable timeouts
 * 4. Generates detailed performance reports
 * 5. Provides CI/CD compatible output formats
 * 
 * Usage:
 *   npx ts-node frontend/scripts/run-3d-visualization-tests.ts [options]
 * 
 * Options:
 *   --dir=<path>       Directory to run tests from (default: src/presentation)
 *   --pattern=<glob>   Test file pattern (default: **/*.test.{ts,tsx})
 *   --timeout=<ms>     Global timeout for tests (default: 30000ms)
 *   --memory           Enable memory leak detection with detailed reports
 *   --output=<path>    Output directory for reports (default: test-reports/visualization)
 *   --ci               Generate CI-friendly output (JUnit XML format)
 *   --verbose          Show detailed logs
 */

// Add Node.js type reference
/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawnSync, type SpawnSyncOptions } from 'child_process';
import { glob } from 'glob';

interface TestResult {
  file: string;
  success: boolean;
  time: number;
  memoryLeak: boolean;
  error?: string;
  leakedObjects?: Record<string, number>;
}

// Configuration
const DEFAULT_TEST_DIR = 'src/presentation';
const DEFAULT_TEST_PATTERN = '**/*.test.{ts,tsx}';
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_OUTPUT_DIR = 'test-reports/visualization';
const VISUALIZATION_INDICATORS = [
  'Brain', 'Neural', 'Visual', 'Render', 'WebGL', 'Canvas', 'Three', 'Scene',
  'Camera', 'Mesh', 'Geometry', 'Material', 'Texture', '3D', 'Animation'
];

// Parse command line args
const args = process.argv.slice(2);
const options = {
  dir: args.find(arg => arg.startsWith('--dir='))?.split('=')[1] || DEFAULT_TEST_DIR,
  pattern: args.find(arg => arg.startsWith('--pattern='))?.split('=')[1] || DEFAULT_TEST_PATTERN,
  timeout: parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1] || DEFAULT_TIMEOUT_MS.toString(), 10),
  memory: args.includes('--memory'),
  output: args.find(arg => arg.startsWith('--output='))?.split('=')[1] || DEFAULT_OUTPUT_DIR,
  ci: args.includes('--ci'),
  verbose: args.includes('--verbose')
};

// Ensure output directory exists
if (!fs.existsSync(options.output)) {
  fs.mkdirSync(options.output, { recursive: true });
}

if (options.verbose) {
  console.log('Configuration:');
  console.log(JSON.stringify(options, null, 2));
}

/**
 * Find visualization test files based on content and naming patterns
 */
async function findVisualizationTests(baseDir: string, pattern: string): Promise<string[]> {
  // Get all test files
  const allTestFiles = await glob(pattern, { cwd: baseDir, absolute: true });
  const visualizationTests: string[] = [];

  // Check each file for visualization indicators
  for (const file of allTestFiles) {
    // Quick check: name suggests visualization test
    const filename = path.basename(file);
    if (VISUALIZATION_INDICATORS.some(indicator => 
      filename.toLowerCase().includes(indicator.toLowerCase()))) {
      visualizationTests.push(file);
      continue;
    }

    // More thorough check: content suggests visualization test
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (VISUALIZATION_INDICATORS.some(indicator => 
        content.includes(indicator) || 
        content.toLowerCase().includes(indicator.toLowerCase()))) {
        visualizationTests.push(file);
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  return visualizationTests;
}

/**
 * Run a single test file with WebGL mocking and memory monitoring
 */
function runTestFile(filePath: string): TestResult {
  console.log(`Running test: ${filePath}`);
  
  const result: TestResult = {
    file: filePath,
    success: false,
    time: 0,
    memoryLeak: false
  };
  
  const startTime = Date.now();
  
  try {
    // Set up environment variables for memory monitoring
    const env = { 
      ...process.env, 
      WEBGL_MEMORY_MONITOR: options.memory ? '1' : '0',
      NODE_OPTIONS: `--max-old-space-size=4096 ${process.env.NODE_OPTIONS || ''}`
    };
    
    // Run test with Vitest
    const testProcess = spawnSync('npx', [
      'vitest', 'run', filePath,
      '--config', 'vitest.config.unified.ts',
      '--reporter', 'verbose',
      options.ci ? '--reporter=junit' : '',
      `--timeout=${options.timeout}`
    ].filter(Boolean), {
      env,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: options.timeout + 5000, // Add 5s buffer to the timeout
      stdio: 'pipe'
    } as SpawnSyncOptions);
    
    const endTime = Date.now();
    result.time = endTime - startTime;
    
    // Check for test success
    result.success = testProcess.status === 0;
    
    // Check output for memory leak indicators
    const output = testProcess.stdout + '\n' + testProcess.stderr;
    result.memoryLeak = output.includes('Memory leak detected');
    
    // Extract leaked objects info if available
    if (result.memoryLeak) {
      const leakMatch = output.match(/Leaked objects by type:\s*({[^}]+})/);
      if (leakMatch && leakMatch[1]) {
        try {
          result.leakedObjects = JSON.parse(leakMatch[1].replace(/'/g, '"'));
        } catch (error) {
          console.error('Error parsing leaked objects:', error);
        }
      }
    }
    
    // Store test output
    const outputFilename = path.basename(filePath).replace(/\.(tsx|ts)$/, '.log');
    fs.writeFileSync(path.join(options.output, outputFilename), output);
    
    // Store JUnit report if running in CI mode
    if (options.ci && result.success) {
      const junitFilename = path.basename(filePath).replace(/\.(tsx|ts)$/, '.xml');
      fs.writeFileSync(
        path.join(options.output, junitFilename),
        output.substring(
          output.indexOf('<?xml'),
          output.indexOf('</testsuites>') + '</testsuites>'.length
        )
      );
    }
    
    if (result.success) {
      console.log(`  ✓ Test passed in ${result.time}ms`);
      if (result.memoryLeak) {
        console.warn(`  ⚠ Memory leak detected - see log for details`);
      }
    } else {
      result.error = testProcess.stderr || testProcess.error?.message;
      console.error(`  ✗ Test failed in ${result.time}ms`);
      if (output.includes('timed out')) {
        console.error(`  ✗ Test timed out after ${options.timeout}ms`);
      }
    }
    
    return result;
  } catch (error: any) {
    const endTime = Date.now();
    result.time = endTime - startTime;
    result.success = false;
    result.error = error.message;
    console.error(`  ✗ Error running test: ${error.message}`);
    return result;
  }
}

/**
 * Generate a human-readable summary report
 */
function generateSummaryReport(results: TestResult[]): string {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  const memoryLeaks = results.filter(r => r.memoryLeak).length;
  
  const totalTime = results.reduce((sum, r) => sum + r.time, 0);
  const avgTime = totalTime / totalTests || 0;
  
  let report = `# WebGL Visualization Tests Summary\n\n`;
  report += `Run Date: ${new Date().toISOString()}\n\n`;
  report += `## Overview\n\n`;
  report += `- Total Tests: ${totalTests}\n`;
  report += `- Passed: ${passedTests} (${Math.round(passedTests / totalTests * 100)}%)\n`;
  report += `- Failed: ${failedTests} (${Math.round(failedTests / totalTests * 100)}%)\n`;
  report += `- Memory Leaks: ${memoryLeaks} (${Math.round(memoryLeaks / totalTests * 100)}%)\n`;
  report += `- Total Time: ${totalTime}ms\n`;
  report += `- Average Time: ${avgTime.toFixed(2)}ms\n\n`;
  
  report += `## Failed Tests\n\n`;
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length === 0) {
    report += `No failed tests.\n\n`;
  } else {
    failedTests.forEach(test => {
      report += `### ${path.relative(process.cwd(), test.file)}\n`;
      report += `- Execution Time: ${test.time}ms\n`;
      if (test.error) {
        report += `- Error: ${test.error.split('\n')[0]}\n`;
      }
      report += `\n`;
    });
  }
  
  report += `## Memory Leaks\n\n`;
  const leakyTests = results.filter(r => r.memoryLeak);
  if (leakyTests.length === 0) {
    report += `No memory leaks detected.\n\n`;
  } else {
    leakyTests.forEach(test => {
      report += `### ${path.relative(process.cwd(), test.file)}\n`;
      report += `- Execution Time: ${test.time}ms\n`;
      if (test.leakedObjects) {
        report += `- Leaked Objects:\n`;
        Object.entries(test.leakedObjects).forEach(([type, count]) => {
          report += `  - ${type}: ${count}\n`;
        });
      }
      report += `\n`;
    });
  }
  
  return report;
}

/**
 * Main function - test discovery and execution
 */
async function main() {
  console.log('WebGL/Three.js Visualization Tests Runner');
  console.log(`Discovering tests in ${options.dir} with pattern ${options.pattern}...`);
  
  // Find visualization tests
  const testFiles = await findVisualizationTests(options.dir, options.pattern);
  console.log(`Found ${testFiles.length} visualization tests.`);
  
  if (testFiles.length === 0) {
    console.log('No tests to run.');
    return;
  }
  
  // Run tests with WebGL mocks
  console.log('\nRunning tests with WebGL mocks...');
  const results: TestResult[] = [];
  
  // Setup environment for WebGL mocks
  console.log('Setting up global WebGL mock environment...');
  fs.writeFileSync(
    path.join(options.output, 'vitest-setup.js'),
    `
    // Auto-inject WebGL mocks for all tests
    import { setupWebGLMocks } from '@test/webgl';
    
    // Configure global beforeEach/afterEach hooks
    beforeEach(() => {
      setupWebGLMocks({ monitorMemory: ${options.memory}, debugMode: ${options.verbose} });
    });
    
    // Register with global Vitest hooks
    if (typeof globalThis.beforeEach === 'function') {
      globalThis.beforeEach(() => {
        setupWebGLMocks({ monitorMemory: ${options.memory}, debugMode: ${options.verbose} });
      });
    }
    `
  );
  
  // Run each test
  for (const testFile of testFiles) {
    const result = runTestFile(testFile);
    results.push(result);
  }
  
  // Generate summary statistics
  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.length - passedTests;
  const memoryLeaks = results.filter(r => r.memoryLeak).length;
  
  // Write summary report
  const summaryReport = generateSummaryReport(results);
  fs.writeFileSync(path.join(options.output, 'summary.md'), summaryReport);
  
  // Write JSON results
  fs.writeFileSync(
    path.join(options.output, 'results.json'), 
    JSON.stringify(results, null, 2)
  );
  
  // Print summary
  console.log('\nTest Summary:');
  console.log(`- Total Tests: ${results.length}`);
  console.log(`- Passed: ${passedTests}`);
  console.log(`- Failed: ${failedTests}`);
  console.log(`- Memory Leaks: ${memoryLeaks}`);
  
  if (options.verbose) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.success).forEach(test => {
      console.log(`- ${path.relative(process.cwd(), test.file)}`);
    });
    
    console.log('\nTests with Memory Leaks:');
    results.filter(r => r.memoryLeak).forEach(test => {
      console.log(`- ${path.relative(process.cwd(), test.file)}`);
    });
  }
  
  console.log(`\nDetailed reports written to ${options.output}`);
  
  // Set exit code for CI environments
  if (failedTests > 0) {
    process.exitCode = 1;
  }
}

// Run the script
main().catch(error => {
  console.error('Error running visualization tests:', error);
  process.exit(1);
});

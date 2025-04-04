/**
 * Identify Hanging Tests Script
 * 
 * This script identifies test files that are likely to hang due to Three.js/WebGL issues.
 * It uses a combination of heuristics:
 * 
 * 1. Tests that take an unusually long time to execute
 * 2. Tests that contain Three.js/WebGL related imports or code
 * 3. Tests in directories known to contain visualization components
 * 
 * Usage:
 *   npx ts-node frontend/scripts/identify-hanging-tests.ts [options]
 * 
 * Options:
 *   --dir=<path>     Directory to scan (default: src/presentation/visualizations)
 *   --timeout=<ms>   Timeout for test execution (default: 5000ms)
 *   --output=<path>  Output file for list of hanging tests (default: hanging-tests.txt)
 */
// Add Node.js type reference
/// <reference types="node" />

// Using node builtins with ESM
import * as fs from 'fs';
import * as path from 'path';
import { execSync, type ExecSyncOptions } from 'child_process';

// Define TypeScript interfaces
interface TestFileAnalysis {
  path: string;
  riskLevel: number;
  indicators: string[];
}

interface TestExecutionResult {
  time: number;
  timedOut: boolean;
}

interface TestResult extends TestFileAnalysis {
  executionTime: number;
  timedOut: boolean;
}

// Configuration
const DEFAULT_TEST_DIR = 'src/presentation/visualizations';
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_OUTPUT_FILE = 'hanging-tests.txt';
const TEST_FILE_PATTERN = /\.(test|spec)\.(ts|tsx)$/;

// Risk indicators in test files
const RISK_INDICATORS = [
  // Three.js imports
  /import.*from\s+['"]three['"]/,
  /import.*from\s+['"]@react-three\/fiber['"]/,
  /import.*from\s+['"]@react-three\/drei['"]/,
  
  // WebGL related terms
  /\bWebGL\b/,
  /\bcanvas\b/i,
  /\bcontext\b.*\bgl\b/i,
  
  // Visualization components
  /BrainRegion/i,
  /Visuali[zs]er/i,
  /Neural/i,
  
  // Animation related code
  /requestAnimationFrame/,
  /animate\(\)/,
  /animation/i,
];

// Parse command line args
const args = process.argv.slice(2);
const options = {
  dir: args.find(arg => arg.startsWith('--dir='))?.split('=')[1] || DEFAULT_TEST_DIR,
  timeout: parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1] || DEFAULT_TIMEOUT_MS.toString(), 10),
  output: args.find(arg => arg.startsWith('--output='))?.split('=')[1] || DEFAULT_OUTPUT_FILE,
};

console.log('Configuration:');
console.log(`  Directory: ${options.dir}`);
console.log(`  Timeout: ${options.timeout}ms`);
console.log(`  Output: ${options.output}`);

/**
 * Find all test files in a directory
 */
function findTestFiles(directory: string): string[] {
  try {
    const result: string[] = [];
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        result.push(...findTestFiles(fullPath));
      } else if (TEST_FILE_PATTERN.test(entry.name)) {
        result.push(fullPath);
      }
    }
    
    return result;
  } catch (err) {
    console.error(`Error scanning directory ${directory}:`, err);
    return [];
  }
}

/**
 * Analyze a test file for risk indicators
 */
function analyzeTestFile(filePath: string): TestFileAnalysis {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for risk indicators
    const indicators: string[] = [];
    let riskLevel = 0;
    
    for (const pattern of RISK_INDICATORS) {
      if (pattern.test(content)) {
        const indicator = pattern.toString().replace(/\/|\^|\$/g, '').slice(1, -1);
        indicators.push(indicator);
        riskLevel += 1;
      }
    }
    
    return {
      path: filePath,
      riskLevel,
      indicators
    };
  } catch (err) {
    console.error(`Error analyzing file ${filePath}:`, err);
    return {
      path: filePath,
      riskLevel: 0,
      indicators: []
    };
  }
}

/**
 * Try to run a test file and measure execution time
 */
function testExecutionTime(filePath: string): TestExecutionResult {
  try {
    console.log(`Testing execution time for ${filePath}...`);
    
    const startTime = Date.now();
    
    try {
      // Run the test with a timeout
      execSync(`npx vitest run ${filePath} --silent`, {
        timeout: options.timeout,
        stdio: 'ignore', // Suppress output to keep console clean
      } as ExecSyncOptions);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      return {
        time: executionTime,
        timedOut: false
      };
    } catch (err) {
      // Check if it was a timeout
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      return {
        time: executionTime,
        timedOut: executionTime >= options.timeout
      };
    }
  } catch (err) {
    console.error(`Error running test ${filePath}:`, err);
    return {
      time: 0,
      timedOut: false
    };
  }
}

/**
 * Main execution function
 */
async function main() {
  // Find all test files
  console.log(`Scanning for test files in ${options.dir}...`);
  const testFiles = findTestFiles(options.dir);
  console.log(`Found ${testFiles.length} test files.`);
  
  // Analyze each file for risk
  console.log('\nAnalyzing files for risk indicators...');
  const analyzedFiles = testFiles.map(file => analyzeTestFile(file));
  
  // Sort by risk level
  const sortedFiles = analyzedFiles
    .filter(file => file.riskLevel > 0) // Only files with risk indicators
    .sort((a, b) => b.riskLevel - a.riskLevel);
  
  console.log(`Found ${sortedFiles.length} files with risk indicators.`);
  
  // Test execution time for risky files
  console.log('\nTesting execution time for risky files...');
  
  const testResults: TestResult[] = [];
  for (const file of sortedFiles) {
    const executionResult = testExecutionTime(file.path);
    
    testResults.push({
      ...file,
      executionTime: executionResult.time,
      timedOut: executionResult.timedOut
    });
    
    // Give a summary for each file
    console.log(`  ${file.path}`);
    console.log(`    Risk Level: ${file.riskLevel}`);
    console.log(`    Indicators: ${file.indicators.join(', ')}`);
    console.log(`    Execution Time: ${executionResult.time}ms${executionResult.timedOut ? ' (TIMED OUT)' : ''}`);
    console.log();
  }
  
  // Identify likely hanging tests
  const hangingTests: TestResult[] = testResults.filter(result => 
    result.timedOut || // Timed out during execution
    result.executionTime > (options.timeout * 0.8) || // Close to timeout
    (result.riskLevel >= 3 && result.executionTime > 2000) // High risk and slow
  );
  
  console.log(`Identified ${hangingTests.length} potentially hanging tests.`);
  
  // Write results to output file
  const outputContent = hangingTests.map(test => test.path).join('\n');
  fs.writeFileSync(options.output, outputContent);
  
  console.log(`\nResults written to ${options.output}`);
  
  // Overall summary
  console.log('\nSummary:');
  console.log(`  Total test files: ${testFiles.length}`);
  console.log(`  Files with risk indicators: ${sortedFiles.length}`);
  console.log(`  Potentially hanging tests: ${hangingTests.length}`);
  
  if (hangingTests.length > 0) {
    console.log('\nNext steps:');
    console.log('  1. Apply WebGL mocks to these tests:');
    console.log(`     npx ts-node frontend/scripts/apply-webgl-mocks.ts --files=${options.output}`);
    console.log('  2. Verify the fixes:');
    console.log(`     npx ts-node frontend/scripts/apply-webgl-mocks.ts --files=${options.output} --verify`);
  }
}

// Run the script
main().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});

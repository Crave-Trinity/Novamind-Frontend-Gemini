/**
 * Run All Tests With WebGL Mocks
 * 
 * This script runs all tests with the WebGL mocking system enabled, allowing
 * visualization tests that would normally hang to complete successfully.
 */
import { spawn, execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Get current file's directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Visualization test patterns
const VISUALIZATION_PATTERNS = [
  '**/*Brain*.test.{ts,tsx}',
  '**/*Visual*.test.{ts,tsx}',
  '**/*Render*.test.{ts,tsx}',
  '**/*3D*.test.{ts,tsx}',
  '**/*Three*.test.{ts,tsx}',
  // Add more patterns as needed
];

// Create a special setup file for tests
const createTestSetupFile = (): string => {
  const setupContent = `
// Generated setup for tests with WebGL mocks
import { beforeAll, afterAll, vi } from 'vitest';
import { setupWebGLMocks, cleanupWebGLMocks } from '../src/test/webgl';

// Apply WebGL mocks automatically
beforeAll(() => {
  console.log('Setting up WebGL mocks for tests...');
  setupWebGLMocks({ 
    monitorMemory: true, 
    debugMode: !!process.env.WEBGL_DEBUG_MODE 
  });
  
  // Apply neural controller mocks if required
  if (process.env.NEURAL_CONTROLLER_MOCKS) {
    import('../src/test/webgl/examples/neural-controllers-mock')
      .then(({ applyNeuralControllerMocks }) => {
        if (typeof applyNeuralControllerMocks === 'function') {
          applyNeuralControllerMocks();
          console.log('Neural controller mocks applied');
        }
      })
      .catch(e => {
        console.log('Neural controller mocks not available:', e.message);
      });
  }
});

afterAll(() => {
  console.log('Cleaning up WebGL mocks...');
  
  // Clean up neural controller mocks if they were applied
  if (process.env.NEURAL_CONTROLLER_MOCKS) {
    import('../src/test/webgl/examples/neural-controllers-mock')
      .then(({ cleanupNeuralControllerMocks }) => {
        if (typeof cleanupNeuralControllerMocks === 'function') {
          cleanupNeuralControllerMocks();
          console.log('Neural controller mocks cleaned up');
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }
  
  const report = cleanupWebGLMocks();
  if (report && report.leakedObjectCount > 0) {
    console.warn(\`Memory leak detected: \${report.leakedObjectCount} objects not properly disposed\`);
    console.warn('Leaked objects by type:', report.leakedObjectTypes);
  }
});
`;

  const setupFilePath = path.resolve(process.cwd(), 'temp-webgl-test-setup.js');
  fs.writeFileSync(setupFilePath, setupContent);
  return setupFilePath;
};

// Helper to find tests matching visualization patterns
const findVisualizationTests = (): string[] => {
  const visualizationTests = new Set<string>();
  
  try {
    for (const pattern of VISUALIZATION_PATTERNS) {
      try {
        const findCmd = `find src -path "${pattern}"`;
        const output = execSync(findCmd, { encoding: 'utf8' });
        
        output.split('\n').filter(Boolean).forEach(file => {
          visualizationTests.add(file);
        });
      } catch (error) {
        console.error(`Error finding tests with pattern ${pattern}:`, error);
      }
    }
  } catch (error) {
    console.error('Error finding visualization tests:', error);
  }
  
  return Array.from(visualizationTests);
};

const visualizationTests = findVisualizationTests();
console.log(`Found ${visualizationTests.length} visualization tests`);

// Run the tests with WebGL mocks
const runTestsWithWebGLMocks = (): void => {
  // Create temp setup file
  const setupFilePath = createTestSetupFile();
  
  try {
    // Set environment variables for the test process
    const env = {
      ...process.env,
      VITEST_TIMEOUT: '30000', // 30 seconds timeout
      WEBGL_MEMORY_MONITOR: '1',
      WEBGL_DEBUG_MODE: '1',
      NEURAL_CONTROLLER_MOCKS: '1',
      NODE_OPTIONS: `--max-old-space-size=4096 ${process.env.NODE_OPTIONS || ''}`,
    };
    
    // Command to run all tests with our setup
    const testCommand = [
      'vitest',
      'run',
      '--config',
      'vitest.config.unified.ts',
      '--setupFiles',
      setupFilePath,
      '--threads',
      'false', // Disable threading for more reliable mocking
    ];
    
    console.log(`\nRunning all tests with WebGL mocks...`);
    console.log(`Command: npx ${testCommand.join(' ')}`);
    
    // Spawn the test process
    const testProcess = spawn('npx', testCommand, {
      stdio: 'inherit',
      env,
    });
    
    // Wait for the test process to complete
    testProcess.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(setupFilePath);
      } catch (e) {
        // Ignore error
      }
      
      if (code === 0) {
        console.log('\n✅ Tests completed successfully');
        process.exit(0);
      } else {
        console.error(`\n❌ Tests failed with exit code ${code}`);
        process.exit(code || 1);
      }
    });
  } catch (error) {
    // Clean up temp file
    try {
      fs.unlinkSync(setupFilePath);
    } catch (e) {
      // Ignore error
    }
    
    console.error('Error running tests:', error);
    process.exit(1);
  }
};

// Run the tests
runTestsWithWebGLMocks();

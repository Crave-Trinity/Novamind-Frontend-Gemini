/**
 * Run 3D Visualization Tests With WebGL Mocks
 * 
 * This script runs the tests for 3D visualization components with WebGL/Three.js mocking 
 * fully enabled and with special controller mocks for neural visualization tests.
 */
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Parse command line arguments
const args = process.argv.slice(2);
const testPattern = args.find(arg => !arg.startsWith('--')) || '';
const dirArg = args.find(arg => arg.startsWith('--dir='));
const patternArg = args.find(arg => arg.startsWith('--pattern='));

// Extract target directory and pattern from arguments
const dir = dirArg ? dirArg.replace('--dir=', '') : 'src';
const pattern = patternArg 
  ? patternArg.replace('--pattern=', '') 
  : '**/*{Visual,Render,Brain,3D,Three}*.test.{ts,tsx}';

// Ensure the WebGL mocks are properly loaded
console.log('Preparing WebGL mocks for 3D visualization tests...');

// Find all test files matching the pattern
const getVisualizationTestFiles = () => {
  const targetDir = path.join(process.cwd(), dir);
  let testFiles: string[] = [];
  
  try {
    const findCommand = spawnSync('find', [
      targetDir, 
      '-name', 
      pattern
    ]);
    
    if (findCommand.status === 0) {
      testFiles = findCommand.stdout.toString().trim().split('\n').filter(Boolean);
    } else {
      console.error('Error finding test files:', findCommand.stderr.toString());
    }
  } catch (error) {
    console.error('Error executing find command:', error);
  }
  
  return testFiles;
};

const visualizationTestFiles = getVisualizationTestFiles();

console.log(`Found ${visualizationTestFiles.length} 3D visualization test files`);
if (visualizationTestFiles.length > 0) {
  console.log('First few test files:');
  visualizationTestFiles.slice(0, 5).forEach(file => {
    console.log(`- ${path.relative(process.cwd(), file)}`);
  });
}

// Set environment variables for the test process
const env = {
  ...process.env,
  VITEST_TIMEOUT: '30000', // 30 seconds timeout to prevent hanging
  WEBGL_MEMORY_MONITOR: '1',
  WEBGL_DEBUG_MODE: '1',
  NEURAL_CONTROLLER_MOCKS: '1',
  NODE_OPTIONS: `--max-old-space-size=4096 ${process.env.NODE_OPTIONS || ''}`,
};

// Run specific tests
console.log('\nRunning 3D visualization tests with WebGL mocks...');

// Create a special setup for visualization tests
const createSetupFile = () => {
  const setupContent = `
// Generated setup for 3D visualization tests
import { beforeAll, afterAll } from 'vitest';
import { setupWebGLMocks, cleanupWebGLMocks } from '../src/test/webgl';

// Apply WebGL mocks automatically
beforeAll(() => {
  console.log('Setting up WebGL mocks for visualization tests...');
  setupWebGLMocks({ monitorMemory: true, debugMode: true });
  
  // Apply neural controller mocks if available
  try {
    const { applyNeuralControllerMocks } = require('../src/test/webgl/examples/neural-controllers-mock');
    if (typeof applyNeuralControllerMocks === 'function') {
      applyNeuralControllerMocks();
      console.log('Neural controller mocks applied');
    }
  } catch (e) {
    console.log('Neural controller mocks not available:', e.message);
  }
});

afterAll(() => {
  console.log('Cleaning up WebGL mocks...');
  try {
    const { cleanupNeuralControllerMocks } = require('../src/test/webgl/examples/neural-controllers-mock');
    if (typeof cleanupNeuralControllerMocks === 'function') {
      cleanupNeuralControllerMocks();
      console.log('Neural controller mocks cleaned up');
    }
  } catch (e) {
    // Ignore if not available
  }
  
  const report = cleanupWebGLMocks();
  if (report && report.leakedObjectCount > 0) {
    console.warn(\`Memory leak detected: \${report.leakedObjectCount} objects not properly disposed\`);
    console.warn('Leaked objects by type:', report.leakedObjectTypes);
  }
});
`;

  const setupFilePath = path.resolve(process.cwd(), 'temp-test-setup.js');
  fs.writeFileSync(setupFilePath, setupContent);
  return setupFilePath;
};

const setupFilePath = createSetupFile();

// Build the test command
let vitestArgs = [
  'vitest',
  'run',
  '--config', 'vitest.config.unified.ts',
  '--setupFiles', setupFilePath,
  '--threads', 'false',  // Disable threading for more reliable WebGL mocking
];

// Add specific test patterns if requested
if (testPattern) {
  vitestArgs.push(testPattern);
}

// Add all visualization test files if no specific pattern was provided
if (!testPattern && visualizationTestFiles.length > 0) {
  visualizationTestFiles.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    vitestArgs.push(relativePath);
  });
}

console.log(`Running command: npx ${vitestArgs.join(' ')}`);

// Run the tests
const startTime = Date.now();
const testProcess = spawnSync('npx', vitestArgs, {
  stdio: 'inherit',
  env,
});

// Calculate test duration
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

// Cleanup temp file
try {
  fs.unlinkSync(setupFilePath);
} catch (e) {
  // Ignore error
}

// Handle test process result
if (testProcess.status === 0) {
  console.log(`\n✅ 3D visualization tests completed successfully in ${duration}s`);
  process.exit(0);
} else {
  console.error(`\n❌ 3D visualization tests failed after ${duration}s with exit code ${testProcess.status}`);
  process.exit(testProcess.status || 1);
}

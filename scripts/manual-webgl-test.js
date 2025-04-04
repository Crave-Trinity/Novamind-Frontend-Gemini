#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Create temporary WebGL setup file
const SETUP_CONTENT = `
// WebGL Test Setup for direct test runs
import { setupWebGLMocks, cleanupWebGLMocks } from './src/test/webgl/index.js';

// Set up WebGL mocks
console.log('Setting up WebGL mocks for visualization tests...');
setupWebGLMocks({ 
  monitorMemory: true,
  debugMode: true 
});

// Register cleanup on process exit
process.on('exit', () => {
  console.log('Cleaning up WebGL mocks...');
  const report = cleanupWebGLMocks();
  if (report && report.leakedObjectCount > 0) {
    console.warn(\`⚠️ Memory leak detected: \${report.leakedObjectCount} objects not properly disposed\`);
    console.warn('Leaked objects by type:', report.leakedObjectTypes);
  }
});
`;

// Write the setup file
fs.writeFileSync(path.join(process.cwd(), 'webgl-setup-temp.js'), SETUP_CONTENT);

try {
  // Run the test with the existing unified config
  console.log('🧠 Running visualization test with WebGL mocking...');
  
  // Build the command with the test file path from command line argument
  const testFile = process.argv[2];
  if (!testFile) {
    console.error('❌ Error: No test file specified');
    console.log('Usage: node manual-webgl-test.js <test-file-path>');
    process.exit(1);
  }
  
  // Run the test with NODE_OPTIONS for memory and require the setup file
  const command = `NODE_OPTIONS="--require ./webgl-setup-temp.js --max-old-space-size=4096" npx vitest run --config vitest.config.unified.ts ${testFile}`;
  
  console.log(`Executing: ${command}`);
  execSync(command, { stdio: 'inherit' });
  
  console.log('✅ Visualization tests completed successfully');
} catch (error) {
  console.error('❌ Visualization tests failed:', error.message);
} finally {
  // Clean up the temporary setup file
  fs.unlinkSync(path.join(process.cwd(), 'webgl-setup-temp.js'));
}

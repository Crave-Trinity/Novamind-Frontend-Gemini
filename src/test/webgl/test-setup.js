// WebGL Test Setup (Global for all tests)
import { beforeAll, afterAll } from 'vitest';
import { setupWebGLMocks, cleanupWebGLMocks } from './index.js';

// Global setup for all tests
beforeAll(() => {
  console.log('WebGL mocks set up');
  setupWebGLMocks({ 
    monitorMemory: true,
    debugMode: process.env.WEBGL_DEBUG === 'true'
  });
});

// Global cleanup for all tests
afterAll(() => {
  console.log('WebGL mocks cleaned up');
  
  // Clean up WebGL mocks and report memory leaks
  const report = cleanupWebGLMocks();
  if (report && report.leakedObjectCount > 0) {
    console.warn(`⚠️ Memory leak detected: ${report.leakedObjectCount} objects not properly disposed`);
    console.warn('Leaked objects by type:', report.leakedObjectTypes);
  }
});

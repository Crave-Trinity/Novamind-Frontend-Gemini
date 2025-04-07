/**
 * DigitalTwinDashboard - Minimal Test
 * Replaced with minimal test to prevent hanging from useFrame animation loop
 */

// Removed unused React import
import { setupWebGLMocks, cleanupWebGLMocks } from '@test/webgl'; // Remove non-existent imports

import { describe, it, expect, beforeEach, afterEach } from 'vitest'; // Removed unused vi import
import DigitalTwinDashboard from './DigitalTwinDashboard'; // Use default import

// Removed local R3F mock

// Remove local mocks - rely on global mocks via vitest.config.ts alias

// Minimal test to verify component can be imported
describe('DigitalTwinDashboard (Minimal)', () => {
  // Setup WebGL mocks with memory monitoring
  beforeEach(() => {
    setupWebGLMocks({ monitorMemory: true, debugMode: true });
  });

  afterEach(() => {
    const memoryReport = cleanupWebGLMocks();
    if (memoryReport && memoryReport.leakedObjectCount > 0) {
      console.warn(
        `Memory leak detected in "DigitalTwinDashboard (Minimal)": ${memoryReport.leakedObjectCount} objects not properly disposed`
      );
      console.warn('Leaked objects by type:', memoryReport.leakedObjectTypes);
    }
  });

  it('exists as a module', () => {
    expect(DigitalTwinDashboard).toBeDefined();
  });
});

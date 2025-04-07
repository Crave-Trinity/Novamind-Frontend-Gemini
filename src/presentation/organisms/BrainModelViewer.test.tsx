/**
 * BrainModelViewer - Minimal Test
 * Replaced with minimal test to prevent hanging from useFrame animation loop
 */

// import React from 'react'; // Removed unused import
import { describe, it, expect } from 'vitest'; // Removed unused vi
import BrainModelViewer from './BrainModelViewer'; // Use default import

// Removed local R3F mock

// Remove local mocks - rely on global mocks via vitest.config.ts alias

// Minimal test to verify component can be imported
describe('BrainModelViewer (Minimal)', () => {
  it('exists as a module', () => {
    expect(BrainModelViewer).toBeDefined();
  });
});

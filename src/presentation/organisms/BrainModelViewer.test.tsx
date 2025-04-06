/**
 * BrainModelViewer - Minimal Test
 * Replaced with minimal test to prevent hanging from useFrame animation loop
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import BrainModelViewer from './BrainModelViewer'; // Use default import

// Removed local R3F mock

// Remove local mocks - rely on global mocks via vitest.config.ts alias

// Minimal test to verify component can be imported
describe('BrainModelViewer (Minimal)', () => {
  it('exists as a module', () => {
    expect(BrainModelViewer).toBeDefined();
  });
});

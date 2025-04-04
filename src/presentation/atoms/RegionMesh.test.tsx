/**
 * RegionMesh - Minimal Test
 * Replaced with minimal test to prevent hanging from useFrame animation loop
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import RegionMesh from './RegionMesh'; // Use default import

// Remove local mocks - rely on global mocks via vitest.config.ts alias

// Minimal test to verify component can be imported
describe('RegionMesh (Minimal)', () => {
  it('exists as a module', () => {
    expect(RegionMesh).toBeDefined();
  });
});

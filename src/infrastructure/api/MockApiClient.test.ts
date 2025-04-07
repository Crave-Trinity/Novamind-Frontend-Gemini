/**
 * NOVAMIND Neural Test Suite
 * mockApiClient testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockApiClient } from '@api/MockApiClient';
// Removed unused import: import { ModelSource } from '@domain/models/brain/BrainModel';

// Remove setTimeout mock as the delay is removed from the source

describe('mockApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates brain models with mathematical precision', async () => {
    // Act with clinical precision
    const result = await mockApiClient.getBrainModel('test-patient-id');

    // Assert with quantum verification
    expect(result).toBeDefined();
    expect(result.id).toContain('model-test-patient-id');
    expect(result.patientId).toBe('test-patient-id');
    expect(Array.isArray(result.regions)).toBe(true);
    expect(Array.isArray(result.connections)).toBe(true); // Use correct property name
    // Removed assertion for metadata.source as metadata was removed from BrainModel
  });

  it('handles default patient ID with clinical precision', async () => {
    // Test neural-safe default handling
    const result = await mockApiClient.getBrainModel();

    // Assert with clinical verification
    expect(result).toBeDefined();
    expect(result.id).toContain('model-demo-patient');
    expect(result.patientId).toBe('demo-patient');
    expect(result.regions.length).toBeGreaterThan(0);
    // Removed assertion for metadata.confidenceScore as metadata was removed
  });

  it('returns consistent model structure with quantum-level type safety', async () => {
    // Validate neural-safe model structure
    const result = await mockApiClient.getBrainModel();

    // Assert clinical-grade model structure
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('patientId');
    expect(result).toHaveProperty('regions');
    expect(result).toHaveProperty('pathways');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('metadata');

    // Validate metadata with quantum precision
    // Removed assertions for metadata properties as metadata was removed
  });
});

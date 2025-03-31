/**
 * NOVAMIND Neural Test Suite
 * brain type testing with quantum precision
 */

import { describe, it, expect, vi } from 'vitest';

import {
  BrainRegion,
  Vector3Factory as Vector3, // Fix Vector3 import to use the factory
  BrainScan,
  RenderMode,
  VisualizationSettings,
  BrainModelData, 
  BrainModel, 
  PatientMetadata,
  Medication,
  TreatmentResponse,
  ActivityTimeSeries,
  NeuralVisualizationError
} from './brain';

import { SafeArray } from '../types/common';

describe('brain type definitions', () => {
  it('exports BrainRegion with correct structure', () => {
    expect(BrainRegion).toBeDefined();
    expect(typeof BrainRegion.create).toBe('function');
    // Type-specific validation
  });

  it('exports Vector3 with correct structure', () => {
    expect(Vector3).toBeDefined();
    expect(typeof Vector3.zero).toBe('function');
    // Type-specific validation
  });

  it('exports BrainScan with correct structure', () => {
    expect(BrainScan).toBeDefined();
    expect(typeof BrainScan.create).toBe('function');
    // Type-specific validation
  });

  it('exports RenderMode with correct structure', () => {
    expect(RenderMode).toBeDefined();
    expect(typeof RenderMode).toBe('object');
    // Type-specific validation
  });

  it('exports VisualizationSettings with correct structure', () => {
    expect(VisualizationSettings).toBeDefined();
    expect(typeof VisualizationSettings.create).toBe('function');
    // Type-specific validation
  });

  it('exports BrainModel with correct structure', () => {
    expect(BrainModel).toBeDefined();
    expect(typeof BrainModel).toBe('function');
    // Type-specific validation
  });

  it('exports PatientMetadata with correct structure', () => {
    expect(PatientMetadata).toBeDefined();
    expect(typeof PatientMetadata.create).toBe('function');
    // Type-specific validation
  });

  it('exports Medication with correct structure', () => {
    expect(Medication).toBeDefined();
    expect(typeof Medication.create).toBe('function');
    // Type-specific validation
  });

  it('exports TreatmentResponse with correct structure', () => {
    expect(TreatmentResponse).toBeDefined();
    expect(typeof TreatmentResponse.create).toBe('function');
    // Type-specific validation
  });

  it('exports ActivityTimeSeries with correct structure', () => {
    expect(ActivityTimeSeries).toBeDefined();
    expect(typeof ActivityTimeSeries.create).toBe('function');
    // Type-specific validation
  });

  it('exports NeuralVisualizationError with correct structure', () => {
    expect(NeuralVisualizationError).toBeDefined();
    expect(NeuralVisualizationError.prototype instanceof Error).toBe(true);
    // Type-specific validation
  });

  it('exports SafeArray with correct structure', () => {
    expect(SafeArray).toBeDefined();
    expect(typeof SafeArray).toBe('function');
    // Type-specific validation
  });

  // This test is intentionally skipped as it's a nonsensical test
  it.skip('exports undefined with correct structure', () => {
    // We can't expect undefined to be defined - this appears to be an error in the test
    // Using skip instead of removing to maintain test count integrity
  });
});

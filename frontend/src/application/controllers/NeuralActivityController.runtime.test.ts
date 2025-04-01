/**
 * @fileoverview Tests for runtime validation functions in NeuralActivityController.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
import {
  validateNeuralTransform,
  validateComputationalIntensity,
  // Import placeholder validators if needed for completeness, though likely unused
  // validateNeuralActivity,
  // validateActivityFilters,
  // Import local types/enums if needed for mock data clarity
  // NeuralTransform, ComputationalIntensity, NeuralTransitionType, NeuralFrequencyBand
} from './NeuralActivityController.runtime';

// --- Mock Data ---

const mockValidNeuralTransform = {
  regionId: 'region-1',
  activationChange: 0.5,
  transitionType: 'gradual', // Must be a valid NeuralTransitionType
  sourceTrigger: 'symptom', // Must be a valid sourceTrigger
  frequencyBand: 'alpha', // Optional, assuming 'alpha' is a valid (placeholder) NeuralFrequencyBand
};

const mockInvalidNeuralTransform_MissingField = {
  // regionId: 'region-2', // Missing
  activationChange: -0.2,
  transitionType: 'abrupt',
  sourceTrigger: 'medication',
};

const mockInvalidNeuralTransform_WrongType = {
  regionId: 'region-3',
  activationChange: 'high', // Should be number
  transitionType: 'gradual',
  sourceTrigger: 'stimulation',
};

const mockInvalidNeuralTransform_OutOfRange = {
  regionId: 'region-4',
  activationChange: 1.5, // Should be between -1.0 and 1.0
  transitionType: 'oscillating',
  sourceTrigger: 'baseline',
};

const mockValidNeuralTransformArray = [
    mockValidNeuralTransform,
    { ...mockValidNeuralTransform, regionId: 'region-5', activationChange: -0.8, sourceTrigger: 'medication' }
];

const mockInvalidNeuralTransformArray = [
    mockValidNeuralTransform,
    mockInvalidNeuralTransform_WrongType // Contains an invalid transform
];


describe('NeuralActivityController Runtime Validation', () => {

  // Tests for validateNeuralTransform
  describe('validateNeuralTransform', () => {
    it('should return Ok for a valid NeuralTransform object', () => {
      const result = validateNeuralTransform(mockValidNeuralTransform);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidNeuralTransform);
    });

     it('should return Ok for a valid array of NeuralTransform objects', () => {
      const result = validateNeuralTransform(mockValidNeuralTransformArray);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidNeuralTransformArray);
    });

    it('should return Err for non-object/non-array input', () => {
      const result = validateNeuralTransform('transform_string');
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Input must be a valid NeuralTransform object or an array');
    });

     it('should return Err for an object missing required fields', () => {
      const result = validateNeuralTransform(mockInvalidNeuralTransform_MissingField);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Input must be a valid NeuralTransform object'); // Guard fails
    });

     it('should return Err for an object with incorrect field types', () => {
      const result = validateNeuralTransform(mockInvalidNeuralTransform_WrongType);
       expect(result.err).toBe(true);
       expect((result.val as Error).message).toContain('Input must be a valid NeuralTransform object'); // Guard fails
    });

     it('should return Err for an object with out-of-range activationChange', () => {
      const result = validateNeuralTransform(mockInvalidNeuralTransform_OutOfRange);
       expect(result.err).toBe(true);
       expect((result.val as Error).message).toContain('Input must be a valid NeuralTransform object'); // Guard fails range check
    });

     it('should return Err for an array containing invalid NeuralTransform objects', () => {
      const result = validateNeuralTransform(mockInvalidNeuralTransformArray);
       expect(result.err).toBe(true);
       expect((result.val as Error).message).toContain('One or more elements have incorrect structure or values.');
    });
  });

  // Tests for validateComputationalIntensity
  describe('validateComputationalIntensity', () => {
     it('should return Ok for valid ComputationalIntensity values', () => {
      expect(validateComputationalIntensity('low').ok).toBe(true);
      expect(validateComputationalIntensity('medium').ok).toBe(true);
      expect(validateComputationalIntensity('high').ok).toBe(true);
      expect(validateComputationalIntensity('clinical').ok).toBe(true);
    });

    it('should return Err for invalid string values', () => {
      const result = validateComputationalIntensity('very_high');
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Must be one of "low", "medium", "high", "clinical".');
    });

    it('should return Err for non-string input', () => {
      const result = validateComputationalIntensity(123);
      expect(result.err).toBe(true);
       expect((result.val as Error).message).toContain('Must be one of "low", "medium", "high", "clinical".');
    });
  });

  // Placeholder tests for other validators if they were implemented
  // describe('validateNeuralActivity', () => { ... });
  // describe('validateActivityFilters', () => { ... });

});

/**
 * @fileoverview Tests for runtime validation functions in progressiveLoader.runtime.ts.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  validateBrainModelData,
  validateBrainRegionArray,
  validateNeuralConnectionArray,
  validateProgressCallback,
} from '@domain/utils/progressiveLoader.runtime'; // Corrected path alias
// Removed unused import: import { BrainModel, BrainRegion } from '@domain/types/brain/models';
import { generateMockBrainData } from '@domain/utils/brainDataTransformer'; // Corrected path alias

// --- Mock Data ---

const mockValidBrainModel = generateMockBrainData();
const mockValidRegions = mockValidBrainModel.regions;
const mockValidConnections = mockValidBrainModel.connections;

const mockInvalidRegions = [
  ...mockValidRegions,
  { id: 'invalid', name: 'Invalid Region' }, // Missing required fields
];
const mockInvalidConnections = [
  ...mockValidConnections,
  { id: 'c-invalid', sourceId: 'r1' }, // Missing required fields
];

const mockProgressCallback = vi.fn((percent: number) => {
  console.log(`Progress: ${percent}%`);
});
const mockInvalidCallback = 'not a function';

describe('progressiveLoader Runtime Validation', () => {
  // Tests for validateBrainModelData (re-using domain guard)
  describe('validateBrainModelData', () => {
    it('should return Ok for valid BrainModel data', () => {
      const result = validateBrainModelData(mockValidBrainModel);
      expect(result.ok).toBe(true);
    });
    it('should return Err for invalid data', () => {
      const result = validateBrainModelData({ regions: [] }); // Missing connections, etc.
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid BrainModel data structure');
    });
  });

  // Tests for validateBrainRegionArray
  describe('validateBrainRegionArray', () => {
    it('should return Ok for valid BrainRegion array', () => {
      const result = validateBrainRegionArray(mockValidRegions);
      expect(result.ok).toBe(true);
    });
    it('should return Ok for empty array', () => {
      const result = validateBrainRegionArray([]);
      expect(result.ok).toBe(true);
    });
    it('should return Err for array with invalid BrainRegion objects', () => {
      const result = validateBrainRegionArray(mockInvalidRegions);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Expected an array of BrainRegion objects');
    });
    it('should return Err for non-array input', () => {
      const result = validateBrainRegionArray(null);
      expect(result.err).toBe(true);
    });
  });

  // Tests for validateNeuralConnectionArray
  describe('validateNeuralConnectionArray', () => {
    it('should return Ok for valid NeuralConnection array', () => {
      const result = validateNeuralConnectionArray(mockValidConnections);
      expect(result.ok).toBe(true);
    });
    it('should return Ok for empty array', () => {
      const result = validateNeuralConnectionArray([]);
      expect(result.ok).toBe(true);
    });
    it('should return Err for array with invalid NeuralConnection objects', () => {
      const result = validateNeuralConnectionArray(mockInvalidConnections);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'Expected an array of NeuralConnection objects'
      );
    });
    it('should return Err for non-array input', () => {
      const result = validateNeuralConnectionArray('connections');
      expect(result.err).toBe(true);
    });
  });

  // Tests for validateProgressCallback
  describe('validateProgressCallback', () => {
    it('should return Ok for a valid function', () => {
      const result = validateProgressCallback(mockProgressCallback);
      expect(result.ok).toBe(true);
      expect(result.val).toBe(mockProgressCallback);
    });
    it('should return Ok for undefined', () => {
      const result = validateProgressCallback(undefined);
      expect(result.ok).toBe(true);
      expect(result.val).toBeUndefined();
    });
    it('should return Err for non-function/non-undefined input', () => {
      const result = validateProgressCallback(mockInvalidCallback);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Expected a function or undefined');
    });
    it('should return Err for null', () => {
      const result = validateProgressCallback(null);
      expect(result.err).toBe(true);
    });
  });
});

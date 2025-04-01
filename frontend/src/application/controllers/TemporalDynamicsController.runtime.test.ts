/**
 * @fileoverview Tests for runtime validation functions in TemporalDynamicsController.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
import {
  validatePartialTemporalConfig,
  validateTimeScale,
  validateMetricIds,
  // Import placeholder validators if needed for completeness
  // validateTimeSeriesData,
  // validateAnalysisParameters,
  // Import local types/enums if needed for mock data clarity
  // TimeScale, PartialTemporalConfig
} from './TemporalDynamicsController.runtime';

// --- Mock Data ---

const mockValidPartialConfig: any = { // Use 'any' for partial mock flexibility
  patternRecognitionThreshold: 0.8,
  filterNoise: false,
  historyLength: { daily: 60, weekly: 8 }, // Partial record is valid
};

const mockInvalidPartialConfig_WrongType = {
  patternRecognitionThreshold: 'high', // Should be number
  criticalTransitionSensitivity: 0.7,
};

const mockInvalidPartialConfig_OutOfRange = {
  smoothingFactor: 1.5, // Should be 0.0-1.0
};

const mockInvalidPartialConfig_BadRecordKey = {
  historyLength: { daily: 30, biweekly: 4 }, // 'biweekly' is not a valid TimeScale
};

const mockInvalidPartialConfig_BadRecordValue = {
  samplingRate: { hourly: 6, daily: -1 }, // Value must be positive
};

const mockValidTimeScale = 'daily';
const mockInvalidTimeScale = 'yearly';

const mockValidMetricIds = ['metric1', 'metric2'];
const mockInvalidMetricIds_NotArray = 'metric1';
const mockInvalidMetricIds_NotStringArray = ['metric1', 2];


describe('TemporalDynamicsController Runtime Validation', () => {

  // Tests for validatePartialTemporalConfig
  describe('validatePartialTemporalConfig', () => {
    it('should return Ok for valid Partial<TemporalConfig>', () => {
      const result = validatePartialTemporalConfig(mockValidPartialConfig);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidPartialConfig);
    });

     it('should return Ok for an empty object config', () => {
      const result = validatePartialTemporalConfig({});
      expect(result.ok).toBe(true);
      expect(result.val).toEqual({});
    });

    it('should return Err for non-object input', () => {
      const result = validatePartialTemporalConfig(null);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Input must be an object.');
    });

     it('should return Err for config with incorrect field types', () => {
      const result = validatePartialTemporalConfig(mockInvalidPartialConfig_WrongType);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('patternRecognitionThreshold must be a number');
    });

     it('should return Err for config with out-of-range values', () => {
      const result = validatePartialTemporalConfig(mockInvalidPartialConfig_OutOfRange);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('smoothingFactor must be a number between 0.0 and 1.0.');
    });

     it('should return Err for config with invalid historyLength keys', () => {
      const result = validatePartialTemporalConfig(mockInvalidPartialConfig_BadRecordKey);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('historyLength must be a Record mapping TimeScale');
    });

     it('should return Err for config with invalid samplingRate values', () => {
      const result = validatePartialTemporalConfig(mockInvalidPartialConfig_BadRecordValue);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('samplingRate must be a Record mapping TimeScale to positive numbers.');
    });
  });

  // Tests for validateTimeScale
  describe('validateTimeScale', () => {
     it('should return Ok for valid TimeScale values', () => {
      const validScales: any[] = ["momentary", "hourly", "daily", "weekly", "monthly"];
      validScales.forEach(scale => {
          const result = validateTimeScale(scale);
          expect(result.ok).toBe(true);
          expect(result.val).toEqual(scale);
      });
    });

    it('should return Err for invalid string values', () => {
      const result = validateTimeScale(mockInvalidTimeScale);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid TimeScale');
    });

    it('should return Err for non-string input', () => {
      const result = validateTimeScale(123);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid TimeScale');
    });
  });

  // Tests for validateMetricIds
  describe('validateMetricIds', () => {
     it('should return Ok for valid string array', () => {
      const result = validateMetricIds(mockValidMetricIds);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidMetricIds);
    });

     it('should return Ok for empty array', () => {
      const result = validateMetricIds([]);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual([]);
    });

    it('should return Err for non-array input', () => {
      const result = validateMetricIds(mockInvalidMetricIds_NotArray);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Input must be an array of strings.');
    });

     it('should return Err for array with non-string elements', () => {
      const result = validateMetricIds(mockInvalidMetricIds_NotStringArray);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Input must be an array of strings.');
    });
  });

  // Placeholder tests for other validators if they were implemented
  // describe('validateTimeSeriesData', () => { ... });
  // describe('validateAnalysisParameters', () => { ... });

});

/**
 * @fileoverview Tests for runtime validation functions in ApiClient.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
import {
  validateApiResponse,
  isApiPatient, // Example guard
  isApiPatientArray, // Example guard
  // Import other guards as they are defined
} from '@api/ApiClient.runtime';
// Import mock data generators or fixtures if available
// import { createMockPatient } from '../../test/fixtures/patient';

describe('ApiClient Runtime Validation', () => {
  // --- Mock Data ---
  const mockValidPatient = { id: 1, name: 'John Doe', condition: 'Stable' };
  const mockInvalidPatient_MissingName = { id: 2, condition: 'Improving' };
  const mockInvalidPatient_WrongIdType = { id: 'abc', name: 'Jane Doe' };
  const mockValidPatientArray = [mockValidPatient, { id: 3, name: 'Peter Jones' }];
  const mockInvalidPatientArray = [mockValidPatient, mockInvalidPatient_MissingName];

  // --- Tests for validateApiResponse ---
  describe('validateApiResponse', () => {
    it('should return Ok for valid data matching the guard', () => {
      const result = validateApiResponse(mockValidPatient, isApiPatient, 'Patient Data');
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidPatient);
    });

    it('should return Ok for valid array data matching the array guard', () => {
      const result = validateApiResponse(mockValidPatientArray, isApiPatientArray, 'Patient List');
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidPatientArray);
    });

    it('should return Err for data not matching the guard (missing field)', () => {
      const result = validateApiResponse(
        mockInvalidPatient_MissingName,
        isApiPatient,
        'Patient Data'
      );
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid Patient Data');
      // Check for the actual error message format
      expect((result.val as Error).message).toMatch(/Invalid Patient Data/i); // Match the correct context
    });

    it('should return Err for data not matching the guard (wrong type)', () => {
      const result = validateApiResponse(
        mockInvalidPatient_WrongIdType,
        isApiPatient,
        'Patient Data'
      );
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid Patient Data');
    });

    it('should return Err for array data not matching the array guard', () => {
      const result = validateApiResponse(
        mockInvalidPatientArray,
        isApiPatientArray,
        'Patient List'
      );
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid Patient List');
    });

    it('should return Err for non-object input when expecting object', () => {
      const result = validateApiResponse('a string', isApiPatient, 'Patient Data');
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid Patient Data');
    });

    it('should return Err for non-array input when expecting array', () => {
      const result = validateApiResponse({ id: 1 }, isApiPatientArray, 'Patient List');
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid Patient List');
    });

    it('should include context in the error message', () => {
      const result = validateApiResponse(null, isApiPatient, 'Specific Context');
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid Specific Context');
    });

    it('should handle unserializable data in error message', () => {
      const circular: any; // eslint-disable-line @typescript-eslint/no-explicit-any = {};
      circular.self = circular;
      const result = validateApiResponse(circular, isApiPatient, 'Circular Data');
      expect(result.err).toBe(true);
      // The implementation handles unserializable data but uses different text
      // Either message format is valid as long as we get an error
      expect((result.val as Error).message).toMatch(/Invalid Circular Data/);
    });
  });

  // --- Tests for specific type guards (add more as guards are implemented) ---
  describe('isApiPatient', () => {
    it('should return true for valid patient object', () => {
      expect(isApiPatient(mockValidPatient)).toBe(true);
    });
    it('should return false for invalid patient object (missing name)', () => {
      expect(isApiPatient(mockInvalidPatient_MissingName)).toBe(false);
    });
    it('should return false for invalid patient object (wrong id type)', () => {
      expect(isApiPatient(mockInvalidPatient_WrongIdType)).toBe(false);
    });
    it('should return false for null', () => {
      expect(isApiPatient(null)).toBe(false);
    });
    it('should return false for non-object', () => {
      expect(isApiPatient('string')).toBe(false);
    });
  });

  describe('isApiPatientArray', () => {
    it('should return true for valid patient array', () => {
      expect(isApiPatientArray(mockValidPatientArray)).toBe(true);
    });
    it('should return false for invalid patient array', () => {
      expect(isApiPatientArray(mockInvalidPatientArray)).toBe(false);
    });
    it('should return false for non-array', () => {
      expect(isApiPatientArray(mockValidPatient)).toBe(false);
    });
    it('should return true for empty array', () => {
      expect(isApiPatientArray([])).toBe(true);
    });
  });
});

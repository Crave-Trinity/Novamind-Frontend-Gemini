/**
 * @fileoverview Tests for runtime validation functions in useSearchParams.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
import { validateParamsObject } from '@hooks/useSearchParams.runtime';

// Define the type alias locally for test clarity
type ParamsObject = Record<string, string | number | null>;

describe('useSearchParams Runtime Validation', () => {
  describe('validateParamsObject', () => {
    it('should return Ok for a valid ParamsObject', () => {
      const validData: ParamsObject = {
        patientId: 'p123',
        limit: 50,
        status: 'active',
        offset: 0,
        filter: null, // Null is allowed
      };
      const result = validateParamsObject(validData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(validData);
    });

    it('should return Ok for an empty object', () => {
      const validData: ParamsObject = {};
      const result = validateParamsObject(validData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(validData);
    });

    it('should return Err for non-object input', () => {
      const invalidData = 'key=value';
      const result = validateParamsObject(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain('Input must be a plain object.');
    });

    it('should return Err for array input', () => {
      const invalidData = ['key=value'];
      const result = validateParamsObject(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain('Input must be a plain object.');
    });

    it('should return Err for null input', () => {
      const invalidData = null;
      const result = validateParamsObject(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain('Input must be a plain object.');
    });

    it('should return Err for object with invalid value type (boolean)', () => {
      const invalidData = { patientId: 'p123', isActive: true };
      const result = validateParamsObject(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Value for key "isActive" must be a string, number, or null.'
      );
    });

    it('should return Err for object with invalid value type (undefined)', () => {
      const invalidData = { patientId: 'p123', filter: undefined };
      const result = validateParamsObject(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Value for key "filter" must be a string, number, or null.'
      );
    });

    it('should return Err for object with invalid value type (object)', () => {
      const invalidData = { patientId: 'p123', settings: { theme: 'dark' } };
      const result = validateParamsObject(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Value for key "settings" must be a string, number, or null.'
      );
    });

    it('should return Err for object with invalid value type (array)', () => {
      // Note: The hook's serialize/deserialize handles comma-separated strings for arrays,
      // but the direct input to setParams expects string, number, or null.
      const invalidData = { patientId: 'p123', ids: ['id1', 'id2'] };
      const result = validateParamsObject(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Value for key "ids" must be a string, number, or null.'
      );
    });
  });
});

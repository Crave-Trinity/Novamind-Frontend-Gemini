/**
 * NOVAMIND Neural-Safe Type Verification
 * Common type verification utilities tests with quantum-level precision
 */

import { describe, it, expect } from 'vitest';
import { typeVerifier, TypeVerificationError } from '@domain/utils/shared/type-verification';

describe('Shared type verification', () => {
  describe('TypeVerificationError', () => {
    it('formats error message correctly', () => {
      const error = new TypeVerificationError('Invalid type', 'string', 'number', 'user.name');

      expect(error.name).toBe('TypeVerificationError');
      expect(error.message).toContain('Invalid type');
      expect(error.expectedType).toBe('string');
      expect(error.receivedType).toBe('number');
      expect(error.field).toBe('user.name');
    });
  });

  describe('safelyParseNumber', () => {
    it('returns number for numeric values', () => {
      expect(typeVerifier.safelyParseNumber(42)).toBe(42);
      expect(typeVerifier.safelyParseNumber(-3.14)).toBe(-3.14);
    });

    it('parses numeric strings', () => {
      expect(typeVerifier.safelyParseNumber('42')).toBe(42);
      expect(typeVerifier.safelyParseNumber('-3.14')).toBe(-3.14);
    });

    it('converts boolean values', () => {
      expect(typeVerifier.safelyParseNumber(true)).toBe(1);
      expect(typeVerifier.safelyParseNumber(false)).toBe(0);
    });

    it('returns fallback for non-numeric values', () => {
      expect(typeVerifier.safelyParseNumber('hello')).toBe(0);
      expect(typeVerifier.safelyParseNumber(null)).toBe(0);
      expect(typeVerifier.safelyParseNumber(undefined)).toBe(0);
      expect(typeVerifier.safelyParseNumber({})).toBe(0);
      expect(typeVerifier.safelyParseNumber('hello', 99)).toBe(99);
    });
  });

  describe('safelyParseBoolean', () => {
    it('returns boolean for boolean values', () => {
      expect(typeVerifier.safelyParseBoolean(true)).toBe(true);
      expect(typeVerifier.safelyParseBoolean(false)).toBe(false);
    });

    it('parses string representations', () => {
      expect(typeVerifier.safelyParseBoolean('true')).toBe(true);
      expect(typeVerifier.safelyParseBoolean('false')).toBe(false);
      expect(typeVerifier.safelyParseBoolean('yes')).toBe(true);
      expect(typeVerifier.safelyParseBoolean('no')).toBe(false);
      expect(typeVerifier.safelyParseBoolean('1')).toBe(true);
      expect(typeVerifier.safelyParseBoolean('0')).toBe(false);
    });

    it('parses numeric values', () => {
      expect(typeVerifier.safelyParseBoolean(1)).toBe(true);
      expect(typeVerifier.safelyParseBoolean(0)).toBe(false);
    });

    it('returns fallback for non-boolean values', () => {
      expect(typeVerifier.safelyParseBoolean('hello')).toBe(false);
      expect(typeVerifier.safelyParseBoolean(42)).toBe(false);
      expect(typeVerifier.safelyParseBoolean(null)).toBe(false);
      expect(typeVerifier.safelyParseBoolean(undefined)).toBe(false);
      expect(typeVerifier.safelyParseBoolean('hello', true)).toBe(true);
    });
  });

  describe('safelyParseString', () => {
    it('returns string for string values', () => {
      expect(typeVerifier.safelyParseString('hello')).toBe('hello');
      expect(typeVerifier.safelyParseString('')).toBe('');
    });

    it('converts non-string values to strings', () => {
      expect(typeVerifier.safelyParseString(42)).toBe('42');
      expect(typeVerifier.safelyParseString(true)).toBe('true');
      expect(typeVerifier.safelyParseString(false)).toBe('false');
    });

    it('returns fallback for null/undefined', () => {
      expect(typeVerifier.safelyParseString(null)).toBe('');
      expect(typeVerifier.safelyParseString(undefined)).toBe('');
      expect(typeVerifier.safelyParseString(null, 'N/A')).toBe('N/A');
    });
  });

  describe('verifyString', () => {
    it('verifies valid strings', () => {
      const result = typeVerifier.verifyString('hello');
      expect(result.success).toBe(true);
      expect(result.value).toBe('hello');
    });

    it('fails on non-string values', () => {
      expect(typeVerifier.verifyString(42).success).toBe(false);
      expect(typeVerifier.verifyString(true).success).toBe(false);
      expect(typeVerifier.verifyString(null).success).toBe(false);
      expect(typeVerifier.verifyString(undefined).success).toBe(false);
      expect(typeVerifier.verifyString({}).success).toBe(false);
    });

    it('includes field name in error when provided', () => {
      const result = typeVerifier.verifyString(42, 'user.name');
      expect(result.success).toBe(false);
      expect(result.error?.field).toBe('user.name');
    });
  });

  describe('verifyNumber', () => {
    it('verifies valid numbers', () => {
      const result = typeVerifier.verifyNumber(42);
      expect(result.success).toBe(true);
      expect(result.value).toBe(42);
    });

    it('fails on non-number values', () => {
      expect(typeVerifier.verifyNumber('42').success).toBe(false);
      expect(typeVerifier.verifyNumber(true).success).toBe(false);
      expect(typeVerifier.verifyNumber(null).success).toBe(false);
      expect(typeVerifier.verifyNumber(undefined).success).toBe(false);
      expect(typeVerifier.verifyNumber({}).success).toBe(false);
    });

    it('fails on NaN', () => {
      expect(typeVerifier.verifyNumber(NaN).success).toBe(false);
    });
  });

  describe('verifyBoolean', () => {
    it('verifies valid booleans', () => {
      const trueResult = typeVerifier.verifyBoolean(true);
      expect(trueResult.success).toBe(true);
      expect(trueResult.value).toBe(true);

      const falseResult = typeVerifier.verifyBoolean(false);
      expect(falseResult.success).toBe(true);
      expect(falseResult.value).toBe(false);
    });

    it('fails on non-boolean values', () => {
      expect(typeVerifier.verifyBoolean('true').success).toBe(false);
      expect(typeVerifier.verifyBoolean(1).success).toBe(false);
      expect(typeVerifier.verifyBoolean(null).success).toBe(false);
      expect(typeVerifier.verifyBoolean(undefined).success).toBe(false);
      expect(typeVerifier.verifyBoolean({}).success).toBe(false);
    });
  });

  describe('verifyArray', () => {
    it('verifies valid arrays', () => {
      const result = typeVerifier.verifyArray([1, 2, 3]);
      expect(result.success).toBe(true);
      expect(result.value).toEqual([1, 2, 3]);
    });

    it('fails on non-array values', () => {
      expect(typeVerifier.verifyArray('not an array').success).toBe(false);
      expect(typeVerifier.verifyArray(42).success).toBe(false);
      expect(typeVerifier.verifyArray(null).success).toBe(false);
      expect(typeVerifier.verifyArray(undefined).success).toBe(false);
      expect(typeVerifier.verifyArray({}).success).toBe(false);
    });

    it('verifies array items with provided verifier', () => {
      const result = typeVerifier.verifyArray([1, 2, 3], (item) => typeVerifier.verifyNumber(item));
      expect(result.success).toBe(true);
      expect(result.value).toEqual([1, 2, 3]);
    });

    it('fails when any array item fails verification', () => {
      const result = typeVerifier.verifyArray([1, 'not a number', 3], (item) =>
        typeVerifier.verifyNumber(item)
      );
      expect(result.success).toBe(false);
    });
  });

  describe('verifyObject', () => {
    it('verifies valid objects', () => {
      const result = typeVerifier.verifyObject({ name: 'test' });
      expect(result.success).toBe(true);
      expect(result.value).toEqual({ name: 'test' });
    });

    it('fails on non-object values', () => {
      expect(typeVerifier.verifyObject('not an object').success).toBe(false);
      expect(typeVerifier.verifyObject(42).success).toBe(false);
      expect(typeVerifier.verifyObject(null).success).toBe(false);
      expect(typeVerifier.verifyObject(undefined).success).toBe(false);
      expect(typeVerifier.verifyObject([]).success).toBe(false);
    });
  });

  describe('assertion functions', () => {
    it('assertString passes for valid strings', () => {
      expect(() => typeVerifier.assertString('hello')).not.toThrow();
    });

    it('assertString throws for non-strings', () => {
      expect(() => typeVerifier.assertString(42)).toThrow(TypeVerificationError);
    });

    it('assertNumber passes for valid numbers', () => {
      expect(() => typeVerifier.assertNumber(42)).not.toThrow();
    });

    it('assertNumber throws for non-numbers', () => {
      expect(() => typeVerifier.assertNumber('42')).toThrow(TypeVerificationError);
    });

    it('assertBoolean passes for valid booleans', () => {
      expect(() => typeVerifier.assertBoolean(true)).not.toThrow();
    });

    it('assertBoolean throws for non-booleans', () => {
      expect(() => typeVerifier.assertBoolean('true')).toThrow(TypeVerificationError);
    });

    it('assertArray passes for valid arrays', () => {
      expect(() => typeVerifier.assertArray([1, 2, 3])).not.toThrow();
    });

    it('assertArray throws for non-arrays', () => {
      expect(() => typeVerifier.assertArray('not an array')).toThrow(TypeVerificationError);
    });

    it('assertObject passes for valid objects', () => {
      expect(() => typeVerifier.assertObject({ name: 'test' })).not.toThrow();
    });

    it('assertObject throws for non-objects', () => {
      expect(() => typeVerifier.assertObject(null)).toThrow(TypeVerificationError);
    });
  });
});

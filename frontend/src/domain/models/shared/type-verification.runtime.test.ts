/**
 * NOVAMIND Neural-Safe Type Verification
 * Runtime validation tests with quantum-level precision
 */

import { describe, it, expect } from 'vitest';
import {
  TypeVerificationError,
  assertDefined,
  assertPresent,
  assertString,
  assertNumber,
  assertBoolean,
  assertArray,
  assertObject,
  assertDate,
  assertType,
  asString,
  asNumber,
  asBoolean,
  asDate
} from './type-verification';

import {
  validateDefined,
  validatePresent,
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateArrayOf,
  validateObject,
  validateDate,
  validateType,
  validateProperty,
  validateOneOf,
  createObjectValidator
} from './type-verification.runtime';

describe('TypeVerificationError', () => {
  it('formats error message with property path', () => {
    const error = new TypeVerificationError('string', 42, 'user.name');
    expect(error.message).toContain('string');
    expect(error.message).toContain('user.name');
    expect(error.message).toContain('number');
  });

  it('formats error message without property path', () => {
    const error = new TypeVerificationError('number', 'test');
    expect(error.message).toContain('number');
    expect(error.message).toContain('string');
    expect(error.message).not.toContain(' at ');
  });

  it('handles different value types correctly', () => {
    expect(new TypeVerificationError('object', null).message).toContain('null');
    expect(new TypeVerificationError('string', []).message).toContain('array');
    expect(new TypeVerificationError('number', undefined).message).toContain('undefined');
  });
});

describe('Assertion functions', () => {
  describe('assertDefined', () => {
    it('passes for defined values', () => {
      expect(() => assertDefined('hello')).not.toThrow();
      expect(() => assertDefined(0)).not.toThrow();
      expect(() => assertDefined(false)).not.toThrow();
      expect(() => assertDefined(null)).not.toThrow();
    });

    it('throws for undefined values', () => {
      expect(() => assertDefined(undefined)).toThrow(TypeVerificationError);
    });
  });

  describe('assertPresent', () => {
    it('passes for present values', () => {
      expect(() => assertPresent('hello')).not.toThrow();
      expect(() => assertPresent(0)).not.toThrow();
      expect(() => assertPresent(false)).not.toThrow();
    });

    it('throws for null or undefined values', () => {
      expect(() => assertPresent(null)).toThrow(TypeVerificationError);
      expect(() => assertPresent(undefined)).toThrow(TypeVerificationError);
    });
  });

  describe('assertString', () => {
    it('passes for strings', () => {
      expect(() => assertString('')).not.toThrow();
      expect(() => assertString('hello')).not.toThrow();
    });

    it('throws for non-strings', () => {
      expect(() => assertString(42)).toThrow(TypeVerificationError);
      expect(() => assertString(true)).toThrow(TypeVerificationError);
      expect(() => assertString(null)).toThrow(TypeVerificationError);
      expect(() => assertString(undefined)).toThrow(TypeVerificationError);
      expect(() => assertString({})).toThrow(TypeVerificationError);
      expect(() => assertString([])).toThrow(TypeVerificationError);
    });
  });

  describe('assertNumber', () => {
    it('passes for numbers', () => {
      expect(() => assertNumber(0)).not.toThrow();
      expect(() => assertNumber(42)).not.toThrow();
      expect(() => assertNumber(-1.5)).not.toThrow();
    });

    it('throws for non-numbers', () => {
      expect(() => assertNumber('42')).toThrow(TypeVerificationError);
      expect(() => assertNumber(true)).toThrow(TypeVerificationError);
      expect(() => assertNumber(null)).toThrow(TypeVerificationError);
      expect(() => assertNumber(undefined)).toThrow(TypeVerificationError);
      expect(() => assertNumber({})).toThrow(TypeVerificationError);
      expect(() => assertNumber([])).toThrow(TypeVerificationError);
      expect(() => assertNumber(NaN)).toThrow(TypeVerificationError);
    });
  });

  // Additional assertion tests for other types...
});

describe('Validation functions', () => {
  describe('validateDefined', () => {
    it('returns true for defined values', () => {
      expect(validateDefined('hello')).toBe(true);
      expect(validateDefined(0)).toBe(true);
      expect(validateDefined(false)).toBe(true);
      expect(validateDefined(null)).toBe(true);
    });

    it('returns false for undefined values', () => {
      expect(validateDefined(undefined)).toBe(false);
    });
  });

  describe('validatePresent', () => {
    it('returns true for present values', () => {
      expect(validatePresent('hello')).toBe(true);
      expect(validatePresent(0)).toBe(true);
      expect(validatePresent(false)).toBe(true);
    });

    it('returns false for null or undefined values', () => {
      expect(validatePresent(null)).toBe(false);
      expect(validatePresent(undefined)).toBe(false);
    });
  });

  describe('validateString', () => {
    it('returns true for strings', () => {
      expect(validateString('')).toBe(true);
      expect(validateString('hello')).toBe(true);
    });

    it('returns false for non-strings', () => {
      expect(validateString(42)).toBe(false);
      expect(validateString(true)).toBe(false);
      expect(validateString(null)).toBe(false);
      expect(validateString(undefined)).toBe(false);
      expect(validateString({})).toBe(false);
      expect(validateString([])).toBe(false);
    });
  });

  // Additional validation tests for other types...

  describe('validateArrayOf', () => {
    it('validates arrays with valid elements', () => {
      expect(validateArrayOf([1, 2, 3], validateNumber)).toBe(true);
      expect(validateArrayOf(['a', 'b', 'c'], validateString)).toBe(true);
    });

    it('rejects arrays with invalid elements', () => {
      expect(validateArrayOf([1, '2', 3], validateNumber)).toBe(false);
      expect(validateArrayOf(['a', null, 'c'], validateString)).toBe(false);
    });

    it('rejects non-arrays', () => {
      expect(validateArrayOf('not an array', validateNumber)).toBe(false);
      expect(validateArrayOf(null, validateString)).toBe(false);
    });
  });

  describe('validateProperty', () => {
    it('validates object properties', () => {
      const obj = { name: 'Alice', age: 30 };
      expect(validateProperty(obj, 'name', validateString)).toBe(true);
      expect(validateProperty(obj, 'age', validateNumber)).toBe(true);
    });

    it('rejects invalid properties', () => {
      const obj = { name: 'Alice', age: '30' };
      expect(validateProperty(obj, 'age', validateNumber)).toBe(false);
    });

    it('rejects missing properties', () => {
      const obj = { name: 'Alice' };
      expect(validateProperty(obj, 'age', validateNumber)).toBe(false);
    });

    it('rejects non-objects', () => {
      expect(validateProperty('not an object', 'prop', validateString)).toBe(false);
      expect(validateProperty(null, 'prop', validateString)).toBe(false);
    });
  });

  describe('validateOneOf', () => {
    it('validates values from allowed set', () => {
      const validateColor = validateOneOf(['red', 'green', 'blue'] as const);
      expect(validateColor('red')).toBe(true);
      expect(validateColor('green')).toBe(true);
      expect(validateColor('blue')).toBe(true);
    });

    it('rejects values not in allowed set', () => {
      const validateColor = validateOneOf(['red', 'green', 'blue'] as const);
      expect(validateColor('yellow')).toBe(false);
      expect(validateColor('')).toBe(false);
      expect(validateColor(null)).toBe(false);
    });
  });

  describe('createObjectValidator', () => {
    it('creates a validator for an object type', () => {
      const validatePerson = createObjectValidator({
        name: validateString,
        age: validateNumber
      });

      expect(validatePerson({ name: 'Alice', age: 30 })).toBe(true);
      expect(validatePerson({ name: 'Bob', age: 25, extra: true })).toBe(true); // Extra properties allowed
      expect(validatePerson({ name: 'Charlie', age: '40' })).toBe(false);
      expect(validatePerson({ name: 'Dave' })).toBe(false);
      expect(validatePerson(null)).toBe(false);
      expect(validatePerson('not an object')).toBe(false);
    });
  });
});

describe('Type conversion functions', () => {
  describe('asString', () => {
    it('converts values to strings', () => {
      expect(asString('hello')).toBe('hello');
      expect(asString(42)).toBe('42');
      expect(asString(true)).toBe('true');
    });

    it('returns undefined for null/undefined', () => {
      expect(asString(null)).toBeUndefined();
      expect(asString(undefined)).toBeUndefined();
    });
  });

  describe('asNumber', () => {
    it('converts valid values to numbers', () => {
      expect(asNumber(42)).toBe(42);
      expect(asNumber('42')).toBe(42);
      expect(asNumber('3.14')).toBe(3.14);
    });

    it('returns undefined for invalid numbers', () => {
      expect(asNumber('hello')).toBeUndefined();
      expect(asNumber({})).toBeUndefined();
      expect(asNumber(null)).toBeUndefined();
      expect(asNumber(undefined)).toBeUndefined();
    });
  });

  describe('asBoolean', () => {
    it('converts boolean values', () => {
      expect(asBoolean(true)).toBe(true);
      expect(asBoolean(false)).toBe(false);
    });

    it('converts string and number values to booleans', () => {
      expect(asBoolean('true')).toBe(true);
      expect(asBoolean('1')).toBe(true);
      expect(asBoolean(1)).toBe(true);
      
      expect(asBoolean('false')).toBe(false);
      expect(asBoolean('0')).toBe(false);
      expect(asBoolean(0)).toBe(false);
    });

    it('returns undefined for invalid values', () => {
      expect(asBoolean('hello')).toBeUndefined();
      expect(asBoolean(42)).toBeUndefined();
      expect(asBoolean({})).toBeUndefined();
      expect(asBoolean(null)).toBeUndefined();
      expect(asBoolean(undefined)).toBeUndefined();
    });
  });

  describe('asDate', () => {
    it('converts valid values to dates', () => {
      const date = new Date('2023-01-01');
      expect(asDate(date)).toEqual(date);
      expect(asDate('2023-01-01')).toEqual(date);
      expect(asDate(date.getTime())).toEqual(date);
    });

    it('returns undefined for invalid dates', () => {
      expect(asDate('not a date')).toBeUndefined();
      expect(asDate({})).toBeUndefined();
      expect(asDate(null)).toBeUndefined();
      expect(asDate(undefined)).toBeUndefined();
    });
  });
});

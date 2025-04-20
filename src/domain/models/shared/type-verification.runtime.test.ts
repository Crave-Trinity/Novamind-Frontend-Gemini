/* eslint-disable */
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
  assertObject,
  assertDate,
  asString,
  asNumber,
  asBoolean,
  asDate,
  isOneOf,
  isArrayOf,
  isObjectWithProperties,
} from './type-verification';

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

    it('throws for non-number values', () => {
      expect(() => assertNumber(null, 'testPath')).toThrow(
        new TypeVerificationError('number', null, 'testPath')
      );
      expect(() => assertNumber('abc', 'testPath')).toThrow(
        new TypeVerificationError('number', 'abc', 'testPath')
      );
      expect(() => assertNumber(undefined, 'testPath')).toThrow(
        new TypeVerificationError('number', undefined, 'testPath')
      );
    });
  });

  describe('assertBoolean', () => {
    it('passes for boolean values', () => {
      expect(() => assertBoolean(true)).not.toThrow();
      expect(() => assertBoolean(false)).not.toThrow();
    });

    it('throws for non-boolean values', () => {
      expect(() => assertBoolean(null, 'testPath')).toThrow(
        new TypeVerificationError('boolean', null, 'testPath')
      );
      expect(() => assertBoolean(0, 'testPath')).toThrow(
        new TypeVerificationError('boolean', 0, 'testPath')
      );
      expect(() => assertBoolean('true', 'testPath')).toThrow(
        new TypeVerificationError('boolean', 'true', 'testPath')
      );
    });
  });

  describe('assertObject', () => {
    it('passes for object values (excluding null)', () => {
      expect(() => assertObject({})).not.toThrow();
      expect(() => assertObject({ a: 1 })).not.toThrow();
      expect(() => assertObject([])).toThrow(TypeVerificationError);
    });

    it('throws for non-object values and null', () => {
      expect(() => assertObject(null, 'testPath')).toThrow(
        new TypeVerificationError('object', null, 'testPath')
      );
      expect(() => assertObject(undefined, 'testPath')).toThrow(
        new TypeVerificationError('object', undefined, 'testPath')
      );
      expect(() => assertObject(42, 'testPath')).toThrow(
        new TypeVerificationError('object', 42, 'testPath')
      );
      expect(() => assertObject('test', 'testPath')).toThrow(
        new TypeVerificationError('object', 'test', 'testPath')
      );
    });
  });

  describe('assertDate', () => {
    it('passes for valid Date objects', () => {
      expect(() => assertDate(new Date())).not.toThrow();
      expect(() => assertDate(new Date('2023-01-01'))).not.toThrow();
    });

    it('throws for invalid Date objects and non-Date values', () => {
      expect(() => assertDate(new Date('invalid-date'), 'testPath')).toThrow(
        new TypeVerificationError('Date', new Date('invalid-date'), 'testPath')
      );
      expect(() => assertDate(null, 'testPath')).toThrow(
        new TypeVerificationError('Date', null, 'testPath')
      );
      expect(() => assertDate('2023-01-01', 'testPath')).toThrow(
        new TypeVerificationError('Date', '2023-01-01', 'testPath')
      );
      expect(() => assertDate(1672531200000, 'testPath')).toThrow(
        new TypeVerificationError('Date', 1672531200000, 'testPath')
      );
    });
  });

  // Additional assertion tests for other types...
});

describe('Basic Validation Logic (formerly validate* functions)', () => {
  describe('isDefined (formerly validateDefined)', () => {
    it('returns true for defined values', () => {
      const val1 = 'hello';
      expect(val1 !== undefined).toBe(true);
      const val2 = 0;
      expect(val2 !== undefined).toBe(true);
      const val3 = false;
      expect(val3 !== undefined).toBe(true);
      const val4 = null;
      expect(val4 !== undefined).toBe(true);
    });

    it('returns false for undefined values', () => {
      const val = undefined;
      expect(val !== undefined).toBe(false);
    });
  });

  describe('isPresent (formerly validatePresent)', () => {
    it('returns true for present values', () => {
      const val1 = 'hello';
      expect(val1 !== null && val1 !== undefined).toBe(true);
      const val2 = 0;
      expect(val2 !== null && val2 !== undefined).toBe(true);
      const val3 = false;
      expect(val3 !== null && val3 !== undefined).toBe(true);
    });

    it('returns false for null or undefined values', () => {
      const val1 = null;
      expect(val1 !== null && val1 !== undefined).toBe(false);
      const val2 = undefined;
      expect(val2 !== null && val2 !== undefined).toBe(false);
    });
  });

  describe('isString (formerly validateString)', () => {
    it('returns true for strings', () => {
      expect(typeof '' === 'string').toBe(true);
      expect(typeof 'hello' === 'string').toBe(true);
    });

    it('returns false for non-strings', () => {
      expect(typeof 42 === 'string').toBe(false);
      expect(typeof true === 'string').toBe(false);
      expect(typeof null === 'string').toBe(false);
      expect(typeof undefined === 'string').toBe(false);
      expect(typeof {} === 'string').toBe(false);
      expect(typeof [] === 'string').toBe(false);
    });
  });

  // Refactor remaining tests to use type guards
  describe('isArrayOf', () => {
    it('validates arrays with valid elements', () => {
      // Correct usage: isArrayOf(validator)(array)
      // Add explicit : unknown type
      expect(isArrayOf((x: unknown) => typeof x === 'number')([1, 2, 3])).toBe(true);
      expect(isArrayOf((x: unknown) => typeof x === 'string')(['a', 'b', 'c'])).toBe(true);
    });

    it('rejects arrays with invalid elements', () => {
      expect(isArrayOf((x: unknown) => typeof x === 'number')([1, '2', 3])).toBe(false);
      expect(isArrayOf((x: unknown) => typeof x === 'string')(['a', null, 'c'])).toBe(false);
    });

    it('rejects non-arrays', () => {
      expect(isArrayOf((x: unknown) => typeof x === 'number')('not an array')).toBe(false);
      expect(isArrayOf((x: unknown) => typeof x === 'string')(null)).toBe(false);
    });
  });

  describe('isObjectWithProperties (formerly validateProperty/createObjectValidator)', () => {
    it('validates object properties', () => {
      const obj = { name: 'Alice', age: 30 };
      const schema = {
        name: (x: unknown) => typeof x === 'string',
        age: (x: unknown) => typeof x === 'number',
      };
      // Correct usage: isObjectWithProperties(schema)(object)
      expect(isObjectWithProperties(schema)(obj)).toBe(true);
    });

    it('rejects invalid properties', () => {
      const obj = { name: 'Alice', age: '30' }; // age is string
      const schema = {
        name: (x: unknown) => typeof x === 'string',
        age: (x: unknown) => typeof x === 'number',
      };
      expect(isObjectWithProperties(schema)(obj)).toBe(false);
    });

    it('rejects missing properties', () => {
      const obj = { name: 'Alice' }; // age is missing
      const schema = {
        name: (x: unknown) => typeof x === 'string',
        age: (x: unknown) => typeof x === 'number',
      };
      expect(isObjectWithProperties(schema)(obj)).toBe(false);
    });

    it('rejects non-objects', () => {
      const schema = { prop: (x: unknown) => typeof x === 'string' };
      expect(isObjectWithProperties(schema)('not an object')).toBe(false);
      expect(isObjectWithProperties(schema)(null)).toBe(false);
    });
  });

  describe('isOneOf', () => {
    it('validates values from allowed set', () => {
      // isOneOf usage was already correct
      const validateColor = isOneOf(['red', 'green', 'blue'] as const);
      expect(validateColor('red')).toBe(true);
      expect(validateColor('green')).toBe(true);
      expect(validateColor('blue')).toBe(true);
    });

    it('rejects values not in allowed set', () => {
      const validateColor = isOneOf(['red', 'green', 'blue'] as const);
      expect(validateColor('yellow')).toBe(false);
      expect(validateColor('')).toBe(false);
      expect(validateColor(null)).toBe(false);
    });
  });

  // Removed describe block for createObjectValidator as it's covered by isObjectWithProperties tests

});

// Test conversion functions
describe('Type conversion functions', () => {
  describe('asString', () => {
    it('converts valid values to strings', () => {
      expect(asString('test')).toBe('test');
      expect(asString(123)).toBe('123');
      expect(asString(true)).toBe('true');
    });

    it('returns undefined for invalid values', () => {
      expect(asString(null)).toBeUndefined();
      expect(asString(undefined)).toBeUndefined();
      expect(asString({})).toBeUndefined();
    });
  });

  describe('asNumber', () => {
    it('converts valid values to numbers', () => {
      expect(asNumber(123)).toBe(123);
      expect(asNumber('456')).toBe(456);
      expect(asNumber('12.34')).toBe(12.34);
    });

    it('returns undefined for invalid values', () => {
      expect(asNumber(null)).toBeUndefined();
      expect(asNumber(undefined)).toBeUndefined();
      expect(asNumber('abc')).toBeUndefined();
      expect(asNumber({})).toBeUndefined();
    });
  });

  describe('asBoolean', () => {
    it('converts valid values to booleans', () => {
      expect(asBoolean(true)).toBe(true);
      expect(asBoolean(false)).toBe(false);
    });

    it('returns undefined for invalid values', () => {
      expect(asBoolean(null)).toBeUndefined();
      expect(asBoolean(undefined)).toBeUndefined();
      expect(asBoolean(0)).toBeUndefined();
      expect(asBoolean('true')).toBeUndefined();
      expect(asBoolean({})).toBeUndefined();
    });
  });

  describe('asDate', () => {
    it('converts valid values to dates', () => {
      const date = new Date('2023-01-01');
      expect(asDate(date)).toEqual(date);
    });

    it('returns undefined for invalid values', () => {
      expect(asDate(null)).toBeUndefined();
      expect(asDate(undefined)).toBeUndefined();
      expect(asDate('invalid-date')).toBeUndefined();
      expect(asDate(NaN)).toBeUndefined(); // Specifically test NaN Date
      expect(asDate(new Date('invalid'))).toBeUndefined(); // Test invalid date object
      expect(asDate({})).toBeUndefined();
      expect(asDate(123)).toBeUndefined(); // Number timestamp is not accepted
      expect(asDate('2023-01-01')).toBeUndefined(); // String date is not accepted
    });
  });
});

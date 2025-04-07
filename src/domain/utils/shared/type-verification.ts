/**
 * NOVAMIND Neural-Safe Type Verification
 * Common type verification utilities with quantum-level precision
 */

import type { Result } from '@domain/types/shared/common';
import { NeuralError } from '@domain/types/shared/common'; // Corrected path

/**
 * Type Verification Error with clinical precision
 */
export class TypeVerificationError extends NeuralError {
  constructor(
    message: string,
    public expectedType: string,
    public receivedType: string,
    public field?: string
  ) {
    super(message, {
      code: 'TYPE_VERIFICATION_ERROR',
      severity: 'error',
      component: 'TypeVerifier',
    });
    this.name = 'TypeVerificationError';
  }
}

/**
 * Shared type verification utilities
 */
export class TypeVerifier {
  /**
   * Safely converts a value to a number
   */
  safelyParseNumber(value: unknown, fallback: number = 0): number {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }

    return fallback;
  }

  /**
   * Safely converts a value to a boolean
   */
  safelyParseBoolean(value: unknown, fallback: boolean = false): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') {
        return true;
      }

      if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0') {
        return false;
      }
    }

    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }

    return fallback;
  }

  /**
   * Safely converts a value to a string
   */
  safelyParseString(value: unknown, fallback: string = ''): string {
    if (value === null || value === undefined) {
      return fallback;
    }

    return String(value);
  }

  /**
   * Generic method to verify that a value is of a specific type
   */
  verifyType<T>(
    value: unknown,
    typeName: string,
    typeCheck: (val: unknown) => boolean,
    field?: string
  ): Result<T, TypeVerificationError> {
    if (typeCheck(value)) {
      return {
        success: true,
        value: value as T,
      };
    }

    return {
      success: false,
      error: new TypeVerificationError(
        `Invalid type`,
        typeName,
        typeof value === 'object'
          ? value === null
            ? 'null'
            : Array.isArray(value)
              ? 'array'
              : 'object'
          : typeof value,
        field
      ),
    };
  }

  /**
   * Verify that a value is a string
   */
  verifyString(value: unknown, field?: string): Result<string, TypeVerificationError> {
    return this.verifyType<string>(
      value,
      'string',
      (val): val is string => typeof val === 'string',
      field
    );
  }

  /**
   * Verify that a value is a string or undefined/null
   */
  verifyOptionalString(value: unknown, field?: string): Result<string | undefined, TypeVerificationError> {
    if (value === undefined || value === null) {
      return { success: true, value: undefined };
    }
    const result = this.verifyString(value, field);
    // We explicitly allow undefined here, so map success to undefined value
    return result.success ? result : { success: true, value: undefined };
  }

  /**
   * Verify that a value is a number
   */
  verifyNumber(value: unknown, field?: string): Result<number, TypeVerificationError> {
    return this.verifyType<number>(
      value,
      'number',
      (val): val is number => typeof val === 'number' && !Number.isNaN(val),
      field
    );
  }

  /**
   * Verify that a value is a boolean
   */
  verifyBoolean(value: unknown, field?: string): Result<boolean, TypeVerificationError> {
    return this.verifyType<boolean>(
      value,
      'boolean',
      (val): val is boolean => typeof val === 'boolean',
      field
    );
  }

  /**
   * Verify that a value is an array
   */
  verifyArray<T = unknown>(
    value: unknown,
    itemVerifier?: (item: unknown, index: number) => Result<T, TypeVerificationError>,
    field?: string
  ): Result<T[], TypeVerificationError> {
    // First check if it's an array
    const arrayResult = this.verifyType<unknown[]>(value, 'array', Array.isArray, field);

    if (!arrayResult.success) {
      return arrayResult as Result<T[], TypeVerificationError>;
    }

    // If no item verifier is provided, just return the array
    if (!itemVerifier) {
      return arrayResult as Result<T[], TypeVerificationError>;
    }

    // Verify each item
    const items: T[] = [];
    const errors: TypeVerificationError[] = [];

    arrayResult.value.forEach((item, index) => {
      const itemResult = itemVerifier(item, index);
      if (itemResult.success) {
        items.push(itemResult.value);
      } else {
        errors.push(
          new TypeVerificationError(
            `Invalid item in array at index ${index}`,
            'valid item',
            typeof item === 'object'
              ? item === null
                ? 'null'
                : Array.isArray(item)
                  ? 'array'
                  : 'object'
              : typeof item,
            field ? `${field}[${index}]` : `[${index}]`
          )
        );
      }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: errors[0],
      };
    }

    return {
      success: true,
      value: items,
    };
  }

  /**
   * Verify that a value is an object
   */
  verifyObject<T extends Record<string, unknown> = Record<string, unknown>>(
    value: unknown,
    field?: string
  ): Result<T, TypeVerificationError> {
    return this.verifyType<T>(
      value,
      'object',
      (val): val is Record<string, unknown> =>
        typeof val === 'object' && val !== null && !Array.isArray(val),
      field
    );
  }

  /**
   * Verify that a value is one of the specified enum values (string literals)
   */
  verifyEnum<T extends string>(
    value: unknown,
    allowedValues: readonly T[],
    field?: string
  ): Result<T, TypeVerificationError> {
    const stringResult = this.verifyString(value, field);
    if (!stringResult.success) {
      return stringResult as Result<T, TypeVerificationError>; // Keep the original error message
    }

    const stringValue = stringResult.value;
    if (allowedValues.includes(stringValue as T)) {
      // Check against the specific literal type T
      return { success: true, value: stringValue as T };
    }

    return {
      success: false,
      error: new TypeVerificationError(
        `Invalid enum value`,
        `one of [${allowedValues.join(', ')}]`,
        `'${stringValue}'`,
        field
      ),
    };
  }

  /**
   * Assert that a value is of a specific type
   */
  assertType<T>(
    value: unknown,
    typeName: string,
    typeCheck: (val: unknown) => boolean,
    field?: string
  ): asserts value is T {
    if (!typeCheck(value)) {
      throw new TypeVerificationError(
        `Invalid type`,
        typeName,
        typeof value === 'object'
          ? value === null
            ? 'null'
            : Array.isArray(value)
              ? 'array'
              : 'object'
          : typeof value,
        field
      );
    }
  }

  /**
   * Assert that a value is a string
   */
  assertString(value: unknown, field?: string): asserts value is string {
    this.assertType<string>(
      value,
      'string',
      (val): val is string => typeof val === 'string',
      field
    );
  }

  /**
   * Assert that a value is a number
   */
  assertNumber(value: unknown, field?: string): asserts value is number {
    this.assertType<number>(
      value,
      'number',
      (val): val is number => typeof val === 'number' && !Number.isNaN(val),
      field
    );
  }

  /**
   * Assert that a value is a boolean
   */
  assertBoolean(value: unknown, field?: string): asserts value is boolean {
    this.assertType<boolean>(
      value,
      'boolean',
      (val): val is boolean => typeof val === 'boolean',
      field
    );
  }

  /**
   * Assert that a value is an array
   */
  assertArray<T = unknown>(value: unknown, field?: string): asserts value is T[] {
    this.assertType<T[]>(value, 'array', Array.isArray, field);
  }

  /**
   * Assert that a value is an object
   */
  assertObject<T extends Record<string, unknown> = Record<string, unknown>>(
    value: unknown,
    field?: string
  ): asserts value is T {
    this.assertType<T>(
      value,
      'object',
      (val): val is Record<string, unknown> =>
        typeof val === 'object' && val !== null && !Array.isArray(val),
      field
    );
  }
}

// Export singleton instance for easy usage
export const typeVerifier = new TypeVerifier();

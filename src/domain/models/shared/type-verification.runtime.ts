/**
 * NOVAMIND Neural-Safe Type Verification
 * Runtime validation utilities with quantum-level precision
 */

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
  // Removed unused: asString, asNumber, asBoolean, asDate
} from './type-verification';

/**
 * Validates a potentially undefined value is defined
 */
export function validateDefined<T>(value: T | undefined, propertyPath?: string): boolean {
  try {
    assertDefined(value, propertyPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates a potentially null or undefined value is present
 */
export function validatePresent<T>(value: T | null | undefined, propertyPath?: string): boolean {
  try {
    assertPresent(value, propertyPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates a value is a string
 */
export function validateString(value: unknown, propertyPath?: string): boolean {
  try {
    assertString(value, propertyPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates a value is a number
 */
export function validateNumber(value: unknown, propertyPath?: string): boolean {
  try {
    assertNumber(value, propertyPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates a value is a boolean
 */
export function validateBoolean(value: unknown, propertyPath?: string): boolean {
  try {
    assertBoolean(value, propertyPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates a value is an array
 */
export function validateArray(value: unknown, propertyPath?: string): boolean {
  try {
    assertArray(value, propertyPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates a value is an array and all elements satisfy a type predicate
 */
export function validateArrayOf<_T>( // Prefixed unused type parameter
  value: unknown,
  elementValidator: (item: unknown) => boolean,
  propertyPath?: string
): boolean {
  if (!validateArray(value, propertyPath)) return false;

  try {
    return (value as unknown[]).every(
      (item, index) =>
        elementValidator(item) ||
        (() => {
          throw new TypeVerificationError(
            'valid array element',
            item,
            propertyPath ? `${propertyPath}[${index}]` : `[${index}]`
          );
        })()
    );
  } catch (error) {
    return false;
  }
}

/**
 * Validates a value is an object
 */
export function validateObject(value: unknown, propertyPath?: string): boolean {
  try {
    assertObject(value, propertyPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates a value is a Date
 */
export function validateDate(value: unknown, propertyPath?: string): boolean {
  try {
    assertDate(value, propertyPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates a value satisfies a type guard
 */
export function validateType<T>(
  value: unknown,
  typeGuard: (v: unknown) => v is T,
  typeName: string,
  propertyPath?: string
): boolean {
  try {
    assertType(value, typeGuard, typeName, propertyPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates an object has a specific property of a given type
 */
export function validateProperty(
  obj: unknown,
  property: string,
  validator: (value: unknown) => boolean,
  propertyPath?: string
): boolean {
  if (!validateObject(obj, propertyPath)) return false;

  // Removed unused variable: path
  const value = (obj as Record<string, unknown>)[property];

  // Directly return the boolean result of the validator.
  // The calling context (like createObjectValidator) might handle
  // error reporting or logging if needed based on this boolean result.
  return validator(value);
}

/**
 * Creates a validator that checks if a value is one of a set of literals
 */
export function validateOneOf<T extends string | number>(
  allowedValues: readonly T[]
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    return allowedValues.includes(value as T);
  };
}

/**
 * Creates a validator for an object type with required properties
 */
export function createObjectValidator<T extends Record<string, unknown>>(propertyValidators: {
  [K in keyof T]: (value: unknown) => boolean;
}): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    if (!validateObject(value)) return false;

    const obj = value as Record<string, unknown>;

    for (const [prop, validator] of Object.entries(propertyValidators)) {
      if (!validateProperty(obj, prop, validator, prop)) {
        return false;
      }
    }

    return true;
  };
}

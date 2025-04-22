/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Type Verification
 * Core implementation module with quantum-level type safety
 */

/**
 * Custom error class for type verification failures
 * Provides detailed diagnostic information for debugging
 */
export class TypeVerificationError extends Error {
  public readonly propertyPath?: string;
  public readonly expectedType: string;
  public readonly actualValue: unknown;

  constructor(
    expectedType: string,
    actualValue: unknown,
    propertyPath?: string,
    customMessage?: string
  ) {
    const path = propertyPath ? ` for '${propertyPath}'` : '';

    // Get precise type information for test assertions
    let typeDescription: string;

    if (actualValue === null) {
      typeDescription = 'null';
    } else if (Array.isArray(actualValue)) {
      typeDescription = 'array';
    } else if (actualValue instanceof Date) {
      typeDescription = 'Date';
    } else {
      typeDescription = typeof actualValue;
    }

    // Format the error message to match expected test patterns
    const message =
      customMessage || `Expected ${expectedType}${path}, but received ${typeDescription}`;

    super(message);

    this.name = 'TypeVerificationError';
    this.propertyPath = propertyPath;
    this.expectedType = expectedType;
    this.actualValue = actualValue;

    // Capture stack trace for better debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TypeVerificationError);
    }
  }
}

/**
 * Asserts that a value is defined (not undefined)
 */
export function assertDefined<T>(value: T | undefined, propertyPath?: string): asserts value is T {
  if (value === undefined) {
    throw new TypeVerificationError('defined value', value, propertyPath);
  }
}

/**
 * Asserts that a value is present (not null or undefined)
 */
export function assertPresent<T>(
  value: T | null | undefined,
  propertyPath?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new TypeVerificationError('non-null and defined value', value, propertyPath);
  }
}

/**
 * Asserts that a value is a string
 */
export function assertString(value: unknown, propertyPath?: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeVerificationError('string', value, propertyPath);
  }
}

/**
 * Asserts that a value is a number
 */
export function assertNumber(value: unknown, propertyPath?: string): asserts value is number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new TypeVerificationError('number', value, propertyPath);
  }
}

/**
 * Asserts that a value is a boolean
 */
export function assertBoolean(value: unknown, propertyPath?: string): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new TypeVerificationError('boolean', value, propertyPath);
  }
}

/**
 * Asserts that a value is an array
 */
export function assertArray(value: unknown, propertyPath?: string): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeVerificationError('array', value, propertyPath);
  }
}

/**
 * Asserts that a value is an object (not null, not an array)
 */
export function assertObject(
  value: unknown,
  propertyPath?: string
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeVerificationError('object', value, propertyPath);
  }
}

/**
 * Asserts that a value is a Date
 */
export function assertDate(value: unknown, propertyPath?: string): asserts value is Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new TypeVerificationError('Date', value, propertyPath);
  }
}

/**
 * Asserts that a value satisfies a type guard
 */
export function assertType<T>(
  value: unknown,
  typeGuard: (v: unknown) => v is T,
  typeName: string,
  propertyPath?: string
): asserts value is T {
  if (!typeGuard(value)) {
    throw new TypeVerificationError(typeName, value, propertyPath);
  }
}

/**
 * Converts a potentially non-string value to a string
 * @returns {string | undefined} The value as a string, or undefined if conversion is not possible.
 */
export function asString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  // Implement coercion for number and boolean
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  // Return undefined for null, undefined, object, array, etc.
  return undefined;
}

/**
 * Converts a potentially non-number value to a number
 * @returns {number | undefined} The value as a number, or undefined if conversion is not possible or results in NaN.
 */
export function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  // Implement coercion for string
  if (typeof value === 'string') {
    const num = Number(value);
    // Return undefined if string is empty or conversion fails (NaN)
    return value.trim() === '' || Number.isNaN(num) ? undefined : num;
  }
  // Return undefined for other types
  return undefined;
}

/**
 * Converts a potentially non-boolean value to a boolean
 * @returns {boolean | undefined} The value as a boolean, or undefined if conversion is not possible.
 */
export function asBoolean(value: unknown): boolean | undefined {
  // Perform check directly, return undefined on failure
  if (typeof value === 'boolean') {
    return value;
  }
  return undefined;
}

/**
 * Converts a potentially non-Date value to a Date
 * @returns {Date | undefined} The value as a Date object, or undefined if invalid.
 */
export function asDate(value: unknown): Date | undefined {
  // Perform check directly, return undefined on failure
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  return undefined;
}

/**
 * Type guard that checks if a value is one of a set of literal values
 */
export function isOneOf<T extends string | number>(
  allowedValues: readonly T[]
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    return typeof value === typeof allowedValues[0] && allowedValues.includes(value as T);
  };
}

/**
 * Type guard for checking optional values
 */
export function isOptional<T>(
  typeGuard: (v: unknown) => v is T
): (value: unknown) => value is T | undefined {
  return (value: unknown): value is T | undefined => {
    return value === undefined || typeGuard(value);
  };
}

/**
 * Type guard for checking nullable values
 */
export function isNullable<T>(
  typeGuard: (v: unknown) => v is T
): (value: unknown) => value is T | null {
  return (value: unknown): value is T | null => {
    return value === null || typeGuard(value);
  };
}

/**
 * Type guard for checking optional and nullable values
 */
export function isOptionalOrNullable<T>(
  typeGuard: (v: unknown) => v is T
): (value: unknown) => value is T | undefined | null {
  return (value: unknown): value is T | undefined | null => {
    return value === undefined || value === null || typeGuard(value);
  };
}

/**
 * Creates a type guard for arrays where all elements satisfy a type guard
 */
export function isArrayOf<T>(
  elementTypeGuard: (v: unknown) => v is T
): (value: unknown) => value is T[] {
  return (value: unknown): value is T[] => {
    if (!Array.isArray(value)) return false;
    return value.every((item) => elementTypeGuard(item));
  };
}

/**
 * Creates a type guard for objects with specific properties
 */
export function isObjectWithProperties<T extends Record<string, unknown>>(propertyTypeGuards: {
  [K in keyof T]-?: (v: unknown) => v is T[K];
}): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }

    const obj = value as Record<string, unknown>;
    const properties = Object.keys(propertyTypeGuards) as Array<keyof T>;

    for (const prop of properties) {
      const propValue = obj[prop as string];
      const typeGuard = propertyTypeGuards[prop];

      if (!typeGuard(propValue)) {
        return false;
      }
    }

    return true;
  };
}

/**
 * @param propertyPath Optional path for error messages
 */
export function isNumber(value: unknown, propertyPath?: string): value is number {
  if (typeof value !== 'number') {
    throw new TypeVerificationError('number', value, propertyPath);
  }
  return true;
}

/**
 * Asserts that a value is one of a set of literal values
 */
export function assertIsOneOf<T extends string | number | boolean>(
  value: T | null | undefined,
  allowedValues: readonly T[],
  propertyPath?: string
): asserts value is T {
  if (value === null || value === undefined || !allowedValues.includes(value)) {
    const expected = allowedValues.map((v) => `${typeof v}: ${v}`).join(', ');
    throw new TypeVerificationError(`one of ${expected}`, value, propertyPath);
  }
}

/**
 * Asserts that a value is a string array
 */
export function assertStringArray(
  value: unknown,
  propertyPath?: string
): asserts value is string[] {
  if (!Array.isArray(value)) {
    throw new TypeVerificationError('string[]', value, propertyPath);
  }
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== 'string') {
      throw new TypeVerificationError('string', value[i], `${propertyPath}[${i}]`);
    }
  }
}

/**
 * Asserts that a value is an array of a specific type
 */
export function assertArrayOf<T>(
  value: unknown,
  elementType: string,
  propertyPath?: string
): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new TypeVerificationError(`array of ${elementType}`, value, propertyPath);
  }
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== elementType) {
      throw new TypeVerificationError(elementType, value[i], `${propertyPath ?? 'array'}[${i}]`);
    }
  }
}

/**
 * Asserts that a value is an object with specific properties
 */
export function assertObjectWithProperties<T extends Record<string, unknown>>(
  value: unknown,
  propertyTypeGuards: {
    [K in keyof T]-?: (v: unknown) => v is T[K];
  },
  propertyPath?: string
): asserts value is T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeVerificationError('object', value, propertyPath);
  }

  const obj = value as Record<string, unknown>;
  const properties = Object.keys(propertyTypeGuards) as Array<keyof T>;

  for (const prop of properties) {
    const propValue = obj[prop as string];
    const typeGuard = propertyTypeGuards[prop];

    if (!typeGuard(propValue)) {
      throw new TypeVerificationError(
        `property '${String(prop)}'`,
        propValue,
        `${propertyPath ?? 'object'}.${String(prop)}`
      );
    }
  }
}

/**
 * NOVAMIND Neural-Safe Type Verification
 * Type verification utilities with quantum-level precision
 */

/**
 * Custom error type for type verification failures 
 */
export class TypeVerificationError extends Error {
  constructor(
    public readonly expectedType: string,
    public readonly receivedValue: unknown,
    public readonly propertyPath?: string
  ) {
    const path = propertyPath ? ` at ${propertyPath}` : '';
    const receivedType = typeof receivedValue;
    const receivedStr = receivedValue === null ? 'null' : 
      Array.isArray(receivedValue) ? 'array' : receivedType;
    
    super(`Expected type '${expectedType}'${path}, but received '${receivedStr}'`);
    this.name = 'TypeVerificationError';
  }
}

/**
 * Ensure a value is defined (not undefined)
 */
export function assertDefined<T>(
  value: T | undefined, 
  propertyPath?: string
): asserts value is T {
  if (value === undefined) {
    throw new TypeVerificationError('defined', value, propertyPath);
  }
}

/**
 * Ensure a value is not null or undefined
 */
export function assertPresent<T>(
  value: T | null | undefined, 
  propertyPath?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new TypeVerificationError('non-null', value, propertyPath);
  }
}

/**
 * Ensure a value is a string
 */
export function assertString(
  value: unknown, 
  propertyPath?: string
): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeVerificationError('string', value, propertyPath);
  }
}

/**
 * Ensure a value is a number
 */
export function assertNumber(
  value: unknown, 
  propertyPath?: string
): asserts value is number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new TypeVerificationError('number', value, propertyPath);
  }
}

/**
 * Ensure a value is a boolean
 */
export function assertBoolean(
  value: unknown, 
  propertyPath?: string
): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new TypeVerificationError('boolean', value, propertyPath);
  }
}

/**
 * Ensure a value is an array
 */
export function assertArray<T = unknown>(
  value: unknown, 
  propertyPath?: string
): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new TypeVerificationError('array', value, propertyPath);
  }
}

/**
 * Ensure a value is an object
 */
export function assertObject(
  value: unknown, 
  propertyPath?: string
): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeVerificationError('object', value, propertyPath);
  }
}

/**
 * Ensure a value is a Date
 */
export function assertDate(
  value: unknown, 
  propertyPath?: string
): asserts value is Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new TypeVerificationError('Date', value, propertyPath);
  }
}

/**
 * Ensure a value matches a specific type guard
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
 * Safe type conversion: try to convert to string or return undefined
 */
export function asString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  
  try {
    return String(value);
  } catch {
    return undefined;
  }
}

/**
 * Safe type conversion: try to convert to number or return undefined
 */
export function asNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

/**
 * Safe type conversion: try to convert to boolean or return undefined
 */
export function asBoolean(value: unknown): boolean | undefined {
  if (value === null || value === undefined) return undefined;
  
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  
  return undefined;
}

/**
 * Safe type conversion: try to convert to Date or return undefined
 */
export function asDate(value: unknown): Date | undefined {
  if (value === null || value === undefined) return undefined;
  
  try {
    if (value instanceof Date) return new Date(value);
    if (typeof value === 'number' || typeof value === 'string') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }
  } catch {
    return undefined;
  }
  
  return undefined;
}

/**
 * NOVAMIND Neural-Safe Type Verification
 * Common type verification utilities with quantum-level precision
 */

import { Result, NeuralError } from "@types/shared/common";

/**
 * Type Verification Error with clinical precision
 */
export class TypeVerificationError extends NeuralError {
  constructor(
    message: string,
    public expectedType: string,
    public receivedType: string,
    public field?: string,
  ) {
    super(message, {
      code: "TYPE_VERIFICATION_ERROR",
      severity: "error",
      component: "TypeVerifier",
    });
    this.name = "TypeVerificationError";
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
    if (typeof value === "number" && !Number.isNaN(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    if (typeof value === "boolean") {
      return value ? 1 : 0;
    }

    return fallback;
  }

  /**
   * Safely converts a value to a boolean
   */
  safelyParseBoolean(value: unknown, fallback: boolean = false): boolean {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const lowerValue = value.toLowerCase();
      if (lowerValue === "true" || lowerValue === "yes" || lowerValue === "1") {
        return true;
      }

      if (lowerValue === "false" || lowerValue === "no" || lowerValue === "0") {
        return false;
      }
    }

    if (typeof value === "number") {
      if (value === 1) return true;
      if (value === 0) return false;
    }

    return fallback;
  }

  /**
   * Safely converts a value to a string
   */
  safelyParseString(value: unknown, fallback: string = ""): string {
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
    field?: string,
  ): Result<T> {
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
        typeof value === "object"
          ? value === null
            ? "null"
            : Array.isArray(value)
              ? "array"
              : "object"
          : typeof value,
        field,
      ),
    };
  }

  /**
   * Verify that a value is a string
   */
  verifyString(value: unknown, field?: string): Result<string> {
    return this.verifyType<string>(
      value,
      "string",
      (val): val is string => typeof val === "string",
      field,
    );
  }

  /**
   * Verify that a value is a number
   */
  verifyNumber(value: unknown, field?: string): Result<number> {
    return this.verifyType<number>(
      value,
      "number",
      (val): val is number => typeof val === "number" && !Number.isNaN(val),
      field,
    );
  }

  /**
   * Verify that a value is a boolean
   */
  verifyBoolean(value: unknown, field?: string): Result<boolean> {
    return this.verifyType<boolean>(
      value,
      "boolean",
      (val): val is boolean => typeof val === "boolean",
      field,
    );
  }

  /**
   * Verify that a value is an array
   */
  verifyArray<T = unknown>(
    value: unknown,
    itemVerifier?: (item: unknown, index: number) => Result<T>,
    field?: string,
  ): Result<T[]> {
    // First check if it's an array
    const arrayResult = this.verifyType<unknown[]>(
      value,
      "array",
      Array.isArray,
      field,
    );

    if (!arrayResult.success) {
      return arrayResult as Result<T[]>;
    }

    // If no item verifier is provided, just return the array
    if (!itemVerifier) {
      return arrayResult as Result<T[]>;
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
            "valid item",
            typeof item === "object"
              ? item === null
                ? "null"
                : Array.isArray(item)
                  ? "array"
                  : "object"
              : typeof item,
            field ? `${field}[${index}]` : `[${index}]`,
          ),
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
    field?: string,
  ): Result<T> {
    return this.verifyType<T>(
      value,
      "object",
      (val): val is Record<string, unknown> =>
        typeof val === "object" && val !== null && !Array.isArray(val),
      field,
    );
  }

  /**
   * Assert that a value is of a specific type
   */
  assertType<T>(
    value: unknown,
    typeName: string,
    typeCheck: (val: unknown) => boolean,
    field?: string,
  ): asserts value is T {
    if (!typeCheck(value)) {
      throw new TypeVerificationError(
        `Invalid type`,
        typeName,
        typeof value === "object"
          ? value === null
            ? "null"
            : Array.isArray(value)
              ? "array"
              : "object"
          : typeof value,
        field,
      );
    }
  }

  /**
   * Assert that a value is a string
   */
  assertString(value: unknown, field?: string): asserts value is string {
    this.assertType<string>(
      value,
      "string",
      (val): val is string => typeof val === "string",
      field,
    );
  }

  /**
   * Assert that a value is a number
   */
  assertNumber(value: unknown, field?: string): asserts value is number {
    this.assertType<number>(
      value,
      "number",
      (val): val is number => typeof val === "number" && !Number.isNaN(val),
      field,
    );
  }

  /**
   * Assert that a value is a boolean
   */
  assertBoolean(value: unknown, field?: string): asserts value is boolean {
    this.assertType<boolean>(
      value,
      "boolean",
      (val): val is boolean => typeof val === "boolean",
      field,
    );
  }

  /**
   * Assert that a value is an array
   */
  assertArray<T = unknown>(
    value: unknown,
    field?: string,
  ): asserts value is T[] {
    this.assertType<T[]>(value, "array", Array.isArray, field);
  }

  /**
   * Assert that a value is an object
   */
  assertObject<T extends Record<string, unknown> = Record<string, unknown>>(
    value: unknown,
    field?: string,
  ): asserts value is T {
    this.assertType<T>(
      value,
      "object",
      (val): val is Record<string, unknown> =>
        typeof val === "object" && val !== null && !Array.isArray(val),
      field,
    );
  }
}

// Export singleton instance for easy usage
export const typeVerifier = new TypeVerifier();

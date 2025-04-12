/* eslint-disable */
/**
 * @fileoverview Runtime validation functions for data related to the useSearchParams hook.
 * Ensures that search parameter structures conform to expected types at runtime.
 */

import type { Result } from 'ts-results';
import { Ok, Err } from 'ts-results';
// TODO: Import specific domain types if search params represent domain entities
// import { FilterCriteria } from '../../domain/types/search'; // Example type
// import { ValidationError } from '@domain/errors/validation'; // Assuming a custom error type

// Type for the object passed to setParams
type ParamsObject = Record<string, string | number | null>;

/**
 * Validates the structure and types of the params object used in setParams.
 * Ensures keys are strings and values are string, number, or null.
 * @param data - The params object to validate.
 * @returns Result<ParamsObject, Error>
 */
export function validateParamsObject(data: unknown): Result<ParamsObject, Error> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return Err(new Error('Invalid ParamsObject: Input must be a plain object.'));
  }

  for (const key in data) {
    // Ensure the key is directly on the object (optional, but good practice)
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = (data as ParamsObject)[key];
      if (typeof value !== 'string' && typeof value !== 'number' && value !== null) {
        return Err(
          new Error(
            `Invalid ParamsObject: Value for key "${key}" must be a string, number, or null. Received type ${typeof value}.`
          )
        );
      }
    }
  }

  // If all values are valid:
  return Ok(data as ParamsObject);
}

// No specific type guards needed here for this basic validation.

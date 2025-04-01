/**
 * @fileoverview Runtime validation functions for data related to the useBrainModel hook.
 * Ensures that data structures conform to expected types at runtime.
 */

import { Result, Ok, Err } from 'ts-results';
// Import actual domain types and type guard
import { BrainModel, isBrainModel } from '@domain/types/brain/core-models';
// Assuming a standard validation error type might be defined later
// import { ValidationError } from '@domain/errors/validation';

// Use the actual BrainModel type
type BrainModelData = BrainModel;

/**
 * Validates the structure and types of BrainModelData using the domain type guard.
 * @param data - The data to validate.
 * @returns Result<BrainModelData, Error> - Using generic Error for now.
 */
export function validateBrainModelData(data: unknown): Result<BrainModelData, Error> {
  // Use the domain type guard for comprehensive validation
  if (isBrainModel(data)) {
    // The type guard confirms the structure matches BrainModel
    return Ok(data); // No need to cast 'as BrainModelData' due to type guard
  } else {
    // Provide a more informative error message
    // TODO: Potentially use a specific ValidationError class if defined
    return Err(new Error('Invalid BrainModelData: Data does not conform to the BrainModel structure.'));
  }
}

// No additional type guards needed here as isBrainModel handles the structure.
// Specific validation for nested types (like BrainRegion) should be within their respective validators/guards if needed elsewhere.

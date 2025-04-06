/**
 * @fileoverview Runtime validation functions for data related to the useBrainModel hook.
 * Ensures that data structures conform to expected types at runtime.
 */

import { Ok, Err, type Result } from "ts-results"; // Import Result as type
// Import actual domain types and type guard
// Import nested type guards and types
import {
  type BrainModel,
  isBrainModel,
  BrainRegion, // Keep as value (used in .every)
  isBrainRegion,
  type Connection,
} from "@domain/types/brain/core-models";
// Assuming a standard validation error type might be defined later
// import { ValidationError } from '@domain/errors/validation';

// Use the actual BrainModel type
type BrainModelData = BrainModel;

/**
 * Validates the structure and types of BrainModelData using the domain type guard.
 * @param data - The data to validate.
 * @returns Result<BrainModelData, Error> - Using generic Error for now.
 */
export function validateBrainModelData(
  data: unknown,
): Result<BrainModelData, Error> {
  // Use the domain type guard and add checks for nested array contents
  if (
    isBrainModel(data) &&
    data.regions.every(isBrainRegion) && // Validate each item in the regions array
    data.connections.every(isConnection) // Validate each item using the local guard
  ) {
    // The type guard and array checks confirm the structure matches BrainModel
    return Ok(data);
  } else {
    // Provide a more informative error message
    // TODO: Potentially use a specific ValidationError class if defined
    return Err(
      new Error(
        "Invalid BrainModelData: Data does not conform to the BrainModel structure.",
      ),
    );
  }
}

// --- Local Type Guards ---

// Basic type guard for Connection interface (as it's not exported from domain)
function isConnection(obj: unknown): obj is Connection {
  if (typeof obj !== "object" || obj === null) return false;
  const conn = obj as Partial<Connection>;
  return (
    typeof conn.id === "string" &&
    typeof conn.sourceId === "string" &&
    typeof conn.targetId === "string" &&
    typeof conn.strength === "number" &&
    typeof conn.type === "string" && // Basic check
    typeof conn.isActive === "boolean" &&
    typeof conn.color === "string"
  );
}

// No additional type guards needed here as isBrainModel handles the structure.
// Specific validation for nested types (like BrainRegion) should be within their respective validators/guards if needed elsewhere.

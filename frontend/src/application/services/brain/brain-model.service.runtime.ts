/**
 * NOVAMIND Neural-Safe Application Service
 * BrainModelService Runtime Validation - Quantum-level runtime validation
 * with clinical precision and mathematical integrity
 */

import { BrainModel, BrainRegion, NeuralConnection } from "@types/brain/models";
import { Result, success, failure } from "@types/shared/common";
import { TypeVerificationError } from "@domain/utils/shared/type-verification.runtime";

/**
 * Runtime validation for BrainModel objects
 * @param obj - The object to validate as a BrainModel
 * @returns A Result containing the validated BrainModel or an error
 */
export function isBrainModel(obj: unknown): obj is BrainModel {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const model = obj as Partial<BrainModel>;

  return (
    typeof model.id === "string" &&
    typeof model.name === "string" &&
    Array.isArray(model.regions) &&
    Array.isArray(model.connections) &&
    typeof model.version === "number"
  );
}

/**
 * Validates a BrainModel with detailed error reporting
 * @param obj - The object to validate
 * @param field - Optional field name for error context
 * @returns A Result with the validated BrainModel or an error
 */
export function validateBrainModel(
  obj: unknown,
  field?: string,
): Result<BrainModel> {
  if (!obj || typeof obj !== "object") {
    return failure(
      new TypeVerificationError(
        "Invalid BrainModel: expected an object",
        "BrainModel",
        typeof obj,
        field,
      ),
    );
  }

  const model = obj as Partial<BrainModel>;

  // Validate required string fields
  if (typeof model.id !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid BrainModel: missing or invalid 'id'",
        "string",
        typeof model.id,
        field ? `${field}.id` : "id",
      ),
    );
  }

  if (typeof model.name !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid BrainModel: missing or invalid 'name'",
        "string",
        typeof model.name,
        field ? `${field}.name` : "name",
      ),
    );
  }

  // Validate arrays
  if (!Array.isArray(model.regions)) {
    return failure(
      new TypeVerificationError(
        "Invalid BrainModel: missing or invalid 'regions'",
        "Array<BrainRegion>",
        typeof model.regions,
        field ? `${field}.regions` : "regions",
      ),
    );
  }

  if (!Array.isArray(model.connections)) {
    return failure(
      new TypeVerificationError(
        "Invalid BrainModel: missing or invalid 'connections'",
        "Array<NeuralConnection>",
        typeof model.connections,
        field ? `${field}.connections` : "connections",
      ),
    );
  }

  // Validate version number
  if (typeof model.version !== "number") {
    return failure(
      new TypeVerificationError(
        "Invalid BrainModel: missing or invalid 'version'",
        "number",
        typeof model.version,
        field ? `${field}.version` : "version",
      ),
    );
  }

  // Validate regions
  for (let i = 0; i < model.regions.length; i++) {
    if (!isBrainRegion(model.regions[i])) {
      return failure(
        new TypeVerificationError(
          `Invalid BrainModel: invalid region at index ${i}`,
          "BrainRegion",
          typeof model.regions[i],
          field ? `${field}.regions[${i}]` : `regions[${i}]`,
        ),
      );
    }
  }

  // Validate connections
  for (let i = 0; i < model.connections.length; i++) {
    if (!isNeuralConnection(model.connections[i])) {
      return failure(
        new TypeVerificationError(
          `Invalid BrainModel: invalid connection at index ${i}`,
          "NeuralConnection",
          typeof model.connections[i],
          field ? `${field}.connections[${i}]` : `connections[${i}]`,
        ),
      );
    }
  }

  return success(model as BrainModel);
}

/**
 * Runtime validation for BrainRegion objects
 * @param obj - The object to validate as a BrainRegion
 * @returns A boolean indicating if the object is a valid BrainRegion
 */
export function isBrainRegion(obj: unknown): obj is BrainRegion {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const region = obj as Partial<BrainRegion>;

  return (
    typeof region.id === "string" &&
    typeof region.name === "string" &&
    typeof region.activityLevel === "number" &&
    typeof region.isActive === "boolean"
  );
}

/**
 * Validates a BrainRegion with detailed error reporting
 * @param obj - The object to validate
 * @param field - Optional field name for error context
 * @returns A Result with the validated BrainRegion or an error
 */
export function validateBrainRegion(
  obj: unknown,
  field?: string,
): Result<BrainRegion> {
  if (!obj || typeof obj !== "object") {
    return failure(
      new TypeVerificationError(
        "Invalid BrainRegion: expected an object",
        "BrainRegion",
        typeof obj,
        field,
      ),
    );
  }

  const region = obj as Partial<BrainRegion>;

  // Validate required string fields
  if (typeof region.id !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid BrainRegion: missing or invalid 'id'",
        "string",
        typeof region.id,
        field ? `${field}.id` : "id",
      ),
    );
  }

  if (typeof region.name !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid BrainRegion: missing or invalid 'name'",
        "string",
        typeof region.name,
        field ? `${field}.name` : "name",
      ),
    );
  }

  // Validate numeric fields
  if (
    typeof region.activityLevel !== "number" ||
    region.activityLevel < 0 ||
    region.activityLevel > 1
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid BrainRegion: missing or invalid 'activityLevel', must be a number between 0 and 1",
        "number",
        typeof region.activityLevel,
        field ? `${field}.activityLevel` : "activityLevel",
      ),
    );
  }

  // Validate boolean fields
  if (typeof region.isActive !== "boolean") {
    return failure(
      new TypeVerificationError(
        "Invalid BrainRegion: missing or invalid 'isActive'",
        "boolean",
        typeof region.isActive,
        field ? `${field}.isActive` : "isActive",
      ),
    );
  }

  return success(region as BrainRegion);
}

/**
 * Runtime validation for NeuralConnection objects
 * @param obj - The object to validate as a NeuralConnection
 * @returns A boolean indicating if the object is a valid NeuralConnection
 */
export function isNeuralConnection(obj: unknown): obj is NeuralConnection {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const connection = obj as Partial<NeuralConnection>;

  return (
    typeof connection.id === "string" &&
    typeof connection.sourceId === "string" &&
    typeof connection.targetId === "string" &&
    typeof connection.strength === "number" &&
    typeof connection.type === "string" &&
    typeof connection.active === "boolean"
  );
}

/**
 * Validates a NeuralConnection with detailed error reporting
 * @param obj - The object to validate
 * @param field - Optional field name for error context
 * @returns A Result with the validated NeuralConnection or an error
 */
export function validateNeuralConnection(
  obj: unknown,
  field?: string,
): Result<NeuralConnection> {
  if (!obj || typeof obj !== "object") {
    return failure(
      new TypeVerificationError(
        "Invalid NeuralConnection: expected an object",
        "NeuralConnection",
        typeof obj,
        field,
      ),
    );
  }

  const connection = obj as Partial<NeuralConnection>;

  // Validate required string fields
  if (typeof connection.id !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid NeuralConnection: missing or invalid 'id'",
        "string",
        typeof connection.id,
        field ? `${field}.id` : "id",
      ),
    );
  }

  if (typeof connection.sourceId !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid NeuralConnection: missing or invalid 'sourceId'",
        "string",
        typeof connection.sourceId,
        field ? `${field}.sourceId` : "sourceId",
      ),
    );
  }

  if (typeof connection.targetId !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid NeuralConnection: missing or invalid 'targetId'",
        "string",
        typeof connection.targetId,
        field ? `${field}.targetId` : "targetId",
      ),
    );
  }

  // Validate numeric fields
  if (
    typeof connection.strength !== "number" ||
    connection.strength < 0 ||
    connection.strength > 1
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid NeuralConnection: missing or invalid 'strength', must be a number between 0 and 1",
        "number",
        typeof connection.strength,
        field ? `${field}.strength` : "strength",
      ),
    );
  }

  // Validate type field
  if (
    typeof connection.type !== "string" ||
    (connection.type !== "excitatory" && connection.type !== "inhibitory")
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid NeuralConnection: missing or invalid 'type', must be 'excitatory' or 'inhibitory'",
        "string",
        typeof connection.type,
        field ? `${field}.type` : "type",
      ),
    );
  }

  // Validate boolean fields
  if (typeof connection.active !== "boolean") {
    return failure(
      new TypeVerificationError(
        "Invalid NeuralConnection: missing or invalid 'active'",
        "boolean",
        typeof connection.active,
        field ? `${field}.active` : "active",
      ),
    );
  }

  return success(connection as NeuralConnection);
}

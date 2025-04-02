/**
 * NOVAMIND Neural-Safe Application Service
 * BrainModelService Runtime Validation - Quantum-level runtime validation
 * with clinical precision and mathematical integrity
 */

import { BrainModel, BrainRegion, NeuralConnection } from "@/domain/types/brain/models"; // Corrected path alias
import { Result, success, failure } from "@/domain/types/shared/common"; // Corrected path alias
import { TypeVerificationError } from "@/domain/models/shared/type-verification"; // Import from the definition file

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
    // typeof model.name === "string" && // Removed check for non-existent 'name' property
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
        "BrainModel", // Expected type
        typeof obj, // Received value (type)
        field, // Property path
      ),
    );
  }

  const model = obj as Partial<BrainModel>;

  // Validate required string fields
  if (typeof model.id !== "string") {
    return failure(
      new TypeVerificationError(
        "string", // Expected type
        typeof model.id, // Received value (type)
        field ? `${field}.id` : "id", // Property path
      ),
    );
  }

  // Removed check for non-existent 'name' property
  // if (typeof model.name !== "string") {
  //   return failure(
  //     new TypeVerificationError(
  //       "string", // Expected type
  //       typeof model.name, // Received value (type)
  //       field ? `${field}.name` : "name", // Property path
  //     ),
  //   );
  // }
  // Validate arrays
  if (!Array.isArray(model.regions)) {
    return failure(
      new TypeVerificationError(
        "Array<BrainRegion>", // Expected type
        typeof model.regions, // Received value (type)
        field ? `${field}.regions` : "regions", // Property path
      ),
    );
  }

  if (!Array.isArray(model.connections)) {
    return failure(
      new TypeVerificationError(
        "Array<NeuralConnection>", // Expected type
        typeof model.connections, // Received value (type)
        field ? `${field}.connections` : "connections", // Property path
      ),
    );
  }

  // Validate version number
  if (typeof model.version !== "number") {
    return failure(
      new TypeVerificationError(
        "number", // Expected type
        typeof model.version, // Received value (type)
        field ? `${field}.version` : "version", // Property path
      ),
    );
  }

  // Validate regions
  for (let i = 0; i < model.regions.length; i++) {
    if (!isBrainRegion(model.regions[i])) {
      return failure(
        new TypeVerificationError(
          "BrainRegion", // Expected type
          typeof model.regions[i], // Received value (type)
          field ? `${field}.regions[${i}]` : `regions[${i}]`, // Property path
        ),
      );
    }
  }

  // Validate connections
  for (let i = 0; i < model.connections.length; i++) {
    if (!isNeuralConnection(model.connections[i])) {
      return failure(
        new TypeVerificationError(
          "NeuralConnection", // Expected type
          typeof model.connections[i], // Received value (type)
          field ? `${field}.connections[${i}]` : `connections[${i}]`, // Property path
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
        "BrainRegion", // Expected type
        typeof obj, // Received value (type)
        field, // Property path
      ),
    );
  }

  const region = obj as Partial<BrainRegion>;

  // Validate required string fields
  if (typeof region.id !== "string") {
    return failure(
      new TypeVerificationError(
        "string", // Expected type
        typeof region.id, // Received value (type)
        field ? `${field}.id` : "id", // Property path
      ),
    );
  }

  if (typeof region.name !== "string") {
    return failure(
      new TypeVerificationError(
        "string", // Expected type
        typeof region.name, // Received value (type)
        field ? `${field}.name` : "name", // Property path
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
        "number (0-1)", // Expected type
        typeof region.activityLevel, // Received value (type)
        field ? `${field}.activityLevel` : "activityLevel", // Property path
      ),
    );
  }

  // Validate boolean fields
  if (typeof region.isActive !== "boolean") {
    return failure(
      new TypeVerificationError(
        "boolean", // Expected type
        typeof region.isActive, // Received value (type)
        field ? `${field}.isActive` : "isActive", // Property path
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
    true // Removed check for non-existent 'active' property, placeholder true
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
        "NeuralConnection", // Expected type
        typeof obj, // Received value (type)
        field, // Property path
      ),
    );
  }

  const connection = obj as Partial<NeuralConnection>;

  // Validate required string fields
  if (typeof connection.id !== "string") {
    return failure(
      new TypeVerificationError(
        "string", // Expected type
        typeof connection.id, // Received value (type)
        field ? `${field}.id` : "id", // Property path
      ),
    );
  }

  if (typeof connection.sourceId !== "string") {
    return failure(
      new TypeVerificationError(
        "string", // Expected type
        typeof connection.sourceId, // Received value (type)
        field ? `${field}.sourceId` : "sourceId", // Property path
      ),
    );
  }

  if (typeof connection.targetId !== "string") {
    return failure(
      new TypeVerificationError(
        "string", // Expected type
        typeof connection.targetId, // Received value (type)
        field ? `${field}.targetId` : "targetId", // Property path
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
        "number (0-1)", // Expected type
        typeof connection.strength, // Received value (type)
        field ? `${field}.strength` : "strength", // Property path
      ),
    );
  }

  // Validate type field according to actual definition in models.ts
  const validTypes = ["structural", "functional", "effective"];
  if (
    typeof connection.type !== "string" ||
    !validTypes.includes(connection.type)
  ) {
    return failure(
      new TypeVerificationError(
        "'structural' | 'functional' | 'effective'", // Expected type
        typeof connection.type, // Received value (type)
        field ? `${field}.type` : "type", // Property path
      ),
    );
  }

  // Removed check for non-existent 'active' property
  // if (typeof connection.active !== "boolean") {
  //   return failure(
  //     new TypeVerificationError(
  //       "boolean", // Expected type
  //       typeof connection.active, // Received value (type)
  //       field ? `${field}.active` : "active", // Property path
  //     ),
  //   );
  // }

  return success(connection as NeuralConnection);
}

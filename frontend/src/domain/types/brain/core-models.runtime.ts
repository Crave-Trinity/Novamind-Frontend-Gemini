/**
 * NOVAMIND Neural-Safe Brain Models Runtime Validators
 *
 * Runtime validators for Brain Models data types with quantum-level precision.
 * This module provides runtime validation for the Brain interfaces.
 */

import type {
  BrainRegion,
  Vector3,
  Connection,
  BrainModel,
  Coordinate,
} from "./core-models";

/**
 * Runtime validation for Vector3 objects
 */
export const Vector3Validator = {
  /**
   * Validates if an object is a valid Vector3
   */
  isValid: (obj: unknown): obj is Vector3 => {
    if (!obj || typeof obj !== "object") return false;

    const vector = obj as Partial<Vector3>;

    return (
      typeof vector.x === "number" &&
      typeof vector.y === "number" &&
      typeof vector.z === "number"
    );
  },
};

/**
 * Runtime validation for Coordinate objects
 */
export const CoordinateValidator = {
  /**
   * Validates if an object is a valid Coordinate
   */
  isValid: (obj: unknown): obj is Coordinate => {
    if (!obj || typeof obj !== "object") return false;

    const coordinate = obj as Partial<Coordinate>;

    return (
      typeof coordinate.x === "number" &&
      typeof coordinate.y === "number" &&
      typeof coordinate.z === "number" &&
      typeof coordinate.label === "string"
    );
  },
};

/**
 * Runtime validation for BrainRegion objects
 */
export const BrainRegionValidator = {
  /**
   * Validates if an object is a valid BrainRegion
   */
  isValid: (obj: unknown): obj is BrainRegion => {
    if (!obj || typeof obj !== "object") return false;

    const region = obj as Partial<BrainRegion>;

    return (
      typeof region.id === "string" &&
      typeof region.name === "string" &&
      Vector3Validator.isValid(region.position) &&
      typeof region.color === "string" &&
      Array.isArray(region.connections) &&
      region.connections.every((conn) => typeof conn === "string") &&
      typeof region.activityLevel === "number" &&
      typeof region.isActive === "boolean" &&
      (region.volumeMl === undefined || typeof region.volumeMl === "number") &&
      (region.riskFactor === undefined || typeof region.riskFactor === "number")
    );
  },
};

/**
 * Runtime validation for Connection objects
 */
export const ConnectionValidator = {
  /**
   * Validates if an object is a valid Connection
   */
  isValid: (obj: unknown): obj is Connection => {
    if (!obj || typeof obj !== "object") return false;

    const connection = obj as Partial<Connection>;

    return (
      typeof connection.id === "string" &&
      typeof connection.sourceId === "string" &&
      typeof connection.targetId === "string" &&
      typeof connection.strength === "number" &&
      typeof connection.type === "string" &&
      typeof connection.isActive === "boolean" &&
      typeof connection.color === "string"
    );
  },
};

/**
 * Runtime validation for BrainModel objects
 */
export const BrainModelValidator = {
  /**
   * Validates if an object is a valid BrainModel
   */
  isValid: (obj: unknown): obj is BrainModel => {
    if (!obj || typeof obj !== "object") return false;

    const model = obj as Partial<BrainModel>;

    return (
      typeof model.id === "string" &&
      typeof model.name === "string" &&
      Array.isArray(model.regions) &&
      model.regions.every(BrainRegionValidator.isValid) &&
      Array.isArray(model.connections) &&
      model.connections.every(ConnectionValidator.isValid) &&
      (model.patients === undefined || Array.isArray(model.patients)) &&
      (model.modelType === undefined || typeof model.modelType === "string") &&
      (model.anatomicalCoordinates === undefined ||
        (Array.isArray(model.anatomicalCoordinates) &&
          model.anatomicalCoordinates.every(CoordinateValidator.isValid)))
    );
  },
};

/**
 * NOVAMIND Neural-Safe Type Verification
 * Brain-specific type verification utilities with quantum-level precision
 */

import type { BrainModel, BrainRegion, Connection as NeuralConnection } from '@domain/types/brain/core-models'; // Renamed import to NeuralConnection
import { RenderMode } from '@domain/types/brain/visualization'; // Removed unused VisualizationSettings
import type { Vector3, Result } from '@domain/types/shared/common';
import { typeVerifier, TypeVerificationError } from '@domain/utils/shared/type-verification';

/**
 * Brain model type verification utilities
 */
export class BrainTypeVerifier {
  /**
   * Verify that a value is a valid Vector3
   */
  verifyVector3(obj: unknown, field?: string): Result<Vector3, TypeVerificationError> { // Added error type
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<Vector3, TypeVerificationError>; // Added error type
    }

    const object = objResult.value;
    const xResult = typeVerifier.verifyNumber(object.x, field ? `${field}.x` : 'x');
    const yResult = typeVerifier.verifyNumber(object.y, field ? `${field}.y` : 'y');
    const zResult = typeVerifier.verifyNumber(object.z, field ? `${field}.z` : 'z');

    if (!xResult.success) return xResult as Result<Vector3, TypeVerificationError>; // Added error type
    if (!yResult.success) return yResult as Result<Vector3, TypeVerificationError>; // Added error type
    if (!zResult.success) return zResult as Result<Vector3, TypeVerificationError>; // Added error type

    return {
      success: true,
      value: {
        x: xResult.value,
        y: yResult.value,
        z: zResult.value,
      },
    };
  }

  /**
   * Safely converts a value to a Vector3
   */
  safelyParseVector3(value: unknown, fallback: Vector3 = { x: 0, y: 0, z: 0 }): Vector3 {
    if (typeof value !== 'object' || value === null) {
      return fallback;
    }

    const obj = value as Record<string, unknown>;

    return {
      x: typeVerifier.safelyParseNumber(obj.x, fallback.x),
      y: typeVerifier.safelyParseNumber(obj.y, fallback.y),
      z: typeVerifier.safelyParseNumber(obj.z, fallback.z),
    };
  }

  /**
   * Verify that a value is a valid RenderMode enum value
   */
  verifyRenderMode(mode: unknown, field?: string): Result<RenderMode, TypeVerificationError> { // Added error type
    const validModes = Object.values(RenderMode);

    if (typeof mode === 'string' && validModes.includes(mode as RenderMode)) {
      return {
        success: true,
        value: mode as RenderMode,
      };
    }

    return {
      success: false,
      error: new TypeVerificationError(
        `Invalid RenderMode`,
        `one of [${validModes.join(', ')}]`,
        typeof mode === 'object'
          ? mode === null
            ? 'null'
            : Array.isArray(mode)
              ? 'array'
              : 'object'
          : typeof mode,
        field
      ),
    };
  }

  /**
   * Verify that an object conforms to the BrainRegion interface
   */
  verifyBrainRegion(obj: unknown, field?: string): Result<BrainRegion, TypeVerificationError> { // Added error type
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<BrainRegion, TypeVerificationError>; // Added error type
    }

    const object = objResult.value;

    // Verify required properties
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<BrainRegion, TypeVerificationError>; // Added error type

    const nameResult = typeVerifier.verifyString(object.name, field ? `${field}.name` : 'name');
    if (!nameResult.success) return nameResult as Result<BrainRegion, TypeVerificationError>; // Added error type

    const positionResult = this.verifyVector3(
      object.position,
      field ? `${field}.position` : 'position'
    );
    if (!positionResult.success) return positionResult as Result<BrainRegion, TypeVerificationError>; // Added error type

    const colorResult = typeVerifier.verifyString(object.color, field ? `${field}.color` : 'color');
    if (!colorResult.success) return colorResult as Result<BrainRegion, TypeVerificationError>; // Added error type

    const isActiveResult = typeVerifier.verifyBoolean(
      object.isActive,
      field ? `${field}.isActive` : 'isActive'
    );
    if (!isActiveResult.success) return isActiveResult as Result<BrainRegion, TypeVerificationError>; // Added error type

    const activityLevelResult = typeVerifier.verifyNumber(
      object.activityLevel,
      field ? `${field}.activityLevel` : 'activityLevel'
    );
    if (!activityLevelResult.success) return activityLevelResult as Result<BrainRegion, TypeVerificationError>; // Added error type

    // Optional properties
    const volumeMl =
      object.volumeMl !== undefined
        ? typeVerifier.safelyParseNumber(object.volumeMl, 0)
        : undefined;

    const riskFactor =
      object.riskFactor !== undefined
        ? typeVerifier.safelyParseNumber(object.riskFactor, 0)
        : undefined;

    // Return verified brain region
    return {
      success: true,
      value: {
        id: idResult.value,
        name: nameResult.value,
        position: positionResult.value,
        color: colorResult.value,
        connections: Array.isArray(object.connections) ? object.connections.map(String) : [], // Use standard array check
        isActive: isActiveResult.value,
        activityLevel: activityLevelResult.value,
        volumeMl,
        riskFactor,
      },
    };
  }

  /**
   * Verify that an object conforms to the NeuralConnection interface
   */
  verifyNeuralConnection(obj: unknown, field?: string): Result<NeuralConnection, TypeVerificationError> { // Added error type
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<NeuralConnection, TypeVerificationError>; // Added error type
    }

    const object = objResult.value;

    // Verify required properties
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<NeuralConnection, TypeVerificationError>; // Added error type

    const sourceRegionIdResult = typeVerifier.verifyString(
      object.sourceRegionId,
      field ? `${field}.sourceRegionId` : 'sourceRegionId'
    );
    if (!sourceRegionIdResult.success) return sourceRegionIdResult as Result<NeuralConnection, TypeVerificationError>; // Added error type

    const targetRegionIdResult = typeVerifier.verifyString(
      object.targetRegionId,
      field ? `${field}.targetRegionId` : 'targetRegionId'
    );
    if (!targetRegionIdResult.success) return targetRegionIdResult as Result<NeuralConnection, TypeVerificationError>; // Added error type

    const strengthResult = typeVerifier.verifyNumber(
      object.strength,
      field ? `${field}.strength` : 'strength'
    );
    if (!strengthResult.success) return strengthResult as Result<NeuralConnection, TypeVerificationError>; // Added error type

    const isActiveResult = typeVerifier.verifyBoolean(
      object.isActive,
      field ? `${field}.isActive` : 'isActive'
    );
    if (!isActiveResult.success) return isActiveResult as Result<NeuralConnection, TypeVerificationError>; // Added error type

    // Verify 'type' property
    const typeResult = typeVerifier.verifyString(object.type, field ? `${field}.type` : 'type');
    if (!typeResult.success) return typeResult as Result<NeuralConnection, TypeVerificationError>;
    // Optional: Add stricter validation if 'type' should be specific literals like 'excitatory' | 'inhibitory'
    // const validTypes = ['excitatory', 'inhibitory'];
    // if (!validTypes.includes(typeResult.value)) {
    //   return { success: false, error: new TypeVerificationError(...) };
    // }

    // Optional properties
    const connectionType =
      object.connectionType !== undefined
        ? typeVerifier.safelyParseString(object.connectionType, '')
        : undefined;

    const color =
      object.color !== undefined ? typeVerifier.safelyParseString(object.color, '') : undefined;

    // Return verified neural connection
    return {
      success: true,
      value: {
        id: idResult.value,
        sourceId: sourceRegionIdResult.value, // Correct property name
        targetId: targetRegionIdResult.value, // Correct property name
        strength: strengthResult.value,
        isActive: isActiveResult.value,
        type: typeResult.value, // Add verified type property
        connectionType,
        color,
      },
    };
  }

  /**
   * Verify that an object conforms to the BrainModel interface
   */
  verifyBrainModel(obj: unknown, field?: string): Result<BrainModel, TypeVerificationError> { // Added error type
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<BrainModel, TypeVerificationError>; // Added error type
    }

    const object = objResult.value;

    // Verify required properties
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<BrainModel, TypeVerificationError>; // Added error type

    const nameResult = typeVerifier.verifyString(object.name, field ? `${field}.name` : 'name');
    if (!nameResult.success) return nameResult as Result<BrainModel, TypeVerificationError>; // Added error type

    // Verify regions array
    const regionsResult = typeVerifier.verifyArray(
      object.regions,
      (region, index) =>
        this.verifyBrainRegion(region, field ? `${field}.regions[${index}]` : `regions[${index}]`),
      field ? `${field}.regions` : 'regions'
    );
    if (!regionsResult.success) return regionsResult as Result<BrainModel, TypeVerificationError>; // Added error type

    // Verify connections array
    const connectionsResult = typeVerifier.verifyArray(
      object.connections,
      (connection, index) =>
        this.verifyNeuralConnection(
          connection,
          field ? `${field}.connections[${index}]` : `connections[${index}]`
        ),
      field ? `${field}.connections` : 'connections'
    );
    if (!connectionsResult.success) return connectionsResult as Result<BrainModel, TypeVerificationError>; // Added error type

    // Verify version
    const versionResult = typeVerifier.verifyNumber(
      object.version,
      field ? `${field}.version` : 'version'
    );
    if (!versionResult.success) return versionResult as Result<BrainModel, TypeVerificationError>; // Added error type

    // Optional properties
    const patientId =
      object.patientId !== undefined
        ? typeVerifier.safelyParseString(object.patientId, '')
        : undefined;

    const scanDate =
      object.scanDate !== undefined
        ? new Date(typeVerifier.safelyParseString(object.scanDate, ''))
        : undefined;

    const modelType =
      object.modelType !== undefined
        ? typeVerifier.safelyParseString(object.modelType, '')
        : undefined;

    const isTemplate =
      object.isTemplate !== undefined
        ? typeVerifier.safelyParseBoolean(object.isTemplate, false)
        : undefined;

    const metadata =
      object.metadata !== undefined && typeof object.metadata === 'object'
        ? (object.metadata as Record<string, unknown>)
        : undefined;

    // Return verified brain model
    return {
      success: true,
      value: {
        id: idResult.value,
        name: nameResult.value,
        regions: regionsResult.value,
        connections: connectionsResult.value,
        version: versionResult.value,
        patientId,
        scanDate,
        modelType,
        isTemplate,
        metadata,
      },
    };
  }

  /**
   * Assert that a value is a valid Vector3
   */
  assertVector3(value: unknown, field?: string): asserts value is Vector3 {
    const result = this.verifyVector3(value, field);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Assert that a value is a valid RenderMode
   */
  assertRenderMode(value: unknown, field?: string): asserts value is RenderMode {
    const result = this.verifyRenderMode(value, field);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Assert that an object is a BrainRegion
   */
  assertBrainRegion(value: unknown, field?: string): asserts value is BrainRegion {
    const result = this.verifyBrainRegion(value, field);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Assert that an object is a NeuralConnection
   */
  assertNeuralConnection(value: unknown, field?: string): asserts value is NeuralConnection {
    const result = this.verifyNeuralConnection(value, field);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Assert that an object is a BrainModel
   */
  assertBrainModel(value: unknown, field?: string): asserts value is BrainModel {
    const result = this.verifyBrainModel(value, field);
    if (!result.success) {
      throw result.error;
    }
  }
}

// Export singleton instance for easy usage
export const brainTypeVerifier = new BrainTypeVerifier();

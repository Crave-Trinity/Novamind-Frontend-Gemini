/**
 * NOVAMIND Neural-Safe Type Verification
 * Brain-specific type verification utilities with quantum-level precision
 */

import type { BrainModel, BrainRegion, NeuralConnection, BrainScan } from '@domain/types/brain/models'; // SSoT Import
import { RenderMode } from '@domain/types/brain/visualization';
import type { Vector3, Result } from '@domain/types/shared/common';
import { typeVerifier, TypeVerificationError } from '@domain/utils/shared/type-verification';

// --- Helper Methods for Optional Properties ---
// Added directly to this class for simplicity, avoiding module augmentation issues.
// These should ideally be in the base TypeVerifier, but adding here for now.

function verifyOptionalString(value: unknown, field?: string): Result<string | undefined, TypeVerificationError> {
  if (value === undefined || value === null) {
    return { success: true, value: undefined };
  }
  // Use base verifier for the actual check
  return typeVerifier.verifyString(value, field);
}

function verifyOptionalNumber(value: unknown, field?: string): Result<number | undefined, TypeVerificationError> {
  if (value === undefined || value === null) {
    return { success: true, value: undefined };
  }
  // Use base verifier for the actual check
  return typeVerifier.verifyNumber(value, field);
}

function verifyOptionalBoolean(value: unknown, field?: string): Result<boolean | undefined, TypeVerificationError> {
   if (value === undefined || value === null) {
     return { success: true, value: undefined };
   }
   // Use base verifier for the actual check
   return typeVerifier.verifyBoolean(value, field);
 }

function verifyOptionalEnum<T extends string>(value: unknown, allowedValues: readonly T[], field?: string): Result<T | undefined, TypeVerificationError> {
    if (value === undefined || value === null) {
      return { success: true, value: undefined };
    }
    // Use base verifier for the actual check
    return typeVerifier.verifyEnum(value, allowedValues, field);
  }


/**
 * Brain model type verification utilities
 */
export class BrainTypeVerifier {

  /**
   * Verify that a value is a valid Vector3
   */
  verifyVector3(obj: unknown, field?: string): Result<Vector3, TypeVerificationError> {
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<Vector3, TypeVerificationError>;
    }

    const object = objResult.value;
    const xResult = typeVerifier.verifyNumber(object.x, field ? `${field}.x` : 'x');
    const yResult = typeVerifier.verifyNumber(object.y, field ? `${field}.y` : 'y');
    const zResult = typeVerifier.verifyNumber(object.z, field ? `${field}.z` : 'z');

    if (!xResult.success) return xResult as Result<Vector3, TypeVerificationError>;
    if (!yResult.success) return yResult as Result<Vector3, TypeVerificationError>;
    if (!zResult.success) return zResult as Result<Vector3, TypeVerificationError>;

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
  verifyRenderMode(mode: unknown, field?: string): Result<RenderMode, TypeVerificationError> {
    const validModes = Object.values(RenderMode);
    return typeVerifier.verifyEnum(mode, validModes, field);
  }

  /**
   * Verify that an object conforms to the BrainRegion interface (from SSoT)
   */
  verifyBrainRegion(obj: unknown, field?: string): Result<BrainRegion, TypeVerificationError> {
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<BrainRegion, TypeVerificationError>;
    }
    const object = objResult.value;

    // Verify required properties based on @domain/types/brain/models BrainRegion
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<BrainRegion, TypeVerificationError>;

    const nameResult = typeVerifier.verifyString(object.name, field ? `${field}.name` : 'name');
    if (!nameResult.success) return nameResult as Result<BrainRegion, TypeVerificationError>;

    const positionResult = this.verifyVector3(object.position, field ? `${field}.position` : 'position');
    if (!positionResult.success) return positionResult as Result<BrainRegion, TypeVerificationError>;

    const colorResult = typeVerifier.verifyString(object.color, field ? `${field}.color` : 'color');
    if (!colorResult.success) return colorResult as Result<BrainRegion, TypeVerificationError>;

    const connectionsResult = typeVerifier.verifyArray(object.connections, (item, i) => typeVerifier.verifyString(item, `${field}.connections[${i}]`), field ? `${field}.connections` : 'connections');
    if (!connectionsResult.success) return connectionsResult as Result<BrainRegion, TypeVerificationError>;

    const hemisphereLocationResult = typeVerifier.verifyEnum(object.hemisphereLocation, ['left', 'right', 'central'] as const, field ? `${field}.hemisphereLocation` : 'hemisphereLocation');
    if (!hemisphereLocationResult.success) return hemisphereLocationResult as Result<BrainRegion, TypeVerificationError>;

    const dataConfidenceResult = typeVerifier.verifyNumber(object.dataConfidence, field ? `${field}.dataConfidence` : 'dataConfidence');
    if (!dataConfidenceResult.success) return dataConfidenceResult as Result<BrainRegion, TypeVerificationError>;
    if (dataConfidenceResult.value < 0 || dataConfidenceResult.value > 1) {
      return { success: false, error: new TypeVerificationError('Expected dataConfidence between 0 and 1', 'number (0-1)', String(dataConfidenceResult.value), field ? `${field}.dataConfidence` : 'dataConfidence') };
    }

    const activityLevelResult = typeVerifier.verifyNumber(object.activityLevel, field ? `${field}.activityLevel` : 'activityLevel');
    if (!activityLevelResult.success) return activityLevelResult as Result<BrainRegion, TypeVerificationError>;
    if (activityLevelResult.value < 0 || activityLevelResult.value > 1) {
      return { success: false, error: new TypeVerificationError('Expected activityLevel between 0 and 1', 'number (0-1)', String(activityLevelResult.value), field ? `${field}.activityLevel` : 'activityLevel') };
    }

    const isActiveResult = typeVerifier.verifyBoolean(object.isActive, field ? `${field}.isActive` : 'isActive');
    if (!isActiveResult.success) return isActiveResult as Result<BrainRegion, TypeVerificationError>;

    const volumeResult = typeVerifier.verifyNumber(object.volume, field ? `${field}.volume` : 'volume');
    if (!volumeResult.success) return volumeResult as Result<BrainRegion, TypeVerificationError>;
    if (volumeResult.value < 0) return { success: false, error: new TypeVerificationError('Expected volume >= 0', 'number', String(volumeResult.value), field ? `${field}.volume` : 'volume') };

    const activityResult = typeVerifier.verifyNumber(object.activity, field ? `${field}.activity` : 'activity');
    if (!activityResult.success) return activityResult as Result<BrainRegion, TypeVerificationError>;
    if (activityResult.value < 0 || activityResult.value > 1) {
      return { success: false, error: new TypeVerificationError('Expected activity between 0 and 1', 'number (0-1)', String(activityResult.value), field ? `${field}.activity` : 'activity') };
    }

    // Optional properties from BrainRegion type
    const volumeMlResult = verifyOptionalNumber(object.volumeMl, field ? `${field}.volumeMl` : 'volumeMl');
    if (!volumeMlResult.success) return volumeMlResult as Result<BrainRegion, TypeVerificationError>;
    const riskFactorResult = verifyOptionalNumber(object.riskFactor, field ? `${field}.riskFactor` : 'riskFactor');
    if (!riskFactorResult.success) return riskFactorResult as Result<BrainRegion, TypeVerificationError>;
    // Check range for optional riskFactor if present
    if (riskFactorResult.value !== undefined && (riskFactorResult.value < 0 || riskFactorResult.value > 1)) {
         return { success: false, error: new TypeVerificationError('Expected optional riskFactor between 0 and 1', 'number (0-1)', String(riskFactorResult.value), field ? `${field}.riskFactor` : 'riskFactor') };
    }
    const clinicalSignificanceResult = verifyOptionalString(object.clinicalSignificance, field ? `${field}.clinicalSignificance` : 'clinicalSignificance');
    if (!clinicalSignificanceResult.success) return clinicalSignificanceResult as Result<BrainRegion, TypeVerificationError>;
    const tissueTypeResult = verifyOptionalEnum(object.tissueType, ['gray', 'white'] as const, field ? `${field}.tissueType` : 'tissueType');
    if (!tissueTypeResult.success) return tissueTypeResult as Result<BrainRegion, TypeVerificationError>;


    // Return verified brain region
    return {
      success: true,
      value: {
        id: idResult.value,
        name: nameResult.value,
        position: positionResult.value,
        color: colorResult.value,
        connections: connectionsResult.value,
        hemisphereLocation: hemisphereLocationResult.value,
        dataConfidence: dataConfidenceResult.value,
        activityLevel: activityLevelResult.value,
        isActive: isActiveResult.value,
        volume: volumeResult.value,
        activity: activityResult.value,
        volumeMl: volumeMlResult.value,
        riskFactor: riskFactorResult.value,
        clinicalSignificance: clinicalSignificanceResult.value,
        tissueType: tissueTypeResult.value,
      },
    };
  }

  /**
   * Verify that an object conforms to the NeuralConnection interface (from SSoT)
   */
  verifyNeuralConnection(obj: unknown, field?: string): Result<NeuralConnection, TypeVerificationError> {
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<NeuralConnection, TypeVerificationError>;
    }
    const object = objResult.value;

    // Verify required properties based on @domain/types/brain/models NeuralConnection
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<NeuralConnection, TypeVerificationError>;

    const sourceIdResult = typeVerifier.verifyString(object.sourceId, field ? `${field}.sourceId` : 'sourceId');
    if (!sourceIdResult.success) return sourceIdResult as Result<NeuralConnection, TypeVerificationError>;

    const targetIdResult = typeVerifier.verifyString(object.targetId, field ? `${field}.targetId` : 'targetId');
    if (!targetIdResult.success) return targetIdResult as Result<NeuralConnection, TypeVerificationError>;

    const strengthResult = typeVerifier.verifyNumber(object.strength, field ? `${field}.strength` : 'strength');
    if (!strengthResult.success) return strengthResult as Result<NeuralConnection, TypeVerificationError>;
    if (strengthResult.value < 0 || strengthResult.value > 1) {
      return { success: false, error: new TypeVerificationError('Expected strength between 0 and 1', 'number (0-1)', String(strengthResult.value), field ? `${field}.strength` : 'strength') };
    }

    const typeEnumResult = typeVerifier.verifyEnum(object.type, ['excitatory', 'inhibitory'] as const, field ? `${field}.type` : 'type');
    if (!typeEnumResult.success) return typeEnumResult as Result<NeuralConnection, TypeVerificationError>;

    const directionalityResult = typeVerifier.verifyEnum(object.directionality, ['unidirectional', 'bidirectional'] as const, field ? `${field}.directionality` : 'directionality');
    if (!directionalityResult.success) return directionalityResult as Result<NeuralConnection, TypeVerificationError>;

    const activityLevelResult = typeVerifier.verifyNumber(object.activityLevel, field ? `${field}.activityLevel` : 'activityLevel');
    if (!activityLevelResult.success) return activityLevelResult as Result<NeuralConnection, TypeVerificationError>;
    if (activityLevelResult.value < 0 || activityLevelResult.value > 1) {
      return { success: false, error: new TypeVerificationError('Expected activityLevel between 0 and 1', 'number (0-1)', String(activityLevelResult.value), field ? `${field}.activityLevel` : 'activityLevel') };
    }

    const dataConfidenceResult = typeVerifier.verifyNumber(object.dataConfidence, field ? `${field}.dataConfidence` : 'dataConfidence');
    if (!dataConfidenceResult.success) return dataConfidenceResult as Result<NeuralConnection, TypeVerificationError>;
    if (dataConfidenceResult.value < 0 || dataConfidenceResult.value > 1) {
      return { success: false, error: new TypeVerificationError('Expected dataConfidence between 0 and 1', 'number (0-1)', String(dataConfidenceResult.value), field ? `${field}.dataConfidence` : 'dataConfidence') };
    }

    // Optional properties
    const pathwayLengthResult = verifyOptionalNumber(object.pathwayLength, field ? `${field}.pathwayLength` : 'pathwayLength');
    if (!pathwayLengthResult.success) return pathwayLengthResult as Result<NeuralConnection, TypeVerificationError>;

    // Return verified neural connection
    return {
      success: true,
      value: {
        id: idResult.value,
        sourceId: sourceIdResult.value,
        targetId: targetIdResult.value,
        strength: strengthResult.value,
        type: typeEnumResult.value,
        directionality: directionalityResult.value,
        activityLevel: activityLevelResult.value,
        dataConfidence: dataConfidenceResult.value,
        pathwayLength: pathwayLengthResult.value,
      },
    };
  }

  /**
   * Verify that an object conforms to the BrainScan interface (from SSoT)
   */
   verifyBrainScan(obj: unknown, field?: string): Result<BrainScan, TypeVerificationError> {
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<BrainScan, TypeVerificationError>;
    }
    const object = objResult.value;

    // Verify required properties
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<BrainScan, TypeVerificationError>;

    const patientIdResult = typeVerifier.verifyString(object.patientId, field ? `${field}.patientId` : 'patientId');
    if (!patientIdResult.success) return patientIdResult as Result<BrainScan, TypeVerificationError>;

    const scanDateResult = typeVerifier.verifyString(object.scanDate, field ? `${field}.scanDate` : 'scanDate');
    if (!scanDateResult.success) return scanDateResult as Result<BrainScan, TypeVerificationError>;
    // TODO: Add ISO date format validation if needed

    const scanTypeResult = typeVerifier.verifyEnum(object.scanType, ['fMRI', 'MRI', 'CT', 'PET'] as const, field ? `${field}.scanType` : 'scanType');
    if (!scanTypeResult.success) return scanTypeResult as Result<BrainScan, TypeVerificationError>;

    const resolutionResult = this.verifyVector3(object.resolution, field ? `${field}.resolution` : 'resolution');
    if (!resolutionResult.success) return resolutionResult as Result<BrainScan, TypeVerificationError>;

    const metadataResult = typeVerifier.verifyObject(object.metadata, field ? `${field}.metadata` : 'metadata');
    if (!metadataResult.success) return metadataResult as Result<BrainScan, TypeVerificationError>;

    const dataQualityScoreResult = typeVerifier.verifyNumber(object.dataQualityScore, field ? `${field}.dataQualityScore` : 'dataQualityScore');
    if (!dataQualityScoreResult.success) return dataQualityScoreResult as Result<BrainScan, TypeVerificationError>;
    if (dataQualityScoreResult.value < 0 || dataQualityScoreResult.value > 1) {
      return { success: false, error: new TypeVerificationError('Expected dataQualityScore between 0 and 1', 'number (0-1)', String(dataQualityScoreResult.value), field ? `${field}.dataQualityScore` : 'dataQualityScore') };
    }

    // Optional properties - Safe access
    const scannerModelResult = verifyOptionalString(object.scannerModel, field ? `${field}.scannerModel` : 'scannerModel');
    const contrastAgentResult = verifyOptionalBoolean(object.contrastAgent, field ? `${field}.contrastAgent` : 'contrastAgent');
    const notesResult = verifyOptionalString(object.notes, field ? `${field}.notes` : 'notes');
    const technicianResult = verifyOptionalString(object.technician, field ? `${field}.technician` : 'technician');
    const processingMethodResult = verifyOptionalString(object.processingMethod, field ? `${field}.processingMethod` : 'processingMethod');

    // Check success before accessing value for optional fields
    if (!scannerModelResult.success) return scannerModelResult as Result<BrainScan, TypeVerificationError>;
    if (!contrastAgentResult.success) return contrastAgentResult as Result<BrainScan, TypeVerificationError>;
    if (!notesResult.success) return notesResult as Result<BrainScan, TypeVerificationError>;
    if (!technicianResult.success) return technicianResult as Result<BrainScan, TypeVerificationError>;
    if (!processingMethodResult.success) return processingMethodResult as Result<BrainScan, TypeVerificationError>;

    return {
      success: true,
      value: {
        id: idResult.value,
        patientId: patientIdResult.value,
        scanDate: scanDateResult.value,
        scanType: scanTypeResult.value,
        resolution: resolutionResult.value,
        metadata: metadataResult.value,
        dataQualityScore: dataQualityScoreResult.value,
        scannerModel: scannerModelResult.value,
        contrastAgent: contrastAgentResult.value,
        notes: notesResult.value,
        technician: technicianResult.value,
        processingMethod: processingMethodResult.value,
      },
    };
  } // End of verifyBrainScan method


  /**
   * Verify that an object conforms to the BrainModel interface (from SSoT)
   */
  verifyBrainModel(obj: unknown, field?: string): Result<BrainModel, TypeVerificationError> {
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<BrainModel, TypeVerificationError>;
    }
    const object = objResult.value;

    // Verify required properties based on @domain/types/brain/models BrainModel
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<BrainModel, TypeVerificationError>;

    // Verify regions array
    const regionsResult = typeVerifier.verifyArray(
      object.regions,
      (region, index) =>
        this.verifyBrainRegion(region, field ? `${field}.regions[${index}]` : `regions[${index}]`),
      field ? `${field}.regions` : 'regions'
    );
    if (!regionsResult.success) return regionsResult as Result<BrainModel, TypeVerificationError>;

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
    if (!connectionsResult.success) return connectionsResult as Result<BrainModel, TypeVerificationError>;

    // Verify version (string)
    const versionResult = typeVerifier.verifyString(object.version, field ? `${field}.version` : 'version');
    if (!versionResult.success) return versionResult as Result<BrainModel, TypeVerificationError>;

    // Verify other required fields from @domain/types/brain/models BrainModel
    const patientIdResult = typeVerifier.verifyString(object.patientId, field ? `${field}.patientId` : 'patientId');
    if (!patientIdResult.success) return patientIdResult as Result<BrainModel, TypeVerificationError>;

    const timestampResult = typeVerifier.verifyString(object.timestamp, field ? `${field}.timestamp` : 'timestamp');
    if (!timestampResult.success) return timestampResult as Result<BrainModel, TypeVerificationError>;
    // TODO: Add ISO date format validation if needed

    const processingLevelResult = typeVerifier.verifyEnum(object.processingLevel, ['raw', 'filtered', 'normalized', 'analyzed'] as const, field ? `${field}.processingLevel` : 'processingLevel');
    if (!processingLevelResult.success) return processingLevelResult as Result<BrainModel, TypeVerificationError>;

    const lastUpdatedResult = typeVerifier.verifyString(object.lastUpdated, field ? `${field}.lastUpdated` : 'lastUpdated');
    if (!lastUpdatedResult.success) return lastUpdatedResult as Result<BrainModel, TypeVerificationError>;
    // TODO: Add ISO date format validation if needed

    // Verify scan object (deeper validation)
    const scanResult = this.verifyBrainScan(object.scan, field ? `${field}.scan` : 'scan');
    if (!scanResult.success) return scanResult as Result<BrainModel, TypeVerificationError>;

    // Optional properties
    const algorithmVersionResult = verifyOptionalString(object.algorithmVersion, field ? `${field}.algorithmVersion` : 'algorithmVersion');
     if (!algorithmVersionResult.success) return algorithmVersionResult as Result<BrainModel, TypeVerificationError>;

    // Return verified brain model
    return {
      success: true,
      value: {
        id: idResult.value,
        regions: regionsResult.value,
        connections: connectionsResult.value,
        version: versionResult.value,
        patientId: patientIdResult.value,
        scan: scanResult.value,
        timestamp: timestampResult.value,
        processingLevel: processingLevelResult.value,
        lastUpdated: lastUpdatedResult.value,
        algorithmVersion: algorithmVersionResult.value,
      },
    };
  } // End of verifyBrainModel method


  // --- Assertion Methods ---

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
    * Assert that an object is a BrainScan
    */
   assertBrainScan(value: unknown, field?: string): asserts value is BrainScan {
     const result = this.verifyBrainScan(value, field);
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
} // End of BrainTypeVerifier class

// Export singleton instance for easy usage
export const brainTypeVerifier = new BrainTypeVerifier();

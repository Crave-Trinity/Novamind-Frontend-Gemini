/**
 * NOVAMIND Neural-Safe Application Service
 * BrainModelService Runtime Validation - Quantum-level runtime validation
 * with clinical precision and mathematical integrity
 */

import type { BrainModel, BrainRegion, NeuralConnection, BrainScan } from '@/domain/types/brain/models'; // Correct import path
import type { Vector3 } from '@/domain/types/shared/common'; // Import Vector3 from shared
import { type Result, success, failure } from '@/domain/types/shared/common';

// Extend Error properly to match the expected type
export class ValidationError extends Error { // Ensure this is exported
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// --- Helper Validation Functions (Local to this file, NOT exported) ---

function validateVector3(obj: unknown, field?: string): Result<Vector3, ValidationError> {
    if (!obj || typeof obj !== 'object') {
        return failure(new ValidationError(`Expected type 'object' for Vector3`, field));
    }
    const vec = obj as Partial<Vector3>;
    if (typeof vec.x !== 'number') return failure(new ValidationError(`Expected type 'number' for x`, field ? `${field}.x` : 'x'));
    if (typeof vec.y !== 'number') return failure(new ValidationError(`Expected type 'number' for y`, field ? `${field}.y` : 'y'));
    if (typeof vec.z !== 'number') return failure(new ValidationError(`Expected type 'number' for z`, field ? `${field}.z` : 'z'));
    // Ensure we return a Vector3 matching the imported type
    return success({ x: vec.x, y: vec.y, z: vec.z });
}


function validateBrainScan(obj: unknown, field?: string): Result<BrainScan, ValidationError> {
    if (!obj || typeof obj !== 'object') {
        return failure(new ValidationError(`Expected type 'object' for BrainScan`, field));
    }
    const scan = obj as Partial<BrainScan>;

    if (typeof scan.id !== 'string') return failure(new ValidationError(`Expected type 'string' for id`, field ? `${field}.id` : 'id'));
    if (typeof scan.patientId !== 'string') return failure(new ValidationError(`Expected type 'string' for patientId`, field ? `${field}.patientId` : 'patientId'));
    if (typeof scan.scanDate !== 'string') return failure(new ValidationError(`Expected type 'string' for scanDate`, field ? `${field}.scanDate` : 'scanDate'));
     // TODO: Add ISO date format validation if needed

    const validScanTypes = ['fMRI', 'MRI', 'CT', 'PET'] as const;
    if (typeof scan.scanType !== 'string' || !validScanTypes.includes(scan.scanType as any)) {
        return failure(new ValidationError(`Expected scanType to be one of [${validScanTypes.join(', ')}]`, field ? `${field}.scanType` : 'scanType'));
    }

    const resolutionResult = validateVector3(scan.resolution, field ? `${field}.resolution` : 'resolution');
    if (!resolutionResult.success) return failure(resolutionResult.error);

    if (typeof scan.metadata !== 'object' || scan.metadata === null) return failure(new ValidationError(`Expected type 'object' for metadata`, field ? `${field}.metadata` : 'metadata'));

    if (typeof scan.dataQualityScore !== 'number' || scan.dataQualityScore < 0 || scan.dataQualityScore > 1) {
        return failure(new ValidationError(`Expected dataQualityScore between 0 and 1`, field ? `${field}.dataQualityScore` : 'dataQualityScore'));
    }

    // Optional fields - Check type only if present
    if (scan.scannerModel !== undefined && typeof scan.scannerModel !== 'string') return failure(new ValidationError(`Expected type 'string' for optional scannerModel`, field ? `${field}.scannerModel` : 'scannerModel'));
    if (scan.contrastAgent !== undefined && typeof scan.contrastAgent !== 'boolean') return failure(new ValidationError(`Expected type 'boolean' for optional contrastAgent`, field ? `${field}.contrastAgent` : 'contrastAgent'));
    if (scan.notes !== undefined && typeof scan.notes !== 'string') return failure(new ValidationError(`Expected type 'string' for optional notes`, field ? `${field}.notes` : 'notes'));
    if (scan.technician !== undefined && typeof scan.technician !== 'string') return failure(new ValidationError(`Expected type 'string' for optional technician`, field ? `${field}.technician` : 'technician'));
    if (scan.processingMethod !== undefined && typeof scan.processingMethod !== 'string') return failure(new ValidationError(`Expected type 'string' for optional processingMethod`, field ? `${field}.processingMethod` : 'processingMethod'));


    // Cast to BrainScan only after all checks pass
    const validatedScan: BrainScan = {
        id: scan.id,
        patientId: scan.patientId,
        scanDate: scan.scanDate,
        scanType: scan.scanType as 'fMRI' | 'MRI' | 'CT' | 'PET', // Cast after validation
        resolution: resolutionResult.value,
        metadata: scan.metadata as Record<string, unknown>, // Cast after validation
        dataQualityScore: scan.dataQualityScore,
        // Optional fields might be undefined, which is allowed by the BrainScan type
        scannerModel: scan.scannerModel,
        contrastAgent: scan.contrastAgent,
        notes: scan.notes,
        technician: scan.technician,
        processingMethod: scan.processingMethod,
    };
    return success(validatedScan);
}


// --- Exported Validation Functions ---

/**
 * Runtime validation for BrainModel objects (quick check)
 */
export function isBrainModel(obj: unknown): obj is BrainModel { // Ensure export
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  const model = obj as Partial<BrainModel>;

  // Validate against the actual BrainModel type properties from SSoT
  return (
    typeof model.id === 'string' &&
    Array.isArray(model.regions) &&
    Array.isArray(model.connections) &&
    typeof model.version === 'string' &&
    typeof model.patientId === 'string' &&
    typeof model.scan === 'object' && model.scan !== null && // Basic scan check
    typeof model.timestamp === 'string' &&
    typeof model.processingLevel === 'string' && // Basic check
    typeof model.lastUpdated === 'string'
    // Deeper validation happens in validateBrainModel
  );
}

/**
 * Validates a BrainModel with detailed error reporting
 */
export function validateBrainModel(obj: unknown, field?: string): Result<BrainModel, ValidationError> { // Ensure export
  if (!obj || typeof obj !== 'object') {
    return failure(new ValidationError(`Invalid BrainModel: Expected object`, field));
  }

  const model = obj as Partial<BrainModel>;

  // Validate required string fields
  if (typeof model.id !== 'string') return failure(new ValidationError(`Expected type 'string' for id`, field ? `${field}.id` : 'id'));
  if (typeof model.version !== 'string') return failure(new ValidationError(`Expected type 'string' for version`, field ? `${field}.version` : 'version'));
  if (typeof model.patientId !== 'string') return failure(new ValidationError(`Expected type 'string' for patientId`, field ? `${field}.patientId` : 'patientId'));
  if (typeof model.timestamp !== 'string') return failure(new ValidationError(`Expected type 'string' for timestamp`, field ? `${field}.timestamp` : 'timestamp'));
  if (typeof model.lastUpdated !== 'string') return failure(new ValidationError(`Expected type 'string' for lastUpdated`, field ? `${field}.lastUpdated` : 'lastUpdated'));

   // Validate processingLevel enum
   const validProcessingLevels = ['raw', 'filtered', 'normalized', 'analyzed'] as const;
   if (typeof model.processingLevel !== 'string' || !validProcessingLevels.includes(model.processingLevel as any)) {
     return failure(new ValidationError(`Expected processingLevel to be one of [${validProcessingLevels.join(', ')}]`, field ? `${field}.processingLevel` : 'processingLevel'));
   }

  // Validate arrays
  if (!Array.isArray(model.regions)) return failure(new ValidationError(`Expected type 'Array<BrainRegion>' for regions`, field ? `${field}.regions` : 'regions'));
  if (!Array.isArray(model.connections)) return failure(new ValidationError(`Expected type 'Array<NeuralConnection>' for connections`, field ? `${field}.connections` : 'connections'));

  // Validate nested regions
  for (let i = 0; i < model.regions.length; i++) {
    const regionField = field ? `${field}.regions[${i}]` : `regions[${i}]`;
    const regionResult = validateBrainRegion(model.regions[i], regionField); // Use exported function
    if (!regionResult.success) return failure(regionResult.error); // Propagate error
  }

  // Validate nested connections
  for (let i = 0; i < model.connections.length; i++) {
    const connectionField = field ? `${field}.connections[${i}]` : `connections[${i}]`;
    const connectionResult = validateNeuralConnection(model.connections[i], connectionField); // Use exported function
    if (!connectionResult.success) return failure(connectionResult.error); // Propagate error
  }

   // Use full validation for scan object
   const scanResult = validateBrainScan(model.scan, field ? `${field}.scan` : 'scan'); // Use local helper
   if (!scanResult.success) return failure(scanResult.error); // Propagate error

   // Optional fields
   if (model.algorithmVersion !== undefined && typeof model.algorithmVersion !== 'string') {
       return failure(new ValidationError(`Expected type 'string' for optional algorithmVersion`, field ? `${field}.algorithmVersion` : 'algorithmVersion'));
   }

  // Cast to BrainModel only after all checks pass
   const validatedModel: BrainModel = {
       id: model.id,
       patientId: model.patientId,
       regions: model.regions as BrainRegion[], // Already validated
       connections: model.connections as NeuralConnection[], // Already validated
       scan: scanResult.value, // Use validated scan object
       timestamp: model.timestamp,
       version: model.version,
       processingLevel: model.processingLevel as 'raw' | 'filtered' | 'normalized' | 'analyzed', // Cast after validation
       lastUpdated: model.lastUpdated,
       algorithmVersion: model.algorithmVersion, // Optional
   };
  return success(validatedModel);
}

/**
 * Runtime validation for BrainRegion objects (quick check)
 */
export function isBrainRegion(obj: unknown): obj is BrainRegion { // Ensure export
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  const region = obj as Partial<BrainRegion>;

  // Validate against the actual BrainRegion type properties from SSoT
  return (
    typeof region.id === 'string' &&
    typeof region.name === 'string' &&
    typeof region.position === 'object' && region.position !== null && // Basic position check
    typeof region.color === 'string' &&
    Array.isArray(region.connections) &&
    typeof region.hemisphereLocation === 'string' && // Basic check
    typeof region.dataConfidence === 'number' &&
    typeof region.activityLevel === 'number' &&
    typeof region.isActive === 'boolean' &&
    typeof region.volume === 'number' &&
    typeof region.activity === 'number'
    // Deeper validation happens in validateBrainRegion
  );
}

/**
 * Validates a BrainRegion with detailed error reporting
 */
export function validateBrainRegion(obj: unknown, field?: string): Result<BrainRegion, ValidationError> { // Ensure export
  if (!obj || typeof obj !== 'object') {
    return failure(new ValidationError(`Invalid BrainRegion: Expected object`, field));
  }
  const region = obj as Partial<BrainRegion>;

  // Validate required string fields
  if (typeof region.id !== 'string') return failure(new ValidationError(`Expected type 'string' for id`, field ? `${field}.id` : 'id'));
  if (typeof region.name !== 'string') return failure(new ValidationError(`Expected type 'string' for name`, field ? `${field}.name` : 'name'));
  if (typeof region.color !== 'string') return failure(new ValidationError(`Expected type 'string' for color`, field ? `${field}.color` : 'color'));

  // Validate position object
  const positionResult = validateVector3(region.position, field ? `${field}.position` : 'position'); // Use local helper
  if (!positionResult.success) return failure(positionResult.error);

  // Validate connections array (must be array of strings)
  if (!Array.isArray(region.connections)) return failure(new ValidationError(`Expected type 'Array<string>' for connections`, field ? `${field}.connections` : 'connections'));
  if (!region.connections.every(c => typeof c === 'string')) return failure(new ValidationError(`All elements in connections must be strings`, field ? `${field}.connections` : 'connections'));

  // Validate hemisphereLocation enum
  const validHemispheres = ['left', 'right', 'central'] as const;
  if (typeof region.hemisphereLocation !== 'string' || !validHemispheres.includes(region.hemisphereLocation as any)) {
      return failure(new ValidationError(`Expected hemisphereLocation to be one of [${validHemispheres.join(', ')}]`, field ? `${field}.hemisphereLocation` : 'hemisphereLocation'));
  }

  // Validate numeric fields and ranges
  if (typeof region.dataConfidence !== 'number' || region.dataConfidence < 0 || region.dataConfidence > 1) return failure(new ValidationError(`Expected dataConfidence between 0 and 1`, field ? `${field}.dataConfidence` : 'dataConfidence'));
  if (typeof region.activityLevel !== 'number' || region.activityLevel < 0 || region.activityLevel > 1) return failure(new ValidationError(`Expected activityLevel between 0 and 1`, field ? `${field}.activityLevel` : 'activityLevel'));
  if (typeof region.volume !== 'number' || region.volume < 0) return failure(new ValidationError(`Expected volume >= 0`, field ? `${field}.volume` : 'volume'));
  if (typeof region.activity !== 'number' || region.activity < 0 || region.activity > 1) return failure(new ValidationError(`Expected activity between 0 and 1`, field ? `${field}.activity` : 'activity'));

  // Validate boolean fields
  if (typeof region.isActive !== 'boolean') return failure(new ValidationError(`Expected type 'boolean' for isActive`, field ? `${field}.isActive` : 'isActive'));

  // Validate optional properties
  if (region.volumeMl !== undefined && typeof region.volumeMl !== 'number') return failure(new ValidationError(`Expected type 'number' for optional volumeMl`, field ? `${field}.volumeMl` : 'volumeMl'));
  if (region.riskFactor !== undefined && (typeof region.riskFactor !== 'number' || region.riskFactor < 0 || region.riskFactor > 1)) return failure(new ValidationError(`Expected type 'number (0-1)' for optional riskFactor`, field ? `${field}.riskFactor` : 'riskFactor'));
  if (region.clinicalSignificance !== undefined && typeof region.clinicalSignificance !== 'string') return failure(new ValidationError(`Expected type 'string' for optional clinicalSignificance`, field ? `${field}.clinicalSignificance` : 'clinicalSignificance'));
  const validTissueTypes = ['gray', 'white'] as const;
  if (region.tissueType !== undefined && (typeof region.tissueType !== 'string' || !validTissueTypes.includes(region.tissueType as any))) return failure(new ValidationError(`Expected optional tissueType to be one of [${validTissueTypes.join(', ')}]`, field ? `${field}.tissueType` : 'tissueType'));

  // If all checks pass, return success
  // Cast to BrainRegion only after all checks pass
  const validatedRegion: BrainRegion = {
      id: region.id,
      name: region.name,
      position: positionResult.value, // Use validated position
      color: region.color,
      connections: region.connections,
      hemisphereLocation: region.hemisphereLocation as 'left' | 'right' | 'central', // Cast after validation
      dataConfidence: region.dataConfidence,
      activityLevel: region.activityLevel,
      isActive: region.isActive,
      volume: region.volume,
      activity: region.activity,
      volumeMl: region.volumeMl,
      riskFactor: region.riskFactor,
      clinicalSignificance: region.clinicalSignificance,
      tissueType: region.tissueType as 'gray' | 'white' | undefined, // Cast after validation
  };
  return success(validatedRegion);
} // End of validateBrainRegion function

/**
 * Runtime validation for NeuralConnection objects (quick check)
 */
export function isNeuralConnection(obj: unknown): obj is NeuralConnection { // Ensure export
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  const connection = obj as Partial<NeuralConnection>;

  // Validate against the actual NeuralConnection type properties from SSoT
  return (
    typeof connection.id === 'string' &&
    typeof connection.sourceId === 'string' &&
    typeof connection.targetId === 'string' &&
    typeof connection.strength === 'number' &&
    (connection.type === 'excitatory' || connection.type === 'inhibitory') &&
    typeof connection.directionality === 'string' && // Basic check
    typeof connection.activityLevel === 'number' &&
    typeof connection.dataConfidence === 'number'
    // Deeper validation happens in validateNeuralConnection
  );
}

/**
 * Validates a NeuralConnection with detailed error reporting
 */
export function validateNeuralConnection(obj: unknown, field?: string): Result<NeuralConnection, ValidationError> { // Ensure export
  if (!obj || typeof obj !== 'object') {
    return failure(new ValidationError(`Invalid NeuralConnection: Expected object`, field));
  }
  const connection = obj as Partial<NeuralConnection>;

  // Validate required string fields
  if (typeof connection.id !== 'string') return failure(new ValidationError(`Expected type 'string' for id`, field ? `${field}.id` : 'id'));
  if (typeof connection.sourceId !== 'string') return failure(new ValidationError(`Expected type 'string' for sourceId`, field ? `${field}.sourceId` : 'sourceId'));
  if (typeof connection.targetId !== 'string') return failure(new ValidationError(`Expected type 'string' for targetId`, field ? `${field}.targetId` : 'targetId'));

  // Validate numeric fields and ranges
  if (typeof connection.strength !== 'number' || connection.strength < 0 || connection.strength > 1) return failure(new ValidationError(`Expected strength between 0 and 1`, field ? `${field}.strength` : 'strength'));
  if (typeof connection.activityLevel !== 'number' || connection.activityLevel < 0 || connection.activityLevel > 1) return failure(new ValidationError(`Expected activityLevel between 0 and 1`, field ? `${field}.activityLevel` : 'activityLevel'));
  if (typeof connection.dataConfidence !== 'number' || connection.dataConfidence < 0 || connection.dataConfidence > 1) return failure(new ValidationError(`Expected dataConfidence between 0 and 1`, field ? `${field}.dataConfidence` : 'dataConfidence'));

  // Validate connection type enum
  if (connection.type !== 'excitatory' && connection.type !== 'inhibitory') {
    return failure(new ValidationError(`Expected type 'excitatory' or 'inhibitory' for type`, field ? `${field}.type` : 'type'));
  }

  // Validate directionality enum
  const validDirections = ['unidirectional', 'bidirectional'] as const;
  if (typeof connection.directionality !== 'string' || !validDirections.includes(connection.directionality as any)) {
      return failure(new ValidationError(`Expected directionality to be one of [${validDirections.join(', ')}]`, field ? `${field}.directionality` : 'directionality'));
  }

  // Validate optional pathwayLength
  if (connection.pathwayLength !== undefined && typeof connection.pathwayLength !== 'number') {
      return failure(new ValidationError(`Expected type 'number' for optional pathwayLength`, field ? `${field}.pathwayLength` : 'pathwayLength'));
  }

  // If all checks pass, return success
  // Cast to NeuralConnection only after all checks pass
  const validatedConnection: NeuralConnection = {
      id: connection.id,
      sourceId: connection.sourceId,
      targetId: connection.targetId,
      strength: connection.strength,
      type: connection.type as 'excitatory' | 'inhibitory', // Cast after validation
      directionality: connection.directionality as 'unidirectional' | 'bidirectional', // Cast after validation
      activityLevel: connection.activityLevel,
      dataConfidence: connection.dataConfidence,
      pathwayLength: connection.pathwayLength, // Optional
  };
  return success(validatedConnection);
} // End of validateNeuralConnection function

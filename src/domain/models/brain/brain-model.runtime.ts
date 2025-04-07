/**
 * NOVAMIND Neural-Safe Runtime Validators
 * Brain Model Domain Runtime Validation
 */

import type { BrainRegion, NeuralConnection, BrainModel } from '@models/brain/brain-model';

/**
 * Runtime validation for BrainRegion objects
 */
export const BrainRegionValidator = {
  /**
   * Validates if an object is a valid BrainRegion
   */
  isValid: (obj: unknown): obj is BrainRegion => {
    if (!obj || typeof obj !== 'object') return false;

    const region = obj as Partial<BrainRegion>;

    return (
      typeof region.id === 'string' &&
      typeof region.name === 'string' &&
      typeof region.position === 'object' && // Ensure position is a non-null object
      region.position !== null &&
      typeof region.position.x === 'number' &&
      typeof region.position.y === 'number' &&
      typeof region.position.z === 'number' &&
      typeof region.color === 'string' &&
      typeof region.isActive === 'boolean' &&
      typeof region.activityLevel === 'number' &&
      (region.volumeMl === undefined || typeof region.volumeMl === 'number') &&
      (region.riskFactor === undefined || typeof region.riskFactor === 'number')
    );
  },

  /**
   * Normalizes a region by ensuring all required properties exist
   */
  normalize: (region: Partial<BrainRegion>): BrainRegion => {
    return {
      id: region.id || crypto.randomUUID(),
      name: region.name || 'Unnamed Region',
      position: region.position || { x: 0, y: 0, z: 0 },
      color: region.color || '#cccccc',
      isActive: region.isActive ?? false,
      activityLevel: region.activityLevel ?? 0,
      volumeMl: region.volumeMl,
      riskFactor: region.riskFactor,
    };
  },
};

/**
 * Runtime validation for NeuralConnection objects
 */
export const NeuralConnectionValidator = {
  /**
   * Validates if an object is a valid NeuralConnection
   */
  isValid: (obj: unknown): obj is NeuralConnection => {
    if (!obj || typeof obj !== 'object') return false;

    const connection = obj as Partial<NeuralConnection>;

    return (
      typeof connection.id === 'string' &&
      typeof connection.sourceRegionId === 'string' &&
      typeof connection.targetRegionId === 'string' &&
      typeof connection.strength === 'number' &&
      typeof connection.isActive === 'boolean' &&
      (connection.connectionType === undefined || typeof connection.connectionType === 'string') &&
      (connection.color === undefined || typeof connection.color === 'string')
    );
  },

  /**
   * Normalizes a connection by ensuring all required properties exist
   */
  normalize: (connection: Partial<NeuralConnection>): NeuralConnection => {
    return {
      id: connection.id || crypto.randomUUID(),
      sourceRegionId: connection.sourceRegionId || '',
      targetRegionId: connection.targetRegionId || '',
      connectionType: connection.connectionType,
      strength: connection.strength ?? 1.0,
      isActive: connection.isActive ?? true,
      color: connection.color || '#888888',
    };
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
    if (!obj || typeof obj !== 'object') return false;

    const model = obj as Partial<BrainModel>;

    return (
      typeof model.id === 'string' &&
      typeof model.name === 'string' &&
      Array.isArray(model.regions) &&
      model.regions.every(BrainRegionValidator.isValid) &&
      Array.isArray(model.connections) &&
      model.connections.every(NeuralConnectionValidator.isValid) &&
      typeof model.version === 'number' &&
      (model.patientId === undefined || typeof model.patientId === 'string') &&
      (model.scanDate === undefined || model.scanDate instanceof Date) &&
      (model.modelType === undefined || typeof model.modelType === 'string') &&
      (model.isTemplate === undefined || typeof model.isTemplate === 'boolean') &&
      (model.metadata === undefined || typeof model.metadata === 'object')
    );
  },

  /**
   * Normalizes a model by ensuring all required properties exist
   */
  normalize: (model: Partial<BrainModel>): BrainModel => {
    return {
      id: model.id || crypto.randomUUID(),
      name: model.name || 'New Brain Model',
      regions: Array.isArray(model.regions)
        ? model.regions.map((r) => BrainRegionValidator.normalize(r))
        : [],
      connections: Array.isArray(model.connections)
        ? model.connections.map((c) => NeuralConnectionValidator.normalize(c))
        : [],
      version: model.version || 1,
      patientId: model.patientId,
      scanDate: model.scanDate,
      modelType: model.modelType,
      isTemplate: model.isTemplate,
      metadata: model.metadata || {},
    };
  },
};

/**
 * NOVAMIND Neural-Safe Application Service
 * BrainModelService Runtime Validation Tests - Quantum-level test precision
 * with mathematical integrity
 */

import { describe, it, expect } from 'vitest';
// Import from the implementation file, assuming exports are now correct
// Import only the functions needed for the tests
import {
  isBrainModel,
  validateBrainModel,
  isBrainRegion,
  validateBrainRegion,
  isNeuralConnection,
  validateNeuralConnection,
} from './brain-model.service.runtime'; // Use relative path
// Removed unused import: ValidationError
// Import SSoT types for mocks
import type {
  BrainModel,
  BrainRegion,
  NeuralConnection,
  BrainScan,
} from '@domain/types/brain/models';
import type { Vector3 } from '@/domain/types/shared/common'; // Import Vector3 from shared

describe('BrainModelService Runtime Validation', () => {
  // --- Define Valid Mocks based on SSoT ---
  const validPosition: Vector3 = { x: 0, y: 0, z: 0 };
  const validResolution: Vector3 = { x: 1, y: 1, z: 1 };

  const validRegion: BrainRegion = {
    id: 'region-1',
    name: 'Prefrontal Cortex',
    position: validPosition,
    color: '#FF0000',
    connections: ['connection-1'],
    hemisphereLocation: 'left',
    dataConfidence: 0.9,
    activityLevel: 0.8,
    isActive: true,
    volume: 100,
    activity: 0.5,
  };

  const validConnection: NeuralConnection = {
    id: 'connection-1',
    sourceId: 'region-1',
    targetId: 'region-2',
    strength: 0.7,
    type: 'excitatory',
    directionality: 'unidirectional',
    activityLevel: 0.6,
    dataConfidence: 0.85,
  };

  const validScan: BrainScan = {
    id: 'scan-test',
    patientId: 'patient-test',
    scanDate: new Date().toISOString(),
    scanType: 'fMRI',
    dataQualityScore: 0.9,
    resolution: validResolution,
    metadata: { acquisitionTime: 300 },
  };

  const validModel: BrainModel = {
    id: 'model-123',
    regions: [validRegion],
    connections: [validConnection],
    version: '1.0.0',
    patientId: 'patient-test',
    scan: validScan,
    timestamp: new Date().toISOString(),
    processingLevel: 'raw',
    lastUpdated: new Date().toISOString(),
  };

  // --- Tests ---

  describe('isBrainModel', () => {
    it('returns true for valid BrainModel objects', () => {
      expect(isBrainModel(validModel)).toBe(true);
    });

    it('returns false for non-object values', () => {
      expect(isBrainModel(null)).toBe(false);
      expect(isBrainModel(undefined)).toBe(false);
      expect(isBrainModel('string')).toBe(false);
      expect(isBrainModel(123)).toBe(false);
      expect(isBrainModel([])).toBe(false);
    });

    it('returns false for objects missing required properties', () => {
      expect(isBrainModel({ ...validModel, id: undefined })).toBe(false);
      expect(isBrainModel({ ...validModel, patientId: undefined })).toBe(false);
      expect(isBrainModel({ ...validModel, regions: undefined })).toBe(false);
      expect(isBrainModel({ ...validModel, connections: undefined })).toBe(false);
      expect(isBrainModel({ ...validModel, version: undefined })).toBe(false);
      expect(isBrainModel({ ...validModel, scan: undefined })).toBe(false);
      expect(isBrainModel({ ...validModel, timestamp: undefined })).toBe(false);
      expect(isBrainModel({ ...validModel, processingLevel: undefined })).toBe(false);
      expect(isBrainModel({ ...validModel, lastUpdated: undefined })).toBe(false);
    });
  });

  describe('validateBrainModel', () => {
    it('returns success for valid BrainModel objects', () => {
      const result = validateBrainModel(validModel);
      expect(result.success).toBe(true);
      if (result.success) expect(result.value).toEqual(validModel);
    });

    it('returns failure for non-object values', () => {
      const nullResult = validateBrainModel(null);
      expect(nullResult.success).toBe(false);
      if (!nullResult.success) expect(nullResult.error?.message).toContain('Invalid BrainModel');

      const undefinedResult = validateBrainModel(undefined);
      expect(undefinedResult.success).toBe(false);
      if (!undefinedResult.success)
        expect(undefinedResult.error?.message).toContain('Invalid BrainModel');

      const stringResult = validateBrainModel('string');
      expect(stringResult.success).toBe(false);
      if (!stringResult.success)
        expect(stringResult.error?.message).toContain('Invalid BrainModel');
    });

    it('returns failure for objects with invalid regions', () => {
      const invalidRegion = { ...validRegion, name: 123 }; // Invalid name type
      const modelWithInvalidRegion = { ...validModel, regions: [invalidRegion] };
      const result = validateBrainModel(modelWithInvalidRegion);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.field).toBe('regions[0].name');
    });

    it('returns failure for objects with invalid connections', () => {
      const invalidConnection = { ...validConnection, sourceId: null }; // Invalid sourceId type
      const modelWithInvalidConnection = { ...validModel, connections: [invalidConnection] };
      const result = validateBrainModel(modelWithInvalidConnection);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.field).toBe('connections[0].sourceId');
    });

    it('returns failure for objects with invalid scan', () => {
      const invalidScan = { ...validScan, scanType: 'INVALID' }; // Invalid scanType
      const modelWithInvalidScan = { ...validModel, scan: invalidScan };
      const result = validateBrainModel(modelWithInvalidScan);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.field).toBe('scan.scanType');
    });

    it('includes the field path in error messages when provided', () => {
      const result = validateBrainModel({}, 'testField'); // Empty object is invalid
      expect(result.success).toBe(false);
      // No need to cast result.error if ValidationError is not imported/used for casting
      if (!result.success) expect(result.error?.field).toBe('testField.id');
    });
  });

  describe('isBrainRegion', () => {
    it('returns true for valid BrainRegion objects', () => {
      expect(isBrainRegion(validRegion)).toBe(true);
    });

    it('returns false for non-object values', () => {
      expect(isBrainRegion(null)).toBe(false);
      expect(isBrainRegion(undefined)).toBe(false);
      expect(isBrainRegion('string')).toBe(false);
      expect(isBrainRegion(123)).toBe(false);
    });

    it('returns false for objects missing required properties', () => {
      expect(isBrainRegion({ ...validRegion, id: undefined })).toBe(false);
      expect(isBrainRegion({ ...validRegion, name: undefined })).toBe(false);
      expect(isBrainRegion({ ...validRegion, position: undefined })).toBe(false);
      expect(isBrainRegion({ ...validRegion, color: undefined })).toBe(false);
      expect(isBrainRegion({ ...validRegion, connections: undefined })).toBe(false);
      expect(isBrainRegion({ ...validRegion, hemisphereLocation: undefined })).toBe(false);
      expect(isBrainRegion({ ...validRegion, dataConfidence: undefined })).toBe(false);
      expect(isBrainRegion({ ...validRegion, activityLevel: undefined })).toBe(false);
      expect(isBrainRegion({ ...validRegion, isActive: undefined })).toBe(false);
      expect(isBrainRegion({ ...validRegion, volume: undefined })).toBe(false);
      expect(isBrainRegion({ ...validRegion, activity: undefined })).toBe(false);
    });
  });

  describe('validateBrainRegion', () => {
    it('returns success for valid BrainRegion objects', () => {
      const result = validateBrainRegion(validRegion);
      expect(result.success).toBe(true);
      if (result.success) expect(result.value).toEqual(validRegion);
    });

    it('returns failure for non-object values', () => {
      const nullResult = validateBrainRegion(null);
      expect(nullResult.success).toBe(false);
      if (!nullResult.success) expect(nullResult.error?.message).toContain('Invalid BrainRegion');
    });

    it('returns failure for objects with invalid activityLevel', () => {
      const regionWithInvalidActivityLevel = { ...validRegion, activityLevel: 1.5 }; // Above 1
      const result = validateBrainRegion(regionWithInvalidActivityLevel);
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error?.message).toContain('Expected activityLevel between 0 and 1');
    });

    it('returns failure for objects with invalid hemisphereLocation', () => {
      const regionWithInvalidHemisphere = { ...validRegion, hemisphereLocation: 'middle' as any }; // Invalid enum
      const result = validateBrainRegion(regionWithInvalidHemisphere);
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error?.message).toContain('Expected hemisphereLocation to be one of');
    });

    it('includes the field path in error messages when provided', () => {
      const result = validateBrainRegion({}, 'parentField'); // Empty object is invalid
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.field).toBe('parentField.id');
    });
  });

  describe('isNeuralConnection', () => {
    it('returns true for valid NeuralConnection objects', () => {
      expect(isNeuralConnection(validConnection)).toBe(true);
    });

    it('returns false for non-object values', () => {
      expect(isNeuralConnection(null)).toBe(false);
      expect(isNeuralConnection(undefined)).toBe(false);
      expect(isNeuralConnection('string')).toBe(false);
      expect(isNeuralConnection(123)).toBe(false);
    });

    it('returns false for objects missing required properties', () => {
      expect(isNeuralConnection({ ...validConnection, id: undefined })).toBe(false);
      expect(isNeuralConnection({ ...validConnection, sourceId: undefined })).toBe(false);
      expect(isNeuralConnection({ ...validConnection, targetId: undefined })).toBe(false);
      expect(isNeuralConnection({ ...validConnection, strength: undefined })).toBe(false);
      expect(isNeuralConnection({ ...validConnection, type: undefined })).toBe(false);
      expect(isNeuralConnection({ ...validConnection, directionality: undefined })).toBe(false);
      expect(isNeuralConnection({ ...validConnection, activityLevel: undefined })).toBe(false);
      expect(isNeuralConnection({ ...validConnection, dataConfidence: undefined })).toBe(false);
    });
  });

  describe('validateNeuralConnection', () => {
    it('returns success for valid NeuralConnection objects', () => {
      const result = validateNeuralConnection(validConnection);
      expect(result.success).toBe(true);
      if (result.success) expect(result.value).toEqual(validConnection);
    });

    it('returns failure for non-object values', () => {
      const nullResult = validateNeuralConnection(null);
      expect(nullResult.success).toBe(false);
      if (!nullResult.success)
        expect(nullResult.error?.message).toContain('Invalid NeuralConnection');
    });

    it('returns failure for objects with invalid strength', () => {
      const connectionWithInvalidStrength = { ...validConnection, strength: 1.5 }; // Above 1
      const result = validateNeuralConnection(connectionWithInvalidStrength);
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error?.message).toContain('Expected strength between 0 and 1');
    });

    it('returns failure for objects with invalid type', () => {
      const connectionWithInvalidType = { ...validConnection, type: 'invalid-type' as any };
      const result = validateNeuralConnection(connectionWithInvalidType);
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error?.message).toContain(
          "Expected type 'excitatory' or 'inhibitory' for type"
        );
    });

    it('returns failure for objects with invalid directionality', () => {
      const connectionWithInvalidDir = { ...validConnection, directionality: 'one-way' as any };
      const result = validateNeuralConnection(connectionWithInvalidDir);
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error?.message).toContain('Expected directionality to be one of');
    });

    it('includes the field path in error messages when provided', () => {
      const result = validateNeuralConnection({}, 'connectionField'); // Empty object is invalid
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.field).toBe('connectionField.id');
    });
  });
});

/**
 * NOVAMIND Neural-Safe Application Service
 * BrainModelService Runtime Validation Tests - Quantum-level test precision
 * with mathematical integrity
 */

import { describe, it, expect } from 'vitest';
import {
  isBrainModel,
  validateBrainModel,
  isBrainRegion,
  validateBrainRegion,
  isNeuralConnection,
  validateNeuralConnection,
  ValidationError, // Import the custom error type
} from '@application/services/brain/brain-model.service.runtime';
import type { BrainModel, BrainRegion, NeuralConnection } from '@domain/types/brain/models';

describe('BrainModelService Runtime Validation', () => {
  describe('isBrainModel', () => {
    it('returns true for valid BrainModel objects', () => {
      // Create a minimal valid BrainRegion first
      const validRegion: BrainRegion = {
        id: 'region-1',
        name: 'Prefrontal Cortex',
        position: { x: 0, y: 0, z: 0 },
        color: '#FF0000',
        connections: ['connection-1'],
        hemisphereLocation: 'left',
        dataConfidence: 0.9,
        activityLevel: 0.8, // Keep required property
        isActive: true, // Keep required property
      };
      // Create a minimal valid NeuralConnection
      const validConnection: NeuralConnection = {
        id: 'connection-1',
        sourceId: 'region-1',
        targetId: 'region-2', // Assuming region-2 exists elsewhere or is mocked
        strength: 0.7,
        type: 'functional', // Use valid type
        directionality: 'unidirectional', // Added required property
        activityLevel: 0.6, // Added required property
        dataConfidence: 0.85, // Added required property
        // Color removed correctly
      };
      // Create a minimal valid BrainModel using the above
      const validModel: BrainModel = {
        id: 'model-123',
        // Removed name as it's not part of BrainModel type
        // Name removed correctly
        regions: [validRegion],
        connections: [validConnection],
        version: '1', // Version should be string
        patientId: 'patient-test', // Added required
        scan: {
          id: 'scan-test',
          patientId: 'patient-test',
          scanDate: new Date().toISOString(),
          scanType: 'fMRI',
          dataQualityScore: 0.9,
        }, // Added required
        timestamp: new Date().toISOString(), // Added required
        processingLevel: 'raw', // Added required
        lastUpdated: new Date().toISOString(), // Added required
      };

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
      // Missing id
      expect(
        isBrainModel({
          name: 'Test Model',
          regions: [],
          connections: [],
          version: 1,
        })
      ).toBe(false);

      // Missing name
      expect(
        isBrainModel({
          id: 'model-123',
          regions: [],
          connections: [],
          version: 1,
        })
      ).toBe(false);

      // Missing regions
      expect(
        isBrainModel({
          id: 'model-123',
          name: 'Test Model',
          connections: [],
          version: 1,
        })
      ).toBe(false);

      // Missing connections
      expect(
        isBrainModel({
          id: 'model-123',
          name: 'Test Model',
          regions: [],
          version: 1,
        })
      ).toBe(false);

      // Missing version
      expect(
        isBrainModel({
          id: 'model-123',
          name: 'Test Model',
          regions: [],
          connections: [],
        })
      ).toBe(false);
    });
  });

  describe('validateBrainModel', () => {
    it('returns success for valid BrainModel objects', () => {
      // Re-use the valid model definition from the previous test (corrected)
      const validRegion: BrainRegion = {
        id: 'region-1',
        name: 'Prefrontal Cortex',
        position: { x: 0, y: 0, z: 0 },
        color: '#FF0000',
        connections: ['connection-1'],
        hemisphereLocation: 'left',
        dataConfidence: 0.9,
        activityLevel: 0.8,
        isActive: true,
      }; // Keep required properties
      const validConnection: NeuralConnection = {
        id: 'connection-1',
        sourceId: 'region-1',
        targetId: 'region-2',
        strength: 0.7,
        type: 'functional',
        directionality: 'unidirectional',
        activityLevel: 0.6,
        dataConfidence: 0.85,
      }; // Corrected mock
      const validModel: BrainModel = {
        id: 'model-123',
        regions: [validRegion],
        connections: [validConnection],
        version: '1',
        patientId: 'patient-test',
        scan: {
          id: 'scan-test',
          patientId: 'patient-test',
          scanDate: new Date().toISOString(),
          scanType: 'fMRI',
          dataQualityScore: 0.9,
        },
        timestamp: new Date().toISOString(),
        processingLevel: 'raw',
        lastUpdated: new Date().toISOString(),
      }; // Corrected mock

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
      const modelWithInvalidRegion = {
        id: 'model-123',
        name: 'Test Model',
        regions: [
          {
            id: 'region-1',
            // Missing name property
            activityLevel: 0.8,
            isActive: true,
          },
        ],
        connections: [],
        version: 1,
      };

      const result = validateBrainModel(modelWithInvalidRegion);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.message).toContain('invalid region');
    });

    it('returns failure for objects with invalid connections', () => {
      const modelWithInvalidConnection = {
        id: 'model-123',
        name: 'Test Model',
        regions: [
          {
            id: 'region-1',
            name: 'Prefrontal Cortex',
            activityLevel: 0.8,
            isActive: true,
          },
        ],
        connections: [
          {
            id: 'connection-1',
            // Missing sourceId property
            targetId: 'region-2',
            strength: 0.7,
            type: 'excitatory',
            active: true,
          },
        ],
        version: 1,
      };

      const result = validateBrainModel(modelWithInvalidConnection);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.message).toContain('invalid connection');
    });

    it('includes the field path in error messages when provided', () => {
      const result = validateBrainModel({}, 'testField');
      expect(result.success).toBe(false);
      if (!result.success) expect((result.error as ValidationError)?.field).toBe('testField.id'); // Use imported ValidationError for cast
    });
  });

  describe('isBrainRegion', () => {
    it('returns true for valid BrainRegion objects', () => {
      const validRegion: BrainRegion = {
        id: 'region-1',
        name: 'Prefrontal Cortex',
        position: { x: 0, y: 0, z: 0 },
        color: '#FF0000',
        connections: [],
        hemisphereLocation: 'left',
        dataConfidence: 0.9,
        activityLevel: 0.8,
        isActive: true,
      }; // Keep required properties

      expect(isBrainRegion(validRegion)).toBe(true);
    });

    it('returns false for non-object values', () => {
      expect(isBrainRegion(null)).toBe(false);
      expect(isBrainRegion(undefined)).toBe(false);
      expect(isBrainRegion('string')).toBe(false);
      expect(isBrainRegion(123)).toBe(false);
    });

    it('returns false for objects missing required properties', () => {
      // Missing id
      expect(
        isBrainRegion({
          name: 'Prefrontal Cortex',
          activityLevel: 0.8,
          isActive: true,
        })
      ).toBe(false);

      // Missing name
      expect(
        isBrainRegion({
          id: 'region-1',
          activityLevel: 0.8,
          isActive: true,
        })
      ).toBe(false);

      // Missing activityLevel
      expect(
        isBrainRegion({
          id: 'region-1',
          name: 'Prefrontal Cortex',
          isActive: true,
        })
      ).toBe(false);

      // Missing isActive
      expect(
        isBrainRegion({
          id: 'region-1',
          name: 'Prefrontal Cortex',
          activityLevel: 0.8,
        })
      ).toBe(false);
    });
  });

  describe('validateBrainRegion', () => {
    it('returns success for valid BrainRegion objects', () => {
      const validRegion: BrainRegion = {
        id: 'region-1',
        name: 'Prefrontal Cortex',
        position: { x: 0, y: 0, z: 0 },
        color: '#FF0000',
        connections: [],
        hemisphereLocation: 'left',
        dataConfidence: 0.9,
        activityLevel: 0.8,
        isActive: true,
      }; // Keep required properties

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
      const regionWithInvalidActivityLevel = {
        id: 'region-1',
        name: 'Prefrontal Cortex',
        activityLevel: 1.5, // Above the valid range (0-1)
        isActive: true,
      };

      const result = validateBrainRegion(regionWithInvalidActivityLevel);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.message).toContain('activityLevel');
    });

    it('includes the field path in error messages when provided', () => {
      const result = validateBrainRegion({}, 'parentField');
      expect(result.success).toBe(false);
      if (!result.success) expect((result.error as ValidationError)?.field).toBe('parentField.id'); // Use imported ValidationError for cast
    });
  });

  describe('isNeuralConnection', () => {
    it('returns true for valid NeuralConnection objects', () => {
      const validConnection: NeuralConnection = {
        id: 'connection-1',
        sourceId: 'region-1',
        targetId: 'region-2',
        strength: 0.7,
        type: 'functional',
        directionality: 'unidirectional',
        activityLevel: 0.6,
        dataConfidence: 0.85,
      }; // Corrected mock

      expect(isNeuralConnection(validConnection)).toBe(true);
    });

    it('returns false for non-object values', () => {
      expect(isNeuralConnection(null)).toBe(false);
      expect(isNeuralConnection(undefined)).toBe(false);
      expect(isNeuralConnection('string')).toBe(false);
      expect(isNeuralConnection(123)).toBe(false);
    });

    it('returns false for objects missing required properties', () => {
      // Missing id
      expect(
        isNeuralConnection({
          sourceId: 'region-1',
          targetId: 'region-2',
          strength: 0.7,
          type: 'excitatory',
          active: true,
        })
      ).toBe(false);

      // Missing sourceId
      expect(
        isNeuralConnection({
          id: 'connection-1',
          targetId: 'region-2',
          strength: 0.7,
          type: 'excitatory',
          active: true,
        })
      ).toBe(false);
    });
  });

  describe('validateNeuralConnection', () => {
    it('returns success for valid NeuralConnection objects', () => {
      const validConnection: NeuralConnection = {
        id: 'connection-1',
        sourceId: 'region-1',
        targetId: 'region-2',
        strength: 0.7,
        type: 'functional',
        directionality: 'unidirectional',
        activityLevel: 0.6,
        dataConfidence: 0.85,
      }; // Corrected mock

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
      const connectionWithInvalidStrength = {
        id: 'connection-1',
        sourceId: 'region-1',
        targetId: 'region-2',
        strength: 1.5, // Above the valid range (0-1)
        type: 'excitatory',
        active: true,
      };

      const result = validateNeuralConnection(connectionWithInvalidStrength);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.message).toContain('strength');
    });

    it('returns failure for objects with invalid type', () => {
      const connectionWithInvalidType = {
        id: 'connection-1',
        sourceId: 'region-1',
        targetId: 'region-2',
        strength: 0.7,
        type: 'invalid-type' as any, // Not a valid connection type - cast to any for test
        directionality: 'unidirectional',
        activityLevel: 0.6,
        dataConfidence: 0.85,
      };

      const result = validateNeuralConnection(connectionWithInvalidType);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.message).toContain('type');
    });

    it('includes the field path in error messages when provided', () => {
      const result = validateNeuralConnection({}, 'connectionField');
      expect(result.success).toBe(false);
      if (!result.success)
        expect((result.error as ValidationError)?.field).toBe('connectionField.id'); // Use imported ValidationError for cast
    });
  });
});

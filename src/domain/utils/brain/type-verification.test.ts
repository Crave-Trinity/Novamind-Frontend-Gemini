/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Type Verification
 * Brain-specific type verification utilities tests with quantum-level precision
 */

import { describe, it, expect } from 'vitest';
import { brainTypeVerifier } from '@domain/utils/brain/type-verification';
import { RenderMode } from '@domain/types/brain/visualization';
import { TypeVerificationError } from '../../../domain/utils/shared/type-verification';
// Import SSoT types for mocks
import type {
  BrainModel,
  BrainRegion,
  NeuralConnection,
  BrainScan,
} from '@domain/types/brain/models';

describe('Brain type verification', () => {
  describe('verifyVector3', () => {
    it('verifies valid Vector3 objects', () => {
      const result = brainTypeVerifier.verifyVector3({ x: 1, y: 2, z: 3 });
      expect(result.success).toBe(true);
      if (result.success) expect(result.value).toEqual({ x: 1, y: 2, z: 3 });
    });

    it('fails on non-object values', () => {
      expect(brainTypeVerifier.verifyVector3('not an object').success).toBe(false);
      expect(brainTypeVerifier.verifyVector3(null).success).toBe(false);
      expect(brainTypeVerifier.verifyVector3(undefined).success).toBe(false);
    });

    it('fails when coordinates are not numbers', () => {
      expect(brainTypeVerifier.verifyVector3({ x: '1', y: 2, z: 3 }).success).toBe(false);
      expect(brainTypeVerifier.verifyVector3({ x: 1, y: true, z: 3 }).success).toBe(false);
      expect(brainTypeVerifier.verifyVector3({ x: 1, y: 2, z: null }).success).toBe(false);
    });

    it('fails when coordinates are missing', () => {
      expect(brainTypeVerifier.verifyVector3({ x: 1, y: 2 }).success).toBe(false);
      expect(brainTypeVerifier.verifyVector3({ y: 2, z: 3 }).success).toBe(false);
      expect(brainTypeVerifier.verifyVector3({}).success).toBe(false);
    });
  });

  describe('safelyParseVector3', () => {
    it('returns Vector3 for valid objects', () => {
      expect(brainTypeVerifier.safelyParseVector3({ x: 1, y: 2, z: 3 })).toEqual({
        x: 1,
        y: 2,
        z: 3,
      });
    });

    it('converts string or non-numeric values', () => {
      expect(brainTypeVerifier.safelyParseVector3({ x: '1', y: '2', z: '3' })).toEqual({
        x: 1,
        y: 2,
        z: 3,
      });
    });

    it('uses fallback for missing values', () => {
      expect(brainTypeVerifier.safelyParseVector3({ x: 1 })).toEqual({
        x: 1,
        y: 0,
        z: 0,
      });
    });

    it('returns fallback for non-object values', () => {
      expect(brainTypeVerifier.safelyParseVector3(null)).toEqual({
        x: 0,
        y: 0,
        z: 0,
      });

      expect(
        brainTypeVerifier.safelyParseVector3('not an object', {
          x: 10,
          y: 20,
          z: 30,
        })
      ).toEqual({ x: 10, y: 20, z: 30 });
    });
  });

  describe('verifyRenderMode', () => {
    it('verifies valid RenderMode values', () => {
      const result = brainTypeVerifier.verifyRenderMode(RenderMode.ANATOMICAL);
      expect(result.success).toBe(true);
      if (result.success) expect(result.value).toBe(RenderMode.ANATOMICAL);
    });

    it('fails on invalid RenderMode values', () => {
      expect(brainTypeVerifier.verifyRenderMode('INVALID_MODE').success).toBe(false);
      expect(brainTypeVerifier.verifyRenderMode(null).success).toBe(false);
      expect(brainTypeVerifier.verifyRenderMode(42).success).toBe(false);
    });
  });

  describe('verifyBrainRegion', () => {
    // Define a valid BrainRegion mock based on SSoT
    const validRegion: BrainRegion = {
      id: 'region1',
      name: 'Prefrontal Cortex',
      position: { x: 10, y: 20, z: 30 },
      color: '#FF0000',
      connections: ['conn1'],
      hemisphereLocation: 'left',
      dataConfidence: 0.95,
      activityLevel: 0.8,
      isActive: true,
      volume: 1200.5,
      activity: 0.75,
      // Optional fields
      volumeMl: 1200,
      riskFactor: 0.1,
      clinicalSignificance: 'High activity',
      tissueType: 'gray',
    };

    it('verifies valid BrainRegion objects', () => {
      // Create a minimal valid region for this specific test
      const minimalValidRegion: BrainRegion = {
        id: 'region1',
        name: 'Prefrontal Cortex',
        position: { x: 10, y: 20, z: 30 },
        color: '#FF0000',
        connections: [],
        hemisphereLocation: 'left',
        dataConfidence: 0.9,
        activityLevel: 0.8,
        isActive: true,
        volume: 1100,
        activity: 0.7,
      };
      const result = brainTypeVerifier.verifyBrainRegion(minimalValidRegion);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual(minimalValidRegion); // Use minimal valid for this assertion
      }
    });

    it('accepts optional properties', () => {
      // Use the fully defined validRegion mock here
      const result = brainTypeVerifier.verifyBrainRegion(validRegion);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.volumeMl).toBe(1200);
        expect(result.value.riskFactor).toBe(0.1);
        expect(result.value.clinicalSignificance).toBe('High activity');
        expect(result.value.tissueType).toBe('gray');
      }
    });

    it('fails when required properties are missing', () => {
      const missingProps = {
        id: 'region1',
        name: 'Prefrontal Cortex',
        position: { x: 1, y: 1, z: 1 },
        color: '#FF0000',
        // connections: [], // Missing required connections
        hemisphereLocation: 'central',
        dataConfidence: 0.8,
        activityLevel: 0.5,
        isActive: true,
        volume: 500, // Missing required volume
        activity: 0.6,
      };
      const result = brainTypeVerifier.verifyBrainRegion(missingProps);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Expect error related to missing 'connections' or 'volume'
        expect(result.error.field).toMatch(/connections|volume/);
      }
    });

    it('fails when properties have wrong types', () => {
      const wrongTypes = {
        id: 123, // WRONG TYPE
        name: 'Prefrontal Cortex',
        position: { x: 10, y: 20, z: 30 },
        color: '#FF0000',
        connections: [],
        hemisphereLocation: 'left',
        dataConfidence: 1,
        activityLevel: 0.8,
        isActive: 'yes', // WRONG TYPE
        volume: 1000,
        activity: 0.5,
      };
      const result = brainTypeVerifier.verifyBrainRegion(wrongTypes);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.field).toMatch(/id|isActive/);
      }
    });
  });

  describe('verifyNeuralConnection', () => {
    // Define a valid NeuralConnection mock based on SSoT
    const validConnection: NeuralConnection = {
      id: 'conn1',
      sourceId: 'region1',
      targetId: 'region2',
      strength: 0.75,
      type: 'excitatory',
      directionality: 'unidirectional',
      activityLevel: 0.65,
      dataConfidence: 0.9,
      pathwayLength: 15.5, // Optional included
    };

    it('verifies valid NeuralConnection objects', () => {
      // Use a minimal version for this test
      const minimalValidConnection: NeuralConnection = {
        id: 'conn1',
        sourceId: 'region1',
        targetId: 'region2',
        strength: 0.75,
        type: 'excitatory',
        directionality: 'unidirectional',
        activityLevel: 0.65,
        dataConfidence: 0.9,
      };
      const result = brainTypeVerifier.verifyNeuralConnection(minimalValidConnection);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual(minimalValidConnection);
      }
    });

    it('accepts optional properties', () => {
      // Use the full mock with optional property
      const result = brainTypeVerifier.verifyNeuralConnection(validConnection);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.pathwayLength).toBe(15.5);
      }
    });

    it('fails when required properties are missing', () => {
      const missingProps = {
        id: 'conn1',
        sourceId: 'region1',
        targetId: 'region2',
        // missing strength
        type: 'excitatory',
        directionality: 'unidirectional',
        activityLevel: 0.4,
        // missing dataConfidence
      };
      const result = brainTypeVerifier.verifyNeuralConnection(missingProps);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.field).toMatch(/strength|dataConfidence/);
      }
    });
  });

  describe('verifyBrainModel', () => {
    // Define valid mocks based on SSoT (@domain/types/brain/models.ts)
    const validRegionMock: BrainRegion = {
      id: 'region1',
      name: 'Region One',
      position: { x: 0, y: 0, z: 0 },
      color: '#ff0000',
      connections: ['conn1'],
      hemisphereLocation: 'left',
      dataConfidence: 1,
      activityLevel: 1,
      isActive: true,
      volume: 1,
      activity: 1,
    };
    const validConnectionMock: NeuralConnection = {
      id: 'conn1',
      sourceId: 'region1',
      targetId: 'region2',
      strength: 1,
      type: 'excitatory',
      directionality: 'unidirectional',
      activityLevel: 1,
      dataConfidence: 1,
    };
    const validScanMock: BrainScan = {
      id: 'scan1',
      patientId: 'p1',
      scanDate: new Date().toISOString(),
      scanType: 'fMRI',
      resolution: { x: 1, y: 1, z: 1 },
      metadata: { test: true },
      dataQualityScore: 1.0,
    };

    it('verifies valid BrainModel objects', () => {
      // Align with BrainModel from SSoT
      const validModel: BrainModel = {
        id: 'model1',
        regions: [validRegionMock],
        connections: [validConnectionMock],
        version: '1.0',
        patientId: 'patient-xyz',
        scan: validScanMock,
        timestamp: new Date().toISOString(),
        processingLevel: 'raw',
        lastUpdated: new Date().toISOString(),
      };

      const result = brainTypeVerifier.verifyBrainModel(validModel);
      // Add console log for debugging if needed
      // if (!result.success) console.error("Validation failed:", result.error);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual(validModel);
      }
    });

    it('accepts optional properties', () => {
      const modelWithOptionals: BrainModel = {
        // Align with BrainModel SSoT, including optional fields
        id: 'model1',
        regions: [validRegionMock],
        connections: [validConnectionMock],
        version: '1.1-opt',
        patientId: 'patient-abc',
        scan: validScanMock,
        timestamp: new Date().toISOString(),
        processingLevel: 'filtered',
        lastUpdated: new Date().toISOString(),
        // Optional field being tested
        algorithmVersion: 'Novamind-v3',
      };

      const result = brainTypeVerifier.verifyBrainModel(modelWithOptionals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.algorithmVersion).toBe('Novamind-v3');
      } else {
        // Fail the test if verification didn't succeed unexpectedly
        expect(result.success).toBe(true); // This will intentionally fail if success is false
      }
    });

    it('fails when required properties are missing', () => {
      const missingProps = {
        id: 'model1',
        regions: [],
        connections: [],
        // missing version
        patientId: 'patient-err',
        scan: validScanMock,
        timestamp: new Date().toISOString(),
        processingLevel: 'analyzed',
        lastUpdated: new Date().toISOString(),
      };
      const result = brainTypeVerifier.verifyBrainModel(missingProps);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.field).toBe('version');
      }
    });

    it('fails when arrays contain invalid items', () => {
      const invalidItems = {
        id: 'model1',
        regions: [
          {
            // Invalid region - missing name, position, etc.
            id: 'region1',
            // ... other fields missing
          },
        ],
        connections: [validConnectionMock],
        version: '2.0-invalid',
        patientId: 'patient-inv',
        scan: validScanMock,
        timestamp: new Date().toISOString(),
        processingLevel: 'normalized',
        lastUpdated: new Date().toISOString(),
      };
      const result = brainTypeVerifier.verifyBrainModel(invalidItems);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Expect error related to the first invalid region
        // Expect the error field to point to a missing required property within the first region (e.g., name)
        // Check that the error field indicates an issue within the first region
        expect(result.error.field).toMatch(/^regions\[0\]/);
      }
    });
  });

  describe('assertion functions', () => {
    // Define valid mocks needed for assertion tests
    const validRegionForAssert: BrainRegion = {
      id: 'region1',
      name: 'Prefrontal Cortex',
      position: { x: 10, y: 20, z: 30 },
      color: '#FF0000',
      connections: ['conn1'],
      hemisphereLocation: 'left',
      dataConfidence: 0.95,
      activityLevel: 0.8,
      isActive: true,
      volume: 1200.5,
      activity: 0.75,
    };
    const invalidRegionForAssert = { id: 'region1' /* missing required fields */ };

    it('assertVector3 passes for valid Vector3', () => {
      expect(() => brainTypeVerifier.assertVector3({ x: 1, y: 2, z: 3 })).not.toThrow();
    });

    it('assertVector3 throws for invalid Vector3', () => {
      expect(() => brainTypeVerifier.assertVector3({ x: 1, y: '2', z: 3 })).toThrow(
        TypeVerificationError
      );
    });

    it('assertRenderMode passes for valid RenderMode', () => {
      expect(() => brainTypeVerifier.assertRenderMode(RenderMode.ANATOMICAL)).not.toThrow();
    });

    it('assertRenderMode throws for invalid RenderMode', () => {
      expect(() => brainTypeVerifier.assertRenderMode('INVALID_MODE')).toThrow(
        TypeVerificationError
      );
    });

    it('assertBrainRegion passes for valid BrainRegion', () => {
      expect(() => brainTypeVerifier.assertBrainRegion(validRegionForAssert)).not.toThrow();
    });

    it('assertBrainRegion throws for invalid BrainRegion', () => {
      expect(() => brainTypeVerifier.assertBrainRegion(invalidRegionForAssert)).toThrow(
        TypeVerificationError
      );
    });

    // Add similar tests for assertNeuralConnection, assertBrainScan, assertBrainModel if needed
  });
});

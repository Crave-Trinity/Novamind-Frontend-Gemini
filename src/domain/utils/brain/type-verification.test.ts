/**
 * NOVAMIND Neural-Safe Type Verification
 * Brain-specific type verification utilities tests with quantum-level precision
 */

import { describe, it, expect } from 'vitest';
import { brainTypeVerifier, BrainTypeVerifier } from '@domain/utils/brain/type-verification.ts'; // Add .ts extension
import { RenderMode } from '@domain/types/brain/visualization';
import { TypeVerificationError } from '@domain/utils/shared/type-verification';

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
      // Assuming RenderMode is an enum with at least ANATOMICAL value
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
    it('verifies valid BrainRegion objects', () => {
      const validRegion = {
        id: 'region1',
        name: 'Prefrontal Cortex',
        position: { x: 10, y: 20, z: 30 },
        color: '#FF0000',
        isActive: true,
        activityLevel: 0.8,
      };

      const result = brainTypeVerifier.verifyBrainRegion(validRegion);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toMatchObject({
          id: 'region1',
          name: 'Prefrontal Cortex',
          position: { x: 10, y: 20, z: 30 },
          color: '#FF0000',
          isActive: true,
          activityLevel: 0.8,
        });
      }
    });

    it('accepts optional properties', () => {
      const regionWithOptionals = {
        id: 'region1',
        name: 'Prefrontal Cortex',
        position: { x: 10, y: 20, z: 30 },
        color: '#FF0000',
        isActive: true,
        activityLevel: 0.8,
        volumeMl: 150,
        riskFactor: 0.2,
      };

      const result = brainTypeVerifier.verifyBrainRegion(regionWithOptionals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.volumeMl).toBe(150);
        expect(result.value.riskFactor).toBe(0.2);
      }
    });

    it('fails when required properties are missing', () => {
      const missingProps = {
        id: 'region1',
        name: 'Prefrontal Cortex',
        // missing position
        color: '#FF0000',
        isActive: true,
        // missing activityLevel
      };

      expect(brainTypeVerifier.verifyBrainRegion(missingProps).success).toBe(false);
    });

    it('fails when properties have wrong types', () => {
      const wrongTypes = {
        id: 123, // should be string
        name: 'Prefrontal Cortex',
        position: { x: 10, y: 20, z: 30 },
        color: '#FF0000',
        isActive: 'yes', // should be boolean
        activityLevel: '0.8', // should be number
      };

      expect(brainTypeVerifier.verifyBrainRegion(wrongTypes).success).toBe(false);
    });
  });

  describe('verifyNeuralConnection', () => {
    it('verifies valid NeuralConnection objects', () => {
      const validConnection = {
        id: 'conn1',
        sourceRegionId: 'region1',
        targetRegionId: 'region2',
        strength: 0.75,
        isActive: true,
      };

      const result = brainTypeVerifier.verifyNeuralConnection(validConnection);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toMatchObject({
          id: 'conn1',
          sourceRegionId: 'region1',
          targetRegionId: 'region2',
          strength: 0.75,
          isActive: true,
        });
      }
    });

    it('accepts optional properties', () => {
      const connectionWithOptionals = {
        id: 'conn1',
        sourceRegionId: 'region1',
        targetRegionId: 'region2',
        strength: 0.75,
        isActive: true,
        connectionType: 'excitatory',
        color: '#00FF00',
      };

      const result = brainTypeVerifier.verifyNeuralConnection(connectionWithOptionals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.connectionType).toBe('excitatory');
        expect(result.value.color).toBe('#00FF00');
      }
    });

    it('fails when required properties are missing', () => {
      const missingProps = {
        id: 'conn1',
        // missing sourceRegionId
        targetRegionId: 'region2',
        strength: 0.75,
        // missing isActive
      };

      expect(brainTypeVerifier.verifyNeuralConnection(missingProps).success).toBe(false);
    });
  });

  describe('verifyBrainModel', () => {
    it('verifies valid BrainModel objects', () => {
      const validModel = {
        id: 'model1',
        name: 'Test Brain Model',
        regions: [
          {
            id: 'region1',
            name: 'Prefrontal Cortex',
            position: { x: 10, y: 20, z: 30 },
            color: '#FF0000',
            isActive: true,
            activityLevel: 0.8,
          },
        ],
        connections: [
          {
            id: 'conn1',
            sourceRegionId: 'region1',
            targetRegionId: 'region2',
            strength: 0.75,
            isActive: true,
          },
        ],
        version: 1,
      };

      const result = brainTypeVerifier.verifyBrainModel(validModel);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toMatchObject({
          id: 'model1',
          name: 'Test Brain Model',
          regions: [expect.objectContaining({ id: 'region1' })],
          connections: [expect.objectContaining({ id: 'conn1' })],
          version: 1,
        });
      }
    });

    it('accepts optional properties', () => {
      const modelWithOptionals = {
        id: 'model1',
        name: 'Test Brain Model',
        regions: [
          {
            id: 'region1',
            name: 'Prefrontal Cortex',
            position: { x: 10, y: 20, z: 30 },
            color: '#FF0000',
            isActive: true,
            activityLevel: 0.8,
          },
        ],
        connections: [
          {
            id: 'conn1',
            sourceRegionId: 'region1',
            targetRegionId: 'region2',
            strength: 0.75,
            isActive: true,
          },
        ],
        version: 1,
        // Removed properties not present in BrainModel type:
        // patientId: 'patient1',
        // scanDate: '2025-03-31',
        // modelType: 'fMRI',
        // isTemplate: false,
        // metadata: { notes: 'Test model' },
      };

      const result = brainTypeVerifier.verifyBrainModel(modelWithOptionals);
      expect(result.success).toBe(true);
      // Removed assertions for properties not present in BrainModel type
    });

    it('fails when required properties are missing', () => {
      const missingProps = {
        id: 'model1',
        // missing name
        regions: [],
        // missing connections
        version: 1,
      };

      expect(brainTypeVerifier.verifyBrainModel(missingProps).success).toBe(false);
    });

    it('fails when arrays contain invalid items', () => {
      const invalidItems = {
        id: 'model1',
        name: 'Test Brain Model',
        regions: [
          {
            // Invalid region missing required properties
            id: 'region1',
          },
        ],
        connections: [
          {
            id: 'conn1',
            sourceRegionId: 'region1',
            targetRegionId: 'region2',
            strength: 0.75,
            isActive: true,
          },
        ],
        version: 1,
      };

      expect(brainTypeVerifier.verifyBrainModel(invalidItems).success).toBe(false);
    });
  });

  describe('assertion functions', () => {
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
      const validRegion = {
        id: 'region1',
        name: 'Prefrontal Cortex',
        position: { x: 10, y: 20, z: 30 },
        color: '#FF0000',
        isActive: true,
        activityLevel: 0.8,
      };

      expect(() => brainTypeVerifier.assertBrainRegion(validRegion)).not.toThrow();
    });

    it('assertBrainRegion throws for invalid BrainRegion', () => {
      const invalidRegion = {
        id: 'region1',
        // Missing required properties
      };

      expect(() => brainTypeVerifier.assertBrainRegion(invalidRegion)).toThrow(
        TypeVerificationError
      );
    });
  });
});

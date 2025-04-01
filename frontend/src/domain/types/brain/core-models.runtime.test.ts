/**
 * NOVAMIND Neural Test Suite
 * Brain Core Models runtime validators testing with quantum precision
 */

import { describe, it, expect } from 'vitest';
import {
  Vector3Validator,
  CoordinateValidator,
  BrainRegionValidator,
  ConnectionValidator,
  BrainModelValidator
} from './core-models.runtime';

describe('Brain Core Models runtime validators', () => {
  describe('Vector3Validator', () => {
    it('validates valid Vector3 objects', () => {
      expect(Vector3Validator.isValid({ x: 1, y: 2, z: 3 })).toBe(true);
      expect(Vector3Validator.isValid({ x: -1.5, y: 0, z: 3.14 })).toBe(true);
    });

    it('rejects invalid Vector3 objects', () => {
      expect(Vector3Validator.isValid(null)).toBe(false);
      expect(Vector3Validator.isValid(undefined)).toBe(false);
      expect(Vector3Validator.isValid({})).toBe(false);
      expect(Vector3Validator.isValid({ x: 1, y: '2', z: 3 })).toBe(false);
      expect(Vector3Validator.isValid({ x: 1, y: 2 })).toBe(false);
      expect(Vector3Validator.isValid('not an object')).toBe(false);
    });
  });

  describe('CoordinateValidator', () => {
    it('validates valid Coordinate objects', () => {
      expect(CoordinateValidator.isValid({ x: 1, y: 2, z: 3, label: 'Point A' })).toBe(true);
      expect(CoordinateValidator.isValid({ x: -1.5, y: 0, z: 3.14, label: '' })).toBe(true);
    });

    it('rejects invalid Coordinate objects', () => {
      expect(CoordinateValidator.isValid(null)).toBe(false);
      expect(CoordinateValidator.isValid(undefined)).toBe(false);
      expect(CoordinateValidator.isValid({})).toBe(false);
      expect(CoordinateValidator.isValid({ x: 1, y: 2, z: 3 })).toBe(false);
      expect(CoordinateValidator.isValid({ x: 1, y: 2, z: 3, label: 5 })).toBe(false);
      expect(CoordinateValidator.isValid('not an object')).toBe(false);
    });
  });

  describe('BrainRegionValidator', () => {
    const validRegion = {
      id: 'r1',
      name: 'Amygdala',
      position: { x: 1, y: 2, z: 3 },
      color: '#ff0000',
      connections: ['r2', 'r3'],
      activityLevel: 0.75,
      isActive: true
    };

    it('validates valid BrainRegion objects', () => {
      expect(BrainRegionValidator.isValid(validRegion)).toBe(true);
      expect(BrainRegionValidator.isValid({
        ...validRegion,
        volumeMl: 2.5,
        riskFactor: 0.3
      })).toBe(true);
    });

    it('rejects invalid BrainRegion objects', () => {
      expect(BrainRegionValidator.isValid(null)).toBe(false);
      expect(BrainRegionValidator.isValid(undefined)).toBe(false);
      expect(BrainRegionValidator.isValid({})).toBe(false);
      expect(BrainRegionValidator.isValid({
        ...validRegion,
        position: { x: 1, y: 2 }
      })).toBe(false);
      expect(BrainRegionValidator.isValid({
        ...validRegion,
        connections: ['r2', 3]
      })).toBe(false);
    });
  });

  describe('ConnectionValidator', () => {
    const validConnection = {
      id: 'conn1',
      sourceId: 'r1',
      targetId: 'r2',
      strength: 0.8,
      type: 'excitatory',
      isActive: true,
      color: '#00ff00'
    };

    it('validates valid Connection objects', () => {
      expect(ConnectionValidator.isValid(validConnection)).toBe(true);
    });

    it('rejects invalid Connection objects', () => {
      expect(ConnectionValidator.isValid(null)).toBe(false);
      expect(ConnectionValidator.isValid(undefined)).toBe(false);
      expect(ConnectionValidator.isValid({})).toBe(false);
      expect(ConnectionValidator.isValid({
        ...validConnection,
        strength: '0.8'
      })).toBe(false);
      expect(ConnectionValidator.isValid({
        ...validConnection,
        isActive: 'true'
      })).toBe(false);
    });
  });

  describe('BrainModelValidator', () => {
    const validRegion = {
      id: 'r1',
      name: 'Amygdala',
      position: { x: 1, y: 2, z: 3 },
      color: '#ff0000',
      connections: ['r2'],
      activityLevel: 0.75,
      isActive: true
    };

    const validConnection = {
      id: 'conn1',
      sourceId: 'r1',
      targetId: 'r2',
      strength: 0.8,
      type: 'excitatory',
      isActive: true,
      color: '#00ff00'
    };

    const validModel = {
      id: 'model1',
      name: 'Default Brain Model',
      regions: [validRegion],
      connections: [validConnection]
    };

    it('validates valid BrainModel objects', () => {
      expect(BrainModelValidator.isValid(validModel)).toBe(true);
      expect(BrainModelValidator.isValid({
        ...validModel,
        patients: ['p1', 'p2'],
        modelType: 'standard',
        anatomicalCoordinates: [
          { x: 1, y: 2, z: 3, label: 'Point A' }
        ]
      })).toBe(true);
    });

    it('rejects invalid BrainModel objects', () => {
      expect(BrainModelValidator.isValid(null)).toBe(false);
      expect(BrainModelValidator.isValid(undefined)).toBe(false);
      expect(BrainModelValidator.isValid({})).toBe(false);
      expect(BrainModelValidator.isValid({
        ...validModel,
        regions: [{ ...validRegion, position: { x: 1, y: 2 } }]
      })).toBe(false);
      expect(BrainModelValidator.isValid({
        ...validModel,
        anatomicalCoordinates: [{ x: 1, y: 2, z: 3 }]
      })).toBe(false);
    });
  });
});

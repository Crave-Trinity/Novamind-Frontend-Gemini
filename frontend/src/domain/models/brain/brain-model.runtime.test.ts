/**
 * NOVAMIND Neural Test Suite
 * Brain Model Runtime Validators Testing
 */

import { describe, it, expect } from 'vitest';
import {
  BrainRegionValidator,
  NeuralConnectionValidator,
  BrainModelValidator
} from './brain-model.runtime';

describe('Brain Model Runtime Validators', () => {
  describe('BrainRegionValidator', () => {
    it('validates valid BrainRegion objects', () => {
      const validRegion = {
        id: 'region-1',
        name: 'Prefrontal Cortex',
        position: { x: 1, y: 2, z: 3 },
        color: '#ff0000',
        isActive: true,
        activityLevel: 0.75
      };
      
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
        id: 'region-1',
        name: 'Prefrontal Cortex',
        position: { x: 1 }, // Missing y and z
        color: '#ff0000',
        isActive: true,
        activityLevel: 0.75
      })).toBe(false);
      expect(BrainRegionValidator.isValid({
        id: 'region-1',
        name: 'Prefrontal Cortex',
        position: { x: 1, y: 2, z: 3 },
        color: '#ff0000',
        isActive: 'true', // Wrong type
        activityLevel: 0.75
      })).toBe(false);
    });

    it('normalizes partial BrainRegion objects', () => {
      const normalized = BrainRegionValidator.normalize({
        name: 'Amygdala'
      });
      
      expect(normalized.id).toBeDefined();
      expect(normalized.name).toBe('Amygdala');
      expect(normalized.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(normalized.color).toBe('#cccccc');
      expect(normalized.isActive).toBe(false);
      expect(normalized.activityLevel).toBe(0);
    });
  });

  describe('NeuralConnectionValidator', () => {
    it('validates valid NeuralConnection objects', () => {
      const validConnection = {
        id: 'conn-1',
        sourceRegionId: 'region-1',
        targetRegionId: 'region-2',
        strength: 0.8,
        isActive: true
      };
      
      expect(NeuralConnectionValidator.isValid(validConnection)).toBe(true);
      expect(NeuralConnectionValidator.isValid({
        ...validConnection,
        connectionType: 'excitatory',
        color: '#00ff00'
      })).toBe(true);
    });

    it('rejects invalid NeuralConnection objects', () => {
      expect(NeuralConnectionValidator.isValid(null)).toBe(false);
      expect(NeuralConnectionValidator.isValid(undefined)).toBe(false);
      expect(NeuralConnectionValidator.isValid({})).toBe(false);
      expect(NeuralConnectionValidator.isValid({
        id: 'conn-1',
        sourceRegionId: 123, // Wrong type
        targetRegionId: 'region-2',
        strength: 0.8,
        isActive: true
      })).toBe(false);
      expect(NeuralConnectionValidator.isValid({
        id: 'conn-1',
        sourceRegionId: 'region-1',
        targetRegionId: 'region-2',
        strength: '0.8', // Wrong type
        isActive: true
      })).toBe(false);
    });

    it('normalizes partial NeuralConnection objects', () => {
      const normalized = NeuralConnectionValidator.normalize({
        sourceRegionId: 'region-1',
        targetRegionId: 'region-2'
      });
      
      expect(normalized.id).toBeDefined();
      expect(normalized.sourceRegionId).toBe('region-1');
      expect(normalized.targetRegionId).toBe('region-2');
      expect(normalized.strength).toBe(1.0);
      expect(normalized.isActive).toBe(true);
      expect(normalized.color).toBe('#888888');
    });
  });

  describe('BrainModelValidator', () => {
    const validRegion = {
      id: 'region-1',
      name: 'Prefrontal Cortex',
      position: { x: 1, y: 2, z: 3 },
      color: '#ff0000',
      isActive: true,
      activityLevel: 0.75
    };
    
    const validConnection = {
      id: 'conn-1',
      sourceRegionId: 'region-1',
      targetRegionId: 'region-2',
      strength: 0.8,
      isActive: true
    };
    
    const validModel = {
      id: 'model-1',
      name: 'Test Brain Model',
      regions: [validRegion],
      connections: [validConnection],
      version: 1
    };

    it('validates valid BrainModel objects', () => {
      expect(BrainModelValidator.isValid(validModel)).toBe(true);
      expect(BrainModelValidator.isValid({
        ...validModel,
        patientId: 'patient-1',
        scanDate: new Date(),
        modelType: 'clinical',
        isTemplate: false,
        metadata: { source: 'manual' }
      })).toBe(true);
    });

    it('rejects invalid BrainModel objects', () => {
      expect(BrainModelValidator.isValid(null)).toBe(false);
      expect(BrainModelValidator.isValid(undefined)).toBe(false);
      expect(BrainModelValidator.isValid({})).toBe(false);
      expect(BrainModelValidator.isValid({
        ...validModel,
        regions: [{ ...validRegion, position: { x: 1 } }] // Invalid region
      })).toBe(false);
      expect(BrainModelValidator.isValid({
        ...validModel,
        connections: [{ ...validConnection, strength: '0.8' }] // Invalid connection
      })).toBe(false);
      expect(BrainModelValidator.isValid({
        ...validModel,
        version: '1' // Wrong type
      })).toBe(false);
    });

    it('normalizes partial BrainModel objects', () => {
      const normalized = BrainModelValidator.normalize({
        name: 'Custom Model'
      });
      
      expect(normalized.id).toBeDefined();
      expect(normalized.name).toBe('Custom Model');
      expect(Array.isArray(normalized.regions)).toBe(true);
      expect(Array.isArray(normalized.connections)).toBe(true);
      expect(normalized.version).toBe(1);
      expect(normalized.metadata).toEqual({});
    });

    it('normalizes model with partial regions and connections', () => {
      const normalized = BrainModelValidator.normalize({
        regions: [{ name: 'Amygdala' }],
        connections: [{ sourceRegionId: 'r1', targetRegionId: 'r2' }]
      });
      
      expect(normalized.regions[0].name).toBe('Amygdala');
      expect(normalized.regions[0].position).toEqual({ x: 0, y: 0, z: 0 });
      expect(normalized.connections[0].sourceRegionId).toBe('r1');
      expect(normalized.connections[0].targetRegionId).toBe('r2');
    });
  });
});

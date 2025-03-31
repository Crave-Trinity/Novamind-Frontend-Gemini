import { /**
 * NOVAMIND Testing Framework
 * BrainModel Domain Model Test
 * 
 * This file tests the core functionality of the BrainModel domain model
 * using a TypeScript-only approach.
 */

import { describe, it, expect } from 'vitest';
import BrainModel from './BrainModel';
import { BrainRegion, NeuralConnection } from '../types/brain';

// Define test data with proper TypeScript types
interface TestBrainData {
  id?: string;
  regions?: BrainRegion[];
  connections?: NeuralConnection[];
  activityLevel?: number;
}

describe('BrainModel', () => {
  it('creates a model with default values when no data is provided', () => {
    const model = BrainModel();
    
    expect(model).toBeDefined();
    expect(model.id).toBeDefined();
    expect(model.regions).toEqual([]);
    expect(model.connections).toEqual([]);
  });
  
  it('creates a model with provided values', () => {
    const testData: TestBrainData = {
      id: 'test-brain-123',
      regions: [
        {
        id: "region-1",
        name: "Prefrontal Cortex",
        activityLevel: 0.7,
        position: { x: 0, y: 0, z: 0 },
        color: "#4285F4",
        connections: [],
        isActive: true
      },
        {
        id: "region-2",
        name: "Amygdala",
        activityLevel: 0.5,
        position: { x: 0, y: 0, z: 0 },
        color: "#4285F4",
        connections: [],
        isActive: false
      }
      ],
      connections: [
        { id: 'connection-1', sourceId: 'region-1', targetId: 'region-2', strength: 0.8 }
      ],
      activityLevel: 0.65
    };
    
    const model = BrainModel(testData);
    
    expect(model.id).toBe('test-brain-123');
    expect(model.regions).toHaveLength(2);
    expect(model.connections).toHaveLength(1);
    expect(model.activityLevel).toBe(0.65);
  });
  
  it('handles edge cases gracefully', () => {
    // Test with empty arrays
    const emptyData: TestBrainData = {
      regions: [],
      connections: []
    };
    
    const emptyModel = BrainModel(emptyData);
    expect(emptyModel.regions).toEqual([]);
    expect(emptyModel.connections).toEqual([]);
    
    // Test with undefined values
    const partialData: Partial<TestBrainData> = {
      id: 'partial-brain'
    };
    
    const partialModel = BrainModel(partialData);
    expect(partialModel.id).toBe('partial-brain');
    expect(partialModel.regions).toEqual([]);
    expect(partialModel.connections).toEqual([]);
  });
});
 } from "";
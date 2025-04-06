/**
 * NOVAMIND Neural Test Suite
 * activity type testing with quantum precision
 */

import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { ActivationLevel } from '@domain/types/brain/activity'; // Add @domain prefix

// Type imports for type annotations only, not for runtime checks
import type {
  NeuralActivityState,
  NeuralActivationPattern,
  NeuralStateTransition,
  TemporalActivationSequence,
  NeuralActivityHeatmap,
  ActivityVisualizationSettings,
} from '@domain/types/brain/activity'; // Correct path alias

describe('activity type definitions', () => {
  it('exports ActivationLevel with correct structure', () => {
    expect(ActivationLevel).toBeDefined();
    expect(ActivationLevel.NONE).toBe('none');
    expect(ActivationLevel.LOW).toBe('low');
    expect(ActivationLevel.MEDIUM).toBe('medium');
    expect(ActivationLevel.HIGH).toBe('high');
    expect(ActivationLevel.EXTREME).toBe('extreme');
  });

  it('can use NeuralActivityState type for activity states', () => {
    // Test type usage
    const sampleState: NeuralActivityState = {
      entityId: 'r1',
      entityType: 'region',
      timestamp: Date.now(),
      rawActivity: 0.5,
      activationLevel: ActivationLevel.MEDIUM, // Use enum
      activationDuration: 100,
    };
    expect(sampleState).toBeDefined();
    expect(sampleState.entityType).toBe('region');
  });

  it('can use NeuralActivationPattern type for activation patterns', () => {
    // Test type usage
    const samplePattern: NeuralActivationPattern = {
      id: 'p1',
      name: 'Test Pattern',
      regionActivations: [],
      clinicalSignificance: 0.7,
      evidenceLevel: 'emerging',
    };
    expect(samplePattern).toBeDefined();
    expect(samplePattern.id).toBe('p1');
  });

  it('can use NeuralStateTransition type for neural transitions', () => {
    // Test type usage
    const baseActivityState: NeuralActivityState = {
      entityId: 'r1',
      entityType: 'region',
      timestamp: Date.now(),
      rawActivity: 0.3,
      activationLevel: ActivationLevel.LOW,
      activationDuration: 100,
    };

    const targetActivityState: NeuralActivityState = {
      ...baseActivityState,
      rawActivity: 0.8,
      activationLevel: ActivationLevel.HIGH,
      timestamp: baseActivityState.timestamp + 500,
    };

    const sampleTransition: NeuralStateTransition = {
      id: 't1',
      entityId: 'r1',
      entityType: 'region',
      startState: baseActivityState,
      endState: targetActivityState,
      transitionDuration: 500,
      transitionType: 'gradual',
      clinicallySignificant: true,
    };
    expect(sampleTransition).toBeDefined();
    expect(sampleTransition.transitionType).toBe('gradual');
  });

  it('can use TemporalActivationSequence type for sequences', () => {
    // Test type usage
    const sampleSequence: TemporalActivationSequence = {
      id: 'seq1',
      name: 'Test Sequence',
      timeSteps: [
        {
          timeOffset: 0,
          activationStates: [],
        },
        {
          timeOffset: 100,
          activationStates: [],
        },
      ],
      clinicalSignificance: 0.8,
      evidenceLevel: 'established',
    };
    expect(sampleSequence).toBeDefined();
    expect(sampleSequence.timeSteps.length).toBe(2);
  });

  it('can use NeuralActivityHeatmap type for spatial activity maps', () => {
    // Test type usage
    const mockFloat32Array = new Float32Array(27); // 3x3x3 grid
    const sampleHeatmap: NeuralActivityHeatmap = {
      id: 'heatmap1',
      timestamp: Date.now(),
      resolution: new Vector3(3, 3, 3),
      dimensions: new Vector3(100, 100, 100),
      intensityValues: mockFloat32Array,
      clinicalSignificance: 0.9,
    };
    expect(sampleHeatmap).toBeDefined();
    expect(sampleHeatmap.intensityValues.length).toBe(27);
  });

  it('can use ActivityVisualizationSettings type for visualization', () => {
    // Test type usage
    const sampleSettings: ActivityVisualizationSettings = {
      minDisplayThreshold: 0.2,
      highActivityThreshold: 0.7,
      colorMapName: 'clinical',
      usePulsation: true,
      pulsationSpeed: 0.5,
      useGlow: true,
      glowIntensity: 0.3,
      temporalSmoothingFactor: 0.2,
      temporalScale: 1.0,
      showConfidenceIntervals: true,
      highlightClinicallySignificant: true,
    };
    expect(sampleSettings).toBeDefined();
    expect(sampleSettings.colorMapName).toBe('clinical');
  });
});

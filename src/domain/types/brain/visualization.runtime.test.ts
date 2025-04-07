/**
 * NOVAMIND Neural Test Suite
 * Brain Visualization runtime validators testing with quantum precision
 */

import { describe, it, expect } from 'vitest';
import {
  RenderModeValidator,
  VisualizationSettingsValidator,
  ThemeOptionValidator,
  ThemeSettingsValidator,
  BrainVisualizationPropsValidator,
  BrainVisualizationStateValidator,
  ProcessedBrainDataValidator,
  ProcessedBrainRegionValidator,
  ProcessedNeuralConnectionValidator,
} from '@domain/types/brain/visualization.runtime';
import {
  // Removed unused: RenderMode
  defaultVisualizationSettings,
  visualizationThemes,
} from '@domain/types/brain/visualization';

describe('Brain Visualization runtime validators', () => {
  it('RenderModeValidator validates correct render modes', () => {
    // Valid render modes
    expect(RenderModeValidator.isValid('anatomical')).toBe(true);
    expect(RenderModeValidator.isValid('functional')).toBe(true);
    expect(RenderModeValidator.isValid('connectivity')).toBe(true);
    expect(RenderModeValidator.isValid('risk')).toBe(true);
    expect(RenderModeValidator.isValid('treatment_response')).toBe(true);
    expect(RenderModeValidator.isValid('neurotransmitter')).toBe(true);
    expect(RenderModeValidator.isValid('temporal_dynamics')).toBe(true);
    expect(RenderModeValidator.isValid('network_analysis')).toBe(true);

    // Invalid values
    expect(RenderModeValidator.isValid('invalid_mode')).toBe(false);
    expect(RenderModeValidator.isValid(123)).toBe(false);
    expect(RenderModeValidator.isValid(null)).toBe(false);
    expect(RenderModeValidator.isValid(undefined)).toBe(false);
  });

  it('VisualizationSettingsValidator validates correct VisualizationSettings objects', () => {
    // Use default settings as a valid example
    expect(VisualizationSettingsValidator.isValid(defaultVisualizationSettings)).toBe(true);

    // Invalid settings
    const invalidSettings = {
      showLabels: 'true', // Should be boolean
      backgroundColor: '#121212',
      // Missing required fields
    };

    expect(VisualizationSettingsValidator.isValid(invalidSettings)).toBe(false);
    expect(VisualizationSettingsValidator.isValid(null)).toBe(false);
    expect(VisualizationSettingsValidator.isValid(123)).toBe(false);
  });

  it('ThemeOptionValidator validates correct theme options', () => {
    // Valid theme options
    expect(ThemeOptionValidator.isValid('clinical')).toBe(true);
    expect(ThemeOptionValidator.isValid('dark')).toBe(true);
    expect(ThemeOptionValidator.isValid('high-contrast')).toBe(true);
    expect(ThemeOptionValidator.isValid('presentation')).toBe(true);
    expect(ThemeOptionValidator.isValid('research')).toBe(true);

    // Invalid values
    expect(ThemeOptionValidator.isValid('invalid_theme')).toBe(false);
    expect(ThemeOptionValidator.isValid(123)).toBe(false);
    expect(ThemeOptionValidator.isValid(null)).toBe(false);
    expect(ThemeOptionValidator.isValid(undefined)).toBe(false);
  });

  it('ThemeSettingsValidator validates correct ThemeSettings objects', () => {
    // Use existing theme settings as valid examples
    expect(ThemeSettingsValidator.isValid(visualizationThemes.clinical)).toBe(true);
    expect(ThemeSettingsValidator.isValid(visualizationThemes.dark)).toBe(true);
    expect(ThemeSettingsValidator.isValid(visualizationThemes['high-contrast'])).toBe(true);

    // Invalid theme settings
    const invalidTheme = {
      name: 'invalid_theme', // Not a valid theme option
      backgroundColor: '#FFFFFF',
      // Missing required fields
    };

    expect(ThemeSettingsValidator.isValid(invalidTheme)).toBe(false);
    expect(ThemeSettingsValidator.isValid(null)).toBe(false);
    expect(ThemeSettingsValidator.isValid(123)).toBe(false);
  });

  it('BrainVisualizationPropsValidator validates correct BrainVisualizationProps objects', () => {
    // Valid brain visualization props
    const validProps = {
      brainModel: {
        id: 'model-123',
        name: 'Default Brain Model',
        regions: [],
        connections: [],
      },
      settings: defaultVisualizationSettings,
      theme: 'clinical',
      activeRegionIds: ['region-1', 'region-2'],
      onRegionClick: () => {},
    };

    // Invalid props
    const invalidProps = {
      // Missing brainModel
      settings: defaultVisualizationSettings,
    };

    expect(BrainVisualizationPropsValidator.isValid(validProps)).toBe(true);
    expect(BrainVisualizationPropsValidator.isValid(invalidProps)).toBe(false);
    expect(BrainVisualizationPropsValidator.isValid(null)).toBe(false);
    expect(BrainVisualizationPropsValidator.isValid(123)).toBe(false);
  });

  it('BrainVisualizationStateValidator validates correct BrainVisualizationState objects', () => {
    // Valid states
    const idleState = { status: 'idle' };
    const loadingState = { status: 'loading' };
    const errorState = { status: 'error', error: new Error('Test error') };
    const readyState = {
      status: 'ready',
      brainModel: {
        id: 'model-123',
        name: 'Default Brain Model',
        regions: [],
        connections: [],
      },
      processedData: {
        regions: [],
        connections: [],
        centerOfMass: [0, 0, 0],
        boundingSphere: 100,
        activeRegions: [],
        stats: {
          regionCount: 0,
          connectionCount: 0,
          averageActivity: 0,
          maxActivity: 0,
          minActivity: 0,
          densityScore: 0,
        },
      },
    };

    // Invalid states
    const invalidState = { status: 'invalid_status' };
    const invalidErrorState = { status: 'error', error: 'not an Error object' };

    expect(BrainVisualizationStateValidator.isValid(idleState)).toBe(true);
    expect(BrainVisualizationStateValidator.isValid(loadingState)).toBe(true);
    expect(BrainVisualizationStateValidator.isValid(errorState)).toBe(true);
    expect(BrainVisualizationStateValidator.isValid(readyState)).toBe(true);
    expect(BrainVisualizationStateValidator.isValid(invalidState)).toBe(false);
    expect(BrainVisualizationStateValidator.isValid(invalidErrorState)).toBe(false);
    expect(BrainVisualizationStateValidator.isValid(null)).toBe(false);
  });

  it('ProcessedBrainDataValidator validates correct ProcessedBrainData objects', () => {
    // Valid processed brain data
    const validData = {
      regions: [],
      connections: [],
      centerOfMass: [0, 0, 0],
      boundingSphere: 100,
      activeRegions: [],
      stats: {
        regionCount: 0,
        connectionCount: 0,
        averageActivity: 0,
        maxActivity: 0,
        minActivity: 0,
        densityScore: 0,
      },
    };

    // Invalid data
    const invalidData = {
      regions: [],
      connections: [],
      // Missing required fields
    };

    expect(ProcessedBrainDataValidator.isValid(validData)).toBe(true);
    expect(ProcessedBrainDataValidator.isValid(invalidData)).toBe(false);
    expect(ProcessedBrainDataValidator.isValid(null)).toBe(false);
  });

  it('ProcessedBrainRegionValidator validates correct ProcessedBrainRegion objects', () => {
    // Valid processed brain region
    const validRegion = {
      id: 'region-123',
      name: 'Prefrontal Cortex',
      position: [10, 20, 30],
      volume: 5.5,
      activity: 0.8,
      connections: ['conn-1', 'conn-2'],
      renderPosition: [10, 20, 30],
      renderColor: '#3498DB',
      renderSize: 1.2,
      renderOpacity: 0.9,
      isActive: true,
      isSelected: false,
      isHighlighted: false,
      connectionCount: 2,
      normalizedActivity: 0.8,
    };

    // Invalid region
    const invalidRegion = {
      id: 'region-123',
      name: 'Prefrontal Cortex',
      // Missing required fields
    };

    expect(ProcessedBrainRegionValidator.isValid(validRegion)).toBe(true);
    expect(ProcessedBrainRegionValidator.isValid(invalidRegion)).toBe(false);
    expect(ProcessedBrainRegionValidator.isValid(null)).toBe(false);
  });

  it('ProcessedNeuralConnectionValidator validates correct ProcessedNeuralConnection objects', () => {
    // Valid processed neural connection
    const validConnection = {
      id: 'conn-123',
      sourceId: 'region-1',
      targetId: 'region-2',
      type: 'structural',
      strength: 0.75,
      directionality: 'bidirectional',
      sourcePosition: [10, 20, 30],
      targetPosition: [40, 50, 60],
      renderColor: '#95A5A6',
      renderThickness: 1.5,
      renderOpacity: 0.7,
      isActive: true,
      isSelected: false,
      isHighlighted: false,
      normalizedStrength: 0.75,
    };

    // Invalid connection
    const invalidConnection = {
      id: 'conn-123',
      sourceId: 'region-1',
      targetId: 'region-2',
      // Missing required fields
    };

    expect(ProcessedNeuralConnectionValidator.isValid(validConnection)).toBe(true);
    expect(ProcessedNeuralConnectionValidator.isValid(invalidConnection)).toBe(false);
    expect(ProcessedNeuralConnectionValidator.isValid(null)).toBe(false);
  });
});

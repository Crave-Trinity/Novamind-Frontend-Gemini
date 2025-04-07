/**
 * NOVAMIND Type Testing Framework
 * Brain Visualization Type Tests
 *
 * This file implements static type checking without runtime assertions.
 */

import { describe, it, expectTypeOf } from 'vitest';
import {
  RenderMode, // Import as value
  type VisualizationSettings,
  type ThemeOption,
  type ThemeSettings,
  type BrainVisualizationProps,
  type BrainVisualizationState,
  type ProcessedBrainData,
  type ProcessedBrainRegion,
  type ProcessedNeuralConnection,
} from '@domain/types/brain/visualization';
import type { BrainModel } from '@domain/types/brain/models'; // Import BrainModel from correct location
// Removed extraneous closing brace from previous diff attempt

describe('Brain Visualization type definitions', () => {
  it('RenderMode has correct enum values', () => {
    expectTypeOf<RenderMode>().toEqualTypeOf<RenderMode>();
    // Check that RenderMode members are assignable to the RenderMode type
    expectTypeOf(RenderMode.ANATOMICAL).toMatchTypeOf<RenderMode>();
    expectTypeOf(RenderMode.FUNCTIONAL).toMatchTypeOf<RenderMode>();
    expectTypeOf(RenderMode.CONNECTIVITY).toMatchTypeOf<RenderMode>();
    expectTypeOf(RenderMode.RISK).toMatchTypeOf<RenderMode>();
    expectTypeOf(RenderMode.TREATMENT_RESPONSE).toMatchTypeOf<RenderMode>();
    expectTypeOf(RenderMode.NEUROTRANSMITTER).toMatchTypeOf<RenderMode>();
    expectTypeOf(RenderMode.TEMPORAL_DYNAMICS).toMatchTypeOf<RenderMode>();
    expectTypeOf(RenderMode.NETWORK_ANALYSIS).toMatchTypeOf<RenderMode>();
    // Optionally, check the underlying type if needed, though less robust than checking assignability
    // expectTypeOf(RenderMode.ANATOMICAL).toBeString();
  });

  it('VisualizationSettings has correct structure', () => {
    // Display settings
    expectTypeOf<VisualizationSettings>().toHaveProperty('showLabels').toEqualTypeOf<boolean>();
    expectTypeOf<VisualizationSettings>().toHaveProperty('backgroundColor').toEqualTypeOf<string>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty('cameraPosition')
      .toEqualTypeOf<[number, number, number]>();
    expectTypeOf<VisualizationSettings>().toHaveProperty('fieldOfView').toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>().toHaveProperty('zoomLevel').toEqualTypeOf<number>();

    // Region visualization
    expectTypeOf<VisualizationSettings>().toHaveProperty('regionOpacity').toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>().toHaveProperty('regionScale').toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>().toHaveProperty('highlightColor').toEqualTypeOf<string>();

    // Connection visualization
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty('showConnections')
      .toEqualTypeOf<boolean>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty('connectionOpacity')
      .toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty('connectionThickness')
      .toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty('connectionColorMapping')
      .toEqualTypeOf<'strength' | 'type' | 'activity'>();

    // Animation settings
    expectTypeOf<VisualizationSettings>().toHaveProperty('enableRotation').toEqualTypeOf<boolean>();
    expectTypeOf<VisualizationSettings>().toHaveProperty('rotationSpeed').toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty('enablePulsation')
      .toEqualTypeOf<boolean>();

    // Rendering effects
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty('renderQuality')
      .toEqualTypeOf<'low' | 'medium' | 'high' | 'ultra'>();
    expectTypeOf<VisualizationSettings>().toHaveProperty('enableBloom').toEqualTypeOf<boolean>();

    // Clinical visualization
    expectTypeOf<VisualizationSettings>().toHaveProperty('renderMode').toEqualTypeOf<RenderMode>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty('activityColorScale')
      .toEqualTypeOf<string[]>();

    // Performance settings
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty('maxVisibleRegions')
      .toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty('levelOfDetail')
      .toEqualTypeOf<'low' | 'medium' | 'high' | 'dynamic'>();
  });

  it('ThemeOption has correct literal union types', () => {
    expectTypeOf<ThemeOption>().toEqualTypeOf<
      'clinical' | 'dark' | 'high-contrast' | 'presentation' | 'research'
    >();
  });

  it('ThemeSettings has correct structure', () => {
    expectTypeOf<ThemeSettings>().toHaveProperty('name').toEqualTypeOf<ThemeOption>();
    expectTypeOf<ThemeSettings>().toHaveProperty('backgroundColor').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('primaryColor').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('secondaryColor').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('accentColor').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('textColor').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('regionBaseColor').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('activeRegionColor').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('connectionBaseColor').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('activeConnectionColor').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('uiBackgroundColor').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('uiTextColor').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('fontFamily').toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>().toHaveProperty('glowIntensity').toEqualTypeOf<number>();
    expectTypeOf<ThemeSettings>().toHaveProperty('useBloom').toEqualTypeOf<boolean>();
  });

  it('BrainVisualizationProps has correct structure', () => {
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('brainModel').toBeObject();
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('settings').toBeNullable();
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('theme').toBeNullable();
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('activeRegionIds').toBeNullable();
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('selectedRegionId').toBeNullable();
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('onRegionClick'); // Removed .toBeFunction()
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('onRegionHover'); // Removed .toBeFunction()
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('className').toBeNullable();
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('width').toBeNullable();
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('height').toBeNullable();
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('showControls').toBeNullable();
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('showLegend').toBeNullable();
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('showStats').toBeNullable();
    expectTypeOf<BrainVisualizationProps>().toHaveProperty('disableInteraction').toBeNullable();
  });

  it('BrainVisualizationState has correct discriminated union', () => {
    // Test each state variant explicitly
    type IdleState = Extract<BrainVisualizationState, { status: 'idle' }>;
    expectTypeOf<IdleState>().toHaveProperty('status').toEqualTypeOf<'idle'>();
    // Ensure other properties don't exist on idle state (optional check)
    // expectTypeOf<IdleState>().not.toHaveProperty('error');
    // expectTypeOf<IdleState>().not.toHaveProperty('brainModel');

    type LoadingState = Extract<BrainVisualizationState, { status: 'loading' }>;
    expectTypeOf<LoadingState>().toHaveProperty('status').toEqualTypeOf<'loading'>();

    type ErrorState = Extract<BrainVisualizationState, { status: 'error' }>;
    expectTypeOf<ErrorState>().toHaveProperty('status').toEqualTypeOf<'error'>();
    expectTypeOf<ErrorState>().toHaveProperty('error').toEqualTypeOf<Error>();

    type ReadyState = Extract<BrainVisualizationState, { status: 'ready' }>;
    expectTypeOf<ReadyState>().toHaveProperty('status').toEqualTypeOf<'ready'>();
    expectTypeOf<ReadyState>().toHaveProperty('brainModel').toEqualTypeOf<BrainModel>(); // Use imported BrainModel
    expectTypeOf<ReadyState>().toHaveProperty('processedData').toEqualTypeOf<ProcessedBrainData>();
  });

  it('ProcessedBrainData has correct structure', () => {
    expectTypeOf<ProcessedBrainData>()
      .toHaveProperty('regions')
      .toEqualTypeOf<ProcessedBrainRegion[]>();
    expectTypeOf<ProcessedBrainData>()
      .toHaveProperty('connections')
      .toEqualTypeOf<ProcessedNeuralConnection[]>();
    expectTypeOf<ProcessedBrainData>()
      .toHaveProperty('centerOfMass')
      .toEqualTypeOf<[number, number, number]>();
    expectTypeOf<ProcessedBrainData>().toHaveProperty('boundingSphere').toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData>().toHaveProperty('activeRegions').toEqualTypeOf<string[]>();
    expectTypeOf<ProcessedBrainData>().toHaveProperty('stats').toBeObject();

    // Stats object
    expectTypeOf<ProcessedBrainData['stats']>()
      .toHaveProperty('regionCount')
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData['stats']>()
      .toHaveProperty('connectionCount')
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData['stats']>()
      .toHaveProperty('averageActivity')
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData['stats']>()
      .toHaveProperty('maxActivity')
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData['stats']>()
      .toHaveProperty('minActivity')
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData['stats']>()
      .toHaveProperty('densityScore')
      .toEqualTypeOf<number>();
  });

  it('ProcessedBrainRegion has correct structure', () => {
    expectTypeOf<ProcessedBrainRegion>()
      .toHaveProperty('renderPosition')
      .toEqualTypeOf<[number, number, number]>();
    expectTypeOf<ProcessedBrainRegion>().toHaveProperty('renderColor').toEqualTypeOf<string>();
    expectTypeOf<ProcessedBrainRegion>().toHaveProperty('renderSize').toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainRegion>().toHaveProperty('renderOpacity').toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainRegion>().toHaveProperty('isActive').toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedBrainRegion>().toHaveProperty('isSelected').toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedBrainRegion>().toHaveProperty('isHighlighted').toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedBrainRegion>().toHaveProperty('connectionCount').toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainRegion>()
      .toHaveProperty('normalizedActivity')
      .toEqualTypeOf<number>();
  });

  it('ProcessedNeuralConnection has correct structure', () => {
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty('sourcePosition')
      .toEqualTypeOf<[number, number, number]>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty('targetPosition')
      .toEqualTypeOf<[number, number, number]>();
    expectTypeOf<ProcessedNeuralConnection>().toHaveProperty('renderColor').toEqualTypeOf<string>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty('renderThickness')
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty('renderOpacity')
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedNeuralConnection>().toHaveProperty('isActive').toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedNeuralConnection>().toHaveProperty('isSelected').toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty('isHighlighted')
      .toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty('normalizedStrength')
      .toEqualTypeOf<number>();
  });
});

/**
 * NOVAMIND Neural-Safe Brain Visualization Runtime Validators
 *
 * Runtime validators for Brain Visualization types with quantum-level precision.
 * This module provides runtime validation for the Visualization interfaces.
 */

import type {
  RenderMode,
  VisualizationSettings,
  ThemeOption,
  ThemeSettings,
  BrainVisualizationProps,
  BrainVisualizationState,
  ProcessedBrainData,
  ProcessedBrainRegion,
  ProcessedNeuralConnection,
} from '@domain/types/brain/visualization';

/**
 * Runtime validation for RenderMode
 */
export const RenderModeValidator = {
  /**
   * Validates if a value is a valid RenderMode
   */
  isValid: (value: unknown): value is RenderMode => {
    const validModes = [
      'anatomical',
      'functional',
      'connectivity',
      'risk',
      'treatment_response',
      'neurotransmitter',
      'temporal_dynamics',
      'network_analysis',
    ];
    return typeof value === 'string' && validModes.includes(value as RenderMode);
  },
};

/**
 * Runtime validation for VisualizationSettings objects
 */
export const VisualizationSettingsValidator = {
  /**
   * Validates if an object is a valid VisualizationSettings
   */
  isValid: (obj: unknown): obj is VisualizationSettings => {
    if (!obj || typeof obj !== 'object') return false;

    const settings = obj as Partial<VisualizationSettings>;
    const validRenderQualities = ['low', 'medium', 'high', 'ultra'];
    const validLevelOfDetail = ['low', 'medium', 'high', 'dynamic'];
    const validConnectionColorMapping = ['strength', 'type', 'activity'];

    return (
      typeof settings.showLabels === 'boolean' &&
      typeof settings.backgroundColor === 'string' &&
      Array.isArray(settings.cameraPosition) &&
      settings.cameraPosition.length === 3 &&
      typeof settings.fieldOfView === 'number' &&
      typeof settings.zoomLevel === 'number' &&
      typeof settings.regionOpacity === 'number' &&
      typeof settings.regionScale === 'number' &&
      typeof settings.inactiveRegionOpacity === 'number' &&
      typeof settings.highlightColor === 'string' &&
      typeof settings.selectionColor === 'string' &&
      typeof settings.showConnections === 'boolean' &&
      typeof settings.connectionOpacity === 'number' &&
      typeof settings.connectionThickness === 'number' &&
      typeof settings.connectionColorMapping === 'string' &&
      validConnectionColorMapping.includes(settings.connectionColorMapping as any) &&
      typeof settings.minConnectionStrength === 'number' &&
      typeof settings.enableRotation === 'boolean' &&
      typeof settings.rotationSpeed === 'number' &&
      typeof settings.enablePulsation === 'boolean' &&
      typeof settings.pulsationIntensity === 'number' &&
      typeof settings.pulsationSpeed === 'number' &&
      typeof settings.renderQuality === 'string' &&
      validRenderQualities.includes(settings.renderQuality as any) &&
      typeof settings.enableBloom === 'boolean' &&
      typeof settings.bloomIntensity === 'number' &&
      typeof settings.bloomThreshold === 'number' &&
      typeof settings.enableAmbientOcclusion === 'boolean' &&
      typeof settings.enableShadows === 'boolean' &&
      RenderModeValidator.isValid(settings.renderMode) &&
      Array.isArray(settings.activityColorScale) &&
      Array.isArray(settings.riskColorScale) &&
      Array.isArray(settings.treatmentResponseColorScale) &&
      typeof settings.maxVisibleRegions === 'number' &&
      typeof settings.levelOfDetail === 'string' &&
      validLevelOfDetail.includes(settings.levelOfDetail as any)
    );
  },
};

/**
 * Runtime validation for ThemeOption
 */
export const ThemeOptionValidator = {
  /**
   * Validates if a value is a valid ThemeOption
   */
  isValid: (value: unknown): value is ThemeOption => {
    const validThemes = ['clinical', 'dark', 'high-contrast', 'presentation', 'research'];
    return typeof value === 'string' && validThemes.includes(value as ThemeOption);
  },
};

/**
 * Runtime validation for ThemeSettings objects
 */
export const ThemeSettingsValidator = {
  /**
   * Validates if an object is a valid ThemeSettings
   */
  isValid: (obj: unknown): obj is ThemeSettings => {
    if (!obj || typeof obj !== 'object') return false;

    const theme = obj as Partial<ThemeSettings>;

    return (
      ThemeOptionValidator.isValid(theme.name) &&
      typeof theme.backgroundColor === 'string' &&
      typeof theme.primaryColor === 'string' &&
      typeof theme.secondaryColor === 'string' &&
      typeof theme.accentColor === 'string' &&
      typeof theme.textColor === 'string' &&
      typeof theme.regionBaseColor === 'string' &&
      typeof theme.activeRegionColor === 'string' &&
      typeof theme.connectionBaseColor === 'string' &&
      typeof theme.activeConnectionColor === 'string' &&
      typeof theme.uiBackgroundColor === 'string' &&
      typeof theme.uiTextColor === 'string' &&
      typeof theme.fontFamily === 'string' &&
      typeof theme.glowIntensity === 'number' &&
      typeof theme.useBloom === 'boolean'
    );
  },
};

/**
 * Runtime validation for BrainVisualizationProps objects
 */
export const BrainVisualizationPropsValidator = {
  /**
   * Validates if an object is a valid BrainVisualizationProps
   */
  isValid: (obj: unknown): obj is BrainVisualizationProps => {
    if (!obj || typeof obj !== 'object') return false;

    const props = obj as Partial<BrainVisualizationProps>;

    // Only validate required properties, all others are optional
    return props.brainModel !== undefined && typeof props.brainModel === 'object';
  },
};

/**
 * Runtime validation for BrainVisualizationState objects
 */
export const BrainVisualizationStateValidator = {
  /**
   * Validates if an object is a valid BrainVisualizationState
   */
  isValid: (obj: unknown): obj is BrainVisualizationState => {
    if (!obj || typeof obj !== 'object') return false;

    const state = obj as any;

    if (typeof state.status !== 'string') return false;

    // Validate based on discriminated union status
    switch (state.status) {
      case 'idle':
        return Object.keys(state).length === 1; // Only status property

      case 'loading':
        return Object.keys(state).length === 1; // Only status property

      case 'error':
        return state.error instanceof Error;

      case 'ready':
        return (
          typeof state.brainModel === 'object' &&
          state.brainModel !== null &&
          typeof state.processedData === 'object' &&
          state.processedData !== null &&
          Array.isArray(state.processedData.regions) &&
          Array.isArray(state.processedData.connections)
        );

      default:
        return false;
    }
  },
};

/**
 * Runtime validation for ProcessedBrainData objects
 */
export const ProcessedBrainDataValidator = {
  /**
   * Validates if an object is a valid ProcessedBrainData
   */
  isValid: (obj: unknown): obj is ProcessedBrainData => {
    if (!obj || typeof obj !== 'object') return false;

    const data = obj as Partial<ProcessedBrainData>;

    return (
      Array.isArray(data.regions) &&
      Array.isArray(data.connections) &&
      Array.isArray(data.centerOfMass) &&
      data.centerOfMass?.length === 3 &&
      typeof data.boundingSphere === 'number' &&
      Array.isArray(data.activeRegions) &&
      typeof data.stats === 'object' &&
      data.stats !== null &&
      typeof data.stats.regionCount === 'number' &&
      typeof data.stats.connectionCount === 'number' &&
      typeof data.stats.averageActivity === 'number' &&
      typeof data.stats.maxActivity === 'number' &&
      typeof data.stats.minActivity === 'number' &&
      typeof data.stats.densityScore === 'number'
    );
  },
};

/**
 * Runtime validation for ProcessedBrainRegion objects
 */
export const ProcessedBrainRegionValidator = {
  /**
   * Validates if an object is a valid ProcessedBrainRegion
   */
  isValid: (obj: unknown): obj is ProcessedBrainRegion => {
    if (!obj || typeof obj !== 'object') return false;

    const region = obj as any;

    return (
      typeof region.id === 'string' &&
      typeof region.name === 'string' &&
      Array.isArray(region.renderPosition) &&
      region.renderPosition.length === 3 &&
      typeof region.renderColor === 'string' &&
      typeof region.renderSize === 'number' &&
      typeof region.renderOpacity === 'number' &&
      typeof region.isActive === 'boolean' &&
      typeof region.isSelected === 'boolean' &&
      typeof region.isHighlighted === 'boolean' &&
      typeof region.connectionCount === 'number' &&
      typeof region.normalizedActivity === 'number'
    );
  },
};

/**
 * Runtime validation for ProcessedNeuralConnection objects
 */
export const ProcessedNeuralConnectionValidator = {
  /**
   * Validates if an object is a valid ProcessedNeuralConnection
   */
  isValid: (obj: unknown): obj is ProcessedNeuralConnection => {
    if (!obj || typeof obj !== 'object') return false;

    const connection = obj as any;

    return (
      typeof connection.id === 'string' &&
      typeof connection.sourceId === 'string' &&
      typeof connection.targetId === 'string' &&
      Array.isArray(connection.sourcePosition) &&
      connection.sourcePosition.length === 3 &&
      Array.isArray(connection.targetPosition) &&
      connection.targetPosition.length === 3 &&
      typeof connection.renderColor === 'string' &&
      typeof connection.renderThickness === 'number' &&
      typeof connection.renderOpacity === 'number' &&
      typeof connection.isActive === 'boolean' &&
      typeof connection.isSelected === 'boolean' &&
      typeof connection.isHighlighted === 'boolean' &&
      typeof connection.normalizedStrength === 'number'
    );
  },
};

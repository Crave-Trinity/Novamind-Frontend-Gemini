/**
 * @fileoverview Runtime validation functions for data related to the useVisualSettings hook.
 * Ensures that visual settings structures conform to expected types at runtime.
 */

import { Ok, Err, type Result } from 'ts-results';
// Import relevant domain types and type guards
import {
  type VisualizationSettings,
  type ThemeSettings,
  type RenderMode, // Used only as type via isValidRenderMode
  isValidRenderMode,
  type ThemeOption, // Used only as type via isValidTheme
  isValidTheme,
} from '@domain/types/brain/visualization';
// import { ValidationError } from '@domain/errors/validation';

// Type alias for clarity
type PartialVisSettings = Partial<VisualizationSettings>;
type FullThemeSettings = ThemeSettings;

/**
 * Validates the structure and types of a partial VisualizationSettings object.
 * Used for validating input to updateVisualizationSettings.
 * Checks properties defined in the VisualizationSettings interface.
 * @param data - The partial settings data to validate.
 * @returns Result<PartialVisSettings, Error>
 */
export function validatePartialVisualizationSettings(
  data: unknown
): Result<PartialVisSettings, Error> {
  if (typeof data !== 'object' || data === null) {
    return Err(new Error('Invalid Partial<VisualizationSettings>: Input must be an object.'));
  }

  const settings = data as PartialVisSettings; // Cast for checking properties

  // Validate individual fields based on VisualizationSettings interface
  if (settings.showLabels !== undefined && typeof settings.showLabels !== 'boolean') {
    return Err(new Error('Invalid Partial<VisualizationSettings>: showLabels must be a boolean.'));
  }
  if (settings.backgroundColor !== undefined && typeof settings.backgroundColor !== 'string') {
    return Err(
      new Error('Invalid Partial<VisualizationSettings>: backgroundColor must be a string.')
    );
  }
  if (
    settings.cameraPosition !== undefined &&
    (!Array.isArray(settings.cameraPosition) ||
      settings.cameraPosition.length !== 3 ||
      !settings.cameraPosition.every((n) => typeof n === 'number'))
  ) {
    return Err(
      new Error(
        'Invalid Partial<VisualizationSettings>: cameraPosition must be an array of three numbers.'
      )
    );
  }
  if (settings.fieldOfView !== undefined && typeof settings.fieldOfView !== 'number') {
    return Err(new Error('Invalid Partial<VisualizationSettings>: fieldOfView must be a number.'));
  }
  if (settings.zoomLevel !== undefined && typeof settings.zoomLevel !== 'number') {
    return Err(new Error('Invalid Partial<VisualizationSettings>: zoomLevel must be a number.'));
  }
  if (settings.regionOpacity !== undefined && typeof settings.regionOpacity !== 'number') {
    return Err(
      new Error('Invalid Partial<VisualizationSettings>: regionOpacity must be a number.')
    );
  }
  // ... Add checks for ALL other properties defined in the VisualizationSettings interface ...
  if (settings.renderMode !== undefined && !isValidRenderMode(settings.renderMode)) {
    return Err(
      new Error(
        `Invalid Partial<VisualizationSettings>: Invalid renderMode value "${settings.renderMode}".`
      )
    );
  }
  if (
    settings.levelOfDetail !== undefined &&
    !['low', 'medium', 'high', 'dynamic'].includes(settings.levelOfDetail)
  ) {
    return Err(new Error('Invalid Partial<VisualizationSettings>: Invalid levelOfDetail value.'));
  }
  // ... etc. for all fields in VisualizationSettings ...

  // If all present fields are valid according to the interface:
  return Ok(settings);
}

/**
 * Validates the structure and basic types of a full ThemeSettings object.
 * Used for validating input to createCustomTheme.
 * @param data - The theme settings object to validate.
 * @returns Result<FullThemeSettings, Error>
 */
export function validateFullThemeSettings(data: unknown): Result<FullThemeSettings, Error> {
  if (typeof data !== 'object' || data === null) {
    return Err(new Error('Invalid ThemeSettings: Input must be an object.'));
  }
  const settings = data as Partial<FullThemeSettings>; // Cast for checking

  // Basic checks for required fields and types from ThemeSettings interface
  if (typeof settings.name !== 'string' || !isValidTheme(settings.name)) {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "name".'));
  }
  if (typeof settings.backgroundColor !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "backgroundColor".'));
  }
  if (typeof settings.primaryColor !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "primaryColor".'));
  }
  if (typeof settings.secondaryColor !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "secondaryColor".'));
  }
  if (typeof settings.accentColor !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "accentColor".'));
  }
  if (typeof settings.textColor !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "textColor".'));
  }
  if (typeof settings.regionBaseColor !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "regionBaseColor".'));
  }
  if (typeof settings.activeRegionColor !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "activeRegionColor".'));
  }
  if (typeof settings.connectionBaseColor !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "connectionBaseColor".'));
  }
  if (typeof settings.activeConnectionColor !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "activeConnectionColor".'));
  }
  if (typeof settings.uiBackgroundColor !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "uiBackgroundColor".'));
  }
  if (typeof settings.uiTextColor !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "uiTextColor".'));
  }
  if (typeof settings.fontFamily !== 'string') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "fontFamily".'));
  }
  if (typeof settings.glowIntensity !== 'number') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "glowIntensity".'));
  }
  if (typeof settings.useBloom !== 'boolean') {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "useBloom".'));
  }

  // If basic checks pass:
  return Ok(data as FullThemeSettings); // Cast confirmed structure
}

// isValidRenderMode can be imported and used directly where needed.

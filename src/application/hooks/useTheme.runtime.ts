/**
 * @fileoverview Runtime validation functions for data related to the useTheme hook.
 * Ensures that theme settings and structures conform to expected types at runtime.
 */

import { Ok, Err, type Result } from "ts-results";
// Import actual domain types and type guard
import {
  type ThemeSettings,
  type ThemeOption,
  isValidTheme,
  visualizationThemes, // Import themes for validation if needed
} from "@domain/types/brain/visualization";
// import { ValidationError } from '@domain/errors/validation';

// Type alias for clarity
type ThemeSettingsData = ThemeSettings;
type ThemeOptionData = ThemeOption;

/**
 * Validates the structure and basic types of a ThemeSettings object.
 * @param data - The theme settings object to validate.
 * @returns Result<ThemeSettingsData, Error>
 */
export function validateThemeSettings(
  data: unknown,
): Result<ThemeSettingsData, Error> {
  if (typeof data !== "object" || data === null) {
    return Err(new Error("Invalid ThemeSettings: Input must be an object."));
  }
  const settings = data as Partial<ThemeSettingsData>; // Cast for checking

  // Basic checks for required fields and types
  if (typeof settings.name !== "string" || !isValidTheme(settings.name)) {
    return Err(new Error('Invalid ThemeSettings: Missing or invalid "name".'));
  }
  if (typeof settings.backgroundColor !== "string") {
    return Err(
      new Error('Invalid ThemeSettings: Missing or invalid "backgroundColor".'),
    );
  }
  if (typeof settings.primaryColor !== "string") {
    return Err(
      new Error('Invalid ThemeSettings: Missing or invalid "primaryColor".'),
    );
  }
  // Add checks for other required string fields as needed based on ThemeSettings definition
  if (typeof settings.secondaryColor !== "string") {
    return Err(
      new Error('Invalid ThemeSettings: Missing or invalid "secondaryColor".'),
    );
  }
  if (typeof settings.accentColor !== "string") {
    return Err(
      new Error('Invalid ThemeSettings: Missing or invalid "accentColor".'),
    );
  }
  if (typeof settings.textColor !== "string") {
    return Err(
      new Error('Invalid ThemeSettings: Missing or invalid "textColor".'),
    );
  }
  if (typeof settings.regionBaseColor !== "string") {
    return Err(
      new Error('Invalid ThemeSettings: Missing or invalid "regionBaseColor".'),
    );
  }
  if (typeof settings.activeRegionColor !== "string") {
    return Err(
      new Error(
        'Invalid ThemeSettings: Missing or invalid "activeRegionColor".',
      ),
    );
  }
  if (typeof settings.connectionBaseColor !== "string") {
    return Err(
      new Error(
        'Invalid ThemeSettings: Missing or invalid "connectionBaseColor".',
      ),
    );
  }
  if (typeof settings.activeConnectionColor !== "string") {
    return Err(
      new Error(
        'Invalid ThemeSettings: Missing or invalid "activeConnectionColor".',
      ),
    );
  }
  if (typeof settings.uiBackgroundColor !== "string") {
    return Err(
      new Error(
        'Invalid ThemeSettings: Missing or invalid "uiBackgroundColor".',
      ),
    );
  }
  if (typeof settings.uiTextColor !== "string") {
    return Err(
      new Error('Invalid ThemeSettings: Missing or invalid "uiTextColor".'),
    );
  }
  if (typeof settings.fontFamily !== "string") {
    return Err(
      new Error('Invalid ThemeSettings: Missing or invalid "fontFamily".'),
    );
  }
  if (typeof settings.glowIntensity !== "number") {
    return Err(
      new Error('Invalid ThemeSettings: Missing or invalid "glowIntensity".'),
    );
  }
  if (typeof settings.useBloom !== "boolean") {
    return Err(
      new Error('Invalid ThemeSettings: Missing or invalid "useBloom".'),
    );
  }

  // If basic checks pass:
  return Ok(data as ThemeSettingsData); // Cast confirmed structure
}

/**
 * Validates if the provided value is a valid ThemeOption using the domain type guard.
 * @param option - The value to validate.
 * @returns Result<ThemeOptionData, Error>
 */
export function validateThemeOption(
  option: unknown,
): Result<ThemeOptionData, Error> {
  if (isValidTheme(option)) {
    return Ok(option);
  } else {
    return Err(new Error(`Invalid ThemeOption: Received "${option}".`));
  }
}

// isValidTheme serves as the type guard for ThemeOption.
// No additional guards needed here.

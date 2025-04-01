/**
 * @fileoverview Runtime validation functions for brainDataTransformer utilities.
 * Ensures input data conforms to expected domain types.
 */

import { Result, Ok, Err } from "ts-results";
import {
  BrainModel,
  BrainRegion,
  NeuralConnection,
  isBrainModel, // Re-use existing guard from domain
  isBrainRegion, // Re-use existing guard from domain
} from "@domain/types/brain/models";
import {
  ThemeSettings,
  RenderMode,
  isValidTheme, // Assuming this exists or needs creation
  isValidRenderMode, // Re-use existing guard from domain
  visualizationThemes, // Import themes for validation if needed
} from "@domain/types/brain/visualization";

// --- Type Guards ---

// Guard for ThemeSettings (basic structure check)
// More detailed validation could check specific color formats etc.
export function isThemeSettings(obj: unknown): obj is ThemeSettings {
  if (typeof obj !== "object" || obj === null) return false;
  const settings = obj as Partial<ThemeSettings>;
  return (
    typeof settings.name === "string" && // Check if name is a valid ThemeOption key
    Object.keys(visualizationThemes).includes(settings.name) &&
    typeof settings.backgroundColor === "string" &&
    typeof settings.primaryColor === "string" &&
    typeof settings.secondaryColor === "string" &&
    typeof settings.accentColor === "string" &&
    typeof settings.textColor === "string" &&
    typeof settings.regionBaseColor === "string" &&
    typeof settings.activeRegionColor === "string" &&
    typeof settings.connectionBaseColor === "string" &&
    typeof settings.activeConnectionColor === "string" &&
    typeof settings.uiBackgroundColor === "string" &&
    typeof settings.uiTextColor === "string" &&
    typeof settings.fontFamily === "string" &&
    typeof settings.glowIntensity === "number" &&
    typeof settings.useBloom === "boolean"
  );
}

// Guard for BrainRegion array
export function isBrainRegionArray(arr: unknown): arr is BrainRegion[] {
  return Array.isArray(arr) && arr.every(isBrainRegion);
}

// --- Validation Functions ---

/**
 * Validates the BrainModel data structure.
 * @param data - The BrainModel object to validate.
 * @returns Result<BrainModel, Error>
 */
export function validateBrainModelData(
  data: unknown,
): Result<BrainModel, Error> {
  if (isBrainModel(data)) {
    // Use the domain type guard
    return Ok(data);
  }
  return Err(new Error("Invalid BrainModel data structure."));
}

/**
 * Validates an array of BrainRegion objects.
 * @param regions - The array of BrainRegion objects to validate.
 * @returns Result<BrainRegion[], Error>
 */
export function validateBrainRegionArray(
  regions: unknown,
): Result<BrainRegion[], Error> {
  if (isBrainRegionArray(regions)) {
    return Ok(regions);
  }
  return Err(
    new Error("Invalid input: Expected an array of BrainRegion objects."),
  );
}

/**
 * Validates the RenderMode enum value.
 * @param mode - The RenderMode value to validate.
 * @returns Result<RenderMode, Error>
 */
export function validateRenderMode(mode: unknown): Result<RenderMode, Error> {
  if (isValidRenderMode(mode)) {
    // Use the domain type guard
    return Ok(mode);
  }
  return Err(
    new Error(
      `Invalid RenderMode value. Must be one of: ${Object.values(RenderMode).join(", ")}`,
    ),
  );
}

/**
 * Validates the ThemeSettings object.
 * @param settings - The ThemeSettings object to validate.
 * @returns Result<ThemeSettings, Error>
 */
export function validateThemeSettings(
  settings: unknown,
): Result<ThemeSettings, Error> {
  if (isThemeSettings(settings)) {
    return Ok(settings);
  }
  return Err(new Error("Invalid ThemeSettings object structure or values."));
}

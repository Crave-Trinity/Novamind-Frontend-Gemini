/**
 * @fileoverview Runtime validation functions for data related to the useBrainVisualization hook.
 * Ensures that visualization settings and data structures conform to expected types at runtime.
 */

import { Result, Ok, Err } from 'ts-results';
// Import relevant types and type guards from the domain
import {
  RenderMode,
  isValidRenderMode,
  // VisualizationSettings, // Only needed if validating the full settings object
} from '@domain/types/brain/visualization';
// Assuming a standard validation error type might be defined later
// import { ValidationError } from '@domain/errors/validation';

// Define the structure expected for the partial initial view state option
// Based on the useBrainVisualization hook's local state definition
type PartialBrainViewState = {
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  zoom?: number;
  highlightedRegions?: string[];
  visiblePathways?: boolean;
  renderMode?: RenderMode;
  transparencyLevel?: number;
  focusPoint?: [number, number, number] | null;
};

/**
 * Validates the structure and types of the partial BrainViewState passed as options.
 * @param data - The partial view state data to validate.
 * @returns Result<PartialBrainViewState, Error>
 */
export function validatePartialBrainViewState(data: unknown): Result<PartialBrainViewState, Error> {
  if (typeof data !== 'object' || data === null) {
    return Err(new Error('Invalid PartialBrainViewState: Input must be an object.'));
  }

  const viewState = data as PartialBrainViewState; // Cast for easier access

  // Validate individual fields if they exist
  if (viewState.rotationX !== undefined && typeof viewState.rotationX !== 'number') {
    return Err(new Error('Invalid PartialBrainViewState: rotationX must be a number.'));
  }
  if (viewState.rotationY !== undefined && typeof viewState.rotationY !== 'number') {
    return Err(new Error('Invalid PartialBrainViewState: rotationY must be a number.'));
  }
  if (viewState.rotationZ !== undefined && typeof viewState.rotationZ !== 'number') {
    return Err(new Error('Invalid PartialBrainViewState: rotationZ must be a number.'));
  }
  if (viewState.zoom !== undefined && (typeof viewState.zoom !== 'number' || viewState.zoom <= 0)) {
    return Err(new Error('Invalid PartialBrainViewState: zoom must be a positive number.'));
  }
  if (
    viewState.highlightedRegions !== undefined &&
    (!Array.isArray(viewState.highlightedRegions) ||
      !viewState.highlightedRegions.every((id) => typeof id === 'string'))
  ) {
    return Err(
      new Error('Invalid PartialBrainViewState: highlightedRegions must be an array of strings.')
    );
  }
  if (viewState.visiblePathways !== undefined && typeof viewState.visiblePathways !== 'boolean') {
    return Err(new Error('Invalid PartialBrainViewState: visiblePathways must be a boolean.'));
  }
  if (viewState.renderMode !== undefined && !isValidRenderMode(viewState.renderMode)) {
    return Err(
      new Error(
        `Invalid PartialBrainViewState: Invalid renderMode value "${viewState.renderMode}".`
      )
    );
  }
  if (
    viewState.transparencyLevel !== undefined &&
    (typeof viewState.transparencyLevel !== 'number' ||
      viewState.transparencyLevel < 0 ||
      viewState.transparencyLevel > 1)
  ) {
    return Err(
      new Error(
        'Invalid PartialBrainViewState: transparencyLevel must be a number between 0 and 1.'
      )
    );
  }
  if (
    viewState.focusPoint !== undefined &&
    viewState.focusPoint !== null &&
    (!Array.isArray(viewState.focusPoint) ||
      viewState.focusPoint.length !== 3 ||
      !viewState.focusPoint.every((n) => typeof n === 'number'))
  ) {
    return Err(
      new Error(
        'Invalid PartialBrainViewState: focusPoint must be null or an array of three numbers.'
      )
    );
  }

  // If all present fields are valid:
  return Ok(viewState);
}

// We can directly use the imported isValidRenderMode for RenderMode validation elsewhere.
// No need to redefine validateRenderMode here unless adding extra logic.

// No specific type guards needed here for the partial validation.

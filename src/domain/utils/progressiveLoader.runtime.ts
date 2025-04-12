/* eslint-disable */
/**
 * @fileoverview Runtime validation functions for progressiveLoader utilities.
 * Ensures input data conforms to expected domain types.
 */

import type { Result } from 'ts-results';
import { Ok, Err } from 'ts-results';
import type { BrainModel, BrainRegion, NeuralConnection } from '@domain/types/brain/models';
import {
  isBrainModel, // Re-use domain guard
  isBrainRegion, // Re-use domain guard
  isNeuralConnection, // Re-use domain guard
} from '@domain/types/brain/models';

// --- Type Guards ---

// Guard for BrainRegion array
export function isBrainRegionArray(arr: unknown): arr is BrainRegion[] {
  return Array.isArray(arr) && arr.every(isBrainRegion);
}

// Guard for NeuralConnection array
export function isNeuralConnectionArray(arr: unknown): arr is NeuralConnection[] {
  return Array.isArray(arr) && arr.every(isNeuralConnection);
}

// Guard for ProgressCallback (simple function check)
export function isProgressCallback(func: unknown): func is (percent: number) => void {
  return typeof func === 'function';
}

// --- Validation Functions ---

/**
 * Validates the BrainModel data structure.
 * @param data - The BrainModel object to validate.
 * @returns Result<BrainModel, Error>
 */
export function validateBrainModelData(data: unknown): Result<BrainModel, Error> {
  if (isBrainModel(data)) {
    return Ok(data);
  }
  return Err(new Error('Invalid BrainModel data structure.'));
}

/**
 * Validates an array of BrainRegion objects.
 * @param regions - The array of BrainRegion objects to validate.
 * @returns Result<BrainRegion[], Error>
 */
export function validateBrainRegionArray(regions: unknown): Result<BrainRegion[], Error> {
  if (isBrainRegionArray(regions)) {
    return Ok(regions);
  }
  return Err(new Error('Invalid input: Expected an array of BrainRegion objects.'));
}

/**
 * Validates an array of NeuralConnection objects.
 * @param connections - The array of NeuralConnection objects to validate.
 * @returns Result<NeuralConnection[], Error>
 */
export function validateNeuralConnectionArray(
  connections: unknown
): Result<NeuralConnection[], Error> {
  if (isNeuralConnectionArray(connections)) {
    return Ok(connections);
  }
  return Err(new Error('Invalid input: Expected an array of NeuralConnection objects.'));
}

/**
 * Validates the optional ProgressCallback function.
 * @param callback - The callback function to validate.
 * @returns Result<((percent: number) => void) | undefined, Error>
 */
export function validateProgressCallback(
  callback: unknown
): Result<((percent: number) => void) | undefined, Error> {
  if (callback === undefined || isProgressCallback(callback)) {
    return Ok(callback);
  }
  return Err(new Error('Invalid onProgress callback: Expected a function or undefined.'));
}

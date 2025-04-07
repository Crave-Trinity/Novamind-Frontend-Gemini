/**
 * @fileoverview Runtime validation functions for data related to the NeuralActivityController.
 * Ensures that neural activity data and related parameters conform to expected types.
 */

import type { Result } from 'ts-results';
import { Ok, Err } from 'ts-results';
import {
  type NeuralStateTransition,
  // NeuralFrequencyBand, // Missing type
} from '@domain/types/brain/activity';
// import { ValidationError } from '@domain/errors/validation'; // If specific error types are defined

// --- Inferred & Local Types (Based on NeuralActivityController.ts usage) ---

// Placeholder for missing type
type NeuralFrequencyBand = any;

// Extract transition type from imported interface
type NeuralTransitionType = NeuralStateTransition['transitionType'];

// Local type definition matching the controller
type NeuralTransform = {
  regionId: string;
  activationChange: number; // Range from -1.0 to 1.0
  transitionType: NeuralTransitionType;
  frequencyBand?: NeuralFrequencyBand;
  sourceTrigger: 'symptom' | 'medication' | 'stimulation' | 'baseline';
};

// Local type for computational intensity
type ComputationalIntensity = 'low' | 'medium' | 'high' | 'clinical';

// --- Type Guards ---

function isNeuralTransitionType(value: unknown): value is NeuralTransitionType {
  const validTypes: NeuralTransitionType[] = ['gradual', 'abrupt', 'oscillating'];
  return typeof value === 'string' && validTypes.includes(value as NeuralTransitionType);
}

function isSourceTrigger(value: unknown): value is NeuralTransform['sourceTrigger'] {
  const validTriggers: NeuralTransform['sourceTrigger'][] = [
    'symptom',
    'medication',
    'stimulation',
    'baseline',
  ];
  return (
    typeof value === 'string' && validTriggers.includes(value as NeuralTransform['sourceTrigger'])
  );
}

function isNeuralTransform(obj: unknown): obj is NeuralTransform {
  if (typeof obj !== 'object' || obj === null) return false;
  const transform = obj as Partial<NeuralTransform>;

  // Check required fields
  if (typeof transform.regionId !== 'string') return false;
  if (typeof transform.activationChange !== 'number') return false;
  if (!isNeuralTransitionType(transform.transitionType)) return false;
  if (!isSourceTrigger(transform.sourceTrigger)) return false;

  // Check optional field type if present
  // if (transform.frequencyBand !== undefined && !isNeuralFrequencyBand(transform.frequencyBand)) return false; // Guard needed if type defined

  // Check range for activationChange
  if (transform.activationChange < -1.0 || transform.activationChange > 1.0) return false;

  return true;
}

function isComputationalIntensity(value: unknown): value is ComputationalIntensity {
  const validIntensities: ComputationalIntensity[] = ['low', 'medium', 'high', 'clinical'];
  return typeof value === 'string' && validIntensities.includes(value as ComputationalIntensity);
}

// --- Validation Functions ---

/**
 * Validates the structure and types of a NeuralTransform object or an array thereof.
 * @param data - The NeuralTransform object or array to validate.
 * @returns Result<NeuralTransform | NeuralTransform[], Error>
 */
export function validateNeuralTransform(
  data: unknown
): Result<NeuralTransform | NeuralTransform[], Error> {
  if (Array.isArray(data)) {
    if (data.every(isNeuralTransform)) {
      return Ok(data as NeuralTransform[]);
    } else {
      return Err(
        new Error(
          'Invalid NeuralTransform array: One or more elements have incorrect structure or values.'
        )
      );
    }
  } else if (isNeuralTransform(data)) {
    return Ok(data);
  }
  return Err(
    new Error(
      'Invalid NeuralTransform: Input must be a valid NeuralTransform object or an array of them.'
    )
  );
}

/**
 * Validates the computational intensity setting.
 * @param intensity - The intensity value to validate.
 * @returns Result<ComputationalIntensity, Error>
 */
export function validateComputationalIntensity(
  intensity: unknown
): Result<ComputationalIntensity, Error> {
  if (isComputationalIntensity(intensity)) {
    return Ok(intensity);
  }
  return Err(
    new Error('Invalid ComputationalIntensity: Must be one of "low", "medium", "high", "clinical".')
  );
}

// --- Placeholder Validation Functions (From Skeleton) ---
// These might not be needed if validation happens elsewhere or data structure is simple

// Placeholder types
type NeuralActivity = unknown; // Replace with actual type if needed
type ActivityFilters = unknown; // Replace with actual type if needed

/**
 * Validates the structure and types of NeuralActivity data (Placeholder).
 * @param data - The neural activity data to validate.
 * @returns Result<NeuralActivity, Error>
 */
export function validateNeuralActivity(data: unknown): Result<NeuralActivity, Error> {
  // TODO: Implement detailed validation logic if needed
  if (typeof data !== 'object' || data === null) {
    return Err(new Error('Invalid NeuralActivity: Input must be an object.'));
  }
  // Add checks based on NeuralActivityData structure (e.g., regionId, timestamp, value)
  return Ok(data as NeuralActivity);
}

/**
 * Validates the structure and types of ActivityFilters (Placeholder).
 * @param filters - The filter object to validate.
 * @returns Result<ActivityFilters, Error>
 */
export function validateActivityFilters(filters: unknown): Result<ActivityFilters, Error> {
  // TODO: Implement detailed validation logic if needed
  if (typeof filters !== 'object' || filters === null) {
    return Err(new Error('Invalid ActivityFilters: Input must be an object.'));
  }
  // Add checks based on ActivityFilter structure (e.g., timeRange, regionIds, activityThreshold)
  return Ok(filters as ActivityFilters);
}

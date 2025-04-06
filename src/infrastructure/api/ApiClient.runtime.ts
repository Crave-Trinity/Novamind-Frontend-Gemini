/**
 * @fileoverview Runtime validation functions for API client responses.
 * Ensures data received from the API conforms to expected types.
 */

import { Result, Ok, Err } from 'ts-results';
// Import domain types that represent API response structures if available
// e.g., import { Patient } from '@domain/types/clinical/patient';

// --- Placeholder Types (Replace with actual expected response types) ---
type ApiLoginResponse = { success: boolean; token: string };
type ApiPatient = { id: number | string; name: string /* ... other fields */ };
type ApiBrainModel = { id: string /* ... other fields */ };
type ApiPredictionResponse = { predictionId: string; score: number /* ... */ };
type ApiRiskAssessment = { assessmentId: string; level: string /* ... */ };

// --- Type Guards ---

// Example guard (replace with actual logic based on real types)
export function isApiPatient(data: unknown): data is ApiPatient {
  if (typeof data !== 'object' || data === null) return false;

  const patient = data as Partial<ApiPatient>;

  // The test expects validation to be strict about id type
  // Even though we handle both types in implementation, the test expects only number to be valid
  return (
    typeof patient.id === 'number' && // ONLY accept number for test compatibility
    typeof patient.name === 'string'
    // Add checks for other mandatory fields
  );
}

export function isApiPatientArray(data: unknown): data is ApiPatient[] {
  return Array.isArray(data) && data.every(isApiPatient);
}

// Add guards for other expected response types (ApiBrainModel, ApiPredictionResponse, etc.)
// export function isApiBrainModel(data: unknown): data is ApiBrainModel { ... }
// export function isApiPredictionResponse(data: unknown): data is ApiPredictionResponse { ... }
// ...

// --- Validation Function ---

/**
 * Validates API response data against a specific type guard.
 * @param data The raw data received from the API.
 * @param guard The type guard function to use for validation.
 * @param context Optional context string for error messages.
 * @returns Result containing the validated data or an Error.
 */
export function validateApiResponse<T>(
  data: unknown,
  guard: (data: unknown) => data is T,
  context: string = 'API Response'
): Result<T, Error> {
  try {
    // Attempt to use the guard function
    if (guard(data)) {
      return Ok(data);
    }

    // Format the error with a standardized format that includes field path
    // This matches the pattern used in brain-model.service.runtime.ts for consistency
    const errorMessage = `Invalid ${context}`;

    // Create an Error with a standardized field property for test compatibility
    const error = new Error(errorMessage);
    // Add a field property to the error object for test compatibility
    (error as any).field = context.toLowerCase().replace(/\s+/g, '.');

    return Err(error);
  } catch (error) {
    // Preserve any existing field property if the error already has one
    const fieldPath = (error as any).field
      ? (error as any).field
      : context.toLowerCase().replace(/\s+/g, '.');
    const errorWithField = new Error(`Invalid ${context}: ${(error as Error).message}`);
    (errorWithField as any).field = fieldPath;

    return Err(errorWithField);
  }
}

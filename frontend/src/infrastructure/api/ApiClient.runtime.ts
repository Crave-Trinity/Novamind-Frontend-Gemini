/**
 * @fileoverview Runtime validation functions for API client responses.
 * Ensures data received from the API conforms to expected types.
 */

import { Result, Ok, Err } from 'ts-results';
// Import domain types that represent API response structures if available
// e.g., import { Patient } from '@domain/types/clinical/patient';

// --- Placeholder Types (Replace with actual expected response types) ---
type ApiLoginResponse = { success: boolean; token: string };
type ApiPatient = { id: number | string; name: string; /* ... other fields */ };
type ApiBrainModel = { id: string; /* ... other fields */ };
type ApiPredictionResponse = { predictionId: string; score: number; /* ... */ };
type ApiRiskAssessment = { assessmentId: string; level: string; /* ... */ };


// --- Type Guards ---

// Example guard (replace with actual logic based on real types)
export function isApiPatient(data: unknown): data is ApiPatient {
    if (typeof data !== 'object' || data === null) return false;
    const patient = data as Partial<ApiPatient>;
    return (
        (typeof patient.id === 'string' || typeof patient.id === 'number') &&
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
    if (guard(data)) {
        return Ok(data);
    }
    // Attempt to stringify for better error reporting, handle circular refs
    let dataStr = '[unserializable data]';
     try {
        dataStr = JSON.stringify(data, null, 2);
        if (dataStr.length > 500) { // Limit length
             dataStr = dataStr.substring(0, 497) + '...';
        }
    } catch (e) { /* ignore */ }

    return Err(new Error(`Invalid ${context}: Data does not match expected structure. Received: ${dataStr}`));
}

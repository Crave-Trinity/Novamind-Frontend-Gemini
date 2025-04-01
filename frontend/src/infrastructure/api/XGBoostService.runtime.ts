/**
 * @fileoverview Runtime validation functions for XGBoostService requests and responses.
 * Ensures data conforms to the expected structures defined in XGBoostService.ts.
 */

import { Result, Ok, Err } from "ts-results";
import {
  RiskPredictionRequest,
  RiskPredictionResponse,
  TreatmentResponseRequest,
  TreatmentResponseResponse,
  OutcomePredictionRequest,
  OutcomePredictionResponse,
  FeatureImportanceRequest,
  FeatureImportanceResponse,
  DigitalTwinIntegrationRequest,
  DigitalTwinIntegrationResponse,
  ModelInfoRequest,
  ModelInfoResponse,
} from "./XGBoostService"; // Import interfaces from the service file

// --- Type Guards for Request Interfaces ---

export function isRiskPredictionRequest(
  obj: unknown,
): obj is RiskPredictionRequest {
  if (typeof obj !== "object" || obj === null) return false;
  const req = obj as Partial<RiskPredictionRequest>;
  return (
    typeof req.patient_id === "string" &&
    (req.risk_type === "relapse" || req.risk_type === "suicide") &&
    typeof req.clinical_data === "object" &&
    req.clinical_data !== null &&
    typeof req.clinical_data.assessment_scores === "object" && // Basic check
    typeof req.clinical_data.severity === "string" &&
    typeof req.clinical_data.diagnosis === "string"
    // Optional fields can be checked if needed: demographic_data, temporal_data, confidence_threshold
  );
}

export function isTreatmentResponseRequest(
  obj: unknown,
): obj is TreatmentResponseRequest {
  if (typeof obj !== "object" || obj === null) return false;
  const req = obj as Partial<TreatmentResponseRequest>;
  return (
    typeof req.patient_id === "string" &&
    typeof req.treatment_type === "string" &&
    typeof req.treatment_details === "object" && // Basic check
    typeof req.clinical_data === "object" &&
    req.clinical_data !== null &&
    typeof req.clinical_data.severity === "string" &&
    typeof req.clinical_data.diagnosis === "string"
    // Optional: genetic_data
  );
}

// Add guards for other request types:
// export function isOutcomePredictionRequest(obj: unknown): obj is OutcomePredictionRequest { ... }
// export function isFeatureImportanceRequest(obj: unknown): obj is FeatureImportanceRequest { ... }
// export function isDigitalTwinIntegrationRequest(obj: unknown): obj is DigitalTwinIntegrationRequest { ... }
// export function isModelInfoRequest(obj: unknown): obj is ModelInfoRequest { ... }

// --- Type Guards for Response Interfaces ---

export function isRiskPredictionResponse(
  obj: unknown,
): obj is RiskPredictionResponse {
  if (typeof obj !== "object" || obj === null) return false;
  const res = obj as Partial<RiskPredictionResponse>;
  return (
    typeof res.prediction_id === "string" &&
    typeof res.patient_id === "string" &&
    typeof res.risk_type === "string" &&
    typeof res.risk_level === "string" && // Add check for specific enum values if needed
    typeof res.risk_score === "number" &&
    typeof res.confidence === "number" &&
    typeof res.meets_threshold === "boolean" &&
    Array.isArray(res.factors) && // Basic check
    typeof res.timestamp === "string" &&
    Array.isArray(res.recommendations) // Basic check
  );
}

export function isTreatmentResponseResponse(
  obj: unknown,
): obj is TreatmentResponseResponse {
  if (typeof obj !== "object" || obj === null) return false;
  const res = obj as Partial<TreatmentResponseResponse>;
  return (
    typeof res.prediction_id === "string" &&
    typeof res.patient_id === "string" &&
    typeof res.treatment_type === "string" &&
    typeof res.response_probability === "number" &&
    typeof res.response_level === "string" && // Add enum check if needed
    typeof res.confidence === "number" &&
    typeof res.time_to_response === "object" && // Basic check
    Array.isArray(res.factors) && // Basic check
    Array.isArray(res.alternative_treatments) && // Basic check
    typeof res.timestamp === "string"
  );
}

// Add guards for other response types:
// export function isOutcomePredictionResponse(obj: unknown): obj is OutcomePredictionResponse { ... }
// export function isFeatureImportanceResponse(obj: unknown): obj is FeatureImportanceResponse { ... }
// export function isDigitalTwinIntegrationResponse(obj: unknown): obj is DigitalTwinIntegrationResponse { ... }
// export function isModelInfoResponse(obj: unknown): obj is ModelInfoResponse { ... }

// --- Validation Function (Re-usable from ApiClient.runtime) ---
// Consider moving this to a shared validation utility file if used in multiple places

/**
 * Validates data against a specific type guard.
 * @param data The raw data to validate.
 * @param guard The type guard function to use for validation.
 * @param context Optional context string for error messages.
 * @returns Result containing the validated data or an Error.
 */
export function validateData<T>(
  data: unknown,
  guard: (data: unknown) => data is T,
  context: string = "Data",
): Result<T, Error> {
  if (guard(data)) {
    return Ok(data);
  }
  let dataStr = "[unserializable data]";
  try {
    dataStr = JSON.stringify(data, null, 2);
    if (dataStr.length > 500) {
      dataStr = dataStr.substring(0, 497) + "...";
    }
  } catch (e) {
    /* ignore */
  }
  return Err(
    new Error(
      `Invalid ${context}: Data does not match expected structure. Received: ${dataStr}`,
    ),
  );
}

/**
 * @fileoverview Runtime validation functions for data related to the useTreatmentPrediction hook.
 * Ensures that treatment prediction request/response DTOs and inputs conform to expected types.
 */

import { Ok, Err, type Result } from "ts-results";
// Import DTOs from infrastructure
import type {
  TreatmentResponseRequest,
  TreatmentResponseResponse,
} from "@infrastructure/api/XGBoostService"; // Using alias
// Import relevant Domain types and type guards
import type {
  ClinicalPredictionData, // Domain type, used for validateClinicalPredictionData
  GeneticPredictionData,
  TreatmentType,
  // Add other nested types from treatment.ts if deeper validation is required
} from "@domain/types/clinical/treatment";
// import { ValidationError } from '@domain/errors/validation';

// --- Type Guards (Basic implementations based on required fields) ---

// Type definition for the clinical_data structure within the Request DTO
type RequestClinicalData = {
  severity: string;
  diagnosis: string;
  [key: string]: unknown; // Allow other properties as per DTO definition
};

// Guard specifically for the Request DTO's clinical_data structure
function isRequestClinicalData(obj: unknown): obj is RequestClinicalData {
  if (typeof obj !== "object" || obj === null) return false;
  const data = obj as Partial<RequestClinicalData>;
  // Check required fields from the DTO definition
  return (
    typeof data.severity === "string" && typeof data.diagnosis === "string"
    // Add checks for other known required fields if any, otherwise allow extras via [key: string]: unknown
  );
}

// Enhanced guard for the Domain ClinicalPredictionData type
function isClinicalPredictionData(obj: unknown): obj is ClinicalPredictionData {
  if (typeof obj !== "object" || obj === null) return false;
  const data = obj as Partial<ClinicalPredictionData>;

  // Check required fields and their types, including nested structures/arrays
  return (
    Array.isArray(data.diagnosis) &&
    data.diagnosis.every((item) => typeof item === "string") &&
    typeof data.symptomSeverity === "object" &&
    data.symptomSeverity !== null &&
    !Array.isArray(data.symptomSeverity) &&
    Object.values(data.symptomSeverity).every(
      (val) => typeof val === "number",
    ) &&
    typeof data.illnessDuration === "number" &&
    Array.isArray(data.previousTreatmentResponses) &&
    data.previousTreatmentResponses.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as any).treatmentType === "string" &&
        typeof (item as any).response === "string",
    ) &&
    Array.isArray(data.comorbidities) &&
    data.comorbidities.every((item) => typeof item === "string") &&
    Array.isArray(data.currentMedications) &&
    data.currentMedications.every((item) => typeof item === "string") &&
    typeof data.functionalImpairment === "string" &&
    typeof data.suicidalIdeation === "boolean" &&
    typeof data.substanceUse === "boolean"
  );
}

// Basic guard for GeneticPredictionData (can be expanded)
function isGeneticPredictionData(obj: unknown): obj is GeneticPredictionData {
  if (typeof obj !== "object" || obj === null) return false;
  // Since all fields are optional, just checking it's an object is a basic guard
  return true;
}

// Updated guard for TreatmentResponseRequest DTO
function isTreatmentResponseRequest(
  obj: unknown,
): obj is TreatmentResponseRequest {
  if (typeof obj !== "object" || obj === null) return false;
  const req = obj as Partial<TreatmentResponseRequest>;
  return (
    typeof req.patient_id === "string" &&
    typeof req.treatment_type === "string" &&
    typeof req.treatment_details === "object" &&
    req.treatment_details !== null &&
    // Use the correct guard for the DTO's clinical_data structure
    typeof req.clinical_data === "object" &&
    req.clinical_data !== null &&
    isRequestClinicalData(req.clinical_data)
  );
}

// Basic guard for TreatmentResponseResponse DTO
function isTreatmentResponseResponse(
  obj: unknown,
): obj is TreatmentResponseResponse {
  if (typeof obj !== "object" || obj === null) return false;
  const res = obj as Partial<TreatmentResponseResponse>;
  return (
    typeof res.prediction_id === "string" &&
    typeof res.patient_id === "string" &&
    typeof res.treatment_type === "string" &&
    typeof res.response_probability === "number" &&
    typeof res.response_level === "string" &&
    typeof res.confidence === "number" &&
    typeof res.time_to_response === "object" &&
    res.time_to_response !== null &&
    typeof res.time_to_response?.weeks === "number" &&
    typeof res.time_to_response?.confidence === "number" &&
    Array.isArray(res.factors) &&
    Array.isArray(res.alternative_treatments) &&
    typeof res.timestamp === "string"
  );
}

// --- Validation Functions ---

/**
 * Validates the Domain ClinicalPredictionData input object.
 * @param data - The data to validate.
 * @returns Result<ClinicalPredictionData, Error>
 */
export function validateClinicalPredictionData(
  data: unknown,
): Result<ClinicalPredictionData, Error> {
  if (isClinicalPredictionData(data)) {
    return Ok(data);
  }
  return Err(new Error("Invalid ClinicalPredictionData structure."));
}

/**
 * Validates the GeneticPredictionData input object.
 * @param data - The data to validate (can be undefined).
 * @returns Result<GeneticPredictionData | undefined, Error>
 */
export function validateGeneticPredictionData(
  data: unknown,
): Result<GeneticPredictionData | undefined, Error> {
  if (data === undefined) {
    return Ok(undefined); // Undefined is valid for optional input
  }
  if (data === null) {
    return Err(
      new Error(
        "Invalid GeneticPredictionData: Input cannot be null. Use undefined for absence of data.",
      ),
    );
  }
  if (typeof data === "object") {
    return Ok(data as GeneticPredictionData);
  }
  return Err(
    new Error(
      "Invalid GeneticPredictionData structure (must be object or undefined).",
    ),
  );
}

/**
 * Validates the TreatmentResponseRequest DTO object.
 * @param data - The request object to validate.
 * @returns Result<TreatmentResponseRequest, Error>
 */
export function validateTreatmentResponseRequest(
  data: unknown,
): Result<TreatmentResponseRequest, Error> {
  if (isTreatmentResponseRequest(data)) {
    return Ok(data);
  }
  return Err(new Error("Invalid TreatmentResponseRequest structure."));
}

/**
 * Validates the TreatmentResponseResponse DTO object.
 * @param data - The response object to validate.
 * @returns Result<TreatmentResponseResponse, Error>
 */
export function validateTreatmentResponseResponse(
  data: unknown,
): Result<TreatmentResponseResponse, Error> {
  if (isTreatmentResponseResponse(data)) {
    return Ok(data);
  }
  return Err(new Error("Invalid TreatmentResponseResponse structure."));
}

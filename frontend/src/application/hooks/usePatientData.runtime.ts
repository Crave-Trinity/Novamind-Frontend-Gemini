/**
 * @fileoverview Runtime validation functions for data related to the usePatientData hook.
 * Ensures that patient data structures conform to expected types at runtime, crucial for HIPAA compliance.
 */

import { Result, Ok, Err } from 'ts-results';
// Import actual domain type and nested types
import {
  Patient,
  PatientDemographics,
  ClinicalData,
  TreatmentData,
  NeuralData,
  DataPermissions,
  // Import nested array item types if deeper validation is needed (e.g., Diagnosis, Symptom)
} from '@domain/types/clinical/patient';
// Assuming a standard validation error type might be defined later
// import { ValidationError } from '@domain/errors/validation';

// Use the actual Patient type
type PatientData = Patient;

// --- Local Type Guards for Nested Patient Structures ---

function isPatientDemographics(obj: unknown): obj is PatientDemographics {
  if (typeof obj !== 'object' || obj === null) return false;
  const data = obj as Partial<PatientDemographics>;
  return (
    typeof data.age === 'number' &&
    typeof data.biologicalSex === 'string' && // Add enum check if needed
    typeof data.anonymizationLevel === 'string' // Add enum check if needed
    // Optional fields don't need strict checks unless present
  );
}

function isClinicalData(obj: unknown): obj is ClinicalData {
   if (typeof obj !== 'object' || obj === null) return false;
   const data = obj as Partial<ClinicalData>;
   // Check required arrays exist (can add .every(isDiagnosis) etc. for deeper checks)
   return (
     Array.isArray(data.diagnoses) &&
     Array.isArray(data.symptoms) &&
     Array.isArray(data.medications) &&
     Array.isArray(data.psychometricAssessments) &&
     Array.isArray(data.medicalHistory)
     // Optional fields don't need strict checks unless present
   );
}

function isTreatmentData(obj: unknown): obj is TreatmentData {
  if (typeof obj !== 'object' || obj === null) return false;
  const data = obj as Partial<TreatmentData>;
  // Check required arrays exist
  return (
    Array.isArray(data.currentTreatments) &&
    Array.isArray(data.historicalTreatments) &&
    Array.isArray(data.treatmentResponses)
    // Optional fields don't need strict checks unless present
  );
}

function isNeuralData(obj: unknown): obj is NeuralData {
   if (typeof obj !== 'object' || obj === null) return false;
   const data = obj as Partial<NeuralData>;
   // Check required arrays exist
   return (
     Array.isArray(data.brainScans)
     // Optional fields don't need strict checks unless present
   );
}

function isDataPermissions(obj: unknown): obj is DataPermissions {
  if (typeof obj !== 'object' || obj === null) return false;
  const data = obj as Partial<DataPermissions>;
  return (
    typeof data.accessLevel === 'string' && // Add enum check if needed
    Array.isArray(data.authorizedUsers) &&
    typeof data.consentStatus === 'string' && // Add enum check if needed
    typeof data.dataRetentionPolicy === 'string' &&
    typeof data.lastReviewDate === 'string'
    // Optional fields don't need strict checks unless present
  );
}

// --- Enhanced isPatient Guard ---
// This guard performs deeper checks on nested required properties.
function isPatientDeep(obj: unknown): obj is Patient {
  if (typeof obj !== 'object' || obj === null) return false;

  const patient = obj as Partial<Patient>;

  return (
    typeof patient.id === 'string' &&
    typeof patient.lastUpdated === 'string' &&
    typeof patient.version === 'string' &&
    isPatientDemographics(patient.demographicData) &&
    isClinicalData(patient.clinicalData) &&
    isTreatmentData(patient.treatmentData) &&
    isNeuralData(patient.neuralData) &&
    isDataPermissions(patient.dataAccessPermissions)
  );
}


/**
 * Validates the structure and types of PatientData using the enhanced deep type guard.
 * @param data - The data to validate.
 * @returns Result<PatientData, Error> - Using generic Error for now.
 */
export function validatePatientData(data: unknown): Result<PatientData, Error> {
  // Use the enhanced deep type guard for comprehensive validation
  if (isPatientDeep(data)) {
    // The type guard confirms the structure matches Patient deeply
    return Ok(data);
  } else {
    // Provide a more informative error message
    // TODO: Potentially use a specific ValidationError class if defined
    return Err(new Error('Invalid PatientData: Data does not conform to the Patient structure.'));
  }
}

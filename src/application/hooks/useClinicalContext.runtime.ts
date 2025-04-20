/* eslint-disable */
/**
 * @fileoverview Runtime validation functions for data related to the useClinicalContext hook.
 * Ensures that clinical context data structures conform to expected types at runtime.
 */

import { Ok, Err, type Result } from 'ts-results';
import { type RiskAssessment, isRiskAssessment } from '@domain/types/clinical/risk';
import {
  type TreatmentResponsePrediction,
  isTreatmentResponsePrediction,
} from '@domain/types/clinical/treatment';
import type {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
  TreatmentNeuralMapping,
  NeuralActivationPattern, // Needed for nested validation
} from '@domain/models/brain/mapping/brain-mapping';
// import { ValidationError } from '@domain/errors/validation'; // Assuming a custom error type

// --- Type Guards (Basic implementations based on required fields) ---

function isNeuralActivationPattern(obj: unknown): obj is NeuralActivationPattern {
  if (typeof obj !== 'object' || obj === null) return false;
  const pattern = obj as Partial<NeuralActivationPattern>;
  return (
    Array.isArray(pattern.regionIds) &&
    pattern.regionIds.every((id) => typeof id === 'string') &&
    typeof pattern.intensity === 'number' &&
    typeof pattern.confidence === 'number' &&
    typeof pattern.connectivity === 'object' && // Basic check, could be deeper
    typeof pattern.timeScale === 'string' // Basic check
  );
}

function isSymptomNeuralMapping(obj: unknown): obj is SymptomNeuralMapping {
  if (typeof obj !== 'object' || obj === null) return false;
  const mapping = obj as Partial<SymptomNeuralMapping>;
  return (
    typeof mapping.symptomId === 'string' &&
    typeof mapping.symptomName === 'string' &&
    typeof mapping.category === 'string' &&
    Array.isArray(mapping.activationPatterns) &&
    mapping.activationPatterns.every(isNeuralActivationPattern) && // Validate nested patterns
    Array.isArray(mapping.contributingFactors) &&
    typeof mapping.evidenceQuality === 'string'
  );
}

function isDiagnosisNeuralMapping(obj: unknown): obj is DiagnosisNeuralMapping {
  if (typeof obj !== 'object' || obj === null) return false;
  const mapping = obj as Partial<DiagnosisNeuralMapping>;
  return (
    typeof mapping.diagnosisId === 'string' &&
    typeof mapping.diagnosisName === 'string' &&
    typeof mapping.codingSystem === 'string' &&
    Array.isArray(mapping.activationPatterns) &&
    mapping.activationPatterns.every(isNeuralActivationPattern) && // Validate nested patterns
    typeof mapping.evidenceQuality === 'string'
    // Optional fields stageSpecificPatterns, subtypePatterns not strictly checked here
  );
}

function isTreatmentNeuralMapping(obj: unknown): obj is TreatmentNeuralMapping {
  if (typeof obj !== 'object' || obj === null) return false;
  const mapping = obj as Partial<TreatmentNeuralMapping>;
  return (
    typeof mapping.treatmentId === 'string' &&
    typeof mapping.treatmentName === 'string' &&
    typeof mapping.treatmentType === 'string' && // Basic check for TreatmentType enum/string
    Array.isArray(mapping.mechanismsOfAction) && // Basic check, could be deeper
    typeof mapping.effectPatterns === 'object' && // Basic check, could be deeper
    typeof mapping.evidenceQuality === 'string'
  );
}

// --- Validation Functions ---

/**
 * Validates a RiskAssessment object.
 * @param data - The data to validate.
 * @returns Result<RiskAssessment, Error>
 */
export function validateRiskAssessment(data: unknown): Result<RiskAssessment, Error> {
  if (isRiskAssessment(data)) {
    return Ok(data);
  }
  return Err(new Error('Invalid RiskAssessment data.'));
}

/**
 * Validates an array of TreatmentResponsePrediction objects.
 * @param data - The array to validate.
 * @returns Result<TreatmentResponsePrediction[], Error>
 */
export function validateTreatmentResponsePredictionArray(
  data: unknown
): Result<TreatmentResponsePrediction[], Error> {
  if (!Array.isArray(data)) {
    return Err(new Error('Invalid TreatmentResponsePrediction array: Input must be an array.'));
  }
  if (!data.every(isTreatmentResponsePrediction)) {
    return Err(
      new Error(
        'Invalid TreatmentResponsePrediction array: One or more items do not conform to the TreatmentResponsePrediction structure.'
      )
    );
  }
  return Ok(data); // Type assertion is safe due to .every check
}

/**
 * Validates an array of SymptomNeuralMapping objects.
 * @param data - The array to validate.
 * @returns Result<SymptomNeuralMapping[], Error>
 */
export function validateSymptomMappingArray(data: unknown): Result<SymptomNeuralMapping[], Error> {
  if (!Array.isArray(data)) {
    return Err(new Error('Invalid SymptomNeuralMapping array: Input must be an array.'));
  }
  if (!data.every(isSymptomNeuralMapping)) {
    return Err(
      new Error(
        'Invalid SymptomNeuralMapping array: One or more items do not conform to the SymptomNeuralMapping structure.'
      )
    );
  }
  return Ok(data); // Type assertion is safe due to .every check
}

/**
 * Validates an array of DiagnosisNeuralMapping objects.
 * @param data - The array to validate.
 * @returns Result<DiagnosisNeuralMapping[], Error>
 */
export function validateDiagnosisMappingArray(
  data: unknown
): Result<DiagnosisNeuralMapping[], Error> {
  if (!Array.isArray(data)) {
    return Err(new Error('Invalid DiagnosisNeuralMapping array: Input must be an array.'));
  }
  if (!data.every(isDiagnosisNeuralMapping)) {
    return Err(
      new Error(
        'Invalid DiagnosisNeuralMapping array: One or more items do not conform to the DiagnosisNeuralMapping structure.'
      )
    );
  }
  return Ok(data); // Type assertion is safe due to .every check
}

/**
 * Validates an array of TreatmentNeuralMapping objects.
 * @param data - The array to validate.
 * @returns Result<TreatmentNeuralMapping[], Error>
 */
export function validateTreatmentMappingArray(
  data: unknown
): Result<TreatmentNeuralMapping[], Error> {
  if (!Array.isArray(data)) {
    return Err(new Error('Invalid TreatmentNeuralMapping array: Input must be an array.'));
  }
  if (!data.every(isTreatmentNeuralMapping)) {
    return Err(
      new Error(
        'Invalid TreatmentNeuralMapping array: One or more items do not conform to the TreatmentNeuralMapping structure.'
      )
    );
  }
  return Ok(data); // Type assertion is safe due to .every check
}

// Note: The original validateClinicalContextData function is removed as it was too generic.
// Validation should happen on specific data types fetched or used by the hook.

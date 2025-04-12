/* eslint-disable */
/**
 * @fileoverview Runtime validation functions for data related to the ClinicalPredictionController.
 * Ensures that prediction request inputs and results conform to expected types.
 * NOTE: Domain types for predictions are missing/placeholders; validation is based on controller usage.
 */

import type { Result } from 'ts-results';
import { Ok, Err } from 'ts-results';
import type { RiskAssessment } from '@domain/types/clinical/risk'; // Assuming this exists and is correct
// import { ValidationError } from '@domain/errors/validation'; // If specific error types are defined

// --- Inferred Types & Enums (Based on ClinicalPredictionController.ts usage) ---

// Placeholder types matching the controller
// type PredictionInterval = any; // Removed unused TS6196
type PredictionResult = any; // Restore used type alias
// type PredictionAccuracy = any; // Removed unused TS6196
type PredictionModel = any; // Controller uses string literals: 'bayesian', 'statistical'
// type ConfidenceLevel = any; // Removed unused TS6196
// type SymptomTrajectory = any; // Removed unused TS6196
// type TreatmentOutcome = any; // Removed unused TS6196
// type RelapsePrediction = any; // Removed unused TS6196
// type TimeseriesDataPoint = any; // Removed unused TS6196

type AggregationMethod = 'weighted' | 'bayesian' | 'ensemble' | 'highest-confidence';

// Interface for the parameters common to prediction calls
interface BasePredictionParams {
  patientId: string;
  horizon: number;
  includeBiomarkers: boolean;
  includeEnvironmentalFactors: boolean;
  models: PredictionModel[]; // Array of strings based on default state
  aggregationMethod: AggregationMethod;
}

interface SymptomPredictionParams extends BasePredictionParams {
  symptomIds: string[];
}

interface TreatmentPredictionParams extends BasePredictionParams {
  treatmentIds: string[];
}

interface RelapsePredictionParams extends BasePredictionParams {
  disorderIds: string[];
}

interface RiskAssessmentParams {
  patientId: string;
  riskFactors: string[];
  includeBiomarkers: boolean;
  includeEnvironmentalFactors: boolean;
  models: PredictionModel[];
  aggregationMethod: AggregationMethod;
}

interface ConfigurePredictionParams {
  predictionHorizon?: number;
  activeModels?: PredictionModel[];
  aggregationMethod?: AggregationMethod;
  includeBiomarkers?: boolean;
  includeEnvironmentalFactors?: boolean;
}

// --- Type Guards ---

function isAggregationMethod(value: unknown): value is AggregationMethod {
  const validMethods: AggregationMethod[] = [
    'weighted',
    'bayesian',
    'ensemble',
    'highest-confidence',
  ];
  return typeof value === 'string' && validMethods.includes(value as AggregationMethod);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

// Enhanced type guard for RiskAssessment
function isRiskAssessment(obj: unknown): obj is RiskAssessment {
  if (typeof obj !== 'object' || obj === null) return false;

  const assessment = obj as Partial<RiskAssessment>;

  // Check all required fields with appropriate types
  return (
    typeof assessment.id === 'string' &&
    typeof assessment.patientId === 'string' &&
    typeof assessment.overallRisk === 'string' &&
    typeof assessment.confidenceScore === 'number' &&
    typeof assessment.timestamp === 'string' &&
    typeof assessment.assessmentType === 'string' &&
    Array.isArray(assessment.domainRisks) &&
    typeof assessment.temporalTrend === 'string' &&
    Array.isArray(assessment.contributingFactors) &&
    Array.isArray(assessment.protectiveFactors) &&
    Array.isArray(assessment.neuralCorrelates)
  );
}

// --- Validation Functions ---

// Renamed from validatePredictionRequestData to be more specific
export function validateSymptomPredictionParams(
  params: unknown
): Result<SymptomPredictionParams, Error> {
  if (typeof params !== 'object' || params === null) {
    return Err(new Error('Invalid SymptomPredictionParams: Input must be an object.'));
  }
  const p = params as Partial<SymptomPredictionParams>;

  if (typeof p.patientId !== 'string')
    return Err(new Error('Invalid SymptomPredictionParams: patientId must be a string.'));
  if (!isStringArray(p.symptomIds))
    return Err(
      new Error('Invalid SymptomPredictionParams: symptomIds must be an array of strings.')
    );
  if (typeof p.horizon !== 'number' || p.horizon <= 0)
    return Err(new Error('Invalid SymptomPredictionParams: horizon must be a positive number.'));
  if (typeof p.includeBiomarkers !== 'boolean')
    return Err(new Error('Invalid SymptomPredictionParams: includeBiomarkers must be a boolean.'));
  if (typeof p.includeEnvironmentalFactors !== 'boolean')
    return Err(
      new Error('Invalid SymptomPredictionParams: includeEnvironmentalFactors must be a boolean.')
    );
  if (!Array.isArray(p.models))
    return Err(new Error('Invalid SymptomPredictionParams: models must be an array.')); // Basic check as PredictionModel is 'any'
  if (!isAggregationMethod(p.aggregationMethod))
    return Err(new Error('Invalid SymptomPredictionParams: invalid aggregationMethod.'));

  return Ok(p as SymptomPredictionParams);
}

// Added validator for TreatmentPredictionParams
export function validateTreatmentPredictionParams(
  params: unknown
): Result<TreatmentPredictionParams, Error> {
  if (typeof params !== 'object' || params === null) {
    return Err(new Error('Invalid TreatmentPredictionParams: Input must be an object.'));
  }
  const p = params as Partial<TreatmentPredictionParams>;

  if (typeof p.patientId !== 'string')
    return Err(new Error('Invalid TreatmentPredictionParams: patientId must be a string.'));
  if (!isStringArray(p.treatmentIds))
    return Err(
      new Error('Invalid TreatmentPredictionParams: treatmentIds must be an array of strings.')
    );
  if (typeof p.horizon !== 'number' || p.horizon <= 0)
    return Err(new Error('Invalid TreatmentPredictionParams: horizon must be a positive number.'));
  if (typeof p.includeBiomarkers !== 'boolean')
    return Err(
      new Error('Invalid TreatmentPredictionParams: includeBiomarkers must be a boolean.')
    );
  if (typeof p.includeEnvironmentalFactors !== 'boolean')
    return Err(
      new Error('Invalid TreatmentPredictionParams: includeEnvironmentalFactors must be a boolean.')
    );
  if (!Array.isArray(p.models))
    return Err(new Error('Invalid TreatmentPredictionParams: models must be an array.'));
  if (!isAggregationMethod(p.aggregationMethod))
    return Err(new Error('Invalid TreatmentPredictionParams: invalid aggregationMethod.'));

  return Ok(p as TreatmentPredictionParams);
}

// Added validator for RelapsePredictionParams
export function validateRelapsePredictionParams(
  params: unknown
): Result<RelapsePredictionParams, Error> {
  if (typeof params !== 'object' || params === null) {
    return Err(new Error('Invalid RelapsePredictionParams: Input must be an object.'));
  }
  const p = params as Partial<RelapsePredictionParams>;

  if (typeof p.patientId !== 'string')
    return Err(new Error('Invalid RelapsePredictionParams: patientId must be a string.'));
  if (!isStringArray(p.disorderIds))
    return Err(
      new Error('Invalid RelapsePredictionParams: disorderIds must be an array of strings.')
    );
  if (typeof p.horizon !== 'number' || p.horizon <= 0)
    return Err(new Error('Invalid RelapsePredictionParams: horizon must be a positive number.'));
  if (typeof p.includeBiomarkers !== 'boolean')
    return Err(new Error('Invalid RelapsePredictionParams: includeBiomarkers must be a boolean.'));
  if (typeof p.includeEnvironmentalFactors !== 'boolean')
    return Err(
      new Error('Invalid RelapsePredictionParams: includeEnvironmentalFactors must be a boolean.')
    );
  if (!Array.isArray(p.models))
    return Err(new Error('Invalid RelapsePredictionParams: models must be an array.'));
  if (!isAggregationMethod(p.aggregationMethod))
    return Err(new Error('Invalid RelapsePredictionParams: invalid aggregationMethod.'));

  return Ok(p as RelapsePredictionParams);
}

// Added validator for RiskAssessmentParams
export function validateRiskAssessmentParams(params: unknown): Result<RiskAssessmentParams, Error> {
  if (typeof params !== 'object' || params === null) {
    return Err(new Error('Invalid RiskAssessmentParams: Input must be an object.'));
  }
  const p = params as Partial<RiskAssessmentParams>;

  if (typeof p.patientId !== 'string')
    return Err(new Error('Invalid RiskAssessmentParams: patientId must be a string.'));
  if (!isStringArray(p.riskFactors))
    return Err(new Error('Invalid RiskAssessmentParams: riskFactors must be an array of strings.'));
  if (typeof p.includeBiomarkers !== 'boolean')
    return Err(new Error('Invalid RiskAssessmentParams: includeBiomarkers must be a boolean.'));
  if (typeof p.includeEnvironmentalFactors !== 'boolean')
    return Err(
      new Error('Invalid RiskAssessmentParams: includeEnvironmentalFactors must be a boolean.')
    );
  if (!Array.isArray(p.models))
    return Err(new Error('Invalid RiskAssessmentParams: models must be an array.'));
  if (!isAggregationMethod(p.aggregationMethod))
    return Err(new Error('Invalid RiskAssessmentParams: invalid aggregationMethod.'));

  return Ok(p as RiskAssessmentParams);
}

// Added validator for ConfigurePredictionParams
export function validateConfigurePredictionParams(
  params: unknown
): Result<ConfigurePredictionParams, Error> {
  if (typeof params !== 'object' || params === null) {
    return Err(new Error('Invalid ConfigurePredictionParams: Input must be an object.'));
  }
  const p = params as Partial<ConfigurePredictionParams>;

  if (
    p.predictionHorizon !== undefined &&
    (typeof p.predictionHorizon !== 'number' || p.predictionHorizon <= 0)
  )
    return Err(
      new Error('Invalid ConfigurePredictionParams: predictionHorizon must be a positive number.')
    );
  if (p.activeModels !== undefined && !Array.isArray(p.activeModels))
    return Err(new Error('Invalid ConfigurePredictionParams: activeModels must be an array.'));
  if (p.aggregationMethod !== undefined && !isAggregationMethod(p.aggregationMethod))
    return Err(new Error('Invalid ConfigurePredictionParams: invalid aggregationMethod.'));
  if (p.includeBiomarkers !== undefined && typeof p.includeBiomarkers !== 'boolean')
    return Err(
      new Error('Invalid ConfigurePredictionParams: includeBiomarkers must be a boolean.')
    );
  if (
    p.includeEnvironmentalFactors !== undefined &&
    typeof p.includeEnvironmentalFactors !== 'boolean'
  )
    return Err(
      new Error('Invalid ConfigurePredictionParams: includeEnvironmentalFactors must be a boolean.')
    );

  return Ok(p as ConfigurePredictionParams);
}

/**
 * Validates the structure and types of PredictionResultData (Placeholder).
 * @param data - The result data to validate.
 * @returns Result<PredictionResultData, Error>
 */
export function validatePredictionResultData(data: unknown): Result<PredictionResult, Error> {
  // TODO: Implement detailed validation logic when PredictionResult type is defined
  if (typeof data !== 'object' || data === null) {
    return Err(new Error('Invalid PredictionResultData: Input must be an object.'));
  }
  // Add checks based on PredictionResult structure
  return Ok(data as PredictionResult);
}

/**
 * Validates the structure and types of RiskAssessmentData.
 * @param data - The assessment data to validate.
 * @returns Result<RiskAssessmentData, Error>
 */
export function validateRiskAssessmentData(data: unknown): Result<RiskAssessment, Error> {
  // First check if it's a valid RiskAssessment object
  if (isRiskAssessment(data)) {
    return Ok(data);
  }

  // If not, provide detailed error message
  let errorMessage = 'Invalid RiskAssessmentData structure.';

  if (typeof data !== 'object' || data === null) {
    errorMessage += ' Expected an object but received ' + typeof data;
  } else {
    // Check which fields are missing and add to error message
    const assessment = data as Partial<RiskAssessment>;
    const missingFields: string[] = []; // Explicitly type as string array

    if (!assessment.id) missingFields.push('id');
    if (!assessment.patientId) missingFields.push('patientId');
    if (!assessment.overallRisk) missingFields.push('overallRisk');
    if (assessment.confidenceScore === undefined) missingFields.push('confidenceScore');
    if (!assessment.timestamp) missingFields.push('timestamp');
    if (!assessment.assessmentType) missingFields.push('assessmentType');

    if (missingFields.length > 0) {
      errorMessage += ' Missing required fields: ' + missingFields.join(', ');
    }
  }

  return Err(new Error(errorMessage));
}

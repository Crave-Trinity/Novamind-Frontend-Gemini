/**
 * NOVAMIND Neural-Safe Clinical Type Runtime Validators
 *
 * Runtime validators for Treatment data types with clinical precision.
 * This module provides runtime validation for the Treatment interfaces.
 */

import type {
  TreatmentType,
  TreatmentResponseRequest,
  TreatmentDetails,
  ClinicalPredictionData,
  GeneticPredictionData,
  BiomarkerData,
  // Removed unused: NeuroimagingFeatures,
  TreatmentResponsePrediction,
  TreatmentComparisonResult,
} from '@domain/types/clinical/treatment';

/**
 * Runtime validation for TreatmentType
 */
export const TreatmentTypeValidator = {
  /**
   * Validates if a value is a valid TreatmentType
   */
  isValid: (value: unknown): value is TreatmentType => {
    const validTypes = [
      'pharmacological',
      'psychotherapy',
      'neuromodulation',
      'neurofeedback',
      'lifestyle_intervention',
      'combination',
    ];
    return typeof value === 'string' && validTypes.includes(value as TreatmentType);
  },
};

/**
 * Runtime validation for TreatmentResponseRequest objects
 */
export const TreatmentResponseRequestValidator = {
  /**
   * Validates if an object is a valid TreatmentResponseRequest
   */
  isValid: (obj: unknown): obj is TreatmentResponseRequest => {
    if (!obj || typeof obj !== 'object') return false;

    const request = obj as Partial<TreatmentResponseRequest>;
    return (
      typeof request.patient_id === 'string' &&
      TreatmentTypeValidator.isValid(request.treatment_type) &&
      request.treatment_details !== undefined &&
      request.clinical_data !== undefined
    );
  },
};

/**
 * Runtime validation for TreatmentDetails objects
 */
export const TreatmentDetailsValidator = {
  /**
   * Validates if an object is a valid TreatmentDetails
   */
  isValid: (obj: unknown): obj is TreatmentDetails => {
    if (!obj || typeof obj !== 'object') return false;

    const details = obj as Partial<TreatmentDetails>;

    // At least one treatment type should be defined
    return !!(
      details.medication ||
      details.psychotherapy ||
      details.neuromodulation ||
      details.neurofeedback ||
      details.lifestyle ||
      details.combination
    );
  },

  /**
   * Validates medication details
   */
  isValidMedication: (obj: unknown): boolean => {
    if (!obj || typeof obj !== 'object') return false;

    const medication = obj as any;
    return (
      typeof medication.name === 'string' &&
      typeof medication.class === 'string' &&
      typeof medication.dosage === 'string' &&
      typeof medication.frequency === 'string' &&
      typeof medication.duration === 'string' &&
      typeof medication.previousExposure === 'boolean'
    );
  },

  /**
   * Validates psychotherapy details
   */
  isValidPsychotherapy: (obj: unknown): boolean => {
    if (!obj || typeof obj !== 'object') return false;

    const psychotherapy = obj as any;
    const validTypes = ['cbt', 'dbt', 'psychodynamic', 'interpersonal', 'emdr', 'act', 'other'];
    const validModalities = ['individual', 'group', 'family', 'couples'];

    return (
      typeof psychotherapy.type === 'string' &&
      validTypes.includes(psychotherapy.type) &&
      typeof psychotherapy.frequency === 'string' &&
      typeof psychotherapy.duration === 'string' &&
      typeof psychotherapy.modality === 'string' &&
      validModalities.includes(psychotherapy.modality) &&
      typeof psychotherapy.previousExposure === 'boolean'
    );
  },

  /**
   * Validates neuromodulation details
   */
  isValidNeuromodulation: (obj: unknown): boolean => {
    if (!obj || typeof obj !== 'object') return false;

    const neuromodulation = obj as any;
    const validTypes = ['tms', 'ect', 'tdcs', 'dbs', 'vns', 'other'];

    return (
      typeof neuromodulation.type === 'string' &&
      validTypes.includes(neuromodulation.type) &&
      Array.isArray(neuromodulation.targetRegions) &&
      typeof neuromodulation.parameters === 'object' &&
      typeof neuromodulation.previousExposure === 'boolean'
    );
  },
};

/**
 * Runtime validation for ClinicalPredictionData objects
 */
export const ClinicalPredictionDataValidator = {
  /**
   * Validates if an object is a valid ClinicalPredictionData
   */
  isValid: (obj: unknown): obj is ClinicalPredictionData => {
    if (!obj || typeof obj !== 'object') return false;

    const data = obj as Partial<ClinicalPredictionData>;
    const validFunctionalImpairment = ['none', 'mild', 'moderate', 'severe'];

    return (
      Array.isArray(data.diagnosis) &&
      typeof data.symptomSeverity === 'object' &&
      typeof data.illnessDuration === 'number' &&
      Array.isArray(data.previousTreatmentResponses) &&
      Array.isArray(data.comorbidities) &&
      Array.isArray(data.currentMedications) &&
      typeof data.functionalImpairment === 'string' &&
      validFunctionalImpairment.includes(data.functionalImpairment as any) &&
      typeof data.suicidalIdeation === 'boolean' &&
      typeof data.substanceUse === 'boolean'
    );
  },
};

/**
 * Runtime validation for GeneticPredictionData objects
 */
export const GeneticPredictionDataValidator = {
  /**
   * Validates if an object is a valid GeneticPredictionData
   */
  isValid: (obj: unknown): obj is GeneticPredictionData => {
    if (!obj || typeof obj !== 'object') return false;

    // All fields are optional, so we just need to verify the object type
    return true;
  },

  /**
   * Validates metabolizer status if present
   */
  isValidMetabolizerStatus: (obj: unknown): boolean => {
    if (!obj || typeof obj !== 'object') return false;

    const metabolizer = obj as any;
    const validStatuses = ['poor', 'intermediate', 'normal', 'rapid', 'ultrarapid'];

    // Check each CYP enzyme if present
    if (metabolizer.cyp2d6 && !validStatuses.includes(metabolizer.cyp2d6)) return false;
    if (metabolizer.cyp2c19 && !validStatuses.includes(metabolizer.cyp2c19)) return false;
    if (metabolizer.cyp3a4 && !validStatuses.includes(metabolizer.cyp3a4)) return false;
    if (metabolizer.cyp1a2 && !validStatuses.includes(metabolizer.cyp1a2)) return false;

    return true;
  },
};

/**
 * Runtime validation for BiomarkerData objects
 */
export const BiomarkerDataValidator = {
  /**
   * Validates if an object is a valid BiomarkerData
   */
  isValid: (obj: unknown): obj is BiomarkerData => {
    if (!obj || typeof obj !== 'object') return false;

    const biomarkers = obj as Partial<BiomarkerData>;

    // Check that at least one biomarker category exists
    return !!(
      biomarkers.inflammatoryMarkers ||
      biomarkers.metabolicMarkers ||
      biomarkers.endocrineMarkers ||
      biomarkers.neurotransmitterMetabolites ||
      biomarkers.oxidativeStressMarkers ||
      biomarkers.microbiomeProfile
    );
  },
};

/**
 * Runtime validation for TreatmentResponsePrediction objects
 */
export const TreatmentResponsePredictionValidator = {
  /**
   * Validates if an object is a valid TreatmentResponsePrediction
   */
  isValid: (obj: unknown): obj is TreatmentResponsePrediction => {
    if (!obj || typeof obj !== 'object') return false;

    const prediction = obj as any;
    return (
      typeof prediction.patientId === 'string' &&
      TreatmentTypeValidator.isValid(prediction.treatmentType) &&
      typeof prediction.prediction === 'object' &&
      Array.isArray(prediction.sideEffectRisks) &&
      Array.isArray(prediction.symptomSpecificPredictions)
    );
  },
};

/**
 * Runtime validation for TreatmentComparisonResult objects
 */
export const TreatmentComparisonResultValidator = {
  /**
   * Validates if an object is a valid TreatmentComparisonResult
   */
  isValid: (obj: unknown): obj is TreatmentComparisonResult => {
    if (!obj || typeof obj !== 'object') return false;

    const comparison = obj as any;
    return (
      typeof comparison.patientId === 'string' &&
      Array.isArray(comparison.comparedTreatments) &&
      typeof comparison.efficacyComparison === 'object' &&
      typeof comparison.sideEffectComparison === 'object' &&
      typeof comparison.recommendationSummary === 'object'
    );
  },
};

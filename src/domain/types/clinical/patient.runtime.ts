/**
 * NOVAMIND Neural-Safe Clinical Type Runtime Validators
 *
 * Runtime validators for Patient data types with HIPAA compliance.
 * This module provides runtime validation for the Patient interfaces.
 */

import type {
  Patient,
  PatientDemographics,
  ClinicalData,
  Diagnosis,
  Symptom,
  Medication,
} from '@domain/types/clinical/patient';

/**
 * Runtime validation for Patient objects
 */
export const PatientValidator = {
  /**
   * Validates if an object is a valid Patient
   */
  isValid: (obj: unknown): obj is Patient => {
    if (!obj || typeof obj !== 'object') return false;

    const patient = obj as Partial<Patient>;
    return (
      typeof patient.id === 'string' &&
      patient.demographicData !== undefined &&
      patient.clinicalData !== undefined &&
      patient.treatmentData !== undefined &&
      patient.neuralData !== undefined &&
      patient.dataAccessPermissions !== undefined &&
      typeof patient.lastUpdated === 'string' &&
      typeof patient.version === 'string'
    );
  },
};

/**
 * Runtime validation for PatientDemographics objects
 */
export const PatientDemographicsValidator = {
  /**
   * Validates if an object is a valid PatientDemographics
   */
  isValid: (obj: unknown): obj is PatientDemographics => {
    if (!obj || typeof obj !== 'object') return false;

    const demographics = obj as Partial<PatientDemographics>;
    return (
      typeof demographics.age === 'number' &&
      (demographics.biologicalSex === 'male' ||
        demographics.biologicalSex === 'female' ||
        demographics.biologicalSex === 'other') &&
      (demographics.anonymizationLevel === 'full' ||
        demographics.anonymizationLevel === 'partial' ||
        demographics.anonymizationLevel === 'research' ||
        demographics.anonymizationLevel === 'clinical')
    );
  },
};

/**
 * Runtime validation for Diagnosis objects
 */
export const DiagnosisValidator = {
  /**
   * Validates if an object is a valid Diagnosis
   */
  isValid: (obj: unknown): obj is Diagnosis => {
    if (!obj || typeof obj !== 'object') return false;

    const diagnosis = obj as Partial<Diagnosis>;
    return (
      typeof diagnosis.id === 'string' &&
      typeof diagnosis.code === 'string' &&
      typeof diagnosis.name === 'string' &&
      (diagnosis.codingSystem === 'ICD-10' ||
        diagnosis.codingSystem === 'ICD-11' ||
        diagnosis.codingSystem === 'DSM-5' ||
        diagnosis.codingSystem === 'DSM-5-TR') &&
      (diagnosis.severity === 'mild' ||
        diagnosis.severity === 'moderate' ||
        diagnosis.severity === 'severe' ||
        diagnosis.severity === 'in remission' ||
        diagnosis.severity === 'unspecified')
    );
  },
};

/**
 * Runtime validation for Symptom objects
 */
export const SymptomValidator = {
  /**
   * Validates if an object is a valid Symptom
   */
  isValid: (obj: unknown): obj is Symptom => {
    if (!obj || typeof obj !== 'object') return false;

    const symptom = obj as Partial<Symptom>;
    return (
      typeof symptom.id === 'string' &&
      typeof symptom.name === 'string' &&
      typeof symptom.severity === 'number' &&
      (symptom.category === 'cognitive' ||
        symptom.category === 'affective' ||
        symptom.category === 'behavioral' ||
        symptom.category === 'somatic' ||
        symptom.category === 'perceptual')
    );
  },
};

/**
 * Runtime validation for Medication objects
 */
export const MedicationValidator = {
  /**
   * Validates if an object is a valid Medication
   */
  isValid: (obj: unknown): obj is Medication => {
    if (!obj || typeof obj !== 'object') return false;

    const medication = obj as Partial<Medication>;
    return (
      typeof medication.id === 'string' &&
      typeof medication.name === 'string' &&
      typeof medication.dosage === 'string' &&
      typeof medication.frequency === 'string' &&
      typeof medication.startDate === 'string'
    );
  },
};

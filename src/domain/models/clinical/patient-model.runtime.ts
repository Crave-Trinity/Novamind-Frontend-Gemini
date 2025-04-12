/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Runtime Validators
 * Patient Model Domain Runtime Validation
 */

import type {
  PatientDemographics,
  ClinicalHistory,
  Medication,
  Symptom,
  TreatmentResponse,
  PatientModel,
} from '@domain/models/clinical/patient-model';

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
      ['male', 'female', 'other'].includes(demographics.biologicalSex as string) &&
      (demographics.heightCm === undefined || typeof demographics.heightCm === 'number') &&
      (demographics.weightKg === undefined || typeof demographics.weightKg === 'number') &&
      (demographics.handedness === undefined ||
        ['left', 'right', 'ambidextrous'].includes(demographics.handedness as string)) &&
      (demographics.ethnicity === undefined || typeof demographics.ethnicity === 'string')
    );
  },

  /**
   * Normalizes demographics by ensuring all required properties exist
   */
  normalize: (demographics: Partial<PatientDemographics> = {}): PatientDemographics => {
    return {
      age: demographics.age ?? 0,
      biologicalSex: demographics.biologicalSex ?? 'other',
      heightCm: demographics.heightCm,
      weightKg: demographics.weightKg,
      handedness: demographics.handedness,
      ethnicity: demographics.ethnicity,
    };
  },
};

/**
 * Runtime validation for ClinicalHistory objects
 */
export const ClinicalHistoryValidator = {
  /**
   * Validates if an object is a valid ClinicalHistory
   */
  isValid: (obj: unknown): obj is ClinicalHistory => {
    if (!obj || typeof obj !== 'object') return false;

    const history = obj as Partial<ClinicalHistory>;

    return (
      typeof history.primaryDiagnosis === 'string' &&
      (history.secondaryDiagnoses === undefined ||
        (Array.isArray(history.secondaryDiagnoses) &&
          history.secondaryDiagnoses.every((d) => typeof d === 'string'))) &&
      (history.diagnosisDate === undefined || history.diagnosisDate instanceof Date) &&
      (history.familyHistory === undefined ||
        (Array.isArray(history.familyHistory) &&
          history.familyHistory.every((h) => typeof h === 'string'))) &&
      (history.previousTreatments === undefined ||
        (Array.isArray(history.previousTreatments) &&
          history.previousTreatments.every((t) => typeof t === 'string'))) &&
      (history.allergies === undefined ||
        (Array.isArray(history.allergies) && history.allergies.every((a) => typeof a === 'string')))
    );
  },

  /**
   * Normalizes clinical history by ensuring all required properties exist
   */
  normalize: (history: Partial<ClinicalHistory> = {}): ClinicalHistory => {
    return {
      primaryDiagnosis: history.primaryDiagnosis || '',
      secondaryDiagnoses: history.secondaryDiagnoses,
      diagnosisDate: history.diagnosisDate,
      familyHistory: history.familyHistory,
      previousTreatments: history.previousTreatments,
      allergies: history.allergies,
    };
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
      medication.startDate instanceof Date &&
      (medication.endDate === undefined || medication.endDate instanceof Date) &&
      (medication.prescribedBy === undefined || typeof medication.prescribedBy === 'string') &&
      (medication.purpose === undefined || typeof medication.purpose === 'string') &&
      (medication.adherenceRate === undefined || typeof medication.adherenceRate === 'number') &&
      (medication.sideEffects === undefined ||
        (Array.isArray(medication.sideEffects) &&
          medication.sideEffects.every((e) => typeof e === 'string')))
    );
  },

  /**
   * Normalizes medication by ensuring all required properties exist
   */
  normalize: (medication: Partial<Medication> = {}): Medication => {
    return {
      id: medication.id || crypto.randomUUID(),
      name: medication.name || '',
      dosage: medication.dosage || '',
      frequency: medication.frequency || '',
      startDate: medication.startDate || new Date(),
      endDate: medication.endDate,
      prescribedBy: medication.prescribedBy,
      purpose: medication.purpose,
      adherenceRate: medication.adherenceRate,
      sideEffects: medication.sideEffects,
    };
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
      ['rare', 'occasional', 'frequent', 'constant'].includes(symptom.frequency as string) &&
      symptom.firstObserved instanceof Date &&
      (symptom.triggers === undefined ||
        (Array.isArray(symptom.triggers) &&
          symptom.triggers.every((t) => typeof t === 'string'))) &&
      (symptom.notes === undefined || typeof symptom.notes === 'string')
    );
  },

  /**
   * Normalizes symptom by ensuring all required properties exist
   */
  normalize: (symptom: Partial<Symptom> = {}): Symptom => {
    return {
      id: symptom.id || crypto.randomUUID(),
      name: symptom.name || '',
      severity: symptom.severity ?? 0,
      frequency: symptom.frequency || 'occasional',
      firstObserved: symptom.firstObserved || new Date(),
      triggers: symptom.triggers,
      notes: symptom.notes,
    };
  },
};

/**
 * Runtime validation for TreatmentResponse objects
 */
export const TreatmentResponseValidator = {
  /**
   * Validates if an object is a valid TreatmentResponse
   */
  isValid: (obj: unknown): obj is TreatmentResponse => {
    if (!obj || typeof obj !== 'object') return false;

    const response = obj as Partial<TreatmentResponse>;

    return (
      typeof response.treatmentId === 'string' &&
      typeof response.treatmentName === 'string' &&
      response.startDate instanceof Date &&
      (response.endDate === undefined || response.endDate instanceof Date) &&
      typeof response.effectivenesRating === 'number' &&
      (response.sideEffects === undefined ||
        (Array.isArray(response.sideEffects) &&
          response.sideEffects.every((e) => typeof e === 'string'))) &&
      (response.notes === undefined || typeof response.notes === 'string')
    );
  },

  /**
   * Normalizes treatment response by ensuring all required properties exist
   */
  normalize: (response: Partial<TreatmentResponse> = {}): TreatmentResponse => {
    return {
      treatmentId: response.treatmentId || '',
      treatmentName: response.treatmentName || '',
      startDate: response.startDate || new Date(),
      endDate: response.endDate,
      effectivenesRating: response.effectivenesRating ?? 0,
      sideEffects: response.sideEffects,
      notes: response.notes,
    };
  },
};

/**
 * Runtime validation for PatientModel objects
 */
export const PatientModelValidator = {
  /**
   * Validates if an object is a valid PatientModel
   */
  isValid: (obj: unknown): obj is PatientModel => {
    if (!obj || typeof obj !== 'object') return false;

    const patient = obj as Partial<PatientModel>;

    return (
      typeof patient.id === 'string' &&
      typeof patient.firstName === 'string' &&
      typeof patient.lastName === 'string' &&
      patient.dateOfBirth instanceof Date &&
      typeof patient.contactInformation === 'object' && // Ensure contactInformation is a non-null object
      patient.contactInformation !== null &&
      typeof patient.demographics === 'object' && // Ensure demographics is a non-null object
      patient.demographics !== null &&
      PatientDemographicsValidator.isValid(patient.demographics) &&
      typeof patient.clinicalHistory === 'object' && // Ensure clinicalHistory is a non-null object
      patient.clinicalHistory !== null &&
      ClinicalHistoryValidator.isValid(patient.clinicalHistory) &&
      Array.isArray(patient.medications) &&
      patient.medications.every(MedicationValidator.isValid) &&
      Array.isArray(patient.symptoms) &&
      patient.symptoms.every(SymptomValidator.isValid) &&
      Array.isArray(patient.treatmentResponses) &&
      patient.treatmentResponses.every(TreatmentResponseValidator.isValid) &&
      (patient.brainModels === undefined ||
        (Array.isArray(patient.brainModels) &&
          patient.brainModels.every((m) => typeof m === 'string'))) &&
      typeof patient.version === 'number' &&
      patient.lastUpdated instanceof Date &&
      typeof patient.createdBy === 'string' &&
      (patient.updatedBy === undefined || typeof patient.updatedBy === 'string')
    );
  },

  /**
   * Normalizes patient model by ensuring all required properties exist
   */
  normalize: (patient: Partial<PatientModel> = {}): PatientModel => {
    const now = new Date();
    return {
      id: patient.id || crypto.randomUUID(),
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      dateOfBirth: patient.dateOfBirth || new Date(),
      contactInformation: patient.contactInformation || {},
      demographics: PatientDemographicsValidator.normalize(patient.demographics),
      clinicalHistory: ClinicalHistoryValidator.normalize(patient.clinicalHistory),
      medications: Array.isArray(patient.medications)
        ? patient.medications.map((m) => MedicationValidator.normalize(m))
        : [],
      symptoms: Array.isArray(patient.symptoms)
        ? patient.symptoms.map((s) => SymptomValidator.normalize(s))
        : [],
      treatmentResponses: Array.isArray(patient.treatmentResponses)
        ? patient.treatmentResponses.map((r) => TreatmentResponseValidator.normalize(r))
        : [],
      brainModels: patient.brainModels,
      version: patient.version || 1,
      lastUpdated: patient.lastUpdated || now,
      createdBy: patient.createdBy || 'system',
      updatedBy: patient.updatedBy,
    };
  },
};

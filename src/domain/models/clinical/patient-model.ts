/**
 * NOVAMIND Neural-Safe Type Definitions
 * Patient Model Domain Types with quantum-level type safety
 */

// Patient clinical demographic information
export interface PatientDemographics {
  age: number;
  biologicalSex: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  handedness?: 'left' | 'right' | 'ambidextrous';
  ethnicity?: string;
}

// Patient diagnosis and clinical history
export interface ClinicalHistory {
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  diagnosisDate?: Date;
  familyHistory?: string[];
  previousTreatments?: string[];
  allergies?: string[];
}

// Medication with dosage information
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy?: string;
  purpose?: string;
  adherenceRate?: number;
  sideEffects?: string[];
}

// Symptom tracking
export interface Symptom {
  id: string;
  name: string;
  severity: number; // 0-10 scale
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  firstObserved: Date;
  triggers?: string[];
  notes?: string;
}

// Treatment response tracking
export interface TreatmentResponse {
  treatmentId: string;
  treatmentName: string;
  startDate: Date;
  endDate?: Date;
  effectivenesRating: number; // 0-10 scale
  sideEffects?: string[];
  notes?: string;
}

// Complete patient model with comprehensive clinical data
export interface PatientModel {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  contactInformation: {
    email?: string;
    phone?: string;
    address?: string;
  };
  demographics: PatientDemographics;
  clinicalHistory: ClinicalHistory;
  medications: Medication[];
  symptoms: Symptom[];
  treatmentResponses: TreatmentResponse[];
  brainModels?: string[]; // Reference to associated brain models by ID
  version: number;
  lastUpdated: Date;
  createdBy: string;
  updatedBy?: string;
}

// Type guard for patient demographics
export function isPatientDemographics(value: unknown): value is PatientDemographics {
  if (!value || typeof value !== 'object') return false;

  const demographics = value as Partial<PatientDemographics>;

  return (
    typeof demographics.age === 'number' &&
    ['male', 'female', 'other'].includes(demographics.biologicalSex as string) &&
    (demographics.heightCm === undefined || typeof demographics.heightCm === 'number') &&
    (demographics.weightKg === undefined || typeof demographics.weightKg === 'number') &&
    (demographics.handedness === undefined ||
      ['left', 'right', 'ambidextrous'].includes(demographics.handedness)) &&
    (demographics.ethnicity === undefined || typeof demographics.ethnicity === 'string')
  );
}

// Type guard for clinical history
export function isClinicalHistory(value: unknown): value is ClinicalHistory {
  if (!value || typeof value !== 'object') return false;

  const history = value as Partial<ClinicalHistory>;

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
}

// Type guard for medication
export function isMedication(value: unknown): value is Medication {
  if (!value || typeof value !== 'object') return false;

  const medication = value as Partial<Medication>;

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
}

// Type guard for symptom
export function isSymptom(value: unknown): value is Symptom {
  if (!value || typeof value !== 'object') return false;

  const symptom = value as Partial<Symptom>;

  return (
    typeof symptom.id === 'string' &&
    typeof symptom.name === 'string' &&
    typeof symptom.severity === 'number' &&
    ['rare', 'occasional', 'frequent', 'constant'].includes(symptom.frequency as string) &&
    symptom.firstObserved instanceof Date &&
    (symptom.triggers === undefined ||
      (Array.isArray(symptom.triggers) && symptom.triggers.every((t) => typeof t === 'string'))) &&
    (symptom.notes === undefined || typeof symptom.notes === 'string')
  );
}

// Type guard for treatment response
export function isTreatmentResponse(value: unknown): value is TreatmentResponse {
  if (!value || typeof value !== 'object') return false;

  const response = value as Partial<TreatmentResponse>;

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
}

// Type guard for patient model
export function isPatientModel(value: unknown): value is PatientModel {
  if (!value || typeof value !== 'object') return false;

  const patient = value as Partial<PatientModel>;

  return (
    typeof patient.id === 'string' &&
    typeof patient.firstName === 'string' &&
    typeof patient.lastName === 'string' &&
    patient.dateOfBirth instanceof Date &&
    patient.contactInformation &&
    typeof patient.contactInformation === 'object' &&
    patient.demographics &&
    isPatientDemographics(patient.demographics) &&
    patient.clinicalHistory &&
    isClinicalHistory(patient.clinicalHistory) &&
    Array.isArray(patient.medications) &&
    patient.medications.every(isMedication) &&
    Array.isArray(patient.symptoms) &&
    patient.symptoms.every(isSymptom) &&
    Array.isArray(patient.treatmentResponses) &&
    patient.treatmentResponses.every(isTreatmentResponse) &&
    (patient.brainModels === undefined ||
      (Array.isArray(patient.brainModels) &&
        patient.brainModels.every((m) => typeof m === 'string'))) &&
    typeof patient.version === 'number' &&
    patient.lastUpdated instanceof Date &&
    typeof patient.createdBy === 'string' &&
    (patient.updatedBy === undefined || typeof patient.updatedBy === 'string')
  );
}

// Factory function to create patient models with safe defaults
export function createPatientModel(partial: Partial<PatientModel> = {}): PatientModel {
  const now = new Date();
  return {
    id: partial.id || crypto.randomUUID(),
    firstName: partial.firstName || '',
    lastName: partial.lastName || '',
    dateOfBirth: partial.dateOfBirth || new Date(),
    contactInformation: partial.contactInformation || {},
    demographics: partial.demographics || {
      age: 0,
      biologicalSex: 'other',
    },
    clinicalHistory: partial.clinicalHistory || {
      primaryDiagnosis: '',
    },
    medications: partial.medications || [],
    symptoms: partial.symptoms || [],
    treatmentResponses: partial.treatmentResponses || [],
    brainModels: partial.brainModels,
    version: partial.version || 1,
    lastUpdated: partial.lastUpdated || now,
    createdBy: partial.createdBy || 'system',
    updatedBy: partial.updatedBy,
  };
}

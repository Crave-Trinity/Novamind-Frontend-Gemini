/**
 * Patient clinical data model for the Digital Twin
 * HIPAA compliant - no PHI exposed
 */

export type Severity = 'none' | 'mild' | 'moderate' | 'severe';
export type TreatmentType = 'medication' | 'therapy' | 'tms' | 'ect' | 'combined';
export type DiagnosisType = 'depression' | 'anxiety' | 'bipolar' | 'schizophrenia' | 'ptsd' | 'ocd' | 'eating_disorder' | 'addiction' | 'other';

/**
 * Clinical assessment score tracking
 */
export interface AssessmentScore {
  id: string;
  type: string; // e.g., 'PHQ9', 'GAD7'
  score: number;
  maxScore: number;
  date: string;
  clinicalSignificance: Severity;
  change: number; // Change from previous assessment
  notes?: string;
}

/**
 * Medication tracking
 */
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  adherence: number; // 0-100%
  sideEffects: string[];
  effectiveness: number; // 0-100%
}

/**
 * Therapy session tracking
 */
export interface TherapySession {
  id: string;
  type: string; // e.g., 'CBT', 'IPT', 'DBT'
  date: string;
  duration: number; // In minutes
  attendance: boolean;
  effectiveness: number; // 0-100%
  focusAreas: string[];
  progress: number; // 0-100%
}

/**
 * Biomarker tracking
 */
export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  date: string;
  referenceRange: {
    min: number;
    max: number;
  };
  isAbnormal: boolean;
  trend: 'increasing' | 'decreasing' | 'stable';
  clinicalSignificance: number; // 0-100%
}

/**
 * Sleep tracking data
 */
export interface SleepData {
  date: string;
  durationHours: number;
  quality: number; // 0-100%
  latencyMinutes: number;
  remPercentage: number;
  deepSleepPercentage: number;
  disturbances: number;
  notes?: string;
}

/**
 * Treatment plan
 */
export interface TreatmentPlan {
  id: string;
  startDate: string;
  endDate?: string;
  primaryDiagnosis: DiagnosisType;
  comorbidities: DiagnosisType[];
  treatments: {
    type: TreatmentType;
    details: string;
    targetSymptoms: string[];
    expectedOutcomes: string[];
    timeframe: string;
  }[];
  goals: {
    description: string;
    progress: number; // 0-100%
    targetDate?: string;
  }[];
  adherence: number; // 0-100%
  effectiveness: number; // 0-100%
}

/**
 * Risk assessment
 */
export interface RiskAssessment {
  id: string;
  date: string;
  riskFactors: {
    category: string;
    severity: Severity;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  overallRisk: Severity;
  recommendedInterventions: string[];
  nextAssessmentDate: string;
  confidenceScore: number; // 0-100%
}

/**
 * Digital Twin Profile - main container for patient data
 */
export interface DigitalTwinProfile {
  id: string;
  patientId: string; // De-identified patient reference
  createdAt: string;
  updatedAt: string;
  primaryDiagnosis: DiagnosisType;
  comorbidities: DiagnosisType[];
  currentSeverity: Severity;
  assessmentScores: AssessmentScore[];
  medications: Medication[];
  therapySessions: TherapySession[];
  biomarkers: Biomarker[];
  sleepData: SleepData[];
  treatmentPlan: TreatmentPlan;
  riskAssessments: RiskAssessment[];
  predictedTrajectory: {
    timepoints: string[];
    severityScores: number[];
    confidenceIntervals: [number, number][];
  };
}

/**
 * Simplified patient interface for listings and profile views
 */
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mrn: string;
  status: string;
  riskLevel: string;
  lastVisit: string;
  diagnoses: string[];
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  assessments?: {
    name: string;
    score: number;
    interpretation: string;
    date: string;
    previousScores: number[];
  }[];
  vitalSigns?: {
    name: string;
    value: number | string;
    unit: string;
    normalRange: string;
  }[];
  riskFactors?: {
    name: string;
    level: string;
    trend: string;
    lastUpdated: string;
  }[];
  treatmentResponses?: {
    treatment: string;
    responseLevel: string;
    confidence: number;
    predictedRemission: string;
  }[];
  digitalTwinProfile?: DigitalTwinProfile; // Added for digital twin dashboard integration
  riskAssessments?: RiskAssessment[]; // Added for risk assessment panel
}

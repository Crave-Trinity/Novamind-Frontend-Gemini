/**
 * NOVAMIND Neural-Safe Clinical Type Definitions
 * Patient data types with quantum-level type safety and HIPAA compliance
 */

// Patient metadata with HIPAA-compliant typing
export interface Patient {
  id: string;
  demographicData: PatientDemographics;
  clinicalData: ClinicalData;
  treatmentData: TreatmentData;
  neuralData: NeuralData;
  dataAccessPermissions: DataPermissions;
  lastUpdated: string;
  version: string;
}

// Demographic data with clinical precision
export interface PatientDemographics {
  age: number;
  biologicalSex: 'male' | 'female' | 'other';
  ethnicity?: string;
  occupationalStatus?: string;
  educationLevel?: string;
  handedness?: 'right' | 'left' | 'ambidextrous';
  primaryLanguage?: string;
  anonymizationLevel: 'full' | 'partial' | 'research' | 'clinical';
}

// Clinical data with psychiatric precision
export interface ClinicalData {
  diagnoses: Diagnosis[];
  symptoms: Symptom[];
  medications: Medication[];
  psychometricAssessments: PsychometricAssessment[];
  medicalHistory: MedicalHistoryItem[];
  familyHistory?: FamilyHistory;
  substanceUse?: SubstanceUseHistory;
  sleepData?: SleepData[];
  nutritionalData?: NutritionalData;
  allergyData?: Allergy[];
}

// Diagnosis with clinical precision
export interface Diagnosis {
  id: string;
  code: string;
  codingSystem: 'ICD-10' | 'ICD-11' | 'DSM-5' | 'DSM-5-TR';
  name: string;
  severity: 'mild' | 'moderate' | 'severe' | 'in remission' | 'unspecified';
  onsetDate?: string;
  diagnosisDate: string;
  diagnosingClinician?: string;
  status: 'active' | 'resolved' | 'in remission' | 'recurrent';
  notes?: string;
  confidenceLevel?: number; // 0-1 representing diagnostic confidence
  associatedBrainRegions?: string[]; // IDs of associated brain regions
}

// Symptom with clinical precision
export interface Symptom {
  id: string;
  name: string;
  category: 'cognitive' | 'affective' | 'behavioral' | 'somatic' | 'perceptual';
  severity: number; // 0-10 scale
  frequency: 'constant' | 'daily' | 'weekly' | 'monthly' | 'episodic' | 'situational';
  onsetDate?: string;
  lastOccurrence?: string;
  duration?: string;
  triggers?: string[];
  alleviatingFactors?: string[];
  impact: 'none' | 'mild' | 'moderate' | 'severe';
  progression: 'improving' | 'stable' | 'worsening' | 'fluctuating';
  associatedDiagnoses?: string[]; // IDs of associated diagnoses
  associatedBrainRegions?: string[]; // IDs of associated brain regions
  notes?: string;
}

// Medication with clinical precision
export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  classification: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'sublingual' | 'topical' | 'intramuscular' | 'intravenous' | 'subcutaneous' | 'inhaled' | 'rectal' | 'other';
  startDate: string;
  endDate?: string;
  prescribingClinician?: string;
  purpose?: string;
  adherence?: number; // 0-100%
  effectivenessRating?: number; // 0-10
  sideEffects?: MedicationSideEffect[];
  interactionAlerts?: string[];
  associatedBrainEffects?: {
    regionId: string;
    effect: 'increase' | 'decrease' | 'modulate';
    confidenceLevel: number; // 0-1
  }[];
}

// Medication side effect
export interface MedicationSideEffect {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  onset: string;
  status: 'active' | 'resolved' | 'improving' | 'worsening';
  actionTaken?: string;
}

// Psychometric assessment with clinical precision
export interface PsychometricAssessment {
  id: string;
  name: string;
  date: string;
  administrator?: string;
  scores: {
    subscaleName: string;
    rawScore: number;
    standardizedScore?: number;
    interpretation: string;
    clinicalSignificance: boolean;
  }[];
  totalScore?: number;
  interpretation: string;
  reliability?: number; // 0-1 reliability coefficient
  validity?: {
    validityIndicators: string[];
    isValid: boolean;
    concerns?: string;
  };
  comparativeTrend?: 'improved' | 'declined' | 'stable' | 'fluctuating';
  notes?: string;
}

// Medical history item
export interface MedicalHistoryItem {
  id: string;
  condition: string;
  type: 'neurological' | 'psychiatric' | 'cardiovascular' | 'endocrine' | 'gastrointestinal' | 'musculoskeletal' | 'respiratory' | 'other';
  onsetDate?: string;
  endDate?: string;
  status: 'active' | 'resolved' | 'chronic' | 'episodic' | 'in remission';
  treatments?: string[];
  impact: 'none' | 'minimal' | 'moderate' | 'significant';
  relevanceToNeuralHealth: 'low' | 'moderate' | 'high';
  notes?: string;
}

// Family history with clinical precision
export interface FamilyHistory {
  psychiatricConditions: {
    condition: string;
    relationship: string;
    onsetAge?: number;
    status?: string;
  }[];
  neurologicalConditions: {
    condition: string;
    relationship: string;
    onsetAge?: number;
    status?: string;
  }[];
  relevanceLevel: 'low' | 'moderate' | 'high';
  geneticTestingPerformed?: boolean;
  geneticRiskFactors?: string[];
}

// Substance use history
export interface SubstanceUseHistory {
  substances: {
    name: string;
    pattern: 'never' | 'past' | 'current' | 'experimental';
    frequency?: 'daily' | 'weekly' | 'monthly' | 'rarely';
    quantity?: string;
    durationOfUse?: string;
    lastUse?: string;
    route?: string;
    impact: 'none' | 'minimal' | 'moderate' | 'severe';
  }[];
  treatmentHistory?: string[];
  abstinencePeriods?: string[];
  relevanceToNeuralHealth: 'low' | 'moderate' | 'high';
}

// Sleep data
export interface SleepData {
  date: string;
  duration: number; // in hours
  quality: number; // 0-10
  latency?: number; // minutes to fall asleep
  wakeAfterSleepOnset?: number; // minutes awake after sleep onset
  deepSleepPercentage?: number;
  remSleepPercentage?: number;
  sleepArchitecture?: {
    stage: 'N1' | 'N2' | 'N3' | 'REM';
    durationMinutes: number;
    percentage: number;
  }[];
  factors: {
    caffeine?: boolean;
    alcohol?: boolean;
    stress?: boolean;
    exercise?: boolean;
    medication?: boolean;
    screen?: boolean;
    other?: string[];
  };
}

// Nutritional data
export interface NutritionalData {
  dietType?: string;
  nutritionalDeficiencies?: string[];
  supplements?: {
    name: string;
    dosage: string;
    frequency: string;
    purpose: string;
  }[];
  relevanceToNeuralHealth: 'low' | 'moderate' | 'high';
  dietaryRestrictions?: string[];
  recentChanges?: string;
}

// Allergy information
export interface Allergy {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reactions: string[];
  diagnosed: boolean;
  onsetDate?: string;
  notes?: string;
}

// Treatment data
export interface TreatmentData {
  currentTreatments: Treatment[];
  historicalTreatments: Treatment[];
  treatmentResponses: TreatmentResponse[];
  treatmentPlan?: TreatmentPlan;
  remissionPeriods?: {
    startDate: string;
    endDate?: string;
    duration: string;
    notes?: string;
  }[];
}

// Treatment details
export interface Treatment {
  id: string;
  type: 'pharmacological' | 'psychotherapy' | 'neuromodulation' | 'lifestyle' | 'complementary' | 'other';
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  provider?: string;
  status: 'active' | 'completed' | 'discontinued' | 'planned';
  discontinuationReason?: string;
  frequency?: string;
  dose?: string;
  targetSymptoms?: string[];
  targetBrainRegions?: string[];
  effectiveness?: number; // 0-10 scale
  adherence?: number; // 0-100%
  sideEffects?: string[];
  notes?: string;
}

// Treatment response with clinical precision
export interface TreatmentResponse {
  treatmentId: string;
  assessmentDate: string;
  clinicalResponse: 'remission' | 'response' | 'partial response' | 'no response' | 'worsening';
  symptomChanges: {
    symptomId: string;
    changePercentage: number; // negative values indicate worsening
    notes?: string;
  }[];
  neurobiologicalChanges?: {
    regionId: string;
    activityChange: number; // percentage change
    connectivityChange?: number; // percentage change
  }[];
  sideEffects: {
    description: string;
    severity: 'mild' | 'moderate' | 'severe';
    managementStrategy?: string;
  }[];
  functionalImprovements?: string[];
  patientReportedOutcome?: number; // 0-10 scale
  clinicianEvaluation?: string;
}

// Treatment plan
export interface TreatmentPlan {
  id: string;
  creationDate: string;
  modificationDate: string;
  author: string;
  shortTermGoals: {
    description: string;
    targetDate?: string;
    status: 'not started' | 'in progress' | 'achieved' | 'modified';
  }[];
  longTermGoals: {
    description: string;
    targetDate?: string;
    status: 'not started' | 'in progress' | 'achieved' | 'modified';
  }[];
  treatmentComponents: {
    componentType: string;
    description: string;
    rationale: string;
    targetSymptoms: string[];
  }[];
  followUpSchedule: string;
  emergencyPlan?: string;
  anticipatedChallenges?: string[];
  supportResources?: string[];
}

// Neural data
export interface NeuralData {
  brainScans: string[]; // IDs of brain scans
  eegData?: string[]; // IDs of EEG recordings
  biomarkers?: {
    name: string;
    value: number;
    referenceRange: string;
    interpretation: string;
    relevance: string;
  }[];
  geneticData?: {
    relevantGenes: string[];
    polymorphisms?: string[];
    pharmacogenomicFactors?: string[];
    confidentiality: 'standard' | 'heightened' | 'restricted';
  };
  connectomics?: {
    globalEfficiency?: number;
    clusteringCoefficient?: number;
    pathLength?: number;
    modularity?: number;
    hubs?: string[]; // IDs of hub regions
  };
}

// Data permissions with HIPAA compliance
export interface DataPermissions {
  accessLevel: 'full' | 'treatment' | 'research' | 'limited';
  authorizedUsers: string[];
  restrictedElements?: string[];
  consentStatus: 'full' | 'partial' | 'research-only' | 'none';
  dataRetentionPolicy: string;
  lastReviewDate: string;
}

// Type guard for patient
export function isPatient(obj: unknown): obj is Patient {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'demographicData' in obj &&
    'clinicalData' in obj
  );
}

// Type guard for diagnosis
export function isDiagnosis(obj: unknown): obj is Diagnosis {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'code' in obj &&
    'name' in obj
  );
}

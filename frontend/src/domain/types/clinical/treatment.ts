/**
 * NOVAMIND Neural-Safe Treatment Prediction Types
 * Treatment response prediction with quantum-level type safety
 */

import { RiskLevel } from './risk';
import { SafeArray, Result } from '../common';

// Treatment prediction types with clinical precision
export type TreatmentType = 
  | 'pharmacological' 
  | 'psychotherapy' 
  | 'neuromodulation' 
  | 'neurofeedback'
  | 'lifestyle_intervention' 
  | 'combination';

// Treatment response prediction request
export interface TreatmentResponseRequest {
  patient_id: string;
  treatment_type: TreatmentType;
  treatment_details: TreatmentDetails;
  clinical_data: ClinicalPredictionData;
  genetic_data?: GeneticPredictionData;
  biomarker_data?: BiomarkerData;
  neuroimaging_features?: NeuroimagingFeatures;
}

// Treatment details with clinical precision
export interface TreatmentDetails {
  // Pharmacological treatment
  medication?: {
    name: string;
    class: string;
    dosage: string;
    frequency: string;
    duration: string;
    previousExposure: boolean;
  };
  
  // Psychotherapy treatment
  psychotherapy?: {
    type: 'cbt' | 'dbt' | 'psychodynamic' | 'interpersonal' | 'emdr' | 'act' | 'other';
    frequency: string;
    duration: string;
    modality: 'individual' | 'group' | 'family' | 'couples';
    specificProtocol?: string;
    previousExposure: boolean;
  };
  
  // Neuromodulation treatment
  neuromodulation?: {
    type: 'tms' | 'ect' | 'tdcs' | 'dbs' | 'vns' | 'other';
    targetRegions: string[];
    parameters: {
      frequency?: number;
      intensity?: number;
      duration?: number;
      sessions?: number;
    };
    previousExposure: boolean;
  };
  
  // Neurofeedback treatment
  neurofeedback?: {
    protocol: string;
    targetBands: string[];
    targetRegions: string[];
    sessions: number;
    sessionDuration: number;
    previousExposure: boolean;
  };
  
  // Lifestyle intervention
  lifestyle?: {
    type: 'exercise' | 'nutrition' | 'sleep' | 'stress_management' | 'social' | 'combined';
    specificProtocol: string;
    intensity: 'low' | 'moderate' | 'high';
    frequency: string;
    duration: string;
    previousExposure: boolean;
  };
  
  // Combination treatment
  combination?: {
    components: string[];
    primaryFocus: string;
    integrationProtocol?: string;
    sequencing?: 'concurrent' | 'sequential';
  };
}

// Clinical prediction data
export interface ClinicalPredictionData {
  diagnosis: string[];
  symptomSeverity: Record<string, number>; // symptom name -> severity (0-10)
  illnessDuration: number; // in months
  previousTreatmentResponses: {
    treatmentType: string;
    response: 'remission' | 'response' | 'partial' | 'nonresponse' | 'worsening';
  }[];
  comorbidities: string[];
  currentMedications: string[];
  functionalImpairment: 'none' | 'mild' | 'moderate' | 'severe';
  suicidalIdeation: boolean;
  substanceUse: boolean;
}

// Genetic prediction data
export interface GeneticPredictionData {
  metabolizerStatus?: {
    cyp2d6?: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';
    cyp2c19?: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';
    cyp3a4?: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';
    cyp1a2?: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';
  };
  pharmacodynamicMarkers?: Record<string, string>;
  riskVariants?: string[];
  protectiveVariants?: string[];
  genotypePredictedPhenotypes?: Record<string, string>;
}

// Biomarker data
export interface BiomarkerData {
  inflammatoryMarkers?: Record<string, number>;
  metabolicMarkers?: Record<string, number>;
  endocrineMarkers?: Record<string, number>;
  neurotransmitterMetabolites?: Record<string, number>;
  oxidativeStressMarkers?: Record<string, number>;
  microbiomeProfile?: Record<string, number>;
}

// Neuroimaging features
export interface NeuroimagingFeatures {
  regionalVolumes?: Record<string, number>;
  functionalConnectivity?: {
    networkName: string;
    connectivityStrength: number;
  }[];
  structuralIntegrity?: Record<string, number>;
  defaultModeNetworkActivity?: number;
  executiveNetworkActivity?: number;
  salienceNetworkActivity?: number;
  rewardCircuitryActivity?: number;
}

// Treatment response prediction with clinical precision
export interface TreatmentResponsePrediction {
  requestId: string;
  patientId: string;
  treatmentType: TreatmentType;
  timestamp: string;
  algorithm: {
    name: string;
    version: string;
    confidence: number; // 0-1 representing algorithm confidence
  };
  prediction: {
    responseType: 'remission' | 'response' | 'partial_response' | 'non_response' | 'worsening';
    responseProbability: number; // 0-1 probability of predicted response
    confidenceInterval: [number, number]; // [lower, upper] bounds of 95% CI
    timeToEffect: {
      expected: number; // days
      range: [number, number]; // [min, max] days
    };
    durability: {
      expected: number; // months
      probability: number; // 0-1 probability
    };
  };
  symptomSpecificPredictions: {
    symptom: string;
    improvementProbability: number; // 0-1 probability
    expectedImprovement: number; // percentage
  }[];
  sideEffectRisks: {
    effect: string;
    probability: number; // 0-1 probability
    severity: 'mild' | 'moderate' | 'severe';
    timeline: 'acute' | 'subacute' | 'chronic';
    mitigationPossible: boolean;
  }[];
  neurobiologicalMechanisms: {
    pathwayName: string;
    impactDescription: string;
    confidenceLevel: 'established' | 'probable' | 'theoretical';
    relevantRegions: string[];
  }[];
  comparativeEffectiveness?: {
    comparedTo: string;
    relativeEfficacy: 'superior' | 'non-inferior' | 'inferior' | 'unknown';
    numberNeededToTreat?: number;
  }[];
  personalizationFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    strength: 'strong' | 'moderate' | 'weak';
    evidenceQuality: 'high' | 'moderate' | 'low';
  }[];
  limitations: string[];
  alternatives: {
    treatmentType: TreatmentType;
    treatmentName: string;
    predictedResponseProbability: number;
    rationale: string;
  }[];
  dataQualityAssessment: {
    overallQuality: 'high' | 'moderate' | 'low';
    missingDataImpact: 'minimal' | 'moderate' | 'significant';
    biasRiskLevel: 'low' | 'moderate' | 'high';
  };
}

// Temporal treatment response prediction
export interface TemporalResponsePrediction {
  timePoints: string[]; // dates/times
  responseProbabilities: number[]; // 0-1 probability at each time point
  confidenceIntervals: Array<[number, number]>; // [lower, upper] bounds at each time point
  symptomTrajectories: {
    symptom: string;
    severityValues: number[]; // predicted severity at each time point
    confidenceIntervals: Array<[number, number]>; // [lower, upper] bounds at each time point
  }[];
  neurobiologicalTrajectories: {
    feature: string;
    values: number[]; // predicted values at each time point
    confidenceIntervals: Array<[number, number]>; // [lower, upper] bounds at each time point
  }[];
  keyTimepoints: {
    timepoint: number; // index into timePoints array
    event: string;
    significance: string;
  }[];
}

// Treatment comparison result
export interface TreatmentComparisonResult {
  patientId: string;
  timestamp: string;
  comparedTreatments: {
    treatmentType: TreatmentType;
    treatmentName: string;
    details: TreatmentDetails;
  }[];
  efficacyComparison: {
    treatmentIndex: number;
    responseProbability: number;
    rank: number;
    statisticalSignificance?: boolean;
    confidenceInterval: [number, number];
  }[];
  timeToEffectComparison: {
    treatmentIndex: number;
    timeToEffect: number; // days
    rank: number;
  }[];
  durabilityComparison: {
    treatmentIndex: number;
    durability: number; // months
    rank: number;
  }[];
  tolerabilityComparison: {
    treatmentIndex: number;
    sideEffectRisk: number; // 0-1 risk score
    seriousSideEffectRisk: number; // 0-1 risk score
    rank: number;
  }[];
  costComparison?: {
    treatmentIndex: number;
    relativeCost: 'low' | 'moderate' | 'high' | 'very_high';
    costEffectivenessRatio?: number;
    rank: number;
  }[];
  patientPreferenceAlignment?: {
    treatmentIndex: number;
    alignmentScore: number; // 0-1 alignment score
    keyConcerns: string[];
    rank: number;
  }[];
  implementationConsiderations: {
    treatmentIndex: number;
    accessibilityLevel: 'easy' | 'moderate' | 'difficult';
    complexityLevel: 'low' | 'moderate' | 'high';
    monitoringRequirements: 'minimal' | 'moderate' | 'intensive';
  }[];
  recommendationSummary: {
    primaryRecommendation: number; // index of recommended treatment
    rationale: string;
    confidenceLevel: 'high' | 'moderate' | 'low';
    alternativeOptions: number[]; // indices of alternative treatments
  };
}

// Treatment prediction visualization settings
export interface TreatmentPredictionVisualizationSettings {
  colorScale: {
    response: string;
    partialResponse: string;
    nonResponse: string;
    worsening: string;
  };
  confidenceIntervalDisplay: 'always' | 'on_hover' | 'on_click' | 'never';
  timeScale: 'days' | 'weeks' | 'months';
  symptomDisplayLimit: number;
  sideEffectDisplayLimit: number;
  mechanismDisplayLimit: number;
  comparativeDisplay: 'table' | 'chart' | 'grid';
  personalizedFactorVisualization: boolean;
  alternativesDisplay: boolean;
  neurologicalImpactVisualization: 'simplified' | 'detailed' | 'none';
}

// Default treatment visualization color scale
export const defaultTreatmentColorScale = {
  response: '#2ECC71', // Green
  partialResponse: '#F1C40F', // Yellow
  nonResponse: '#E67E22', // Orange
  worsening: '#E74C3C' // Red
};

// Treatment prediction state with discriminated union for type safety
export type TreatmentPredictionState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; prediction: TreatmentResponsePrediction };

// Treatment comparison state with discriminated union for type safety
export type TreatmentComparisonState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; comparison: TreatmentComparisonResult };

// Safe treatment prediction operations
export const TreatmentPredictionOps = {
  // Get response probability with null safety
  getResponseProbability: (prediction: TreatmentResponsePrediction | null | undefined): number => {
    return prediction?.prediction?.responseProbability || 0;
  },
  
  // Get side effect risk with null safety
  getSideEffectRisk: (prediction: TreatmentResponsePrediction | null | undefined, effect: string): number => {
    if (!prediction) return 0;
    const sideEffect = new SafeArray(prediction.sideEffectRisks).find(se => se.effect === effect);
    return sideEffect?.probability || 0;
  },
  
  // Get symptom improvement prediction with null safety
  getSymptomImprovement: (prediction: TreatmentResponsePrediction | null | undefined, symptom: string): number => {
    if (!prediction) return 0;
    const symptomPrediction = new SafeArray(prediction.symptomSpecificPredictions)
      .find(sp => sp.symptom === symptom);
    return symptomPrediction?.expectedImprovement || 0;
  },
  
  // Convert response probability to descriptive category
  getResponseCategory: (probability: number): 'remission' | 'response' | 'partial_response' | 'non_response' => {
    if (probability >= 0.8) return 'remission';
    if (probability >= 0.6) return 'response';
    if (probability >= 0.3) return 'partial_response';
    return 'non_response';
  },
  
  // Get color for treatment response visualization
  getResponseColor: (
    probability: number,
    colorScale = defaultTreatmentColorScale
  ): string => {
    if (probability >= 0.6) return colorScale.response;
    if (probability >= 0.3) return colorScale.partialResponse;
    if (probability >= 0.1) return colorScale.nonResponse;
    return colorScale.worsening;
  }
};

// Type guard for treatment response prediction
export function isTreatmentResponsePrediction(obj: unknown): obj is TreatmentResponsePrediction {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'patientId' in obj &&
    'treatmentType' in obj &&
    'prediction' in obj
  );
}

// Type guard for treatment comparison result
export function isTreatmentComparisonResult(obj: unknown): obj is TreatmentComparisonResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'patientId' in obj &&
    'comparedTreatments' in obj &&
    'efficacyComparison' in obj
  );
}

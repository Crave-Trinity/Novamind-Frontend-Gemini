/**
 * NOVAMIND Application Services
 * 
 * Centralized exports for all application services
 * with domain-specific organization
 */

// Brain domain services
export { brainModelService } from './brain/brain-model.service';

// Clinical domain services
export { clinicalService } from './clinical/clinical.service';
export { RiskAssessmentService } from './clinical/risk-assessment.service';

// Re-export types if needed by consumers
// This allows clean imports like: import { brainModelService, BrainModel } from '@application/services';
export type { BrainModel, BrainRegion, NeuralConnection } from '@domain/types/brain/models';
export type { 
  SymptomNeuralMapping, 
  DiagnosisNeuralMapping, 
  TreatmentNeuralMapping 
} from '@domain/models/brainMapping';
export type { 
  RiskAssessment, 
  RiskFactor, 
  RiskScore 
} from '@domain/types/clinical/risk';
export type { 
  TreatmentResponsePrediction, 
  TreatmentEfficacy 
} from '@domain/types/clinical/treatment';
export type { 
  Symptom, 
  Diagnosis, 
  Treatment 
} from '@domain/types/clinical/patient';
export type { RiskLevel } from '@domain/types/RiskLevel';

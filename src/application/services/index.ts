/* eslint-disable */
/**
 * Application services exports
 *
 * This module exports services that implement domain interfaces.
 */

// We'll export specific services from each subdirectory as they're needed
// For now, we're just ensuring the export path exists
// Removed potentially problematic re-exports; specific exports are used below.
// export * from './clinical'; // Likely empty index.ts
// export * from './brain'; // Likely empty index.ts
export * from './temporal'; // Assuming this one is okay or will be fixed later
// export * from './shared'; // Likely empty index.ts

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
  TreatmentNeuralMapping,
} from '@domain/models/brain/mapping/brain-mapping'; // Corrected path
export type { RiskAssessment } from '@domain/types/clinical/risk'; // Removed non-existent RiskFactor, RiskScore
export type {
  TreatmentResponsePrediction,
  TreatmentEfficacy,
} from '@domain/types/clinical/treatment';
export type { Symptom, Diagnosis, Treatment } from '@domain/types/clinical/patient';
export type { RiskLevel } from '@domain/types/clinical/risk'; // Corrected path

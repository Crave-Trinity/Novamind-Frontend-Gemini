/**
 * NOVAMIND Neural-Safe Type Definitions
 * Domain model exports with quantum-level type safety
 */

// Export brain models
export * from './brain/brain-model';

// Export brain mapping types and functions
export type {
  NeuralActivationPattern,
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
  TreatmentNeuralMapping,
  NeuralImpactRating,
} from './brain/mapping/brain-mapping';

// Export brain mapping functions
export {
  calculateNeuralActivation,
  mapSymptomsToRegions,
  mapDiagnosesToRegions,
  calculateTreatmentImpact,
} from './brain/mapping/brain-mapping';

// Export clinical models
export * from './clinical/patient-model';

// Export shared utilities
export * from './shared/type-verification';
export * from './shared/type-verification.runtime';

// Note: Legacy models are available in their respective subdirectories
// but are not exported from this main index to encourage usage of
// the new, type-safe implementations

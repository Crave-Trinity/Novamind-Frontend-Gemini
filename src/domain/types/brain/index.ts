/* eslint-disable */
/**
 * NOVAMIND Neural Type System
 * Comprehensive brain model type exports with quantum-level type safety
 */

// Export all brain model types
export * from './models';
export * from './visualization';

// Re-export common types that are directly related to brain visualization
export {
  Vector3,
  SafeArray,
  Result,
  success,
  failure,
  NeuralError,
  VisualizationState,
} from '@domain/types/shared/common'; // Corrected import path

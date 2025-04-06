/**
 * Application hooks exports
 *
 * This module exports all custom hooks from the application layer.
 * Each hook should be imported specifically to minimize bundle size.
 */

// Auth hooks
export { useAuth } from './useAuth';

// Brain model hooks
export { useBrainModel } from './useBrainModel';
export { useBrainVisualization } from './useBrainVisualization';

// Clinical hooks
export { useClinicalContext } from './useClinicalContext';
export { usePatientData } from './usePatientData';
export { useTreatmentPrediction } from './useTreatmentPrediction';

// UI related hooks
export { useBlockingTransition } from './useBlockingTransition';
export { useSearchParams } from './useSearchParams';
export { useTheme } from './useTheme';
export { useVisualSettings } from './useVisualSettings';

/**
 * NOVAMIND Neural-Safe Utilities
 * Domain utilities exports with quantum-level type safety
 */

// Export shared utilities
export * from "./shared/type-verification";

// Export brain-specific utilities
export {
  brainTypeVerifier,
  BrainTypeVerifier,
} from "./brain/type-verification";

// Export clinical-specific utilities
export {
  clinicalTypeVerifier,
  ClinicalTypeVerifier,
} from "./clinical/type-verification";

// Re-export type verifier singletons with descriptive names for easy access
import { typeVerifier } from "./shared/type-verification";
import { brainTypeVerifier } from "./brain/type-verification";
import { clinicalTypeVerifier } from "./clinical/type-verification";

// Export verifiers as a unified object for easy consumption
export const verifiers = {
  common: typeVerifier,
  brain: brainTypeVerifier,
  clinical: clinicalTypeVerifier,
};

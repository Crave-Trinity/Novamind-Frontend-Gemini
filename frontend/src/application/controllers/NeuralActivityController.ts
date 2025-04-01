/**
 * NOVAMIND Neural-Safe Controller Layer
 * NeuralActivityController - Quantum-level neural activity management
 * with neuropsychiatric precision and type-safe state transitions
 */

import { useCallback, useEffect, useMemo } from "react";

// Domain types
import {
  ActivationLevel, // Corrected name
  NeuralActivityState,
  NeuralStateTransition, // Import interface containing transitionType
  // NeuralFrequencyBand, // Not defined in activity.ts
} from "@domain/types/brain/activity";
import { BrainRegion, NeuralConnection } from "@domain/types/brain/models";
// import { SymptomNeuralMapping } from "@domain/types/clinical/mapping"; // Invalid path, type definition missing
import { Result, success, failure } from "@domain/types/shared/common"; // Corrected path

// Services
import { brainModelService } from "@application/services/brain/brain-model.service"; // Corrected path
import { clinicalService } from "@application/services/clinical/clinical.service"; // Corrected path

// Placeholders for missing/corrected types
type NeuralTransitionType = NeuralStateTransition['transitionType']; // Extract from interface
type NeuralFrequencyBand = any;
type SymptomNeuralMapping = any; // Placeholder

/**
 * Neural activation transform with mathematical precision
 */
type NeuralTransform = {
  regionId: string;
  activationChange: number; // Range from -1.0 to 1.0
  transitionType: NeuralTransitionType;
  frequencyBand?: NeuralFrequencyBand;
  sourceTrigger: "symptom" | "medication" | "stimulation" | "baseline";
};

/**
 * Neural metrics for visualization calculations
 */
interface NeuralMetrics {
  activationLevels: Map<string, ActivationLevel>; // Corrected type
  connectionStrengths: Map<string, number>;
  frequencyDominance: Map<NeuralFrequencyBand, number>;
  entropyLevel: number; // 0.0 to 1.0, measure of neural chaos/order
  synchronizationIndex: number; // 0.0 to 1.0, measure of inter-region synchrony
}

/**
 * Global neural state with clinical precision
 */
interface NeuralState {
  metrics: NeuralMetrics;
  activeRegions: Set<string>;
  inhibitedRegions: Set<string>;
  baselineLoaded: boolean;
  transitionHistory: NeuralTransform[];
  computationalIntensity: "low" | "medium" | "high" | "clinical";
}

/**
 * Initial neural state with safe defaults
 */
const createInitialNeuralState = (): NeuralState => ({
  metrics: {
    activationLevels: new Map<string, ActivationLevel>(), // Corrected type
    connectionStrengths: new Map<string, number>(),
    frequencyDominance: new Map<NeuralFrequencyBand, number>([
      ["delta", 0.2], // Assuming string keys are okay for 'any' type
      ["theta", 0.15],
      ["alpha", 0.3],
      ["beta", 0.25],
      ["gamma", 0.1],
    ]),
    entropyLevel: 0.5,
    synchronizationIndex: 0.4,
  },
  activeRegions: new Set<string>(),
  inhibitedRegions: new Set<string>(),
  baselineLoaded: false,
  transitionHistory: [],
  computationalIntensity: "medium",
});

/**
 * NeuralActivityController hook for managing neural activity state
 * with clinical-grade precision and type safety
 */
export function useNeuralActivityController(patientId: string) {
  // Internal neural state
  const neuralState = useMemo(() => createInitialNeuralState(), []);

  // Load baseline activity for current patient
  const loadBaselineActivity = useCallback(async (): Promise<Result<void>> => {
    if (neuralState.baselineLoaded) return success(undefined);

    try {
      // TODO: Implement actual service call when available (getBaselineActivity doesn't exist on brainModelService)
      console.warn("getBaselineActivity service method not implemented on brainModelService.");
      const result: Result<any> = failure(new Error("Service method getBaselineActivity not implemented.")); // Placeholder failure

      if (result.success) { // Check success first
        // Assuming result.value has regionActivations and connectionStrengths arrays
        if (result.value && Array.isArray(result.value.regionActivations)) {
            result.value.regionActivations.forEach((activation: any) => { // Use 'any' for activation
            // Ensure activation.level is a valid ActivationLevel before setting
            const level = Object.values(ActivationLevel).includes(activation.level) ? activation.level : ActivationLevel.MEDIUM; // Default to MEDIUM if invalid
            neuralState.metrics.activationLevels.set(
              activation.regionId,
              level, // Use validated level
            );

            // Set initially active regions
            if (
              level === ActivationLevel.HIGH || // Use Enum
              level === ActivationLevel.EXTREME // Use Enum
            ) {
              neuralState.activeRegions.add(activation.regionId);
            } else if (level === ActivationLevel.LOW || level === ActivationLevel.NONE) { // Assuming LOW/NONE map to suppressed? Adjust if needed
              neuralState.inhibitedRegions.add(activation.regionId);
            }
          });
        }

        // Initialize connection strengths
         if (result.value && Array.isArray(result.value.connectionStrengths)) {
            result.value.connectionStrengths.forEach((connection: any) => { // Use 'any' for connection
                neuralState.metrics.connectionStrengths.set(
                `${connection.sourceId}-${connection.targetId}`,
                connection.strength,
                );
            });
         }

        // Set baseline loaded flag
        neuralState.baselineLoaded = true;

        return success(undefined);
      }

      // If result was failure initially, or became one.
      return failure(result.error || new Error("Failed to load baseline activity"));

    } catch (error) {
      return failure( // Ensure error object is passed
        error instanceof Error
          ? error
          : new Error("Unknown error loading baseline"),
      );
    }
  }, [patientId, neuralState]);

  // Apply neural transforms with mathematical precision
  const applyNeuralTransforms = useCallback(
    (transforms: NeuralTransform[]): Result<void> => {
      try {
        const sortedTransforms = [...transforms].sort((a, b) =>
          a.regionId.localeCompare(b.regionId),
        );

        sortedTransforms.forEach((transform) => {
          const currentLevel =
            neuralState.metrics.activationLevels.get(transform.regionId) ||
            ActivationLevel.MEDIUM; // Default to MEDIUM

          const newLevel = calculateNewActivationLevel(
            currentLevel,
            transform.activationChange,
          );

          neuralState.metrics.activationLevels.set(
            transform.regionId,
            newLevel,
          );

          if (newLevel === ActivationLevel.HIGH || newLevel === ActivationLevel.EXTREME) {
            neuralState.activeRegions.add(transform.regionId);
            neuralState.inhibitedRegions.delete(transform.regionId);
          } else if (newLevel === ActivationLevel.LOW || newLevel === ActivationLevel.NONE) { // Assuming LOW/NONE map to suppressed?
            neuralState.inhibitedRegions.add(transform.regionId);
            neuralState.activeRegions.delete(transform.regionId);
          } else {
            neuralState.activeRegions.delete(transform.regionId);
            neuralState.inhibitedRegions.delete(transform.regionId);
          }

          neuralState.transitionHistory.push(transform);
          if (neuralState.transitionHistory.length > 100) {
            neuralState.transitionHistory.shift();
          }
        });

        updateGlobalMetrics(); // Defined below

        return success(undefined);
      } catch (error) {
        return failure(
          error instanceof Error
            ? error
            : new Error("Unknown error applying transforms"),
        );
      }
    },
    [neuralState], // Removed updateGlobalMetrics from deps
  );

  // Update global metrics based on current neural state
  const updateGlobalMetrics = useCallback(() => {
    const activationCounts: Record<ActivationLevel, number> = { // Corrected type
      [ActivationLevel.NONE]: 0,
      [ActivationLevel.LOW]: 0,
      [ActivationLevel.MEDIUM]: 0,
      [ActivationLevel.HIGH]: 0,
      [ActivationLevel.EXTREME]: 0,
    };

    neuralState.metrics.activationLevels.forEach((level) => {
      if (level in activationCounts) {
         activationCounts[level]++;
      }
    });

    const total = Object.values(activationCounts).reduce((sum, count) => sum + count, 0);
    const numLevels = Object.keys(activationCounts).length;

    if (total > 0 && numLevels > 1) {
      let entropy = 0;
      Object.values(activationCounts).forEach((count) => {
        if (count > 0) {
          const p = count / total;
          entropy -= p * Math.log2(p);
        }
      });
      const maxEntropy = Math.log2(numLevels);
      neuralState.metrics.entropyLevel = entropy / maxEntropy;
    } else {
        neuralState.metrics.entropyLevel = 0;
    }

    const activeRegions = neuralState.activeRegions.size;
    const totalRegions = neuralState.metrics.activationLevels.size;

    if (totalRegions > 0) {
      const activeRatio = activeRegions / totalRegions;
      neuralState.metrics.synchronizationIndex = 1 - 2 * Math.abs(activeRatio - 0.5);
    } else {
        neuralState.metrics.synchronizationIndex = 1;
    }

    // Simplified frequency dominance update
    if (neuralState.metrics.entropyLevel < 0.3) {
      neuralState.metrics.frequencyDominance = new Map([["delta", 0.3], ["theta", 0.15], ["alpha", 0.4], ["beta", 0.1], ["gamma", 0.05]]);
    } else if (neuralState.metrics.entropyLevel > 0.7) {
      neuralState.metrics.frequencyDominance = new Map([["delta", 0.1], ["theta", 0.1], ["alpha", 0.2], ["beta", 0.3], ["gamma", 0.3]]);
    } else {
      neuralState.metrics.frequencyDominance = new Map([["delta", 0.2], ["theta", 0.2], ["alpha", 0.2], ["beta", 0.2], ["gamma", 0.2]]);
    }
  }, [neuralState]);

  // Calculate a new activation level based on current level and change
  const calculateNewActivationLevel = (
    currentLevel: ActivationLevel, // Corrected type
    activationChange: number,
  ): ActivationLevel => { // Corrected type
    const levelValues: Record<ActivationLevel, number> = { // Corrected type
      [ActivationLevel.NONE]: -1, // Adjusted mapping based on enum
      [ActivationLevel.LOW]: -0.5,
      [ActivationLevel.MEDIUM]: 0,
      [ActivationLevel.HIGH]: 0.5,
      [ActivationLevel.EXTREME]: 1,
    };

    const currentValue = levelValues[currentLevel];
    const newValue = Math.max(-1, Math.min(1, currentValue + activationChange));

    // Map back to activation level enum
    if (newValue <= -0.75) return ActivationLevel.NONE;
    if (newValue < 0) return ActivationLevel.LOW;
    if (newValue < 0.25) return ActivationLevel.MEDIUM;
    if (newValue < 0.75) return ActivationLevel.HIGH;
    return ActivationLevel.EXTREME;
  };

  // Generate symptom-driven neural transforms
  const generateSymptomTransforms = useCallback(
    async (symptomIds: string[]): Promise<Result<NeuralTransform[]>> => {
      try {
        const mappingsResult = await clinicalService.fetchSymptomMappings(); // Corrected method name

        if (!mappingsResult.success) { // Check failure first
          return failure(
            mappingsResult.error || new Error("Failed to load symptom mappings"),
          );
        }

        // Use 'any' for mapping due to missing type definition
        const relevantMappings = mappingsResult.value.filter((mapping: any) =>
          symptomIds.includes(mapping.symptomId),
        );

        const transforms: NeuralTransform[] = [];

        relevantMappings.forEach((mapping: any) => {
          if (Array.isArray(mapping.activationPatterns)) {
              mapping.activationPatterns.forEach((pattern: any) => {
                // Use optional chaining and nullish coalescing for safety
                if (pattern && typeof pattern.regionId === 'string' && typeof pattern.activityLevel === 'number') {
                    transforms.push({
                        regionId: pattern.regionId,
                        activationChange: pattern.activityLevel, // Assuming activityLevel maps to activationChange
                        transitionType: pattern.transitionType ?? "gradual",
                        frequencyBand: pattern.frequencyBand, // Still 'any'
                        sourceTrigger: "symptom",
                    });
                } else {
                    console.warn("Skipping invalid activation pattern:", pattern);
                }
              });
          }
        });

        return success(transforms);
      } catch (error) {
        return failure(
          error instanceof Error
            ? error
            : new Error("Unknown error generating transforms"),
        );
      }
    },
    [patientId], // patientId might still be needed if fetchSymptomMappings uses it internally
  );

  // Generate medication-driven neural transforms
  const generateMedicationTransforms = useCallback(
    async (medicationIds: string[]): Promise<Result<NeuralTransform[]>> => {
      try {
        // TODO: Implement actual service call when available (getMedicationEffects doesn't exist on clinicalService)
        console.warn("getMedicationEffects service method not implemented.");
        const medicationEffectsResult: Result<any> = failure(new Error("Service method getMedicationEffects not implemented.")); // Placeholder

        if (!medicationEffectsResult.success) { // Check failure first
          return failure(
            medicationEffectsResult.error || new Error("Failed to load medication effects"),
          );
        }

        const transforms: NeuralTransform[] = [];

         if (Array.isArray(medicationEffectsResult.value)) {
            medicationEffectsResult.value.forEach((medication: any) => {
                if (Array.isArray(medication.regionalEffects)) {
                    medication.regionalEffects.forEach((effect: any) => {
                        if (effect && typeof effect.regionId === 'string' && typeof effect.activationChange === 'number') {
                            transforms.push({
                                regionId: effect.regionId,
                                activationChange: effect.activationChange,
                                transitionType: effect.transitionType ?? "gradual",
                                frequencyBand: effect.frequencyBand, // Still 'any'
                                sourceTrigger: "medication",
                            });
                        } else {
                             console.warn("Skipping invalid medication effect:", effect);
                        }
                    });
                }
            });
         }

        return success(transforms);
      } catch (error) {
        return failure(
          error instanceof Error
            ? error
            : new Error("Unknown error generating transforms"),
        );
      }
    },
    [],
  );

  // Apply symptom-based activity changes
  const applySymptomActivity = useCallback(
    async (symptomIds: string[]): Promise<Result<void>> => {
      try {
        const baselineResult = await loadBaselineActivity();
        if (!baselineResult.success) {
             console.error("Baseline load failed:", baselineResult.error);
             return failure(baselineResult.error);
        }

        const transformsResult = await generateSymptomTransforms(symptomIds);
        if (!transformsResult.success) { // Check failure first
          return failure(
            transformsResult.error || new Error("Failed to generate symptom transforms"),
          );
        }

        return applyNeuralTransforms(transformsResult.value); // Access .value only on success
      } catch (error) {
        return failure(
          error instanceof Error
            ? error
            : new Error("Unknown error applying symptom activity"),
        );
      }
    },
    [loadBaselineActivity, generateSymptomTransforms, applyNeuralTransforms],
  );

  // Apply medication-based activity changes
  const applyMedicationActivity = useCallback(
    async (medicationIds: string[]): Promise<Result<void>> => {
      try {
        const baselineResult = await loadBaselineActivity();
        if (!baselineResult.success) {
             console.error("Baseline load failed:", baselineResult.error);
             return failure(baselineResult.error);
        }

        const transformsResult = await generateMedicationTransforms(medicationIds);
        if (!transformsResult.success) { // Check failure first
          return failure(
            transformsResult.error || new Error("Failed to generate medication transforms"),
          );
        }

        return applyNeuralTransforms(transformsResult.value); // Access .value only on success
      } catch (error) {
        return failure(
          error instanceof Error
            ? error
            : new Error("Unknown error applying medication activity"),
        );
      }
    },
    [loadBaselineActivity, generateMedicationTransforms, applyNeuralTransforms],
  );

  // Reset to baseline state
  const resetToBaseline = useCallback(async (): Promise<Result<void>> => {
    try {
      neuralState.metrics.activationLevels.clear();
      neuralState.metrics.connectionStrengths.clear();
      neuralState.activeRegions.clear();
      neuralState.inhibitedRegions.clear();
      neuralState.baselineLoaded = false;

      const result = await loadBaselineActivity();
      updateGlobalMetrics();

       if (!result.success) {
           console.error("Reset to baseline failed during reload:", result.error);
           return failure(result.error);
       }

      return success(undefined);
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error("Unknown error resetting to baseline"),
      );
    }
  }, [loadBaselineActivity, updateGlobalMetrics, neuralState]);

  // Set computational intensity
  const setComputationalIntensity = useCallback(
    (intensity: NeuralState["computationalIntensity"]): void => {
      neuralState.computationalIntensity = intensity;
    },
    [neuralState],
  );

  // Get current neural state
  const getCurrentState = useCallback((): NeuralState => {
    return {
      metrics: {
          activationLevels: new Map(neuralState.metrics.activationLevels),
          connectionStrengths: new Map(neuralState.metrics.connectionStrengths),
          frequencyDominance: new Map(neuralState.metrics.frequencyDominance),
          entropyLevel: neuralState.metrics.entropyLevel,
          synchronizationIndex: neuralState.metrics.synchronizationIndex,
       },
      activeRegions: new Set(neuralState.activeRegions),
      inhibitedRegions: new Set(neuralState.inhibitedRegions),
      baselineLoaded: neuralState.baselineLoaded,
      transitionHistory: [...neuralState.transitionHistory],
      computationalIntensity: neuralState.computationalIntensity,
    };
  }, [neuralState]);

  // Initialize on first use
  useEffect(() => {
    loadBaselineActivity().catch((errorResult) => {
        // Check if it's a failure Result before logging error
        if (!errorResult.success) {
             console.error("Failed to load baseline activity:", errorResult.error);
        }
    });
  }, [loadBaselineActivity]);

  // Return the controller interface
  return {
    getCurrentState,
    applySymptomActivity,
    applyMedicationActivity,
    resetToBaseline,
    setComputationalIntensity,
  };
}

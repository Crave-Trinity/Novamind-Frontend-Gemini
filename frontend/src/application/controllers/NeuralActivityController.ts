/**
 * NOVAMIND Neural-Safe Controller Layer
 * NeuralActivityController - Quantum-level neural activity management
 * with neuropsychiatric precision and type-safe state transitions
 */

import { useCallback, useEffect, useMemo } from "react";

// Domain types
import {
  NeuralActivationLevel,
  NeuralActivityState,
  NeuralTransitionType,
  NeuralFrequencyBand,
} from "@domain/types/brain/activity";
import { BrainRegion, NeuralConnection } from "@domain/types/brain/models";
import { SymptomNeuralMapping } from "@domain/types/clinical/mapping";
import { Result, success, failure } from "@domain/types/common/result";

// Services
import { brainModelService } from "@application/services/brainModelService";
import { clinicalService } from "@application/services/clinicalService";

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
  activationLevels: Map<string, NeuralActivationLevel>;
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
    activationLevels: new Map<string, NeuralActivationLevel>(),
    connectionStrengths: new Map<string, number>(),
    frequencyDominance: new Map<NeuralFrequencyBand, number>([
      ["delta", 0.2],
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
  const loadBaselineActivity = useCallback(async () => {
    if (neuralState.baselineLoaded) return success(undefined);

    try {
      const result = await brainModelService.getBaselineActivity(patientId);

      if (result.success && result.data) {
        // Initialize activation levels from baseline
        result.data.regionActivations.forEach((activation) => {
          neuralState.metrics.activationLevels.set(
            activation.regionId,
            activation.level,
          );

          // Set initially active regions
          if (
            activation.level === "elevated" ||
            activation.level === "hyperactive"
          ) {
            neuralState.activeRegions.add(activation.regionId);
          } else if (activation.level === "suppressed") {
            neuralState.inhibitedRegions.add(activation.regionId);
          }
        });

        // Initialize connection strengths
        result.data.connectionStrengths.forEach((connection) => {
          neuralState.metrics.connectionStrengths.set(
            `${connection.sourceId}-${connection.targetId}`,
            connection.strength,
          );
        });

        // Set baseline loaded flag
        neuralState.baselineLoaded = true;

        return success(undefined);
      }

      return failure("Failed to load baseline activity");
    } catch (error) {
      return failure(
        error instanceof Error
          ? error.message
          : "Unknown error loading baseline",
      );
    }
  }, [patientId, neuralState]);

  // Apply neural transforms with mathematical precision
  const applyNeuralTransforms = useCallback(
    (transforms: NeuralTransform[]): Result<void> => {
      try {
        // Sort transforms to ensure deterministic application
        const sortedTransforms = [...transforms].sort((a, b) =>
          a.regionId.localeCompare(b.regionId),
        );

        // Apply each transform
        sortedTransforms.forEach((transform) => {
          // Get current activation level
          const currentLevel =
            neuralState.metrics.activationLevels.get(transform.regionId) ||
            "baseline";

          // Calculate new activation level based on current and change
          const newLevel = calculateNewActivationLevel(
            currentLevel,
            transform.activationChange,
          );

          // Update activation level
          neuralState.metrics.activationLevels.set(
            transform.regionId,
            newLevel,
          );

          // Update active/inhibited sets
          if (newLevel === "elevated" || newLevel === "hyperactive") {
            neuralState.activeRegions.add(transform.regionId);
            neuralState.inhibitedRegions.delete(transform.regionId);
          } else if (newLevel === "suppressed") {
            neuralState.inhibitedRegions.add(transform.regionId);
            neuralState.activeRegions.delete(transform.regionId);
          } else {
            neuralState.activeRegions.delete(transform.regionId);
            neuralState.inhibitedRegions.delete(transform.regionId);
          }

          // Add to transition history
          neuralState.transitionHistory.push(transform);

          // Limit history to last 100 transitions
          if (neuralState.transitionHistory.length > 100) {
            neuralState.transitionHistory.shift();
          }
        });

        // Update entropy and synchronization based on current state
        updateGlobalMetrics();

        return success(undefined);
      } catch (error) {
        return failure(
          error instanceof Error
            ? error.message
            : "Unknown error applying transforms",
        );
      }
    },
    [neuralState],
  );

  // Update global metrics based on current neural state
  const updateGlobalMetrics = useCallback(() => {
    // Calculate entropy based on activation level distribution
    const activationCounts = {
      suppressed: 0,
      baseline: 0,
      elevated: 0,
      hyperactive: 0,
    };

    neuralState.metrics.activationLevels.forEach((level) => {
      activationCounts[level]++;
    });

    const total = Object.values(activationCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    if (total > 0) {
      // Calculate Shannon entropy
      let entropy = 0;
      Object.values(activationCounts).forEach((count) => {
        if (count > 0) {
          const p = count / total;
          entropy -= p * Math.log2(p);
        }
      });

      // Normalize to 0-1 range (max entropy would be log2(4) for our 4 states)
      neuralState.metrics.entropyLevel = entropy / Math.log2(4);
    }

    // Calculate synchronization index based on active regions
    const activeRegions = neuralState.activeRegions.size;
    const totalRegions = neuralState.metrics.activationLevels.size;

    if (totalRegions > 0) {
      // Higher synchronization when either most regions are active or most are inactive
      const activeRatio = activeRegions / totalRegions;
      neuralState.metrics.synchronizationIndex =
        1 - 2 * Math.abs(activeRatio - 0.5);
    }

    // Update frequency dominance based on the current state
    // This is a simplified model; in reality, would be derived from EEG/MEG data
    if (neuralState.metrics.entropyLevel < 0.3) {
      // Low entropy (ordered) states tend to have more delta and alpha
      neuralState.metrics.frequencyDominance.set("delta", 0.3);
      neuralState.metrics.frequencyDominance.set("theta", 0.15);
      neuralState.metrics.frequencyDominance.set("alpha", 0.4);
      neuralState.metrics.frequencyDominance.set("beta", 0.1);
      neuralState.metrics.frequencyDominance.set("gamma", 0.05);
    } else if (neuralState.metrics.entropyLevel > 0.7) {
      // High entropy (chaotic) states tend to have more beta and gamma
      neuralState.metrics.frequencyDominance.set("delta", 0.1);
      neuralState.metrics.frequencyDominance.set("theta", 0.1);
      neuralState.metrics.frequencyDominance.set("alpha", 0.2);
      neuralState.metrics.frequencyDominance.set("beta", 0.3);
      neuralState.metrics.frequencyDominance.set("gamma", 0.3);
    } else {
      // Balanced states have a more even distribution
      neuralState.metrics.frequencyDominance.set("delta", 0.2);
      neuralState.metrics.frequencyDominance.set("theta", 0.2);
      neuralState.metrics.frequencyDominance.set("alpha", 0.2);
      neuralState.metrics.frequencyDominance.set("beta", 0.2);
      neuralState.metrics.frequencyDominance.set("gamma", 0.2);
    }
  }, [neuralState]);

  // Calculate a new activation level based on current level and change
  const calculateNewActivationLevel = (
    currentLevel: NeuralActivationLevel,
    activationChange: number,
  ): NeuralActivationLevel => {
    // Map current level to a numeric value
    const levelValues: Record<NeuralActivationLevel, number> = {
      suppressed: -1,
      baseline: 0,
      elevated: 0.5,
      hyperactive: 1,
    };

    const currentValue = levelValues[currentLevel];

    // Apply activation change with boundary limits
    const newValue = Math.max(-1, Math.min(1, currentValue + activationChange));

    // Map back to activation level
    if (newValue < -0.5) return "suppressed";
    if (newValue > 0.75) return "hyperactive";
    if (newValue > 0.25) return "elevated";
    return "baseline";
  };

  // Generate symptom-driven neural transforms
  const generateSymptomTransforms = useCallback(
    async (symptomIds: string[]): Promise<Result<NeuralTransform[]>> => {
      try {
        const mappingsResult =
          await clinicalService.getSymptomMappings(patientId);

        if (!mappingsResult.success || !mappingsResult.data) {
          return failure(
            mappingsResult.error || "Failed to load symptom mappings",
          );
        }

        const relevantMappings = mappingsResult.data.filter((mapping) =>
          symptomIds.includes(mapping.symptomId),
        );

        const transforms: NeuralTransform[] = [];

        // Generate transforms based on symptom activation patterns
        relevantMappings.forEach((mapping) => {
          mapping.activationPatterns.forEach((pattern) => {
            transforms.push({
              regionId: pattern.regionId,
              activationChange: pattern.activationLevel,
              transitionType: pattern.transitionType || "gradual",
              frequencyBand: pattern.frequencyBand,
              sourceTrigger: "symptom",
            });
          });
        });

        return success(transforms);
      } catch (error) {
        return failure(
          error instanceof Error
            ? error.message
            : "Unknown error generating transforms",
        );
      }
    },
    [patientId],
  );

  // Generate medication-driven neural transforms
  const generateMedicationTransforms = useCallback(
    async (medicationIds: string[]): Promise<Result<NeuralTransform[]>> => {
      try {
        const medicationsResult =
          await clinicalService.getMedicationEffects(medicationIds);

        if (!medicationsResult.success || !medicationsResult.data) {
          return failure(
            medicationsResult.error || "Failed to load medication effects",
          );
        }

        const transforms: NeuralTransform[] = [];

        // Generate transforms based on medication effects
        medicationsResult.data.forEach((medication) => {
          medication.regionalEffects.forEach((effect) => {
            transforms.push({
              regionId: effect.regionId,
              activationChange: effect.activationChange,
              transitionType: effect.transitionType || "gradual",
              frequencyBand: effect.frequencyBand,
              sourceTrigger: "medication",
            });
          });
        });

        return success(transforms);
      } catch (error) {
        return failure(
          error instanceof Error
            ? error.message
            : "Unknown error generating transforms",
        );
      }
    },
    [],
  );

  // Apply symptom-based activity changes
  const applySymptomActivity = useCallback(
    async (symptomIds: string[]): Promise<Result<void>> => {
      try {
        // Ensure baseline is loaded
        const baselineResult = await loadBaselineActivity();
        if (!baselineResult.success) return baselineResult;

        // Generate transforms
        const transformsResult = await generateSymptomTransforms(symptomIds);
        if (!transformsResult.success || !transformsResult.data) {
          return failure(
            transformsResult.error || "Failed to generate symptom transforms",
          );
        }

        // Apply transforms
        return applyNeuralTransforms(transformsResult.data);
      } catch (error) {
        return failure(
          error instanceof Error
            ? error.message
            : "Unknown error applying symptom activity",
        );
      }
    },
    [loadBaselineActivity, generateSymptomTransforms, applyNeuralTransforms],
  );

  // Apply medication-based activity changes
  const applyMedicationActivity = useCallback(
    async (medicationIds: string[]): Promise<Result<void>> => {
      try {
        // Ensure baseline is loaded
        const baselineResult = await loadBaselineActivity();
        if (!baselineResult.success) return baselineResult;

        // Generate transforms
        const transformsResult =
          await generateMedicationTransforms(medicationIds);
        if (!transformsResult.success || !transformsResult.data) {
          return failure(
            transformsResult.error ||
              "Failed to generate medication transforms",
          );
        }

        // Apply transforms
        return applyNeuralTransforms(transformsResult.data);
      } catch (error) {
        return failure(
          error instanceof Error
            ? error.message
            : "Unknown error applying medication activity",
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

      // Reload baseline
      const result = await loadBaselineActivity();
      updateGlobalMetrics();

      return result;
    } catch (error) {
      return failure(
        error instanceof Error
          ? error.message
          : "Unknown error resetting to baseline",
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
      metrics: { ...neuralState.metrics },
      activeRegions: new Set(neuralState.activeRegions),
      inhibitedRegions: new Set(neuralState.inhibitedRegions),
      baselineLoaded: neuralState.baselineLoaded,
      transitionHistory: [...neuralState.transitionHistory],
      computationalIntensity: neuralState.computationalIntensity,
    };
  }, [neuralState]);

  // Initialize on first use
  useEffect(() => {
    loadBaselineActivity().catch((error) => {
      console.error("Failed to load baseline activity:", error);
    });
  }, [loadBaselineActivity]);

  // Return the controller interface
  return {
    getCurrentState,
    applySymptomActivity,
    applyMedicationActivity,
    resetToBaseline,
    setComputationalIntensity,

    // Advanced functions for direct control
    applyNeuralTransforms,
    generateSymptomTransforms,
    generateMedicationTransforms,
  };
}

export default useNeuralActivityController;

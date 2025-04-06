/**
 * NOVAMIND Neural-Safe Coordination Layer
 * NeuralVisualizationCoordinator - Quantum-level cross-controller integration
 * with mathematically precise data unification and type-safe operations
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";

// Import controllers
import { useNeuroSyncOrchestrator } from "@application/orchestrators/NeuroSyncOrchestrator";
import { useNeuralActivityController } from "@application/controllers/NeuralActivityController";
import { useClinicalPredictionController } from "@application/controllers/ClinicalPredictionController";
import { useBiometricStreamController } from "@application/controllers/BiometricStreamController";
import { useTemporalDynamicsController } from "@application/controllers/TemporalDynamicsController";

// Domain types
import type {
  BrainRegion,
  NeuralConnection,
  BrainModel,
} from "@domain/types/brain/models";
import {
  ActivationLevel, // Corrected import name
  type NeuralActivityState,
} from "@domain/types/brain/activity";
import type { SymptomNeuralMapping } from "@domain/models/brain/mapping/brain-mapping"; // Corrected path
import type { TreatmentResponsePrediction } from "@domain/types/clinical/treatment";
import type {
  BiometricAlert,
  BiometricStream,
} from "@domain/types/biometric/streams";
import type { TemporalPattern, TimeScale } from "@domain/types/temporal/dynamics";
import type { NeuralTransform } from "@domain/types/neural/transforms";

/**
 * Unified visualization state with neural-safe typing
 */
interface VisualizationState {
  // Neural model
  brainModel: BrainModel | null;
  selectedRegions: string[];
  activeRegions: string[];

  // Activity state
  neuralActivation: Map<string, ActivationLevel>; // Use corrected type name
  connectionStrengths: Map<string, number>;

  // Clinical data
  symptomMappings: SymptomNeuralMapping[];
  treatmentPredictions: TreatmentResponsePrediction[];
  selectedTreatmentId: string | null;

  // Biometric data
  biometricAlerts: BiometricAlert[];
  biometricStreams: Map<string, BiometricStream>;

  // Temporal dynamics
  temporalPatterns: TemporalPattern[];
  currentTimeScale: TimeScale;

  // Visualization state
  renderMode:
    | "standard"
    | "heatmap"
    | "connectivity"
    | "activity"
    | "treatment";
  detailLevel: "low" | "medium" | "high" | "ultra";

  // System state
  isLoading: boolean;
  error: string | null;
  performanceMetrics: {
    frameRate: number;
    memoryUsage: number;
    dataPointsProcessed: number;
    processingLatency: number;
  };
}

/**
 * Context for the visualization coordinator with strict type safety
 */
interface VisualizationCoordinatorContext {
  state: VisualizationState;

  // Region selection
  selectRegion: (regionId: string) => void;
  deselectRegion: (regionId: string) => void;

  // Treatment selection
  selectTreatment: (treatmentId: string) => void;

  // Render configuration
  setRenderMode: (mode: VisualizationState["renderMode"]) => void;
  setDetailLevel: (level: VisualizationState["detailLevel"]) => void;
  setTimeScale: (scale: TimeScale) => void;

  // Neural modifications
  applyNeuralTransforms: (transforms: NeuralTransform[]) => Promise<boolean>;

  // Clinical interactions
  predictTreatmentOutcomes: (treatmentIds: string[]) => Promise<boolean>;

  // Biometric interactions
  acknowledgeAlert: (alertId: string) => Promise<boolean>;

  // Advanced functions
  resetVisualization: () => Promise<boolean>;
  exportVisualizationData: () => Record<string, any>;

  // Error handling
  clearError: () => void;
}

// Create the context with a safe default value
const defaultContext: VisualizationCoordinatorContext = {
  state: {
    brainModel: null,
    selectedRegions: [],
    activeRegions: [],
    neuralActivation: new Map(),
    connectionStrengths: new Map(),
    symptomMappings: [],
    treatmentPredictions: [],
    selectedTreatmentId: null,
    biometricAlerts: [],
    biometricStreams: new Map(),
    temporalPatterns: [],
    currentTimeScale: "daily", // Keep 'daily' as a valid default
    renderMode: "standard",
    detailLevel: "medium",
    isLoading: false,
    error: null,
    performanceMetrics: {
      frameRate: 60,
      memoryUsage: 0,
      dataPointsProcessed: 0,
      processingLatency: 0,
    },
  },

  selectRegion: () => {},
  deselectRegion: () => {},
  selectTreatment: () => {},
  setRenderMode: () => {},
  setDetailLevel: () => {},
  setTimeScale: () => {},
  applyNeuralTransforms: async () => false,
  predictTreatmentOutcomes: async () => false,
  acknowledgeAlert: async () => false,
  resetVisualization: async () => false,
  exportVisualizationData: () => ({}),
  clearError: () => {},
};

// Create the context
const VisualizationContext =
  createContext<VisualizationCoordinatorContext>(defaultContext);

/**
 * Props for the visualization coordinator provider
 */
interface VisualizationCoordinatorProviderProps {
  patientId: string;
  children: ReactNode;
}

/**
 * Visualization Coordinator Provider component
 * Serves as the central integration point for all neural controllers
 */
export const VisualizationCoordinatorProvider: React.FC<
  VisualizationCoordinatorProviderProps
> = ({ patientId, children }) => {
  // Initialize controllers
  const neuroSync = useNeuroSyncOrchestrator(patientId);
  const neuralActivity = useNeuralActivityController(patientId);
  const clinicalPrediction = useClinicalPredictionController(patientId);
  const biometricStream = useBiometricStreamController(patientId);
  const temporalDynamics = useTemporalDynamicsController(patientId);

  // Create unified state from all controllers
  const state = useMemo<VisualizationState>(() => {
    // Extract data from neuroSync state
    const {
      brainModel,
      selectedRegions,
      activeRegions,
      symptomMappings,
      treatmentPredictions,
      selectedTreatmentId,
      biometricAlerts,
      renderMode,
      detailLevel,
      frameRate,
      memoryUsage,
      loadingState,
      errorMessage,
    } = neuroSync.state;

    // Extract data from neural activity
    const neuralState = neuralActivity.getCurrentState();

    // Extract data from biometric stream
    const biometricStatus = biometricStream.getStatus();
    const biometricStreamsMap = new Map<string, BiometricStream>();
    biometricStream.activeStreams.forEach((stream) => {
      biometricStreamsMap.set(stream.id, stream);
    });

    // Extract data from temporal dynamics
    const temporalPatterns = temporalDynamics.detectedPatterns;
    const currentTimeScale = temporalDynamics.currentTimeScale;

    // Determine if system is loading
    const isLoading =
      loadingState === "loading" || temporalDynamics.isProcessing;

    // Combine error messages
    const error = errorMessage || temporalDynamics.errorState || null;

    // Combine performance metrics
    const performanceMetrics = {
      frameRate,
      memoryUsage,
      dataPointsProcessed: biometricStatus.dataPointsProcessed,
      processingLatency: biometricStatus.processingLatency,
    };

    return {
      brainModel,
      selectedRegions,
      activeRegions,
      neuralActivation: neuralState.metrics.activationLevels,
      connectionStrengths: neuralState.metrics.connectionStrengths,
      symptomMappings,
      treatmentPredictions,
      selectedTreatmentId,
      biometricAlerts,
      biometricStreams: biometricStreamsMap,
      temporalPatterns,
      currentTimeScale,
      renderMode,
      detailLevel,
      isLoading,
      error,
      performanceMetrics,
    };
  }, [neuroSync.state, neuralActivity, biometricStream, temporalDynamics]);

  // Select a brain region
  const selectRegion = useCallback(
    (regionId: string) => {
      neuroSync.actions.selectRegion(regionId);
    },
    [neuroSync.actions],
  );

  // Deselect a brain region
  const deselectRegion = useCallback(
    (regionId: string) => {
      neuroSync.actions.deselectRegion(regionId);
    },
    [neuroSync.actions],
  );

  // Select a treatment for visualization
  const selectTreatment = useCallback(
    (treatmentId: string) => {
      neuroSync.actions.selectTreatment(treatmentId);
    },
    [neuroSync.actions],
  );

  // Set the render mode
  const setRenderMode = useCallback(
    (mode: VisualizationState["renderMode"]) => {
      neuroSync.actions.setRenderMode(mode);
    },
    [neuroSync.actions],
  );

  // Set the detail level
  const setDetailLevel = useCallback(
    (level: VisualizationState["detailLevel"]) => {
      neuroSync.actions.setDetailLevel(level);
    },
    [neuroSync.actions],
  );

  // Set the time scale by reloading data for that scale
  const setTimeScale = useCallback(
    (scale: TimeScale) => {
      neuroSync.actions.setTimeScale(scale); // Update UI/sync state
      temporalDynamics.loadTemporalDynamics(scale).catch(error => { // Load data for the new scale
        console.error(`Failed to load temporal dynamics for scale ${scale}:`, error);
        // Optionally update an error state here
      });
    },
    [neuroSync.actions, temporalDynamics],
  );

  // Apply neural transforms
  const applyNeuralTransforms = useCallback(
    async (transforms: NeuralTransform[]): Promise<boolean> => {
      const result = await neuralActivity.applyNeuralTransforms(transforms);
      return result.success;
    },
    [neuralActivity],
  );

  // Predict treatment outcomes
  const predictTreatmentOutcomes = useCallback(
    async (treatmentIds: string[]): Promise<boolean> => {
      const result =
        await clinicalPrediction.predictTreatmentOutcomes(treatmentIds);
      return result.success;
    },
    [clinicalPrediction],
  );

  // Acknowledge a biometric alert
  const acknowledgeAlert = useCallback(
    async (alertId: string): Promise<boolean> => {
      const result = await biometricStream.acknowledgeAlert(alertId);
      return result.success;
    },
    [biometricStream],
  );

  // Reset visualization to baseline
  const resetVisualization = useCallback(async (): Promise<boolean> => {
    try {
      // Reset neural activity
      const neuralReset = await neuralActivity.resetToBaseline();

      if (!neuralReset.success) {
        console.error("Failed to reset neural activity:", neuralReset.error);
        return false;
      }

      // Reset temporal dynamics by reloading
      const temporalReset = await temporalDynamics.loadTemporalDynamics(
        state.currentTimeScale,
      );

      if (!temporalReset.success) {
        console.error(
          "Failed to reset temporal dynamics:",
          temporalReset.error,
        );
        return false;
      }

      // Clear selected regions and treatments
      neuroSync.actions.selectTreatment("");

      return true;
    } catch (error) {
      console.error("Error resetting visualization:", error);
      return false;
    }
  }, [
    neuralActivity,
    temporalDynamics,
    neuroSync.actions,
    state.currentTimeScale,
  ]);

  // Export visualization data
  const exportVisualizationData = useCallback((): Record<string, any> => {
    return {
      patientId,
      timestamp: new Date().toISOString(),
      visualizationState: {
        brainModel: state.brainModel,
        selectedRegions: state.selectedRegions,
        activeRegions: state.activeRegions,
        neuralActivation: Object.fromEntries(state.neuralActivation),
        selectedTreatmentId: state.selectedTreatmentId,
        renderMode: state.renderMode,
        timeScale: state.currentTimeScale,
      },
    };
  }, [patientId, state]);

  // Clear error
  const clearError = useCallback(() => {
    neuroSync.actions.clearError();
  }, [neuroSync.actions]);

  // Initialize biometric streams when component mounts
  useEffect(() => {
    biometricStream.connectStreams().catch((error) => {
      console.error("Failed to connect biometric streams:", error);
    });

    // Clean up on unmount
    return () => {
      biometricStream.disconnectStreams();
    };
  }, [biometricStream]);

  // Context value with all actions and state
  const contextValue = useMemo<VisualizationCoordinatorContext>(
    () => ({
      state,
      selectRegion,
      deselectRegion,
      selectTreatment,
      setRenderMode,
      setDetailLevel,
      setTimeScale,
      applyNeuralTransforms,
      predictTreatmentOutcomes,
      acknowledgeAlert,
      resetVisualization,
      exportVisualizationData,
      clearError,
    }),
    [
      state,
      selectRegion,
      deselectRegion,
      selectTreatment,
      setRenderMode,
      setDetailLevel,
      setTimeScale,
      applyNeuralTransforms,
      predictTreatmentOutcomes,
      acknowledgeAlert,
      resetVisualization,
      exportVisualizationData,
      clearError,
    ],
  );

  return (
    <VisualizationContext.Provider value={contextValue}>
      {children}
    </VisualizationContext.Provider>
  );
};

/**
 * Hook to access the visualization coordinator context
 * with neural-safe typing
 */
export const useVisualizationCoordinator =
  (): VisualizationCoordinatorContext => {
    const context = useContext(VisualizationContext);

    if (context === undefined) {
      throw new Error(
        "useVisualizationCoordinator must be used within a VisualizationCoordinatorProvider",
      );
    }

    return context;
  };

export default useVisualizationCoordinator;

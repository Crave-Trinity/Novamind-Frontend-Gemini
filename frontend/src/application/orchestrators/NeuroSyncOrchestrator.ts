/**
 * NOVAMIND Neural-Safe Orchestration Layer
 * NeuroSyncOrchestrator - Quantum-level component coordination
 * with mathematically precise data propagation
 */

import { useCallback, useEffect, useMemo, useState } from "react";

// Domain types
import {
  BrainRegion,
  NeuralConnection,
  BrainModel,
} from "@domain/types/brain/models";
import {
  NeuralActivationLevel,
  NeuralActivityState,
} from "@domain/types/brain/activity";
import {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
} from "@domain/types/clinical/mapping";
import { TreatmentResponsePrediction } from "@domain/types/clinical/treatment";
import {
  BiometricAlert,
  BiometricStream,
} from "@domain/types/biometric/streams";
import { TemporalDynamics } from "@domain/types/temporal/dynamics";
import { Result, success, failure } from "@domain/types/common/result";

// Services
import { brainModelService } from "@application/services/brainModelService";
import { clinicalService } from "@application/services/clinicalService";
import { biometricService } from "@application/services/biometricService";
import { temporalService } from "@application/services/temporalService";

// Types for the orchestration state
export interface NeuroSyncState {
  // Brain model
  brainModel: BrainModel | null;
  selectedRegions: string[];
  activeRegions: string[];

  // Clinical data
  symptomMappings: SymptomNeuralMapping[];
  diagnosisMappings: DiagnosisNeuralMapping[];
  treatmentPredictions: TreatmentResponsePrediction[];
  selectedTreatmentId: string | null;

  // Biometric data
  biometricAlerts: BiometricAlert[];
  biometricStreams: BiometricStream[];

  // Temporal dynamics
  temporalDynamics: TemporalDynamics | null;
  timeScale: "realtime" | "hourly" | "daily" | "weekly" | "monthly";

  // Visualization state
  renderMode:
    | "standard"
    | "heatmap"
    | "connectivity"
    | "activity"
    | "treatment";
  detailLevel: "low" | "medium" | "high" | "ultra";

  // Performance metrics
  frameRate: number;
  memoryUsage: number;
  loadingState: "idle" | "loading" | "loaded" | "error";
  errorMessage: string | null;
}

// Action types with discriminated unions for type safety
type NeuroSyncAction =
  | { type: "SET_BRAIN_MODEL"; payload: BrainModel }
  | { type: "SELECT_REGION"; payload: string }
  | { type: "DESELECT_REGION"; payload: string }
  | { type: "SET_ACTIVE_REGIONS"; payload: string[] }
  | { type: "SET_SYMPTOM_MAPPINGS"; payload: SymptomNeuralMapping[] }
  | { type: "SET_DIAGNOSIS_MAPPINGS"; payload: DiagnosisNeuralMapping[] }
  | {
      type: "SET_TREATMENT_PREDICTIONS";
      payload: TreatmentResponsePrediction[];
    }
  | { type: "SELECT_TREATMENT"; payload: string }
  | { type: "SET_BIOMETRIC_ALERTS"; payload: BiometricAlert[] }
  | { type: "SET_BIOMETRIC_STREAMS"; payload: BiometricStream[] }
  | { type: "SET_TEMPORAL_DYNAMICS"; payload: TemporalDynamics }
  | { type: "SET_TIME_SCALE"; payload: NeuroSyncState["timeScale"] }
  | { type: "SET_RENDER_MODE"; payload: NeuroSyncState["renderMode"] }
  | { type: "SET_DETAIL_LEVEL"; payload: NeuroSyncState["detailLevel"] }
  | {
      type: "UPDATE_PERFORMANCE";
      payload: { frameRate: number; memoryUsage: number };
    }
  | { type: "SET_LOADING_STATE"; payload: NeuroSyncState["loadingState"] }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" };

// Initial state with neural-safe default values
const initialNeuroSyncState: NeuroSyncState = {
  brainModel: null,
  selectedRegions: [],
  activeRegions: [],
  symptomMappings: [],
  diagnosisMappings: [],
  treatmentPredictions: [],
  selectedTreatmentId: null,
  biometricAlerts: [],
  biometricStreams: [],
  temporalDynamics: null,
  timeScale: "realtime",
  renderMode: "standard",
  detailLevel: "medium",
  frameRate: 60,
  memoryUsage: 0,
  loadingState: "idle",
  errorMessage: null,
};

/**
 * Neural-safe reducer for state transitions with guaranteed type integrity
 */
function neuroSyncReducer(
  state: NeuroSyncState,
  action: NeuroSyncAction,
): NeuroSyncState {
  switch (action.type) {
    case "SET_BRAIN_MODEL":
      return { ...state, brainModel: action.payload };

    case "SELECT_REGION":
      return {
        ...state,
        selectedRegions: state.selectedRegions.includes(action.payload)
          ? state.selectedRegions
          : [...state.selectedRegions, action.payload],
      };

    case "DESELECT_REGION":
      return {
        ...state,
        selectedRegions: state.selectedRegions.filter(
          (id) => id !== action.payload,
        ),
      };

    case "SET_ACTIVE_REGIONS":
      return { ...state, activeRegions: action.payload };

    case "SET_SYMPTOM_MAPPINGS":
      return { ...state, symptomMappings: action.payload };

    case "SET_DIAGNOSIS_MAPPINGS":
      return { ...state, diagnosisMappings: action.payload };

    case "SET_TREATMENT_PREDICTIONS":
      return { ...state, treatmentPredictions: action.payload };

    case "SELECT_TREATMENT":
      return { ...state, selectedTreatmentId: action.payload };

    case "SET_BIOMETRIC_ALERTS":
      return { ...state, biometricAlerts: action.payload };

    case "SET_BIOMETRIC_STREAMS":
      return { ...state, biometricStreams: action.payload };

    case "SET_TEMPORAL_DYNAMICS":
      return { ...state, temporalDynamics: action.payload };

    case "SET_TIME_SCALE":
      return { ...state, timeScale: action.payload };

    case "SET_RENDER_MODE":
      return { ...state, renderMode: action.payload };

    case "SET_DETAIL_LEVEL":
      return { ...state, detailLevel: action.payload };

    case "UPDATE_PERFORMANCE":
      return {
        ...state,
        frameRate: action.payload.frameRate,
        memoryUsage: action.payload.memoryUsage,
      };

    case "SET_LOADING_STATE":
      return { ...state, loadingState: action.payload };

    case "SET_ERROR":
      return { ...state, errorMessage: action.payload, loadingState: "error" };

    case "CLEAR_ERROR":
      return { ...state, errorMessage: null };

    default:
      return state;
  }
}

/**
 * Millisecond time precision for synchronization operations
 */
interface SyncTimingConfig {
  brainModelRefreshInterval: number;
  biometricRefreshInterval: number;
  temporalRefreshInterval: number;
  performanceMonitorInterval: number;
  dataCorrelationInterval: number;
}

/**
 * Default timing configuration with precision intervals
 */
const defaultTimingConfig: SyncTimingConfig = {
  brainModelRefreshInterval: 5000, // 5 seconds
  biometricRefreshInterval: 1000, // 1 second
  temporalRefreshInterval: 10000, // 10 seconds
  performanceMonitorInterval: 500, // 0.5 seconds
  dataCorrelationInterval: 2000, // 2 seconds
};

/**
 * Neural-safe orchestration hook for component coordination
 */
export function useNeuroSyncOrchestrator(
  patientId: string,
  timingConfig: SyncTimingConfig = defaultTimingConfig,
) {
  // State using useReducer pattern internally
  const [state, dispatch] = useState<NeuroSyncState>(initialNeuroSyncState);

  // Fetch brain model with error handling
  const fetchBrainModel = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING_STATE", payload: "loading" });

      const result = await brainModelService.getBrainModel(patientId);

      if (result.success && result.data) {
        dispatch({ type: "SET_BRAIN_MODEL", payload: result.data });
        dispatch({ type: "SET_LOADING_STATE", payload: "loaded" });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: result.error || "Failed to load brain model",
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Unknown error loading brain model",
      });
    }
  }, [patientId]);

  // Fetch clinical data
  const fetchClinicalData = useCallback(async () => {
    try {
      // Fetch symptom mappings
      const symptomResult = await clinicalService.getSymptomMappings(patientId);
      if (symptomResult.success && symptomResult.data) {
        dispatch({ type: "SET_SYMPTOM_MAPPINGS", payload: symptomResult.data });
      }

      // Fetch diagnosis mappings
      const diagnosisResult =
        await clinicalService.getDiagnosisMappings(patientId);
      if (diagnosisResult.success && diagnosisResult.data) {
        dispatch({
          type: "SET_DIAGNOSIS_MAPPINGS",
          payload: diagnosisResult.data,
        });
      }

      // Fetch treatment predictions
      const treatmentResult =
        await clinicalService.getTreatmentPredictions(patientId);
      if (treatmentResult.success && treatmentResult.data) {
        dispatch({
          type: "SET_TREATMENT_PREDICTIONS",
          payload: treatmentResult.data,
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Unknown error loading clinical data",
      });
    }
  }, [patientId]);

  // Fetch biometric data
  const fetchBiometricData = useCallback(async () => {
    try {
      // Fetch biometric alerts
      const alertsResult = await biometricService.getBiometricAlerts(patientId);
      if (alertsResult.success && alertsResult.data) {
        dispatch({ type: "SET_BIOMETRIC_ALERTS", payload: alertsResult.data });
      }

      // Fetch biometric streams
      const streamsResult =
        await biometricService.getBiometricStreams(patientId);
      if (streamsResult.success && streamsResult.data) {
        dispatch({
          type: "SET_BIOMETRIC_STREAMS",
          payload: streamsResult.data,
        });
      }
    } catch (error) {
      // Non-blocking error for biometric data - log but don't disrupt visualization
      console.error("Error loading biometric data:", error);
    }
  }, [patientId]);

  // Fetch temporal dynamics
  const fetchTemporalDynamics = useCallback(async () => {
    try {
      const result = await temporalService.getTemporalDynamics(
        patientId,
        state.timeScale,
      );

      if (result.success && result.data) {
        dispatch({ type: "SET_TEMPORAL_DYNAMICS", payload: result.data });
      }
    } catch (error) {
      // Non-blocking error for temporal data
      console.error("Error loading temporal dynamics:", error);
    }
  }, [patientId, state.timeScale]);

  // Calculate neural activation based on current state
  const calculateNeuralActivation = useCallback(() => {
    if (!state.brainModel || state.symptomMappings.length === 0) {
      return;
    }

    try {
      // Extract active symptoms from mappings (in production this would come from patient data)
      const activeSymptomIds = state.symptomMappings
        .filter((mapping) => Math.random() > 0.5) // Simulated data for demo purposes
        .map((mapping) => mapping.symptomId);

      // Calculate which regions should be active based on symptom mappings
      const activatedRegions = state.symptomMappings
        .filter((mapping) => activeSymptomIds.includes(mapping.symptomId))
        .flatMap((mapping) =>
          mapping.activationPatterns.map((pattern) => pattern.regionId),
        );

      // Set active regions in state
      dispatch({
        type: "SET_ACTIVE_REGIONS",
        payload: [...new Set(activatedRegions)],
      });
    } catch (error) {
      console.error("Error calculating neural activation:", error);
    }
  }, [state.brainModel, state.symptomMappings]);

  // Monitor performance
  const monitorPerformance = useCallback(() => {
    // In a real implementation, this would measure actual rendering performance
    // For now, we'll use simulated values
    const frameRate = 60 - Math.random() * 10;
    const memoryUsage = 100 + Math.random() * 100;

    dispatch({
      type: "UPDATE_PERFORMANCE",
      payload: { frameRate, memoryUsage },
    });
  }, []);

  // Set up data loading and refresh intervals
  useEffect(() => {
    // Initial data loading
    fetchBrainModel();
    fetchClinicalData();
    fetchBiometricData();
    fetchTemporalDynamics();

    // Set up refresh intervals
    const brainModelInterval = setInterval(
      fetchBrainModel,
      timingConfig.brainModelRefreshInterval,
    );
    const biometricInterval = setInterval(
      fetchBiometricData,
      timingConfig.biometricRefreshInterval,
    );
    const temporalInterval = setInterval(
      fetchTemporalDynamics,
      timingConfig.temporalRefreshInterval,
    );
    const performanceInterval = setInterval(
      monitorPerformance,
      timingConfig.performanceMonitorInterval,
    );
    const correlationInterval = setInterval(
      calculateNeuralActivation,
      timingConfig.dataCorrelationInterval,
    );

    // Clean up intervals on unmount
    return () => {
      clearInterval(brainModelInterval);
      clearInterval(biometricInterval);
      clearInterval(temporalInterval);
      clearInterval(performanceInterval);
      clearInterval(correlationInterval);
    };
  }, [
    fetchBrainModel,
    fetchClinicalData,
    fetchBiometricData,
    fetchTemporalDynamics,
    calculateNeuralActivation,
    monitorPerformance,
    timingConfig,
  ]);

  // Action creators with type safety
  const actions = useMemo(
    () => ({
      selectRegion: (regionId: string) => {
        dispatch({ type: "SELECT_REGION", payload: regionId });
      },

      deselectRegion: (regionId: string) => {
        dispatch({ type: "DESELECT_REGION", payload: regionId });
      },

      selectTreatment: (treatmentId: string) => {
        dispatch({ type: "SELECT_TREATMENT", payload: treatmentId });
      },

      setRenderMode: (mode: NeuroSyncState["renderMode"]) => {
        dispatch({ type: "SET_RENDER_MODE", payload: mode });
      },

      setDetailLevel: (level: NeuroSyncState["detailLevel"]) => {
        dispatch({ type: "SET_DETAIL_LEVEL", payload: level });
      },

      setTimeScale: (scale: NeuroSyncState["timeScale"]) => {
        dispatch({ type: "SET_TIME_SCALE", payload: scale });
      },

      clearError: () => {
        dispatch({ type: "CLEAR_ERROR" });
      },
    }),
    [],
  );

  // Return state and actions for component consumption
  return {
    state,
    actions,
  };
}

export default useNeuroSyncOrchestrator;

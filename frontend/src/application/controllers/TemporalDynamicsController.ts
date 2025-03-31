/**
 * NOVAMIND Neural-Safe Controller Layer
 * TemporalDynamicsController - Quantum-level temporal pattern processing
 * with mathematically precise pattern recognition and type-safe operations
 */

import { useCallback, useEffect, useMemo, useState } from "react";

// Domain types
import {
  TemporalDynamics,
  TemporalPattern,
  TimeScale,
  PatternClass,
  StateTransition,
  CriticalTransitionIndicator,
  TemporalSegment,
  TemporalFeature,
} from "@domain/types/temporal/dynamics";
import { Result, success, failure } from "@domain/types/common/result";

// Services
import { temporalService } from "@application/services/temporalService";
import { clinicalService } from "@application/services/clinicalService";

/**
 * Neural-safe temporal configuration with quantum precision
 */
interface TemporalConfig {
  timeScales: TimeScale[];
  patternRecognitionThreshold: number; // 0.0 to 1.0
  criticalTransitionSensitivity: number; // 0.0 to 1.0
  historyLength: Record<TimeScale, number>; // Number of time units to retain
  samplingRate: Record<TimeScale, number>; // Samples per time unit
  periodicity: boolean; // Whether to detect periodic patterns
  anomalyDetection: boolean; // Whether to detect anomalies
  filterNoise: boolean; // Whether to filter noise
  smoothingFactor: number; // 0.0 to 1.0
}

/**
 * Temporal dynamics state with thread-safety guarantees
 */
interface TemporalState {
  dynamicsData: Record<TimeScale, TemporalSegment[]>;
  detectedPatterns: TemporalPattern[];
  stateTransitions: StateTransition[];
  criticalTransitions: CriticalTransitionIndicator[];
  currentTimeScale: TimeScale;
  temporalFeatures: Record<string, TemporalFeature[]>;
  lastUpdated: Date | null;
  isProcessing: boolean;
  errorState: string | null;
  metrics: {
    patternsDetected: number;
    transitionsIdentified: number;
    anomaliesDetected: number;
    processingLatency: number; // milliseconds
  };
}

/**
 * Default temporal configuration with clinical precision
 */
const defaultTemporalConfig: TemporalConfig = {
  timeScales: ["momentary", "hourly", "daily", "weekly", "monthly"],
  patternRecognitionThreshold: 0.7,
  criticalTransitionSensitivity: 0.8,
  historyLength: {
    momentary: 60, // 60 moments
    hourly: 24, // 24 hours
    daily: 30, // 30 days
    weekly: 12, // 12 weeks
    monthly: 24, // 24 months
  },
  samplingRate: {
    momentary: 60, // 60 samples per minute
    hourly: 6, // 6 samples per hour
    daily: 24, // 24 samples per day
    weekly: 7, // 7 samples per week
    monthly: 30, // 30 samples per month
  },
  periodicity: true,
  anomalyDetection: true,
  filterNoise: true,
  smoothingFactor: 0.3,
};

/**
 * Initial temporal state with safe defaults
 */
const createInitialTemporalState = (): TemporalState => ({
  dynamicsData: {
    momentary: [],
    hourly: [],
    daily: [],
    weekly: [],
    monthly: [],
  },
  detectedPatterns: [],
  stateTransitions: [],
  criticalTransitions: [],
  currentTimeScale: "daily",
  temporalFeatures: {},
  lastUpdated: null,
  isProcessing: false,
  errorState: null,
  metrics: {
    patternsDetected: 0,
    transitionsIdentified: 0,
    anomaliesDetected: 0,
    processingLatency: 0,
  },
});

/**
 * Neural-safe controller for temporal dynamics processing
 * with clinical-grade precision and type safety
 */
export function useTemporalDynamicsController(
  patientId: string,
  initialConfig: Partial<TemporalConfig> = {},
) {
  // Merge provided config with defaults
  const config = useMemo<TemporalConfig>(
    () => ({
      ...defaultTemporalConfig,
      ...initialConfig,
    }),
    [initialConfig],
  );

  // State with thread-safe operations
  const [state, setState] = useState<TemporalState>(
    createInitialTemporalState(),
  );

  // Load temporal dynamics for the given time scale
  const loadTemporalDynamics = useCallback(
    async (timeScale: TimeScale): Promise<Result<TemporalDynamics>> => {
      try {
        // Start by marking as processing
        setState((prevState) => ({
          ...prevState,
          isProcessing: true,
          errorState: null,
          currentTimeScale: timeScale,
        }));

        const startTime = performance.now();

        // Fetch temporal dynamics from service
        const result = await temporalService.getTemporalDynamics(
          patientId,
          timeScale,
        );

        if (result.success && result.data) {
          const endTime = performance.now();
          const processingLatency = endTime - startTime;

          // Update state with new dynamics data
          setState((prevState) => {
            // Extract segments
            const segments = result.data.segments || [];

            // Extract patterns
            const patterns = result.data.patterns || [];

            // Extract transitions
            const transitions = result.data.stateTransitions || [];

            // Extract critical transitions
            const criticalTransitions = result.data.criticalTransitions || [];

            // Extract temporal features
            const features = result.data.features || {};

            // Update dynamics data for this time scale
            const newDynamicsData = {
              ...prevState.dynamicsData,
              [timeScale]: segments,
            };

            // Count metrics
            const patternsDetected = patterns.length;
            const transitionsIdentified = transitions.length;
            const anomaliesDetected = patterns.filter(
              (p) => p.class === "anomaly",
            ).length;

            return {
              ...prevState,
              dynamicsData: newDynamicsData,
              detectedPatterns: patterns,
              stateTransitions: transitions,
              criticalTransitions: criticalTransitions,
              temporalFeatures: features,
              lastUpdated: new Date(),
              isProcessing: false,
              metrics: {
                ...prevState.metrics,
                patternsDetected:
                  prevState.metrics.patternsDetected + patternsDetected,
                transitionsIdentified:
                  prevState.metrics.transitionsIdentified +
                  transitionsIdentified,
                anomaliesDetected:
                  prevState.metrics.anomaliesDetected + anomaliesDetected,
                processingLatency,
              },
            };
          });

          return success(result.data);
        }

        // Handle failure
        setState((prevState) => ({
          ...prevState,
          isProcessing: false,
          errorState: result.error || "Failed to load temporal dynamics",
        }));

        return failure(result.error || "Failed to load temporal dynamics");
      } catch (error) {
        // Update error state
        setState((prevState) => ({
          ...prevState,
          isProcessing: false,
          errorState:
            error instanceof Error
              ? error.message
              : "Unknown error loading dynamics",
        }));

        return failure(
          error instanceof Error
            ? error.message
            : "Unknown error loading dynamics",
        );
      }
    },
    [patientId],
  );

  // Analyze patterns across all loaded time scales
  const analyzePatterns = useCallback(async (): Promise<
    Result<TemporalPattern[]>
  > => {
    try {
      const startTime = performance.now();

      // Start by marking as processing
      setState((prevState) => ({
        ...prevState,
        isProcessing: true,
        errorState: null,
      }));

      // Get all dynamics data across time scales
      const dynamicsData = state.dynamicsData;

      // Validate that we have data to analyze
      const hasData = Object.values(dynamicsData).some(
        (segments) => segments.length > 0,
      );

      if (!hasData) {
        setState((prevState) => ({
          ...prevState,
          isProcessing: false,
          errorState: "No temporal data available for analysis",
        }));

        return failure("No temporal data available for analysis");
      }

      // Call the service to analyze patterns
      const result = await temporalService.analyzeTemporalPatterns({
        patientId,
        timeScales: config.timeScales,
        threshold: config.patternRecognitionThreshold,
        detectPeriodicity: config.periodicity,
        detectAnomalies: config.anomalyDetection,
        filterNoise: config.filterNoise,
        smoothingFactor: config.smoothingFactor,
      });

      if (result.success && result.data) {
        const endTime = performance.now();
        const processingLatency = endTime - startTime;

        // Update state with new patterns
        setState((prevState) => {
          return {
            ...prevState,
            detectedPatterns: result.data,
            isProcessing: false,
            lastUpdated: new Date(),
            metrics: {
              ...prevState.metrics,
              patternsDetected: result.data.length,
              processingLatency,
            },
          };
        });

        return success(result.data);
      }

      // Handle failure
      setState((prevState) => ({
        ...prevState,
        isProcessing: false,
        errorState: result.error || "Failed to analyze temporal patterns",
      }));

      return failure(result.error || "Failed to analyze temporal patterns");
    } catch (error) {
      // Update error state
      setState((prevState) => ({
        ...prevState,
        isProcessing: false,
        errorState:
          error instanceof Error
            ? error.message
            : "Unknown error analyzing patterns",
      }));

      return failure(
        error instanceof Error
          ? error.message
          : "Unknown error analyzing patterns",
      );
    }
  }, [patientId, state.dynamicsData, config]);

  // Detect state transitions
  const detectTransitions = useCallback(async (): Promise<
    Result<StateTransition[]>
  > => {
    try {
      const startTime = performance.now();

      // Start by marking as processing
      setState((prevState) => ({
        ...prevState,
        isProcessing: true,
        errorState: null,
      }));

      // Call the service to detect transitions
      const result = await temporalService.detectStateTransitions({
        patientId,
        timeScales: config.timeScales,
        criticalTransitionSensitivity: config.criticalTransitionSensitivity,
      });

      if (result.success && result.data) {
        const endTime = performance.now();
        const processingLatency = endTime - startTime;

        // Extract regular and critical transitions
        const regularTransitions = result.data.filter((t) => !t.isCritical);
        const criticalTransitions = result.data
          .filter((t) => t.isCritical)
          .map((t) => ({
            id: t.id,
            timestamp: t.timestamp,
            fromState: t.fromState,
            toState: t.toState,
            confidence: t.confidence,
            earlyWarningSignals: t.earlyWarningSignals || [],
            timeScale: t.timeScale,
            relatedMetrics: t.relatedMetrics || [],
          }));

        // Update state with transitions
        setState((prevState) => {
          return {
            ...prevState,
            stateTransitions: regularTransitions,
            criticalTransitions,
            isProcessing: false,
            lastUpdated: new Date(),
            metrics: {
              ...prevState.metrics,
              transitionsIdentified: result.data.length,
              processingLatency,
            },
          };
        });

        return success(result.data);
      }

      // Handle failure
      setState((prevState) => ({
        ...prevState,
        isProcessing: false,
        errorState: result.error || "Failed to detect state transitions",
      }));

      return failure(result.error || "Failed to detect state transitions");
    } catch (error) {
      // Update error state
      setState((prevState) => ({
        ...prevState,
        isProcessing: false,
        errorState:
          error instanceof Error
            ? error.message
            : "Unknown error detecting transitions",
      }));

      return failure(
        error instanceof Error
          ? error.message
          : "Unknown error detecting transitions",
      );
    }
  }, [patientId, config.timeScales, config.criticalTransitionSensitivity]);

  // Extract features from temporal data
  const extractFeatures = useCallback(
    async (
      metricIds: string[],
    ): Promise<Result<Record<string, TemporalFeature[]>>> => {
      try {
        const startTime = performance.now();

        // Start by marking as processing
        setState((prevState) => ({
          ...prevState,
          isProcessing: true,
          errorState: null,
        }));

        // Call service to extract features
        const result = await temporalService.extractTemporalFeatures({
          patientId,
          metricIds,
          timeScales: config.timeScales,
        });

        if (result.success && result.data) {
          const endTime = performance.now();
          const processingLatency = endTime - startTime;

          // Update state with features
          setState((prevState) => {
            return {
              ...prevState,
              temporalFeatures: result.data,
              isProcessing: false,
              lastUpdated: new Date(),
              metrics: {
                ...prevState.metrics,
                processingLatency,
              },
            };
          });

          return success(result.data);
        }

        // Handle failure
        setState((prevState) => ({
          ...prevState,
          isProcessing: false,
          errorState: result.error || "Failed to extract temporal features",
        }));

        return failure(result.error || "Failed to extract temporal features");
      } catch (error) {
        // Update error state
        setState((prevState) => ({
          ...prevState,
          isProcessing: false,
          errorState:
            error instanceof Error
              ? error.message
              : "Unknown error extracting features",
        }));

        return failure(
          error instanceof Error
            ? error.message
            : "Unknown error extracting features",
        );
      }
    },
    [patientId, config.timeScales],
  );

  // Correlate temporal patterns with clinical events
  const correlateWithClinicalEvents = useCallback(async (): Promise<
    Result<TemporalPattern[]>
  > => {
    try {
      // Get detected patterns
      const patterns = state.detectedPatterns;

      if (patterns.length === 0) {
        return failure("No patterns detected to correlate");
      }

      // Call clinical service
      const result = await clinicalService.correlateTemporalPatternsWithEvents({
        patientId,
        patterns,
        timeScales: config.timeScales,
      });

      if (result.success && result.data) {
        // Update patterns with clinical correlations
        setState((prevState) => {
          return {
            ...prevState,
            detectedPatterns: result.data,
            lastUpdated: new Date(),
          };
        });

        return success(result.data);
      }

      return failure(
        result.error || "Failed to correlate with clinical events",
      );
    } catch (error) {
      return failure(
        error instanceof Error
          ? error.message
          : "Unknown error correlating events",
      );
    }
  }, [patientId, state.detectedPatterns, config.timeScales]);

  // Get early warning indicators
  const getEarlyWarningIndicators = useCallback(async (): Promise<
    Result<CriticalTransitionIndicator[]>
  > => {
    try {
      // Call temporal service
      const result = await temporalService.getEarlyWarningIndicators({
        patientId,
        sensitivity: config.criticalTransitionSensitivity,
        timeScales: config.timeScales,
      });

      if (result.success && result.data) {
        // Update state with indicators
        setState((prevState) => {
          return {
            ...prevState,
            criticalTransitions: result.data,
            lastUpdated: new Date(),
          };
        });

        return success(result.data);
      }

      return failure(result.error || "Failed to get early warning indicators");
    } catch (error) {
      return failure(
        error instanceof Error
          ? error.message
          : "Unknown error getting indicators",
      );
    }
  }, [patientId, config.criticalTransitionSensitivity, config.timeScales]);

  // Set current time scale
  const setTimeScale = useCallback((timeScale: TimeScale): void => {
    setState((prevState) => ({
      ...prevState,
      currentTimeScale: timeScale,
    }));
  }, []);

  // Get patterns for a specific time scale
  const getPatternsForTimeScale = useCallback(
    (timeScale: TimeScale): TemporalPattern[] => {
      return state.detectedPatterns.filter(
        (pattern) => pattern.timeScale === timeScale,
      );
    },
    [state.detectedPatterns],
  );

  // Get critical transitions for a specific time scale
  const getCriticalTransitionsForTimeScale = useCallback(
    (timeScale: TimeScale): CriticalTransitionIndicator[] => {
      return state.criticalTransitions.filter(
        (transition) => transition.timeScale === timeScale,
      );
    },
    [state.criticalTransitions],
  );

  // Initialize by loading temporal dynamics for the default time scale
  useEffect(() => {
    loadTemporalDynamics(state.currentTimeScale).catch((error) => {
      console.error("Failed to load initial temporal dynamics:", error);
    });
  }, [loadTemporalDynamics, state.currentTimeScale]);

  // Return controller interface
  return {
    loadTemporalDynamics,
    analyzePatterns,
    detectTransitions,
    extractFeatures,
    correlateWithClinicalEvents,
    getEarlyWarningIndicators,
    setTimeScale,
    getPatternsForTimeScale,
    getCriticalTransitionsForTimeScale,

    // State accessors
    currentTimeScale: state.currentTimeScale,
    detectedPatterns: state.detectedPatterns,
    stateTransitions: state.stateTransitions,
    criticalTransitions: state.criticalTransitions,
    dynamicsData: state.dynamicsData,
    temporalFeatures: state.temporalFeatures,

    // Status information
    isProcessing: state.isProcessing,
    errorState: state.errorState,
    lastUpdated: state.lastUpdated,
    metrics: state.metrics,
  };
}

export default useTemporalDynamicsController;

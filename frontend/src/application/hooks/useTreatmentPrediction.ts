/**
 * Treatment Prediction Hook
 * Custom hook for managing and fetching treatment response predictions
 */

import { useState, useCallback } from "react";
// Import with proper type definitions
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  xgboostService,
  TreatmentResponseRequest,
  TreatmentResponseResponse,
} from "../../infrastructure/api/XGBoostService";

interface UseTreatmentPredictionOptions {
  patientId: string;
  initialTreatmentType?: string;
  onPredictionSuccess?: (data: TreatmentResponseResponse) => void;
  onPredictionError?: (error: Error) => void;
}

export function useTreatmentPrediction({
  patientId,
  initialTreatmentType = "ssri",
  onPredictionSuccess,
  onPredictionError,
}: UseTreatmentPredictionOptions) {
  // Store current treatment configuration
  const [treatmentConfig, setTreatmentConfig] = useState({
    treatmentType: initialTreatmentType,
    details: {} as Record<string, unknown>,
  });

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Track active prediction ID for fetching related data
  const [activePredictionId, setActivePredictionId] = useState<string | null>(
    null,
  );

  // Mutation for treatment response prediction
  const {
    mutate: predictTreatmentResponse,
    isPending: isPredicting,
    error: predictionError,
    data: predictionResult,
    reset: resetPrediction,
  } = useMutation({
    mutationFn: async ({
      clinicalData,
      geneticData,
    }: {
      clinicalData: {
        severity: string;
        diagnosis: string;
        assessment_scores?: Record<string, number>;
        [key: string]: unknown;
      };
      geneticData?: string[];
    }) => {
      const request: TreatmentResponseRequest = {
        patient_id: patientId,
        treatment_type: treatmentConfig.treatmentType,
        treatment_details: treatmentConfig.details,
        clinical_data: clinicalData,
        genetic_data: geneticData,
      };

      const response = await xgboostService.predictTreatmentResponse(request);

      // Store the prediction ID for related queries
      if (response.prediction_id) {
        setActivePredictionId(response.prediction_id);
      }

      return response;
    },
    onSuccess: (data: TreatmentResponseResponse) => {
      onPredictionSuccess?.(data);

      // Invalidate related queries that depend on this prediction
      queryClient.invalidateQueries({
        queryKey: ["featureImportance", patientId],
      });
    },
    onError: (error: Error) => {
      onPredictionError?.(error);
    },
  });

  // Fetch feature importance for current prediction
  const {
    data: featureImportance,
    isLoading: isLoadingFeatures,
    error: featureError,
  } = useQuery({
    queryKey: ["featureImportance", patientId, activePredictionId],
    queryFn: () =>
      xgboostService.getFeatureImportance({
        patient_id: patientId,
        model_type: `treatment-${treatmentConfig.treatmentType}`,
        prediction_id: activePredictionId!,
      }),
    enabled: !!activePredictionId, // Only run query if we have a prediction ID
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Integrate prediction with digital twin profile
  const {
    mutate: integrateWithDigitalTwin,
    isPending: isIntegrating,
    error: integrationError,
    data: integrationResult,
  } = useMutation({
    mutationFn: async (profileId: string) => {
      if (!activePredictionId) {
        throw new Error("No active prediction to integrate");
      }

      return xgboostService.integrateWithDigitalTwin({
        patient_id: patientId,
        profile_id: profileId,
        prediction_id: activePredictionId,
      });
    },
  });

  // Update treatment configuration
  const updateTreatmentConfig = useCallback(
    (config: Partial<typeof treatmentConfig>) => {
      setTreatmentConfig((prev) => ({
        ...prev,
        ...config,
      }));

      // If changing treatment type, reset active prediction
      if (
        config.treatmentType !== undefined &&
        config.treatmentType !== treatmentConfig.treatmentType
      ) {
        resetPrediction();
        setActivePredictionId(null);
      }
    },
    [treatmentConfig.treatmentType, resetPrediction],
  );

  return {
    // State
    treatmentConfig,
    activePredictionId,
    predictionResult,
    featureImportance,
    integrationResult,

    // Loading states
    isPredicting,
    isLoadingFeatures,
    isIntegrating,

    // Errors
    predictionError,
    featureError,
    integrationError,

    // Actions
    updateTreatmentConfig,
    predictTreatmentResponse,
    integrateWithDigitalTwin,
    resetPrediction,
  };
}

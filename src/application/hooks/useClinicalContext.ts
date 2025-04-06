/**
 * NOVAMIND Neural-Safe Application Hook
 * useClinicalContext - Quantum-level hook for clinical data integration
 * with neuropsychiatric precision and HIPAA compliance
 */

import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Domain types
import type { RiskAssessment } from "@domain/types/clinical/risk"; // Already type-only
import type { TreatmentResponsePrediction } from "@domain/types/clinical/treatment"; // Already type-only
// Use relative path as alias seems problematic in tests for this file
import { type Result, success, failure } from "../../domain/types/shared/common"; // Removed unused SafeArray

// Domain models
import type {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
  TreatmentNeuralMapping, // Already type-only
} from "@domain/models/brain/mapping/brain-mapping";

// Application services
import { clinicalService } from "@application/services/clinical/clinical.service"; // Corrected path from previous step

/**
 * Hook return type with neural-safe typing
 */
interface UseClinicalContextReturn {
  // Neural mapping data
  symptomMappings: SymptomNeuralMapping[];
  diagnosisMappings: DiagnosisNeuralMapping[];
  treatmentMappings: TreatmentNeuralMapping[];

  // Clinical predictions
  riskAssessment: RiskAssessment | null;
  treatmentPredictions: TreatmentResponsePrediction[];

  // State
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Methods
  refreshClinicalData: (patientId: string) => Promise<void>;
  fetchSymptomMappings: () => Promise<Result<SymptomNeuralMapping[]>>;
  fetchDiagnosisMappings: () => Promise<Result<DiagnosisNeuralMapping[]>>;
  fetchTreatmentMappings: () => Promise<Result<TreatmentNeuralMapping[]>>;
  fetchRiskAssessment: (patientId: string) => Promise<Result<RiskAssessment>>;
  fetchTreatmentPredictions: (
    patientId: string,
  ) => Promise<Result<TreatmentResponsePrediction[]>>;
}

/**
 * useClinicalContext - Application hook for comprehensive clinical context
 * Implements neural-mapping and clinical prediction with psychiatric precision
 */
export function useClinicalContext(
  patientId?: string,
): UseClinicalContextReturn {
  // QueryClient for React Query
  const queryClient = useQueryClient();

  // Query keys
  const symptomMappingsKey = "symptomMappings";
  const diagnosisMappingsKey = "diagnosisMappings";
  const treatmentMappingsKey = "treatmentMappings";
  const riskAssessmentKey = "riskAssessment";
  const treatmentPredictionsKey = "treatmentPredictions";

  // Fetch symptom mappings query
  const {
    data: symptomMappings = [],
    isLoading: isSymptomMappingsLoading,
    isError: isSymptomMappingsError,
    error: symptomMappingsError,
    refetch: refetchSymptomMappings,
  } = useQuery<SymptomNeuralMapping[], Error>({
    queryKey: [symptomMappingsKey],
    queryFn: async () => {
      const result = await clinicalService.fetchSymptomMappings();
      if (result.success) {
        return result.value; // Use .value for success case
      } else {
        throw (result as { success: false; error: Error }).error || new Error("Failed to fetch symptom mappings"); // Use .error for failure case
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - these change infrequently
    refetchOnWindowFocus: false,
    initialData: [], // Explicitly set initial data
  });

  // Fetch diagnosis mappings query
  const {
    data: diagnosisMappings = [],
    isLoading: isDiagnosisMappingsLoading,
    isError: isDiagnosisMappingsError,
    error: diagnosisMappingsError,
    refetch: refetchDiagnosisMappings,
  } = useQuery<DiagnosisNeuralMapping[], Error>({
    queryKey: [diagnosisMappingsKey],
    queryFn: async () => {
      const result = await clinicalService.fetchDiagnosisMappings();
      if (result.success) {
        return result.value; // Use .value for success case
      } else {
        throw (result as { success: false; error: Error }).error || new Error("Failed to fetch diagnosis mappings"); // Use .error for failure case
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - these change infrequently
    refetchOnWindowFocus: false,
    initialData: [], // Explicitly set initial data
  });

  // Fetch treatment mappings query
  const {
    data: treatmentMappings = [],
    isLoading: isTreatmentMappingsLoading,
    isError: isTreatmentMappingsError,
    error: treatmentMappingsError,
    refetch: refetchTreatmentMappings,
  } = useQuery<TreatmentNeuralMapping[], Error>({
    queryKey: [treatmentMappingsKey],
    queryFn: async () => {
      const result = await clinicalService.fetchTreatmentMappings();
      if (result.success) {
        return result.value; // Use .value for success case
      } else {
        throw (result as { success: false; error: Error }).error || new Error("Failed to fetch treatment mappings"); // Use .error for failure case
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - these change infrequently
    refetchOnWindowFocus: false,
    initialData: [], // Explicitly set initial data
  });

  // Fetch risk assessment query
  const {
    data: riskAssessment,
    isLoading: isRiskAssessmentLoading,
    isError: isRiskAssessmentError,
    error: riskAssessmentError,
    refetch: refetchRiskAssessment,
  } = useQuery<RiskAssessment, Error>({
    queryKey: [riskAssessmentKey, patientId],
    queryFn: async () => {
      if (!patientId) {
        // Returning null or undefined might be better than throwing here
        // depending on how loading/error states are handled downstream.
        // Throwing will put the query in an error state.
        throw new Error("No patient ID provided for risk assessment");
      }
      const result = await clinicalService.fetchRiskAssessment(patientId);
      if (result.success) {
        return result.value; // Use .value for success case
      } else {
        throw (result as { success: false; error: Error }).error || new Error("Failed to fetch risk assessment"); // Use .error for failure case
      }
    },
    enabled: !!patientId, // Only run query if patientId exists
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    // initialData for non-array types might need careful consideration
    // initialData: undefined, // Or a default RiskAssessment structure if appropriate
  });

  // Fetch treatment predictions query
  const {
    data: treatmentPredictions = [],
    isLoading: isTreatmentPredictionsLoading,
    isError: isTreatmentPredictionsError,
    error: treatmentPredictionsError,
    refetch: refetchTreatmentPredictions,
  } = useQuery<TreatmentResponsePrediction[], Error>({
    queryKey: [treatmentPredictionsKey, patientId],
    queryFn: async () => {
      if (!patientId) {
        // As above, consider return vs throw based on desired state handling
        throw new Error("No patient ID provided for treatment predictions");
      }
      const result = await clinicalService.fetchTreatmentPredictions(patientId);
      if (result.success) {
        return result.value; // Use .value for success case
      } else {
        throw (
          (result as { success: false; error: Error }).error || new Error("Failed to fetch treatment predictions") // Use .error for failure case
        );
      }
    },
    enabled: !!patientId, // Only run query if patientId exists
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    initialData: [], // Explicitly set initial data for array types
  });

  // Refresh all clinical data for a patient
  const refreshClinicalData = useCallback(
    async (patientId: string) => {
      await Promise.all([
        refetchSymptomMappings(),
        refetchDiagnosisMappings(),
        refetchTreatmentMappings(),
        patientId ? refetchRiskAssessment() : Promise.resolve(),
        patientId ? refetchTreatmentPredictions() : Promise.resolve(),
      ]);
    },
    [
      refetchSymptomMappings,
      refetchDiagnosisMappings,
      refetchTreatmentMappings,
      refetchRiskAssessment,
      refetchTreatmentPredictions,
    ],
  );

  // Explicit fetch methods for individual data types
  const fetchSymptomMappings = useCallback(async (): Promise<
    Result<SymptomNeuralMapping[]>
  > => {
    try {
      const result = await clinicalService.fetchSymptomMappings();

      if (result.success) {
        queryClient.setQueryData([symptomMappingsKey], result.value); // Use .value
        return success(result.value); // Use .value
      } else {
        return failure(
          (result as { success: false; error: Error }).error || new Error("Failed to fetch symptom mappings"), // Use .error
        );
      }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Unknown error fetching symptom mappings");
      return failure(error);
    }
  }, [queryClient]);

  const fetchDiagnosisMappings = useCallback(async (): Promise<
    Result<DiagnosisNeuralMapping[]>
  > => {
    try {
      const result = await clinicalService.fetchDiagnosisMappings();

      if (result.success) {
        queryClient.setQueryData([diagnosisMappingsKey], result.value); // Use .value
        return success(result.value); // Use .value
      } else {
        return failure(
          (result as { success: false; error: Error }).error || new Error("Failed to fetch diagnosis mappings"), // Use .error
        );
      }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Unknown error fetching diagnosis mappings");
      return failure(error);
    }
  }, [queryClient]);

  const fetchTreatmentMappings = useCallback(async (): Promise<
    Result<TreatmentNeuralMapping[]>
  > => {
    try {
      const result = await clinicalService.fetchTreatmentMappings();

      if (result.success) {
        queryClient.setQueryData([treatmentMappingsKey], result.value); // Use .value
        return success(result.value); // Use .value
      } else {
        return failure(
          (result as { success: false; error: Error }).error || new Error("Failed to fetch treatment mappings"), // Use .error
        );
      }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Unknown error fetching treatment mappings");
      return failure(error);
    }
  }, [queryClient]);

  const fetchRiskAssessment = useCallback(
    async (patientId: string): Promise<Result<RiskAssessment>> => {
      try {
        const result = await clinicalService.fetchRiskAssessment(patientId);

        if (result.success) {
          queryClient.setQueryData([riskAssessmentKey, patientId], result.value); // Use .value
          return success(result.value); // Use .value
        } else {
          return failure(
            (result as { success: false; error: Error }).error || new Error("Failed to fetch risk assessment"), // Use .error
          );
        }
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Unknown error fetching risk assessment");
        return failure(error);
      }
    },
    [queryClient],
  );

  const fetchTreatmentPredictions = useCallback(
    async (
      patientId: string,
    ): Promise<Result<TreatmentResponsePrediction[]>> => {
      try {
        const result =
          await clinicalService.fetchTreatmentPredictions(patientId);

        if (result.success) {
          queryClient.setQueryData(
            [treatmentPredictionsKey, patientId],
            result.value, // Use .value
          );
          return success(result.value); // Use .value
        } else {
          return failure(
            (result as { success: false; error: Error }).error || new Error("Failed to fetch treatment predictions"), // Use .error
          );
        }
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Unknown error fetching treatment predictions");
        return failure(error);
      }
    },
    [queryClient],
  );

  // Combine loading states
  const isLoading =
    isSymptomMappingsLoading ||
    isDiagnosisMappingsLoading ||
    isTreatmentMappingsLoading ||
    isRiskAssessmentLoading ||
    isTreatmentPredictionsLoading;

  // Combine error states
  const isError =
    isSymptomMappingsError ||
    isDiagnosisMappingsError ||
    isTreatmentMappingsError ||
    isRiskAssessmentError ||
    isTreatmentPredictionsError;

  // Combine errors
  const error =
    symptomMappingsError ||
    diagnosisMappingsError ||
    treatmentMappingsError ||
    riskAssessmentError ||
    treatmentPredictionsError;

  return {
    // Neural mapping data
    symptomMappings,
    diagnosisMappings,
    treatmentMappings,

    // Clinical predictions
    riskAssessment: riskAssessment || null,
    treatmentPredictions,

    // State
    isLoading,
    isError,
    error,

    // Methods
    refreshClinicalData,
    fetchSymptomMappings,
    fetchDiagnosisMappings,
    fetchTreatmentMappings,
    fetchRiskAssessment,
    fetchTreatmentPredictions,
  };
}

/**
 * NOVAMIND Neural-Safe Application Hook
 * useClinicalContext - Quantum-level hook for clinical data integration
 * with neuropsychiatric precision and HIPAA compliance
 */

import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Domain types
import { RiskAssessment } from "@domain/types/clinical/risk";
import { TreatmentResponsePrediction } from "@domain/types/clinical/treatment";
import { Result, success, failure, SafeArray } from "@domain/types/common";

// Domain models
import {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
  TreatmentNeuralMapping,
} from "@domain/models/brainMapping";

// Application services
import { clinicalService } from "@application/services/clinicalService";

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
  } = useQuery<SymptomNeuralMapping[], Error>(
    [symptomMappingsKey],
    async () => {
      const result = await clinicalService.fetchSymptomMappings();

      if (result.success) {
        return result.data;
      } else {
        throw result.error || new Error("Failed to fetch symptom mappings");
      }
    },
    {
      staleTime: 24 * 60 * 60 * 1000, // 24 hours - these change infrequently
      refetchOnWindowFocus: false,
    },
  );

  // Fetch diagnosis mappings query
  const {
    data: diagnosisMappings = [],
    isLoading: isDiagnosisMappingsLoading,
    isError: isDiagnosisMappingsError,
    error: diagnosisMappingsError,
    refetch: refetchDiagnosisMappings,
  } = useQuery<DiagnosisNeuralMapping[], Error>(
    [diagnosisMappingsKey],
    async () => {
      const result = await clinicalService.fetchDiagnosisMappings();

      if (result.success) {
        return result.data;
      } else {
        throw result.error || new Error("Failed to fetch diagnosis mappings");
      }
    },
    {
      staleTime: 24 * 60 * 60 * 1000, // 24 hours - these change infrequently
      refetchOnWindowFocus: false,
    },
  );

  // Fetch treatment mappings query
  const {
    data: treatmentMappings = [],
    isLoading: isTreatmentMappingsLoading,
    isError: isTreatmentMappingsError,
    error: treatmentMappingsError,
    refetch: refetchTreatmentMappings,
  } = useQuery<TreatmentNeuralMapping[], Error>(
    [treatmentMappingsKey],
    async () => {
      const result = await clinicalService.fetchTreatmentMappings();

      if (result.success) {
        return result.data;
      } else {
        throw result.error || new Error("Failed to fetch treatment mappings");
      }
    },
    {
      staleTime: 24 * 60 * 60 * 1000, // 24 hours - these change infrequently
      refetchOnWindowFocus: false,
    },
  );

  // Fetch risk assessment query
  const {
    data: riskAssessment,
    isLoading: isRiskAssessmentLoading,
    isError: isRiskAssessmentError,
    error: riskAssessmentError,
    refetch: refetchRiskAssessment,
  } = useQuery<RiskAssessment, Error>(
    [riskAssessmentKey, patientId],
    async () => {
      if (!patientId) {
        throw new Error("No patient ID provided for risk assessment");
      }

      const result = await clinicalService.fetchRiskAssessment(patientId);

      if (result.success) {
        return result.data;
      } else {
        throw result.error || new Error("Failed to fetch risk assessment");
      }
    },
    {
      enabled: !!patientId,
      staleTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
    },
  );

  // Fetch treatment predictions query
  const {
    data: treatmentPredictions = [],
    isLoading: isTreatmentPredictionsLoading,
    isError: isTreatmentPredictionsError,
    error: treatmentPredictionsError,
    refetch: refetchTreatmentPredictions,
  } = useQuery<TreatmentResponsePrediction[], Error>(
    [treatmentPredictionsKey, patientId],
    async () => {
      if (!patientId) {
        throw new Error("No patient ID provided for treatment predictions");
      }

      const result = await clinicalService.fetchTreatmentPredictions(patientId);

      if (result.success) {
        return result.data;
      } else {
        throw (
          result.error || new Error("Failed to fetch treatment predictions")
        );
      }
    },
    {
      enabled: !!patientId,
      staleTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
    },
  );

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
        queryClient.setQueryData([symptomMappingsKey], result.data);
        return success(result.data);
      } else {
        return failure(
          result.error || new Error("Failed to fetch symptom mappings"),
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
        queryClient.setQueryData([diagnosisMappingsKey], result.data);
        return success(result.data);
      } else {
        return failure(
          result.error || new Error("Failed to fetch diagnosis mappings"),
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
        queryClient.setQueryData([treatmentMappingsKey], result.data);
        return success(result.data);
      } else {
        return failure(
          result.error || new Error("Failed to fetch treatment mappings"),
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
          queryClient.setQueryData([riskAssessmentKey, patientId], result.data);
          return success(result.data);
        } else {
          return failure(
            result.error || new Error("Failed to fetch risk assessment"),
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
            result.data,
          );
          return success(result.data);
        } else {
          return failure(
            result.error || new Error("Failed to fetch treatment predictions"),
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

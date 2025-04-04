/**
 * NOVAMIND Neural-Safe Application Hook
 * usePatientData - Quantum-level hook for patient clinical data
 * with HIPAA-compliant data handling
 */

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Domain types
import { Patient, Symptom, Diagnosis } from "@domain/types/clinical/patient";
import { Result, success, failure, SafeArray } from "@domain/types/common";

// Application services
import { patientService } from "@application/services/patientService";

/**
 * Hook return type with discriminated union for type safety
 */
interface UsePatientDataReturn {
  // Data
  patient: Patient | null;
  symptoms: Symptom[];
  diagnoses: Diagnosis[];

  // State
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Methods
  fetchPatientData: (patientId: string) => Promise<Result<Patient>>;
  updateSymptomSeverity: (symptomId: string, severity: number) => void;
  addSymptom: (symptom: Omit<Symptom, "id">) => void;
  removeSymptom: (symptomId: string) => void;
  reset: () => void;
}

/**
 * usePatientData - Application hook for patient clinical data management
 * Implements HIPAA-compliant patterns for clinical data operations
 */
export function usePatientData(
  initialPatientId?: string,
): UsePatientDataReturn {
  // QueryClient for React Query
  const queryClient = useQueryClient();

  // Query keys
  const patientQueryKey = "patientData";

  // Fetch patient data query
  const {
    data: patient,
    isLoading: isPatientLoading,
    isError: isPatientError,
    error: patientError,
    refetch,
  } = useQuery<Patient, Error>(
    [patientQueryKey, initialPatientId],
    async () => {
      if (!initialPatientId) {
        throw new Error("No patient ID provided");
      }

      // Check for cached data
      const cachedPatient = queryClient.getQueryData<Patient>([
        patientQueryKey,
        initialPatientId,
      ]);
      if (cachedPatient) {
        return cachedPatient;
      }

      // Fetch from service
      const result = await patientService.fetchPatient(initialPatientId);

      if (result.success) {
        return result.data;
      } else {
        throw result.error || new Error("Failed to fetch patient data");
      }
    },
    {
      // Don't fetch on mount if no ID is provided
      enabled: !!initialPatientId,
      // Retry configuration
      retry: 1,
      // Don't refetch automatically
      refetchOnWindowFocus: false,
    },
  );

  // Derived state
  const symptoms = patient?.clinicalData?.symptoms || [];
  const diagnoses = patient?.clinicalData?.diagnoses || [];

  // Fetch patient data explicitly
  const fetchPatientData = useCallback(
    async (patientId: string): Promise<Result<Patient>> => {
      try {
        const result = await patientService.fetchPatient(patientId);

        if (result.success) {
          // Update cache
          queryClient.setQueryData([patientQueryKey, patientId], result.data);

          // If this is a different patient than the current one, trigger refetch
          if (initialPatientId !== patientId) {
            queryClient.invalidateQueries([patientQueryKey]);
          }

          return success(result.data);
        } else {
          return failure(
            result.error || new Error("Failed to fetch patient data"),
          );
        }
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Unknown error fetching patient data");
        return failure(error);
      }
    },
    [queryClient, initialPatientId],
  );

  // Update symptom severity mutation
  const updateSymptomSeverityMutation = useMutation<
    Patient,
    Error,
    { symptomId: string; severity: number }
  >(
    async ({ symptomId, severity }) => {
      // Validate inputs
      if (!patient) {
        throw new Error("No patient data loaded");
      }

      if (severity < 0 || severity > 10) {
        throw new Error("Symptom severity must be between 0 and 10");
      }

      // Create a deep copy to avoid mutation
      const updatedPatient: Patient = JSON.parse(JSON.stringify(patient));

      // Ensure clinicalData and symptoms exist
      if (!updatedPatient.clinicalData) {
        updatedPatient.clinicalData = {
          diagnoses: [],
          symptoms: [],
          medications: [],
          psychometricAssessments: [],
          medicalHistory: [],
        };
      }

      if (!updatedPatient.clinicalData.symptoms) {
        updatedPatient.clinicalData.symptoms = [];
      }

      // Find and update the symptom
      const symptomIndex = updatedPatient.clinicalData.symptoms.findIndex(
        (s) => s.id === symptomId,
      );
      if (symptomIndex === -1) {
        throw new Error(`Symptom with ID ${symptomId} not found`);
      }

      // Update severity
      updatedPatient.clinicalData.symptoms[symptomIndex].severity = severity;

      // Update impact based on severity (clinical logic)
      if (severity >= 8) {
        updatedPatient.clinicalData.symptoms[symptomIndex].impact = "severe";
      } else if (severity >= 5) {
        updatedPatient.clinicalData.symptoms[symptomIndex].impact = "moderate";
      } else if (severity >= 3) {
        updatedPatient.clinicalData.symptoms[symptomIndex].impact = "mild";
      } else {
        updatedPatient.clinicalData.symptoms[symptomIndex].impact = "none";
      }

      // In a real application, this would call the API
      // For now, just return the updated patient
      return updatedPatient;
    },
    {
      onSuccess: (updatedPatient) => {
        // Update cache if patient ID is available
        if (patient?.id) {
          queryClient.setQueryData(
            [patientQueryKey, patient.id],
            updatedPatient,
          );
        }
      },
    },
  );

  // Add symptom mutation
  const addSymptomMutation = useMutation<Patient, Error, Omit<Symptom, "id">>(
    async (symptomData) => {
      // Validate inputs
      if (!patient) {
        throw new Error("No patient data loaded");
      }

      // Create a deep copy to avoid mutation
      const updatedPatient: Patient = JSON.parse(JSON.stringify(patient));

      // Ensure clinicalData and symptoms exist
      if (!updatedPatient.clinicalData) {
        updatedPatient.clinicalData = {
          diagnoses: [],
          symptoms: [],
          medications: [],
          psychometricAssessments: [],
          medicalHistory: [],
        };
      }

      if (!updatedPatient.clinicalData.symptoms) {
        updatedPatient.clinicalData.symptoms = [];
      }

      // Create new symptom with ID
      const newSymptom: Symptom = {
        ...symptomData,
        id: `sym_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // Generate temporary ID
      };

      // Add to symptoms
      updatedPatient.clinicalData.symptoms.push(newSymptom);

      // In a real application, this would call the API
      // For now, just return the updated patient
      return updatedPatient;
    },
    {
      onSuccess: (updatedPatient) => {
        // Update cache if patient ID is available
        if (patient?.id) {
          queryClient.setQueryData(
            [patientQueryKey, patient.id],
            updatedPatient,
          );
        }
      },
    },
  );

  // Remove symptom mutation
  const removeSymptomMutation = useMutation<
    Patient,
    Error,
    string // symptomId
  >(
    async (symptomId) => {
      // Validate inputs
      if (!patient) {
        throw new Error("No patient data loaded");
      }

      // Create a deep copy to avoid mutation
      const updatedPatient: Patient = JSON.parse(JSON.stringify(patient));

      // Ensure clinicalData and symptoms exist
      if (!updatedPatient.clinicalData?.symptoms) {
        throw new Error("No symptoms data found");
      }

      // Find symptom index
      const symptomIndex = updatedPatient.clinicalData.symptoms.findIndex(
        (s) => s.id === symptomId,
      );
      if (symptomIndex === -1) {
        throw new Error(`Symptom with ID ${symptomId} not found`);
      }

      // Remove symptom
      updatedPatient.clinicalData.symptoms.splice(symptomIndex, 1);

      // In a real application, this would call the API
      // For now, just return the updated patient
      return updatedPatient;
    },
    {
      onSuccess: (updatedPatient) => {
        // Update cache if patient ID is available
        if (patient?.id) {
          queryClient.setQueryData(
            [patientQueryKey, patient.id],
            updatedPatient,
          );
        }
      },
    },
  );

  // Update symptom severity
  const updateSymptomSeverity = useCallback(
    (symptomId: string, severity: number) => {
      updateSymptomSeverityMutation.mutate({ symptomId, severity });
    },
    [updateSymptomSeverityMutation],
  );

  // Add symptom
  const addSymptom = useCallback(
    (symptom: Omit<Symptom, "id">) => {
      addSymptomMutation.mutate(symptom);
    },
    [addSymptomMutation],
  );

  // Remove symptom
  const removeSymptom = useCallback(
    (symptomId: string) => {
      removeSymptomMutation.mutate(symptomId);
    },
    [removeSymptomMutation],
  );

  // Reset hook state
  const reset = useCallback(() => {
    if (initialPatientId) {
      queryClient.removeQueries([patientQueryKey, initialPatientId]);
    }
  }, [queryClient, initialPatientId]);

  // Combine loading states
  const isLoading =
    isPatientLoading ||
    updateSymptomSeverityMutation.isLoading ||
    addSymptomMutation.isLoading ||
    removeSymptomMutation.isLoading;

  // Combine error states
  const isError =
    isPatientError ||
    updateSymptomSeverityMutation.isError ||
    addSymptomMutation.isError ||
    removeSymptomMutation.isError;

  // Combine errors
  const error =
    patientError ||
    updateSymptomSeverityMutation.error ||
    addSymptomMutation.error ||
    removeSymptomMutation.error;

  return {
    // Data
    patient,
    symptoms,
    diagnoses,

    // State
    isLoading,
    isError,
    error,

    // Methods
    fetchPatientData,
    updateSymptomSeverity,
    addSymptom,
    removeSymptom,
    reset,
  };
}

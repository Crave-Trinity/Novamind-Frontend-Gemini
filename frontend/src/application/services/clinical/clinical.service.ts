/**
 * NOVAMIND Neural-Safe Application Service
 * ClinicalService - Quantum-level service for clinical data operations
 * with HIPAA compliance and psychiatric precision
 */

import axios from "axios";
import { Result, success, failure, SafeArray } from "@types/shared/common";
import {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
  TreatmentNeuralMapping,
} from "@models/brain/mapping/brain-mapping";
import { RiskAssessment, RiskLevel } from "@types/clinical/risk";
import { TreatmentResponsePrediction } from "@types/clinical/treatment";
import { Symptom, Diagnosis, Treatment } from "@types/clinical/patient";

// API endpoints
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.novamind.io";
const CLINICAL_ENDPOINT = `${API_BASE_URL}/v1/clinical`;

/**
 * Clinical Service
 * Implements neural-safe API interactions with HIPAA compliance
 */
export const clinicalService = {
  /**
   * Fetch neural mappings for symptoms
   */
  fetchSymptomMappings: async (): Promise<Result<SymptomNeuralMapping[]>> => {
    try {
      // API request with timeout and error handling
      const response = await axios.get<SymptomNeuralMapping[]>(
        `${CLINICAL_ENDPOINT}/mappings/symptoms`,
        {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Successful response
      return success(response.data);
    } catch (error) {
      // Handle API errors with precise error messages
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server returned an error response
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 403:
              return failure(
                new Error(
                  "Insufficient permissions to access symptom mappings",
                ),
              );
            case 500:
              return failure(
                new Error("Server error while retrieving symptom mappings"),
              );
            default:
              return failure(new Error(data.message || `API error: ${status}`));
          }
        } else if (error.request) {
          // Request was made but no response received
          return failure(
            new Error(
              "No response received from server. Please check your network connection.",
            ),
          );
        } else {
          // Error setting up the request
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to fetch symptom mappings: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  /**
   * Fetch neural mappings for diagnoses
   */
  fetchDiagnosisMappings: async (): Promise<
    Result<DiagnosisNeuralMapping[]>
  > => {
    try {
      // API request with timeout and error handling
      const response = await axios.get<DiagnosisNeuralMapping[]>(
        `${CLINICAL_ENDPOINT}/mappings/diagnoses`,
        {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Successful response
      return success(response.data);
    } catch (error) {
      // Handle API errors with precise error messages
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server returned an error response
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 403:
              return failure(
                new Error(
                  "Insufficient permissions to access diagnosis mappings",
                ),
              );
            case 500:
              return failure(
                new Error("Server error while retrieving diagnosis mappings"),
              );
            default:
              return failure(new Error(data.message || `API error: ${status}`));
          }
        } else if (error.request) {
          // Request was made but no response received
          return failure(
            new Error(
              "No response received from server. Please check your network connection.",
            ),
          );
        } else {
          // Error setting up the request
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to fetch diagnosis mappings: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  /**
   * Fetch neural mappings for treatments
   */
  fetchTreatmentMappings: async (): Promise<
    Result<TreatmentNeuralMapping[]>
  > => {
    try {
      // API request with timeout and error handling
      const response = await axios.get<TreatmentNeuralMapping[]>(
        `${CLINICAL_ENDPOINT}/mappings/treatments`,
        {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Successful response
      return success(response.data);
    } catch (error) {
      // Handle API errors with precise error messages
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server returned an error response
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 403:
              return failure(
                new Error(
                  "Insufficient permissions to access treatment mappings",
                ),
              );
            case 500:
              return failure(
                new Error("Server error while retrieving treatment mappings"),
              );
            default:
              return failure(new Error(data.message || `API error: ${status}`));
          }
        } else if (error.request) {
          // Request was made but no response received
          return failure(
            new Error(
              "No response received from server. Please check your network connection.",
            ),
          );
        } else {
          // Error setting up the request
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to fetch treatment mappings: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  /**
   * Fetch risk assessment for a patient
   * HIPAA-compliant with secure PHI handling
   */
  fetchRiskAssessment: async (
    patientId: string,
  ): Promise<Result<RiskAssessment>> => {
    try {
      // API request with timeout and error handling
      const response = await axios.get<RiskAssessment>(
        `${CLINICAL_ENDPOINT}/patients/${patientId}/risk-assessment`,
        {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Successful response
      return success(response.data);
    } catch (error) {
      // Handle API errors with precise error messages
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server returned an error response
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 404:
              return failure(
                new Error(`Patient with ID ${patientId} not found`),
              );
            case 403:
              return failure(
                new Error(
                  "Insufficient permissions to access risk assessment data",
                ),
              );
            case 500:
              return failure(
                new Error("Server error while retrieving risk assessment"),
              );
            default:
              return failure(new Error(data.message || `API error: ${status}`));
          }
        } else if (error.request) {
          // Request was made but no response received
          return failure(
            new Error(
              "No response received from server. Please check your network connection.",
            ),
          );
        } else {
          // Error setting up the request
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to fetch risk assessment: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  /**
   * Fetch treatment predictions for a patient
   * HIPAA-compliant with secure PHI handling
   */
  fetchTreatmentPredictions: async (
    patientId: string,
  ): Promise<Result<TreatmentResponsePrediction[]>> => {
    try {
      // API request with timeout and error handling
      const response = await axios.get<TreatmentResponsePrediction[]>(
        `${CLINICAL_ENDPOINT}/patients/${patientId}/treatment-predictions`,
        {
          timeout: 15000, // Longer timeout for complex predictions
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Successful response
      return success(response.data);
    } catch (error) {
      // Handle API errors with precise error messages
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server returned an error response
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 404:
              return failure(
                new Error(`Patient with ID ${patientId} not found`),
              );
            case 403:
              return failure(
                new Error(
                  "Insufficient permissions to access treatment prediction data",
                ),
              );
            case 500:
              return failure(
                new Error(
                  "Server error while retrieving treatment predictions",
                ),
              );
            default:
              return failure(new Error(data.message || `API error: ${status}`));
          }
        } else if (error.request) {
          // Request was made but no response received
          return failure(
            new Error(
              "No response received from server. Please check your network connection.",
            ),
          );
        } else {
          // Error setting up the request
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to fetch treatment predictions: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  /**
   * Fetch symptoms for a patient
   * HIPAA-compliant with secure PHI handling
   */
  fetchPatientSymptoms: async (
    patientId: string,
  ): Promise<Result<Symptom[]>> => {
    try {
      // API request with timeout and error handling
      const response = await axios.get<Symptom[]>(
        `${CLINICAL_ENDPOINT}/patients/${patientId}/symptoms`,
        {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Successful response
      return success(response.data);
    } catch (error) {
      // Handle API errors with precise error messages
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server returned an error response
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 404:
              return failure(
                new Error(`Patient with ID ${patientId} not found`),
              );
            case 403:
              return failure(
                new Error(
                  "Insufficient permissions to access patient symptom data",
                ),
              );
            case 500:
              return failure(
                new Error("Server error while retrieving patient symptoms"),
              );
            default:
              return failure(new Error(data.message || `API error: ${status}`));
          }
        } else if (error.request) {
          // Request was made but no response received
          return failure(
            new Error(
              "No response received from server. Please check your network connection.",
            ),
          );
        } else {
          // Error setting up the request
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to fetch patient symptoms: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  /**
   * Fetch diagnoses for a patient
   * HIPAA-compliant with secure PHI handling
   */
  fetchPatientDiagnoses: async (
    patientId: string,
  ): Promise<Result<Diagnosis[]>> => {
    try {
      // API request with timeout and error handling
      const response = await axios.get<Diagnosis[]>(
        `${CLINICAL_ENDPOINT}/patients/${patientId}/diagnoses`,
        {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Successful response
      return success(response.data);
    } catch (error) {
      // Handle API errors with precise error messages
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server returned an error response
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 404:
              return failure(
                new Error(`Patient with ID ${patientId} not found`),
              );
            case 403:
              return failure(
                new Error(
                  "Insufficient permissions to access patient diagnosis data",
                ),
              );
            case 500:
              return failure(
                new Error("Server error while retrieving patient diagnoses"),
              );
            default:
              return failure(new Error(data.message || `API error: ${status}`));
          }
        } else if (error.request) {
          // Request was made but no response received
          return failure(
            new Error(
              "No response received from server. Please check your network connection.",
            ),
          );
        } else {
          // Error setting up the request
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to fetch patient diagnoses: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  /**
   * Fetch treatments for a patient
   * HIPAA-compliant with secure PHI handling
   */
  fetchPatientTreatments: async (
    patientId: string,
  ): Promise<Result<Treatment[]>> => {
    try {
      // API request with timeout and error handling
      const response = await axios.get<Treatment[]>(
        `${CLINICAL_ENDPOINT}/patients/${patientId}/treatments`,
        {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Successful response
      return success(response.data);
    } catch (error) {
      // Handle API errors with precise error messages
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server returned an error response
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 404:
              return failure(
                new Error(`Patient with ID ${patientId} not found`),
              );
            case 403:
              return failure(
                new Error(
                  "Insufficient permissions to access patient treatment data",
                ),
              );
            case 500:
              return failure(
                new Error("Server error while retrieving patient treatments"),
              );
            default:
              return failure(new Error(data.message || `API error: ${status}`));
          }
        } else if (error.request) {
          // Request was made but no response received
          return failure(
            new Error(
              "No response received from server. Please check your network connection.",
            ),
          );
        } else {
          // Error setting up the request
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to fetch patient treatments: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  /**
   * Update patient symptom
   * HIPAA-compliant with secure PHI handling
   */
  updateSymptom: async (
    patientId: string,
    symptomId: string,
    updates: Partial<Symptom>,
  ): Promise<Result<Symptom>> => {
    try {
      // API request with timeout and error handling
      const response = await axios.patch<Symptom>(
        `${CLINICAL_ENDPOINT}/patients/${patientId}/symptoms/${symptomId}`,
        updates,
        {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Successful response
      return success(response.data);
    } catch (error) {
      // Handle API errors with precise error messages
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server returned an error response
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 404:
              return failure(new Error(`Patient or symptom not found`));
            case 400:
              return failure(
                new Error(`Invalid symptom update: ${data.message}`),
              );
            case 403:
              return failure(
                new Error("Insufficient permissions to update patient symptom"),
              );
            case 500:
              return failure(new Error("Server error while updating symptom"));
            default:
              return failure(new Error(data.message || `API error: ${status}`));
          }
        } else if (error.request) {
          // Request was made but no response received
          return failure(
            new Error(
              "No response received from server. Please check your network connection.",
            ),
          );
        } else {
          // Error setting up the request
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to update symptom: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  /**
   * Generate a predictive algorithm explanation for clinical transparency
   */
  generateAlgorithmExplanation: async (
    predictionId: string,
    detailLevel: "basic" | "detailed" | "technical" = "detailed",
  ): Promise<
    Result<{
      algorithmName: string;
      description: string;
      factorsConsidered: string[];
      confidenceLevel: number;
      limitations: string[];
      references: string[];
    }>
  > => {
    try {
      // API request
      const response = await axios.get<{
        algorithmName: string;
        description: string;
        factorsConsidered: string[];
        confidenceLevel: number;
        limitations: string[];
        references: string[];
      }>(`${CLINICAL_ENDPOINT}/predictions/${predictionId}/explanation`, {
        params: { detailLevel },
        timeout: 15000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      // Successful response
      return success(response.data);
    } catch (error) {
      // Handle API errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 404:
              return failure(
                new Error(`Prediction with ID ${predictionId} not found`),
              );
            case 400:
              return failure(
                new Error(`Invalid explanation request: ${data.message}`),
              );
            case 403:
              return failure(
                new Error(
                  "Insufficient permissions to access algorithm explanation",
                ),
              );
            case 500:
              return failure(
                new Error("Server error while generating explanation"),
              );
            default:
              return failure(new Error(data.message || `API error: ${status}`));
          }
        } else if (error.request) {
          return failure(
            new Error(
              "No response received from server. Please check your network connection.",
            ),
          );
        } else {
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to generate algorithm explanation: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  /**
   * Generate temporal projections for treatment outcomes
   */
  generateTemporalProjections: async (
    patientId: string,
    treatmentIds: string[],
    projectionDuration: number, // in days
  ): Promise<
    Result<{
      projectionId: string;
      timeSeries: Array<{
        dayOffset: number;
        date: string;
        metrics: Record<string, number>;
        confidenceIntervals: Record<string, [number, number]>;
      }>;
    }>
  > => {
    try {
      // API request
      const response = await axios.post<{
        projectionId: string;
        timeSeries: Array<{
          dayOffset: number;
          date: string;
          metrics: Record<string, number>;
          confidenceIntervals: Record<string, [number, number]>;
        }>;
      }>(
        `${CLINICAL_ENDPOINT}/patients/${patientId}/temporal-projections`,
        {
          treatmentIds,
          projectionDuration,
        },
        {
          timeout: 20000, // 20 seconds timeout for complex projections
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Successful response
      return success(response.data);
    } catch (error) {
      // Handle API errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 404:
              return failure(
                new Error(`Patient with ID ${patientId} not found`),
              );
            case 400:
              return failure(
                new Error(`Invalid projection request: ${data.message}`),
              );
            case 403:
              return failure(
                new Error(
                  "Insufficient permissions to generate temporal projections",
                ),
              );
            case 500:
              return failure(
                new Error("Server error while generating projections"),
              );
            default:
              return failure(new Error(data.message || `API error: ${status}`));
          }
        } else if (error.request) {
          return failure(
            new Error(
              "No response received from server. Please check your network connection.",
            ),
          );
        } else {
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to generate temporal projections: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },
};

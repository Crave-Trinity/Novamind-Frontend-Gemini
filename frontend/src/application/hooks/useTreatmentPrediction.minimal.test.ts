/**
 * NOVAMIND Testing Framework
 * useTreatmentPrediction Hook Tests
 *
 * Tests for the useTreatmentPrediction hook with TypeScript type safety
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTreatmentPrediction } from "./useTreatmentPrediction";
import {
  xgboostService,
  TreatmentResponseResponse,
} from "../../infrastructure/api/XGBoostService";

// Mock the react-query hooks
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useMutation: vi.fn(({ mutationFn, onSuccess, onError }) => ({
    mutate: async (variables: any) => {
      try {
        const result = await mutationFn(variables);
        onSuccess?.(result);
        return result;
      } catch (error) {
        onError?.(error);
        throw error;
      }
    },
    isPending: false,
    error: null,
    data: null,
    reset: vi.fn(),
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// Mock the XGBoostService
vi.mock("../../infrastructure/api/XGBoostService", () => ({
  xgboostService: {
    predictTreatmentResponse: vi.fn(),
    getFeatureImportance: vi.fn(),
    integrateWithDigitalTwin: vi.fn(),
  },
  // Ensure types are exported for proper TypeScript support
  TreatmentResponseRequest: {},
  TreatmentResponseResponse: {},
}));

describe("useTreatmentPrediction", () => {
  const mockPatientId = "patient-123";
  const mockPredictionId = "prediction-456";
  const mockSuccessCallback = vi.fn();
  const mockErrorCallback = vi.fn();

  const mockClinicalData = {
    severity: "moderate",
    diagnosis: "depression",
    assessment_scores: {
      phq9: 12,
      gad7: 8,
    },
  };

  const mockGeneticData = ["gene1", "gene2"];

  const mockPredictionResponse: TreatmentResponseResponse = {
    prediction_id: mockPredictionId,
    patient_id: mockPatientId,
    treatment_type: "ssri",
    response_probability: 0.75,
    confidence_interval: [0.65, 0.85],
    time_to_response_weeks: 6,
    side_effects_risk: {
      nausea: "low",
      insomnia: "moderate",
      headache: "low",
    },
    recommendations: [
      "Monitor sleep patterns",
      "Weekly check-ins for first month",
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    (xgboostService.predictTreatmentResponse as any).mockResolvedValue(
      mockPredictionResponse,
    );
    (xgboostService.getFeatureImportance as any).mockResolvedValue({
      features: [
        { name: "age", importance: 0.25 },
        { name: "phq9_score", importance: 0.35 },
      ],
    });
  });

  it("initializes with default treatment type", () => {
    const { result } = renderHook(() =>
      useTreatmentPrediction({
        patientId: mockPatientId,
      }),
    );

    expect(result.current.treatmentConfig.treatmentType).toBe("ssri");
    expect(result.current.activePredictionId).toBeNull();
  });

  it("updates treatment configuration", () => {
    const { result } = renderHook(() =>
      useTreatmentPrediction({
        patientId: mockPatientId,
      }),
    );

    act(() => {
      result.current.updateTreatmentConfig({
        treatmentType: "snri",
        details: { dosage: "standard" },
      });
    });

    expect(result.current.treatmentConfig.treatmentType).toBe("snri");
    expect(result.current.treatmentConfig.details).toEqual({
      dosage: "standard",
    });
  });

  it("predicts treatment response with clinical precision", async () => {
    const { result } = renderHook(() =>
      useTreatmentPrediction({
        patientId: mockPatientId,
        onPredictionSuccess: mockSuccessCallback,
        onPredictionError: mockErrorCallback,
      }),
    );

    await act(async () => {
      await result.current.predictTreatmentResponse({
        clinicalData: mockClinicalData,
        geneticData: mockGeneticData,
      });
    });

    // Verify the service was called with correct parameters
    expect(xgboostService.predictTreatmentResponse).toHaveBeenCalledWith({
      patient_id: mockPatientId,
      treatment_type: "ssri",
      treatment_details: {},
      clinical_data: mockClinicalData,
      genetic_data: mockGeneticData,
    });

    // Verify success callback was called
    expect(mockSuccessCallback).toHaveBeenCalledWith(mockPredictionResponse);
  });

  it("handles prediction errors with neural precision", async () => {
    // Setup error case
    const mockError = new Error("Prediction failed");
    (xgboostService.predictTreatmentResponse as any).mockRejectedValue(
      mockError,
    );

    const { result } = renderHook(() =>
      useTreatmentPrediction({
        patientId: mockPatientId,
        onPredictionSuccess: mockSuccessCallback,
        onPredictionError: mockErrorCallback,
      }),
    );

    await act(async () => {
      try {
        await result.current.predictTreatmentResponse({
          clinicalData: mockClinicalData,
        });
      } catch (error) {
        // Expected to throw
      }
    });

    // Verify error callback was called
    expect(mockErrorCallback).toHaveBeenCalledWith(mockError);
    expect(mockSuccessCallback).not.toHaveBeenCalled();
  });

  it("integrates prediction with digital twin profile", async () => {
    const mockProfileId = "profile-789";
    const mockIntegrationResponse = {
      success: true,
      integrated_at: "2025-03-31T12:00:00Z",
    };
    (xgboostService.integrateWithDigitalTwin as any).mockResolvedValue(
      mockIntegrationResponse,
    );

    const { result } = renderHook(() =>
      useTreatmentPrediction({
        patientId: mockPatientId,
      }),
    );

    // First make a prediction to set the activePredictionId
    await act(async () => {
      await result.current.predictTreatmentResponse({
        clinicalData: mockClinicalData,
      });
    });

    // Then integrate with digital twin
    await act(async () => {
      await result.current.integrateWithDigitalTwin(mockProfileId);
    });

    // Verify the service was called with correct parameters
    expect(xgboostService.integrateWithDigitalTwin).toHaveBeenCalledWith({
      patient_id: mockPatientId,
      profile_id: mockProfileId,
      prediction_id: mockPredictionId,
    });
  });
});

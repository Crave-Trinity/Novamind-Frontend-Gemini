/**
 * NOVAMIND Neural Test Suite
 * Clinical Service testing with HIPAA compliance and psychiatric precision
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { clinicalService } from "./clinical.service";
import {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
  TreatmentNeuralMapping,
} from "@domain/models/brainMapping";
import { RiskAssessment } from "@domain/types/clinical/risk";
import { TreatmentResponsePrediction } from "@domain/types/clinical/treatment";
import { Symptom, Diagnosis, Treatment } from "@domain/types/clinical/patient";

// Mock axios for isolated testing
vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Clinical Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchSymptomMappings", () => {
    it("successfully fetches symptom neural mappings", async () => {
      // Arrange
      const mockMappings: SymptomNeuralMapping[] = [
        {
          symptomId: "s1",
          symptomName: "Anxiety",
          brainRegions: ["prefrontal-cortex", "amygdala"],
          connectionTypes: ["inhibitory"],
          mappingConfidence: 0.85,
          mappingSource: "clinical-research-v2",
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockMappings,
        status: 200,
      });

      // Act
      const result = await clinicalService.fetchSymptomMappings();

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockMappings);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/mappings/symptoms"),
        expect.objectContaining({
          timeout: 10000,
        }),
      );
    });

    it("handles API error responses appropriately", async () => {
      // Arrange - Mock a 403 error
      const mockError = {
        response: {
          status: 403,
          data: { message: "Insufficient permissions" },
        },
        isAxiosError: true,
      };

      mockedAxios.get.mockRejectedValueOnce(mockError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      // Act
      const result = await clinicalService.fetchSymptomMappings();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("permissions");
    });
  });

  describe("fetchDiagnosisMappings", () => {
    it("successfully fetches diagnosis neural mappings", async () => {
      // Arrange
      const mockMappings: DiagnosisNeuralMapping[] = [
        {
          diagnosisId: "d1",
          diagnosisName: "Major Depressive Disorder",
          brainRegions: ["prefrontal-cortex", "hippocampus"],
          activityPatterns: [
            { regionId: "prefrontal-cortex", activity: "reduced" },
          ],
          mappingConfidence: 0.8,
          mappingSource: "clinical-research-v2",
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockMappings,
        status: 200,
      });

      // Act
      const result = await clinicalService.fetchDiagnosisMappings();

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockMappings);
    });
  });

  describe("fetchTreatmentMappings", () => {
    it("successfully fetches treatment neural mappings", async () => {
      // Arrange
      const mockMappings: TreatmentNeuralMapping[] = [
        {
          treatmentId: "t1",
          treatmentName: "SSRI",
          targetRegions: ["raphe-nuclei", "prefrontal-cortex"],
          primaryMechanism: "serotonin-reuptake-inhibition",
          expectedResponse: [
            { regionId: "prefrontal-cortex", response: "increased-activity" },
          ],
          mappingConfidence: 0.9,
          mappingSource: "clinical-research-v2",
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockMappings,
        status: 200,
      });

      // Act
      const result = await clinicalService.fetchTreatmentMappings();

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockMappings);
    });
  });

  describe("fetchRiskAssessment", () => {
    it("successfully fetches patient risk assessment", async () => {
      // Arrange
      const mockAssessment: RiskAssessment = {
        patientId: "p1",
        overallRiskScore: 0.65,
        riskFactors: [
          { factor: "prior-history", score: 0.8, confidence: 0.9 },
          { factor: "recent-life-events", score: 0.7, confidence: 0.85 },
        ],
        assessmentDate: "2023-04-01T10:00:00Z",
        nextAssessmentDue: "2023-04-15T10:00:00Z",
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockAssessment,
        status: 200,
      });

      // Act
      const result = await clinicalService.fetchRiskAssessment("p1");

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockAssessment);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/patients/p1/risk-assessment"),
        expect.anything(),
      );
    });

    it("handles patient not found errors", async () => {
      // Arrange
      const mockError = {
        response: {
          status: 404,
          data: { message: "Patient not found" },
        },
        isAxiosError: true,
      };

      mockedAxios.get.mockRejectedValueOnce(mockError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      // Act
      const result = await clinicalService.fetchRiskAssessment("nonexistent");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("not found");
    });
  });

  describe("fetchTreatmentPredictions", () => {
    it("successfully fetches treatment response predictions", async () => {
      // Arrange
      const mockPredictions: TreatmentResponsePrediction[] = [
        {
          treatmentId: "t1",
          treatmentName: "SSRI",
          predictedEfficacy: 0.75,
          confidence: 0.8,
          timeToResponse: { min: 14, max: 28, unit: "days" },
          sideEffectRisks: [
            { effect: "nausea", probability: 0.3, severity: "mild" },
          ],
          recommendationStrength: "strong",
          neuralBasis: "altered-serotonin-activity",
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockPredictions,
        status: 200,
      });

      // Act
      const result = await clinicalService.fetchTreatmentPredictions("p1");

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockPredictions);
    });
  });

  describe("fetchPatientSymptoms", () => {
    it("successfully fetches patient symptoms", async () => {
      // Arrange
      const mockSymptoms: Symptom[] = [
        {
          id: "s1",
          name: "Depressed Mood",
          severity: 0.7,
          onset: "2023-03-15T00:00:00Z",
          duration: { value: 3, unit: "weeks" },
          frequency: "daily",
          triggers: ["stress", "poor-sleep"],
          notes: "Worse in evenings",
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockSymptoms,
        status: 200,
      });

      // Act
      const result = await clinicalService.fetchPatientSymptoms("p1");

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockSymptoms);
    });
  });

  describe("updateSymptom", () => {
    it("successfully updates a patient symptom", async () => {
      // Arrange
      const updatedSymptom: Symptom = {
        id: "s1",
        name: "Depressed Mood",
        severity: 0.5, // Updated severity
        onset: "2023-03-15T00:00:00Z",
        duration: { value: 3, unit: "weeks" },
        frequency: "daily",
        triggers: ["stress", "poor-sleep"],
        notes: "Improving with treatment",
      };

      mockedAxios.patch.mockResolvedValueOnce({
        data: updatedSymptom,
        status: 200,
      });

      // Act
      const result = await clinicalService.updateSymptom("p1", "s1", {
        severity: 0.5,
        notes: "Improving with treatment",
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(updatedSymptom);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/patients/p1/symptoms/s1"),
        expect.objectContaining({
          severity: 0.5,
          notes: "Improving with treatment",
        }),
        expect.anything(),
      );
    });
  });

  describe("generateAlgorithmExplanation", () => {
    it("successfully generates an algorithm explanation", async () => {
      // Arrange
      const mockExplanation = {
        algorithmName: "Neural Treatment Response Predictor",
        description:
          "Uses neural connectivity patterns to predict treatment efficacy",
        factorsConsidered: [
          "neural-activity-patterns",
          "genetic-markers",
          "prior-treatment-responses",
        ],
        confidenceLevel: 0.85,
        limitations: [
          "limited-data-for-comorbid-conditions",
          "genetic-marker-specificity",
        ],
        references: ["doi:10.1000/journal.123", "doi:10.1000/journal.456"],
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockExplanation,
        status: 200,
      });

      // Act
      const result = await clinicalService.generateAlgorithmExplanation(
        "pred123",
        "technical",
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockExplanation);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/predictions/pred123/explanation"),
        expect.objectContaining({
          params: { detailLevel: "technical" },
        }),
      );
    });
  });

  describe("generateTemporalProjections", () => {
    it("successfully generates temporal projections", async () => {
      // Arrange
      const mockProjection = {
        projectionId: "proj123",
        timeSeries: [
          {
            dayOffset: 0,
            date: "2023-04-01T00:00:00Z",
            metrics: { "symptom-severity": 0.7 },
            confidenceIntervals: { "symptom-severity": [0.65, 0.75] },
          },
          {
            dayOffset: 14,
            date: "2023-04-15T00:00:00Z",
            metrics: { "symptom-severity": 0.5 },
            confidenceIntervals: { "symptom-severity": [0.45, 0.55] },
          },
          {
            dayOffset: 28,
            date: "2023-04-29T00:00:00Z",
            metrics: { "symptom-severity": 0.3 },
            confidenceIntervals: { "symptom-severity": [0.25, 0.35] },
          },
        ],
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockProjection,
        status: 200,
      });

      // Act
      const result = await clinicalService.generateTemporalProjections(
        "p1",
        ["t1", "t2"],
        30,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockProjection);
      expect(result.value.timeSeries).toHaveLength(3);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/patients/p1/temporal-projections"),
        expect.objectContaining({
          treatmentIds: ["t1", "t2"],
          projectionDuration: 30,
        }),
        expect.anything(),
      );
    });
  });
});

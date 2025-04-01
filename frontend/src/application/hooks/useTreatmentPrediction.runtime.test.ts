/**
 * @fileoverview Tests for runtime validation functions in useTreatmentPrediction.runtime.ts.
 */

import { describe, it, expect } from "vitest";
// Import the specific validation functions and relevant types
import {
  validateClinicalPredictionData, // Validates the domain type
  validateGeneticPredictionData,
  validateTreatmentResponseRequest, // Validates the Request DTO
  validateTreatmentResponseResponse, // Validates the Response DTO
} from "@hooks/useTreatmentPrediction.runtime";
import {
  ClinicalPredictionData, // Domain type
  GeneticPredictionData,
  TreatmentType, // Keep if needed for mock data, but use string literals for values
} from "@domain/types/clinical/treatment";
import {
  TreatmentResponseRequest, // DTO type
  TreatmentResponseResponse, // DTO type
} from "@infrastructure/api/XGBoostService";

// --- Mock Data ---

// Domain-like structure for testing validateClinicalPredictionData
const mockValidDomainClinicalData: ClinicalPredictionData = {
  diagnosis: ["F32.9"],
  symptomSeverity: { "Low Mood": 7, Anhedonia: 6 },
  illnessDuration: 24, // months
  previousTreatmentResponses: [{ treatmentType: "SSRI", response: "partial" }],
  comorbidities: ["Anxiety"],
  currentMedications: ["Sertraline 100mg"],
  functionalImpairment: "moderate",
  suicidalIdeation: false,
  substanceUse: false,
};

// DTO-like structure for testing validateTreatmentResponseRequest's clinical_data field
const mockValidRequestClinicalData = {
  // Matches structure expected in TreatmentResponseRequest DTO
  severity: "moderate", // Example severity string
  diagnosis: "F32.9", // Example diagnosis string
  // Include other fields matching the DTO's expectation if necessary
  symptomSeverity: { "Low Mood": 7, Anhedonia: 6 },
  illnessDuration: 24,
  previousTreatmentResponses: [{ treatmentType: "SSRI", response: "partial" }],
  comorbidities: ["Anxiety"],
  currentMedications: ["Sertraline 100mg"],
  functionalImpairment: "moderate",
  suicidalIdeation: false,
  substanceUse: false,
};

const mockInvalidDomainClinicalData = {
  // Invalid structure for the Domain type
  diagnosis: ["F32.9"],
  symptomSeverity: { "Low Mood": "high" }, // Invalid type
  illnessDuration: 24,
};

const mockValidGeneticData: GeneticPredictionData = {
  metabolizerStatus: { cyp2d6: "intermediate" },
  riskVariants: ["rs12345"],
};

const mockValidTreatmentDetails = {
  medication: {
    name: "Sertraline",
    class: "SSRI",
    dosage: "100mg",
    frequency: "daily",
    duration: "ongoing",
    previousExposure: true,
  },
};

const mockValidRequest: TreatmentResponseRequest = {
  patient_id: "p123",
  treatment_type: "pharmacological", // Use string literal
  treatment_details: mockValidTreatmentDetails,
  clinical_data: mockValidRequestClinicalData, // Use DTO-like structure
  genetic_data: ["gene1", "gene2"], // Example genetic data
};

const mockInvalidRequestMissingClinical = {
  // Missing clinical_data
  patient_id: "p123",
  treatment_type: "pharmacological",
  treatment_details: mockValidTreatmentDetails,
};

// Request with clinical_data structure matching the Domain type (invalid for DTO)
const mockInvalidRequestWrongClinicalStructure: TreatmentResponseRequest = {
  patient_id: "p123",
  treatment_type: "pharmacological",
  treatment_details: mockValidTreatmentDetails,
  // @ts-expect-error - Intentionally using wrong structure for testing
  clinical_data: mockValidDomainClinicalData,
  genetic_data: ["gene1", "gene2"],
};

const mockValidResponse: TreatmentResponseResponse = {
  prediction_id: "pred-abc",
  patient_id: "p123",
  treatment_type: "pharmacological",
  response_probability: 0.78,
  response_level: "good",
  confidence: 0.92,
  time_to_response: { weeks: 3, confidence: 0.85 },
  factors: [{ name: "Severity", contribution: 0.4 }],
  alternative_treatments: [{ type: "psychotherapy", estimated_response: 0.65 }],
  timestamp: new Date().toISOString(),
};

const mockInvalidResponse = {
  // Missing response_probability
  prediction_id: "pred-def",
  patient_id: "p123",
  treatment_type: "pharmacological",
  response_level: "good",
  confidence: 0.92,
  time_to_response: { weeks: 3, confidence: 0.85 },
  factors: [],
  alternative_treatments: [],
  timestamp: new Date().toISOString(),
};

describe("useTreatmentPrediction Runtime Validation", () => {
  // Tests for validateClinicalPredictionData (Domain Type)
  describe("validateClinicalPredictionData", () => {
    it("should return Ok for valid Domain ClinicalPredictionData", () => {
      const result = validateClinicalPredictionData(
        mockValidDomainClinicalData,
      );
      expect(result.ok).toBe(true);
    });

    it("should return Err for invalid Domain ClinicalPredictionData", () => {
      const result = validateClinicalPredictionData(
        mockInvalidDomainClinicalData,
      );
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "Invalid ClinicalPredictionData structure.",
      );
    });

    it("should return Err for non-object input", () => {
      const result = validateClinicalPredictionData(null);
      expect(result.err).toBe(true);
    });
  });

  // Tests for validateGeneticPredictionData
  describe("validateGeneticPredictionData", () => {
    it("should return Ok for valid GeneticPredictionData (object)", () => {
      const result = validateGeneticPredictionData(mockValidGeneticData);
      expect(result.ok).toBe(true);
    });

    it("should return Ok for valid GeneticPredictionData (empty object)", () => {
      const result = validateGeneticPredictionData({});
      expect(result.ok).toBe(true);
    });

    it("should return Ok for valid GeneticPredictionData (undefined)", () => {
      const result = validateGeneticPredictionData(undefined);
      expect(result.ok).toBe(true);
      expect(result.val).toBeUndefined();
    });

    it("should return Err for invalid GeneticPredictionData (null)", () => {
      const result = validateGeneticPredictionData(null);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain("Input cannot be null.");
    });

    it("should return Err for invalid GeneticPredictionData (string)", () => {
      const result = validateGeneticPredictionData("genetic string");
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "must be object or undefined",
      );
    });
  });

  // Tests for validateTreatmentResponseRequest (DTO)
  describe("validateTreatmentResponseRequest", () => {
    it("should return Ok for valid TreatmentResponseRequest DTO", () => {
      const result = validateTreatmentResponseRequest(mockValidRequest);
      expect(result.ok).toBe(true); // This should pass now
    });

    it("should return Err for invalid TreatmentResponseRequest DTO (missing clinical_data)", () => {
      const result = validateTreatmentResponseRequest(
        mockInvalidRequestMissingClinical,
      );
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "Invalid TreatmentResponseRequest structure.",
      );
    });

    it("should return Err for invalid TreatmentResponseRequest DTO (invalid clinical_data structure)", () => {
      const result = validateTreatmentResponseRequest(
        mockInvalidRequestWrongClinicalStructure,
      );
      expect(result.err).toBe(true); // This should pass now
      expect((result.val as Error).message).toContain(
        "Invalid TreatmentResponseRequest structure.",
      ); // Guard checks nested
    });

    it("should return Err for non-object input", () => {
      const result = validateTreatmentResponseRequest(null);
      expect(result.err).toBe(true);
    });
  });

  // Tests for validateTreatmentResponseResponse (DTO)
  describe("validateTreatmentResponseResponse", () => {
    it("should return Ok for valid TreatmentResponseResponse DTO", () => {
      const result = validateTreatmentResponseResponse(mockValidResponse);
      expect(result.ok).toBe(true);
    });

    it("should return Err for invalid TreatmentResponseResponse DTO (missing field)", () => {
      const result = validateTreatmentResponseResponse(mockInvalidResponse);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "Invalid TreatmentResponseResponse structure.",
      );
    });

    it("should return Err for non-object input", () => {
      const result = validateTreatmentResponseResponse([]);
      expect(result.err).toBe(true);
    });
  });
});

/**
 * NOVAMIND Testing Framework
 * RiskAssessmentService Application Service Test
 *
 * This file tests the core functionality of the RiskAssessmentService
 * using a TypeScript-only approach with proper type safety.
 */

import { describe, it, expect, vi } from "vitest";
import { RiskAssessmentService } from "./RiskAssessmentService";
import { RiskLevel } from "../../domain/types/RiskLevel";
import { PatientData } from "../../domain/types/patient";

// Define proper TypeScript interfaces for test data
interface MockPatientData extends PatientData {
  id: string;
  neuralActivity: number;
  biomarkers: {
    [key: string]: number;
  };
  clinicalHistory: {
    previousEpisodes: number;
    treatmentResponse: number;
  };
}

describe("RiskAssessmentService", () => {
  it("correctly assesses low risk patients", () => {
    // Create mock patient data with low risk indicators
    const lowRiskPatient: MockPatientData = {
      id: "patient-123",
      neuralActivity: 0.2,
      biomarkers: {
        cortisol: 0.3,
        dopamine: 0.7,
      },
      clinicalHistory: {
        previousEpisodes: 1,
        treatmentResponse: 0.8,
      },
    };

    const riskAssessment =
      RiskAssessmentService.getInstance().assessRisk(lowRiskPatient);

    expect(riskAssessment).toBeDefined();
    expect(riskAssessment.level).toBe(RiskLevel.LOW);
    expect(riskAssessment.score).toBeLessThan(0.3);
    expect(riskAssessment.factors).toHaveLength(1);
  });

  it("correctly assesses high risk patients", () => {
    // Create mock patient data with high risk indicators
    const highRiskPatient: MockPatientData = {
      id: "patient-456",
      neuralActivity: 0.9,
      biomarkers: {
        cortisol: 0.8,
        dopamine: 0.2,
      },
      clinicalHistory: {
        previousEpisodes: 5,
        treatmentResponse: 0.2,
      },
    };

    const riskAssessment =
      RiskAssessmentService.getInstance().assessRisk(highRiskPatient);

    expect(riskAssessment).toBeDefined();
    expect(riskAssessment.level).toBe(RiskLevel.HIGH);
    expect(riskAssessment.score).toBeGreaterThan(0.7);
    expect(riskAssessment.factors).toHaveLength(3);
  });

  it("handles edge cases gracefully", () => {
    // Test with minimal data
    const minimalPatient = {
      id: "minimal-patient",
      neuralActivity: 0.5,
    };

    const minimalAssessment = RiskAssessmentService.getInstance().assessRisk(
      minimalPatient as PatientData,
    );
    expect(minimalAssessment).toBeDefined();
    expect(minimalAssessment.level).toBe(RiskLevel.MODERATE);

    // Test with invalid data (should default to moderate risk)
    const invalidPatient = {
      id: "invalid-patient",
    };

    const invalidAssessment = RiskAssessmentService.getInstance().assessRisk(
      invalidPatient as PatientData,
    );
    expect(invalidAssessment).toBeDefined();
    expect(invalidAssessment.level).toBe(RiskLevel.MODERATE);
  });
});

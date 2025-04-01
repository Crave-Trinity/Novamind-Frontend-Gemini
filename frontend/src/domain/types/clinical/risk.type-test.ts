/**
 * NOVAMIND Type Testing Framework
 * Risk Type Tests
 *
 * Pure TypeScript type tests for risk assessments and related interfaces.
 */

import { describe, it, expectTypeOf } from "vitest";
import {
  RiskLevel,
  RiskAssessment,
  DomainRisk,
  ContributingFactor,
  ProtectiveFactor,
  NeuralRiskCorrelate,
  RiskTimelineEvent,
  BiometricRiskAlert,
  RiskVisualizationSettings,
  RiskAssessmentState,
  RiskTimelineState,
  ProcessedRiskTimeline,
} from "@types/clinical/risk";

describe("Risk type definitions", () => {
  it("RiskLevel enum has correct structure", () => {
    // Check that RiskLevel is an object type
    expectTypeOf(RiskLevel).toBeObject();

    // Check that enum values exist and match the expected types
    expectTypeOf(RiskLevel.NONE).toBeString();
    expectTypeOf(RiskLevel.LOW).toBeString();
    expectTypeOf(RiskLevel.MODERATE).toBeString();
    expectTypeOf(RiskLevel.HIGH).toBeString();
    expectTypeOf(RiskLevel.SEVERE).toBeString();
    expectTypeOf(RiskLevel.UNKNOWN).toBeString();
  });

  it("RiskAssessment has correct structure", () => {
    expectTypeOf<RiskAssessment>().toHaveProperty("id").toEqualTypeOf<string>();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("patientId")
      .toEqualTypeOf<string>();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("timestamp")
      .toEqualTypeOf<string>();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("assessmentType")
      .toEqualTypeOf<"automated" | "clinician" | "hybrid">();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("overallRisk")
      .toEqualTypeOf<RiskLevel>();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("confidenceScore")
      .toEqualTypeOf<number>();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("domainRisks")
      .toEqualTypeOf<DomainRisk[]>();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("temporalTrend")
      .toEqualTypeOf<"increasing" | "decreasing" | "stable" | "fluctuating">();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("contributingFactors")
      .toEqualTypeOf<ContributingFactor[]>();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("protectiveFactors")
      .toEqualTypeOf<ProtectiveFactor[]>();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("neuralCorrelates")
      .toEqualTypeOf<NeuralRiskCorrelate[]>();

    // Optional properties
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("algorithmVersion")
      .toBeNullable();
    expectTypeOf<RiskAssessment>().toHaveProperty("clinicianId").toBeNullable();
    expectTypeOf<RiskAssessment>().toHaveProperty("notes").toBeNullable();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("recommendations")
      .toBeNullable();
    expectTypeOf<RiskAssessment>()
      .toHaveProperty("nextAssessmentDue")
      .toBeNullable();
  });

  it("DomainRisk has correct structure", () => {
    expectTypeOf<DomainRisk>()
      .toHaveProperty("domain")
      .toEqualTypeOf<
        | "suicide"
        | "self_harm"
        | "harm_to_others"
        | "psychosis"
        | "substance_use"
        | "functional_decline"
        | "treatment_resistance"
        | "medical_complication"
      >();
    expectTypeOf<DomainRisk>()
      .toHaveProperty("riskLevel")
      .toEqualTypeOf<RiskLevel>();
    expectTypeOf<DomainRisk>()
      .toHaveProperty("confidenceScore")
      .toEqualTypeOf<number>();
    expectTypeOf<DomainRisk>()
      .toHaveProperty("evidence")
      .toEqualTypeOf<string[]>();
    expectTypeOf<DomainRisk>()
      .toHaveProperty("urgency")
      .toEqualTypeOf<"immediate" | "urgent" | "monitor" | "routine">();

    // Optional complex nested properties
    expectTypeOf<DomainRisk>()
      .toHaveProperty("temporalDynamics")
      .toBeNullable();
    expectTypeOf<DomainRisk>()
      .toHaveProperty("clinicalThresholds")
      .toBeNullable();
  });

  it("ContributingFactor has correct structure", () => {
    expectTypeOf<ContributingFactor>()
      .toHaveProperty("id")
      .toEqualTypeOf<string>();
    expectTypeOf<ContributingFactor>()
      .toHaveProperty("name")
      .toEqualTypeOf<string>();
    expectTypeOf<ContributingFactor>()
      .toHaveProperty("category")
      .toEqualTypeOf<
        | "demographic"
        | "clinical"
        | "psychological"
        | "social"
        | "environmental"
        | "neurobiological"
      >();
    expectTypeOf<ContributingFactor>()
      .toHaveProperty("impactWeight")
      .toEqualTypeOf<number>();
    expectTypeOf<ContributingFactor>()
      .toHaveProperty("modifiability")
      .toEqualTypeOf<
        "non-modifiable" | "partially-modifiable" | "modifiable"
      >();
    expectTypeOf<ContributingFactor>()
      .toHaveProperty("temporalRelevance")
      .toEqualTypeOf<"immediate" | "short-term" | "long-term">();
  });

  it("ProtectiveFactor has correct structure", () => {
    expectTypeOf<ProtectiveFactor>()
      .toHaveProperty("id")
      .toEqualTypeOf<string>();
    expectTypeOf<ProtectiveFactor>()
      .toHaveProperty("name")
      .toEqualTypeOf<string>();
    expectTypeOf<ProtectiveFactor>()
      .toHaveProperty("category")
      .toEqualTypeOf<
        | "clinical"
        | "psychological"
        | "social"
        | "environmental"
        | "neurobiological"
      >();
    expectTypeOf<ProtectiveFactor>()
      .toHaveProperty("strengthLevel")
      .toEqualTypeOf<"minimal" | "moderate" | "strong">();
    expectTypeOf<ProtectiveFactor>()
      .toHaveProperty("temporalStability")
      .toEqualTypeOf<"transient" | "episodic" | "stable">();
  });

  it("RiskVisualizationSettings has correct structure", () => {
    expectTypeOf<RiskVisualizationSettings>().toHaveProperty("colorScale");
    expectTypeOf<RiskVisualizationSettings>()
      .toHaveProperty("visualizationMode")
      .toEqualTypeOf<"heatmap" | "discrete" | "gradient">();
    expectTypeOf<RiskVisualizationSettings>()
      .toHaveProperty("temporalResolution")
      .toEqualTypeOf<"daily" | "weekly" | "monthly" | "quarterly" | "yearly">();
    expectTypeOf<RiskVisualizationSettings>()
      .toHaveProperty("showConfidenceIntervals")
      .toEqualTypeOf<boolean>();
  });

  it("RiskAssessmentState uses discriminated union for type safety", () => {
    expectTypeOf<RiskAssessmentState>().toMatchTypeOf<
      | { status: "idle" }
      | { status: "loading" }
      | { status: "error"; error: Error }
      | { status: "success"; data: RiskAssessment }
    >();
  });
});

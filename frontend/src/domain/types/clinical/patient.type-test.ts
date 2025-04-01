/**
 * NOVAMIND Type Testing Framework
 * Patient Type Tests
 *
 * This file demonstrates proper TypeScript type testing without runtime assertions.
 */

import { describe, it, expectTypeOf } from "vitest";
import {
  Patient,
  PatientDemographics,
  Diagnosis,
  Symptom,
  Medication,
} from "./patient";

describe("Patient type definitions", () => {
  it("Patient has correct structure", () => {
    // Test Patient interface structure
    expectTypeOf<Patient>().toHaveProperty("id").toEqualTypeOf<string>();
    expectTypeOf<Patient>()
      .toHaveProperty("demographicData")
      .toEqualTypeOf<PatientDemographics>();
    expectTypeOf<Patient>().toHaveProperty("clinicalData");
    expectTypeOf<Patient>().toHaveProperty("treatmentData");
    expectTypeOf<Patient>().toHaveProperty("neuralData");
    expectTypeOf<Patient>().toHaveProperty("dataAccessPermissions");
    expectTypeOf<Patient>()
      .toHaveProperty("lastUpdated")
      .toEqualTypeOf<string>();
    expectTypeOf<Patient>().toHaveProperty("version").toEqualTypeOf<string>();
  });

  it("PatientDemographics has correct properties", () => {
    // Test PatientDemographics interface structure
    expectTypeOf<PatientDemographics>()
      .toHaveProperty("age")
      .toEqualTypeOf<number>();
    expectTypeOf<PatientDemographics>()
      .toHaveProperty("biologicalSex")
      .toEqualTypeOf<"male" | "female" | "other">();
    expectTypeOf<PatientDemographics>()
      .toHaveProperty("anonymizationLevel")
      .toEqualTypeOf<"full" | "partial" | "research" | "clinical">();

    // Optional properties
    expectTypeOf<PatientDemographics>()
      .toHaveProperty("ethnicity")
      .toBeNullable();
    expectTypeOf<PatientDemographics>()
      .toHaveProperty("occupationalStatus")
      .toBeNullable();
  });

  it("Diagnosis has correct structure", () => {
    // Test Diagnosis interface structure
    expectTypeOf<Diagnosis>().toHaveProperty("id").toEqualTypeOf<string>();
    expectTypeOf<Diagnosis>().toHaveProperty("code").toEqualTypeOf<string>();
    expectTypeOf<Diagnosis>()
      .toHaveProperty("codingSystem")
      .toEqualTypeOf<"ICD-10" | "ICD-11" | "DSM-5" | "DSM-5-TR">();
    expectTypeOf<Diagnosis>().toHaveProperty("name").toEqualTypeOf<string>();
    expectTypeOf<Diagnosis>()
      .toHaveProperty("severity")
      .toEqualTypeOf<
        "mild" | "moderate" | "severe" | "in remission" | "unspecified"
      >();
  });

  it("Symptom has correct structure", () => {
    // Test Symptom interface structure
    expectTypeOf<Symptom>().toHaveProperty("id").toEqualTypeOf<string>();
    expectTypeOf<Symptom>().toHaveProperty("name").toEqualTypeOf<string>();
    expectTypeOf<Symptom>()
      .toHaveProperty("category")
      .toEqualTypeOf<
        "cognitive" | "affective" | "behavioral" | "somatic" | "perceptual"
      >();
    expectTypeOf<Symptom>().toHaveProperty("severity").toEqualTypeOf<number>();
  });

  it("Medication has correct structure", () => {
    // Test Medication interface structure
    expectTypeOf<Medication>().toHaveProperty("id").toEqualTypeOf<string>();
    expectTypeOf<Medication>().toHaveProperty("name").toEqualTypeOf<string>();
    expectTypeOf<Medication>().toHaveProperty("dosage").toEqualTypeOf<string>();
    expectTypeOf<Medication>()
      .toHaveProperty("startDate")
      .toEqualTypeOf<string>();
  });
});

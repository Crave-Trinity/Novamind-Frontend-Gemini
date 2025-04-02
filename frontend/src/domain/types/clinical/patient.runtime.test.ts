/**
 * NOVAMIND Neural Test Suite
 * Patient runtime validators testing with quantum precision
 */

import { describe, it, expect } from "vitest";
import {
  PatientValidator,
  PatientDemographicsValidator,
  DiagnosisValidator,
  SymptomValidator,
  MedicationValidator,
} from "@domain/types/clinical/patient.runtime";

describe("Patient runtime validators", () => {
  it("PatientValidator validates correct Patient objects", () => {
    const validPatient = {
      id: "patient-123",
      demographicData: {
        age: 35,
        biologicalSex: "male",
        anonymizationLevel: "clinical",
      },
      clinicalData: {
        diagnoses: [],
        symptoms: [],
        medications: [],
        psychometricAssessments: [],
        medicalHistory: [],
      },
      treatmentData: {
        currentTreatments: [],
        historicalTreatments: [],
        treatmentResponses: [],
      },
      neuralData: {
        brainScans: [],
      },
      dataAccessPermissions: {
        accessLevel: "full",
        authorizedUsers: ["doctor-123"],
        consentStatus: "full",
        dataRetentionPolicy: "standard",
        lastReviewDate: "2025-01-01",
      },
      lastUpdated: "2025-03-31T13:00:00Z",
      version: "1.0.0",
    };

    const invalidPatient = {
      id: "patient-123",
      // Missing required fields
    };

    expect(PatientValidator.isValid(validPatient)).toBe(true);
    expect(PatientValidator.isValid(invalidPatient)).toBe(false);
    expect(PatientValidator.isValid(null)).toBe(false);
    expect(PatientValidator.isValid(123)).toBe(false);
  });

  it("PatientDemographicsValidator validates correct PatientDemographics objects", () => {
    const validDemographics = {
      age: 35,
      biologicalSex: "male",
      anonymizationLevel: "clinical",
      ethnicity: "caucasian",
      occupationalStatus: "employed",
    };

    const invalidDemographics = {
      age: "35", // Wrong type
      biologicalSex: "male",
      anonymizationLevel: "clinical",
    };

    expect(PatientDemographicsValidator.isValid(validDemographics)).toBe(true);
    expect(PatientDemographicsValidator.isValid(invalidDemographics)).toBe(
      false,
    );
  });

  it("DiagnosisValidator validates correct Diagnosis objects", () => {
    const validDiagnosis = {
      id: "diagnosis-123",
      code: "F41.1",
      codingSystem: "ICD-10",
      name: "Generalized Anxiety Disorder",
      severity: "moderate",
      onsetDate: "2024-01-15",
    };

    const invalidDiagnosis = {
      id: "diagnosis-123",
      code: "F41.1",
      codingSystem: "invalid-coding-system", // Invalid enum value
      name: "Generalized Anxiety Disorder",
      severity: "moderate",
    };

    expect(DiagnosisValidator.isValid(validDiagnosis)).toBe(true);
    expect(DiagnosisValidator.isValid(invalidDiagnosis)).toBe(false);
  });

  it("SymptomValidator validates correct Symptom objects", () => {
    const validSymptom = {
      id: "symptom-123",
      name: "Persistent worry",
      category: "cognitive",
      severity: 7,
      frequency: "daily",
      impact: "moderate",
    };

    const invalidSymptom = {
      id: "symptom-123",
      name: "Persistent worry",
      category: "unknown", // Invalid category
      severity: 7,
    };

    expect(SymptomValidator.isValid(validSymptom)).toBe(true);
    expect(SymptomValidator.isValid(invalidSymptom)).toBe(false);
  });

  it("MedicationValidator validates correct Medication objects", () => {
    const validMedication = {
      id: "med-123",
      name: "Sertraline",
      genericName: "Sertraline HCl",
      classification: "SSRI",
      dosage: "50mg",
      frequency: "daily",
      route: "oral",
      startDate: "2024-02-15",
    };

    const invalidMedication = {
      id: "med-123",
      name: "Sertraline",
      // Missing required fields
    };

    expect(MedicationValidator.isValid(validMedication)).toBe(true);
    expect(MedicationValidator.isValid(invalidMedication)).toBe(false);
  });
});

/**
 * NOVAMIND Neural Test Suite
 * Patient Model Runtime Validators Testing
 */

import { describe, it, expect } from "vitest";
import {
  PatientDemographicsValidator,
  ClinicalHistoryValidator,
  MedicationValidator,
  SymptomValidator,
  TreatmentResponseValidator,
  PatientModelValidator,
} from "./patient-model.runtime";

describe("Patient Model Runtime Validators", () => {
  describe("PatientDemographicsValidator", () => {
    it("validates valid PatientDemographics objects", () => {
      const validDemographics = {
        age: 35,
        biologicalSex: "female",
      };

      expect(PatientDemographicsValidator.isValid(validDemographics)).toBe(
        true,
      );
      expect(
        PatientDemographicsValidator.isValid({
          ...validDemographics,
          heightCm: 175,
          weightKg: 70,
          handedness: "right",
          ethnicity: "Mixed",
        }),
      ).toBe(true);
    });

    it("rejects invalid PatientDemographics objects", () => {
      expect(PatientDemographicsValidator.isValid(null)).toBe(false);
      expect(PatientDemographicsValidator.isValid(undefined)).toBe(false);
      expect(PatientDemographicsValidator.isValid({})).toBe(false);
      expect(
        PatientDemographicsValidator.isValid({
          age: "35", // Wrong type
          biologicalSex: "female",
        }),
      ).toBe(false);
      expect(
        PatientDemographicsValidator.isValid({
          age: 35,
          biologicalSex: "unknown", // Invalid value
        }),
      ).toBe(false);
    });

    it("normalizes partial PatientDemographics objects", () => {
      const normalized = PatientDemographicsValidator.normalize({
        age: 42,
      });

      expect(normalized.age).toBe(42);
      expect(normalized.biologicalSex).toBe("other");
    });
  });

  describe("ClinicalHistoryValidator", () => {
    it("validates valid ClinicalHistory objects", () => {
      const validHistory = {
        primaryDiagnosis: "Major Depressive Disorder",
      };

      expect(ClinicalHistoryValidator.isValid(validHistory)).toBe(true);
      expect(
        ClinicalHistoryValidator.isValid({
          ...validHistory,
          secondaryDiagnoses: ["Anxiety", "Insomnia"],
          diagnosisDate: new Date(),
          familyHistory: ["Depression"],
          previousTreatments: ["CBT", "SSRIs"],
          allergies: ["Penicillin"],
        }),
      ).toBe(true);
    });

    it("rejects invalid ClinicalHistory objects", () => {
      expect(ClinicalHistoryValidator.isValid(null)).toBe(false);
      expect(ClinicalHistoryValidator.isValid(undefined)).toBe(false);
      expect(ClinicalHistoryValidator.isValid({})).toBe(false);
      expect(
        ClinicalHistoryValidator.isValid({
          primaryDiagnosis: 123, // Wrong type
        }),
      ).toBe(false);
    });

    it("normalizes partial ClinicalHistory objects", () => {
      const normalized = ClinicalHistoryValidator.normalize({});

      expect(normalized.primaryDiagnosis).toBe("");
      expect(normalized.secondaryDiagnoses).toBeUndefined();
    });
  });

  describe("MedicationValidator", () => {
    it("validates valid Medication objects", () => {
      const validMedication = {
        id: "med-1",
        name: "Prozac",
        dosage: "20mg",
        frequency: "Daily",
        startDate: new Date(),
      };

      expect(MedicationValidator.isValid(validMedication)).toBe(true);
      expect(
        MedicationValidator.isValid({
          ...validMedication,
          endDate: new Date(),
          prescribedBy: "Dr. Smith",
          purpose: "Depression",
          adherenceRate: 0.9,
          sideEffects: ["Nausea", "Insomnia"],
        }),
      ).toBe(true);
    });

    it("rejects invalid Medication objects", () => {
      expect(MedicationValidator.isValid(null)).toBe(false);
      expect(MedicationValidator.isValid(undefined)).toBe(false);
      expect(MedicationValidator.isValid({})).toBe(false);
      expect(
        MedicationValidator.isValid({
          id: "med-1",
          name: "Prozac",
          dosage: "20mg",
          frequency: "Daily",
          startDate: "2023-01-01", // Wrong type, should be Date
        }),
      ).toBe(false);
    });

    it("normalizes partial Medication objects", () => {
      const normalized = MedicationValidator.normalize({
        name: "Xanax",
      });

      expect(normalized.id).toBeDefined();
      expect(normalized.name).toBe("Xanax");
      expect(normalized.dosage).toBe("");
      expect(normalized.frequency).toBe("");
      expect(normalized.startDate).toBeInstanceOf(Date);
    });
  });

  describe("SymptomValidator", () => {
    it("validates valid Symptom objects", () => {
      const validSymptom = {
        id: "symp-1",
        name: "Insomnia",
        severity: 7,
        frequency: "frequent",
        firstObserved: new Date(),
      };

      expect(SymptomValidator.isValid(validSymptom)).toBe(true);
      expect(
        SymptomValidator.isValid({
          ...validSymptom,
          triggers: ["Stress", "Caffeine"],
          notes: "Worsens during high-stress periods",
        }),
      ).toBe(true);
    });

    it("rejects invalid Symptom objects", () => {
      expect(SymptomValidator.isValid(null)).toBe(false);
      expect(SymptomValidator.isValid(undefined)).toBe(false);
      expect(SymptomValidator.isValid({})).toBe(false);
      expect(
        SymptomValidator.isValid({
          id: "symp-1",
          name: "Insomnia",
          severity: 7,
          frequency: "sometimes", // Invalid value
          firstObserved: new Date(),
        }),
      ).toBe(false);
    });

    it("normalizes partial Symptom objects", () => {
      const normalized = SymptomValidator.normalize({
        name: "Anxiety",
      });

      expect(normalized.id).toBeDefined();
      expect(normalized.name).toBe("Anxiety");
      expect(normalized.severity).toBe(0);
      expect(normalized.frequency).toBe("occasional");
      expect(normalized.firstObserved).toBeInstanceOf(Date);
    });
  });

  describe("TreatmentResponseValidator", () => {
    it("validates valid TreatmentResponse objects", () => {
      const validResponse = {
        treatmentId: "treat-1",
        treatmentName: "CBT",
        startDate: new Date(),
        effectivenesRating: 8,
      };

      expect(TreatmentResponseValidator.isValid(validResponse)).toBe(true);
      expect(
        TreatmentResponseValidator.isValid({
          ...validResponse,
          endDate: new Date(),
          sideEffects: ["None"],
          notes: "Patient responded well",
        }),
      ).toBe(true);
    });

    it("rejects invalid TreatmentResponse objects", () => {
      expect(TreatmentResponseValidator.isValid(null)).toBe(false);
      expect(TreatmentResponseValidator.isValid(undefined)).toBe(false);
      expect(TreatmentResponseValidator.isValid({})).toBe(false);
      expect(
        TreatmentResponseValidator.isValid({
          treatmentId: "treat-1",
          treatmentName: "CBT",
          startDate: new Date(),
          effectivenesRating: "8", // Wrong type
        }),
      ).toBe(false);
    });

    it("normalizes partial TreatmentResponse objects", () => {
      const normalized = TreatmentResponseValidator.normalize({
        treatmentName: "Meditation",
      });

      expect(normalized.treatmentId).toBe("");
      expect(normalized.treatmentName).toBe("Meditation");
      expect(normalized.effectivenesRating).toBe(0);
      expect(normalized.startDate).toBeInstanceOf(Date);
    });
  });

  describe("PatientModelValidator", () => {
    // Create minimal valid objects for testing
    const validDemographics = {
      age: 35,
      biologicalSex: "female",
    };

    const validHistory = {
      primaryDiagnosis: "Major Depressive Disorder",
    };

    const validMedication = {
      id: "med-1",
      name: "Prozac",
      dosage: "20mg",
      frequency: "Daily",
      startDate: new Date(),
    };

    const validSymptom = {
      id: "symp-1",
      name: "Insomnia",
      severity: 7,
      frequency: "frequent",
      firstObserved: new Date(),
    };

    const validResponse = {
      treatmentId: "treat-1",
      treatmentName: "CBT",
      startDate: new Date(),
      effectivenesRating: 8,
    };

    const validPatient = {
      id: "patient-1",
      firstName: "Jane",
      lastName: "Doe",
      dateOfBirth: new Date("1985-05-15"),
      contactInformation: {
        email: "jane.doe@example.com",
      },
      demographics: validDemographics,
      clinicalHistory: validHistory,
      medications: [validMedication],
      symptoms: [validSymptom],
      treatmentResponses: [validResponse],
      version: 1,
      lastUpdated: new Date(),
      createdBy: "system",
    };

    it("validates valid PatientModel objects", () => {
      expect(PatientModelValidator.isValid(validPatient)).toBe(true);
      expect(
        PatientModelValidator.isValid({
          ...validPatient,
          brainModels: ["brain-1", "brain-2"],
          updatedBy: "user",
        }),
      ).toBe(true);
    });

    it("rejects invalid PatientModel objects", () => {
      expect(PatientModelValidator.isValid(null)).toBe(false);
      expect(PatientModelValidator.isValid(undefined)).toBe(false);
      expect(PatientModelValidator.isValid({})).toBe(false);

      // Invalid nested object
      expect(
        PatientModelValidator.isValid({
          ...validPatient,
          demographics: {
            age: 35,
            biologicalSex: "unknown", // Invalid value
          },
        }),
      ).toBe(false);

      // Invalid array of nested objects
      expect(
        PatientModelValidator.isValid({
          ...validPatient,
          medications: [
            {
              ...validMedication,
              startDate: "2023-01-01", // Wrong type, should be Date
            },
          ],
        }),
      ).toBe(false);
    });

    it("normalizes partial PatientModel objects", () => {
      const normalized = PatientModelValidator.normalize({
        firstName: "John",
        lastName: "Smith",
      });

      expect(normalized.id).toBeDefined();
      expect(normalized.firstName).toBe("John");
      expect(normalized.lastName).toBe("Smith");
      expect(normalized.dateOfBirth).toBeInstanceOf(Date);
      expect(normalized.contactInformation).toEqual({});
      expect(normalized.demographics).toBeDefined();
      expect(normalized.clinicalHistory).toBeDefined();
      expect(Array.isArray(normalized.medications)).toBe(true);
      expect(Array.isArray(normalized.symptoms)).toBe(true);
      expect(Array.isArray(normalized.treatmentResponses)).toBe(true);
      expect(normalized.version).toBe(1);
      expect(normalized.lastUpdated).toBeInstanceOf(Date);
      expect(normalized.createdBy).toBe("system");
    });

    it("normalizes model with partial nested objects", () => {
      const normalized = PatientModelValidator.normalize({
        demographics: {
          age: 42,
        },
        medications: [
          {
            name: "Xanax",
          },
        ],
      });

      expect(normalized.demographics.age).toBe(42);
      expect(normalized.demographics.biologicalSex).toBe("other");
      expect(normalized.medications[0].name).toBe("Xanax");
      expect(normalized.medications[0].dosage).toBe("");
    });
  });
});

/**
 * NOVAMIND Neural-Safe Type Verification
 * Clinical-specific type verification utilities tests with quantum-level precision
 */

import { describe, it, expect } from "vitest";
import { clinicalTypeVerifier } from "@domain/utils/clinical/type-verification";
import { RiskLevel } from "@domain/types/clinical/risk";
import { TypeVerificationError } from "@domain/utils/shared/type-verification";

describe("Clinical type verification", () => {
  describe("verifyRiskLevel", () => {
    it("verifies valid RiskLevel values", () => {
      // Test each valid risk level
      Object.values(RiskLevel).forEach((level) => {
        const result = clinicalTypeVerifier.verifyRiskLevel(level);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.value).toBe(level);
        }
      });
    });

    it("fails on invalid RiskLevel values", () => {
      expect(
        clinicalTypeVerifier.verifyRiskLevel("INVALID_LEVEL").success,
      ).toBe(false);
      expect(clinicalTypeVerifier.verifyRiskLevel(null).success).toBe(false);
      expect(clinicalTypeVerifier.verifyRiskLevel(42).success).toBe(false);
    });
  });

  describe("verifySymptom", () => {
    it("verifies valid Symptom objects", () => {
      const validSymptom = {
        id: "symptom1",
        name: "Headache",
        severity: 3,
      };

      const result = clinicalTypeVerifier.verifySymptom(validSymptom);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toMatchObject({
          id: "symptom1",
          name: "Headache",
          severity: 3,
        });
      }
    });

    it("accepts optional properties", () => {
      // Note: 'description' is not a valid property on Symptom type
      const symptomWithOptionals = {
        id: "symptom1",
        name: "Headache",
        severity: 3,
        // description: "Throbbing pain in the temple area", // Removed invalid property
        onsetDate: new Date("2025-01-15"),
        frequency: "daily",
      };

      const result = clinicalTypeVerifier.verifySymptom(symptomWithOptionals);
      expect(result.success).toBe(true);
      // Note: 'description' is not a valid property on Symptom type
      if (result.success) {
        // expect(result.value.description).toBe( // Removed assertion for invalid property
        //   "Throbbing pain in the temple area",
        // );
        expect(result.value.frequency).toBe("daily");
      }
    });

    it("fails when required properties are missing", () => {
      const missingProps = {
        id: "symptom1",
        // missing name
        severity: 3,
      };

      expect(clinicalTypeVerifier.verifySymptom(missingProps).success).toBe(
        false,
      );
    });

    it("fails when properties have wrong types", () => {
      const wrongTypes = {
        id: 123, // should be string
        name: "Headache",
        severity: "3", // should be number
      };

      expect(clinicalTypeVerifier.verifySymptom(wrongTypes).success).toBe(
        false,
      );
    });
  });

  describe("verifyDiagnosis", () => {
    it("verifies valid Diagnosis objects", () => {
      const validDiagnosis = {
        id: "diagnosis1",
        name: "Migraine",
        diagnosisDate: new Date("2025-02-10"),
      };

      const result = clinicalTypeVerifier.verifyDiagnosis(validDiagnosis);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toMatchObject({
          id: "diagnosis1",
          name: "Migraine",
          diagnosisDate: expect.any(Date),
        });
      }
    });

    it("accepts optional properties", () => {
      // Note: 'description' and 'icdCode' are not valid properties on Diagnosis type
      const diagnosisWithOptionals = {
        id: "diagnosis1",
        name: "Migraine",
        diagnosisDate: new Date("2025-02-10"),
        // description: "Chronic migraine with aura", // Removed invalid property
        // icdCode: "G43.109", // Removed invalid property
        severity: 4,
      };

      const result = clinicalTypeVerifier.verifyDiagnosis(
        diagnosisWithOptionals,
      );
      expect(result.success).toBe(true);
      // Note: 'description' and 'icdCode' are not valid properties on Diagnosis type
      if (result.success) {
        // expect(result.value.description).toBe("Chronic migraine with aura"); // Removed assertion for invalid property
        // expect(result.value.icdCode).toBe("G43.109"); // Removed assertion for invalid property
        expect(result.value.severity).toBe(4);
      }
    });

    it("fails when required properties are missing", () => {
      const missingProps = {
        id: "diagnosis1",
        name: "Migraine",
        // missing diagnosisDate
      };

      expect(clinicalTypeVerifier.verifyDiagnosis(missingProps).success).toBe(
        false,
      );
    });

    it("fails when diagnosisDate is not a Date object", () => {
      const wrongDateType = {
        id: "diagnosis1",
        name: "Migraine",
        diagnosisDate: "2025-02-10", // should be Date object
      };

      expect(clinicalTypeVerifier.verifyDiagnosis(wrongDateType).success).toBe(
        false,
      );
    });
  });

  describe("verifyTreatment", () => {
    it("verifies valid Treatment objects", () => {
      const validTreatment = {
        id: "treatment1",
        name: "Sumatriptan",
        type: "medication",
      };

      const result = clinicalTypeVerifier.verifyTreatment(validTreatment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toMatchObject({
          id: "treatment1",
          name: "Sumatriptan",
          type: "medication",
        });
      }
    });

    it("accepts optional properties", () => {
      const treatmentWithOptionals = {
        id: "treatment1",
        name: "Sumatriptan",
        type: "medication",
        description: "For acute migraine attacks",
        startDate: new Date("2025-02-15"),
        endDate: new Date("2025-03-15"),
        dose: "50mg", // Corrected property name from 'dosage' to 'dose'
        frequency: "as needed",
      };

      const result = clinicalTypeVerifier.verifyTreatment(
        treatmentWithOptionals,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.description).toBe("For acute migraine attacks");
        expect(result.value.dose).toBe("50mg"); // Corrected property name
        expect(result.value.frequency).toBe("as needed");
      }
    });

    it("fails when required properties are missing", () => {
      const missingProps = {
        id: "treatment1",
        // missing name
        type: "medication",
      };

      expect(clinicalTypeVerifier.verifyTreatment(missingProps).success).toBe(
        false,
      );
    });
  });

  describe("verifyTreatmentResponse", () => {
    it("verifies valid TreatmentResponse objects", () => {
      const validResponse = {
        id: "response1",
        treatmentId: "treatment1",
        effectiveness: 4,
        date: new Date("2025-03-01"),
      };

      const result =
        clinicalTypeVerifier.verifyTreatmentResponse(validResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toMatchObject({
          id: "response1",
          treatmentId: "treatment1",
          effectiveness: 4,
          date: expect.any(Date),
        });
      }
    });

    it("accepts optional properties", () => {
      // Note: 'notes' is not a valid property on TreatmentResponse type
      const responseWithOptionals = {
        id: "response1",
        treatmentId: "treatment1",
        effectiveness: 4,
        date: new Date("2025-03-01"),
        // notes: "Pain relief within 30 minutes", // Removed invalid property
        sideEffects: ["drowsiness", "nausea"],
      };

      const result = clinicalTypeVerifier.verifyTreatmentResponse(
        responseWithOptionals,
      );
      expect(result.success).toBe(true);
      // Note: 'notes' is not a valid property on TreatmentResponse type
      if (result.success) {
        // expect(result.value.notes).toBe("Pain relief within 30 minutes"); // Removed assertion for invalid property
        expect(result.value.sideEffects).toEqual(["drowsiness", "nausea"]);
      }
    });

    it("fails when required properties are missing", () => {
      const missingProps = {
        id: "response1",
        treatmentId: "treatment1",
        // missing effectiveness
        date: new Date("2025-03-01"),
      };

      expect(
        clinicalTypeVerifier.verifyTreatmentResponse(missingProps).success,
      ).toBe(false);
    });

    it("fails when date is not a Date object", () => {
      const wrongDateType = {
        id: "response1",
        treatmentId: "treatment1",
        effectiveness: 4,
        date: "2025-03-01", // should be Date object
      };

      expect(
        clinicalTypeVerifier.verifyTreatmentResponse(wrongDateType).success,
      ).toBe(false);
    });
  });

  describe("verifyPatient", () => {
    it("verifies valid Patient objects", () => {
      // Corrected structure to match Patient type definition from patient.ts
      const validPatient = {
        id: "patient1",
        demographicData: { // Changed from personalInfo
          age: 45, // Added required age
          biologicalSex: "male", // Added required biologicalSex
          anonymizationLevel: "clinical", // Added required anonymizationLevel
          // firstName: "John", // These are not part of demographicData
          // lastName: "Smith",
        },
        clinicalData: {
          symptoms: [],
          diagnoses: [],
          medications: [], // Added required medications
          psychometricAssessments: [], // Added required psychometricAssessments
          medicalHistory: [], // Added required medicalHistory
        },
        treatmentData: { // Added treatmentData
          currentTreatments: [],
          historicalTreatments: [],
          treatmentResponses: [],
        },
        neuralData: { // Added minimal neuralData
          brainScans: [],
        },
        dataAccessPermissions: { // Added minimal dataAccessPermissions
          accessLevel: "full",
          authorizedUsers: [],
          consentStatus: "full",
          dataRetentionPolicy: "standard",
          lastReviewDate: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(), // Added required lastUpdated
        version: "1.0", // Added required version
      };

      const result = clinicalTypeVerifier.verifyPatient(validPatient);
      expect(result.success).toBe(true);
      // Corrected assertions to match Patient type structure from patient.ts
      if (result.success) {
        expect(result.value.id).toBe("patient1");
        expect(result.value.demographicData).toMatchObject({ // Changed from personalInfo
          age: 45,
          biologicalSex: "male",
          anonymizationLevel: "clinical",
        });
        expect(result.value.clinicalData).toMatchObject({
          symptoms: [],
          diagnoses: [],
          medications: [],
          psychometricAssessments: [],
          medicalHistory: [],
        });
        expect(result.value.treatmentData).toMatchObject({ // Added assertion for treatmentData
          currentTreatments: [],
          historicalTreatments: [],
          treatmentResponses: [],
        });
        // Add assertions for neuralData, dataAccessPermissions, lastUpdated, version if needed
      }
    });

    it("accepts optional properties", () => {
      // Corrected structure with optionals to match Patient type definition from patient.ts
      const patientWithOptionals = {
        id: "patient1",
        demographicData: { // Changed from personalInfo
          age: 45,
          biologicalSex: "male",
          anonymizationLevel: "clinical",
          ethnicity: "Caucasian", // Optional
          // dateOfBirth is not part of demographicData
          // contactInfo is not part of demographicData
        },
        clinicalData: {
          symptoms: [],
          diagnoses: [],
          medications: [],
          psychometricAssessments: [],
          medicalHistory: [],
        },
        treatmentData: { // Added treatmentData
          currentTreatments: [],
          historicalTreatments: [],
          treatmentResponses: [],
        },
        neuralData: { // Added minimal neuralData
          brainScans: [],
        },
        dataAccessPermissions: { // Added minimal dataAccessPermissions
          accessLevel: "full",
          authorizedUsers: [],
          consentStatus: "full",
          dataRetentionPolicy: "standard",
          lastReviewDate: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      };

      const result = clinicalTypeVerifier.verifyPatient(patientWithOptionals);
      expect(result.success).toBe(true);
      // Corrected assertions for optionals from patient.ts
      if (result.success) {
        expect(result.value.demographicData.ethnicity).toBe("Caucasian");
        // dateOfBirth and contactInfo are not part of demographicData
        // expect(result.value.demographicData.dateOfBirth).toBeInstanceOf(Date);
        // expect(result.value.demographicData.contactInfo).toEqual({
        //   email: "john.smith@example.com",
        //   phone: "555-123-4567",
        // });
      }
    });

    it("verifies arrays of clinical data", () => {
      // Corrected structure with arrays to match Patient type definition from patient.ts
      const symptomExample = { id: "symptom1", name: "Headache", category: "somatic", severity: 3, frequency: "daily", impact: "moderate", progression: "stable" }; // Added required fields
      const diagnosisExample = { id: "diagnosis1", code: "G43.1", codingSystem: "ICD-10", name: "Migraine", severity: "moderate", diagnosisDate: new Date("2025-02-10").toISOString(), status: "active" }; // Added required fields, changed date to string
      const treatmentExample = { id: "treatment1", name: "Sumatriptan", type: "pharmacological", description: "Migraine relief", startDate: new Date("2025-02-15").toISOString(), status: "active" }; // Added required fields, changed date to string
      const responseExample = { treatmentId: "treatment1", assessmentDate: new Date("2025-03-01").toISOString(), clinicalResponse: "response", symptomChanges: [], sideEffects: [] }; // Added required fields, changed date to string

      const patientWithArrays = {
        id: "patient1",
        demographicData: {
          age: 45,
          biologicalSex: "male",
          anonymizationLevel: "clinical",
        },
        clinicalData: {
          symptoms: [symptomExample],
          diagnoses: [diagnosisExample],
          medications: [], // Assuming Treatment type covers medications for now, adjust if Medication type is distinct
          psychometricAssessments: [],
          medicalHistory: [],
        },
        treatmentData: { // Moved treatments and responses here
          currentTreatments: [treatmentExample],
          historicalTreatments: [],
          treatmentResponses: [responseExample],
        },
        neuralData: { brainScans: [] },
        dataAccessPermissions: { accessLevel: "full", authorizedUsers: [], consentStatus: "full", dataRetentionPolicy: "standard", lastReviewDate: new Date().toISOString() },
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      };

      const result = clinicalTypeVerifier.verifyPatient(patientWithArrays);
      expect(result.success).toBe(true);
      // Corrected assertions for arrays from patient.ts
      if (result.success) {
        expect(result.value.clinicalData.symptoms).toHaveLength(1);
        expect(result.value.clinicalData.diagnoses).toHaveLength(1);
        expect(result.value.treatmentData.currentTreatments).toHaveLength(1); // Check treatmentData
        expect(result.value.treatmentData.treatmentResponses).toHaveLength(1); // Check treatmentData
      }
    });

    it("fails when required properties are missing", () => {
      // Corrected structure for missing properties test (missing demographicData.age)
      const missingProps = {
        id: "patient1",
        demographicData: { // Changed from personalInfo
          // age: 45, // Missing required age
          biologicalSex: "male",
          anonymizationLevel: "clinical",
        },
        clinicalData: { symptoms: [], diagnoses: [], medications: [], psychometricAssessments: [], medicalHistory: [] },
        treatmentData: { currentTreatments: [], historicalTreatments: [], treatmentResponses: [] },
        neuralData: { brainScans: [] },
        dataAccessPermissions: { accessLevel: "full", authorizedUsers: [], consentStatus: "full", dataRetentionPolicy: "standard", lastReviewDate: new Date().toISOString() },
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      };

      expect(clinicalTypeVerifier.verifyPatient(missingProps).success).toBe(
        false,
      );
    });

    it("fails when arrays contain invalid items", () => {
      // Corrected structure for invalid array items test (invalid symptom)
      const invalidArrayItems = {
        id: "patient1",
        demographicData: { age: 45, biologicalSex: "male", anonymizationLevel: "clinical" }, // Changed from personalInfo
        clinicalData: {
          symptoms: [
            { id: "symptom1" }, // Missing required properties like name, category, severity, etc.
          ],
          diagnoses: [],
          medications: [],
          psychometricAssessments: [],
          medicalHistory: [],
        },
        treatmentData: { currentTreatments: [], historicalTreatments: [], treatmentResponses: [] },
        neuralData: { brainScans: [] },
        dataAccessPermissions: { accessLevel: "full", authorizedUsers: [], consentStatus: "full", dataRetentionPolicy: "standard", lastReviewDate: new Date().toISOString() },
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      };

      expect(
        clinicalTypeVerifier.verifyPatient(invalidArrayItems).success,
      ).toBe(false);
    });
  });

  describe("assertion functions", () => {
    it("assertRiskLevel passes for valid RiskLevel", () => {
      expect(() =>
        clinicalTypeVerifier.assertRiskLevel(RiskLevel.LOW),
      ).not.toThrow();
    });

    it("assertRiskLevel throws for invalid RiskLevel", () => {
      expect(() =>
        clinicalTypeVerifier.assertRiskLevel("INVALID_LEVEL"),
      ).toThrow(TypeVerificationError);
    });

    it("assertSymptom passes for valid Symptom", () => {
      const validSymptom = {
        id: "symptom1",
        name: "Headache",
        severity: 3,
      };

      expect(() =>
        clinicalTypeVerifier.assertSymptom(validSymptom),
      ).not.toThrow();
    });

    it("assertSymptom throws for invalid Symptom", () => {
      const invalidSymptom = {
        id: "symptom1",
        // Missing required properties
      };

      expect(() => clinicalTypeVerifier.assertSymptom(invalidSymptom)).toThrow(
        TypeVerificationError,
      );
    });

    it("assertPatient passes for valid Patient", () => {
      // Corrected structure for assertion test (using previously defined validPatient)
      const validPatientForAssertion = { // Renamed to avoid conflict
        id: "patient1",
        demographicData: { age: 45, biologicalSex: "male", anonymizationLevel: "clinical" },
        clinicalData: { symptoms: [], diagnoses: [], medications: [], psychometricAssessments: [], medicalHistory: [] },
        treatmentData: { currentTreatments: [], historicalTreatments: [], treatmentResponses: [] },
        neuralData: { brainScans: [] },
        dataAccessPermissions: { accessLevel: "full", authorizedUsers: [], consentStatus: "full", dataRetentionPolicy: "standard", lastReviewDate: new Date().toISOString() },
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      };

      // Use the correctly structured patient object
      expect(() =>
        clinicalTypeVerifier.assertPatient(validPatientForAssertion),
      ).not.toThrow();
    });

    it("assertPatient throws for invalid Patient", () => {
      // Corrected structure for invalid assertion test (missing demographicData)
      const invalidPatientForAssertion = { // Renamed to avoid conflict
        id: "patient1",
        // Missing demographicData, clinicalData, etc.
      };

      // Use the correctly structured invalid patient object
      expect(() => clinicalTypeVerifier.assertPatient(invalidPatientForAssertion)).toThrow(
        TypeVerificationError
      );
    });
  });
});

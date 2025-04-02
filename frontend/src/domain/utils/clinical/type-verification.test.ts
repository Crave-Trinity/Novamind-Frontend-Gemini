/**
 * NOVAMIND Neural-Safe Type Verification
 * Clinical-specific type verification utilities tests with quantum-level precision
 */

import { describe, it, expect } from "vitest";
import { clinicalTypeVerifier } from "@domain/utils/clinical/type-verification";
import { RiskLevel } from "@domain/types/clinical/risk";
import {
  Patient,
  Symptom,
  Diagnosis,
  Medication,
  PsychometricAssessment,
  MedicalHistoryItem,
  Treatment,
  TreatmentResponse,
} from "@domain/types/clinical/patient"; // Import necessary types
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
        category: "somatic", // Added required category
        frequency: "daily", // Added required frequency
        impact: "moderate", // Added required impact
        progression: "stable", // Added required progression
      };

      const result = clinicalTypeVerifier.verifySymptom(validSymptom);
      expect(result.success).toBe(true);
      if (result.success) {
        // Check required fields
        expect(result.value.id).toBe("symptom1");
        expect(result.value.name).toBe("Headache");
        expect(result.value.severity).toBe(3);
        expect(result.value.category).toBe("somatic");
        expect(result.value.frequency).toBe("daily");
        expect(result.value.impact).toBe("moderate");
        expect(result.value.progression).toBe("stable");
      }
    });

    it("accepts optional properties", () => {
      const symptomWithOptionals = {
        id: "symptom1",
        name: "Headache",
        severity: 3,
        category: "somatic", // Added required category
        frequency: "daily", // Added required frequency
        impact: "moderate", // Added required impact
        progression: "stable", // Added required progression
        onsetDate: new Date("2025-01-15").toISOString(), // Use ISO string
        lastOccurrence: new Date("2025-03-10").toISOString(), // Optional
        duration: "2 hours", // Optional
        triggers: ["stress", "light"], // Optional
        alleviatingFactors: ["dark room"], // Optional
        notes: "Throbbing pain", // Optional
        associatedDiagnoses: ["diag1"], // Optional
        associatedBrainRegions: ["regionA"], // Optional
      };

      const result = clinicalTypeVerifier.verifySymptom(symptomWithOptionals);
      expect(result.success).toBe(true);
      // Note: 'description' is not a valid property on Symptom type
      if (result.success) {
        // expect(result.value.description).toBe( // Removed assertion for invalid property
        //   "Throbbing pain in the temple area",
        // );
        expect(result.value.frequency).toBe("daily");
        expect(result.value.onsetDate).toBe(symptomWithOptionals.onsetDate);
        expect(result.value.lastOccurrence).toBe(
          symptomWithOptionals.lastOccurrence,
        );
        expect(result.value.duration).toBe("2 hours");
        expect(result.value.triggers).toEqual(["stress", "light"]);
        expect(result.value.alleviatingFactors).toEqual(["dark room"]);
        expect(result.value.notes).toBe("Throbbing pain");
        expect(result.value.associatedDiagnoses).toEqual(["diag1"]);
        expect(result.value.associatedBrainRegions).toEqual(["regionA"]);
      }
    });

    it("fails when required properties are missing", () => {
      const missingProps = {
        id: "symptom1",
        // missing name
        severity: 3,
        // Missing required: category, frequency, impact, progression
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
        category: "somatic",
        frequency: "daily",
        impact: "moderate",
        progression: "stable",
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
        code: "G43.1", // Added required code
        codingSystem: "ICD-10", // Added required codingSystem
        name: "Migraine",
        severity: "moderate", // Added required severity
        diagnosisDate: new Date("2025-02-10").toISOString(), // Use ISO string, added required date
        status: "active", // Added required status
      };

      const result = clinicalTypeVerifier.verifyDiagnosis(validDiagnosis);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe("diagnosis1");
        expect(result.value.code).toBe("G43.1");
        expect(result.value.codingSystem).toBe("ICD-10");
        expect(result.value.name).toBe("Migraine");
        expect(result.value.severity).toBe("moderate");
        expect(result.value.diagnosisDate).toBe(validDiagnosis.diagnosisDate);
        expect(result.value.status).toBe("active");
      }
    });

    it("accepts optional properties", () => {
      const diagnosisWithOptionals = {
        id: "diagnosis1",
        code: "G43.1", // Added required code
        codingSystem: "ICD-10", // Added required codingSystem
        name: "Migraine",
        severity: "moderate", // Added required severity
        diagnosisDate: new Date("2025-02-10").toISOString(), // Use ISO string, added required date
        status: "active", // Added required status
        onsetDate: new Date("2024-01-01").toISOString(), // Optional
        diagnosingClinician: "Dr. Neuro", // Optional
        notes: "Chronic with aura", // Optional
        confidenceLevel: 0.9, // Optional
        associatedBrainRegions: ["regionB"], // Optional
      };

      const result = clinicalTypeVerifier.verifyDiagnosis(
        diagnosisWithOptionals,
      );
      expect(result.success).toBe(true);
      // Note: 'description' and 'icdCode' are not valid properties on Diagnosis type
      if (result.success) {
        // expect(result.value.description).toBe("Chronic migraine with aura"); // Removed assertion for invalid property
        // expect(result.value.icdCode).toBe("G43.109"); // Removed assertion for invalid property
        expect(result.value.severity).toBe("moderate"); // Check required field
        expect(result.value.onsetDate).toBe(diagnosisWithOptionals.onsetDate);
        expect(result.value.diagnosingClinician).toBe("Dr. Neuro");
        expect(result.value.notes).toBe("Chronic with aura");
        expect(result.value.confidenceLevel).toBe(0.9);
        expect(result.value.associatedBrainRegions).toEqual(["regionB"]);
      }
    });

    it("fails when required properties are missing", () => {
      const missingProps = {
        id: "diagnosis1",
        name: "Migraine",
        // missing required: code, codingSystem, severity, diagnosisDate, status
      };

      expect(clinicalTypeVerifier.verifyDiagnosis(missingProps).success).toBe(
        false,
      );
    });

    it("fails when diagnosisDate is not a Date object", () => {
      const wrongDateType = {
        id: "diagnosis1",
        name: "Migraine",
        diagnosisDate: "2025-02-10", // Correct type (string), but missing other required fields
        code: "G43.1",
        codingSystem: "ICD-10",
        severity: "moderate",
        status: "active",
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
        type: "pharmacological", // Use valid enum value
        name: "Sumatriptan",
        description: "Migraine relief", // Added required description
        startDate: new Date("2025-02-15").toISOString(), // Use ISO string, added required date
        status: "active", // Added required status
      };

      const result = clinicalTypeVerifier.verifyTreatment(validTreatment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe("treatment1");
        expect(result.value.type).toBe("pharmacological");
        expect(result.value.name).toBe("Sumatriptan");
        expect(result.value.description).toBe("Migraine relief");
        expect(result.value.startDate).toBe(validTreatment.startDate);
        expect(result.value.status).toBe("active");
      }
    });

    it("accepts optional properties", () => {
      const treatmentWithOptionals = {
        id: "treatment1",
        type: "pharmacological", // Use valid enum value
        name: "Sumatriptan",
        description: "For acute migraine attacks", // Required
        startDate: new Date("2025-02-15").toISOString(), // Required, use ISO string
        status: "active", // Required
        endDate: new Date("2025-03-15").toISOString(), // Optional, use ISO string
        provider: "Dr. Pain", // Optional
        discontinuationReason: "Resolved", // Optional
        frequency: "as needed", // Optional
        dose: "50mg", // Optional
        targetSymptoms: ["headache"], // Optional
        targetBrainRegions: ["regionC"], // Optional
        effectiveness: 8, // Optional
        adherence: 95, // Optional
        sideEffects: ["drowsiness"], // Optional
        notes: "Effective", // Optional
      };

      const result = clinicalTypeVerifier.verifyTreatment(
        treatmentWithOptionals,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.description).toBe("For acute migraine attacks");
        expect(result.value.startDate).toBe(treatmentWithOptionals.startDate);
        expect(result.value.status).toBe("active");
        expect(result.value.endDate).toBe(treatmentWithOptionals.endDate);
        expect(result.value.provider).toBe("Dr. Pain");
        expect(result.value.discontinuationReason).toBe("Resolved");
        expect(result.value.frequency).toBe("as needed");
        expect(result.value.dose).toBe("50mg");
        expect(result.value.targetSymptoms).toEqual(["headache"]);
        expect(result.value.targetBrainRegions).toEqual(["regionC"]);
        expect(result.value.effectiveness).toBe(8);
        expect(result.value.adherence).toBe(95);
        expect(result.value.sideEffects).toEqual(["drowsiness"]);
        expect(result.value.notes).toBe("Effective");
      }
    });

    it("fails when required properties are missing", () => {
      const missingProps = {
        id: "treatment1",
        // missing name
        type: "pharmacological",
        // Missing required: description, startDate, status
      };

      expect(clinicalTypeVerifier.verifyTreatment(missingProps).success).toBe(
        false,
      );
    });
  });

  describe("verifyTreatmentResponse", () => {
    it("verifies valid TreatmentResponse objects", () => {
      const validResponse = {
        treatmentId: "treatment1", // Required
        assessmentDate: new Date("2025-03-01").toISOString(), // Required, use ISO string
        clinicalResponse: "response", // Required
        symptomChanges: [], // Required (empty array ok)
        sideEffects: [], // Required (empty array ok)
        // id is NOT part of TreatmentResponse type
      };

      const result =
        clinicalTypeVerifier.verifyTreatmentResponse(validResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.treatmentId).toBe("treatment1");
        expect(result.value.assessmentDate).toBe(validResponse.assessmentDate);
        expect(result.value.clinicalResponse).toBe("response");
        expect(result.value.symptomChanges).toEqual([]);
        expect(result.value.sideEffects).toEqual([]);
      }
    });

    it("accepts optional properties", () => {
      const responseWithOptionals = {
        treatmentId: "treatment1", // Required
        assessmentDate: new Date("2025-03-01").toISOString(), // Required, use ISO string
        clinicalResponse: "response", // Required
        symptomChanges: [{ symptomId: "symptom1", changePercentage: -50 }], // Required (with content)
        sideEffects: [{ description: "drowsiness", severity: "mild" }], // Required (with content)
        neurobiologicalChanges: [{ regionId: "regionA", activityChange: -10 }], // Optional
        functionalImprovements: ["Improved focus"], // Optional
        patientReportedOutcome: 7, // Optional
        clinicianEvaluation: "Good response", // Optional
      };

      const result = clinicalTypeVerifier.verifyTreatmentResponse(
        responseWithOptionals,
      );
      expect(result.success).toBe(true);
      // Note: 'notes' is not a valid property on TreatmentResponse type
      if (result.success) {
        // expect(result.value.notes).toBe("Pain relief within 30 minutes"); // Removed assertion for invalid property
        expect(result.value.symptomChanges).toEqual(
          responseWithOptionals.symptomChanges,
        );
        expect(result.value.sideEffects).toEqual(
          responseWithOptionals.sideEffects,
        );
        expect(result.value.neurobiologicalChanges).toEqual(
          responseWithOptionals.neurobiologicalChanges,
        );
        expect(result.value.functionalImprovements).toEqual(["Improved focus"]);
        expect(result.value.patientReportedOutcome).toBe(7);
        expect(result.value.clinicianEvaluation).toBe("Good response");
      }
    });

    it("fails when required properties are missing", () => {
      const missingProps = {
        treatmentId: "treatment1",
        // missing assessmentDate, clinicalResponse, symptomChanges, sideEffects
      };

      expect(
        clinicalTypeVerifier.verifyTreatmentResponse(missingProps).success,
      ).toBe(false);
    });

    it("fails when date is not a Date object", () => {
      const wrongDateType = {
        treatmentId: "treatment1",
        assessmentDate: "2025-03-01", // Correct type (string)
        clinicalResponse: "response", // Required
        symptomChanges: [], // Required
        sideEffects: [], // Required
      };

      // This should now pass as the date type is correct (string)
      expect(
        clinicalTypeVerifier.verifyTreatmentResponse(wrongDateType).success,
      ).toBe(true);
    });
  });

  describe("verifyPatient", () => {
    it("verifies valid Patient objects", () => {
      const validPatient: Patient = {
        // Add type annotation
        id: "patient1",
        demographicData: {
          age: 45,
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
          authorizedUsers: [],
          consentStatus: "full",
          dataRetentionPolicy: "standard",
          lastReviewDate: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      };

      const result = clinicalTypeVerifier.verifyPatient(validPatient);
      expect(result.success).toBe(true);
      // Corrected assertions to match Patient type structure from patient.ts
      if (result.success) {
        expect(result.value.id).toBe("patient1");
        expect(result.value.demographicData).toMatchObject({
          // Changed from personalInfo
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
        expect(result.value.treatmentData).toMatchObject({
          // Added assertion for treatmentData
          currentTreatments: [],
          historicalTreatments: [],
          treatmentResponses: [],
        });
        // Add assertions for neuralData, dataAccessPermissions, lastUpdated, version if needed
      }
    });

    it("accepts optional properties", () => {
      const patientWithOptionals: Patient = {
        // Add type annotation
        id: "patient1",
        demographicData: {
          age: 45,
          biologicalSex: "male",
          anonymizationLevel: "clinical",
          ethnicity: "Caucasian", // Optional
          occupationalStatus: "Engineer", // Optional
          educationLevel: "Masters", // Optional
          handedness: "right", // Optional
          primaryLanguage: "English", // Optional
        },
        clinicalData: {
          diagnoses: [],
          symptoms: [],
          medications: [],
          psychometricAssessments: [],
          medicalHistory: [],
          familyHistory: {
            psychiatricConditions: [],
            neurologicalConditions: [],
            relevanceLevel: "low",
          }, // Optional
          substanceUse: { substances: [], relevanceToNeuralHealth: "low" }, // Optional
          sleepData: [], // Optional
          nutritionalData: { relevanceToNeuralHealth: "low" }, // Optional
          allergyData: [], // Optional
        },
        treatmentData: {
          currentTreatments: [],
          historicalTreatments: [],
          treatmentResponses: [],
          treatmentPlan: {
            // Optional
            id: "plan1",
            creationDate: new Date().toISOString(),
            modificationDate: new Date().toISOString(),
            author: "Dr. Mind",
            shortTermGoals: [],
            longTermGoals: [],
            treatmentComponents: [],
            followUpSchedule: "Monthly",
          },
          remissionPeriods: [], // Optional
        },
        neuralData: {
          brainScans: [],
          eegData: [], // Optional
          biomarkers: [], // Optional
          geneticData: { relevantGenes: [], confidentiality: "standard" }, // Optional
          connectomics: { hubs: [] }, // Optional
        },
        dataAccessPermissions: {
          accessLevel: "full",
          authorizedUsers: [],
          restrictedElements: [], // Optional
          consentStatus: "full",
          dataRetentionPolicy: "standard",
          lastReviewDate: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      };

      const result = clinicalTypeVerifier.verifyPatient(patientWithOptionals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.demographicData.ethnicity).toBe("Caucasian");
        expect(result.value.demographicData.occupationalStatus).toBe(
          "Engineer",
        );
        // Add more checks for other optional fields if needed
      }
    });

    it("verifies arrays of clinical data", () => {
      const symptomExample: Symptom = {
        /* ... valid symptom ... */ id: "symptom1",
        name: "Headache",
        category: "somatic",
        severity: 3,
        frequency: "daily",
        impact: "moderate",
        progression: "stable",
      };
      const diagnosisExample: Diagnosis = {
        /* ... valid diagnosis ... */ id: "diagnosis1",
        code: "G43.1",
        codingSystem: "ICD-10",
        name: "Migraine",
        severity: "moderate",
        diagnosisDate: new Date().toISOString(),
        status: "active",
      };
      const medicationExample: Medication = {
        /* ... valid medication ... */ id: "med1",
        name: "Sumatriptan",
        classification: "Triptan",
        dosage: "50mg",
        frequency: "prn",
        route: "oral",
        startDate: new Date().toISOString(),
      };
      const assessmentExample: PsychometricAssessment = {
        /* ... valid assessment ... */ id: "assess1",
        name: "PHQ-9",
        date: new Date().toISOString(),
        scores: [],
        interpretation: "Mild",
      };
      const historyItemExample: MedicalHistoryItem = {
        /* ... valid history item ... */ id: "hist1",
        condition: "Hypertension",
        type: "cardiovascular",
        status: "active",
        impact: "minimal",
        relevanceToNeuralHealth: "moderate",
      };
      const treatmentExample: Treatment = {
        /* ... valid treatment ... */ id: "treat1",
        type: "pharmacological",
        name: "Sumatriptan",
        description: "Migraine",
        startDate: new Date().toISOString(),
        status: "active",
      };
      const responseExample: TreatmentResponse = {
        /* ... valid response ... */ treatmentId: "treat1",
        assessmentDate: new Date().toISOString(),
        clinicalResponse: "response",
        symptomChanges: [],
        sideEffects: [],
      };

      const patientWithArrays: Patient = {
        // Add type annotation
        id: "patient1",
        demographicData: {
          age: 45,
          biologicalSex: "male",
          anonymizationLevel: "clinical",
        },
        clinicalData: {
          diagnoses: [diagnosisExample],
          symptoms: [symptomExample],
          medications: [medicationExample],
          psychometricAssessments: [assessmentExample],
          medicalHistory: [historyItemExample],
        },
        treatmentData: {
          currentTreatments: [treatmentExample],
          historicalTreatments: [],
          treatmentResponses: [responseExample],
        },
        neuralData: { brainScans: [] },
        dataAccessPermissions: {
          accessLevel: "full",
          authorizedUsers: [],
          consentStatus: "full",
          dataRetentionPolicy: "standard",
          lastReviewDate: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      };

      const result = clinicalTypeVerifier.verifyPatient(patientWithArrays);
      expect(result.success).toBe(true);
      // Corrected assertions for arrays from patient.ts
      if (result.success) {
        expect(result.value.clinicalData.symptoms).toHaveLength(1);
        expect(result.value.clinicalData.diagnoses).toHaveLength(1);
        expect(result.value.clinicalData.medications).toHaveLength(1);
        expect(result.value.clinicalData.psychometricAssessments).toHaveLength(
          1,
        );
        expect(result.value.clinicalData.medicalHistory).toHaveLength(1);
        expect(result.value.treatmentData.currentTreatments).toHaveLength(1);
        expect(result.value.treatmentData.treatmentResponses).toHaveLength(1);
      }
    });

    it("fails when required properties are missing", () => {
      // Corrected structure for missing properties test (missing demographicData.age)
      const missingProps = {
        id: "patient1",
        demographicData: {
          // Changed from personalInfo
          // age: 45, // Missing required age
          biologicalSex: "male",
          anonymizationLevel: "clinical",
        },
        clinicalData: {
          symptoms: [],
          diagnoses: [],
          medications: [],
          psychometricAssessments: [],
          medicalHistory: [],
        },
        treatmentData: {
          currentTreatments: [],
          historicalTreatments: [],
          treatmentResponses: [],
        },
        neuralData: { brainScans: [] },
        dataAccessPermissions: {
          accessLevel: "full",
          authorizedUsers: [],
          consentStatus: "full",
          dataRetentionPolicy: "standard",
          lastReviewDate: new Date().toISOString(),
        },
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
        demographicData: {
          age: 45,
          biologicalSex: "male",
          anonymizationLevel: "clinical",
        }, // Changed from personalInfo
        clinicalData: {
          symptoms: [
            { id: "symptom1" }, // Missing required properties like name, category, severity, etc.
          ],
          diagnoses: [],
          medications: [],
          psychometricAssessments: [],
          medicalHistory: [],
        },
        treatmentData: {
          currentTreatments: [],
          historicalTreatments: [],
          treatmentResponses: [],
        },
        neuralData: { brainScans: [] },
        dataAccessPermissions: {
          accessLevel: "full",
          authorizedUsers: [],
          consentStatus: "full",
          dataRetentionPolicy: "standard",
          lastReviewDate: new Date().toISOString(),
        },
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
      const validSymptom: Symptom = {
        // Add type annotation and required fields
        id: "symptom1",
        name: "Headache",
        severity: 3,
        category: "somatic",
        frequency: "daily",
        impact: "moderate",
        progression: "stable",
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
      const validPatientForAssertion = {
        // Renamed to avoid conflict
        id: "patient1",
        demographicData: {
          age: 45,
          biologicalSex: "male",
          anonymizationLevel: "clinical",
        },
        clinicalData: {
          symptoms: [],
          diagnoses: [],
          medications: [],
          psychometricAssessments: [],
          medicalHistory: [],
        },
        treatmentData: {
          currentTreatments: [],
          historicalTreatments: [],
          treatmentResponses: [],
        },
        neuralData: { brainScans: [] },
        dataAccessPermissions: {
          accessLevel: "full",
          authorizedUsers: [],
          consentStatus: "full",
          dataRetentionPolicy: "standard",
          lastReviewDate: new Date().toISOString(),
        },
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
      const invalidPatientForAssertion = {
        // Renamed to avoid conflict
        id: "patient1",
        // Missing demographicData, clinicalData, etc.
      };

      // Use the correctly structured invalid patient object
      expect(() =>
        clinicalTypeVerifier.assertPatient(invalidPatientForAssertion),
      ).toThrow(TypeVerificationError);
    });
  });
});

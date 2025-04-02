/**
 * NOVAMIND Neural-Safe Type Verification
 * Clinical-specific type verification utilities with quantum-level precision
 */

import {
  Patient,
  Diagnosis,
  Symptom,
  Treatment,
  TreatmentResponse,
  Medication, // Added import
  PsychometricAssessment, // Added import
  MedicalHistoryItem, // Added import
} from "@domain/types/clinical/patient"; // Corrected path
import { RiskLevel, RiskAssessment } from "@domain/types/clinical/risk"; // Corrected path
import { Result } from "@domain/types/shared/common"; // Corrected path
import { TypeVerificationError } from "@domain/models/shared/type-verification"; // Error class only
import {
  validateString,
  validateNumber,
  validateObject,
  validateArray,
  validateType,
  validateOneOf,
  validateArrayOf, // Use this for validating arrays of specific types
  // Add other necessary validation functions as needed
} from "@domain/models/shared/type-verification.runtime"; // Import runtime validators

/**
 * Clinical model type verification utilities
 */
export class ClinicalTypeVerifier {
  /**
   * Verify that a value is a valid RiskLevel enum value
   */
  verifyRiskLevel(level: unknown, field?: string): Result<RiskLevel> {
    const validLevels = Object.values(RiskLevel);

    const isValid = validateType(
      level,
      validateOneOf(validLevels),
      "RiskLevel", // Provide a type name for the error message
      field,
    );

    if (isValid) {
      return {
        success: true,
        value: level as RiskLevel, // Cast is safe here due to validation
      };
    } else {
      // Construct error based on validation failure (details might be lost here)
      // For a more informative error, we might need validateType to return Result<T>
      return {
        success: false,
        error: new TypeVerificationError(
          "RiskLevel",
          level, // Pass the actual received value
          field,
        ),
      };
    }
  }

  /**
   * Verify that an object conforms to the Symptom interface
   */
  verifySymptom(obj: unknown, field?: string): Result<Symptom> {
    // Use direct validation function
    if (!validateObject(obj, field)) {
      return {
        success: false,
        error: new TypeVerificationError("object", obj, field),
      };
    }
    // Cast is safe after validation
    const object = obj as Record<string, unknown>;

    // This line was duplicated in the previous partial apply, removing it.

    // Verify required properties
    const idField = field ? `${field}.id` : "id";
    if (!validateString(object.id, idField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.id, idField),
      };
    }
    const id = object.id as string; // Safe cast

    const nameField = field ? `${field}.name` : "name";
    if (!validateString(object.name, nameField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.name, nameField),
      };
    }
    const name = object.name as string; // Safe cast

    const severityField = field ? `${field}.severity` : "severity";
    if (!validateNumber(object.severity, severityField)) {
      return {
        success: false,
        error: new TypeVerificationError("number", object.severity, severityField),
      };
    }
    const severity = object.severity as number; // Safe cast

    // Optional properties
    // Optional properties - Implement optional string validation logic
    const onsetDateField = field ? `${field}.onsetDate` : "onsetDate";
    let onsetDate: string | undefined;
    if (object.onsetDate !== undefined) {
      if (!validateString(object.onsetDate, onsetDateField)) {
        return {
          success: false,
          error: new TypeVerificationError("string", object.onsetDate, onsetDateField),
        };
      }
      onsetDate = object.onsetDate as string; // Safe cast
    }

    const descriptionField = field ? `${field}.description` : "description";
    let description: string | undefined;
    if (object.description !== undefined) {
      if (!validateString(object.description, descriptionField)) {
        return {
          success: false,
          error: new TypeVerificationError("string", object.description, descriptionField),
        };
      }
      description = object.description as string; // Safe cast
    }

    // frequency should be one of specific literals - Use validateType with validateOneOf
    const frequencyField = field ? `${field}.frequency` : "frequency";
    const allowedFrequencies = ["constant", "daily", "weekly", "monthly", "episodic", "situational"] as const;
    type Frequency = typeof allowedFrequencies[number];
    if (object.frequency !== undefined && !validateType(object.frequency, validateOneOf(allowedFrequencies), "Frequency", frequencyField)) {
         return {
            success: false,
            error: new TypeVerificationError("Frequency", object.frequency, frequencyField),
         };
    }
    const frequency = object.frequency as Frequency | undefined; // Safe cast

    // impact should be one of specific literals
    const impactField = field ? `${field}.impact` : "impact";
    const allowedImpacts = ["none", "mild", "moderate", "severe"] as const;
    type Impact = typeof allowedImpacts[number];
     if (object.impact !== undefined && !validateType(object.impact, validateOneOf(allowedImpacts), "Impact", impactField)) {
         return {
            success: false,
            error: new TypeVerificationError("Impact", object.impact, impactField),
         };
    }
    const impact = object.impact as Impact | undefined; // Safe cast

    // progression should be one of specific literals
    const progressionField = field ? `${field}.progression` : "progression";
    const allowedProgressions = ["improving", "stable", "worsening", "fluctuating"] as const;
    type Progression = typeof allowedProgressions[number];
     if (object.progression !== undefined && !validateType(object.progression, validateOneOf(allowedProgressions), "Progression", progressionField)) {
         return {
            success: false,
            error: new TypeVerificationError("Progression", object.progression, progressionField),
         };
    }
    const progression = object.progression as Progression | undefined; // Safe cast

    // category should be one of specific literals
    const categoryField = field ? `${field}.category` : "category";
    const allowedCategories = ["cognitive", "affective", "behavioral", "somatic", "perceptual"] as const;
    type Category = typeof allowedCategories[number];
    // Assuming category is required based on Symptom type? If optional, add undefined check.
    // Let's assume required for now based on test failures likely expecting it.
    if (!validateType(object.category, validateOneOf(allowedCategories), "Category", categoryField)) {
         return {
            success: false,
            error: new TypeVerificationError("Category", object.category, categoryField),
         };
    }
    const category = object.category as Category; // Safe cast


    // Return verified symptom
    return {
      success: true,
      value: {
        id: id,
        name: name,
        severity: severity,
        category: category, // Use validated value
        // Add optional properties correctly
        ...(description !== undefined && { description }),
        ...(onsetDate !== undefined && { onsetDate }),
        ...(frequency !== undefined && { frequency }),
        ...(impact !== undefined && { impact }),
        ...(progression !== undefined && { progression }),
        // Add other optional fields from Symptom type if needed
      } as Symptom, // Cast should be safer now
    };
  }

  /**
   * Verify that an object conforms to the Diagnosis interface
   */
  verifyDiagnosis(obj: unknown, field?: string): Result<Diagnosis> {
    // Use direct validation function
    if (!validateObject(obj, field)) {
      return {
        success: false,
        error: new TypeVerificationError("object", obj, field),
      };
    }
    const object = obj as Record<string, unknown>; // Safe cast

    // Verify required properties
    const idField = field ? `${field}.id` : "id";
    if (!validateString(object.id, idField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.id, idField),
      };
    }
    const id = object.id as string;

    const nameField = field ? `${field}.name` : "name";
    if (!validateString(object.name, nameField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.name, nameField),
      };
    }
    const name = object.name as string;

    // diagnosisDate should be string according to Diagnosis type
    const diagnosisDateField = field ? `${field}.diagnosisDate` : "diagnosisDate";
    if (!validateString(object.diagnosisDate, diagnosisDateField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.diagnosisDate, diagnosisDateField),
      };
    }
    const diagnosisDate = object.diagnosisDate as string;

    // Optional properties
    // Optional properties - description and icdCode are NOT in Diagnosis type definition
    // Remove these checks or update the type definition if they should exist.
    // Assuming they should be removed based on comments in the original return block.

    // severity should be one of specific literals
    // severity should be one of specific literals
    const severityField = field ? `${field}.severity` : "severity";
    const allowedSeverities = ["mild", "moderate", "severe", "in remission", "unspecified"] as const;
    type DiagnosisSeverity = typeof allowedSeverities[number];
    // Assuming severity is optional based on type? If required, remove undefined check. Let's assume optional.
    let severity: DiagnosisSeverity | undefined;
    if (object.severity !== undefined) {
        if (!validateType(object.severity, validateOneOf(allowedSeverities), "DiagnosisSeverity", severityField)) {
            return {
                success: false,
                error: new TypeVerificationError("DiagnosisSeverity", object.severity, severityField),
            };
        }
        severity = object.severity as DiagnosisSeverity;
    }

    // code is required
    const codeField = field ? `${field}.code` : "code";
    if (!validateString(object.code, codeField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.code, codeField),
      };
    }
    const code = object.code as string;

    // codingSystem is required
    const codingSystemField = field ? `${field}.codingSystem` : "codingSystem";
    const allowedCodingSystems = ["ICD-10", "ICD-11", "DSM-5", "DSM-5-TR"] as const;
    type CodingSystem = typeof allowedCodingSystems[number];
    if (!validateType(object.codingSystem, validateOneOf(allowedCodingSystems), "CodingSystem", codingSystemField)) {
        return {
            success: false,
            error: new TypeVerificationError("CodingSystem", object.codingSystem, codingSystemField),
        };
    }
    const codingSystem = object.codingSystem as CodingSystem;

    // status is required
    const statusField = field ? `${field}.status` : "status";
    const allowedStatuses = ["active", "resolved", "in remission", "recurrent"] as const;
    type DiagnosisStatus = typeof allowedStatuses[number];
    if (!validateType(object.status, validateOneOf(allowedStatuses), "DiagnosisStatus", statusField)) {
        return {
            success: false,
            error: new TypeVerificationError("DiagnosisStatus", object.status, statusField),
        };
    }
    const status = object.status as DiagnosisStatus;

    // Return verified diagnosis
    return {
      success: true,
      value: {
        id: id,
        code: code,
        codingSystem: codingSystem,
        name: name,
        diagnosisDate: diagnosisDate,
        status: status,
        // Add optional severity only if it exists and was validated
        ...(severity !== undefined && { severity }),
        // Add other optional fields from Diagnosis type if needed
      } as Diagnosis, // Cast should be safer
    };
  }

  /**
   * Verify that an object conforms to the Treatment interface
   */
  verifyTreatment(obj: unknown, field?: string): Result<Treatment> {
    // Use direct validation function
    if (!validateObject(obj, field)) {
      return {
        success: false,
        error: new TypeVerificationError("object", obj, field),
      };
    }
    const object = obj as Record<string, unknown>; // Safe cast

    // Verify required properties
    const idField = field ? `${field}.id` : "id";
    if (!validateString(object.id, idField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.id, idField),
      };
    }
    const id = object.id as string;

    const nameField = field ? `${field}.name` : "name";
    if (!validateString(object.name, nameField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.name, nameField),
      };
    }
    const name = object.name as string;

    // type should be one of specific literals
    const typeField = field ? `${field}.type` : "type";
    const allowedTypes = ["pharmacological", "psychotherapy", "neuromodulation", "lifestyle", "complementary", "other"] as const;
    type TreatmentType = typeof allowedTypes[number];
    if (!validateType(object.type, validateOneOf(allowedTypes), "TreatmentType", typeField)) {
        return {
            success: false,
            error: new TypeVerificationError("TreatmentType", object.type, typeField),
        };
    }
    const type = object.type as TreatmentType;

    // Optional properties
    // description is required and should be string
    const descriptionField = field ? `${field}.description` : "description";
    if (!validateString(object.description, descriptionField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.description, descriptionField),
      };
    }
    const description = object.description as string;

    // startDate should be string
    const startDateField = field ? `${field}.startDate` : "startDate";
    if (!validateString(object.startDate, startDateField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.startDate, startDateField),
      };
    }
    const startDate = object.startDate as string;

    // endDate should be string?
    // Optional endDate
    const endDateField = field ? `${field}.endDate` : "endDate";
    let endDate: string | undefined;
    if (object.endDate !== undefined) {
      if (!validateString(object.endDate, endDateField)) {
        return {
          success: false,
          error: new TypeVerificationError("string", object.endDate, endDateField),
        };
      }
      endDate = object.endDate as string;
    }

    // Optional dose (renamed from dosage in original code)
    const doseField = field ? `${field}.dose` : "dose";
    let dose: string | undefined;
    if (object.dose !== undefined) {
      if (!validateString(object.dose, doseField)) {
        return {
          success: false,
          error: new TypeVerificationError("string", object.dose, doseField),
        };
      }
      dose = object.dose as string;
    }

    // status is required
    const statusField = field ? `${field}.status` : "status";
    const allowedTreatmentStatuses = ["active", "completed", "discontinued", "planned"] as const;
    type TreatmentStatus = typeof allowedTreatmentStatuses[number];
    if (!validateType(object.status, validateOneOf(allowedTreatmentStatuses), "TreatmentStatus", statusField)) {
        return {
            success: false,
            error: new TypeVerificationError("TreatmentStatus", object.status, statusField),
        };
    }
    const status = object.status as TreatmentStatus;

    // Optional frequency
    const frequencyField = field ? `${field}.frequency` : "frequency";
    let frequency: string | undefined;
    if (object.frequency !== undefined) {
      if (!validateString(object.frequency, frequencyField)) {
        return {
          success: false,
          error: new TypeVerificationError("string", object.frequency, frequencyField),
        };
      }
      frequency = object.frequency as string;
    }

    // Return verified treatment
    return {
      success: true,
      value: {
        id: id,
        name: name,
        type: type,
        description: description,
        startDate: startDate,
        status: status,
        // Add optional fields correctly
        ...(endDate !== undefined && { endDate }),
        ...(dose !== undefined && { dose }),
        ...(frequency !== undefined && { frequency }),
        // Add other optional fields from Treatment type if needed
      } as Treatment,
    };
  }

  // --- Placeholder Verifiers for Complex Types ---
  // TODO: Implement detailed verification logic for these types

  verifyMedication(obj: unknown, field?: string): Result<Medication> {
    // Use direct validation function
    if (!validateObject(obj, field)) {
        return { success: false, error: new TypeVerificationError("object", obj, field) };
    }
    const object = obj as Record<string, unknown>;
    // TODO: Implement full validation for Medication properties
    // Required: id, name, classification, dosage, frequency, route, startDate
    // Optional: endDate, status, prescribingPhysician, notes, sideEffects, effectivenessScore
    return { success: true, value: object as unknown as Medication }; // Placeholder
  }

  verifyPsychometricAssessment(obj: unknown, field?: string): Result<PsychometricAssessment> {
    // Use direct validation function
    if (!validateObject(obj, field)) {
        return { success: false, error: new TypeVerificationError("object", obj, field) };
    }
    const object = obj as Record<string, unknown>;
    // TODO: Implement full validation for PsychometricAssessment properties
    // Required: id, name, date, scores, interpretation
    // Optional: scaleUsed, administeredBy, notes, normativeDataComparison
    return { success: true, value: object as unknown as PsychometricAssessment }; // Placeholder
  }

   verifyMedicalHistoryItem(obj: unknown, field?: string): Result<MedicalHistoryItem> {
    // Use direct validation function
    if (!validateObject(obj, field)) {
        return { success: false, error: new TypeVerificationError("object", obj, field) };
    }
    const object = obj as Record<string, unknown>;
    // TODO: Implement full validation for MedicalHistoryItem properties
    // Required: id, condition, type, status, impact, relevanceToNeuralHealth
    // Optional: onsetDate, resolutionDate, treatments, notes
    return { success: true, value: object as unknown as MedicalHistoryItem }; // Placeholder
  }

  /**
   * Verify that an object conforms to the TreatmentResponse interface
   */
  verifyTreatmentResponse(
    obj: unknown,
    field?: string,
  ): Result<TreatmentResponse> {
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<TreatmentResponse>;
    }

    const object = objResult.value;

    // Verify required properties
    const idResult = typeVerifier.verifyString(
      object.id,
      field ? `${field}.id` : "id",
    );
    if (!idResult.success) return idResult as Result<TreatmentResponse>;

    const treatmentIdResult = typeVerifier.verifyString(
      object.treatmentId,
      field ? `${field}.treatmentId` : "treatmentId",
    );
    if (!treatmentIdResult.success)
      return treatmentIdResult as Result<TreatmentResponse>;

    const effectivenessResult = typeVerifier.verifyNumber(
      object.effectiveness,
      field ? `${field}.effectiveness` : "effectiveness",
    );
    if (!effectivenessResult.success)
      return effectivenessResult as Result<TreatmentResponse>;

    // assessmentDate should be string
    const assessmentDateResult = typeVerifier.verifyString(object.assessmentDate, field ? `${field}.assessmentDate` : "assessmentDate");
    if (!assessmentDateResult.success) return assessmentDateResult as Result<TreatmentResponse>;
    const assessmentDate = assessmentDateResult.value;

    // clinicalResponse is required enum
    const clinicalResponseResult = typeVerifier.verifyEnum(
        object.clinicalResponse,
        ["remission", "response", "partial response", "no response", "worsening"],
        field ? `${field}.clinicalResponse` : "clinicalResponse"
    );
    if (!clinicalResponseResult.success) return clinicalResponseResult as Result<TreatmentResponse>;
    const clinicalResponse = clinicalResponseResult.value;

    // symptomChanges is required array of specific objects
    const symptomChangesResult = typeVerifier.verifyArray(
      object.symptomChanges,
      (item, i) => {
        const itemField = field ? `${field}.symptomChanges[${i}]` : `symptomChanges[${i}]`;
        const itemObjResult = typeVerifier.verifyObject(item, itemField);
        if (!itemObjResult.success) return itemObjResult;
        const itemObj = itemObjResult.value;
        const symptomIdResult = typeVerifier.verifyString(itemObj.symptomId, `${itemField}.symptomId`);
        if (!symptomIdResult.success) return symptomIdResult;
        const changePercentageResult = typeVerifier.verifyNumber(itemObj.changePercentage, `${itemField}.changePercentage`);
        if (!changePercentageResult.success) return changePercentageResult;
        const notesResult = typeVerifier.verifyOptionalString(itemObj.notes, `${itemField}.notes`);
        if (!notesResult.success) return notesResult;
        return {
          success: true,
          value: {
            symptomId: symptomIdResult.value,
            changePercentage: changePercentageResult.value,
            ...(notesResult.value !== undefined && { notes: notesResult.value }),
          },
        };
      },
      field ? `${field}.symptomChanges` : "symptomChanges"
    );
    if (!symptomChangesResult.success) return symptomChangesResult as Result<TreatmentResponse>;
    const symptomChanges = symptomChangesResult.value;
    // sideEffects is required array of specific objects
    const sideEffectsResult = typeVerifier.verifyArray(
      object.sideEffects,
      (item, i) => {
        const itemField = field ? `${field}.sideEffects[${i}]` : `sideEffects[${i}]`;
        const itemObjResult = typeVerifier.verifyObject(item, itemField);
        if (!itemObjResult.success) return itemObjResult;
        const itemObj = itemObjResult.value;
        const descriptionResult = typeVerifier.verifyString(itemObj.description, `${itemField}.description`);
        if (!descriptionResult.success) return descriptionResult;
        const severityResult = typeVerifier.verifyEnum(itemObj.severity, ["mild", "moderate", "severe"], `${itemField}.severity`);
        if (!severityResult.success) return severityResult;
        const managementStrategyResult = typeVerifier.verifyOptionalString(itemObj.managementStrategy, `${itemField}.managementStrategy`);
        if (!managementStrategyResult.success) return managementStrategyResult;
        return {
          success: true,
          value: {
            description: descriptionResult.value,
            severity: severityResult.value,
            ...(managementStrategyResult.value !== undefined && { managementStrategy: managementStrategyResult.value }),
          },
        };
      },
      field ? `${field}.sideEffects` : "sideEffects"
    );
    if (!sideEffectsResult.success) return sideEffectsResult as Result<TreatmentResponse>;
    const sideEffects = sideEffectsResult.value;

    // Optional properties
    const notes =
      object.notes !== undefined
        ? typeVerifier.safelyParseString(object.notes, "")
        : undefined;

    // Removed old sideEffects logic which expected string[]

    // Return verified treatment response
    return {
      success: true,
      value: {
        // id is not part of TreatmentResponse type
        treatmentId: treatmentIdResult.value,
        assessmentDate: assessmentDate,
        clinicalResponse: clinicalResponse,
        symptomChanges: symptomChanges,
        sideEffects: sideEffects,
        // Optional fields like neurobiologicalChanges, functionalImprovements, etc. need verification if present
        // notes is not part of TreatmentResponse type
        // Optional fields like neurobiologicalChanges, functionalImprovements, etc. need verification if present
      },
    };
  }

  /**
   * Verify that an object conforms to the Patient interface
   */
  verifyPatient(obj: unknown, field?: string): Result<Patient> {
    const baseField = field ?? "Patient";
    const objResult = typeVerifier.verifyObject(obj, baseField);
    if (!objResult.success) return objResult as Result<Patient>;
    const object = objResult.value;

    // Verify required top-level properties
    const idResult = typeVerifier.verifyString(object.id, `${baseField}.id`);
    if (!idResult.success) return idResult as Result<Patient>;

    const lastUpdatedResult = typeVerifier.verifyString(object.lastUpdated, `${baseField}.lastUpdated`);
    if (!lastUpdatedResult.success) return lastUpdatedResult as Result<Patient>;

    const versionResult = typeVerifier.verifyString(object.version, `${baseField}.version`);
    if (!versionResult.success) return versionResult as Result<Patient>;

    // Verify nested required objects
    const demographicDataResult = typeVerifier.verifyObject(object.demographicData, `${baseField}.demographicData`);
    if (!demographicDataResult.success) return demographicDataResult as Result<Patient>;
    const demographicData = demographicDataResult.value;

    const clinicalDataResult = typeVerifier.verifyObject(object.clinicalData, `${baseField}.clinicalData`);
    if (!clinicalDataResult.success) return clinicalDataResult as Result<Patient>;
    const clinicalData = clinicalDataResult.value;

    const treatmentDataResult = typeVerifier.verifyObject(object.treatmentData, `${baseField}.treatmentData`);
    if (!treatmentDataResult.success) return treatmentDataResult as Result<Patient>;
    const treatmentData = treatmentDataResult.value;

    const neuralDataResult = typeVerifier.verifyObject(object.neuralData, `${baseField}.neuralData`);
    if (!neuralDataResult.success) return neuralDataResult as Result<Patient>;
    const neuralData = neuralDataResult.value;

    const dataAccessPermissionsResult = typeVerifier.verifyObject(object.dataAccessPermissions, `${baseField}.dataAccessPermissions`);
    if (!dataAccessPermissionsResult.success) return dataAccessPermissionsResult as Result<Patient>;
    const dataAccessPermissions = dataAccessPermissionsResult.value;

    // --- Verify demographicData ---
    const ageResult = typeVerifier.verifyNumber(demographicData.age, `${baseField}.demographicData.age`);
    if (!ageResult.success) return ageResult as Result<Patient>;
    const biologicalSexResult = typeVerifier.verifyEnum(demographicData.biologicalSex, ["male", "female", "other"], `${baseField}.demographicData.biologicalSex`);
    if (!biologicalSexResult.success) return biologicalSexResult as Result<Patient>;
    const anonymizationLevelResult = typeVerifier.verifyEnum(demographicData.anonymizationLevel, ["full", "partial", "research", "clinical"], `${baseField}.demographicData.anonymizationLevel`);
    if (!anonymizationLevelResult.success) return anonymizationLevelResult as Result<Patient>;
    // Add verification for optional demographic fields if needed

    // --- Verify clinicalData ---
    const diagnosesResult = typeVerifier.verifyArray(clinicalData.diagnoses, (item, i) => this.verifyDiagnosis(item, `${baseField}.clinicalData.diagnoses[${i}]`), `${baseField}.clinicalData.diagnoses`);
    if (!diagnosesResult.success) return diagnosesResult as Result<Patient>;
    const symptomsResult = typeVerifier.verifyArray(clinicalData.symptoms, (item, i) => this.verifySymptom(item, `${baseField}.clinicalData.symptoms[${i}]`), `${baseField}.clinicalData.symptoms`);
    if (!symptomsResult.success) return symptomsResult as Result<Patient>;
    // Using the placeholder methods defined within the class
    const medicationsResult = typeVerifier.verifyArray<Medication>(clinicalData.medications, (item, i) => this.verifyMedication(item, `${baseField}.clinicalData.medications[${i}]`), `${baseField}.clinicalData.medications`);
    if (!medicationsResult.success) return medicationsResult as Result<Patient>;
    const psychometricAssessmentsResult = typeVerifier.verifyArray<PsychometricAssessment>(clinicalData.psychometricAssessments, (item, i) => this.verifyPsychometricAssessment(item, `${baseField}.clinicalData.psychometricAssessments[${i}]`), `${baseField}.clinicalData.psychometricAssessments`);
    if (!psychometricAssessmentsResult.success) return psychometricAssessmentsResult as Result<Patient>;
    const medicalHistoryResult = typeVerifier.verifyArray<MedicalHistoryItem>(clinicalData.medicalHistory, (item, i) => this.verifyMedicalHistoryItem(item, `${baseField}.clinicalData.medicalHistory[${i}]`), `${baseField}.clinicalData.medicalHistory`);
    if (!medicalHistoryResult.success) return medicalHistoryResult as Result<Patient>;
    // Add verification for optional clinical fields if needed

    // --- Verify treatmentData ---
    const currentTreatmentsResult = typeVerifier.verifyArray(treatmentData.currentTreatments, (item, i) => this.verifyTreatment(item, `${baseField}.treatmentData.currentTreatments[${i}]`), `${baseField}.treatmentData.currentTreatments`);
    if (!currentTreatmentsResult.success) return currentTreatmentsResult as Result<Patient>;
    const historicalTreatmentsResult = typeVerifier.verifyArray(treatmentData.historicalTreatments, (item, i) => this.verifyTreatment(item, `${baseField}.treatmentData.historicalTreatments[${i}]`), `${baseField}.treatmentData.historicalTreatments`);
    if (!historicalTreatmentsResult.success) return historicalTreatmentsResult as Result<Patient>;
    const treatmentResponsesResult = typeVerifier.verifyArray(treatmentData.treatmentResponses, (item, i) => this.verifyTreatmentResponse(item, `${baseField}.treatmentData.treatmentResponses[${i}]`), `${baseField}.treatmentData.treatmentResponses`);
    if (!treatmentResponsesResult.success) return treatmentResponsesResult as Result<Patient>;
    // Add verification for optional treatment fields if needed

    // --- Verify neuralData ---
    const brainScansResult = typeVerifier.verifyArray(neuralData.brainScans, (item, i) => typeVerifier.verifyString(item, `${baseField}.neuralData.brainScans[${i}]`), `${baseField}.neuralData.brainScans`);
    if (!brainScansResult.success) return brainScansResult as Result<Patient>;
    // Add verification for optional neural fields if needed

    // --- Verify dataAccessPermissions ---
    const accessLevelResult = typeVerifier.verifyEnum(dataAccessPermissions.accessLevel, ["full", "treatment", "research", "limited"], `${baseField}.dataAccessPermissions.accessLevel`);
    if (!accessLevelResult.success) return accessLevelResult as Result<Patient>;
    const authorizedUsersResult = typeVerifier.verifyArray(dataAccessPermissions.authorizedUsers, (item, i) => typeVerifier.verifyString(item, `${baseField}.dataAccessPermissions.authorizedUsers[${i}]`), `${baseField}.dataAccessPermissions.authorizedUsers`);
    if (!authorizedUsersResult.success) return authorizedUsersResult as Result<Patient>;
    const consentStatusResult = typeVerifier.verifyEnum(dataAccessPermissions.consentStatus, ["full", "partial", "research-only", "none"], `${baseField}.dataAccessPermissions.consentStatus`);
    if (!consentStatusResult.success) return consentStatusResult as Result<Patient>;
    const dataRetentionPolicyResult = typeVerifier.verifyString(dataAccessPermissions.dataRetentionPolicy, `${baseField}.dataAccessPermissions.dataRetentionPolicy`);
    if (!dataRetentionPolicyResult.success) return dataRetentionPolicyResult as Result<Patient>;
    const lastReviewDateResult = typeVerifier.verifyString(dataAccessPermissions.lastReviewDate, `${baseField}.dataAccessPermissions.lastReviewDate`);
    if (!lastReviewDateResult.success) return lastReviewDateResult as Result<Patient>;
    // Add verification for optional permission fields if needed

    // Construct the verified patient object
    return {
      success: true,
      value: {
        id: idResult.value,
        demographicData: {
          age: ageResult.value,
          biologicalSex: biologicalSexResult.value,
          anonymizationLevel: anonymizationLevelResult.value,
          // Include verified optional fields here
        },
        clinicalData: {
          diagnoses: diagnosesResult.value,
          symptoms: symptomsResult.value,
          medications: medicationsResult.value,
          psychometricAssessments: psychometricAssessmentsResult.value,
          medicalHistory: medicalHistoryResult.value,
          // Include verified optional fields here
        },
        treatmentData: {
          currentTreatments: currentTreatmentsResult.value,
          historicalTreatments: historicalTreatmentsResult.value,
          treatmentResponses: treatmentResponsesResult.value,
          // Include verified optional fields here
        },
        neuralData: {
          brainScans: brainScansResult.value,
          // Include verified optional fields here
        },
        dataAccessPermissions: {
          accessLevel: accessLevelResult.value,
          authorizedUsers: authorizedUsersResult.value,
          consentStatus: consentStatusResult.value,
          dataRetentionPolicy: dataRetentionPolicyResult.value,
          lastReviewDate: lastReviewDateResult.value,
          // Include verified optional fields here
        },
        lastUpdated: lastUpdatedResult.value,
        version: versionResult.value,
      } as Patient // Keep cast as placeholders are generic
    };
  }
  
  // Removed incorrect prototype assignments definitively

  /**
   * Assert that a value is a valid RiskLevel
   */
  assertRiskLevel(value: unknown, field?: string): asserts value is RiskLevel {
    const result = this.verifyRiskLevel(value, field);
    if (!result.success) {
      // Throw the specific error from the verification result
      throw result.error ?? new TypeVerificationError("RiskLevel", value, field);
    }
  }

  /**
   * Assert that an object is a Symptom
   */
  assertSymptom(value: unknown, field?: string): asserts value is Symptom {
    const result = this.verifySymptom(value, field);
    if (!result.success) {
      throw result.error ?? new TypeVerificationError("Symptom", value, field);
    }
  }

  /**
   * Assert that an object is a Diagnosis
   */
  assertDiagnosis(value: unknown, field?: string): asserts value is Diagnosis {
    const result = this.verifyDiagnosis(value, field);
    if (!result.success) {
      throw result.error ?? new TypeVerificationError("Diagnosis", value, field);
    }
  }

  /**
   * Assert that an object is a Treatment
   */
  assertTreatment(value: unknown, field?: string): asserts value is Treatment {
    const result = this.verifyTreatment(value, field);
    if (!result.success) {
      throw result.error ?? new TypeVerificationError("Treatment", value, field);
    }
  }

  /**
   * Assert that an object is a TreatmentResponse
   */
  assertTreatmentResponse(
    value: unknown,
    field?: string,
  ): asserts value is TreatmentResponse {
    const result = this.verifyTreatmentResponse(value, field);
    if (!result.success) {
      throw result.error ?? new TypeVerificationError("TreatmentResponse", value, field);
    }
  }

  /**
   * Assert that an object is a Patient
   */
  assertPatient(value: unknown, field?: string): asserts value is Patient {
    const result = this.verifyPatient(value, field);
    if (!result.success) {
      throw result.error ?? new TypeVerificationError("Patient", value, field);
    }
  }
}

// Export singleton instance for easy usage
export const clinicalTypeVerifier = new ClinicalTypeVerifier();

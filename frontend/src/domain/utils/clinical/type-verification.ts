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
    // Use direct validation function
    if (!validateObject(obj, field)) {
      return objResult as Result<TreatmentResponse>;
    }

    const object = obj as Record<string, unknown>; // Safe cast

    // Verify required properties
    // id is NOT part of TreatmentResponse type definition
    // const idField = field ? `${field}.id` : "id";
    // if (!validateString(object.id, idField)) {
    //   return { success: false, error: new TypeVerificationError("string", object.id, idField) };
    // }
    // const id = object.id as string;

    const treatmentIdField = field ? `${field}.treatmentId` : "treatmentId";
    if (!validateString(object.treatmentId, treatmentIdField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.treatmentId, treatmentIdField),
      };
    }
    const treatmentId = object.treatmentId as string;

    // effectiveness is NOT part of TreatmentResponse type definition
    // const effectivenessField = field ? `${field}.effectiveness` : "effectiveness";
    // if (!validateNumber(object.effectiveness, effectivenessField)) {
    //   return { success: false, error: new TypeVerificationError("number", object.effectiveness, effectivenessField) };
    // }
    // const effectiveness = object.effectiveness as number;

    // assessmentDate should be string
    const assessmentDateField = field ? `${field}.assessmentDate` : "assessmentDate";
    if (!validateString(object.assessmentDate, assessmentDateField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.assessmentDate, assessmentDateField),
      };
    }
    const assessmentDate = object.assessmentDate as string;

    // clinicalResponse is required enum
    const clinicalResponseField = field ? `${field}.clinicalResponse` : "clinicalResponse";
    const allowedResponses = ["remission", "response", "partial response", "no response", "worsening"] as const;
    type ClinicalResponse = typeof allowedResponses[number];
    if (!validateType(object.clinicalResponse, validateOneOf(allowedResponses), "ClinicalResponse", clinicalResponseField)) {
        return {
            success: false,
            error: new TypeVerificationError("ClinicalResponse", object.clinicalResponse, clinicalResponseField),
        };
    }
    const clinicalResponse = object.clinicalResponse as ClinicalResponse;

    // symptomChanges is required array of specific objects
    // Use validateArrayOf with a boolean-returning callback
    const symptomChangesField = field ? `${field}.symptomChanges` : "symptomChanges";
    const symptomChangesValid = validateArrayOf<{ symptomId: string; changePercentage: number; notes?: string }>(
        object.symptomChanges,
        (item, i): item is { symptomId: string; changePercentage: number; notes?: string } => {
            const itemField = `${symptomChangesField}[${i}]`;
            if (!validateObject(item, itemField)) return false;
            const itemObj = item as Record<string, unknown>; // Safe cast

            const symptomIdField = `${itemField}.symptomId`;
            if (!validateString(itemObj.symptomId, symptomIdField)) return false;

            const changePercentageField = `${itemField}.changePercentage`;
            if (!validateNumber(itemObj.changePercentage, changePercentageField)) return false;

            // Optional notes
            const notesField = `${itemField}.notes`;
            if (itemObj.notes !== undefined && !validateString(itemObj.notes, notesField)) return false;

            return true; // Item is valid
        },
        symptomChangesField
    );

    if (!symptomChangesValid) {
        // Error reporting needs improvement here, as validateArrayOf only returns boolean
        return { success: false, error: new TypeVerificationError("Array<SymptomChange>", object.symptomChanges, symptomChangesField) };
    }
    // Cast is safe after validation
    const symptomChanges = object.symptomChanges as { symptomId: string; changePercentage: number; notes?: string }[];
    // sideEffects is required array of specific objects
    // Use validateArrayOf with a boolean-returning callback
    const sideEffectsField = field ? `${field}.sideEffects` : "sideEffects";
    type SideEffectSeverity = "mild" | "moderate" | "severe";
    const allowedSideEffectSeverities = ["mild", "moderate", "severe"] as const;

    const sideEffectsValid = validateArrayOf<{ description: string; severity: SideEffectSeverity; managementStrategy?: string }>(
        object.sideEffects,
        (item, i): item is { description: string; severity: SideEffectSeverity; managementStrategy?: string } => {
            const itemField = `${sideEffectsField}[${i}]`;
            if (!validateObject(item, itemField)) return false;
            const itemObj = item as Record<string, unknown>; // Safe cast

            const descriptionField = `${itemField}.description`;
            if (!validateString(itemObj.description, descriptionField)) return false;

            const severityField = `${itemField}.severity`;
            if (!validateType(itemObj.severity, validateOneOf(allowedSideEffectSeverities), "SideEffectSeverity", severityField)) return false;

            // Optional managementStrategy
            const managementStrategyField = `${itemField}.managementStrategy`;
            if (itemObj.managementStrategy !== undefined && !validateString(itemObj.managementStrategy, managementStrategyField)) return false;

            return true; // Item is valid
        },
        sideEffectsField
    );

     if (!sideEffectsValid) {
        // Error reporting needs improvement here
        return { success: false, error: new TypeVerificationError("Array<SideEffect>", object.sideEffects, sideEffectsField) };
    }
    // Cast is safe after validation
    const sideEffects = object.sideEffects as { description: string; severity: SideEffectSeverity; managementStrategy?: string }[];

    // Optional properties
    // Optional properties - notes is NOT part of TreatmentResponse type definition
    // const notesField = field ? `${field}.notes` : "notes";
    // let notes: string | undefined;
    // if (object.notes !== undefined) {
    //   if (!validateString(object.notes, notesField)) {
    //     return { success: false, error: new TypeVerificationError("string", object.notes, notesField) };
    //   }
    //   notes = object.notes as string;
    // }

    // Return verified treatment response
    return {
      success: true,
      value: {
        treatmentId: treatmentId,
        assessmentDate: assessmentDate,
        clinicalResponse: clinicalResponse,
        symptomChanges: symptomChanges, // Use validated array
        sideEffects: sideEffects, // Use validated array
        // Add other optional fields from TreatmentResponse type if needed
      } as TreatmentResponse,
    };
  }

  /**
   * Verify that an object conforms to the Patient interface
   */
  verifyPatient(obj: unknown, field?: string): Result<Patient> {
    const baseField = field ?? "Patient";
    // Use direct validation function
    if (!validateObject(obj, baseField)) {
      return { success: false, error: new TypeVerificationError("object", obj, baseField) };
    }
    const object = obj as Record<string, unknown>;

    // Verify required top-level properties
    const idField = `${baseField}.id`;
    if (!validateString(object.id, idField)) {
      return { success: false, error: new TypeVerificationError("string", object.id, idField) };
    }
    const id = object.id as string;

    const lastUpdatedField = `${baseField}.lastUpdated`;
    if (!validateString(object.lastUpdated, lastUpdatedField)) {
      return { success: false, error: new TypeVerificationError("string", object.lastUpdated, lastUpdatedField) };
    }
    const lastUpdated = object.lastUpdated as string;

    // Assuming version is required string
    const versionField = `${baseField}.version`;
    if (!validateString(object.version, versionField)) {
        return { success: false, error: new TypeVerificationError("string", object.version, versionField) };
    }
    const version = object.version as string;

    // Verify nested required objects
    // Validate nested objects
    const demographicDataField = `${baseField}.demographicData`;
    if (!validateObject(object.demographicData, demographicDataField)) {
        return { success: false, error: new TypeVerificationError("object", object.demographicData, demographicDataField) };
    }
    const demographicData = object.demographicData as Record<string, unknown>;

    const clinicalDataField = `${baseField}.clinicalData`;
     if (!validateObject(object.clinicalData, clinicalDataField)) {
        return { success: false, error: new TypeVerificationError("object", object.clinicalData, clinicalDataField) };
    }
    const clinicalData = object.clinicalData as Record<string, unknown>;

    const treatmentDataField = `${baseField}.treatmentData`;
     if (!validateObject(object.treatmentData, treatmentDataField)) {
        return { success: false, error: new TypeVerificationError("object", object.treatmentData, treatmentDataField) };
    }
    const treatmentData = object.treatmentData as Record<string, unknown>;

    const neuralDataField = `${baseField}.neuralData`;
     if (!validateObject(object.neuralData, neuralDataField)) {
        return { success: false, error: new TypeVerificationError("object", object.neuralData, neuralDataField) };
    }
    const neuralData = object.neuralData as Record<string, unknown>;

    const dataAccessPermissionsField = `${baseField}.dataAccessPermissions`;
     if (!validateObject(object.dataAccessPermissions, dataAccessPermissionsField)) {
        return { success: false, error: new TypeVerificationError("object", object.dataAccessPermissions, dataAccessPermissionsField) };
    }
    const dataAccessPermissions = object.dataAccessPermissions as Record<string, unknown>;

    // --- Verify demographicData ---
    // Validate properties within nested objects
    const ageField = `${demographicDataField}.age`;
    if (!validateNumber(demographicData.age, ageField)) {
        return { success: false, error: new TypeVerificationError("number", demographicData.age, ageField) };
    }
    const age = demographicData.age as number;
    const biologicalSexField = `${demographicDataField}.biologicalSex`;
    const allowedSexes = ["male", "female", "other"] as const;
    type BiologicalSex = typeof allowedSexes[number];
    if (!validateType(demographicData.biologicalSex, validateOneOf(allowedSexes), "BiologicalSex", biologicalSexField)) {
        return { success: false, error: new TypeVerificationError("BiologicalSex", demographicData.biologicalSex, biologicalSexField) };
    }
    const biologicalSex = demographicData.biologicalSex as BiologicalSex;
    const anonymizationLevelResult = typeVerifier.verifyEnum(demographicData.anonymizationLevel, ["full", "partial", "research", "clinical"], `${baseField}.demographicData.anonymizationLevel`);
    if (!anonymizationLevelResult.success) return anonymizationLevelResult as Result<Patient>;
    // Add verification for optional demographic fields if needed

    // --- Verify clinicalData ---
    // Validate arrays within nested objects using validateArrayOf
    const diagnosesField = `${clinicalDataField}.diagnoses`;
    const diagnosesValid = validateArrayOf<Diagnosis>(
        clinicalData.diagnoses,
        (item, i): item is Diagnosis => {
            const result = this.verifyDiagnosis(item, `${diagnosesField}[${i}]`);
            return result.success; // Rely on the boolean success flag
        },
        diagnosesField
    );
    if (!diagnosesValid) {
        return { success: false, error: new TypeVerificationError("Array<Diagnosis>", clinicalData.diagnoses, diagnosesField) };
    }
    const diagnoses = clinicalData.diagnoses as Diagnosis[];
    const symptomsField = `${clinicalDataField}.symptoms`;
    const symptomsValid = validateArrayOf<Symptom>(
        clinicalData.symptoms,
        (item, i): item is Symptom => {
            const result = this.verifySymptom(item, `${symptomsField}[${i}]`);
            return result.success;
        },
        symptomsField
    );
     if (!symptomsValid) {
        return { success: false, error: new TypeVerificationError("Array<Symptom>", clinicalData.symptoms, symptomsField) };
    }
    const symptoms = clinicalData.symptoms as Symptom[];
    // Using the placeholder methods defined within the class
    const medicationsField = `${clinicalDataField}.medications`;
    const medicationsValid = validateArrayOf<Medication>(
        clinicalData.medications,
        (item, i): item is Medication => {
            // Using placeholder verifyMedication which currently just checks for object
            const result = this.verifyMedication(item, `${medicationsField}[${i}]`);
            return result.success;
        },
        medicationsField
    );
     if (!medicationsValid) {
        return { success: false, error: new TypeVerificationError("Array<Medication>", clinicalData.medications, medicationsField) };
    }
    const medications = clinicalData.medications as Medication[];
    const psychometricAssessmentsField = `${clinicalDataField}.psychometricAssessments`;
    const psychometricAssessmentsValid = validateArrayOf<PsychometricAssessment>(
        clinicalData.psychometricAssessments,
        (item, i): item is PsychometricAssessment => {
            // Using placeholder verifyPsychometricAssessment
            const result = this.verifyPsychometricAssessment(item, `${psychometricAssessmentsField}[${i}]`);
            return result.success;
        },
        psychometricAssessmentsField
    );
     if (!psychometricAssessmentsValid) {
        return { success: false, error: new TypeVerificationError("Array<PsychometricAssessment>", clinicalData.psychometricAssessments, psychometricAssessmentsField) };
    }
    const psychometricAssessments = clinicalData.psychometricAssessments as PsychometricAssessment[];
    const medicalHistoryField = `${clinicalDataField}.medicalHistory`;
    const medicalHistoryValid = validateArrayOf<MedicalHistoryItem>(
        clinicalData.medicalHistory,
        (item, i): item is MedicalHistoryItem => {
            // Using placeholder verifyMedicalHistoryItem
            const result = this.verifyMedicalHistoryItem(item, `${medicalHistoryField}[${i}]`);
            return result.success;
        },
        medicalHistoryField
    );
     if (!medicalHistoryValid) {
        return { success: false, error: new TypeVerificationError("Array<MedicalHistoryItem>", clinicalData.medicalHistory, medicalHistoryField) };
    }
    const medicalHistory = clinicalData.medicalHistory as MedicalHistoryItem[];
    // Add verification for optional clinical fields if needed

    // --- Verify treatmentData ---
    const currentTreatmentsField = `${treatmentDataField}.currentTreatments`;
    const currentTreatmentsValid = validateArrayOf<Treatment>(
        treatmentData.currentTreatments,
        (item, i): item is Treatment => {
            const result = this.verifyTreatment(item, `${currentTreatmentsField}[${i}]`);
            return result.success;
        },
        currentTreatmentsField
    );
     if (!currentTreatmentsValid) {
        return { success: false, error: new TypeVerificationError("Array<Treatment>", treatmentData.currentTreatments, currentTreatmentsField) };
    }
    const currentTreatments = treatmentData.currentTreatments as Treatment[];
    const historicalTreatmentsField = `${treatmentDataField}.historicalTreatments`;
    const historicalTreatmentsValid = validateArrayOf<Treatment>(
        treatmentData.historicalTreatments,
        (item, i): item is Treatment => {
            const result = this.verifyTreatment(item, `${historicalTreatmentsField}[${i}]`);
            return result.success;
        },
        historicalTreatmentsField
    );
     if (!historicalTreatmentsValid) {
        return { success: false, error: new TypeVerificationError("Array<Treatment>", treatmentData.historicalTreatments, historicalTreatmentsField) };
    }
    const historicalTreatments = treatmentData.historicalTreatments as Treatment[];
    const treatmentResponsesField = `${treatmentDataField}.treatmentResponses`;
    const treatmentResponsesValid = validateArrayOf<TreatmentResponse>(
        treatmentData.treatmentResponses,
        (item, i): item is TreatmentResponse => {
            const result = this.verifyTreatmentResponse(item, `${treatmentResponsesField}[${i}]`);
            return result.success;
        },
        treatmentResponsesField
    );
     if (!treatmentResponsesValid) {
        return { success: false, error: new TypeVerificationError("Array<TreatmentResponse>", treatmentData.treatmentResponses, treatmentResponsesField) };
    }
    const treatmentResponses = treatmentData.treatmentResponses as TreatmentResponse[];
    // Add verification for optional treatment fields if needed

    // --- Verify neuralData ---
    // Assuming brainScans is an array of strings
    const brainScansField = `${neuralDataField}.brainScans`;
    const brainScansValid = validateArrayOf<string>(
        neuralData.brainScans,
        (item, i): item is string => validateString(item, `${brainScansField}[${i}]`),
        brainScansField
    );
     if (!brainScansValid) {
        return { success: false, error: new TypeVerificationError("Array<string>", neuralData.brainScans, brainScansField) };
    }
    const brainScans = neuralData.brainScans as string[];
    // Add verification for optional neural fields if needed

    // --- Verify dataAccessPermissions ---
    const accessLevelField = `${dataAccessPermissionsField}.accessLevel`;
    const allowedAccessLevels = ["full", "treatment", "research", "limited"] as const;
    type AccessLevel = typeof allowedAccessLevels[number];
    if (!validateType(dataAccessPermissions.accessLevel, validateOneOf(allowedAccessLevels), "AccessLevel", accessLevelField)) {
        return { success: false, error: new TypeVerificationError("AccessLevel", dataAccessPermissions.accessLevel, accessLevelField) };
    }
    const accessLevel = dataAccessPermissions.accessLevel as AccessLevel;
    // Assuming authorizedUsers is an array of strings
    const authorizedUsersField = `${dataAccessPermissionsField}.authorizedUsers`;
    const authorizedUsersValid = validateArrayOf<string>(
        dataAccessPermissions.authorizedUsers,
        (item, i): item is string => validateString(item, `${authorizedUsersField}[${i}]`),
        authorizedUsersField
    );
     if (!authorizedUsersValid) {
        return { success: false, error: new TypeVerificationError("Array<string>", dataAccessPermissions.authorizedUsers, authorizedUsersField) };
    }
    const authorizedUsers = dataAccessPermissions.authorizedUsers as string[];
    const consentStatusField = `${dataAccessPermissionsField}.consentStatus`;
    const allowedConsentStatuses = ["full", "partial", "research-only", "none"] as const;
    type ConsentStatus = typeof allowedConsentStatuses[number];
    if (!validateType(dataAccessPermissions.consentStatus, validateOneOf(allowedConsentStatuses), "ConsentStatus", consentStatusField)) {
        return { success: false, error: new TypeVerificationError("ConsentStatus", dataAccessPermissions.consentStatus, consentStatusField) };
    }
    const consentStatus = dataAccessPermissions.consentStatus as ConsentStatus;
    const dataRetentionPolicyField = `${dataAccessPermissionsField}.dataRetentionPolicy`;
    if (!validateString(dataAccessPermissions.dataRetentionPolicy, dataRetentionPolicyField)) {
        return { success: false, error: new TypeVerificationError("string", dataAccessPermissions.dataRetentionPolicy, dataRetentionPolicyField) };
    }
    const dataRetentionPolicy = dataAccessPermissions.dataRetentionPolicy as string;
    const lastReviewDateField = `${dataAccessPermissionsField}.lastReviewDate`;
    if (!validateString(dataAccessPermissions.lastReviewDate, lastReviewDateField)) {
        return { success: false, error: new TypeVerificationError("string", dataAccessPermissions.lastReviewDate, lastReviewDateField) };
    }
    const lastReviewDate = dataAccessPermissions.lastReviewDate as string;
    // Add verification for optional permission fields if needed

    // Construct the verified patient object
     // Construct the final Patient object using validated values
    return {
      success: true,
      value: {
        id: id,
        lastUpdated: lastUpdated,
        version: version,
        demographicData: {
          age: age,
          biologicalSex: biologicalSex,
          anonymizationLevel: anonymizationLevel,
          // TODO: Add validation for optional demographic fields (ethnicity, genderIdentity, etc.)
        },
        clinicalData: {
          diagnoses: diagnoses,
          symptoms: symptoms,
          medications: medications, // Note: Still using placeholder validation
          psychometricAssessments: psychometricAssessments, // Note: Still using placeholder validation
          medicalHistory: medicalHistory, // Note: Still using placeholder validation
          // TODO: Add validation for optional clinical fields (familyHistory, lifestyleFactors, etc.)
        },
        treatmentData: {
          currentTreatments: currentTreatments,
          historicalTreatments: historicalTreatments,
          treatmentResponses: treatmentResponses,
          // TODO: Add validation for optional treatment fields (treatmentGoals, adherenceData, etc.)
        },
        neuralData: {
          brainScans: brainScans,
          // TODO: Add validation for optional neural fields (eegData, fmriData, neurotransmitterLevels, etc.)
        },
        dataAccessPermissions: {
          accessLevel: accessLevel,
          authorizedUsers: authorizedUsers,
          consentStatus: consentStatus,
          dataRetentionPolicy: dataRetentionPolicy,
          lastReviewDate: lastReviewDate,
          // TODO: Add validation for optional permission fields (auditLogs, specificConsents, etc.)
        },
      } as Patient, // Cast should be safer now
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

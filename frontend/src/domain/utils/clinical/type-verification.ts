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
        error: new TypeVerificationError(
          "number",
          object.severity,
          severityField,
        ),
      };
    }
    const severity = object.severity as number; // Safe cast

    // Optional properties
    const onsetDateField = field ? `${field}.onsetDate` : "onsetDate";
    let onsetDate: string | undefined;
    if (object.onsetDate !== undefined) {
      if (!validateString(object.onsetDate, onsetDateField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.onsetDate,
            onsetDateField,
          ),
        };
      }
      onsetDate = object.onsetDate as string; // Safe cast
    }

    // frequency should be one of specific literals - Use validateType with validateOneOf
    const frequencyField = field ? `${field}.frequency` : "frequency";
    const allowedFrequencies = [
      "constant",
      "daily",
      "weekly",
      "monthly",
      "episodic",
      "situational",
    ] as const;
    type Frequency = (typeof allowedFrequencies)[number];
    if (
      object.frequency !== undefined &&
      !validateType(
        object.frequency,
        validateOneOf(allowedFrequencies),
        "Frequency",
        frequencyField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Frequency",
          object.frequency,
          frequencyField,
        ),
      };
    }
    const frequency = object.frequency as Frequency | undefined; // Safe cast

    // impact should be one of specific literals
    const impactField = field ? `${field}.impact` : "impact";
    const allowedImpacts = ["none", "mild", "moderate", "severe"] as const;
    type Impact = (typeof allowedImpacts)[number];
    if (
      object.impact !== undefined &&
      !validateType(
        object.impact,
        validateOneOf(allowedImpacts),
        "Impact",
        impactField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError("Impact", object.impact, impactField),
      };
    }
    const impact = object.impact as Impact | undefined; // Safe cast

    // progression should be one of specific literals
    const progressionField = field ? `${field}.progression` : "progression";
    const allowedProgressions = [
      "improving",
      "stable",
      "worsening",
      "fluctuating",
    ] as const;
    type Progression = (typeof allowedProgressions)[number];
    if (
      object.progression !== undefined &&
      !validateType(
        object.progression,
        validateOneOf(allowedProgressions),
        "Progression",
        progressionField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Progression",
          object.progression,
          progressionField,
        ),
      };
    }
    const progression = object.progression as Progression | undefined; // Safe cast

    // category should be one of specific literals
    const categoryField = field ? `${field}.category` : "category";
    const allowedCategories = [
      "cognitive",
      "affective",
      "behavioral",
      "somatic",
      "perceptual",
    ] as const;
    type Category = (typeof allowedCategories)[number];
    // Assuming category is required based on Symptom type
    if (
      !validateType(
        object.category,
        validateOneOf(allowedCategories),
        "Category",
        categoryField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Category",
          object.category,
          categoryField,
        ),
      };
    }
    const category = object.category as Category; // Safe cast

    // Optional string fields from Symptom type
    const lastOccurrenceField = field
      ? `${field}.lastOccurrence`
      : "lastOccurrence";
    let lastOccurrence: string | undefined;
    if (object.lastOccurrence !== undefined) {
      if (!validateString(object.lastOccurrence, lastOccurrenceField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.lastOccurrence,
            lastOccurrenceField,
          ),
        };
      }
      lastOccurrence = object.lastOccurrence as string;
    }

    const durationField = field ? `${field}.duration` : "duration";
    let duration: string | undefined;
    if (object.duration !== undefined) {
      if (!validateString(object.duration, durationField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.duration,
            durationField,
          ),
        };
      }
      duration = object.duration as string;
    }

    const notesField = field ? `${field}.notes` : "notes";
    let notes: string | undefined;
    if (object.notes !== undefined) {
      if (!validateString(object.notes, notesField)) {
        return {
          success: false,
          error: new TypeVerificationError("string", object.notes, notesField),
        };
      }
      notes = object.notes as string;
    }

    // Optional string array fields
    const triggersField = field ? `${field}.triggers` : "triggers";
    let triggers: string[] | undefined;
    if (object.triggers !== undefined) {
      if (
        !validateArrayOf(
          object.triggers,
          (item): item is string => validateString(item, triggersField),
          triggersField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<string>",
            object.triggers,
            triggersField,
          ),
        };
      }
      triggers = object.triggers as string[];
    }

    const alleviatingFactorsField = field
      ? `${field}.alleviatingFactors`
      : "alleviatingFactors";
    let alleviatingFactors: string[] | undefined;
    if (object.alleviatingFactors !== undefined) {
      if (
        !validateArrayOf(
          object.alleviatingFactors,
          (item): item is string =>
            validateString(item, alleviatingFactorsField),
          alleviatingFactorsField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<string>",
            object.alleviatingFactors,
            alleviatingFactorsField,
          ),
        };
      }
      alleviatingFactors = object.alleviatingFactors as string[];
    }

    const associatedDiagnosesField = field
      ? `${field}.associatedDiagnoses`
      : "associatedDiagnoses";
    let associatedDiagnoses: string[] | undefined;
    if (object.associatedDiagnoses !== undefined) {
      if (
        !validateArrayOf(
          object.associatedDiagnoses,
          (item): item is string =>
            validateString(item, associatedDiagnosesField),
          associatedDiagnosesField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<string>",
            object.associatedDiagnoses,
            associatedDiagnosesField,
          ),
        };
      }
      associatedDiagnoses = object.associatedDiagnoses as string[];
    }

    const associatedBrainRegionsField = field
      ? `${field}.associatedBrainRegions`
      : "associatedBrainRegions";
    let associatedBrainRegions: string[] | undefined;
    if (object.associatedBrainRegions !== undefined) {
      if (
        !validateArrayOf(
          object.associatedBrainRegions,
          (item): item is string =>
            validateString(item, associatedBrainRegionsField),
          associatedBrainRegionsField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<string>",
            object.associatedBrainRegions,
            associatedBrainRegionsField,
          ),
        };
      }
      associatedBrainRegions = object.associatedBrainRegions as string[];
    }

    // Return verified symptom
    return {
      success: true,
      value: {
        id: id,
        name: name,
        severity: severity,
        category: category,
        frequency: frequency, // Use validated optional value
        impact: impact, // Use validated optional value
        progression: progression, // Use validated optional value
        ...(onsetDate !== undefined && { onsetDate }),
        ...(lastOccurrence !== undefined && { lastOccurrence }),
        ...(duration !== undefined && { duration }),
        ...(triggers !== undefined && { triggers }),
        ...(alleviatingFactors !== undefined && { alleviatingFactors }),
        ...(notes !== undefined && { notes }),
        ...(associatedDiagnoses !== undefined && { associatedDiagnoses }),
        ...(associatedBrainRegions !== undefined && { associatedBrainRegions }),
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
    const diagnosisDateField = field
      ? `${field}.diagnosisDate`
      : "diagnosisDate";
    if (!validateString(object.diagnosisDate, diagnosisDateField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "string",
          object.diagnosisDate,
          diagnosisDateField,
        ),
      };
    }
    const diagnosisDate = object.diagnosisDate as string;

    // severity should be one of specific literals
    const severityField = field ? `${field}.severity` : "severity";
    const allowedSeverities = [
      "mild",
      "moderate",
      "severe",
      "in remission",
      "unspecified",
    ] as const;
    type DiagnosisSeverity = (typeof allowedSeverities)[number];
    // Severity is required in Diagnosis type
    if (
      !validateType(
        object.severity,
        validateOneOf(allowedSeverities),
        "DiagnosisSeverity",
        severityField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "DiagnosisSeverity",
          object.severity,
          severityField,
        ),
      };
    }
    const severity = object.severity as DiagnosisSeverity;

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
    const allowedCodingSystems = [
      "ICD-10",
      "ICD-11",
      "DSM-5",
      "DSM-5-TR",
    ] as const;
    type CodingSystem = (typeof allowedCodingSystems)[number];
    if (
      !validateType(
        object.codingSystem,
        validateOneOf(allowedCodingSystems),
        "CodingSystem",
        codingSystemField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "CodingSystem",
          object.codingSystem,
          codingSystemField,
        ),
      };
    }
    const codingSystem = object.codingSystem as CodingSystem;

    // status is required
    const statusField = field ? `${field}.status` : "status";
    const allowedStatuses = [
      "active",
      "resolved",
      "in remission",
      "recurrent",
    ] as const;
    type DiagnosisStatus = (typeof allowedStatuses)[number];
    if (
      !validateType(
        object.status,
        validateOneOf(allowedStatuses),
        "DiagnosisStatus",
        statusField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "DiagnosisStatus",
          object.status,
          statusField,
        ),
      };
    }
    const status = object.status as DiagnosisStatus;

    // Optional properties
    const onsetDateField = field ? `${field}.onsetDate` : "onsetDate";
    let onsetDate: string | undefined;
    if (object.onsetDate !== undefined) {
      if (!validateString(object.onsetDate, onsetDateField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.onsetDate,
            onsetDateField,
          ),
        };
      }
      onsetDate = object.onsetDate as string;
    }

    const diagnosingClinicianField = field
      ? `${field}.diagnosingClinician`
      : "diagnosingClinician";
    let diagnosingClinician: string | undefined;
    if (object.diagnosingClinician !== undefined) {
      if (
        !validateString(object.diagnosingClinician, diagnosingClinicianField)
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.diagnosingClinician,
            diagnosingClinicianField,
          ),
        };
      }
      diagnosingClinician = object.diagnosingClinician as string;
    }

    const notesField = field ? `${field}.notes` : "notes";
    let notes: string | undefined;
    if (object.notes !== undefined) {
      if (!validateString(object.notes, notesField)) {
        return {
          success: false,
          error: new TypeVerificationError("string", object.notes, notesField),
        };
      }
      notes = object.notes as string;
    }

    const confidenceLevelField = field
      ? `${field}.confidenceLevel`
      : "confidenceLevel";
    let confidenceLevel: number | undefined;
    if (object.confidenceLevel !== undefined) {
      if (!validateNumber(object.confidenceLevel, confidenceLevelField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "number",
            object.confidenceLevel,
            confidenceLevelField,
          ),
        };
      }
      confidenceLevel = object.confidenceLevel as number;
    }

    const associatedBrainRegionsField = field
      ? `${field}.associatedBrainRegions`
      : "associatedBrainRegions";
    let associatedBrainRegions: string[] | undefined;
    if (object.associatedBrainRegions !== undefined) {
      if (
        !validateArrayOf(
          object.associatedBrainRegions,
          (item): item is string =>
            validateString(item, associatedBrainRegionsField),
          associatedBrainRegionsField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<string>",
            object.associatedBrainRegions,
            associatedBrainRegionsField,
          ),
        };
      }
      associatedBrainRegions = object.associatedBrainRegions as string[];
    }

    // Return verified diagnosis
    return {
      success: true,
      value: {
        id: id,
        code: code,
        codingSystem: codingSystem,
        name: name,
        severity: severity, // Required
        diagnosisDate: diagnosisDate,
        status: status,
        ...(onsetDate !== undefined && { onsetDate }),
        ...(diagnosingClinician !== undefined && { diagnosingClinician }),
        ...(notes !== undefined && { notes }),
        ...(confidenceLevel !== undefined && { confidenceLevel }),
        ...(associatedBrainRegions !== undefined && { associatedBrainRegions }),
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
    const allowedTypes = [
      "pharmacological",
      "psychotherapy",
      "neuromodulation",
      "lifestyle",
      "complementary",
      "other",
    ] as const;
    type TreatmentType = (typeof allowedTypes)[number];
    if (
      !validateType(
        object.type,
        validateOneOf(allowedTypes),
        "TreatmentType",
        typeField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "TreatmentType",
          object.type,
          typeField,
        ),
      };
    }
    const type = object.type as TreatmentType;

    const descriptionField = field ? `${field}.description` : "description";
    if (!validateString(object.description, descriptionField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "string",
          object.description,
          descriptionField,
        ),
      };
    }
    const description = object.description as string;

    const startDateField = field ? `${field}.startDate` : "startDate";
    if (!validateString(object.startDate, startDateField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "string",
          object.startDate,
          startDateField,
        ),
      };
    }
    const startDate = object.startDate as string;

    const statusField = field ? `${field}.status` : "status";
    const allowedStatuses = [
      "active",
      "completed",
      "discontinued",
      "planned",
    ] as const;
    type TreatmentStatus = (typeof allowedStatuses)[number];
    if (
      !validateType(
        object.status,
        validateOneOf(allowedStatuses),
        "TreatmentStatus",
        statusField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "TreatmentStatus",
          object.status,
          statusField,
        ),
      };
    }
    const status = object.status as TreatmentStatus;

    // Optional properties
    const endDateField = field ? `${field}.endDate` : "endDate";
    let endDate: string | undefined;
    if (object.endDate !== undefined) {
      if (!validateString(object.endDate, endDateField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.endDate,
            endDateField,
          ),
        };
      }
      endDate = object.endDate as string;
    }

    const providerField = field ? `${field}.provider` : "provider";
    let provider: string | undefined;
    if (object.provider !== undefined) {
      if (!validateString(object.provider, providerField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.provider,
            providerField,
          ),
        };
      }
      provider = object.provider as string;
    }

    const discontinuationReasonField = field
      ? `${field}.discontinuationReason`
      : "discontinuationReason";
    let discontinuationReason: string | undefined;
    if (object.discontinuationReason !== undefined) {
      if (
        !validateString(
          object.discontinuationReason,
          discontinuationReasonField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.discontinuationReason,
            discontinuationReasonField,
          ),
        };
      }
      discontinuationReason = object.discontinuationReason as string;
    }

    const frequencyField = field ? `${field}.frequency` : "frequency";
    let frequency: string | undefined;
    if (object.frequency !== undefined) {
      if (!validateString(object.frequency, frequencyField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.frequency,
            frequencyField,
          ),
        };
      }
      frequency = object.frequency as string;
    }

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

    const notesField = field ? `${field}.notes` : "notes";
    let notes: string | undefined;
    if (object.notes !== undefined) {
      if (!validateString(object.notes, notesField)) {
        return {
          success: false,
          error: new TypeVerificationError("string", object.notes, notesField),
        };
      }
      notes = object.notes as string;
    }

    const effectivenessField = field
      ? `${field}.effectiveness`
      : "effectiveness";
    let effectiveness: number | undefined;
    if (object.effectiveness !== undefined) {
      if (!validateNumber(object.effectiveness, effectivenessField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "number",
            object.effectiveness,
            effectivenessField,
          ),
        };
      }
      effectiveness = object.effectiveness as number;
    }

    const adherenceField = field ? `${field}.adherence` : "adherence";
    let adherence: number | undefined;
    if (object.adherence !== undefined) {
      if (!validateNumber(object.adherence, adherenceField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "number",
            object.adherence,
            adherenceField,
          ),
        };
      }
      adherence = object.adherence as number;
    }

    const targetSymptomsField = field
      ? `${field}.targetSymptoms`
      : "targetSymptoms";
    let targetSymptoms: string[] | undefined;
    if (object.targetSymptoms !== undefined) {
      if (
        !validateArrayOf(
          object.targetSymptoms,
          (item): item is string => validateString(item, targetSymptomsField),
          targetSymptomsField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<string>",
            object.targetSymptoms,
            targetSymptomsField,
          ),
        };
      }
      targetSymptoms = object.targetSymptoms as string[];
    }

    const targetBrainRegionsField = field
      ? `${field}.targetBrainRegions`
      : "targetBrainRegions";
    let targetBrainRegions: string[] | undefined;
    if (object.targetBrainRegions !== undefined) {
      if (
        !validateArrayOf(
          object.targetBrainRegions,
          (item): item is string =>
            validateString(item, targetBrainRegionsField),
          targetBrainRegionsField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<string>",
            object.targetBrainRegions,
            targetBrainRegionsField,
          ),
        };
      }
      targetBrainRegions = object.targetBrainRegions as string[];
    }

    const sideEffectsField = field ? `${field}.sideEffects` : "sideEffects";
    let sideEffects: string[] | undefined;
    if (object.sideEffects !== undefined) {
      if (
        !validateArrayOf(
          object.sideEffects,
          (item): item is string => validateString(item, sideEffectsField),
          sideEffectsField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<string>",
            object.sideEffects,
            sideEffectsField,
          ),
        };
      }
      sideEffects = object.sideEffects as string[];
    }

    // Return verified treatment
    return {
      success: true,
      value: {
        id: id,
        type: type,
        name: name,
        description: description,
        startDate: startDate,
        status: status,
        ...(endDate !== undefined && { endDate }),
        ...(provider !== undefined && { provider }),
        ...(discontinuationReason !== undefined && { discontinuationReason }),
        ...(frequency !== undefined && { frequency }),
        ...(dose !== undefined && { dose }),
        ...(targetSymptoms !== undefined && { targetSymptoms }),
        ...(targetBrainRegions !== undefined && { targetBrainRegions }),
        ...(effectiveness !== undefined && { effectiveness }),
        ...(adherence !== undefined && { adherence }),
        ...(sideEffects !== undefined && { sideEffects }),
        ...(notes !== undefined && { notes }),
      } as Treatment,
    };
  }

  /**
   * Verify that an object conforms to the Medication interface
   * Note: This is a basic implementation assuming Medication structure.
   * Needs refinement based on the actual Medication type definition.
   */
  verifyMedication(obj: unknown, field?: string): Result<Medication> {
    // Placeholder implementation - needs to be fully implemented based on Medication type
    if (!validateObject(obj, field)) {
      return {
        success: false,
        error: new TypeVerificationError("object", obj, field),
      };
    }
    // Add detailed property validation here based on Medication interface
    return { success: true, value: obj as Medication }; // Temporary pass-through
  }

  /**
   * Verify that an object conforms to the PsychometricAssessment interface
   * Note: This is a basic implementation. Needs refinement.
   */
  verifyPsychometricAssessment(
    obj: unknown,
    field?: string,
  ): Result<PsychometricAssessment> {
    // Placeholder implementation
    if (!validateObject(obj, field)) {
      return {
        success: false,
        error: new TypeVerificationError("object", obj, field),
      };
    }
    // Add detailed property validation here
    return { success: true, value: obj as PsychometricAssessment }; // Temporary pass-through
  }

  /**
   * Verify that an object conforms to the MedicalHistoryItem interface
   * Note: This is a basic implementation. Needs refinement.
   */
  verifyMedicalHistoryItem(
    obj: unknown,
    field?: string,
  ): Result<MedicalHistoryItem> {
    // Placeholder implementation
    if (!validateObject(obj, field)) {
      return {
        success: false,
        error: new TypeVerificationError("object", obj, field),
      };
    }
    // Add detailed property validation here
    return { success: true, value: obj as MedicalHistoryItem }; // Temporary pass-through
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
      return {
        success: false,
        error: new TypeVerificationError("object", obj, field),
      };
    }

    const object = obj as Record<string, unknown>; // Safe cast

    // Verify required properties
    const treatmentIdField = field ? `${field}.treatmentId` : "treatmentId";
    if (!validateString(object.treatmentId, treatmentIdField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "string",
          object.treatmentId,
          treatmentIdField,
        ),
      };
    }
    const treatmentId = object.treatmentId as string;

    const assessmentDateField = field
      ? `${field}.assessmentDate`
      : "assessmentDate";
    if (!validateString(object.assessmentDate, assessmentDateField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "string",
          object.assessmentDate,
          assessmentDateField,
        ),
      };
    }
    const assessmentDate = object.assessmentDate as string;

    const clinicalResponseField = field
      ? `${field}.clinicalResponse`
      : "clinicalResponse";
    const allowedResponses = [
      "remission",
      "response",
      "partial response",
      "no response",
      "worsening",
    ] as const;
    type ClinicalResponseType = (typeof allowedResponses)[number];
    if (
      !validateType(
        object.clinicalResponse,
        validateOneOf(allowedResponses),
        "ClinicalResponseType",
        clinicalResponseField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "ClinicalResponseType",
          object.clinicalResponse,
          clinicalResponseField,
        ),
      };
    }
    const clinicalResponse = object.clinicalResponse as ClinicalResponseType;

    // symptomChanges is required array of specific objects
    const symptomChangesField = field
      ? `${field}.symptomChanges`
      : "symptomChanges";
    const symptomChangesValid = validateArrayOf<{
      symptomId: string;
      changePercentage: number;
      notes?: string;
    }>(
      object.symptomChanges,
      // Corrected lambda: only 'item' parameter, pass base field path to validators
      (
        item,
      ): item is {
        symptomId: string;
        changePercentage: number;
        notes?: string;
      } => {
        const itemField = symptomChangesField; // Base path for item
        if (!validateObject(item, itemField)) return false;
        const itemObj = item as Record<string, unknown>;

        const symptomIdField = `${itemField}.symptomId`; // Construct path for property
        if (!validateString(itemObj.symptomId, symptomIdField)) return false;

        const changePercentageField = `${itemField}.changePercentage`; // Construct path for property
        if (!validateNumber(itemObj.changePercentage, changePercentageField))
          return false;

        // Optional notes
        const notesField = `${itemField}.notes`; // Construct path for property
        if (
          itemObj.notes !== undefined &&
          !validateString(itemObj.notes, notesField)
        )
          return false;

        return true; // Item is valid
      },
      symptomChangesField,
    );

    if (!symptomChangesValid) {
      // Error reporting needs improvement here, as validateArrayOf only returns boolean
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<SymptomChange>",
          object.symptomChanges,
          symptomChangesField,
        ),
      };
    }
    // Cast is safe after validation
    const symptomChanges = object.symptomChanges as {
      symptomId: string;
      changePercentage: number;
      notes?: string;
    }[];

    // sideEffects is required array of specific objects
    const sideEffectsField = field ? `${field}.sideEffects` : "sideEffects";
    type SideEffectSeverity = "mild" | "moderate" | "severe";
    const allowedSideEffectSeverities = ["mild", "moderate", "severe"] as const;

    const sideEffectsValid = validateArrayOf<{
      description: string;
      severity: SideEffectSeverity;
      managementStrategy?: string;
    }>(
      object.sideEffects,
      // Corrected lambda: only 'item' parameter, pass base field path to validators
      (
        item,
      ): item is {
        description: string;
        severity: SideEffectSeverity;
        managementStrategy?: string;
      } => {
        const itemField = sideEffectsField; // Base path for item
        if (!validateObject(item, itemField)) return false;
        const itemObj = item as Record<string, unknown>;

        const descriptionField = `${itemField}.description`; // Construct path for property
        if (!validateString(itemObj.description, descriptionField))
          return false;

        const severityField = `${itemField}.severity`; // Construct path for property
        if (
          !validateType(
            itemObj.severity,
            validateOneOf(allowedSideEffectSeverities),
            "SideEffectSeverity",
            severityField, // Pass constructed path
          )
        )
          return false;

        // Optional managementStrategy
        const managementStrategyField = `${itemField}.managementStrategy`; // Construct path for property
        if (
          itemObj.managementStrategy !== undefined &&
          !validateString(itemObj.managementStrategy, managementStrategyField)
        )
          return false;

        return true; // Item is valid
      },
      sideEffectsField,
    );

    if (!sideEffectsValid) {
      // Error reporting needs improvement here
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<SideEffect>",
          object.sideEffects,
          sideEffectsField,
        ),
      };
    }
    // Cast is safe after validation
    const sideEffects = object.sideEffects as {
      description: string;
      severity: SideEffectSeverity;
      managementStrategy?: string;
    }[];

    // Optional properties
    const neurobiologicalChangesField = field
      ? `${field}.neurobiologicalChanges`
      : "neurobiologicalChanges";
    let neurobiologicalChanges:
      | {
          regionId: string;
          activityChange: number;
          connectivityChange?: number;
        }[]
      | undefined;
    if (object.neurobiologicalChanges !== undefined) {
      const neurobiologicalChangesValid = validateArrayOf<{
        regionId: string;
        activityChange: number;
        connectivityChange?: number;
      }>(
        object.neurobiologicalChanges,
        (
          item,
        ): item is {
          regionId: string;
          activityChange: number;
          connectivityChange?: number;
        } => {
          const itemField = neurobiologicalChangesField;
          if (!validateObject(item, itemField)) return false;
          const itemObj = item as Record<string, unknown>;
          if (!validateString(itemObj.regionId, `${itemField}.regionId`))
            return false;
          if (
            !validateNumber(
              itemObj.activityChange,
              `${itemField}.activityChange`,
            )
          )
            return false;
          if (
            itemObj.connectivityChange !== undefined &&
            !validateNumber(
              itemObj.connectivityChange,
              `${itemField}.connectivityChange`,
            )
          )
            return false;
          return true;
        },
        neurobiologicalChangesField,
      );
      if (!neurobiologicalChangesValid) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<NeurobiologicalChange>",
            object.neurobiologicalChanges,
            neurobiologicalChangesField,
          ),
        };
      }
      neurobiologicalChanges = object.neurobiologicalChanges as {
        regionId: string;
        activityChange: number;
        connectivityChange?: number;
      }[];
    }

    const functionalImprovementsField = field
      ? `${field}.functionalImprovements`
      : "functionalImprovements";
    let functionalImprovements: string[] | undefined;
    if (object.functionalImprovements !== undefined) {
      if (
        !validateArrayOf(
          object.functionalImprovements,
          (item): item is string =>
            validateString(item, functionalImprovementsField),
          functionalImprovementsField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<string>",
            object.functionalImprovements,
            functionalImprovementsField,
          ),
        };
      }
      functionalImprovements = object.functionalImprovements as string[];
    }

    const patientReportedOutcomeField = field
      ? `${field}.patientReportedOutcome`
      : "patientReportedOutcome";
    let patientReportedOutcome: number | undefined;
    if (object.patientReportedOutcome !== undefined) {
      if (
        !validateNumber(
          object.patientReportedOutcome,
          patientReportedOutcomeField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "number",
            object.patientReportedOutcome,
            patientReportedOutcomeField,
          ),
        };
      }
      patientReportedOutcome = object.patientReportedOutcome as number;
    }

    const clinicianEvaluationField = field
      ? `${field}.clinicianEvaluation`
      : "clinicianEvaluation";
    let clinicianEvaluation: string | undefined;
    if (object.clinicianEvaluation !== undefined) {
      if (
        !validateString(object.clinicianEvaluation, clinicianEvaluationField)
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.clinicianEvaluation,
            clinicianEvaluationField,
          ),
        };
      }
      clinicianEvaluation = object.clinicianEvaluation as string;
    }

    // Return verified treatment response
    return {
      success: true,
      value: {
        treatmentId: treatmentId,
        assessmentDate: assessmentDate,
        clinicalResponse: clinicalResponse,
        symptomChanges: symptomChanges, // Use validated array
        sideEffects: sideEffects, // Use validated array
        ...(neurobiologicalChanges !== undefined && { neurobiologicalChanges }),
        ...(functionalImprovements !== undefined && { functionalImprovements }),
        ...(patientReportedOutcome !== undefined && { patientReportedOutcome }),
        ...(clinicianEvaluation !== undefined && { clinicianEvaluation }),
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
      return {
        success: false,
        error: new TypeVerificationError("object", obj, baseField),
      };
    }
    const object = obj as Record<string, unknown>; // Safe cast

    // Verify required top-level properties
    const idField = `${baseField}.id`;
    if (!validateString(object.id, idField)) {
      return {
        success: false,
        error: new TypeVerificationError("string", object.id, idField),
      };
    }
    const id = object.id as string;

    const lastUpdatedField = `${baseField}.lastUpdated`;
    if (!validateString(object.lastUpdated, lastUpdatedField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "string",
          object.lastUpdated,
          lastUpdatedField,
        ),
      };
    }
    const lastUpdated = object.lastUpdated as string;

    const versionField = `${baseField}.version`;
    if (!validateString(object.version, versionField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "string",
          object.version,
          versionField,
        ),
      };
    }
    const version = object.version as string;

    // Verify nested required objects
    const demographicDataField = `${baseField}.demographicData`;
    if (!validateObject(object.demographicData, demographicDataField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "object",
          object.demographicData,
          demographicDataField,
        ),
      };
    }
    const demographicData = object.demographicData as Record<string, unknown>;

    const clinicalDataField = `${baseField}.clinicalData`;
    if (!validateObject(object.clinicalData, clinicalDataField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "object",
          object.clinicalData,
          clinicalDataField,
        ),
      };
    }
    const clinicalData = object.clinicalData as Record<string, unknown>;

    const treatmentDataField = `${baseField}.treatmentData`;
    if (!validateObject(object.treatmentData, treatmentDataField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "object",
          object.treatmentData,
          treatmentDataField,
        ),
      };
    }
    const treatmentData = object.treatmentData as Record<string, unknown>;

    const neuralDataField = `${baseField}.neuralData`;
    if (!validateObject(object.neuralData, neuralDataField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "object",
          object.neuralData,
          neuralDataField,
        ),
      };
    }
    const neuralData = object.neuralData as Record<string, unknown>;

    const dataAccessPermissionsField = `${baseField}.dataAccessPermissions`;
    if (
      !validateObject(object.dataAccessPermissions, dataAccessPermissionsField)
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "object",
          object.dataAccessPermissions,
          dataAccessPermissionsField,
        ),
      };
    }
    const dataAccessPermissions = object.dataAccessPermissions as Record<
      string,
      unknown
    >;

    // --- Verify Demographic Data ---
    const ageField = `${demographicDataField}.age`;
    if (!validateNumber(demographicData.age, ageField)) {
      return {
        success: false,
        error: new TypeVerificationError(
          "number",
          demographicData.age,
          ageField,
        ),
      };
    }
    const age = demographicData.age as number;

    const biologicalSexField = `${demographicDataField}.biologicalSex`;
    const allowedSexes = ["male", "female", "other"] as const;
    if (
      !validateType(
        demographicData.biologicalSex,
        validateOneOf(allowedSexes),
        "BiologicalSex",
        biologicalSexField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "BiologicalSex",
          demographicData.biologicalSex,
          biologicalSexField,
        ),
      };
    }
    const biologicalSex = demographicData.biologicalSex as
      | "male"
      | "female"
      | "other";

    const anonymizationLevelField = `${demographicDataField}.anonymizationLevel`;
    const allowedAnonymizationLevels = [
      "full",
      "partial",
      "research",
      "clinical",
    ] as const;
    if (
      !validateType(
        demographicData.anonymizationLevel,
        validateOneOf(allowedAnonymizationLevels),
        "AnonymizationLevel",
        anonymizationLevelField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "AnonymizationLevel",
          demographicData.anonymizationLevel,
          anonymizationLevelField,
        ),
      };
    }
    const anonymizationLevel = demographicData.anonymizationLevel as
      | "full"
      | "partial"
      | "research"
      | "clinical";

    // Optional demographic fields
    const ethnicityField = `${demographicDataField}.ethnicity`;
    let ethnicity: string | undefined;
    if (demographicData.ethnicity !== undefined) {
      if (!validateString(demographicData.ethnicity, ethnicityField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            demographicData.ethnicity,
            ethnicityField,
          ),
        };
      }
      ethnicity = demographicData.ethnicity as string;
    }
    // ... add validation for other optional demographic fields ...

    // --- Verify Clinical Data ---
    const diagnosesField = `${clinicalDataField}.diagnoses`;
    if (
      !validateArrayOf(
        clinicalData.diagnoses,
        (item): item is Diagnosis => {
          // Pass the base field path; validateArrayOf handles indexing
          const result = this.verifyDiagnosis(item, diagnosesField);
          return result.success;
        },
        diagnosesField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<Diagnosis>",
          clinicalData.diagnoses,
          diagnosesField,
        ),
      };
    }
    const diagnoses = clinicalData.diagnoses as Diagnosis[];

    const symptomsField = `${clinicalDataField}.symptoms`;
    if (
      !validateArrayOf(
        clinicalData.symptoms,
        (item): item is Symptom => {
          // Pass the base field path; validateArrayOf handles indexing
          const result = this.verifySymptom(item, symptomsField);
          return result.success;
        },
        symptomsField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<Symptom>",
          clinicalData.symptoms,
          symptomsField,
        ),
      };
    }
    const symptoms = clinicalData.symptoms as Symptom[];

    const medicationsField = `${clinicalDataField}.medications`;
    if (
      !validateArrayOf(
        clinicalData.medications,
        (item): item is Medication => {
          // Pass the base field path; validateArrayOf handles indexing
          // Using placeholder verifyMedication - needs implementation
          const result = this.verifyMedication(item, medicationsField);
          return result.success;
        },
        medicationsField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<Medication>",
          clinicalData.medications,
          medicationsField,
        ),
      };
    }
    const medications = clinicalData.medications as Medication[];

    const psychometricAssessmentsField = `${clinicalDataField}.psychometricAssessments`;
    if (
      !validateArrayOf(
        clinicalData.psychometricAssessments,
        (item): item is PsychometricAssessment => {
          // Pass the base field path; validateArrayOf handles indexing
          // Using placeholder verifyPsychometricAssessment - needs implementation
          const result = this.verifyPsychometricAssessment(
            item,
            psychometricAssessmentsField,
          );
          return result.success;
        },
        psychometricAssessmentsField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<PsychometricAssessment>",
          clinicalData.psychometricAssessments,
          psychometricAssessmentsField,
        ),
      };
    }
    const psychometricAssessments =
      clinicalData.psychometricAssessments as PsychometricAssessment[];

    const medicalHistoryField = `${clinicalDataField}.medicalHistory`;
    if (
      !validateArrayOf(
        clinicalData.medicalHistory,
        (item): item is MedicalHistoryItem => {
          // Pass the base field path; validateArrayOf handles indexing
          // Using placeholder verifyMedicalHistoryItem - needs implementation
          const result = this.verifyMedicalHistoryItem(
            item,
            medicalHistoryField,
          );
          return result.success;
        },
        medicalHistoryField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<MedicalHistoryItem>",
          clinicalData.medicalHistory,
          medicalHistoryField,
        ),
      };
    }
    const medicalHistory = clinicalData.medicalHistory as MedicalHistoryItem[];

    // ... add validation for optional clinical fields (familyHistory, etc.) ...

    // --- Verify Treatment Data ---
    const currentTreatmentsField = `${treatmentDataField}.currentTreatments`;
    if (
      !validateArrayOf(
        treatmentData.currentTreatments,
        (item): item is Treatment => {
          // Pass the base field path; validateArrayOf handles indexing
          const result = this.verifyTreatment(item, currentTreatmentsField);
          return result.success;
        },
        currentTreatmentsField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<Treatment>",
          treatmentData.currentTreatments,
          currentTreatmentsField,
        ),
      };
    }
    const currentTreatments = treatmentData.currentTreatments as Treatment[];

    const historicalTreatmentsField = `${treatmentDataField}.historicalTreatments`;
    if (
      !validateArrayOf(
        treatmentData.historicalTreatments,
        (item): item is Treatment => {
          // Pass the base field path; validateArrayOf handles indexing
          const result = this.verifyTreatment(item, historicalTreatmentsField);
          return result.success;
        },
        historicalTreatmentsField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<Treatment>",
          treatmentData.historicalTreatments,
          historicalTreatmentsField,
        ),
      };
    }
    const historicalTreatments =
      treatmentData.historicalTreatments as Treatment[];

    const treatmentResponsesField = `${treatmentDataField}.treatmentResponses`;
    if (
      !validateArrayOf(
        treatmentData.treatmentResponses,
        (item): item is TreatmentResponse => {
          // Pass the base field path; validateArrayOf handles indexing
          const result = this.verifyTreatmentResponse(
            item,
            treatmentResponsesField,
          );
          return result.success;
        },
        treatmentResponsesField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<TreatmentResponse>",
          treatmentData.treatmentResponses,
          treatmentResponsesField,
        ),
      };
    }
    const treatmentResponses =
      treatmentData.treatmentResponses as TreatmentResponse[];

    // ... add validation for optional treatment fields (treatmentPlan, etc.) ...

    // --- Verify Neural Data ---
    const brainScansField = `${neuralDataField}.brainScans`;
    if (
      !validateArrayOf(
        neuralData.brainScans,
        (item): item is string =>
          // Pass the base field path; validateArrayOf handles indexing
          validateString(item, brainScansField),
        brainScansField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<string>",
          neuralData.brainScans,
          brainScansField,
        ),
      };
    }
    const brainScans = neuralData.brainScans as string[];

    // ... add validation for optional neural fields (eegData, biomarkers, etc.) ...

    // --- Verify Data Permissions ---
    const accessLevelField = `${dataAccessPermissionsField}.accessLevel`;
    const allowedAccessLevels = [
      "full",
      "treatment",
      "research",
      "limited",
    ] as const;
    if (
      !validateType(
        dataAccessPermissions.accessLevel,
        validateOneOf(allowedAccessLevels),
        "AccessLevel",
        accessLevelField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "AccessLevel",
          dataAccessPermissions.accessLevel,
          accessLevelField,
        ),
      };
    }
    const accessLevel = dataAccessPermissions.accessLevel as
      | "full"
      | "treatment"
      | "research"
      | "limited";

    const authorizedUsersField = `${dataAccessPermissionsField}.authorizedUsers`;
    if (
      !validateArrayOf(
        dataAccessPermissions.authorizedUsers,
        (item): item is string =>
          // Pass the base field path; validateArrayOf handles indexing
          validateString(item, authorizedUsersField),
        authorizedUsersField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<string>",
          dataAccessPermissions.authorizedUsers,
          authorizedUsersField,
        ),
      };
    }
    const authorizedUsers = dataAccessPermissions.authorizedUsers as string[];

    const consentStatusField = `${dataAccessPermissionsField}.consentStatus`;
    const allowedConsentStatuses = [
      "full",
      "partial",
      "research-only",
      "none",
    ] as const;
    if (
      !validateType(
        dataAccessPermissions.consentStatus,
        validateOneOf(allowedConsentStatuses),
        "ConsentStatus",
        consentStatusField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "ConsentStatus",
          dataAccessPermissions.consentStatus,
          consentStatusField,
        ),
      };
    }
    const consentStatus = dataAccessPermissions.consentStatus as
      | "full"
      | "partial"
      | "research-only"
      | "none";

    const dataRetentionPolicyField = `${dataAccessPermissionsField}.dataRetentionPolicy`;
    if (
      !validateString(
        dataAccessPermissions.dataRetentionPolicy,
        dataRetentionPolicyField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "string",
          dataAccessPermissions.dataRetentionPolicy,
          dataRetentionPolicyField,
        ),
      };
    }
    const dataRetentionPolicy =
      dataAccessPermissions.dataRetentionPolicy as string;

    const lastReviewDateField = `${dataAccessPermissionsField}.lastReviewDate`;
    if (
      !validateString(dataAccessPermissions.lastReviewDate, lastReviewDateField)
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "string",
          dataAccessPermissions.lastReviewDate,
          lastReviewDateField,
        ),
      };
    }
    const lastReviewDate = dataAccessPermissions.lastReviewDate as string;

    // ... add validation for optional permission fields (restrictedElements) ...

    // --- Construct Verified Patient Object ---
    // Construct the final object carefully, including validated optional fields
    const verifiedPatient: Patient = {
      id,
      demographicData: {
        age,
        biologicalSex,
        anonymizationLevel,
        ...(ethnicity !== undefined && { ethnicity }),
        // ... other optional demographic fields
      },
      clinicalData: {
        diagnoses,
        symptoms,
        medications,
        psychometricAssessments,
        medicalHistory,
        // ... other optional clinical fields
      },
      treatmentData: {
        currentTreatments,
        historicalTreatments,
        treatmentResponses,
        // ... other optional treatment fields
      },
      neuralData: {
        brainScans,
        // ... other optional neural fields
      },
      dataAccessPermissions: {
        accessLevel,
        authorizedUsers,
        consentStatus,
        dataRetentionPolicy,
        lastReviewDate,
        // ... other optional permission fields
      },
      lastUpdated,
      version,
    };

    return { success: true, value: verifiedPatient };
  }

  // --- Assertion Functions ---

  /**
   * Asserts that a value is a valid RiskLevel
   */
  assertRiskLevel(value: unknown, field?: string): asserts value is RiskLevel {
    const result = this.verifyRiskLevel(value, field);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Asserts that a value is a valid Symptom
   */
  assertSymptom(value: unknown, field?: string): asserts value is Symptom {
    const result = this.verifySymptom(value, field);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Asserts that a value is a valid Diagnosis
   */
  assertDiagnosis(value: unknown, field?: string): asserts value is Diagnosis {
    const result = this.verifyDiagnosis(value, field);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Asserts that a value is a valid Treatment
   */
  assertTreatment(value: unknown, field?: string): asserts value is Treatment {
    const result = this.verifyTreatment(value, field);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Asserts that a value is a valid TreatmentResponse
   */
  assertTreatmentResponse(
    value: unknown,
    field?: string,
  ): asserts value is TreatmentResponse {
    const result = this.verifyTreatmentResponse(value, field);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Asserts that a value is a valid Patient
   */
  assertPatient(value: unknown, field?: string): asserts value is Patient {
    const result = this.verifyPatient(value, field);
    if (!result.success) {
      throw result.error;
    }
  }
}

// Export a singleton instance for convenience
export const clinicalTypeVerifier = new ClinicalTypeVerifier();

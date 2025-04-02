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
      "DSM-5-TR", // Added DSM-5-TR based on type
      "SNOMED-CT",
      "Other",
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
    ] as const; // Updated based on type
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
    const onsetDateFieldDiag = field ? `${field}.onsetDate` : "onsetDate";
    let onsetDateDiag: string | undefined;
    if (object.onsetDate !== undefined) {
      if (!validateString(object.onsetDate, onsetDateFieldDiag)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.onsetDate,
            onsetDateFieldDiag,
          ),
        };
      }
      onsetDateDiag = object.onsetDate as string;
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

    const notesFieldDiag = field ? `${field}.notes` : "notes";
    let notesDiag: string | undefined;
    if (object.notes !== undefined) {
      if (!validateString(object.notes, notesFieldDiag)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            object.notes,
            notesFieldDiag,
          ),
        };
      }
      notesDiag = object.notes as string;
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

    const associatedBrainRegionsFieldDiag = field
      ? `${field}.associatedBrainRegions`
      : "associatedBrainRegions";
    let associatedBrainRegionsDiag: string[] | undefined;
    if (object.associatedBrainRegions !== undefined) {
      if (
        !validateArrayOf(
          object.associatedBrainRegions,
          (item): item is string =>
            validateString(item, associatedBrainRegionsFieldDiag),
          associatedBrainRegionsFieldDiag,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<string>",
            object.associatedBrainRegions,
            associatedBrainRegionsFieldDiag,
          ),
        };
      }
      associatedBrainRegionsDiag = object.associatedBrainRegions as string[];
    }

    // Return verified diagnosis
    return {
      success: true,
      value: {
        id,
        name,
        code,
        codingSystem,
        diagnosisDate,
        severity,
        status, // Added required status
        ...(onsetDateDiag !== undefined && { onsetDate: onsetDateDiag }),
        ...(diagnosingClinician !== undefined && { diagnosingClinician }),
        ...(notesDiag !== undefined && { notes: notesDiag }),
        ...(confidenceLevel !== undefined && { confidenceLevel }),
        ...(associatedBrainRegionsDiag !== undefined && {
          associatedBrainRegions: associatedBrainRegionsDiag,
        }),
      } as Diagnosis, // Cast should be safer now
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

    const typeField = field ? `${field}.type` : "type";
    const allowedTypes = [
      "pharmacological", // Updated based on type
      "psychotherapy",
      "neuromodulation",
      "lifestyle",
      "complementary", // Added based on type
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
    ] as const; // Updated based on type
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
          (item): item is string => validateString(item, targetBrainRegionsField),
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
        id,
        name,
        type,
        description, // Added required description
        startDate,
        status, // Added required status
        ...(endDate !== undefined && { endDate }),
        ...(provider !== undefined && { provider }),
        ...(discontinuationReason !== undefined && { discontinuationReason }),
        ...(frequency !== undefined && { frequency }),
        ...(dose !== undefined && { dose }),
        ...(effectiveness !== undefined && { effectiveness }),
        ...(adherence !== undefined && { adherence }),
        ...(notes !== undefined && { notes }),
        ...(targetSymptoms !== undefined && { targetSymptoms }),
        ...(targetBrainRegions !== undefined && { targetBrainRegions }),
        ...(sideEffects !== undefined && { sideEffects }),
      } as Treatment, // Cast should be safer now
    };
  }

  /**
   * Verify that an object conforms to the Medication interface (placeholder)
   * TODO: Implement full verification based on Medication type definition
   */
  verifyMedication(obj: unknown, field?: string): Result<Medication> {
    if (!validateObject(obj, field)) {
      return {
        success: false,
        error: new TypeVerificationError("object", obj, field),
      };
    }
    // Placeholder: Assume valid for now
    return { success: true, value: obj as Medication };
  }

  /**
   * Verify that an object conforms to the PsychometricAssessment interface (placeholder)
   * TODO: Implement full verification based on PsychometricAssessment type definition
   */
  verifyPsychometricAssessment(
    obj: unknown,
    field?: string,
  ): Result<PsychometricAssessment> {
    if (!validateObject(obj, field)) {
      return {
        success: false,
        error: new TypeVerificationError("object", obj, field),
      };
    }
    // Placeholder: Assume valid for now
    return { success: true, value: obj as PsychometricAssessment };
  }

  /**
   * Verify that an object conforms to the MedicalHistoryItem interface (placeholder)
   * TODO: Implement full verification based on MedicalHistoryItem type definition
   */
  verifyMedicalHistoryItem(
    obj: unknown,
    field?: string,
  ): Result<MedicalHistoryItem> {
    if (!validateObject(obj, field)) {
      return {
        success: false,
        error: new TypeVerificationError("object", obj, field),
      };
    }
    // Placeholder: Assume valid for now
    return { success: true, value: obj as MedicalHistoryItem };
  }

  /**
   * Verify that an object conforms to the TreatmentResponse interface
   */
  verifyTreatmentResponse(
    obj: unknown,
    field?: string,
  ): Result<TreatmentResponse> {
    const baseField = field ?? "TreatmentResponse";
    if (!validateObject(obj, baseField)) {
      return {
        success: false,
        error: new TypeVerificationError("object", obj, baseField),
      };
    }
    const object = obj as Record<string, unknown>; // Safe cast

    // Verify required properties
    const treatmentIdField = `${baseField}.treatmentId`;
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

    const assessmentDateField = `${baseField}.assessmentDate`;
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

    const clinicalResponseField = `${baseField}.clinicalResponse`;
    const allowedClinicalResponses = [
      "remission",
      "response",
      "partial response",
      "no response",
      "worsening",
    ] as const;
    type ClinicalResponse = (typeof allowedClinicalResponses)[number];
    if (
      !validateType(
        object.clinicalResponse,
        validateOneOf(allowedClinicalResponses),
        "ClinicalResponse",
        clinicalResponseField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "ClinicalResponse",
          object.clinicalResponse,
          clinicalResponseField,
        ),
      };
    }
    const clinicalResponse = object.clinicalResponse as ClinicalResponse;

    // Verify required symptomChanges array
    const symptomChangesField = `${baseField}.symptomChanges`;
    if (
      !validateArrayOf(
        object.symptomChanges,
        (item): item is TreatmentResponse["symptomChanges"][number] => {
          const itemField = `${symptomChangesField}[]`;
          if (!validateObject(item, itemField)) return false;
          const itemObj = item as Record<string, unknown>;
          return (
            validateString(itemObj.symptomId, `${itemField}.symptomId`) &&
            validateNumber(
              itemObj.changePercentage,
              `${itemField}.changePercentage`,
            ) &&
            (itemObj.notes === undefined ||
              validateString(itemObj.notes, `${itemField}.notes`))
          );
        },
        symptomChangesField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<{symptomId: string, changePercentage: number, notes?: string}>",
          object.symptomChanges,
          symptomChangesField,
        ),
      };
    }
    const symptomChanges =
      object.symptomChanges as TreatmentResponse["symptomChanges"];

    // Verify required sideEffects array
    const sideEffectsField = `${baseField}.sideEffects`;
    if (
      !validateArrayOf(
        object.sideEffects,
        (item): item is TreatmentResponse["sideEffects"][number] => {
          const itemField = `${sideEffectsField}[]`;
          if (!validateObject(item, itemField)) return false;
          const itemObj = item as Record<string, unknown>;
          const allowedSeverities = ["mild", "moderate", "severe"] as const;
          return (
            validateString(itemObj.description, `${itemField}.description`) &&
            validateType(
              itemObj.severity,
              validateOneOf(allowedSeverities),
              "Severity",
              `${itemField}.severity`,
            ) &&
            (itemObj.managementStrategy === undefined ||
              validateString(
                itemObj.managementStrategy,
                `${itemField}.managementStrategy`,
              ))
          );
        },
        sideEffectsField,
      )
    ) {
      return {
        success: false,
        error: new TypeVerificationError(
          "Array<{description: string, severity: 'mild'|'moderate'|'severe', managementStrategy?: string}>",
          object.sideEffects,
          sideEffectsField,
        ),
      };
    }
    const sideEffects = object.sideEffects as TreatmentResponse["sideEffects"];

    // Optional properties
    const neurobiologicalChangesField = `${baseField}.neurobiologicalChanges`;
    let neurobiologicalChanges:
      | TreatmentResponse["neurobiologicalChanges"]
      | undefined;
    if (object.neurobiologicalChanges !== undefined) {
      if (
        !validateArrayOf(
          object.neurobiologicalChanges,
          (
            item,
          ): item is { regionId: string; activityChange: number; connectivityChange?: number; } => { // Corrected item type
            const itemField = `${neurobiologicalChangesField}[]`;
            if (!validateObject(item, itemField)) return false;
            const itemObj = item as Record<string, unknown>;
            return (
              validateString(itemObj.regionId, `${itemField}.regionId`) &&
              validateNumber(
                itemObj.activityChange,
                `${itemField}.activityChange`,
              ) &&
              (itemObj.connectivityChange === undefined ||
                validateNumber(
                  itemObj.connectivityChange,
                  `${itemField}.connectivityChange`,
                ))
            );
          },
          neurobiologicalChangesField,
        )
      ) {
        return {
          success: false,
          error: new TypeVerificationError(
            "Array<{regionId: string, activityChange: number, connectivityChange?: number}>",
            object.neurobiologicalChanges,
            neurobiologicalChangesField,
          ),
        };
      }
      neurobiologicalChanges =
        object.neurobiologicalChanges as TreatmentResponse["neurobiologicalChanges"];
    }

    const functionalImprovementsField = `${baseField}.functionalImprovements`;
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

    const patientReportedOutcomeField = `${baseField}.patientReportedOutcome`;
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

    const clinicianEvaluationField = `${baseField}.clinicianEvaluation`;
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
        treatmentId,
        assessmentDate,
        clinicalResponse,
        symptomChanges,
        sideEffects,
        ...(neurobiologicalChanges !== undefined && { neurobiologicalChanges }),
        ...(functionalImprovements !== undefined && { functionalImprovements }),
        ...(patientReportedOutcome !== undefined && { patientReportedOutcome }),
        ...(clinicianEvaluation !== undefined && { clinicianEvaluation }),
      } as TreatmentResponse, // Cast should be safer now
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

    const occupationalStatusField = `${demographicDataField}.occupationalStatus`;
    let occupationalStatus: string | undefined;
    if (demographicData.occupationalStatus !== undefined) {
      if (!validateString(demographicData.occupationalStatus, occupationalStatusField)) {
        return {
          success: false,
          error: new TypeVerificationError(
            "string",
            demographicData.occupationalStatus,
            occupationalStatusField,
          ),
        };
      }
      occupationalStatus = demographicData.occupationalStatus as string;
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
        ...(occupationalStatus !== undefined && { occupationalStatus }),
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
      // Throw a new error instance created in this context to ensure instanceof works in tests
      throw new TypeVerificationError("TypeAssertionFailed", value, field);
    }
  }

  /**
   * Asserts that a value is a valid Symptom
   */
  assertSymptom(value: unknown, field?: string): asserts value is Symptom {
    const result = this.verifySymptom(value, field);
    if (!result.success) {
      // Throw a new error instance created in this context to ensure instanceof works in tests
      throw new TypeVerificationError("TypeAssertionFailed", value, field);
    }
  }

  /**
   * Asserts that a value is a valid Diagnosis
   */
  assertDiagnosis(value: unknown, field?: string): asserts value is Diagnosis {
    const result = this.verifyDiagnosis(value, field);
    if (!result.success) {
      // Throw a new error instance created in this context to ensure instanceof works in tests
      throw new TypeVerificationError("TypeAssertionFailed", value, field);
    }
  }

  /**
   * Asserts that a value is a valid Treatment
   */
  assertTreatment(value: unknown, field?: string): asserts value is Treatment {
    const result = this.verifyTreatment(value, field);
    if (!result.success) {
      // Throw a new error instance created in this context to ensure instanceof works in tests
      throw new TypeVerificationError("TypeAssertionFailed", value, field);
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
      // Throw a new error instance created in this context to ensure instanceof works in tests
      throw new TypeVerificationError("TypeAssertionFailed", value, field);
    }
  }

  /**
   * Asserts that a value is a valid Patient
   */
  assertPatient(value: unknown, field?: string): asserts value is Patient {
    const result = this.verifyPatient(value, field);
    if (!result.success) {
      // Throw a new error instance created in this context to ensure instanceof works in tests
      throw new TypeVerificationError("TypeAssertionFailed", value, field);
    }
  }
}

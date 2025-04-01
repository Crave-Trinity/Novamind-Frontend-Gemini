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
import {
  typeVerifier,
  TypeVerificationError,
} from "@domain/utils/shared/type-verification";

/**
 * Clinical model type verification utilities
 */
export class ClinicalTypeVerifier {
  /**
   * Verify that a value is a valid RiskLevel enum value
   */
  verifyRiskLevel(level: unknown, field?: string): Result<RiskLevel> {
    const validLevels = Object.values(RiskLevel);

    if (typeof level === "string" && validLevels.includes(level as RiskLevel)) {
      return {
        success: true,
        value: level as RiskLevel,
      };
    }

    return {
      success: false,
      error: new TypeVerificationError(
        `Invalid RiskLevel`,
        `one of [${validLevels.join(", ")}]`,
        typeof level === "object"
          ? level === null
            ? "null"
            : Array.isArray(level)
              ? "array"
              : "object"
          : typeof level,
        field,
      ),
    };
  }

  /**
   * Verify that an object conforms to the Symptom interface
   */
  verifySymptom(obj: unknown, field?: string): Result<Symptom> {
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<Symptom>;
    }

    const object = objResult.value;

    // Verify required properties
    const idResult = typeVerifier.verifyString(
      object.id,
      field ? `${field}.id` : "id",
    );
    if (!idResult.success) return idResult as Result<Symptom>;

    const nameResult = typeVerifier.verifyString(
      object.name,
      field ? `${field}.name` : "name",
    );
    if (!nameResult.success) return nameResult as Result<Symptom>;

    const severityResult = typeVerifier.verifyNumber(
      object.severity,
      field ? `${field}.severity` : "severity",
    );
    if (!severityResult.success) return severityResult as Result<Symptom>;

    // Optional properties
    const description =
      object.description !== undefined
        ? typeVerifier.safelyParseString(object.description, "")
        : undefined;

    // onsetDate should be string? according to Symptom type
    const onsetDateResult = typeVerifier.verifyOptionalString(object.onsetDate, field ? `${field}.onsetDate` : "onsetDate");
    if (!onsetDateResult.success) return onsetDateResult as Result<Symptom>;
    const onsetDate = onsetDateResult.value;

    // frequency should be one of specific literals
    const frequencyResult = typeVerifier.verifyEnum(
      object.frequency,
      ["constant", "daily", "weekly", "monthly", "episodic", "situational"],
      field ? `${field}.frequency` : "frequency"
    );
    if (!frequencyResult.success) return frequencyResult as Result<Symptom>;
    const frequency = frequencyResult.value;

    // impact should be one of specific literals
    const impactResult = typeVerifier.verifyEnum(
      object.impact,
      ["none", "mild", "moderate", "severe"],
      field ? `${field}.impact` : "impact"
    );
    if (!impactResult.success) return impactResult as Result<Symptom>;
    const impact = impactResult.value;

    // progression should be one of specific literals
    const progressionResult = typeVerifier.verifyEnum(
      object.progression,
      ["improving", "stable", "worsening", "fluctuating"],
      field ? `${field}.progression` : "progression"
    );
    if (!progressionResult.success) return progressionResult as Result<Symptom>;
    const progression = progressionResult.value;

    // category should be one of specific literals
    const categoryResult = typeVerifier.verifyEnum(
        object.category,
        ["cognitive", "affective", "behavioral", "somatic", "perceptual"],
        field ? `${field}.category` : "category"
    );
    if (!categoryResult.success) return categoryResult as Result<Symptom>;
    const category = categoryResult.value;


    // Return verified symptom
    return {
      success: true,
      value: {
        id: idResult.value,
        name: nameResult.value,
        severity: severityResult.value,
        category: category,
        frequency: frequency,
        impact: impact,
        progression: progression,
        ...(onsetDate !== undefined && { onsetDate }), // Handle exactOptionalPropertyTypes
        // Optional fields like lastOccurrence, duration, triggers, etc. need verification if present
      } as Symptom, // Cast to ensure type alignment
    };
  }

  /**
   * Verify that an object conforms to the Diagnosis interface
   */
  verifyDiagnosis(obj: unknown, field?: string): Result<Diagnosis> {
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<Diagnosis>;
    }

    const object = objResult.value;

    // Verify required properties
    const idResult = typeVerifier.verifyString(
      object.id,
      field ? `${field}.id` : "id",
    );
    if (!idResult.success) return idResult as Result<Diagnosis>;

    const nameResult = typeVerifier.verifyString(
      object.name,
      field ? `${field}.name` : "name",
    );
    if (!nameResult.success) return nameResult as Result<Diagnosis>;

    // diagnosisDate should be string according to Diagnosis type
    const diagnosisDateResult = typeVerifier.verifyString(object.diagnosisDate, field ? `${field}.diagnosisDate` : "diagnosisDate");
    if (!diagnosisDateResult.success)
      return diagnosisDateResult as Result<Diagnosis>;

    // Optional properties
    const description =
      object.description !== undefined
        ? typeVerifier.safelyParseString(object.description, "")
        : undefined;

    const icdCode =
      object.icdCode !== undefined
        ? typeVerifier.safelyParseString(object.icdCode, "")
        : undefined;

    // severity should be one of specific literals
    const severityResult = typeVerifier.verifyEnum(
      object.severity,
      ["mild", "moderate", "severe", "in remission", "unspecified"],
      field ? `${field}.severity` : "severity"
    );
    if (!severityResult.success) return severityResult as Result<Diagnosis>;
    const severity = severityResult.value;

    // code is required
    const codeResult = typeVerifier.verifyString(object.code, field ? `${field}.code` : "code");
    if (!codeResult.success) return codeResult as Result<Diagnosis>;
    const code = codeResult.value;

    // codingSystem is required
    const codingSystemResult = typeVerifier.verifyEnum(
        object.codingSystem,
        ["ICD-10", "ICD-11", "DSM-5", "DSM-5-TR"],
        field ? `${field}.codingSystem` : "codingSystem"
    );
    if (!codingSystemResult.success) return codingSystemResult as Result<Diagnosis>;
    const codingSystem = codingSystemResult.value;

    // status is required
    const statusResult = typeVerifier.verifyEnum(
        object.status,
        ["active", "resolved", "in remission", "recurrent"],
        field ? `${field}.status` : "status"
    );
    if (!statusResult.success) return statusResult as Result<Diagnosis>;
    const status = statusResult.value;

    // Return verified diagnosis
    return {
      success: true,
      value: {
        id: idResult.value,
        code: code, // Added required code
        codingSystem: codingSystem, // Added required codingSystem
        name: nameResult.value,
        severity: severity, // Now a specific literal
        diagnosisDate: diagnosisDateResult.value, // Now a string
        status: status, // Added required status
        // description, // description is not in Diagnosis type
        // icdCode, // icdCode is not in Diagnosis type
        // Optional fields like onsetDate, diagnosingClinician, notes, etc. need verification if present
      },
    };
  }

  /**
   * Verify that an object conforms to the Treatment interface
   */
  verifyTreatment(obj: unknown, field?: string): Result<Treatment> {
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<Treatment>;
    }

    const object = objResult.value;

    // Verify required properties
    const idResult = typeVerifier.verifyString(
      object.id,
      field ? `${field}.id` : "id",
    );
    if (!idResult.success) return idResult as Result<Treatment>;

    const nameResult = typeVerifier.verifyString(
      object.name,
      field ? `${field}.name` : "name",
    );
    if (!nameResult.success) return nameResult as Result<Treatment>;

    // type should be one of specific literals
    const typeResult = typeVerifier.verifyEnum(
      object.type,
      ["pharmacological", "psychotherapy", "neuromodulation", "lifestyle", "complementary", "other"],
      field ? `${field}.type` : "type"
    );
    if (!typeResult.success) return typeResult as Result<Treatment>;

    // Optional properties
    // description is required and should be string
    const descriptionResult = typeVerifier.verifyString(object.description, field ? `${field}.description` : "description");
    if (!descriptionResult.success) return descriptionResult as Result<Treatment>;
    const description = descriptionResult.value;

    // startDate should be string
    const startDateResult = typeVerifier.verifyString(object.startDate, field ? `${field}.startDate` : "startDate");
    if (!startDateResult.success) return startDateResult as Result<Treatment>;
    const startDate = startDateResult.value;

    // endDate should be string?
    const endDateResult = typeVerifier.verifyOptionalString(object.endDate, field ? `${field}.endDate` : "endDate");
    if (!endDateResult.success) return endDateResult as Result<Treatment>;
    const endDate = endDateResult.value;

    const dosage =
      object.dose !== undefined
        ? typeVerifier.safelyParseString(object.dose, "")
        : undefined;

    // status is required
    const statusResult = typeVerifier.verifyEnum(
        object.status,
        ["active", "completed", "discontinued", "planned"],
        field ? `${field}.status` : "status"
    );
    if (!statusResult.success) return statusResult as Result<Treatment>;
    const status = statusResult.value; // Assign value here

    const frequency =
      object.frequency !== undefined
        ? typeVerifier.safelyParseString(object.frequency, "")
        : undefined;

    // Return verified treatment
    return {
      success: true,
      value: {
        id: idResult.value,
        name: nameResult.value,
        type: typeResult.value, // Now a specific literal
        description: description, // Now required string
        startDate: startDate, // Now string
        ...(endDate !== undefined && { endDate }), // Handle exactOptionalPropertyTypes
        ...(dosage !== undefined && { dose: dosage }), // Handle exactOptionalPropertyTypes
        ...(frequency !== undefined && { frequency }), // Handle exactOptionalPropertyTypes
        // status is required
        status: status, // Use the assigned value
        // status is required
        // Optional fields like provider, discontinuationReason, etc. need verification if present
      },
    };
  }

  // --- Placeholder Verifiers for Complex Types ---
  // TODO: Implement detailed verification logic for these types

  verifyMedication(obj: unknown, field?: string): Result<Medication> {
    // Basic object check for now
    const result = typeVerifier.verifyObject(obj, field);
    if (!result.success) return result as Result<Medication>;
    // Add checks for required Medication fields (id, name, classification, dosage, frequency, route, startDate)
    // For now, just cast to satisfy the type system
    return { success: true, value: result.value as unknown as Medication };
  }

  verifyPsychometricAssessment(obj: unknown, field?: string): Result<PsychometricAssessment> {
    // Basic object check for now
    const result = typeVerifier.verifyObject(obj, field);
     if (!result.success) return result as Result<PsychometricAssessment>;
    // Add checks for required PsychometricAssessment fields (id, name, date, scores, interpretation)
    return { success: true, value: result.value as unknown as PsychometricAssessment };
  }

   verifyMedicalHistoryItem(obj: unknown, field?: string): Result<MedicalHistoryItem> {
    // Basic object check for now
    const result = typeVerifier.verifyObject(obj, field);
     if (!result.success) return result as Result<MedicalHistoryItem>;
    // Add checks for required MedicalHistoryItem fields (id, condition, type, status, impact, relevanceToNeuralHealth)
    return { success: true, value: result.value as unknown as MedicalHistoryItem };
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
      throw result.error;
    }
  }

  /**
   * Assert that an object is a Symptom
   */
  assertSymptom(value: unknown, field?: string): asserts value is Symptom {
    const result = this.verifySymptom(value, field);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Assert that an object is a Diagnosis
   */
  assertDiagnosis(value: unknown, field?: string): asserts value is Diagnosis {
    const result = this.verifyDiagnosis(value, field);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Assert that an object is a Treatment
   */
  assertTreatment(value: unknown, field?: string): asserts value is Treatment {
    const result = this.verifyTreatment(value, field);
    if (!result.success) {
      throw result.error;
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
      throw result.error;
    }
  }

  /**
   * Assert that an object is a Patient
   */
  assertPatient(value: unknown, field?: string): asserts value is Patient {
    const result = this.verifyPatient(value, field);
    if (!result.success) {
      throw result.error;
    }
  }
}

// Export singleton instance for easy usage
export const clinicalTypeVerifier = new ClinicalTypeVerifier();

/**
 * NOVAMIND Neural-Safe Application Service
 * ClinicalService Runtime Validation - Quantum-level runtime validation
 * with HIPAA compliance and psychiatric precision
 */
import type { RiskAssessment } from "@domain/types/clinical/risk"; // Use type import
import type { TreatmentResponsePrediction } from "@domain/types/clinical/treatment"; // Use type import
import type { Symptom, Diagnosis, Treatment } from "@domain/types/clinical/patient"; // Use type import
import { type Result, success, failure } from "@domain/types/shared/common"; // Use type import for Result

// Custom error class for type verification errors
class TypeVerificationError extends Error {
  constructor(
    message: string,
    public expectedType: string,
    public actualType: string,
    public field?: string,
  ) {
    super(message);
    this.name = "TypeVerificationError";
  }
}

/**
 * Runtime validation for Symptom objects
 * @param obj - The object to validate as a Symptom
 * @returns A boolean indicating if the object is a valid Symptom
 */
export function isSymptom(obj: unknown): obj is Symptom {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const symptom = obj as Partial<Symptom>;

  return (
    typeof symptom.id === "string" &&
    typeof symptom.name === "string" &&
    typeof symptom.category === "string" &&
    typeof symptom.severity === "number" &&
    typeof symptom.frequency === "string" &&
    typeof symptom.impact === "string" &&
    typeof symptom.progression === "string"
  );
}

/**
 * Validates a Symptom with detailed error reporting
 * @param obj - The object to validate
 * @param field - Optional field name for error context
 * @returns A Result with the validated Symptom or an error
 */
export function validateSymptom(obj: unknown, field?: string): Result<Symptom> {
  if (!obj || typeof obj !== "object") {
    return failure(
      new TypeVerificationError(
        "Invalid Symptom: expected an object",
        "Symptom",
        typeof obj,
        field,
      ),
    );
  }

  const symptom = obj as Partial<Symptom>;

  // Validate required string fields
  if (typeof symptom.id !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Symptom: missing or invalid 'id'",
        "string",
        typeof symptom.id,
        field ? `${field}.id` : "id",
      ),
    );
  }

  if (typeof symptom.name !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Symptom: missing or invalid 'name'",
        "string",
        typeof symptom.name,
        field ? `${field}.name` : "name",
      ),
    );
  }

  if (typeof symptom.category !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Symptom: missing or invalid 'category'",
        "string",
        typeof symptom.category,
        field ? `${field}.category` : "category",
      ),
    );
  }

  // Validate numeric fields
  if (
    typeof symptom.severity !== "number" ||
    symptom.severity < 0 ||
    symptom.severity > 10
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid Symptom: missing or invalid 'severity', must be a number between 0 and 10",
        "number",
        typeof symptom.severity,
        field ? `${field}.severity` : "severity",
      ),
    );
  }

  // Validate frequency
  if (typeof symptom.frequency !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Symptom: missing or invalid 'frequency'",
        "string",
        typeof symptom.frequency,
        field ? `${field}.frequency` : "frequency",
      ),
    );
  }

  // Validate impact
  if (typeof symptom.impact !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Symptom: missing or invalid 'impact'",
        "string",
        typeof symptom.impact,
        field ? `${field}.impact` : "impact",
      ),
    );
  }

  // Validate progression
  if (typeof symptom.progression !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Symptom: missing or invalid 'progression'",
        "string",
        typeof symptom.progression,
        field ? `${field}.progression` : "progression",
      ),
    );
  }

  // Validate date string if present
  if (symptom.onsetDate !== undefined && !isValidDate(symptom.onsetDate)) {
    return failure(
      new TypeVerificationError(
        "Invalid Symptom: invalid 'onsetDate', must be a valid date string",
        "string (date)",
        typeof symptom.onsetDate,
        field ? `${field}.onsetDate` : "onsetDate",
      ),
    );
  }

  // Validate duration if present
  if (symptom.duration !== undefined && typeof symptom.duration !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Symptom: invalid 'duration', must be a string",
        "string",
        typeof symptom.duration,
        field ? `${field}.duration` : "duration",
      ),
    );
  }

  // Validate triggers if present
  if (symptom.triggers !== undefined && !Array.isArray(symptom.triggers)) {
    return failure(
      new TypeVerificationError(
        "Invalid Symptom: invalid 'triggers', must be an array of strings",
        "string[]",
        typeof symptom.triggers,
        field ? `${field}.triggers` : "triggers",
      ),
    );
  }

  return success(symptom as Symptom);
}

/**
 * Runtime validation for Diagnosis objects
 * @param obj - The object to validate as a Diagnosis
 * @returns A boolean indicating if the object is a valid Diagnosis
 */
export function isDiagnosis(obj: unknown): obj is Diagnosis {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const diagnosis = obj as Partial<Diagnosis>;

  return (
    typeof diagnosis.id === "string" &&
    typeof diagnosis.code === "string" &&
    typeof diagnosis.codingSystem === "string" &&
    typeof diagnosis.name === "string" &&
    typeof diagnosis.severity === "string" &&
    typeof diagnosis.diagnosisDate === "string" &&
    typeof diagnosis.status === "string"
  );
}

/**
 * Validates a Diagnosis with detailed error reporting
 * @param obj - The object to validate
 * @param field - Optional field name for error context
 * @returns A Result with the validated Diagnosis or an error
 */
export function validateDiagnosis(
  obj: unknown,
  field?: string,
): Result<Diagnosis> {
  if (!obj || typeof obj !== "object") {
    return failure(
      new TypeVerificationError(
        "Invalid Diagnosis: expected an object",
        "Diagnosis",
        typeof obj,
        field,
      ),
    );
  }

  const diagnosis = obj as Partial<Diagnosis>;

  // Validate required string fields
  if (typeof diagnosis.id !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Diagnosis: missing or invalid 'id'",
        "string",
        typeof diagnosis.id,
        field ? `${field}.id` : "id",
      ),
    );
  }

  if (typeof diagnosis.code !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Diagnosis: missing or invalid 'code'",
        "string",
        typeof diagnosis.code,
        field ? `${field}.code` : "code",
      ),
    );
  }

  if (typeof diagnosis.codingSystem !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Diagnosis: missing or invalid 'codingSystem'",
        "string",
        typeof diagnosis.codingSystem,
        field ? `${field}.codingSystem` : "codingSystem",
      ),
    );
  }

  if (typeof diagnosis.name !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Diagnosis: missing or invalid 'name'",
        "string",
        typeof diagnosis.name,
        field ? `${field}.name` : "name",
      ),
    );
  }

  // Validate severity
  if (typeof diagnosis.severity !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Diagnosis: missing or invalid 'severity', must be a string",
        "string",
        typeof diagnosis.severity,
        field ? `${field}.severity` : "severity",
      ),
    );
  }

  // Validate status
  if (typeof diagnosis.status !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Diagnosis: missing or invalid 'status'",
        "string",
        typeof diagnosis.status,
        field ? `${field}.status` : "status",
      ),
    );
  }

  // Validate diagnosis date
  if (
    typeof diagnosis.diagnosisDate !== "string" ||
    !isValidDate(diagnosis.diagnosisDate)
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid Diagnosis: missing or invalid 'diagnosisDate', must be a valid date string",
        "string (date)",
        typeof diagnosis.diagnosisDate,
        field ? `${field}.diagnosisDate` : "diagnosisDate",
      ),
    );
  }

  return success(diagnosis as Diagnosis);
}

/**
 * Runtime validation for Treatment objects
 * @param obj - The object to validate as a Treatment
 * @returns A boolean indicating if the object is a valid Treatment
 */
export function isTreatment(obj: unknown): obj is Treatment {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const treatment = obj as Partial<Treatment>;

  return (
    typeof treatment.id === "string" &&
    typeof treatment.name === "string" &&
    typeof treatment.type === "string" &&
    typeof treatment.startDate === "string" &&
    typeof treatment.status === "string"
  );
}

/**
 * Validates a Treatment with detailed error reporting
 * @param obj - The object to validate
 * @param field - Optional field name for error context
 * @returns A Result with the validated Treatment or an error
 */
export function validateTreatment(
  obj: unknown,
  field?: string,
): Result<Treatment> {
  if (!obj || typeof obj !== "object") {
    return failure(
      new TypeVerificationError(
        "Invalid Treatment: expected an object",
        "Treatment",
        typeof obj,
        field,
      ),
    );
  }

  const treatment = obj as Partial<Treatment>;

  // Validate required string fields
  if (typeof treatment.id !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Treatment: missing or invalid 'id'",
        "string",
        typeof treatment.id,
        field ? `${field}.id` : "id",
      ),
    );
  }

  if (typeof treatment.name !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Treatment: missing or invalid 'name'",
        "string",
        typeof treatment.name,
        field ? `${field}.name` : "name",
      ),
    );
  }

  if (typeof treatment.type !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Treatment: missing or invalid 'type'",
        "string",
        typeof treatment.type,
        field ? `${field}.type` : "type",
      ),
    );
  }

  // Validate date fields
  if (
    typeof treatment.startDate !== "string" ||
    !isValidDate(treatment.startDate)
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid Treatment: missing or invalid 'startDate', must be a valid date string",
        "string (date)",
        typeof treatment.startDate,
        field ? `${field}.startDate` : "startDate",
      ),
    );
  }

  if (
    treatment.endDate &&
    (typeof treatment.endDate !== "string" || !isValidDate(treatment.endDate))
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid Treatment: invalid 'endDate', must be a valid date string",
        "string (date)",
        typeof treatment.endDate,
        field ? `${field}.endDate` : "endDate",
      ),
    );
  }

  // Validate status
  if (typeof treatment.status !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid Treatment: missing or invalid 'status'",
        "string",
        typeof treatment.status,
        field ? `${field}.status` : "status",
      ),
    );
  }

  return success(treatment as Treatment);
}

/**
 * Runtime validation for RiskAssessment objects
 * @param obj - The object to validate as a RiskAssessment
 * @returns A boolean indicating if the object is a valid RiskAssessment
 */
export function isRiskAssessment(obj: unknown): obj is RiskAssessment {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const assessment = obj as Partial<RiskAssessment>;

  return (
    typeof assessment.id === "string" &&
    typeof assessment.patientId === "string" &&
    typeof assessment.timestamp === "string" &&
    typeof assessment.assessmentType === "string" &&
    typeof assessment.overallRisk === "string" &&
    typeof assessment.confidenceScore === "number" &&
    Array.isArray(assessment.domainRisks) &&
    typeof assessment.temporalTrend === "string" &&
    Array.isArray(assessment.contributingFactors) &&
    Array.isArray(assessment.protectiveFactors) &&
    Array.isArray(assessment.neuralCorrelates)
  );
}

/**
 * Validates a RiskAssessment with detailed error reporting
 * @param obj - The object to validate
 * @param field - Optional field name for error context
 * @returns A Result with the validated RiskAssessment or an error
 */
export function validateRiskAssessment(
  obj: unknown,
  field?: string,
): Result<RiskAssessment> {
  if (!obj || typeof obj !== "object") {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: expected an object",
        "RiskAssessment",
        typeof obj,
        field,
      ),
    );
  }

  const assessment = obj as Partial<RiskAssessment>;

  // Validate required string fields
  if (typeof assessment.id !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: missing or invalid 'id'",
        "string",
        typeof assessment.id,
        field ? `${field}.id` : "id",
      ),
    );
  }

  if (typeof assessment.patientId !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: missing or invalid 'patientId'",
        "string",
        typeof assessment.patientId,
        field ? `${field}.patientId` : "patientId",
      ),
    );
  }

  // Validate timestamp
  if (
    typeof assessment.timestamp !== "string" ||
    !isValidDate(assessment.timestamp)
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: missing or invalid 'timestamp', must be a valid date string",
        "string (date)",
        typeof assessment.timestamp,
        field ? `${field}.timestamp` : "timestamp",
      ),
    );
  }

  // Validate assessment type
  if (typeof assessment.assessmentType !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: missing or invalid 'assessmentType'",
        "string",
        typeof assessment.assessmentType,
        field ? `${field}.assessmentType` : "assessmentType",
      ),
    );
  }

  // Validate overall risk
  if (
    typeof assessment.overallRisk !== "string" ||
    !isValidRiskLevel(assessment.overallRisk)
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: missing or invalid 'overallRisk', must be a valid risk level",
        "RiskLevel",
        typeof assessment.overallRisk,
        field ? `${field}.overallRisk` : "overallRisk",
      ),
    );
  }

  // Validate confidence score
  if (
    typeof assessment.confidenceScore !== "number" ||
    assessment.confidenceScore < 0 ||
    assessment.confidenceScore > 1
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: missing or invalid 'confidenceScore', must be a number between 0 and 1",
        "number",
        typeof assessment.confidenceScore,
        field ? `${field}.confidenceScore` : "confidenceScore",
      ),
    );
  }

  // Validate domain risks
  if (!Array.isArray(assessment.domainRisks)) {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: missing or invalid 'domainRisks', must be an array",
        "array",
        typeof assessment.domainRisks,
        field ? `${field}.domainRisks` : "domainRisks",
      ),
    );
  }

  // Validate temporal trend
  if (
    typeof assessment.temporalTrend !== "string" ||
    !isValidTemporalTrend(assessment.temporalTrend)
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: missing or invalid 'temporalTrend', must be a valid temporal trend",
        "string",
        typeof assessment.temporalTrend,
        field ? `${field}.temporalTrend` : "temporalTrend",
      ),
    );
  }

  // Validate contributing factors
  if (!Array.isArray(assessment.contributingFactors)) {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: missing or invalid 'contributingFactors', must be an array",
        "array",
        typeof assessment.contributingFactors,
        field ? `${field}.contributingFactors` : "contributingFactors",
      ),
    );
  }

  // Validate protective factors
  if (!Array.isArray(assessment.protectiveFactors)) {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: missing or invalid 'protectiveFactors', must be an array",
        "array",
        typeof assessment.protectiveFactors,
        field ? `${field}.protectiveFactors` : "protectiveFactors",
      ),
    );
  }

  // Validate neural correlates
  if (!Array.isArray(assessment.neuralCorrelates)) {
    return failure(
      new TypeVerificationError(
        "Invalid RiskAssessment: missing or invalid 'neuralCorrelates', must be an array",
        "array",
        typeof assessment.neuralCorrelates,
        field ? `${field}.neuralCorrelates` : "neuralCorrelates",
      ),
    );
  }

  return success(assessment as RiskAssessment);
}

/**
 * Runtime validation for TreatmentResponsePrediction objects
 * @param obj - The object to validate as a TreatmentResponsePrediction
 * @returns A boolean indicating if the object is a valid TreatmentResponsePrediction
 */
export function isTreatmentResponsePrediction(
  obj: unknown,
): obj is TreatmentResponsePrediction {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const prediction = obj as Partial<TreatmentResponsePrediction>;

  return (
    typeof prediction.requestId === "string" &&
    typeof prediction.patientId === "string" &&
    typeof prediction.treatmentType === "string" &&
    typeof prediction.timestamp === "string" &&
    typeof prediction.algorithm === "object" &&
    typeof prediction.prediction === "object"
  );
}

/**
 * Validates a TreatmentResponsePrediction with detailed error reporting
 * @param obj - The object to validate
 * @param field - Optional field name for error context
 * @returns A Result with the validated TreatmentResponsePrediction or an error
 */
export function validateTreatmentResponsePrediction(
  obj: unknown,
  field?: string,
): Result<TreatmentResponsePrediction> {
  if (!obj || typeof obj !== "object") {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: expected an object",
        "TreatmentResponsePrediction",
        typeof obj,
        field,
      ),
    );
  }

  const prediction = obj as Partial<TreatmentResponsePrediction>;

  // Validate required string fields
  if (typeof prediction.requestId !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'requestId'",
        "string",
        typeof prediction.requestId,
        field ? `${field}.requestId` : "requestId",
      ),
    );
  }

  if (typeof prediction.patientId !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'patientId'",
        "string",
        typeof prediction.patientId,
        field ? `${field}.patientId` : "patientId",
      ),
    );
  }

  if (typeof prediction.treatmentType !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'treatmentType'",
        "string",
        typeof prediction.treatmentType,
        field ? `${field}.treatmentType` : "treatmentType",
      ),
    );
  }

  // Validate timestamp
  if (
    typeof prediction.timestamp !== "string" ||
    !isValidDate(prediction.timestamp)
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'timestamp', must be a valid date string",
        "string (date)",
        typeof prediction.timestamp,
        field ? `${field}.timestamp` : "timestamp",
      ),
    );
  }

  // Validate algorithm object
  if (!prediction.algorithm || typeof prediction.algorithm !== "object") {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'algorithm', must be an object",
        "object",
        typeof prediction.algorithm,
        field ? `${field}.algorithm` : "algorithm",
      ),
    );
  }

  const algorithm = prediction.algorithm as Record<string, unknown>;
  if (typeof algorithm.name !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'algorithm.name'",
        "string",
        typeof algorithm.name,
        field ? `${field}.algorithm.name` : "algorithm.name",
      ),
    );
  }

  if (typeof algorithm.version !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'algorithm.version'",
        "string",
        typeof algorithm.version,
        field ? `${field}.algorithm.version` : "algorithm.version",
      ),
    );
  }

  if (
    typeof algorithm.confidence !== "number" ||
    algorithm.confidence < 0 ||
    algorithm.confidence > 1
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'algorithm.confidence', must be a number between 0 and 1",
        "number",
        typeof algorithm.confidence,
        field ? `${field}.algorithm.confidence` : "algorithm.confidence",
      ),
    );
  }

  // Validate prediction object
  if (!prediction.prediction || typeof prediction.prediction !== "object") {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'prediction', must be an object",
        "object",
        typeof prediction.prediction,
        field ? `${field}.prediction` : "prediction",
      ),
    );
  }

  const predictionObj = prediction.prediction as Record<string, unknown>;
  if (typeof predictionObj.responseType !== "string") {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'prediction.responseType'",
        "string",
        typeof predictionObj.responseType,
        field ? `${field}.prediction.responseType` : "prediction.responseType",
      ),
    );
  }

  if (
    typeof predictionObj.responseProbability !== "number" ||
    predictionObj.responseProbability < 0 ||
    predictionObj.responseProbability > 1
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'prediction.responseProbability', must be a number between 0 and 1",
        "number",
        typeof predictionObj.responseProbability,
        field
          ? `${field}.prediction.responseProbability`
          : "prediction.responseProbability",
      ),
    );
  }

  if (
    !Array.isArray(predictionObj.confidenceInterval) ||
    predictionObj.confidenceInterval.length !== 2
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'prediction.confidenceInterval', must be an array with two numbers",
        "array",
        typeof predictionObj.confidenceInterval,
        field
          ? `${field}.prediction.confidenceInterval`
          : "prediction.confidenceInterval",
      ),
    );
  }

  if (
    !predictionObj.timeToEffect ||
    typeof predictionObj.timeToEffect !== "object"
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'prediction.timeToEffect', must be an object",
        "object",
        typeof predictionObj.timeToEffect,
        field ? `${field}.prediction.timeToEffect` : "prediction.timeToEffect",
      ),
    );
  }

  if (
    !predictionObj.durability ||
    typeof predictionObj.durability !== "object"
  ) {
    return failure(
      new TypeVerificationError(
        "Invalid TreatmentResponsePrediction: missing or invalid 'prediction.durability', must be an object",
        "object",
        typeof predictionObj.durability,
        field ? `${field}.prediction.durability` : "prediction.durability",
      ),
    );
  }

  return success(prediction as TreatmentResponsePrediction);
}

// Helper functions for validation

/**
 * Validates if a string is a valid date
 * @param dateString - The date string to validate
 * @returns A boolean indicating if the string is a valid date
 */
function isValidDate(dateString: string): boolean {
  return !isNaN(Date.parse(dateString));
}

/**
 * Validates if a severity string is valid
 * @param severity - The severity string to validate
 * @returns A boolean indicating if the string is a valid severity
 */
function isValidSeverity(severity: string): boolean {
  return ["mild", "moderate", "severe"].includes(severity.toLowerCase());
}

/**
 * Validates if a diagnosis status string is valid
 * @param status - The status string to validate
 * @returns A boolean indicating if the string is a valid diagnosis status
 */
function isValidDiagnosisStatus(status: string): boolean {
  return ["active", "remission", "resolved", "relapse"].includes(
    status.toLowerCase(),
  );
}

/**
 * Validates if a treatment type string is valid
 * @param type - The type string to validate
 * @returns A boolean indicating if the string is a valid treatment type
 */
function isValidTreatmentType(type: string): boolean {
  return [
    "medication",
    "psychotherapy",
    "neurostimulation",
    "neurofeedback",
    "behavioral",
    "cognitive",
  ].includes(type.toLowerCase());
}

/**
 * Validates if a treatment status string is valid
 * @param status - The status string to validate
 * @returns A boolean indicating if the string is a valid treatment status
 */
function isValidTreatmentStatus(status: string): boolean {
  return ["active", "completed", "discontinued", "planned"].includes(
    status.toLowerCase(),
  );
}

/**
 * Validates if an assessment type string is valid
 * @param type - The type string to validate
 * @returns A boolean indicating if the string is a valid assessment type
 */
function isValidAssessmentType(type: string): boolean {
  return ["automated", "clinician", "hybrid"].includes(type.toLowerCase());
}

/**
 * Validates if a risk level string is valid
 * @param level - The level string to validate
 * @returns A boolean indicating if the string is a valid risk level
 */
function isValidRiskLevel(level: string): boolean {
  return ["low", "moderate", "high", "severe", "critical"].includes(
    level.toLowerCase(),
  );
}

/**
 * Validates if a temporal trend string is valid
 * @param trend - The trend string to validate
 * @returns A boolean indicating if the string is a valid temporal trend
 */
function isValidTemporalTrend(trend: string): boolean {
  return ["increasing", "decreasing", "stable", "fluctuating"].includes(
    trend.toLowerCase(),
  );
}

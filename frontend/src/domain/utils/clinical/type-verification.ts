/**
 * NOVAMIND Neural-Safe Type Verification
 * Clinical-specific type verification utilities with quantum-level precision
 */

import { 
  Patient, 
  Diagnosis, 
  Symptom, 
  Treatment, 
  TreatmentResponse 
} from "../../types/clinical/patient";
import { RiskLevel, RiskAssessment } from "../../types/clinical/risk-level";
import { Result } from "../../types/shared/common";
import { typeVerifier, TypeVerificationError } from "../shared/type-verification";

/**
 * Clinical model type verification utilities
 */
export class ClinicalTypeVerifier {
  /**
   * Verify that a value is a valid RiskLevel enum value
   */
  verifyRiskLevel(level: unknown, field?: string): Result<RiskLevel> {
    const validLevels = Object.values(RiskLevel);
    
    if (typeof level === 'string' && validLevels.includes(level as RiskLevel)) {
      return {
        success: true,
        value: level as RiskLevel
      };
    }
    
    return {
      success: false,
      error: new TypeVerificationError(
        `Invalid RiskLevel`,
        `one of [${validLevels.join(', ')}]`,
        typeof level === 'object'
          ? (level === null ? 'null' : Array.isArray(level) ? 'array' : 'object')
          : typeof level,
        field
      )
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
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<Symptom>;
    
    const nameResult = typeVerifier.verifyString(object.name, field ? `${field}.name` : 'name');
    if (!nameResult.success) return nameResult as Result<Symptom>;
    
    const severityResult = typeVerifier.verifyNumber(
      object.severity, 
      field ? `${field}.severity` : 'severity'
    );
    if (!severityResult.success) return severityResult as Result<Symptom>;
    
    // Optional properties
    const description = object.description !== undefined 
      ? typeVerifier.safelyParseString(object.description, '')
      : undefined;
      
    const onsetDate = object.onsetDate !== undefined 
      ? new Date(typeVerifier.safelyParseString(object.onsetDate, ''))
      : undefined;
      
    const frequency = object.frequency !== undefined
      ? typeVerifier.safelyParseString(object.frequency, '')
      : undefined;
      
    // Return verified symptom
    return {
      success: true,
      value: {
        id: idResult.value,
        name: nameResult.value,
        severity: severityResult.value,
        description,
        onsetDate,
        frequency
      }
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
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<Diagnosis>;
    
    const nameResult = typeVerifier.verifyString(object.name, field ? `${field}.name` : 'name');
    if (!nameResult.success) return nameResult as Result<Diagnosis>;
    
    const diagnosisDateResult = object.diagnosisDate instanceof Date
      ? { success: true, value: object.diagnosisDate }
      : { 
          success: false, 
          error: new TypeVerificationError(
            'Invalid date',
            'Date',
            typeof object.diagnosisDate === 'object'
              ? (object.diagnosisDate === null ? 'null' : 'object')
              : typeof object.diagnosisDate,
            field ? `${field}.diagnosisDate` : 'diagnosisDate'
          )
        };
    if (!diagnosisDateResult.success) return diagnosisDateResult as Result<Diagnosis>;
    
    // Optional properties
    const description = object.description !== undefined 
      ? typeVerifier.safelyParseString(object.description, '')
      : undefined;
      
    const icdCode = object.icdCode !== undefined
      ? typeVerifier.safelyParseString(object.icdCode, '')
      : undefined;
      
    const severity = object.severity !== undefined
      ? typeVerifier.safelyParseNumber(object.severity, 0)
      : undefined;
      
    // Return verified diagnosis
    return {
      success: true,
      value: {
        id: idResult.value,
        name: nameResult.value,
        diagnosisDate: diagnosisDateResult.value,
        description,
        icdCode,
        severity
      }
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
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<Treatment>;
    
    const nameResult = typeVerifier.verifyString(object.name, field ? `${field}.name` : 'name');
    if (!nameResult.success) return nameResult as Result<Treatment>;
    
    const typeResult = typeVerifier.verifyString(object.type, field ? `${field}.type` : 'type');
    if (!typeResult.success) return typeResult as Result<Treatment>;
    
    // Optional properties
    const description = object.description !== undefined 
      ? typeVerifier.safelyParseString(object.description, '')
      : undefined;
      
    const startDate = object.startDate !== undefined 
      ? new Date(typeVerifier.safelyParseString(object.startDate, ''))
      : undefined;
      
    const endDate = object.endDate !== undefined 
      ? new Date(typeVerifier.safelyParseString(object.endDate, ''))
      : undefined;
      
    const dosage = object.dosage !== undefined
      ? typeVerifier.safelyParseString(object.dosage, '')
      : undefined;
      
    const frequency = object.frequency !== undefined
      ? typeVerifier.safelyParseString(object.frequency, '')
      : undefined;
      
    // Return verified treatment
    return {
      success: true,
      value: {
        id: idResult.value,
        name: nameResult.value,
        type: typeResult.value,
        description,
        startDate,
        endDate,
        dosage,
        frequency
      }
    };
  }

  /**
   * Verify that an object conforms to the TreatmentResponse interface
   */
  verifyTreatmentResponse(obj: unknown, field?: string): Result<TreatmentResponse> {
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<TreatmentResponse>;
    }

    const object = objResult.value;
    
    // Verify required properties
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<TreatmentResponse>;
    
    const treatmentIdResult = typeVerifier.verifyString(
      object.treatmentId, 
      field ? `${field}.treatmentId` : 'treatmentId'
    );
    if (!treatmentIdResult.success) return treatmentIdResult as Result<TreatmentResponse>;
    
    const effectivenessResult = typeVerifier.verifyNumber(
      object.effectiveness, 
      field ? `${field}.effectiveness` : 'effectiveness'
    );
    if (!effectivenessResult.success) return effectivenessResult as Result<TreatmentResponse>;
    
    const dateResult = object.date instanceof Date
      ? { success: true, value: object.date }
      : { 
          success: false, 
          error: new TypeVerificationError(
            'Invalid date',
            'Date',
            typeof object.date === 'object'
              ? (object.date === null ? 'null' : 'object')
              : typeof object.date,
            field ? `${field}.date` : 'date'
          )
        };
    if (!dateResult.success) return dateResult as Result<TreatmentResponse>;
    
    // Optional properties
    const notes = object.notes !== undefined 
      ? typeVerifier.safelyParseString(object.notes, '')
      : undefined;
      
    const sideEffects = object.sideEffects !== undefined
      ? typeVerifier.verifyArray(
          object.sideEffects,
          (effect, index) => typeVerifier.verifyString(
            effect, 
            field ? `${field}.sideEffects[${index}]` : `sideEffects[${index}]`
          ),
          field ? `${field}.sideEffects` : 'sideEffects'
        ).success 
          ? object.sideEffects as string[]
          : []
      : undefined;
      
    // Return verified treatment response
    return {
      success: true,
      value: {
        id: idResult.value,
        treatmentId: treatmentIdResult.value,
        effectiveness: effectivenessResult.value,
        date: dateResult.value,
        notes,
        sideEffects
      }
    };
  }

  /**
   * Verify that an object conforms to the Patient interface
   */
  verifyPatient(obj: unknown, field?: string): Result<Patient> {
    const objResult = typeVerifier.verifyObject(obj, field);
    if (!objResult.success) {
      return objResult as Result<Patient>;
    }

    const object = objResult.value;
    
    // Verify required properties
    const idResult = typeVerifier.verifyString(object.id, field ? `${field}.id` : 'id');
    if (!idResult.success) return idResult as Result<Patient>;
    
    const firstNameResult = typeVerifier.verifyString(
      object.firstName, 
      field ? `${field}.firstName` : 'firstName'
    );
    if (!firstNameResult.success) return firstNameResult as Result<Patient>;
    
    const lastNameResult = typeVerifier.verifyString(
      object.lastName, 
      field ? `${field}.lastName` : 'lastName'
    );
    if (!lastNameResult.success) return lastNameResult as Result<Patient>;
    
    // Verify array properties
    const symptomsResult = typeVerifier.verifyArray(
      object.symptoms,
      (symptom, index) => this.verifySymptom(
        symptom, 
        field ? `${field}.symptoms[${index}]` : `symptoms[${index}]`
      ),
      field ? `${field}.symptoms` : 'symptoms'
    );
    if (!symptomsResult.success) return symptomsResult as Result<Patient>;
    
    const diagnosesResult = typeVerifier.verifyArray(
      object.diagnoses,
      (diagnosis, index) => this.verifyDiagnosis(
        diagnosis, 
        field ? `${field}.diagnoses[${index}]` : `diagnoses[${index}]`
      ),
      field ? `${field}.diagnoses` : 'diagnoses'
    );
    if (!diagnosesResult.success) return diagnosesResult as Result<Patient>;
    
    const treatmentsResult = typeVerifier.verifyArray(
      object.treatments,
      (treatment, index) => this.verifyTreatment(
        treatment, 
        field ? `${field}.treatments[${index}]` : `treatments[${index}]`
      ),
      field ? `${field}.treatments` : 'treatments'
    );
    if (!treatmentsResult.success) return treatmentsResult as Result<Patient>;
    
    const treatmentResponsesResult = typeVerifier.verifyArray(
      object.treatmentResponses,
      (response, index) => this.verifyTreatmentResponse(
        response, 
        field ? `${field}.treatmentResponses[${index}]` : `treatmentResponses[${index}]`
      ),
      field ? `${field}.treatmentResponses` : 'treatmentResponses'
    );
    if (!treatmentResponsesResult.success) return treatmentResponsesResult as Result<Patient>;
    
    // Optional properties
    const dateOfBirth = object.dateOfBirth !== undefined 
      ? new Date(typeVerifier.safelyParseString(object.dateOfBirth, ''))
      : undefined;
      
    const contactInfo = object.contactInfo !== undefined && typeof object.contactInfo === 'object'
      ? object.contactInfo as Record<string, unknown>
      : undefined;
      
    // Return verified patient
    return {
      success: true,
      value: {
        id: idResult.value,
        firstName: firstNameResult.value,
        lastName: lastNameResult.value,
        dateOfBirth,
        contactInfo,
        symptoms: symptomsResult.value,
        diagnoses: diagnosesResult.value,
        treatments: treatmentsResult.value,
        treatmentResponses: treatmentResponsesResult.value
      }
    };
  }
  
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
  assertTreatmentResponse(value: unknown, field?: string): asserts value is TreatmentResponse {
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

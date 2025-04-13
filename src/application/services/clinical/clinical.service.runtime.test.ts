/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Application Service
 * ClinicalService Runtime Validation Tests - Quantum-level test precision
 * with HIPAA compliance
 */

import { describe, it, expect } from 'vitest';
import {
  isSymptom,
  validateSymptom,
  isDiagnosis,
  validateDiagnosis,
  isTreatment,
  validateTreatment,
  isRiskAssessment,
  validateRiskAssessment,
  isTreatmentResponsePrediction,
  validateTreatmentResponsePrediction,
} from '@services/clinical/clinical.service.runtime'; // Use @services alias
import type { Symptom, Diagnosis, Treatment } from '@domain/types/clinical/patient'; // Use type import
import type { RiskAssessment } from '@domain/types/clinical/risk';
import { RiskLevel } from '@domain/types/clinical/risk';
import type { TreatmentResponsePrediction } from '@domain/types/clinical/treatment';
import type { Result } from '@domain/types/shared/common'; // Use type import

// Custom type for TypeVerificationError for proper type assertion
type TypeVerificationError = Error & {
  expectedType: string;
  actualType: string;
  field?: string;
};

// Helper functions for testing the Result type
function isSuccess<T, E = Error>(result: Result<T, E>): result is { success: true; value: T } {
  return result.success === true;
}

function isFailure<T, E = Error>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false;
}

describe('ClinicalService Runtime Validation', () => {
  describe('isSymptom', () => {
    it('returns true for valid Symptom objects', () => {
      const validSymptom: Symptom = {
        id: 'symptom-123',
        name: 'Depressed Mood',
        category: 'affective',
        severity: 0.7,
        frequency: 'daily',
        impact: 'moderate',
        progression: 'stable',
        onsetDate: '2025-03-01T00:00:00Z',
        duration: '4 weeks',
        triggers: ['stress', 'poor-sleep'],
        notes: 'Worse in evenings',
      };

      expect(isSymptom(validSymptom)).toBe(true);
    });

    it('returns false for non-object values', () => {
      expect(isSymptom(null)).toBe(false);
      expect(isSymptom(undefined)).toBe(false);
      expect(isSymptom('string')).toBe(false);
      expect(isSymptom(123)).toBe(false);
      expect(isSymptom([])).toBe(false);
    });

    it('returns false for objects missing required properties', () => {
      // Missing id
      expect(
        isSymptom({
          name: 'Depressed Mood',
          category: 'affective',
          severity: 0.7,
          frequency: 'daily',
          impact: 'moderate',
          progression: 'stable',
          onsetDate: '2025-03-01T00:00:00Z',
          duration: '4 weeks',
        })
      ).toBe(false);

      // Missing name
      expect(
        isSymptom({
          id: 'symptom-123',
          category: 'affective',
          severity: 0.7,
          frequency: 'daily',
          impact: 'moderate',
          progression: 'stable',
          onsetDate: '2025-03-01T00:00:00Z',
          duration: '4 weeks',
        })
      ).toBe(false);
    });
  });

  describe('validateSymptom', () => {
    it('returns success for valid Symptom objects', () => {
      const validSymptom: Symptom = {
        id: 'symptom-123',
        name: 'Depressed Mood',
        category: 'affective',
        severity: 0.7,
        frequency: 'daily',
        impact: 'moderate',
        progression: 'stable',
        onsetDate: '2025-03-01T00:00:00Z',
        duration: '4 weeks',
        triggers: ['stress', 'poor-sleep'],
        notes: 'Worse in evenings',
      };

      const result = validateSymptom(validSymptom);
      expect(result.success).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toEqual(validSymptom);
      }
    });

    it('returns failure for non-object values', () => {
      const nullResult = validateSymptom(null);
      expect(nullResult.success).toBe(false);
      if (isFailure(nullResult)) {
        expect(nullResult.error.message).toContain('Invalid Symptom');
      }

      const undefinedResult = validateSymptom(undefined);
      expect(undefinedResult.success).toBe(false);
      if (isFailure(undefinedResult)) {
        expect(undefinedResult.error.message).toContain('Invalid Symptom');
      }
    });

    it('returns failure for objects with invalid severity', () => {
      const symptomWithInvalidSeverity = {
        id: 'symptom-123',
        name: 'Depressed Mood',
        category: 'affective',
        severity: 11, // Above valid range (0-10)
        frequency: 'daily',
        impact: 'moderate',
        progression: 'stable',
        onsetDate: '2025-03-01T00:00:00Z',
        duration: '4 weeks',
      };

      const result = validateSymptom(symptomWithInvalidSeverity);
      expect(result.success).toBe(false);
      if (isFailure(result)) {
        expect(result.error.message).toContain('severity');
      }
    });

    it('returns failure for objects with invalid onset date', () => {
      const symptomWithInvalidOnset = {
        id: 'symptom-123',
        name: 'Depressed Mood',
        category: 'affective',
        severity: 0.7,
        frequency: 'daily',
        impact: 'moderate',
        progression: 'stable',
        onsetDate: 'not-a-date',
        duration: '4 weeks',
      };

      const result = validateSymptom(symptomWithInvalidOnset);
      expect(result.success).toBe(false);
      if (isFailure(result)) {
        expect(result.error.message).toContain('onsetDate');
      }
    });

    it('includes the field path in error messages when provided', () => {
      const result = validateSymptom({}, 'patientSymptom');
      expect(result.success).toBe(false);
      if (isFailure(result)) {
        const error = result.error as TypeVerificationError;
        expect(error.field).toBe('patientSymptom.id');
      }
    });
  });

  describe('isDiagnosis', () => {
    it('returns true for valid Diagnosis objects', () => {
      const validDiagnosis: Diagnosis = {
        id: 'diagnosis-123',
        code: 'F32.1',
        codingSystem: 'ICD-10',
        name: 'Major Depressive Disorder, Single Episode, Moderate',
        severity: 'moderate',
        diagnosisDate: '2025-02-15T00:00:00Z',
        status: 'active',
        notes: 'Patient exhibits persistent low mood and anhedonia',
      };

      expect(isDiagnosis(validDiagnosis)).toBe(true);
    });

    it('returns false for non-object values', () => {
      expect(isDiagnosis(null)).toBe(false);
      expect(isDiagnosis(undefined)).toBe(false);
      expect(isDiagnosis('string')).toBe(false);
      expect(isDiagnosis(123)).toBe(false);
      expect(isDiagnosis([])).toBe(false);
    });

    it('returns false for objects missing required properties', () => {
      // Missing id
      expect(
        isDiagnosis({
          code: 'F32.1',
          codingSystem: 'ICD-10',
          name: 'Major Depressive Disorder, Single Episode, Moderate',
          severity: 'moderate',
          diagnosisDate: '2025-02-15T00:00:00Z',
          status: 'active',
        })
      ).toBe(false);
    });
  });

  describe('validateDiagnosis', () => {
    it('returns success for valid Diagnosis objects', () => {
      const validDiagnosis: Diagnosis = {
        id: 'diagnosis-123',
        code: 'F32.1',
        codingSystem: 'ICD-10',
        name: 'Major Depressive Disorder, Single Episode, Moderate',
        severity: 'moderate',
        diagnosisDate: '2025-02-15T00:00:00Z',
        status: 'active',
        notes: 'Patient exhibits persistent low mood and anhedonia',
      };

      const result = validateDiagnosis(validDiagnosis);
      expect(result.success).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toEqual(validDiagnosis);
      }
    });

    it('returns failure for objects with invalid severity', () => {
      const diagnosisWithInvalidSeverity = {
        id: 'diagnosis-123',
        code: 'F32.1',
        codingSystem: 'ICD-10',
        name: 'Major Depressive Disorder, Single Episode, Moderate',
        severity: 3, // Should be a string, not a number
        diagnosisDate: '2025-02-15T00:00:00Z',
        status: 'active',
      };

      const result = validateDiagnosis(diagnosisWithInvalidSeverity);
      expect(result.success).toBe(false);
      if (isFailure(result)) {
        expect(result.error.message).toContain('severity');
      }
    });

    it('returns failure for objects with invalid status', () => {
      const diagnosisWithInvalidStatus = {
        id: 'diagnosis-123',
        code: 'F32.1',
        codingSystem: 'ICD-10',
        name: 'Major Depressive Disorder, Single Episode, Moderate',
        severity: 'moderate',
        diagnosisDate: '2025-02-15T00:00:00Z',
        status: 123, // Should be a string, not a number
      };

      const result = validateDiagnosis(diagnosisWithInvalidStatus);
      expect(result.success).toBe(false);
      if (isFailure(result)) {
        expect(result.error.message).toContain('status');
      }
    });
  });

  describe('isTreatment', () => {
    it('returns true for valid Treatment objects', () => {
      const validTreatment: Treatment = {
        id: 'treatment-123',
        name: 'Fluoxetine',
        type: 'pharmacological',
        description: 'SSRI antidepressant',
        startDate: '2025-03-15T00:00:00Z',
        status: 'active',
        dose: '20mg daily',
        provider: 'Dr. Smith',
      };

      expect(isTreatment(validTreatment)).toBe(true);
    });

    it('returns false for non-object values', () => {
      expect(isTreatment(null)).toBe(false);
      expect(isTreatment(undefined)).toBe(false);
      expect(isTreatment('string')).toBe(false);
      expect(isTreatment(123)).toBe(false);
    });
  });

  describe('validateTreatment', () => {
    it('returns success for valid Treatment objects', () => {
      const validTreatment: Treatment = {
        id: 'treatment-123',
        name: 'Fluoxetine',
        type: 'pharmacological',
        description: 'SSRI antidepressant',
        startDate: '2025-03-15T00:00:00Z',
        status: 'active',
        dose: '20mg daily',
        provider: 'Dr. Smith',
      };

      const result = validateTreatment(validTreatment);
      expect(result.success).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toEqual(validTreatment);
      }
    });

    it('returns success for valid Treatment with endDate', () => {
      const validTreatment: Treatment = {
        id: 'treatment-123',
        name: 'Fluoxetine',
        type: 'pharmacological',
        description: 'SSRI antidepressant',
        startDate: '2025-03-15T00:00:00Z',
        endDate: '2025-06-15T00:00:00Z',
        status: 'completed',
        dose: '20mg daily',
        provider: 'Dr. Smith',
      };

      const result = validateTreatment(validTreatment);
      expect(result.success).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toEqual(validTreatment);
      }
    });

    it('returns failure for objects with invalid endDate', () => {
      const treatmentWithInvalidEndDate = {
        id: 'treatment-123',
        name: 'Fluoxetine',
        type: 'pharmacological',
        description: 'SSRI antidepressant',
        startDate: '2025-03-15T00:00:00Z',
        endDate: 'not-a-date',
        status: 'completed',
        dose: '20mg daily',
      };

      const result = validateTreatment(treatmentWithInvalidEndDate);
      expect(result.success).toBe(false);
      if (isFailure(result)) {
        expect(result.error.message).toContain('endDate');
      }
    });
  });

  describe('isRiskAssessment', () => {
    it('returns true for valid RiskAssessment objects', () => {
      const validRiskAssessment: RiskAssessment = {
        id: 'risk-123',
        patientId: 'patient-123',
        timestamp: '2025-04-01T10:00:00Z',
        assessmentType: 'automated',
        overallRisk: RiskLevel.MODERATE,
        confidenceScore: 0.85,
        domainRisks: [
          {
            domain: 'suicide',
            riskLevel: RiskLevel.LOW,
            confidenceScore: 0.9,
            evidence: ['no ideation reported', 'strong social support'],
            urgency: 'routine',
          },
        ],
        temporalTrend: 'stable',
        contributingFactors: [],
        protectiveFactors: [],
        neuralCorrelates: [],
        nextAssessmentDue: '2025-04-15T10:00:00Z',
      };

      expect(isRiskAssessment(validRiskAssessment)).toBe(true);
    });

    it('returns false for non-object values', () => {
      expect(isRiskAssessment(null)).toBe(false);
      expect(isRiskAssessment(undefined)).toBe(false);
      expect(isRiskAssessment('string')).toBe(false);
      expect(isRiskAssessment(123)).toBe(false);
    });
  });

  describe('validateRiskAssessment', () => {
    it('returns success for valid RiskAssessment objects', () => {
      const validRiskAssessment: RiskAssessment = {
        id: 'risk-123',
        patientId: 'patient-123',
        timestamp: '2025-04-01T10:00:00Z',
        assessmentType: 'automated',
        overallRisk: RiskLevel.MODERATE,
        confidenceScore: 0.85,
        domainRisks: [
          {
            domain: 'suicide',
            riskLevel: RiskLevel.LOW,
            confidenceScore: 0.9,
            evidence: ['no ideation reported', 'strong social support'],
            urgency: 'routine',
          },
        ],
        temporalTrend: 'stable',
        contributingFactors: [],
        protectiveFactors: [],
        neuralCorrelates: [],
        nextAssessmentDue: '2025-04-15T10:00:00Z',
      };

      const result = validateRiskAssessment(validRiskAssessment);
      expect(result.success).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toEqual(validRiskAssessment);
      }
    });

    it('returns failure for objects with invalid risk level', () => {
      const assessmentWithInvalidRiskLevel = {
        id: 'risk-123',
        patientId: 'patient-456',
        timestamp: '2025-03-15T00:00:00Z',
        assessmentType: 'automated',
        overallRisk: 'EXTREME', // Invalid risk level
        confidenceScore: 0.85,
        domainRisks: [
          {
            domain: 'suicide',
            riskLevel: 'LOW',
            confidenceScore: 0.9,
            evidence: ['No suicidal ideation reported'],
            urgency: 'low',
          },
        ],
        temporalTrend: 'stable',
        contributingFactors: [],
        protectiveFactors: [],
        neuralCorrelates: [],
      };

      const result = validateRiskAssessment(assessmentWithInvalidRiskLevel);
      expect(result.success).toBe(false);
      if (isFailure(result)) {
        expect(result.error.message).toContain('overallRisk');
      }
    });
  });

  describe('isTreatmentResponsePrediction', () => {
    it('returns true for valid TreatmentResponsePrediction objects', () => {
      const validPrediction: TreatmentResponsePrediction = {
        requestId: 'req-123',
        patientId: 'patient-456',
        treatmentId: 'treatment-mock-1', // Added missing property
        treatmentType: 'pharmacological',
        timestamp: '2025-04-01T10:00:00Z',
        algorithm: {
          name: 'Neural Treatment Predictor',
          version: '2.1',
          confidence: 0.85,
        },
        prediction: {
          responseType: 'response',
          responseProbability: 0.75,
          confidenceInterval: [0.65, 0.85],
          timeToEffect: {
            expected: 14,
            range: [7, 21],
          },
          durability: {
            expected: 6,
            probability: 0.8,
          },
        },
        symptomSpecificPredictions: [
          {
            symptom: 'depressed-mood',
            improvementProbability: 0.8,
            expectedImprovement: 70,
          },
        ],
        sideEffectRisks: [
          {
            effect: 'nausea',
            probability: 0.3,
            severity: 'mild',
            timeline: 'acute',
            mitigationPossible: true,
          },
        ],
        neurobiologicalMechanisms: [
          {
            pathwayName: 'Serotonergic transmission',
            impactDescription: 'Increased serotonin availability in synaptic cleft',
            confidenceLevel: 'established',
            relevantRegions: ['Prefrontal cortex', 'Hippocampus'],
          },
        ],
        personalizationFactors: [
          {
            factor: 'Age',
            impact: 'neutral',
            strength: 'moderate',
            evidenceQuality: 'high',
          },
        ],
        limitations: ['Limited data on long-term outcomes'],
        alternatives: [
          {
            treatmentType: 'psychotherapy',
            treatmentName: 'CBT',
            predictedResponseProbability: 0.65,
            rationale: 'Evidence-based for depressive symptoms',
          },
        ],
        dataQualityAssessment: {
          overallQuality: 'high',
          missingDataImpact: 'minimal',
          biasRiskLevel: 'low',
        },
      };

      expect(isTreatmentResponsePrediction(validPrediction)).toBe(true);
    });

    it('returns false for non-object values', () => {
      expect(isTreatmentResponsePrediction(null)).toBe(false);
      expect(isTreatmentResponsePrediction(undefined)).toBe(false);
      expect(isTreatmentResponsePrediction('string')).toBe(false);
      expect(isTreatmentResponsePrediction(123)).toBe(false);
    });
  });

  describe('validateTreatmentResponsePrediction', () => {
    it('returns success for valid TreatmentResponsePrediction objects', () => {
      const validPrediction: TreatmentResponsePrediction = {
        requestId: 'req-123',
        patientId: 'patient-456',
        treatmentId: 'treatment-mock-2', // Added missing property
        treatmentType: 'pharmacological',
        timestamp: '2025-04-01T10:00:00Z',
        algorithm: {
          name: 'Neural Treatment Predictor',
          version: '2.1',
          confidence: 0.85,
        },
        prediction: {
          responseType: 'response',
          responseProbability: 0.75,
          confidenceInterval: [0.65, 0.85],
          timeToEffect: {
            expected: 14,
            range: [7, 21],
          },
          durability: {
            expected: 6,
            probability: 0.8,
          },
        },
        symptomSpecificPredictions: [
          {
            symptom: 'depressed-mood',
            improvementProbability: 0.8,
            expectedImprovement: 70,
          },
        ],
        sideEffectRisks: [
          {
            effect: 'nausea',
            probability: 0.3,
            severity: 'mild',
            timeline: 'acute',
            mitigationPossible: true,
          },
        ],
        neurobiologicalMechanisms: [
          {
            pathwayName: 'Serotonergic transmission',
            impactDescription: 'Increased serotonin availability in synaptic cleft',
            confidenceLevel: 'established',
            relevantRegions: ['Prefrontal cortex', 'Hippocampus'],
          },
        ],
        personalizationFactors: [
          {
            factor: 'Age',
            impact: 'neutral',
            strength: 'moderate',
            evidenceQuality: 'high',
          },
        ],
        limitations: ['Limited data on long-term outcomes'],
        alternatives: [
          {
            treatmentType: 'psychotherapy',
            treatmentName: 'CBT',
            predictedResponseProbability: 0.65,
            rationale: 'Evidence-based for depressive symptoms',
          },
        ],
        dataQualityAssessment: {
          overallQuality: 'high',
          missingDataImpact: 'minimal',
          biasRiskLevel: 'low',
        },
      };

      const result = validateTreatmentResponsePrediction(validPrediction);
      expect(result.success).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toEqual(validPrediction);
      }
    });

    it('returns failure for objects with invalid timeToEffect', () => {
      const predictionWithInvalidTimeToEffect = {
        requestId: 'req-123',
        patientId: 'patient-456',
        treatmentType: 'pharmacological',
        timestamp: '2025-04-01T10:00:00Z',
        algorithm: {
          name: 'Neural Treatment Predictor',
          version: '2.1',
          confidence: 0.85,
        },
        prediction: {
          responseType: 'response',
          responseProbability: 0.75,
          confidenceInterval: [0.65, 0.85],
          timeToEffect: 'not-an-object', // Invalid type
          durability: {
            expected: 6,
            probability: 0.8,
          },
        },
        symptomSpecificPredictions: [],
        sideEffectRisks: [],
        neurobiologicalMechanisms: [],
        personalizationFactors: [],
        limitations: [],
        alternatives: [],
        dataQualityAssessment: {
          overallQuality: 'high',
          missingDataImpact: 'minimal',
          biasRiskLevel: 'low',
        },
      };

      const result = validateTreatmentResponsePrediction(predictionWithInvalidTimeToEffect);
      expect(result.success).toBe(false);
      if (isFailure(result)) {
        expect(result.error.message).toContain('timeToEffect');
      }
    });
  });
});

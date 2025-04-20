/* eslint-disable */
/**
 * @fileoverview Tests for runtime validation functions in useClinicalContext.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
// Import the specific validation functions and relevant types/enums
import {
  validateRiskAssessment,
  validateTreatmentResponsePredictionArray,
  validateSymptomMappingArray,
  validateDiagnosisMappingArray,
  validateTreatmentMappingArray,
} from '@hooks/useClinicalContext.runtime';
import { type RiskAssessment, RiskLevel } from '@domain/types/clinical/risk'; // Already correct
import type { TreatmentResponsePrediction } from '@domain/types/clinical/treatment';
import type {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
  TreatmentNeuralMapping,
  NeuralActivationPattern, // Already type-only
} from '@domain/models/brain/mapping/brain-mapping';

// --- Mock Data ---

const mockValidRiskAssessment: RiskAssessment = {
  id: 'ra-1',
  patientId: 'p1',
  timestamp: new Date().toISOString(),
  assessmentType: 'hybrid',
  overallRisk: RiskLevel.MODERATE,
  confidenceScore: 0.8,
  domainRisks: [],
  temporalTrend: 'stable',
  contributingFactors: [],
  protectiveFactors: [],
  neuralCorrelates: [],
};

const mockInvalidRiskAssessment = { id: 'ra-2', patientId: 'p2' }; // Missing required fields

const mockValidTreatmentPrediction: TreatmentResponsePrediction = {
  requestId: 'req-1',
  patientId: 'p1',
  treatmentId: 'tmt-mock-1', // Added missing required property
  treatmentType: 'pharmacological',
  timestamp: new Date().toISOString(), // Use string literal
  algorithm: { name: 'XGBoost', version: '1.2', confidence: 0.9 },
  prediction: {
    responseType: 'response',
    responseProbability: 0.75,
    confidenceInterval: [0.6, 0.9],
    timeToEffect: { expected: 14, range: [7, 21] },
    durability: { expected: 6, probability: 0.8 },
  },
  symptomSpecificPredictions: [],
  sideEffectRisks: [],
  neurobiologicalMechanisms: [],
  personalizationFactors: [], // Add missing required property
  limitations: [],
  alternatives: [],
  dataQualityAssessment: {
    overallQuality: 'high',
    missingDataImpact: 'minimal',
    biasRiskLevel: 'low',
  },
};

const mockInvalidTreatmentPrediction = { requestId: 'req-2', patientId: 'p1' }; // Missing fields

const mockValidNeuralPattern: NeuralActivationPattern = {
  regionIds: ['r1', 'r2'],
  intensity: 0.7,
  confidence: 0.9,
  timeScale: 'acute',
  connectivity: { increasedPathways: [], decreasedPathways: [] },
};

const mockValidSymptomMapping: SymptomNeuralMapping = {
  symptomId: 's1',
  symptomName: 'Anxiety',
  category: 'Emotional',
  activationPatterns: [mockValidNeuralPattern],
  contributingFactors: [],
  evidenceQuality: 'established',
};

const mockInvalidSymptomMapping = { symptomId: 's2' }; // Missing fields

const mockValidDiagnosisMapping: DiagnosisNeuralMapping = {
  diagnosisId: 'd1',
  diagnosisName: 'MDD',
  codingSystem: 'ICD-10',
  activationPatterns: [mockValidNeuralPattern],
  evidenceQuality: 'probable',
};

const mockInvalidDiagnosisMapping = { diagnosisId: 'd2' }; // Missing fields

const mockValidTreatmentMapping: TreatmentNeuralMapping = {
  treatmentId: 't1',
  treatmentName: 'SSRI',
  treatmentType: 'pharmacological', // Use string literal
  mechanismsOfAction: [],
  effectPatterns: {
    increasedActivity: [],
    decreasedActivity: [],
    normalizedConnectivity: [],
  },
  evidenceQuality: 'established',
};

const mockInvalidTreatmentMapping = { treatmentId: 't2' }; // Missing fields

describe('useClinicalContext Runtime Validation', () => {
  // Tests for validateRiskAssessment
  describe('validateRiskAssessment', () => {
    it('should return Ok for valid RiskAssessment', () => {
      const result = validateRiskAssessment(mockValidRiskAssessment);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidRiskAssessment);
    });

    it('should return Err for invalid RiskAssessment (missing fields)', () => {
      const result = validateRiskAssessment(mockInvalidRiskAssessment);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid RiskAssessment data.');
    });

    it('should return Err for non-object input', () => {
      const result = validateRiskAssessment(null);
      expect(result.err).toBe(true);
    });
  });

  // Tests for validateTreatmentResponsePredictionArray
  describe('validateTreatmentResponsePredictionArray', () => {
    it('should return Ok for a valid array of TreatmentResponsePrediction', () => {
      const validArray = [mockValidTreatmentPrediction, mockValidTreatmentPrediction];
      const result = validateTreatmentResponsePredictionArray(validArray);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(validArray);
    });

    it('should return Ok for an empty array', () => {
      const result = validateTreatmentResponsePredictionArray([]);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual([]);
    });

    it('should return Err for non-array input', () => {
      const result = validateTreatmentResponsePredictionArray({});
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Input must be an array.');
    });

    it('should return Err for an array containing invalid items', () => {
      const invalidArray = [mockValidTreatmentPrediction, mockInvalidTreatmentPrediction];
      const result = validateTreatmentResponsePredictionArray(invalidArray);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('One or more items do not conform');
    });
  });

  // Tests for validateSymptomMappingArray
  describe('validateSymptomMappingArray', () => {
    it('should return Ok for a valid array of SymptomNeuralMapping', () => {
      const validArray = [mockValidSymptomMapping];
      const result = validateSymptomMappingArray(validArray);
      expect(result.ok).toBe(true);
    });

    it('should return Ok for an empty array', () => {
      const result = validateSymptomMappingArray([]);
      expect(result.ok).toBe(true);
    });

    it('should return Err for non-array input', () => {
      const result = validateSymptomMappingArray(null);
      expect(result.err).toBe(true);
    });

    it('should return Err for an array containing invalid items', () => {
      const invalidArray = [mockValidSymptomMapping, mockInvalidSymptomMapping];
      const result = validateSymptomMappingArray(invalidArray);
      expect(result.err).toBe(true);
    });
  });

  // Tests for validateDiagnosisMappingArray
  describe('validateDiagnosisMappingArray', () => {
    it('should return Ok for a valid array of DiagnosisNeuralMapping', () => {
      const validArray = [mockValidDiagnosisMapping];
      const result = validateDiagnosisMappingArray(validArray);
      expect(result.ok).toBe(true);
    });

    it('should return Ok for an empty array', () => {
      const result = validateDiagnosisMappingArray([]);
      expect(result.ok).toBe(true);
    });

    it('should return Err for non-array input', () => {
      const result = validateDiagnosisMappingArray('invalid');
      expect(result.err).toBe(true);
    });

    it('should return Err for an array containing invalid items', () => {
      const invalidArray = [mockInvalidDiagnosisMapping, mockValidDiagnosisMapping];
      const result = validateDiagnosisMappingArray(invalidArray);
      expect(result.err).toBe(true);
    });
  });

  // Tests for validateTreatmentMappingArray
  describe('validateTreatmentMappingArray', () => {
    it('should return Ok for a valid array of TreatmentNeuralMapping', () => {
      const validArray = [mockValidTreatmentMapping];
      const result = validateTreatmentMappingArray(validArray);
      expect(result.ok).toBe(true);
    });

    it('should return Ok for an empty array', () => {
      const result = validateTreatmentMappingArray([]);
      expect(result.ok).toBe(true);
    });

    it('should return Err for non-array input', () => {
      const result = validateTreatmentMappingArray(undefined);
      expect(result.err).toBe(true);
    });

    it('should return Err for an array containing invalid items', () => {
      const invalidArray = [mockValidTreatmentMapping, mockInvalidTreatmentMapping];
      const result = validateTreatmentMappingArray(invalidArray);
      expect(result.err).toBe(true);
    });
  });
});

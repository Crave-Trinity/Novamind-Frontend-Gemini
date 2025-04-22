/* eslint-disable */
/**
 * @fileoverview Tests for runtime validation functions in ClinicalPredictionController.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
import {
  validateSymptomPredictionParams,
  // validateTreatmentPredictionParams, // Removed unused TS6133
  // validateRelapsePredictionParams, // Removed unused TS6133
  // validateRiskAssessmentParams, // Removed unused TS6133
  validateConfigurePredictionParams,
  validatePredictionResultData, // Placeholder validation
  validateRiskAssessmentData, // Basic validation
  // Import locally defined types/enums if needed for mock data clarity
  // AggregationMethod, SymptomPredictionParams, ...
} from '@application/controllers/ClinicalPredictionController.runtime';
import { type RiskAssessment, RiskLevel } from '@domain/types/clinical/risk'; // Fixed import path

// --- Mock Data (Based on inferred types) ---

const mockValidSymptomParams = {
  patientId: 'p123',
  symptomIds: ['s1', 's2'],
  horizon: 90,
  includeBiomarkers: true,
  includeEnvironmentalFactors: false,
  models: ['bayesian', 'statistical'], // Assuming string array based on controller default
  aggregationMethod: 'weighted', // Must be a valid AggregationMethod
};

const mockInvalidSymptomParams_MissingId = {
  // patientId: 'p123', // Missing
  symptomIds: ['s1', 's2'],
  horizon: 90,
  includeBiomarkers: true,
  includeEnvironmentalFactors: false,
  models: ['bayesian'],
  aggregationMethod: 'weighted',
};

const mockInvalidSymptomParams_WrongType = {
  patientId: 'p123',
  symptomIds: 's1', // Should be array
  horizon: 90,
  includeBiomarkers: true,
  includeEnvironmentalFactors: false,
  models: ['bayesian'],
  aggregationMethod: 'weighted',
};

// Mock data for RiskAssessment based on its actual definition
const mockValidRiskAssessment: RiskAssessment = {
  id: 'ra-1',
  patientId: 'p123',
  timestamp: new Date().toISOString(), // Corrected property name and use string format
  assessmentType: 'hybrid', // Added required property
  overallRisk: RiskLevel.HIGH, // Corrected property name and use Enum member
  confidenceScore: 0.85, // Corrected property name
  domainRisks: [], // Added required property (empty array for simplicity)
  temporalTrend: 'stable', // Added required property
  contributingFactors: [
    {
      id: 'f1',
      name: 'History',
      impactWeight: 0.5,
      category: 'clinical',
      modifiability: 'modifiable',
      temporalRelevance: 'long-term',
    },
  ], // Corrected: factorId -> id, added required fields
  protectiveFactors: [], // Added required property
  neuralCorrelates: [], // Added required property
  // Removed confidenceInterval and dataPoints as they are not part of the RiskAssessment type definition
};

const mockInvalidRiskAssessment = {
  id: 'ra-2',
  patientId: 'p456',
  // overallRisk: RiskLevel.MODERATE, // Missing required property
  confidenceScore: 0.6, // Corrected property name
  timestamp: 'not-a-valid-iso-string', // Corrected property name, invalid format
  assessmentType: 'automated',
  domainRisks: [],
  temporalTrend: 'increasing',
  contributingFactors: [],
  protectiveFactors: [],
  neuralCorrelates: [],
};

const mockValidConfigureParams = {
  predictionHorizon: 180,
  aggregationMethod: 'ensemble',
};

const mockInvalidConfigureParams = {
  predictionHorizon: -30, // Invalid value
};

describe('ClinicalPredictionController Runtime Validation', () => {
  // Tests for validateSymptomPredictionParams
  describe('validateSymptomPredictionParams', () => {
    it('should return Ok for valid SymptomPredictionParams', () => {
      const result = validateSymptomPredictionParams(mockValidSymptomParams);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidSymptomParams);
    });

    it('should return Err for non-object input', () => {
      const result = validateSymptomPredictionParams('invalid');
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Input must be an object.');
    });

    it('should return Err for params missing required fields (patientId)', () => {
      const result = validateSymptomPredictionParams(mockInvalidSymptomParams_MissingId);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('patientId must be a string.');
    });

    it('should return Err for params with incorrect field types (symptomIds)', () => {
      const result = validateSymptomPredictionParams(mockInvalidSymptomParams_WrongType);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('symptomIds must be an array of strings.');
    });
  });

  // TODO: Add similar describe blocks for:
  // - validateTreatmentPredictionParams
  // - validateRelapsePredictionParams
  // - validateRiskAssessmentParams

  describe('validateConfigurePredictionParams', () => {
    it('should return Ok for valid ConfigurePredictionParams', () => {
      const result = validateConfigurePredictionParams(mockValidConfigureParams);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidConfigureParams);
    });

    it('should return Ok for empty config object', () => {
      const result = validateConfigurePredictionParams({});
      expect(result.ok).toBe(true);
      expect(result.val).toEqual({});
    });

    it('should return Err for invalid field value (predictionHorizon)', () => {
      const result = validateConfigurePredictionParams(mockInvalidConfigureParams);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'predictionHorizon must be a positive number.'
      );
    });
  });

  // Tests for validatePredictionResultData (Placeholder)
  describe('validatePredictionResultData', () => {
    it('should return Ok for valid PredictionResultData (basic object check)', () => {
      const validData = {
        predictionId: 'pred-1',
        score: 0.85,
        confidence: 0.9,
      }; // Example structure
      const result = validatePredictionResultData(validData);
      expect(result.ok).toBe(true); // Will pass if it's an object
    });

    it('should return Err for non-object input', () => {
      const result = validatePredictionResultData(null);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Input must be an object.');
    });
  });

  // Tests for validateRiskAssessmentData
  describe('validateRiskAssessmentData', () => {
    it('should return Ok for valid RiskAssessmentData', () => {
      const result = validateRiskAssessmentData(mockValidRiskAssessment);
      // This test relies on the isRiskAssessment guard which is basic for now
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidRiskAssessment);
    });

    it('should return Err for non-object input', () => {
      const result = validateRiskAssessmentData(123);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid RiskAssessmentData structure.');
    });

    it('should return Err for data missing required fields (overallRisk)', () => {
      const result = validateRiskAssessmentData(mockInvalidRiskAssessment);
      expect(result.err).toBe(true); // Fails because overallRisk is missing in mock
      expect((result.val as Error).message).toContain('Invalid RiskAssessmentData structure.');
    });
  });
});

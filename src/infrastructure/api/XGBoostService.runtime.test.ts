/**
 * @fileoverview Tests for runtime validation functions in XGBoostService.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
import {
  validateData, // Using the generic validator
  isRiskPredictionRequest,
  isRiskPredictionResponse,
  isTreatmentResponseRequest,
  isTreatmentResponseResponse,
  // Import other guards as they are defined
} from '@api/XGBoostService.runtime';
import {
  RiskPredictionRequest,
  RiskPredictionResponse,
  TreatmentResponseRequest,
  TreatmentResponseResponse,
  // Import other interfaces as needed
} from '@api/XGBoostService';

// --- Mock Data ---

const mockValidRiskRequest: RiskPredictionRequest = {
  patient_id: 'p123',
  risk_type: 'relapse',
  clinical_data: {
    assessment_scores: { phq9: 15, gad7: 12 },
    severity: 'moderate',
    diagnosis: 'MDD',
  },
  confidence_threshold: 0.6,
};

const mockInvalidRiskRequest = {
  patient_id: 'p123',
  // risk_type: 'relapse', // Missing required field
  clinical_data: {
    assessment_scores: { phq9: 15 },
    severity: 'moderate',
    diagnosis: 'MDD',
  },
};

const mockValidRiskResponse: RiskPredictionResponse = {
  prediction_id: 'pred_abc',
  patient_id: 'p123',
  risk_type: 'relapse',
  risk_level: 'high',
  risk_score: 0.75,
  confidence: 0.88,
  meets_threshold: true,
  factors: [{ name: 'phq9', contribution: 0.4, direction: 'positive' }],
  timestamp: new Date().toISOString(),
  recommendations: ['Increase monitoring', 'Consider therapy adjustment'],
};

const mockInvalidRiskResponse = {
  prediction_id: 'pred_def',
  patient_id: 'p123',
  risk_type: 'relapse',
  risk_level: 'very_high', // Invalid enum value
  risk_score: '0.75', // Wrong type
  confidence: 0.88,
  meets_threshold: true,
  factors: [{ name: 'phq9', contribution: 0.4, direction: 'positive' }],
  timestamp: new Date().toISOString(),
  recommendations: ['Increase monitoring'],
};

describe('XGBoostService Runtime Validation', () => {
  // --- Tests for Request Guards ---
  describe('isRiskPredictionRequest', () => {
    it('should return true for valid RiskPredictionRequest', () => {
      expect(isRiskPredictionRequest(mockValidRiskRequest)).toBe(true);
    });
    it('should return false for invalid RiskPredictionRequest (missing field)', () => {
      expect(isRiskPredictionRequest(mockInvalidRiskRequest)).toBe(false);
    });
    it('should return false for null', () => {
      expect(isRiskPredictionRequest(null)).toBe(false);
    });
    it('should return false for non-object', () => {
      expect(isRiskPredictionRequest('string')).toBe(false);
    });
  });

  // TODO: Add tests for other request guards (isTreatmentResponseRequest, etc.)

  // --- Tests for Response Guards ---
  describe('isRiskPredictionResponse', () => {
    it('should return true for valid RiskPredictionResponse', () => {
      expect(isRiskPredictionResponse(mockValidRiskResponse)).toBe(true);
    });
    it('should return false for invalid RiskPredictionResponse (wrong type/enum)', () => {
      expect(isRiskPredictionResponse(mockInvalidRiskResponse)).toBe(false);
    });
    it('should return false for null', () => {
      expect(isRiskPredictionResponse(null)).toBe(false);
    });
    it('should return false for non-object', () => {
      expect(isRiskPredictionResponse(123)).toBe(false);
    });
  });

  // TODO: Add tests for other response guards (isTreatmentResponseResponse, etc.)

  // --- Tests for validateData (using example guards) ---
  describe('validateData', () => {
    it('should return Ok when data matches the guard', () => {
      const result = validateData(mockValidRiskRequest, isRiskPredictionRequest, 'Risk Request');
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidRiskRequest);
    });

    it('should return Err when data does not match the guard', () => {
      const result = validateData(mockInvalidRiskRequest, isRiskPredictionRequest, 'Risk Request');
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid Risk Request');
    });
  });
});

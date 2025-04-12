import { describe, it, expect } from 'vitest';
import { ApiProxyService } from './ApiProxyService';

describe('ApiProxyService', () => {
  describe('mapPath', () => {
    it('should map ML endpoints correctly', () => {
      expect(ApiProxyService.mapPath('/v1/ml/process')).toBe('ml/process');
      expect(ApiProxyService.mapPath('v1/ml/depression-detection')).toBe('ml/depression-detection');
    });

    it('should map Digital Twin endpoints correctly', () => {
      expect(ApiProxyService.mapPath('/v1/ml/digital-twin/conversation')).toBe('ml/mentalllama/conversation');
      expect(ApiProxyService.mapPath('v1/ml/digital-twin/sessions')).toBe('ml/mentalllama/sessions');
    });

    it('should map PHI endpoints correctly', () => {
      expect(ApiProxyService.mapPath('/v1/ml/phi/detect')).toBe('ml/phi/detect');
      expect(ApiProxyService.mapPath('v1/ml/phi/redact')).toBe('ml/phi/redact');
    });

    it('should map Brain Model endpoints correctly', () => {
      expect(ApiProxyService.mapPath('/v1/brain-models')).toBe('ml/brain/brain-models');
      expect(ApiProxyService.mapPath('v1/brain-models/123/regions')).toBe('ml/brain/brain-models/123/regions');
    });

    it('should map Patient endpoints correctly', () => {
      expect(ApiProxyService.mapPath('/v1/patients')).toBe('ml/patients/');
      expect(ApiProxyService.mapPath('v1/patients/123')).toBe('ml/patients/123');
    });

    it('should map risk assessment endpoints correctly', () => {
      expect(ApiProxyService.mapPath('/v1/patients/123/risk-assessment')).toBe('xgboost/predict-risk/123');
    });

    it('should map treatment prediction endpoints correctly', () => {
      expect(ApiProxyService.mapPath('/v1/patients/123/predict-treatment')).toBe('xgboost/predict-treatment-response');
    });

    it('should map auth endpoints correctly', () => {
      expect(ApiProxyService.mapPath('/v1/auth/login')).toBe('auth/login');
      expect(ApiProxyService.mapPath('v1/auth/me')).toBe('auth/me');
    });
  });

  describe('mapRequestData', () => {
    it('should transform treatment prediction data correctly', () => {
      const data = {
        patientId: '123',
        treatmentType: 'medication',
        details: { dose: '10mg' },
        factors: { age: 45 }
      };
      
      const result = ApiProxyService.mapRequestData('patients/123/predict-treatment', data);
      
      expect(result).toEqual({
        patient_id: '123',
        treatment_type: 'medication',
        treatment_details: { dose: '10mg' },
        contextual_factors: { age: 45 }
      });
    });

    it('should transform digital twin conversation data correctly', () => {
      const data = {
        sessionId: '123',
        message: 'Hello',
        senderId: 'user-456'
      };
      
      const result = ApiProxyService.mapRequestData('ml/digital-twin/conversation', data);
      
      expect(result).toEqual({
        session_id: '123',
        message: 'Hello',
        sender_id: 'user-456',
        sender_type: 'user'
      });
    });

    it('should return original data for other endpoints', () => {
      const data = { key: 'value' };
      const result = ApiProxyService.mapRequestData('other/endpoint', data);
      expect(result).toEqual(data);
    });
  });

  describe('mapResponseData', () => {
    it('should transform risk assessment response correctly', () => {
      const data = {
        risk_level: 'medium',
        risk_factors: ['factor1', 'factor2'],
        recommendations: ['rec1', 'rec2'],
        confidence_score: 0.85
      };
      
      const result = ApiProxyService.mapResponseData('xgboost/predict-risk/123', data);
      
      expect(result).toEqual({
        riskLevel: 'medium',
        riskFactors: ['factor1', 'factor2'],
        recommendations: ['rec1', 'rec2'],
        confidenceScore: 0.85
      });
    });

    it('should transform session data correctly', () => {
      const data = {
        session_id: '123',
        status: 'active',
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
        messages: [
          {
            message_id: 'm1',
            content: 'Hello',
            sender_type: 'user',
            timestamp: '2023-01-01T12:00:00Z'
          }
        ],
        insights: ['insight1', 'insight2']
      };
      
      const result = ApiProxyService.mapResponseData('ml/mentalllama/sessions/123', data);
      
      expect(result).toEqual({
        id: '123',
        status: 'active',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
        messages: [
          {
            id: 'm1',
            content: 'Hello',
            sender: 'user',
            timestamp: '2023-01-01T12:00:00Z'
          }
        ],
        insights: ['insight1', 'insight2']
      });
    });

    it('should return original data for other endpoints', () => {
      const data = { key: 'value' };
      const result = ApiProxyService.mapResponseData('other/endpoint', data);
      expect(result).toEqual(data);
    });
  });

  describe('standardizeResponse', () => {
    it('should return existing ApiResponse structure unchanged', () => {
      const response = {
        data: { key: 'value' },
        meta: { page: 1 }
      };
      
      const result = ApiProxyService.standardizeResponse(response);
      expect(result).toEqual(response);
    });

    it('should wrap non-ApiResponse data in standard format', () => {
      const data = { key: 'value' };
      const result = ApiProxyService.standardizeResponse(data);
      expect(result).toEqual({
        data: { key: 'value' }
      });
    });
  });
});
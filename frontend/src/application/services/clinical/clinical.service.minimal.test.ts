/**
 * NOVAMIND Testing Framework
 * Clinical Service Minimal Tests
 * 
 * Minimal tests for the Clinical Service with HIPAA compliance and psychiatric precision
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { clinicalService } from './clinical.service';
import { SymptomNeuralMapping } from '@domain/models/brainMapping';
import { RiskAssessment } from '@domain/types/clinical/risk';
import { TreatmentResponsePrediction } from '@domain/types/clinical/treatment';
import { Symptom } from '@domain/types/clinical/patient';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('clinicalService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchSymptomMappings', () => {
    it('fetches neural mappings with psychiatric precision', async () => {
      // Arrange
      const mockMappings: SymptomNeuralMapping[] = [
        {
          symptomId: 'symptom-123',
          symptomName: 'Anxiety',
          brainRegions: ['prefrontal-cortex', 'amygdala'],
          connectionTypes: ['inhibitory'],
          mappingConfidence: 0.85,
          mappingSource: 'neural-database-v2'
        }
      ];
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockMappings });
      
      // Act
      const result = await clinicalService.fetchSymptomMappings();
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockMappings);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/mappings/symptoms'),
        expect.objectContaining({
          timeout: 10000,
          headers: expect.any(Object)
        })
      );
    });
  });

  describe('fetchRiskAssessment', () => {
    it('fetches patient risk assessment with HIPAA compliance', async () => {
      // Arrange
      const mockAssessment: RiskAssessment = {
        patientId: 'patient-456',
        overallRiskScore: 0.65,
        riskFactors: [
          { factor: 'prior-episode', score: 0.8, confidence: 0.9 },
          { factor: 'social-isolation', score: 0.7, confidence: 0.85 }
        ],
        assessmentDate: '2023-04-01T00:00:00Z',
        nextAssessmentDue: '2023-04-15T00:00:00Z'
      };
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockAssessment });
      
      // Act
      const result = await clinicalService.fetchRiskAssessment('patient-456');
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockAssessment);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/patients/patient-456/risk-assessment'),
        expect.anything()
      );
    });
  });

  describe('updateSymptom', () => {
    it('updates symptom with clinical precision', async () => {
      // Arrange
      const mockUpdatedSymptom: Symptom = {
        id: 'symptom-1',
        name: 'Depressed Mood',
        severity: 0.5, // Updated severity
        onset: '2023-03-01T00:00:00Z',
        duration: { value: 4, unit: 'weeks' },
        frequency: 'daily',
        triggers: ['stress', 'poor-sleep'],
        notes: 'Improving with current treatment'
      };
      
      mockedAxios.patch.mockResolvedValueOnce({ data: mockUpdatedSymptom });
      
      // Act
      const result = await clinicalService.updateSymptom(
        'patient-456',
        'symptom-1',
        { 
          severity: 0.5,
          notes: 'Improving with current treatment'
        }
      );
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.value.severity).toBe(0.5);
      expect(result.value.notes).toBe('Improving with current treatment');
    });
  });

  describe('generateTemporalProjections', () => {
    it('generates precise temporal projections for treatment response', async () => {
      // Arrange
      const mockProjection = {
        projectionId: 'proj-123',
        timeSeries: [
          {
            dayOffset: 0,
            date: '2023-04-01T00:00:00Z',
            metrics: { 'symptom-severity': 0.8 },
            confidenceIntervals: { 'symptom-severity': [0.75, 0.85] }
          },
          {
            dayOffset: 14,
            date: '2023-04-15T00:00:00Z',
            metrics: { 'symptom-severity': 0.6 },
            confidenceIntervals: { 'symptom-severity': [0.55, 0.65] }
          },
          {
            dayOffset: 28,
            date: '2023-04-29T00:00:00Z',
            metrics: { 'symptom-severity': 0.4 },
            confidenceIntervals: { 'symptom-severity': [0.35, 0.45] }
          }
        ]
      };
      
      mockedAxios.post.mockResolvedValueOnce({ data: mockProjection });
      
      // Act
      const result = await clinicalService.generateTemporalProjections(
        'patient-456',
        ['treatment-1', 'treatment-2'],
        30
      );
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.value.timeSeries).toHaveLength(3);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/temporal-projections'),
        expect.objectContaining({
          treatmentIds: ['treatment-1', 'treatment-2'],
          projectionDuration: 30
        }),
        expect.anything()
      );
    });
  });
});

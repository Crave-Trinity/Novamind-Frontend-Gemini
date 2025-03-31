import { /**
 * NOVAMIND Testing Framework
 * brainModelService Tests
 * 
 * Tests for the brainModelService with TypeScript type safety
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { brainModelService } from './brainModelService';
import { BrainModel, BrainRegion, NeuralConnection } from '../../domain/types/brain';
import { Result } from '../../domain/types/common';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('brainModelService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchBrainModel', () => {
    it('fetches brain model with quantum precision', async () => {
      // Arrange
      const mockBrainModel: BrainModel = {
        id: 'brain-model-123',
        patientId: 'patient-456',
        scanDate: '2025-03-30T14:30:00Z',
        scanType: 'fMRI',
        regions: [
          { id: 'region-1', name: 'Prefrontal Cortex', activityLevel: 0.7, isActive: true },
          { id: 'region-2', name: 'Amygdala', activityLevel: 0.4, isActive: true }
        ],
        connections: [
          { id: 'connection-1', sourceId: 'region-1', targetId: 'region-2', strength: 0.6, type: 'excitatory', active: true }
        ],
        metadata: {
          resolution: 'high',
          processingAlgorithm: 'neural-enhanced-v2'
        }
      };
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockBrainModel });
      
      // Act
      const result = await brainModelService.fetchBrainModel('brain-model-123');
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBrainModel);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/brain-models/brain-model-123'),
        expect.objectContaining({
          timeout: 15000,
          headers: expect.any(Object)
        })
      );
    });

    it('handles API errors with clinical precision', async () => {
      // Arrange
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Brain scan not found' }
        }
      };
      
      mockedAxios.get.mockRejectedValueOnce(errorResponse);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      
      // Act
      const result = await brainModelService.fetchBrainModel('non-existent-id');
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not found');
    });
  });

  describe('searchBrainModels', () => {
    it('searches brain models with neural precision', async () => {
      // Arrange
      const mockResponse = {
        data: [
          {
            id: 'brain-model-123',
            patientId: 'patient-456',
            scanDate: '2025-03-30T14:30:00Z',
            scanType: 'fMRI',
            regions: [],
            connections: []
          },
          {
            id: 'brain-model-124',
            patientId: 'patient-456',
            scanDate: '2025-03-29T10:15:00Z',
            scanType: 'EEG',
            regions: [],
            connections: []
          }
        ],
        total: 2
      };
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
      
      // Act
      const result = await brainModelService.searchBrainModels('patient-456');
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.models).toHaveLength(2);
      expect(result.data?.total).toBe(2);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/brain-models'),
        expect.objectContaining({
          params: expect.objectContaining({
            patientId: 'patient-456'
          })
        })
      );
    });
  });

  describe('updateRegion', () => {
    it('updates brain region with mathematical precision', async () => {
      // Arrange
      const mockUpdatedRegion: BrainRegion = {
        id: 'region-1',
        name: 'Prefrontal Cortex',
        activityLevel: 0.85, // Updated activity level
        isActive: true
      };
      
      mockedAxios.patch.mockResolvedValueOnce({ data: mockUpdatedRegion });
      
      // Act
      const result = await brainModelService.updateRegion(
        'brain-model-123',
        'region-1',
        { activityLevel: 0.85 }
      );
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.activityLevel).toBe(0.85);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/brain-models/brain-model-123/regions/region-1'),
        expect.objectContaining({ activityLevel: 0.85 }),
        expect.any(Object)
      );
    });
  });

  describe('updateConnection', () => {
    it('updates neural connection with synaptic precision', async () => {
      // Arrange
      const mockUpdatedConnection: NeuralConnection = {
        id: 'connection-1',
        sourceId: 'region-1',
        targetId: 'region-2',
        strength: 0.75, // Updated strength
        type: 'excitatory',
        active: true
      };
      
      mockedAxios.patch.mockResolvedValueOnce({ data: mockUpdatedConnection });
      
      // Act
      const result = await brainModelService.updateConnection(
        'brain-model-123',
        'connection-1',
        { strength: 0.75 }
      );
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.strength).toBe(0.75);
    });
  });
});
 } from "";
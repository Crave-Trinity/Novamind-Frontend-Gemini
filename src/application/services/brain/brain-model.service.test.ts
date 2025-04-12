/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite
 * Brain Model Service testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { brainModelService } from '@services/brain/brain-model.service'; // Corrected path
import { apiClient } from '@infrastructure/api/apiClient'; // Import the actual apiClient
import type { BrainModel, BrainRegion, NeuralConnection } from '@domain/types/brain/models';

describe('Brain Model Service', () => {
  beforeEach(() => {
    // Clear all mocks, including spies, before each test
    vi.restoreAllMocks();
  });

  describe('fetchBrainModel', () => {
    it('successfully fetches a brain model by ID', async () => {
      // Arrange
      const mockBrainModel: BrainModel = {
        id: 'scan123',
        regions: [],
        connections: [],
        version: '1', // Corrected type to string
        patientId: 'patient-test', // Added required
        scan: {
          id: 'scan-test',
          patientId: 'patient-test',
          scanDate: new Date().toISOString(),
          scanType: 'fMRI',
          dataQualityScore: 0.9,
          resolution: { x: 1, y: 1, z: 1 }, // Added missing property
          metadata: { acquisitionTime: 300 }, // Added missing property
        },
        timestamp: new Date().toISOString(), // Added required
        processingLevel: 'analyzed', // Added required
        lastUpdated: new Date().toISOString(), // Added required
      };

      // Use vi.spyOn to mock the 'get' method of the apiClient instance
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce(mockBrainModel);

      // Act
      const result = await brainModelService.fetchBrainModel('scan123');

      // Assert
      expect(result.success).toBe(true);
      if (result.success) expect(result.value).toEqual(mockBrainModel);
      expect(getSpy).toHaveBeenCalledWith('/brain-models/scan123'); // Service calls with relative path
    });

    it('handles API error responses appropriately', async () => {
      // Arrange - Mock a 404 error
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Brain scan not found' },
        },
        isAxiosError: true,
      };
      // Spy on apiClient.get and make it reject
      const getSpy = vi.spyOn(apiClient, 'get').mockRejectedValueOnce(mockError);

      // Act
      const result = await brainModelService.fetchBrainModel('nonexistent');

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.message).toContain('not found');
      expect(getSpy).toHaveBeenCalledWith('/brain-models/nonexistent');
    });

    it('handles network errors gracefully', async () => {
      // Arrange - Mock a network error
      const mockError = {
        request: {},
        isAxiosError: true,
      };
      const getSpy = vi.spyOn(apiClient, 'get').mockRejectedValueOnce(mockError);

      // Act
      const result = await brainModelService.fetchBrainModel('scan123');

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error?.message).toContain('No response received');
      expect(getSpy).toHaveBeenCalledWith('/brain-models/scan123');
    });
  });

  describe('searchBrainModels', () => {
    it('performs search with correct parameters', async () => {
      // Arrange
      const mockResponseSearch = {
        models: [
          {
            id: 'scan123',
            regions: [],
            connections: [],
            version: '1', // Corrected type
            patientId: 'patient456', // Added required
            scan: {
              id: 'scan-test',
              patientId: 'patient456',
              scanDate: '',
              scanType: 'fMRI',
              dataQualityScore: 0.9,
              resolution: { x: 1, y: 1, z: 1 },
              metadata: {},
            }, // Simplified scan object
            timestamp: '', // Added required
            processingLevel: 'analyzed', // Added required
            lastUpdated: '', // Added required
          },
        ],
        total: 1,
      };

      // Spy on apiClient.get
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponseSearch);

      // Act
      const result = await brainModelService.searchBrainModels(
        'patient456',
        { from: '2025-01-01', to: '2025-04-01' },
        'fMRI',
        10,
        0
      );

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        // Access value only on success
        expect(result.value?.models).toHaveLength(1);
        expect(result.value?.total).toBe(1);
      }
      expect(getSpy).toHaveBeenCalledWith('/brain-models', {
        params: {
          patientId: 'patient456',
          from: '2025-01-01',
          to: '2025-04-01',
          scanType: 'fMRI',
          limit: 10,
          offset: 0,
        },
      });
    });
  });

  describe('updateRegion', () => {
    it('successfully updates a brain region', async () => {
      // Arrange
      const mockRegionUpdate: Partial<BrainRegion> = {
        id: 'region123',
        name: 'Updated Region',
        activityLevel: 0.8,
        isActive: true,
      };
      const mockResponseRegion: BrainRegion = {
        id: 'region123',
        name: 'Updated Region', // Include required fields
        activityLevel: 0.8,
        isActive: true,
        position: { x: 0, y: 0, z: 0 }, // Add required
        color: '#ffffff', // Add required
        connections: [], // Add required
        dataConfidence: 1.0, // Add required
        volume: 100, // Add required
        hemisphereLocation: 'left', // Added missing property
        activity: 0.5, // Added missing property
      };

      // Service uses PUT, so spy on apiClient.put
      const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValueOnce(mockResponseRegion);

      // Act
      const result = await brainModelService.updateRegion('scan123', 'region123', mockRegionUpdate);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) expect(result.value).toEqual(mockResponseRegion);
      expect(putSpy).toHaveBeenCalledWith(
        '/brain-models/scan123/regions/region123',
        mockRegionUpdate
      );
    });
  });

  describe('updateConnection', () => {
    it('successfully updates a neural connection', async () => {
      // Arrange
      const mockConnectionUpdate: Partial<NeuralConnection> = {
        id: 'conn123',
        strength: 0.6,
      };
      const mockResponseConnection: NeuralConnection = {
        id: 'conn123',
        strength: 0.6,
        sourceId: 'r1', // Add required
        targetId: 'r2', // Add required
        type: 'excitatory', // Add required
        dataConfidence: 1.0, // Add required
        directionality: 'unidirectional', // Added missing property
        activityLevel: 0.7, // Added missing property
      };

      // Service uses PUT, so spy on apiClient.put
      const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValueOnce(mockResponseConnection);

      // Act
      const result = await brainModelService.updateConnection(
        'scan123',
        'conn123',
        mockConnectionUpdate
      );

      // Assert
      expect(result.success).toBe(true);
      if (result.success) expect(result.value).toEqual(mockResponseConnection);
      expect(putSpy).toHaveBeenCalledWith(
        '/brain-models/scan123/connections/conn123',
        mockConnectionUpdate
      );
    });
  });

  describe('createAnnotation', () => {
    it('successfully creates an annotation', async () => {
      // Arrange
      const mockResponse = {
        id: 'anno123',
        createdAt: '2025-04-01T00:00:00Z',
      };

      const mockAnnotation = {
        regionIds: ['r1', 'r2'],
        text: 'Important finding',
        author: 'Dr. Smith',
        category: 'clinical' as const,
        visibility: 'team' as const,
      };

      // Service uses POST, so spy on apiClient.post
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse);

      // Act
      const result = await brainModelService.createAnnotation('scan123', mockAnnotation);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) expect(result.value.id).toBe('anno123'); // Access value only on success
      expect(postSpy).toHaveBeenCalledWith('/brain-models/scan123/annotations', mockAnnotation);
    });
  });

  describe('generateModel', () => {
    it('successfully initiates model generation', async () => {
      // Arrange
      const mockResponse = {
        scanId: 'scan-gen-123',
        status: 'processing',
      };

      // Service uses POST, so spy on apiClient.post
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse);

      // Act
      const result = await brainModelService.generateModel('patient456');

      // Assert
      expect(result.success).toBe(true);
      if (result.success) expect(result.value.status).toBe('processing'); // Access value only on success
      expect(postSpy).toHaveBeenCalledWith('/brain-models/generate', { patientId: 'patient456' });
    });
  });

  describe('checkGenerationStatus', () => {
    it('retrieves the current generation status', async () => {
      // Arrange
      const mockResponse = {
        status: 'processing',
        progress: 0.65,
        scanId: undefined,
        error: undefined,
      };

      // Service uses GET, so spy on apiClient.get
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act
      const result = await brainModelService.checkGenerationStatus('gen123');

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        // Access value only on success
        expect(result.value.status).toBe('processing');
        expect(result.value.progress).toBe(0.65);
      }
      expect(getSpy).toHaveBeenCalledWith('/brain-models/generation/gen123'); // Corrected URL
    });
  });
});

/**
 * NOVAMIND Neural-Safe Application Service
 * BrainModelService - Quantum-level service for brain model operations
 * with clinical precision and mathematical integrity
 */

import axios from 'axios'; // Keep for isAxiosError check
import type { BrainModel, BrainRegion, NeuralConnection } from '@domain/types/brain/models';
import { type Result, success, failure } from '@/domain/types/shared/common'; // Corrected path alias and location

// Import the shared apiClient instance (corrected casing)
import { apiClient } from '@infrastructure/api/apiClient';

/**
 * Brain Model Service
 * Implements neural-safe API interactions with error handling
 */
export const brainModelService = {
  /**
   * Fetch brain model by scan ID
   */
  fetchBrainModel: async (scanId: string): Promise<Result<BrainModel, Error>> => {
    try {
      // Use apiClient instance - relative path, proxy handles base URL
      const data = await apiClient.get<BrainModel>(`/brain-models/${scanId}`);
      // Successful response
      return success(data);
    } catch (error) {
      // Handle API errors with precise error messages
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server returned an error response
          const status = error.response.status;
          const responseData = error.response.data as any; // Use a different name to avoid conflict

          switch (status) {
            case 404:
              return failure(new Error(`Brain scan with ID ${scanId} not found`));
            case 403:
              return failure(new Error('Insufficient permissions to access this brain scan'));
            case 500:
              return failure(new Error('Server error while retrieving brain model'));
            default:
              return failure(new Error(responseData.message || `API error: ${status}`));
          }
        } else if (error.request) {
          // Request was made but no response received
          return failure(
            new Error('No response received from server. Please check your network connection.')
          );
        } else {
          // Error setting up the request
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to fetch brain model: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  },

  /**
   * Search brain models by various criteria
   */
  searchBrainModels: async (
    patientId?: string,
    dateRange?: { from: string; to: string },
    scanType?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Result<{ models: BrainModel[]; total: number }, Error>> => {
    try {
      // Build query parameters
      const params: Record<string, string | number> = { limit, offset };
      if (patientId) params.patientId = patientId;
      if (dateRange) {
        params.from = dateRange.from;
        params.to = dateRange.to;
      }
      if (scanType) params.scanType = scanType;

      // API request using apiClient
      // Assuming the API returns an object like { models: BrainModel[], total: number } directly
      const responseData = await apiClient.get<{ models: BrainModel[]; total: number }>(
        '/brain-models', // Use relative path
        { params }
      );

      // Successful response
      return success(responseData);
    } catch (error) {
      // Handle API errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const responseData = error.response.data as any; // Use a different name

          switch (status) {
            case 400:
              return failure(new Error(`Invalid search parameters: ${responseData.message}`));
            case 403:
              return failure(new Error('Insufficient permissions to search brain models'));
            case 500:
              return failure(new Error('Server error during search operation'));
            default:
              return failure(new Error(responseData.message || `API error: ${status}`));
          }
        } else if (error.request) {
          return failure(
            new Error('No response received from server. Please check your network connection.')
          );
        } else {
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to search brain models: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  },

  /**
   * Update brain region properties
   */
  updateRegion: async (
    scanId: string,
    regionId: string,
    updates: Partial<BrainRegion>
  ): Promise<Result<BrainRegion, Error>> => {
    try {
      // API request using apiClient
      const data = await apiClient.put<BrainRegion>(
        `/brain-models/${scanId}/regions/${regionId}`, // Use relative path
        updates
      );

      // Successful response
      return success(data);
    } catch (error) {
      // Handle API errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const responseData = error.response.data as any;

          switch (status) {
            case 404:
              return failure(new Error(`Brain scan or region not found`));
            case 400:
              return failure(new Error(`Invalid region update: ${responseData.message}`));
            case 403:
              return failure(new Error('Insufficient permissions to update this brain scan'));
            case 500:
              return failure(new Error('Server error while updating brain region'));
            default:
              return failure(new Error(responseData.message || `API error: ${status}`));
          }
        } else if (error.request) {
          return failure(
            new Error('No response received from server. Please check your network connection.')
          );
        } else {
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to update brain region: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  },

  /**
   * Update neural connection properties
   */
  updateConnection: async (
    scanId: string,
    connectionId: string,
    updates: Partial<NeuralConnection>
  ): Promise<Result<NeuralConnection, Error>> => {
    try {
      // API request using apiClient
      const data = await apiClient.put<NeuralConnection>(
        `/brain-models/${scanId}/connections/${connectionId}`, // Use relative path
        updates
      );

      // Successful response
      return success(data);
    } catch (error) {
      // Handle API errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const responseData = error.response.data as any;

          switch (status) {
            case 404:
              return failure(new Error(`Brain scan or connection not found`));
            case 400:
              return failure(new Error(`Invalid connection update: ${responseData.message}`));
            case 403:
              return failure(new Error('Insufficient permissions to update this brain scan'));
            case 500:
              return failure(new Error('Server error while updating neural connection'));
            default:
              return failure(new Error(responseData.message || `API error: ${status}`));
          }
        } else if (error.request) {
          return failure(
            new Error('No response received from server. Please check your network connection.')
          );
        } else {
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to update neural connection: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  },

  /**
   * Create a brain model annotation for clinical notes
   */
  createAnnotation: async (
    scanId: string,
    annotation: {
      regionIds?: string[];
      connectionIds?: string[];
      text: string;
      author: string;
      category: 'clinical' | 'research' | 'technical';
      visibility: 'private' | 'team' | 'organization';
    }
  ): Promise<Result<{ id: string; createdAt: string }, Error>> => {
    try {
      // API request using apiClient
      const data = await apiClient.post<{ id: string; createdAt: string }>(
        `/brain-models/${scanId}/annotations`, // Use relative path
        annotation
      );

      // Successful response
      return success(data);
    } catch (error) {
      // Handle API errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const responseData = error.response.data as any;

          switch (status) {
            case 404:
              return failure(new Error(`Brain scan not found`));
            case 400:
              return failure(new Error(`Invalid annotation data: ${responseData.message}`));
            case 403:
              return failure(new Error('Insufficient permissions to annotate this brain scan'));
            case 500:
              return failure(new Error('Server error while creating annotation'));
            default:
              return failure(new Error(responseData.message || `API error: ${status}`));
          }
        } else if (error.request) {
          return failure(
            new Error('No response received from server. Please check your network connection.')
          );
        } else {
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to create annotation: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  },

  /**
   * Generate a brain model from clinical data (mock implementation)
   * In a real system, this would call a server-side AI model
   */
  generateModel: async (patientId: string): Promise<Result<{ scanId: string; status: string }, Error>> => {
    try {
      // API request using apiClient
      const data = await apiClient.post<{ scanId: string; status: string }>(
        `/brain-models/generate`, // Use relative path
        { patientId }
      );

      // Successful response
      return success(data);
    } catch (error) {
      // Handle API errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const responseData = error.response.data as any;

          switch (status) {
            case 404:
              return failure(new Error(`Patient with ID ${patientId} not found`));
            case 400:
              return failure(new Error(`Invalid generation request: ${responseData.message}`));
            case 403:
              return failure(new Error('Insufficient permissions to generate brain models'));
            case 500:
              return failure(new Error('Server error during model generation'));
            default:
              return failure(new Error(responseData.message || `API error: ${status}`));
          }
        } else if (error.request) {
          return failure(
            new Error('No response received from server. Please check your network connection.')
          );
        } else {
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to generate brain model: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  },

  /**
   * Check model generation status
   */
  checkGenerationStatus: async (
    generationId: string
  ): Promise<
    Result<
      {
        status: string;
        progress: number;
        scanId?: string;
        error?: string;
      },
      Error
    >
  > => {
    try {
      // API request using apiClient
      const data = await apiClient.get<{
        status: string;
        progress: number;
        scanId?: string;
        error?: string;
      }>(`/brain-models/generation/${generationId}`); // Use relative path

      // Successful response
      return success(data);
    } catch (error) {
      // Handle API errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const responseData = error.response.data as any;

          switch (status) {
            case 404:
              return failure(new Error(`Generation process not found`));
            case 403:
              return failure(new Error('Insufficient permissions to check generation status'));
            case 500:
              return failure(new Error('Server error while checking generation status'));
            default:
              return failure(new Error(responseData.message || `API error: ${status}`));
          }
        } else if (error.request) {
          return failure(
            new Error('No response received from server. Please check your network connection.')
          );
        } else {
          return failure(new Error(`Request setup error: ${error.message}`));
        }
      }

      // Generic error handling
      return failure(
        new Error(
          `Failed to check generation status: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  },

  /**
   * Fetch baseline neural activity for a patient
   */
  getBaselineActivity: async (patientId: string): Promise<Result<any, Error>> => {
    // Using 'any' for baseline type for now
    try {
      // Define the correct relative endpoint for baseline activity
      const BASELINE_ENDPOINT = `/patients/${patientId}/baseline-activity`;
      const data = await apiClient.get<any>(BASELINE_ENDPOINT);
      // Assuming the response data structure matches what the hook expects
      // (e.g., { regionActivations: [], connectionStrengths: [] })
      return success(data);
    } catch (error) {
      // Simplified error handling for now, reuse patterns from other methods if needed
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          // Ensure patientId is defined before using in error message
          const id = patientId ?? 'unknown'; // Use nullish coalescing
          return failure(new Error(`Baseline activity not found for patient ${id}`));
        }
      }
      return failure(
        new Error(
          `Failed to fetch baseline activity: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  },
};

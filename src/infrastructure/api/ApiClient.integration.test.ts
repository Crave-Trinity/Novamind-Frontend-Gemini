/**
 * ApiClient Integration Tests
 * 
 * These tests validate the integration between ApiClient and ApiProxyService
 * to ensure correct path mapping and response transformation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient } from './apiClient';
import { ApiProxyService } from './ApiProxyService';
import axios from 'axios';

// Import mockApi directly instead of using path alias
import { mockApi } from './mockApi';

// Mock imports
vi.mock('./mockApi', () => ({
  mockApi: {
    searchPatients: vi.fn().mockResolvedValue([]),
    getPatient: vi.fn().mockResolvedValue({}),
    getBrainModel: vi.fn().mockResolvedValue({}),
    getBrainModels: vi.fn().mockResolvedValue([]),
    getTreatmentRecommendations: vi.fn().mockResolvedValue([])
  }
}));

// Mock axios
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        request: vi.fn(),
        interceptors: {
          request: {
            use: vi.fn((callback) => callback),
          },
          response: {
            use: vi.fn(),
          },
        },
      })),
    },
  };
});

// Spy on ApiProxyService
vi.spyOn(ApiProxyService, 'mapPath');
vi.spyOn(ApiProxyService, 'mapRequestData');
vi.spyOn(ApiProxyService, 'mapResponseData');
vi.spyOn(ApiProxyService, 'standardizeResponse');

describe('ApiClient Integration with ApiProxyService', () => {
  let apiClient: ApiClient;
  let mockAxiosInstance: ReturnType<typeof axios.create>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock axios instance
    mockAxiosInstance = axios.create() as any;
    (mockAxiosInstance.request as any).mockImplementation(async (config: any) => {
      return {
        data: { result: 'success', endpoint: config.url },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
      };
    });
    
    // Create ApiClient instance
    apiClient = new ApiClient('/api');
    
    // Replace the internal axios instance for testing
    (apiClient as any).instance = mockAxiosInstance;
    
    // Disable mock api for these tests
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    
    // Set development mode to false to force real API calls
    vi.stubGlobal('process', {
      env: {
        NODE_ENV: 'production',
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should map paths when making GET requests', async () => {
    await apiClient.get('/patients/123');
    
    // Verify ApiProxyService was called
    expect(ApiProxyService.mapPath).toHaveBeenCalledWith('v1/patients/123');
    
    // Verify the mapped path was used in the request
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.any(String),
      })
    );
  });

  it('should map paths for brain model endpoints', async () => {
    await apiClient.getBrainModel('model-123');
    
    // Verify ApiProxyService was called with the correct path
    expect(ApiProxyService.mapPath).toHaveBeenCalledWith(
      expect.stringMatching(/v1\/brain-models\/model-123/)
    );
  });

  it('should map paths for patient endpoints', async () => {
    await apiClient.getPatientById('patient-123');
    
    // Verify ApiProxyService was called with the correct path
    expect(ApiProxyService.mapPath).toHaveBeenCalledWith(
      expect.stringMatching(/v1\/patients\/patient-123/)
    );
  });

  it('should map request data when making POST requests', async () => {
    const data = { name: 'Test Patient', age: 35 };
    await apiClient.post('/patients', data);
    
    // Verify mapRequestData was called
    expect(ApiProxyService.mapRequestData).toHaveBeenCalledWith(
      expect.any(String), 
      data
    );
  });

  it('should map response data', async () => {
    await apiClient.get('/patients/123');
    
    // Verify mapResponseData was called
    expect(ApiProxyService.mapResponseData).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object)
    );
  });

  it('should standardize response format', async () => {
    await apiClient.get('/patients/123');
    
    // Verify standardizeResponse was called
    expect(ApiProxyService.standardizeResponse).toHaveBeenCalled();
  });

  it('should transform treatment prediction requests and responses', async () => {
    const treatmentData = { treatment: 'CBT', duration: '8 weeks' };
    
    // Mock implementation for this specific call
    (mockAxiosInstance.request as any).mockImplementationOnce(async (config: any) => {
      return {
        data: { 
          efficacy: 0.78,
          prediction: 'positive',
          patient_id: 'patient-123'
        },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
      };
    });
    
    await apiClient.predictTreatmentResponse('patient-123', treatmentData);
    
    // Verify path mapping
    expect(ApiProxyService.mapPath).toHaveBeenCalledWith(
      expect.stringContaining('predict-treatment')
    );
    
    // Verify request data transformation
    expect(ApiProxyService.mapRequestData).toHaveBeenCalledWith(
      expect.any(String),
      treatmentData
    );
    
    // Verify response data transformation
    expect(ApiProxyService.mapResponseData).toHaveBeenCalled();
  });

  it('should transform risk assessment responses', async () => {
    // Mock implementation for this specific call
    (mockAxiosInstance.request as any).mockImplementationOnce(async (config: any) => {
      return {
        data: { 
          risk_level: 'medium',
          risk_factors: ['factor1', 'factor2'],
          recommendations: ['rec1', 'rec2']
        },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
      };
    });
    
    await apiClient.getRiskAssessment('patient-123');
    
    // Verify path mapping
    expect(ApiProxyService.mapPath).toHaveBeenCalledWith(
      expect.stringContaining('risk-assessment')
    );
    
    // Verify response data transformation
    expect(ApiProxyService.mapResponseData).toHaveBeenCalled();
  });
});
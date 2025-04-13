/* eslint-disable */
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

// Spies will be set up in beforeEach

describe('ApiClient Integration with ApiProxyService', () => {
  let apiClient: ApiClient;
  // let mockAxiosInstance: ReturnType<typeof axios.create>; // No longer mocking axios directly
  let fetchSpy: any; // Use any for now, inference happens in beforeEach

  beforeEach(() => {
    vi.clearAllMocks(); // Clear previous spies/mocks

    // Spy on ApiProxyService methods *inside* beforeEach
    vi.spyOn(ApiProxyService, 'mapPath');
    vi.spyOn(ApiProxyService, 'mapRequestData');
    vi.spyOn(ApiProxyService, 'mapResponseData');
    vi.spyOn(ApiProxyService, 'standardizeResponse');

    // Mock global fetch
    fetchSpy = vi.spyOn(globalThis, 'fetch'); // Assign to outer variable
    fetchSpy.mockImplementation(async (url: RequestInfo | URL, options?: RequestInit) => {
      // Default mock response
      let responseData: any = { result: 'success', endpoint: url };
      let status = 200;

      // Customize response based on URL/test case if needed
      if (typeof url === 'string') {
         if (url.includes('predict-treatment')) {
             responseData = { efficacy: 0.78, prediction: 'positive', patient_id: 'patient-123' };
         } else if (url.includes('risk-assessment')) {
             responseData = { risk_level: 'medium', risk_factors: ['factor1', 'factor2'], recommendations: ['rec1', 'rec2'] };
         }
      }

      return Promise.resolve(new Response(JSON.stringify(responseData), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
      }));
    });

    // Create ApiClient instance
    apiClient = new ApiClient('/api');
    // No need to replace internal instance, fetch is mocked globally
    
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
    
    // Verify fetch was called with the mapped path
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/patients/123', // Base URL + mapped path
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should map paths for brain model endpoints', async () => {
    // Use the generic get method with the expected endpoint
    await apiClient.get('/brain-models/model-123');
    
    // Verify ApiProxyService was called with the correct path
    expect(ApiProxyService.mapPath).toHaveBeenCalledWith('v1/brain-models/model-123');
  });

  it('should map paths for patient endpoints', async () => {
    // Use the generic get method with the expected endpoint
    await apiClient.get('/patients/patient-123');
    
    // Verify ApiProxyService was called with the correct path
    expect(ApiProxyService.mapPath).toHaveBeenCalledWith('v1/patients/patient-123');
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
    
    // fetchSpy is configured in beforeEach to handle this endpoint
    
    // Use the generic post method with the expected endpoint and data
    await apiClient.post('/patients/patient-123/predict-treatment', treatmentData);
    
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
    // fetchSpy is configured in beforeEach to handle this endpoint
    
    // Use the generic get method with the expected endpoint
    await apiClient.get('/patients/patient-123/risk-assessment');
    
    // Verify path mapping
    expect(ApiProxyService.mapPath).toHaveBeenCalledWith(
      expect.stringContaining('risk-assessment')
    );
    
    // Verify response data transformation
    expect(ApiProxyService.mapResponseData).toHaveBeenCalled();
  });
});
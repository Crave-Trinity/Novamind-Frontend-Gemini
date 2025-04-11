import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

import { mockApi } from '@api/mockApi';
import { validateApiResponse } from '@api/ApiClient.runtime'; // Import the validator
// Removed unused Result, Ok, Err imports
// Flag to toggle between mock and real API
const USE_MOCK_API = false; // Disable mock API

import type { BrainModel } from '@domain/types/brain/models';

/**
 * API Client for the Novamind Digital Twin Backend
 *
 * Handles all communication with the backend services using Axios.
 * Includes interceptors for authentication and error handling.
 */
export class ApiClient {
  private instance: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string = '/api') {
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token to headers if available
        if (this.authToken) {
          config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle common errors (401, 403, etc.)
        if (error.response) {
          switch (error.response.status) {
            case 401:
              // Handle unauthorized
              console.error('Unauthorized access attempt');
              // Redirect to login or refresh token
              localStorage.removeItem('auth_token');
              window.location.href = '/login';
              break;
            case 403:
              // Handle forbidden
              console.error('Forbidden access attempt');
              break;
            case 500:
              // Handle server error
              console.error('Server error occurred');
              break;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token for subsequent requests
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  public clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Get authentication status
   */
  public isAuthenticated(): boolean {
    return !!this.authToken || !!localStorage.getItem('auth_token');
  }

  /**
   * POST request method
   */
  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    // Use mock API if enabled
    if (USE_MOCK_API) {
      console.log(`[Mock API] POST ${url}`, data);
      // Return mock data based on the endpoint
      return this.handleMockResponse<T>(url, data);
    }

    // Use real API
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  /**
   * GET request method
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Use mock API if enabled
    if (USE_MOCK_API) {
      console.log(`[Mock API] GET ${url}`);
      // Return mock data based on the endpoint
      return this.handleMockResponse<T>(url);
    }

    // Use real API
    return this.request<T>({
      method: 'GET',
      url,
      ...config,
    });
  }

  /**
   * PUT request method
   */
  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    // Use mock API if enabled
    if (USE_MOCK_API) {
      console.log(`[Mock API] PUT ${url}`, data);
      // Return mock data based on the endpoint
      return this.handleMockResponse<T>(url, data);
    }

    // Use real API
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  /**
   * DELETE request method
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Use mock API if enabled
    if (USE_MOCK_API) {
      console.log(`[Mock API] DELETE ${url}`);
      // Return mock data based on the endpoint
      return this.handleMockResponse<T>(url);
    }

    // Use real API
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }

  /**
   * Generic request method
   */
  // Updated request method to include runtime validation
  private async request<T>(
    config: AxiosRequestConfig,
    // Optional: Pass the type guard for the expected response type T
    responseGuard?: (data: unknown) => data is T
  ): Promise<T> {
    try {
      const response: AxiosResponse<unknown> = await this.instance.request(config); // Get raw response first

      // Validate the response data if a guard is provided
      if (responseGuard) {
        const validationResult = validateApiResponse(
          response.data,
          responseGuard,
          `API Response [${config.method} ${config.url}]`
        );
        if (validationResult.ok) {
          return validationResult.val; // Return validated data
        } else {
          // Throw the validation error to be caught below
          console.error(`API Response Validation Failed: ${validationResult.val.message}`);
          throw validationResult.val;
        }
      }

      // If no guard provided, return raw data (consider adding a warning or stricter policy)
      console.warn(
        `[ApiClient] No response validation guard provided for ${config.method} ${config.url}. Returning raw data.`
      );
      return response.data as T;
    } catch (error) {
      // Log original Axios error or validation error
      console.error(
        `API request failed [${config.method} ${config.url}]:`,
        error instanceof Error ? error.message : error
      );
      // Re-throw the original error or a custom API error
      throw error;
    }
  }

  /**
   * Specific API methods
   */

  // User authentication
  public async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: unknown; success?: boolean }> {
    if (USE_MOCK_API) {
      console.log('[Mock API] Login attempt', { email });
      // Simulate login success for mock API
      return { success: true, token: 'mock_token_123', user: {} };
    }

    const response = await this.post<{ token: string; user: unknown }>('/auth/login', {
      email,
      password,
    });
    this.setAuthToken(response.token);
    return response;
  }

  // Get all patients
  public async getPatients(): Promise<unknown[]> {
    if (USE_MOCK_API) {
      return mockApi.getPatients();
    }

    return this.get<unknown[]>('/patients');
  }

  // Get patient by ID
  public async getPatientById(patientId: string): Promise<unknown> {
    if (USE_MOCK_API) {
      return mockApi.getPatientById(patientId);
    }

    return this.get<unknown>(`/patients/${patientId}`);
  }

  // Get brain model
  public async getBrainModel(modelId: string = 'default'): Promise<BrainModel> {
    if (USE_MOCK_API) {
      return mockApi.getBrainModel(modelId);
    }

    return this.get<BrainModel>(`/brain-models/${modelId}`);
  }

  // Predict treatment response
  public async predictTreatmentResponse<T = unknown>(
    patientId: string,
    treatmentData: Record<string, unknown>
  ): Promise<T> {
    if (USE_MOCK_API) {
      // Type assertion for the mock API call
      return mockApi.predictTreatmentResponse(patientId, treatmentData.treatment as string) as T;
    }

    return this.post<T>(`/patients/${patientId}/predict-treatment`, treatmentData);
  }

  // Get risk assessment
  public async getRiskAssessment<T = unknown>(patientId: string): Promise<T> {
    if (USE_MOCK_API) {
      return mockApi.getRiskAssessment(patientId) as T;
    }

    return this.get<T>(`/patients/${patientId}/risk-assessment`);
  }

  /**
   * Handle mock API responses for testing and development
   * @private
   */
  private handleMockResponse<T>(url: string, _data?: unknown): T {
    // Implement mock response logic here
    // For example:
    if (url === '/auth/login') {
      return { success: true, token: 'mock_token_123' } as unknown as T;
    } else if (url === '/patients') {
      return [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' },
      ] as unknown as T;
    } else {
      throw new Error(`Mock API: Unknown endpoint ${url}`);
    }
  }
}

// Export as singleton instance
export const apiClient = new ApiClient();

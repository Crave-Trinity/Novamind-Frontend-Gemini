import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { IApiClient } from '@api/IApiClient';
import { mockApi } from '@api/mockApi';

/**
 * Enhanced Mock API Client - A fully-functional API client with no backend dependency
 *
 * This implementation follows the hexagonal architecture pattern by:
 * 1. Implementing the IApiClient interface fully
 * 2. Providing realistic mock data for all endpoints
 * 3. Including realistic delays and error handling
 * 4. Supporting offline development workflow
 */
export class EnhancedMockApiClient implements IApiClient {
  private authToken: string | null = null;
  private auditLogsEnabled = true;

  constructor() {
    // Initialize from localStorage if available
    this.authToken = localStorage.getItem('auth_token');

    console.info('🧠 Enhanced Mock API Client initialized');
    console.info('📡 HIPAA-compliant Novamind API simulation running');
  }

  /**
   * Set authentication token for subsequent requests
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('auth_token', token);

    // Log token set (simulating audit logging)
    if (this.auditLogsEnabled) {
      this.logActivity('auth_token_set', { tokenLength: token.length });
    }
  }

  /**
   * Clear authentication token
   */
  public clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('auth_token');

    // Log token cleared (simulating audit logging)
    if (this.auditLogsEnabled) {
      this.logActivity('auth_token_cleared', {});
    }
  }

  /**
   * Get authentication status
   */
  public isAuthenticated(): boolean {
    return !!this.authToken || !!localStorage.getItem('auth_token');
  }

  /**
   * Simulate network delays realistically
   */
  private async simulateNetworkDelay(min = 200, max = 800): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Log audit activity
   */
  private logActivity(action: string, details: any): void {
    // Try to send to audit log endpoint, but expect it to fail gracefully
    // This simulates the behavior we'd want in production
    axios
      .post('/api/audit-logs', {
        action,
        timestamp: new Date().toISOString(),
        details,
        userId: 'mock-user-123',
      })
      .catch(() => {
        // We expect this to fail in mock mode - it's by design
        // The error is already logged in the console by the API proxy
      });
  }

  /**
   * Generic GET request
   */
  public async get<T>(url: string, _config?: AxiosRequestConfig): Promise<T> { // Prefixed unused config
    // Log the request attempt
    if (this.auditLogsEnabled) {
      this.logActivity('api_request', { method: 'GET', url });
    }

    // Simulate network delay
    await this.simulateNetworkDelay();

    // Extract resource name from URL for mock data lookup
    // Removed unused variable: const _resourceType = url.split('/')[1];

    // Return appropriate mock data based on the URL
    let result: any;

    if (url.includes('/patients') && url.length > 10) {
      // Get single patient (URL format: /patients/123)
      const patientId = url.split('/')[2] || 'default';
      result = mockApi.getPatientById(patientId);
    } else if (url === '/patients') {
      // Get all patients
      result = mockApi.getPatients();
    } else if (url.includes('/brain-models')) {
      // Get brain model
      const modelId = url.split('/')[2] || 'default';
      result = mockApi.getBrainModel(modelId);
    } else if (url.includes('/risk-assessment')) {
      // Get risk assessment
      const patientId = url.split('/')[2] || 'default';
      result = mockApi.getRiskAssessment(patientId);
    } else {
      // Unknown endpoint
      console.error(`Mock API: Unknown GET endpoint ${url}`);
      throw new Error(`No mock data available for GET ${url}`);
    }

    return result as T;
  }

  /**
   * Generic POST request
   */
  public async post<T>(url: string, data?: any, _config?: AxiosRequestConfig): Promise<T> { // Prefixed unused config
    // Log the request attempt
    if (this.auditLogsEnabled) {
      this.logActivity('api_request', {
        method: 'POST',
        url,
        dataKeys: Object.keys(data || {}),
      });
    }

    // Simulate network delay
    await this.simulateNetworkDelay();

    // Handle specific endpoints
    let result: any;

    if (url === '/auth/login') {
      result = {
        success: true,
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: 'user-123',
          name: 'Dr. Jane Smith',
          role: 'Neuropsychiatrist',
          email: data.email,
        },
      };
      // Set the token automatically
      this.setAuthToken(result.token);
    } else if (url.includes('/predict-treatment')) {
      const patientId = url.split('/')[2] || 'default';
      result = mockApi.predictTreatmentResponse(patientId, data.treatment);
    } else {
      // Default fallback
      console.error(`Mock API: Unknown POST endpoint ${url}`);
      result = { success: true, message: `Mock POST to ${url} successful` };
    }
    return result as T;
  }

  /**
   * Generic PUT request
   */
  public async put<T>(url: string, data?: any, _config?: AxiosRequestConfig): Promise<T> { // Prefixed unused config
    // Log the request attempt
    if (this.auditLogsEnabled) {
      this.logActivity('api_request', {
        method: 'PUT',
        url,
        dataKeys: Object.keys(data || {}),
      });
    }

    // Simulate network delay
    await this.simulateNetworkDelay();

    // Simple simulation for now
    const result = {
      success: true,
      message: `Mock PUT to ${url} successful`,
      updatedData: { ...data, id: url.split('/').pop(), updated: true },
    };

    return result as T;
  }

  /**
   * Generic DELETE request
   */
  public async delete<T>(url: string, _config?: AxiosRequestConfig): Promise<T> { // Prefixed unused config
    // Log the request attempt
    if (this.auditLogsEnabled) {
      this.logActivity('api_request', { method: 'DELETE', url });
    }

    // Simulate network delay
    await this.simulateNetworkDelay();

    // Simple simulation for now
    const result = {
      success: true,
      message: `Mock DELETE to ${url} successful`,
      id: url.split('/').pop(),
    };

    return result as T;
  }

  /**
   * Login with email and password
   */
  public async login(email: string, password: string): Promise<any> {
    // Log the login attempt
    if (this.auditLogsEnabled) {
      this.logActivity('login_attempt', { email });
    }

    // Simulate network delay
    await this.simulateNetworkDelay(500, 1200);

    // Basic validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Always succeed in mock mode
    const response = {
      success: true,
      token: 'mock_jwt_token_' + Date.now(),
      user: {
        id: 'user-123',
        name: 'Dr. Jane Smith',
        role: 'Neuropsychiatrist',
        email,
      },
    };

    // Set the auth token
    this.setAuthToken(response.token);
    return response;
  }

  /**
   * Get all patients
   */
  public async getPatients(): Promise<any[]> {
    // Log the request
    if (this.auditLogsEnabled) {
      this.logActivity('fetch_patients', {});
    }

    return this.get<any[]>('/patients');
  }

  /**
   * Get patient by ID
   */
  public async getPatientById(patientId: string): Promise<any> {
    // Log the request
    if (this.auditLogsEnabled) {
      this.logActivity('fetch_patient_detail', { patientId });
    }

    return this.get<any>(`/patients/${patientId}`);
  }

  /**
   * Get brain model
   */
  public async getBrainModel(modelId: string = 'default'): Promise<any> {
    // Log the request
    if (this.auditLogsEnabled) {
      this.logActivity('fetch_brain_model', { modelId });
    }

    return this.get<any>(`/brain-models/${modelId}`);
  }

  /**
   * Predict treatment response
   */
  public async predictTreatmentResponse(patientId: string, treatmentData: any): Promise<any> {
    // Log the request
    if (this.auditLogsEnabled) {
      this.logActivity('predict_treatment', {
        patientId,
        treatmentType: treatmentData?.treatment,
      });
    }

    return this.post<any>(`/patients/${patientId}/predict-treatment`, treatmentData);
  }

  /**
   * Get risk assessment
   */
  public async getRiskAssessment(patientId: string): Promise<any> {
    // Log the request
    if (this.auditLogsEnabled) {
      this.logActivity('risk_assessment', { patientId });
    }

    return this.get<any>(`/patients/${patientId}/risk-assessment`);
  }
  /**
   * Process data using mock logic for testing.
   */
  public processData(data: any): any {
    return { processed: true, data };
  }
}

// Export as callable singleton instance
const instance = new EnhancedMockApiClient();
function callableEnhancedMockApiClient(data: any) {
  return instance.processData(data);
}
Object.assign(callableEnhancedMockApiClient, instance);
export const enhancedMockApiClient = callableEnhancedMockApiClient;

/* eslint-disable */
/**
 * NOVAMIND Enhanced Mock API Client
 * Quantum-level mock implementation with neural precision
 */

import axios from 'axios';
import { IApiClient } from './IApiClient';
import type { ApiPatient } from './ApiClient.runtime';

/**
 * Enhanced mock client for development and testing with simulated latency
 */
export class EnhancedMockApiClient implements IApiClient {
  private mockDelay: number;
  private auditEnabled: boolean;

  constructor(config?: { mockDelay?: number; auditEnabled?: boolean }) {
    this.mockDelay = config?.mockDelay ?? 400; // Default 400ms delay
    this.auditEnabled = config?.auditEnabled ?? true; // Default audit enabled
  }

  /**
   * Simulate network delay
   */
  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log audit activity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private logActivity(
    action: string,
    details: any /* eslint-disable-line @typescript-eslint/no-explicit-any */
  ): void {
    // Try to send to audit log endpoint, but expect it to fail gracefully
    // This simulates the behavior we'd want in production
    if (typeof window !== 'undefined' && this.auditEnabled) {
      // Safe access to potential window.axios
      try {
        axios
          .post('/api/audit-logs', {
            action,
            timestamp: new Date().toISOString(),
            details,
            userId: 'mock-user-123',
          })
          .catch(() => {
            // Expected to fail in mock/dev, just log to console
            console.debug('[Mock Audit]', action, details);
          });
      } catch (e) {
        console.debug('[Mock Audit]', action, details);
      }
    } else {
      console.debug('[Mock Audit]', action, details);
    }
  }

  // API Implementation methods

  // User/Authentication
  // ===================================

  /**
   * Login implementation
   */
  async login(
    email: string,
    password: string
  ): Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
    token: string;
    organization: string;
  }> {
    await this.delay();
    this.logActivity('login', { email });

    // Return mock user data
    return {
      id: 'user-mock-123',
      name: 'Dr. Neural Smith',
      email: email,
      role: 'clinician',
      token: 'mock-jwt-token-xyz',
      organization: 'Quantum Psychiatry Center',
    };
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<{
    id: string;
    name: string;
    role: string;
    preferences: Record<string, unknown>;
  }> {
    await this.delay();
    this.logActivity('getUserProfile', { userId });

    return {
      id: userId,
      name: 'Dr. Neural Smith',
      role: 'clinician',
      preferences: {
        theme: 'clinical',
        dashboardLayout: 'compact',
        notifications: true,
      },
    };
  }

  // --- Missing IApiClient methods ---

  setAuthToken(token: string | null): void {
    console.log(`[MockClient] setAuthToken called with token: ${token ? 'present' : 'null'}`);
    // No-op for mock
  }

  clearAuthToken(): void {
    console.log('[MockClient] clearAuthToken called');
    // No-op for mock
  }

  isAuthenticated(): boolean {
    console.log('[MockClient] isAuthenticated called');
    // Assume authenticated for mock purposes, adjust if needed for specific tests
    return true;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    console.log(`[MockClient] GET called: ${endpoint}`, params);
    this.logActivity('GET_Request', { endpoint, params });
    // Simulate a generic successful response for GET requests
    // Tests needing specific GET responses should mock this method specifically
    if (endpoint.includes('brain-models')) {
      // Provide a minimal mock BrainModel structure if needed
      return Promise.resolve({ id: 'mock-model', regions: [], connections: [] } as unknown as T);
    }
    return Promise.resolve({ message: 'Mock GET success' } as unknown as T);
  }

  // Patient data operations
  // ===================================

  /**
   * Get patient by ID
   */
  async getPatient(patientId: string): Promise<ApiPatient> {
    await this.delay();
    this.logActivity('getPatient', { patientId });

    return {
      id: patientId,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-01-01',
      gender: 'male',
      demographicData: {
        age: 43,
        ethnicity: 'caucasian',
        weight: '180lbs',
        height: '5\'10"',
      },
      medicalHistory: {
        conditions: ['depression', 'anxiety'],
        medications: ['fluoxetine', 'alprazolam'],
        allergies: [],
      },
    };
  }

  /**
   * Get all patients
   */
  async getPatients(): Promise<ApiPatient[]> {
    await this.delay();
    this.logActivity('getPatients', {});

    return [
      {
        id: 'patient-1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        gender: 'male',
        demographicData: {
          age: 43,
          ethnicity: 'caucasian',
        },
      },
      {
        id: 'patient-2',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1990-05-15',
        gender: 'female',
        demographicData: {
          age: 33,
          ethnicity: 'asian',
        },
      },
    ];
  }

  // Brain Model operations
  // ===================================

  /**
   * Get brain model data
   */
  async getBrainModel(modelId: string): Promise<{
    id: string;
    patientId: string;
    scanDate: string;
    regions: Array<{
      id: string;
      name: string;
      coordinates: [number, number, number];
      size: number;
      connections: string[];
    }>;
    connections: Array<{
      from: string;
      to: string;
      strength: number;
    }>;
  }> {
    await this.delay();
    this.logActivity('getBrainModel', { modelId });

    return {
      id: modelId,
      patientId: 'patient-1',
      scanDate: '2023-10-15',
      regions: [
        {
          id: 'r1',
          name: 'prefrontal cortex',
          coordinates: [0, 5, 0],
          size: 3,
          connections: ['r2', 'r3'],
        },
        {
          id: 'r2',
          name: 'amygdala',
          coordinates: [2, 0, 1],
          size: 1,
          connections: ['r1'],
        },
        {
          id: 'r3',
          name: 'hippocampus',
          coordinates: [-2, 0, 1],
          size: 1.5,
          connections: ['r1', 'r2'],
        },
      ],
      connections: [
        { from: 'r1', to: 'r2', strength: 0.8 },
        { from: 'r1', to: 'r3', strength: 0.6 },
        { from: 'r2', to: 'r1', strength: 0.5 },
        { from: 'r3', to: 'r1', strength: 0.7 },
        { from: 'r3', to: 'r2', strength: 0.4 },
      ],
    };
  }

  /**
   * Update brain model activity levels
   */
  async updateBrainActivity(
    modelId: string,
    activityData: {
      regions: Array<{ id: string; activity: number }>;
    }
  ): Promise<{ success: boolean }> {
    await this.delay();
    this.logActivity('updateBrainActivity', { modelId, activityData });

    return { success: true };
  }

  /**
   * Get visualization data
   */
  async getVisualizationData(
    modelId: string,
    params?: Record<string, string>
  ): Promise<{
    timestamps: string[];
    activityData: Array<{
      regionId: string;
      values: number[];
    }>;
    connectivityData: Array<{
      fromRegion: string;
      toRegion: string;
      values: number[];
    }>;
  }> {
    await this.delay();
    this.logActivity('getVisualizationData', { modelId, params });

    const timestamps = Array.from({ length: 10 }, (_, i) =>
      new Date(Date.now() - i * 86400000).toISOString()
    ).reverse();

    return {
      timestamps,
      activityData: [
        {
          regionId: 'r1',
          values: Array.from({ length: 10 }, () => Math.random()),
        },
        {
          regionId: 'r2',
          values: Array.from({ length: 10 }, () => Math.random()),
        },
        {
          regionId: 'r3',
          values: Array.from({ length: 10 }, () => Math.random()),
        },
      ],
      connectivityData: [
        {
          fromRegion: 'r1',
          toRegion: 'r2',
          values: Array.from({ length: 10 }, () => Math.random() * 0.5 + 0.5),
        },
        {
          fromRegion: 'r1',
          toRegion: 'r3',
          values: Array.from({ length: 10 }, () => Math.random() * 0.5 + 0.3),
        },
      ],
    };
  }
}

// Export default instance
const enhancedMockApiClient = new EnhancedMockApiClient();
export default enhancedMockApiClient;

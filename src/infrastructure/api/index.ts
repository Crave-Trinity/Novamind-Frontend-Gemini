/**
 * API client for external services
 */

import { BrainModel, Patient } from '@domain/types';

/**
 * Base API client with common functionality
 */
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  protected async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Patient API client
 */
export class PatientApiClient extends ApiClient {
  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    super(baseUrl, headers);
  }

  async getPatients(): Promise<Patient[]> {
    return this.fetch<Patient[]>('/patients');
  }

  async getPatient(id: string): Promise<Patient> {
    return this.fetch<Patient>(`/patients/${id}`);
  }
}

/**
 * Brain model API client
 */
export class BrainModelApiClient extends ApiClient {
  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    super(baseUrl, headers);
  }

  async getBrainModels(patientId: string): Promise<BrainModel[]> {
    return this.fetch<BrainModel[]>(`/patients/${patientId}/brain-models`);
  }

  async getBrainModel(patientId: string, modelId: string): Promise<BrainModel> {
    return this.fetch<BrainModel>(`/patients/${patientId}/brain-models/${modelId}`);
  }
}

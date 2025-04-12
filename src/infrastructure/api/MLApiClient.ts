/**
 * MLApiClient
 * 
 * Base client for interacting with the ML API.
 * This client provides direct methods to call API endpoints without 
 * the additional production features like retries and validation.
 * 
 * For production use, prefer MLApiClientEnhanced.
 */

import { ApiClient } from './ApiClient';

export class MLApiClient {
  private apiClient: ApiClient;
  
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }
  
  /**
   * Process text through the ML model
   */
  async processText(text: string, options?: any): Promise<any> {
    const url = '/ml/process';
    const params = { text, ...options };
    
    return this.apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  /**
   * Detect depression indicators in text
   */
  async detectDepression(text: string, options?: any): Promise<any> {
    const url = '/ml/detect-depression';
    const params = { text, ...options };
    
    return this.apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  /**
   * Assess risk based on text input
   */
  async assessRisk(text: string, options?: any): Promise<any> {
    const url = '/ml/assess-risk';
    const params = { text, ...options };
    
    return this.apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  /**
   * Analyze sentiment in text
   */
  async analyzeSentiment(text: string, options?: any): Promise<any> {
    const url = '/ml/sentiment';
    const params = { text, ...options };
    
    return this.apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  /**
   * Analyze wellness dimensions from text
   */
  async analyzeWellnessDimensions(text: string, options?: any): Promise<any> {
    const url = '/ml/wellness-dimensions';
    const params = { text, ...options };
    
    return this.apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  /**
   * Generate a digital twin model based on patient data
   */
  async generateDigitalTwin(patientData: any, options?: any): Promise<any> {
    const url = '/ml/generate-twin';
    const params = { patient_data: patientData, ...options };
    
    return this.apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  /**
   * Create a new digital twin session
   */
  async createDigitalTwinSession(
    therapistId: string,
    patientId: string,
    mode?: string,
    options?: any
  ): Promise<any> {
    const url = '/ml/sessions';
    const params = {
      therapist_id: therapistId,
      patient_id: patientId,
      mode,
      ...options
    };
    
    return this.apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  /**
   * Get session details by ID
   */
  async getDigitalTwinSession(sessionId: string): Promise<any> {
    const url = `/ml/sessions/${sessionId}`;
    
    return this.apiClient.fetch(url, {
      method: 'GET'
    });
  }
  
  /**
   * Send a message to a digital twin session
   */
  async sendMessageToSession(
    sessionId: string,
    message: string,
    options?: any
  ): Promise<any> {
    const url = `/ml/sessions/${sessionId}/messages`;
    const params = {
      message,
      ...options
    };
    
    return this.apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  /**
   * End a digital twin session
   */
  async endDigitalTwinSession(sessionId: string, options?: any): Promise<any> {
    const url = `/ml/sessions/${sessionId}/end`;
    const params = { ...options };
    
    return this.apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  /**
   * Get insights from a completed session
   */
  async getSessionInsights(sessionId: string, options?: any): Promise<any> {
    const url = `/ml/sessions/${sessionId}/insights`;
    const params = { ...options };
    
    if (Object.keys(params).length > 0) {
      return this.apiClient.fetch(url, {
        method: 'POST',
        body: JSON.stringify(params)
      });
    }
    
    return this.apiClient.fetch(url, {
      method: 'GET'
    });
  }
  
  /**
   * Detect if text contains PHI (Protected Health Information)
   */
  async detectPHI(text: string, options?: any): Promise<any> {
    const url = '/ml/phi/detect';
    const params = { text, ...options };
    
    return this.apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  /**
   * Redact PHI from text
   */
  async redactPHI(
    text: string,
    replacement?: string,
    options?: any
  ): Promise<any> {
    const url = '/ml/phi/redact';
    const params = {
      text,
      replacement,
      ...options
    };
    
    return this.apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  
  /**
   * Check ML service health
   */
  async checkMLHealth(): Promise<any> {
    const url = '/ml/health';
    
    return this.apiClient.fetch(url, {
      method: 'GET'
    });
  }
  
  /**
   * Check PHI detection service health
   */
  async checkPHIHealth(): Promise<any> {
    const url = '/ml/phi/health';
    
    return this.apiClient.fetch(url, {
      method: 'GET'
    });
  }
}
import type { BrainModel } from '@domain/types/brain/models'; // Re-added import with correct path

import { mockApiClient } from '@api/MockApiClient';

// Define treatment response type for type safety
interface TreatmentResponse {
  responseRate: number;
  timeToResponse: string;
  sideEffects: string[];
  recommendation: string;
  confidenceScore: number;
}

/**
 * Mock API methods for development and testing
 * Uses the MockApiClient to generate sample data
 */
export const mockApi = {
  /**
   * Get a list of mock patients
   */
  getPatients: async (): Promise<any[]> => {
    return [
      {
        id: 'demo-patient',
        name: 'Alex Johnson',
        age: 42,
        gender: 'Male',
        condition: 'Major Depressive Disorder',
        riskLevel: 'Medium',
        lastVisit: '2025-03-20',
      },
      {
        id: 'patient-002',
        name: 'Emily Williams',
        age: 35,
        gender: 'Female',
        condition: 'Generalized Anxiety Disorder',
        riskLevel: 'Low',
        lastVisit: '2025-03-15',
      },
      {
        id: 'patient-003',
        name: 'Michael Davis',
        age: 29,
        gender: 'Male',
        condition: 'Bipolar Disorder',
        riskLevel: 'High',
        lastVisit: '2025-03-25',
      },
    ];
  },

  /**
   * Get a single patient by ID
   */
  getPatientById: async (patientId: string): Promise<any> => {
    const patients = await mockApi.getPatients();
    const patient = patients.find((p) => p.id === patientId);

    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }

    return {
      ...patient,
      details: {
        medicalHistory: 'Patient has a history of depression and anxiety',
        medications: ['Sertraline 50mg', 'Lorazepam 0.5mg as needed'],
        allergies: ['Penicillin'],
        primaryConcern: 'Worsening depressive symptoms',
        treatmentGoals: 'Reduce depressive symptoms and improve daily functioning',
      },
    };
  },

  /**
   * Get a brain model for visualization
   * Uses our MockApiClient implementation
   */
  getBrainModel: async (modelId: string): Promise<BrainModel> => {
    return mockApiClient.getBrainModel(modelId);
  },

  /**
   * Predict treatment response
   */
  predictTreatmentResponse: async (
    _patientId: string, // Prefixed unused parameter
    treatment: string
  ): Promise<TreatmentResponse> => {
    // Define outcomes with explicit types
    const outcomes: Record<string, TreatmentResponse> = {
      cbt: {
        responseRate: 0.75,
        timeToResponse: '4-6 weeks',
        sideEffects: ['Initial anxiety increase', 'Emotional discomfort'],
        recommendation: 'Highly recommended based on patient profile',
        confidenceScore: 0.82,
      },
      ssri: {
        responseRate: 0.68,
        timeToResponse: '2-4 weeks',
        sideEffects: ['Nausea', 'Insomnia', 'Sexual dysfunction'],
        recommendation: 'Recommended with monitoring',
        confidenceScore: 0.76,
      },
      tms: {
        responseRate: 0.55,
        timeToResponse: '4-6 weeks',
        sideEffects: ['Headache', 'Scalp discomfort'],
        recommendation: 'Consider if other treatments fail',
        confidenceScore: 0.65,
      },
      default: {
        responseRate: 0.5,
        timeToResponse: 'Unknown',
        sideEffects: ['Unknown'],
        recommendation: 'Insufficient data for strong recommendation',
        confidenceScore: 0.5,
      },
    };

    // Return the corresponding outcome or default using type-safe approach
    if (treatment in outcomes) {
      // Asserting type as TreatmentResponse since logic guarantees it
      return outcomes[treatment] as TreatmentResponse;
    }
    // Asserting type as TreatmentResponse since 'default' always exists
    return outcomes['default'] as TreatmentResponse;
  },

  /**
   * Get risk assessment
   */
  getRiskAssessment: async (_patientId: string): Promise<any> => { // Prefixed unused parameter
    return {
      overallRisk: 0.65,
      components: [
        {
          name: 'Suicide Risk',
          score: 0.35,
          interpretation: 'Low to moderate risk',
        },
        {
          name: 'Self-harm Risk',
          score: 0.42,
          interpretation: 'Moderate risk',
        },
        { name: 'Crisis Risk', score: 0.28, interpretation: 'Low risk' },
        {
          name: 'Treatment Non-adherence',
          score: 0.55,
          interpretation: 'Moderate risk',
        },
      ],
      recommendations: [
        'Regular check-ins via telehealth',
        'Family support engagement',
        'Medication adherence monitoring',
        'Crisis plan review',
      ],
      lastUpdated: new Date().toISOString(),
    };
  },
};

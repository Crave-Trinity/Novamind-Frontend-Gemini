/**
 * NOVAMIND Test Infrastructure
 * Clinical Service Mock for Test Environment
 * 
 * Uses inline type definitions to avoid path resolution issues
 * while still providing proper mock implementations.
 */

import { vi } from 'vitest';

// Use Result type from common to match service interface
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };
const success = <T>(data: T): Result<T> => ({ success: true, data });
const failure = <E extends Error>(error: E): Result<never, E> => ({ success: false, error });

// Define simplified types that match the structure we need
interface BiometricAlert {
  id: string;
  patientId: string;
  [key: string]: any;
}

// Simplified type definitions 
interface SymptomNeuralMapping {
  id: string;
  symptomId: string;
  symptomName: string;
  [key: string]: any;
}

interface DiagnosisNeuralMapping {
  id: string;
  diagnosisId: string;
  diagnosisName: string;
  [key: string]: any;
}

interface TreatmentNeuralMapping {
  id: string;
  treatmentId: string;
  treatmentName: string;
  [key: string]: any;
}

interface RiskAssessment {
  id: string;
  patientId: string;
  [key: string]: any;
}

interface TreatmentResponsePrediction {
  treatmentId: string;
  patientId: string;
  [key: string]: any;
}

// Create minimal mock data
const mockSymptomMappings: SymptomNeuralMapping[] = [
  { id: "sym-1", symptomId: "s1", symptomName: "Test Symptom" }
];

const mockDiagnosisMappings: DiagnosisNeuralMapping[] = [
  { id: "diag-1", diagnosisId: "d1", diagnosisName: "Test Diagnosis" }
];

const mockTreatmentMappings: TreatmentNeuralMapping[] = [
  { id: "treat-1", treatmentId: "t1", treatmentName: "Test Treatment" }
];

const mockRiskAssessment: RiskAssessment = {
  id: "risk-1", 
  patientId: "patient-default",
  overallRisk: "moderate" 
};

const mockTreatmentPredictions: TreatmentResponsePrediction[] = [
  { 
    treatmentId: "t1", 
    patientId: "patient-default",
    responseProbability: 0.75 
  }
];

// Create the mock service with all required functions
export const mockClinicalService = {
  // Mock methods with immediate Promise resolution to avoid test hangs
  fetchSymptomMappings: vi.fn().mockResolvedValue(success(mockSymptomMappings)),
  fetchDiagnosisMappings: vi.fn().mockResolvedValue(success(mockDiagnosisMappings)),
  fetchTreatmentMappings: vi.fn().mockResolvedValue(success(mockTreatmentMappings)),
  
  fetchRiskAssessment: vi.fn().mockImplementation((patientId: string) => {
    if (!patientId) {
      return Promise.resolve(failure(new Error("No patient ID provided")));
    }
    return Promise.resolve(success({...mockRiskAssessment, patientId}));
  }),
  
  fetchTreatmentPredictions: vi.fn().mockImplementation((patientId: string) => {
    if (!patientId) {
      return Promise.resolve(failure(new Error("No patient ID provided")));
    }
    const predictions = mockTreatmentPredictions.map(pred => ({...pred, patientId}));
    return Promise.resolve(success(predictions));
  }),

  // Implementation of existing method in the service
  submitBiometricAlert: vi.fn().mockImplementation((alert: BiometricAlert) => {
    if (!alert || !alert.id || !alert.patientId) {
      return Promise.resolve(failure(new Error("Invalid biometric alert data")));
    }
    return Promise.resolve(success(undefined));
  })
};
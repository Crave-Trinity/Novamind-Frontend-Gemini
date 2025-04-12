/* eslint-disable */
/**
 * @fileoverview Tests for runtime validation functions in usePatientData.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
// Import the specific validation function and relevant types
import { validatePatientData } from '@hooks/usePatientData.runtime';
import type {
  Patient,
  // Removed unused types: PatientDemographics, ClinicalData, TreatmentData, NeuralData, DataPermissions
  // Import nested types if needed for more specific invalid mocks
} from '@domain/types/clinical/patient';

// Helper to create a basic valid Patient object for testing
const createValidMockPatient = (): Patient => ({
  id: 'patient-123',
  demographicData: {
    // Required
    age: 35,
    biologicalSex: 'female',
    anonymizationLevel: 'clinical',
  },
  clinicalData: {
    // Required
    diagnoses: [],
    symptoms: [],
    medications: [],
    psychometricAssessments: [],
    medicalHistory: [],
  },
  treatmentData: {
    // Required
    currentTreatments: [],
    historicalTreatments: [],
    treatmentResponses: [],
  },
  neuralData: {
    // Required
    brainScans: [],
  },
  dataAccessPermissions: {
    // Required
    accessLevel: 'full',
    authorizedUsers: ['clinician-1'],
    consentStatus: 'full',
    dataRetentionPolicy: 'standard',
    lastReviewDate: new Date().toISOString(),
  },
  lastUpdated: new Date().toISOString(), // Required
  version: '1.0.0', // Required
});

describe('usePatientData Runtime Validation', () => {
  describe('validatePatientData', () => {
    it('should return Ok for a valid Patient object', () => {
      const validData = createValidMockPatient();
      const result = validatePatientData(validData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(validData); // Check structural equivalence
    });

    it('should return Err for non-object input', () => {
      const invalidData = 'patient-123';
      const result = validatePatientData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Invalid PatientData: Data does not conform to the Patient structure.'
      );
    });

    it('should return Err for null input', () => {
      const invalidData = null;
      const result = validatePatientData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Invalid PatientData: Data does not conform to the Patient structure.'
      );
    });

    it('should return Err for an empty object', () => {
      const invalidData = {};
      const result = validatePatientData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Invalid PatientData: Data does not conform to the Patient structure.'
      );
    });

    it('should return Err for data missing required top-level fields (e.g., id)', () => {
      const invalidData = {
        // Missing 'id' and others
        demographicData: {
          age: 40,
          biologicalSex: 'male',
          anonymizationLevel: 'research',
        },
        clinicalData: {
          diagnoses: [],
          symptoms: [],
          medications: [],
          psychometricAssessments: [],
          medicalHistory: [],
        },
        treatmentData: {
          currentTreatments: [],
          historicalTreatments: [],
          treatmentResponses: [],
        },
        neuralData: { brainScans: [] },
        dataAccessPermissions: {
          accessLevel: 'research',
          authorizedUsers: [],
          consentStatus: 'research-only',
          dataRetentionPolicy: 'research',
          lastReviewDate: '',
        },
        lastUpdated: '',
        version: '',
      };
      const result = validatePatientData(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'Invalid PatientData: Data does not conform to the Patient structure.'
      );
    });

    it('should return Err for data missing required nested fields (e.g., demographicData.age)', () => {
      const invalidData = createValidMockPatient();
      // @ts-expect-error - Intentionally creating invalid data for testing
      delete invalidData.demographicData.age;
      const result = validatePatientData(invalidData);
      // The enhanced guard should now catch this
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'Invalid PatientData: Data does not conform to the Patient structure.'
      );
    });

    it('should return Err for data with incorrect field types (e.g., id is number)', () => {
      const invalidData = {
        ...createValidMockPatient(),
        id: 123, // Incorrect type
      };
      const result = validatePatientData(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'Invalid PatientData: Data does not conform to the Patient structure.'
      );
    });

    it('should return Err for data with incorrect nested field types (e.g., clinicalData.diagnoses is not array)', () => {
      const invalidData = {
        ...createValidMockPatient(),
        clinicalData: {
          ...createValidMockPatient().clinicalData,
          diagnoses: 'not-an-array',
        },
      };
      const result = validatePatientData(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'Invalid PatientData: Data does not conform to the Patient structure.'
      );
    });
  });
});

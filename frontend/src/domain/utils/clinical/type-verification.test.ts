/**
 * NOVAMIND Neural-Safe Type Verification
 * Clinical-specific type verification utilities tests with quantum-level precision
 */

import { describe, it, expect } from 'vitest';
import { clinicalTypeVerifier } from './type-verification';
import { RiskLevel } from '../../types/clinical/risk-level';
import { TypeVerificationError } from '../shared/type-verification';

describe('Clinical type verification', () => {
  describe('verifyRiskLevel', () => {
    it('verifies valid RiskLevel values', () => {
      // Test each valid risk level
      Object.values(RiskLevel).forEach(level => {
        const result = clinicalTypeVerifier.verifyRiskLevel(level);
        expect(result.success).toBe(true);
        expect(result.value).toBe(level);
      });
    });
    
    it('fails on invalid RiskLevel values', () => {
      expect(clinicalTypeVerifier.verifyRiskLevel('INVALID_LEVEL').success).toBe(false);
      expect(clinicalTypeVerifier.verifyRiskLevel(null).success).toBe(false);
      expect(clinicalTypeVerifier.verifyRiskLevel(42).success).toBe(false);
    });
  });
  
  describe('verifySymptom', () => {
    it('verifies valid Symptom objects', () => {
      const validSymptom = {
        id: 'symptom1',
        name: 'Headache',
        severity: 3
      };
      
      const result = clinicalTypeVerifier.verifySymptom(validSymptom);
      expect(result.success).toBe(true);
      expect(result.value).toMatchObject({
        id: 'symptom1',
        name: 'Headache',
        severity: 3
      });
    });
    
    it('accepts optional properties', () => {
      const symptomWithOptionals = {
        id: 'symptom1',
        name: 'Headache',
        severity: 3,
        description: 'Throbbing pain in the temple area',
        onsetDate: new Date('2025-01-15'),
        frequency: 'daily'
      };
      
      const result = clinicalTypeVerifier.verifySymptom(symptomWithOptionals);
      expect(result.success).toBe(true);
      expect(result.value.description).toBe('Throbbing pain in the temple area');
      expect(result.value.frequency).toBe('daily');
    });
    
    it('fails when required properties are missing', () => {
      const missingProps = {
        id: 'symptom1',
        // missing name
        severity: 3
      };
      
      expect(clinicalTypeVerifier.verifySymptom(missingProps).success).toBe(false);
    });
    
    it('fails when properties have wrong types', () => {
      const wrongTypes = {
        id: 123, // should be string
        name: 'Headache',
        severity: '3' // should be number
      };
      
      expect(clinicalTypeVerifier.verifySymptom(wrongTypes).success).toBe(false);
    });
  });
  
  describe('verifyDiagnosis', () => {
    it('verifies valid Diagnosis objects', () => {
      const validDiagnosis = {
        id: 'diagnosis1',
        name: 'Migraine',
        diagnosisDate: new Date('2025-02-10')
      };
      
      const result = clinicalTypeVerifier.verifyDiagnosis(validDiagnosis);
      expect(result.success).toBe(true);
      expect(result.value).toMatchObject({
        id: 'diagnosis1',
        name: 'Migraine',
        diagnosisDate: expect.any(Date)
      });
    });
    
    it('accepts optional properties', () => {
      const diagnosisWithOptionals = {
        id: 'diagnosis1',
        name: 'Migraine',
        diagnosisDate: new Date('2025-02-10'),
        description: 'Chronic migraine with aura',
        icdCode: 'G43.109',
        severity: 4
      };
      
      const result = clinicalTypeVerifier.verifyDiagnosis(diagnosisWithOptionals);
      expect(result.success).toBe(true);
      expect(result.value.description).toBe('Chronic migraine with aura');
      expect(result.value.icdCode).toBe('G43.109');
      expect(result.value.severity).toBe(4);
    });
    
    it('fails when required properties are missing', () => {
      const missingProps = {
        id: 'diagnosis1',
        name: 'Migraine',
        // missing diagnosisDate
      };
      
      expect(clinicalTypeVerifier.verifyDiagnosis(missingProps).success).toBe(false);
    });
    
    it('fails when diagnosisDate is not a Date object', () => {
      const wrongDateType = {
        id: 'diagnosis1',
        name: 'Migraine',
        diagnosisDate: '2025-02-10' // should be Date object
      };
      
      expect(clinicalTypeVerifier.verifyDiagnosis(wrongDateType).success).toBe(false);
    });
  });
  
  describe('verifyTreatment', () => {
    it('verifies valid Treatment objects', () => {
      const validTreatment = {
        id: 'treatment1',
        name: 'Sumatriptan',
        type: 'medication'
      };
      
      const result = clinicalTypeVerifier.verifyTreatment(validTreatment);
      expect(result.success).toBe(true);
      expect(result.value).toMatchObject({
        id: 'treatment1',
        name: 'Sumatriptan',
        type: 'medication'
      });
    });
    
    it('accepts optional properties', () => {
      const treatmentWithOptionals = {
        id: 'treatment1',
        name: 'Sumatriptan',
        type: 'medication',
        description: 'For acute migraine attacks',
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-03-15'),
        dosage: '50mg',
        frequency: 'as needed'
      };
      
      const result = clinicalTypeVerifier.verifyTreatment(treatmentWithOptionals);
      expect(result.success).toBe(true);
      expect(result.value.description).toBe('For acute migraine attacks');
      expect(result.value.dosage).toBe('50mg');
      expect(result.value.frequency).toBe('as needed');
    });
    
    it('fails when required properties are missing', () => {
      const missingProps = {
        id: 'treatment1',
        // missing name
        type: 'medication'
      };
      
      expect(clinicalTypeVerifier.verifyTreatment(missingProps).success).toBe(false);
    });
  });
  
  describe('verifyTreatmentResponse', () => {
    it('verifies valid TreatmentResponse objects', () => {
      const validResponse = {
        id: 'response1',
        treatmentId: 'treatment1',
        effectiveness: 4,
        date: new Date('2025-03-01')
      };
      
      const result = clinicalTypeVerifier.verifyTreatmentResponse(validResponse);
      expect(result.success).toBe(true);
      expect(result.value).toMatchObject({
        id: 'response1',
        treatmentId: 'treatment1',
        effectiveness: 4,
        date: expect.any(Date)
      });
    });
    
    it('accepts optional properties', () => {
      const responseWithOptionals = {
        id: 'response1',
        treatmentId: 'treatment1',
        effectiveness: 4,
        date: new Date('2025-03-01'),
        notes: 'Pain relief within 30 minutes',
        sideEffects: ['drowsiness', 'nausea']
      };
      
      const result = clinicalTypeVerifier.verifyTreatmentResponse(responseWithOptionals);
      expect(result.success).toBe(true);
      expect(result.value.notes).toBe('Pain relief within 30 minutes');
      expect(result.value.sideEffects).toEqual(['drowsiness', 'nausea']);
    });
    
    it('fails when required properties are missing', () => {
      const missingProps = {
        id: 'response1',
        treatmentId: 'treatment1',
        // missing effectiveness
        date: new Date('2025-03-01')
      };
      
      expect(clinicalTypeVerifier.verifyTreatmentResponse(missingProps).success).toBe(false);
    });
    
    it('fails when date is not a Date object', () => {
      const wrongDateType = {
        id: 'response1',
        treatmentId: 'treatment1',
        effectiveness: 4,
        date: '2025-03-01' // should be Date object
      };
      
      expect(clinicalTypeVerifier.verifyTreatmentResponse(wrongDateType).success).toBe(false);
    });
  });
  
  describe('verifyPatient', () => {
    it('verifies valid Patient objects', () => {
      const validPatient = {
        id: 'patient1',
        firstName: 'John',
        lastName: 'Smith',
        symptoms: [],
        diagnoses: [],
        treatments: [],
        treatmentResponses: []
      };
      
      const result = clinicalTypeVerifier.verifyPatient(validPatient);
      expect(result.success).toBe(true);
      expect(result.value).toMatchObject({
        id: 'patient1',
        firstName: 'John',
        lastName: 'Smith',
        symptoms: [],
        diagnoses: [],
        treatments: [],
        treatmentResponses: []
      });
    });
    
    it('accepts optional properties', () => {
      const patientWithOptionals = {
        id: 'patient1',
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: new Date('1980-05-15'),
        contactInfo: {
          email: 'john.smith@example.com',
          phone: '555-123-4567'
        },
        symptoms: [],
        diagnoses: [],
        treatments: [],
        treatmentResponses: []
      };
      
      const result = clinicalTypeVerifier.verifyPatient(patientWithOptionals);
      expect(result.success).toBe(true);
      expect(result.value.dateOfBirth).toBeInstanceOf(Date);
      expect(result.value.contactInfo).toEqual({
        email: 'john.smith@example.com',
        phone: '555-123-4567'
      });
    });
    
    it('verifies arrays of clinical data', () => {
      const patientWithArrays = {
        id: 'patient1',
        firstName: 'John',
        lastName: 'Smith',
        symptoms: [
          { id: 'symptom1', name: 'Headache', severity: 3 }
        ],
        diagnoses: [
          { id: 'diagnosis1', name: 'Migraine', diagnosisDate: new Date('2025-02-10') }
        ],
        treatments: [
          { id: 'treatment1', name: 'Sumatriptan', type: 'medication' }
        ],
        treatmentResponses: [
          { 
            id: 'response1', 
            treatmentId: 'treatment1', 
            effectiveness: 4, 
            date: new Date('2025-03-01') 
          }
        ]
      };
      
      const result = clinicalTypeVerifier.verifyPatient(patientWithArrays);
      expect(result.success).toBe(true);
      expect(result.value.symptoms).toHaveLength(1);
      expect(result.value.diagnoses).toHaveLength(1);
      expect(result.value.treatments).toHaveLength(1);
      expect(result.value.treatmentResponses).toHaveLength(1);
    });
    
    it('fails when required properties are missing', () => {
      const missingProps = {
        id: 'patient1',
        // missing firstName
        lastName: 'Smith',
        symptoms: [],
        diagnoses: [],
        treatments: [],
        treatmentResponses: []
      };
      
      expect(clinicalTypeVerifier.verifyPatient(missingProps).success).toBe(false);
    });
    
    it('fails when arrays contain invalid items', () => {
      const invalidArrayItems = {
        id: 'patient1',
        firstName: 'John',
        lastName: 'Smith',
        symptoms: [
          { id: 'symptom1' } // Missing required properties
        ],
        diagnoses: [],
        treatments: [],
        treatmentResponses: []
      };
      
      expect(clinicalTypeVerifier.verifyPatient(invalidArrayItems).success).toBe(false);
    });
  });
  
  describe('assertion functions', () => {
    it('assertRiskLevel passes for valid RiskLevel', () => {
      expect(() => clinicalTypeVerifier.assertRiskLevel(RiskLevel.LOW)).not.toThrow();
    });
    
    it('assertRiskLevel throws for invalid RiskLevel', () => {
      expect(() => clinicalTypeVerifier.assertRiskLevel('INVALID_LEVEL'))
        .toThrow(TypeVerificationError);
    });
    
    it('assertSymptom passes for valid Symptom', () => {
      const validSymptom = {
        id: 'symptom1',
        name: 'Headache',
        severity: 3
      };
      
      expect(() => clinicalTypeVerifier.assertSymptom(validSymptom)).not.toThrow();
    });
    
    it('assertSymptom throws for invalid Symptom', () => {
      const invalidSymptom = {
        id: 'symptom1',
        // Missing required properties
      };
      
      expect(() => clinicalTypeVerifier.assertSymptom(invalidSymptom))
        .toThrow(TypeVerificationError);
    });
    
    it('assertPatient passes for valid Patient', () => {
      const validPatient = {
        id: 'patient1',
        firstName: 'John',
        lastName: 'Smith',
        symptoms: [],
        diagnoses: [],
        treatments: [],
        treatmentResponses: []
      };
      
      expect(() => clinicalTypeVerifier.assertPatient(validPatient)).not.toThrow();
    });
    
    it('assertPatient throws for invalid Patient', () => {
      const invalidPatient = {
        id: 'patient1',
        // Missing required properties
      };
      
      expect(() => clinicalTypeVerifier.assertPatient(invalidPatient))
        .toThrow(TypeVerificationError);
    });
  });
});

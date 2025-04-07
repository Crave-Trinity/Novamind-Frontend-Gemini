/**
 * NOVAMIND Type Testing Framework
 * Patient Model Type Tests
 *
 * This file implements static type checking without runtime assertions.
 */

import { describe, it, expectTypeOf } from 'vitest';
import type {
  PatientDemographics,
  ClinicalHistory,
  Medication,
  Symptom,
  TreatmentResponse,
  PatientModel,
} from '@domain/models/clinical/patient-model';

describe('Patient Model type definitions', () => {
  it('PatientDemographics has correct structure', () => {
    expectTypeOf<PatientDemographics>().toHaveProperty('age').toEqualTypeOf<number>();
    expectTypeOf<PatientDemographics>()
      .toHaveProperty('biologicalSex')
      .toEqualTypeOf<'male' | 'female' | 'other'>();
    expectTypeOf<PatientDemographics>().toHaveProperty('heightCm').toBeNullable();
    expectTypeOf<PatientDemographics>().toHaveProperty('weightKg').toBeNullable();
    expectTypeOf<PatientDemographics>().toHaveProperty('handedness').toBeNullable();
    expectTypeOf<PatientDemographics>().toHaveProperty('ethnicity').toBeNullable();
  });

  it('ClinicalHistory has correct structure', () => {
    expectTypeOf<ClinicalHistory>().toHaveProperty('primaryDiagnosis').toEqualTypeOf<string>();
    expectTypeOf<ClinicalHistory>().toHaveProperty('secondaryDiagnoses').toBeNullable();
    expectTypeOf<ClinicalHistory>().toHaveProperty('diagnosisDate').toBeNullable();
    expectTypeOf<ClinicalHistory>().toHaveProperty('familyHistory').toBeNullable();
    expectTypeOf<ClinicalHistory>().toHaveProperty('previousTreatments').toBeNullable();
    expectTypeOf<ClinicalHistory>().toHaveProperty('allergies').toBeNullable();
  });

  it('Medication has correct structure', () => {
    expectTypeOf<Medication>().toHaveProperty('id').toEqualTypeOf<string>();
    expectTypeOf<Medication>().toHaveProperty('name').toEqualTypeOf<string>();
    expectTypeOf<Medication>().toHaveProperty('dosage').toEqualTypeOf<string>();
    expectTypeOf<Medication>().toHaveProperty('frequency').toEqualTypeOf<string>();
    expectTypeOf<Medication>().toHaveProperty('startDate').toEqualTypeOf<Date>();
    expectTypeOf<Medication>().toHaveProperty('endDate').toBeNullable();
    expectTypeOf<Medication>().toHaveProperty('prescribedBy').toBeNullable();
    expectTypeOf<Medication>().toHaveProperty('purpose').toBeNullable();
    expectTypeOf<Medication>().toHaveProperty('adherenceRate').toBeNullable();
    expectTypeOf<Medication>().toHaveProperty('sideEffects').toBeNullable();
  });

  it('Symptom has correct structure', () => {
    expectTypeOf<Symptom>().toHaveProperty('id').toEqualTypeOf<string>();
    expectTypeOf<Symptom>().toHaveProperty('name').toEqualTypeOf<string>();
    expectTypeOf<Symptom>().toHaveProperty('severity').toEqualTypeOf<number>();
    expectTypeOf<Symptom>()
      .toHaveProperty('frequency')
      .toEqualTypeOf<'rare' | 'occasional' | 'frequent' | 'constant'>();
    expectTypeOf<Symptom>().toHaveProperty('firstObserved').toEqualTypeOf<Date>();
    expectTypeOf<Symptom>().toHaveProperty('triggers').toBeNullable();
    expectTypeOf<Symptom>().toHaveProperty('notes').toBeNullable();
  });

  it('TreatmentResponse has correct structure', () => {
    expectTypeOf<TreatmentResponse>().toHaveProperty('treatmentId').toEqualTypeOf<string>();
    expectTypeOf<TreatmentResponse>().toHaveProperty('treatmentName').toEqualTypeOf<string>();
    expectTypeOf<TreatmentResponse>().toHaveProperty('startDate').toEqualTypeOf<Date>();
    expectTypeOf<TreatmentResponse>().toHaveProperty('endDate').toBeNullable();
    expectTypeOf<TreatmentResponse>().toHaveProperty('effectivenesRating').toEqualTypeOf<number>();
    expectTypeOf<TreatmentResponse>().toHaveProperty('sideEffects').toBeNullable();
    expectTypeOf<TreatmentResponse>().toHaveProperty('notes').toBeNullable();
  });

  it('PatientModel has correct structure', () => {
    expectTypeOf<PatientModel>().toHaveProperty('id').toEqualTypeOf<string>();
    expectTypeOf<PatientModel>().toHaveProperty('firstName').toEqualTypeOf<string>();
    expectTypeOf<PatientModel>().toHaveProperty('lastName').toEqualTypeOf<string>();
    expectTypeOf<PatientModel>().toHaveProperty('dateOfBirth').toEqualTypeOf<Date>();
    expectTypeOf<PatientModel>().toHaveProperty('contactInformation').toBeObject();
    expectTypeOf<PatientModel>()
      .toHaveProperty('demographics')
      .toEqualTypeOf<PatientDemographics>();
    expectTypeOf<PatientModel>().toHaveProperty('clinicalHistory').toEqualTypeOf<ClinicalHistory>();
    expectTypeOf<PatientModel>().toHaveProperty('medications').toEqualTypeOf<Medication[]>();
    expectTypeOf<PatientModel>().toHaveProperty('symptoms').toEqualTypeOf<Symptom[]>();
    expectTypeOf<PatientModel>()
      .toHaveProperty('treatmentResponses')
      .toEqualTypeOf<TreatmentResponse[]>();
    expectTypeOf<PatientModel>().toHaveProperty('brainModels').toBeNullable();
    expectTypeOf<PatientModel>().toHaveProperty('version').toEqualTypeOf<number>();
    expectTypeOf<PatientModel>().toHaveProperty('lastUpdated').toEqualTypeOf<Date>();
    expectTypeOf<PatientModel>().toHaveProperty('createdBy').toEqualTypeOf<string>();
    expectTypeOf<PatientModel>().toHaveProperty('updatedBy').toBeNullable();
  });
});

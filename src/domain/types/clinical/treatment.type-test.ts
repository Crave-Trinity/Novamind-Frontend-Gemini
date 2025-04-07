/**
 * NOVAMIND Type Testing Framework
 * Treatment Type Tests
 *
 * This file implements static type checking without runtime assertions.
 */

import { describe, it, expectTypeOf } from 'vitest';
import type {
  TreatmentType,
  TreatmentResponseRequest,
  TreatmentDetails,
  ClinicalPredictionData,
  GeneticPredictionData,
  BiomarkerData,
  TreatmentPredictionVisualizationSettings,
  TreatmentPredictionState,
  TreatmentComparisonState,
} from '@domain/types/clinical/treatment';
// Removed unused import: NeuroimagingFeatures

describe('Treatment type definitions', () => {
  it('TreatmentType has correct literal union types', () => {
    expectTypeOf<TreatmentType>().toEqualTypeOf<
      | 'pharmacological'
      | 'psychotherapy'
      | 'neuromodulation'
      | 'neurofeedback'
      | 'lifestyle_intervention'
      | 'combination'
    >();
  });

  it('TreatmentResponseRequest has correct structure', () => {
    expectTypeOf<TreatmentResponseRequest>().toHaveProperty('patient_id').toEqualTypeOf<string>();
    expectTypeOf<TreatmentResponseRequest>()
      .toHaveProperty('treatment_type')
      .toEqualTypeOf<TreatmentType>();
    expectTypeOf<TreatmentResponseRequest>()
      .toHaveProperty('treatment_details')
      .toEqualTypeOf<TreatmentDetails>();
    expectTypeOf<TreatmentResponseRequest>()
      .toHaveProperty('clinical_data')
      .toEqualTypeOf<ClinicalPredictionData>();
    expectTypeOf<TreatmentResponseRequest>().toHaveProperty('genetic_data').toBeNullable();
    expectTypeOf<TreatmentResponseRequest>().toHaveProperty('biomarker_data').toBeNullable();
    expectTypeOf<TreatmentResponseRequest>().toHaveProperty('neuroimaging_features').toBeNullable();
  });

  it('TreatmentDetails has correct structure and nested properties', () => {
    expectTypeOf<TreatmentDetails>().toHaveProperty('medication').toBeNullable();
    expectTypeOf<TreatmentDetails>().toHaveProperty('psychotherapy').toBeNullable();
    expectTypeOf<TreatmentDetails>().toHaveProperty('neuromodulation').toBeNullable();
    expectTypeOf<TreatmentDetails>().toHaveProperty('neurofeedback').toBeNullable();
    expectTypeOf<TreatmentDetails>().toHaveProperty('lifestyle').toBeNullable();
    expectTypeOf<TreatmentDetails>().toHaveProperty('combination').toBeNullable();

    // Test nested types for medication
    expectTypeOf<TreatmentDetails['medication']>().toMatchTypeOf<
      | {
          name: string;
          class: string;
          dosage: string;
          frequency: string;
          duration: string;
          previousExposure: boolean;
        }
      | undefined
    >();

    // Test psychotherapy type literals
    expectTypeOf<NonNullable<TreatmentDetails['psychotherapy']>['type']>().toEqualTypeOf<
      'cbt' | 'dbt' | 'psychodynamic' | 'interpersonal' | 'emdr' | 'act' | 'other'
    >();

    // Test neuromodulation type literals
    expectTypeOf<NonNullable<TreatmentDetails['neuromodulation']>['type']>().toEqualTypeOf<
      'tms' | 'ect' | 'tdcs' | 'dbs' | 'vns' | 'other'
    >();
  });

  it('ClinicalPredictionData has correct structure', () => {
    expectTypeOf<ClinicalPredictionData>().toHaveProperty('diagnosis').toEqualTypeOf<string[]>();
    expectTypeOf<ClinicalPredictionData>()
      .toHaveProperty('symptomSeverity')
      .toEqualTypeOf<Record<string, number>>();
    expectTypeOf<ClinicalPredictionData>()
      .toHaveProperty('illnessDuration')
      .toEqualTypeOf<number>();
    expectTypeOf<ClinicalPredictionData>().toHaveProperty('previousTreatmentResponses').toBeArray();
    expectTypeOf<ClinicalPredictionData>()
      .toHaveProperty('comorbidities')
      .toEqualTypeOf<string[]>();
    expectTypeOf<ClinicalPredictionData>()
      .toHaveProperty('currentMedications')
      .toEqualTypeOf<string[]>();
    expectTypeOf<ClinicalPredictionData>()
      .toHaveProperty('functionalImpairment')
      .toEqualTypeOf<'none' | 'mild' | 'moderate' | 'severe'>();
    expectTypeOf<ClinicalPredictionData>()
      .toHaveProperty('suicidalIdeation')
      .toEqualTypeOf<boolean>();
    expectTypeOf<ClinicalPredictionData>().toHaveProperty('substanceUse').toEqualTypeOf<boolean>();
  });

  it('GeneticPredictionData has correct structure', () => {
    expectTypeOf<GeneticPredictionData>().toHaveProperty('metabolizerStatus').toBeNullable();
    expectTypeOf<GeneticPredictionData>().toHaveProperty('pharmacodynamicMarkers').toBeNullable();
    expectTypeOf<GeneticPredictionData>().toHaveProperty('riskVariants').toBeNullable();
    expectTypeOf<GeneticPredictionData>().toHaveProperty('protectiveVariants').toBeNullable();
    expectTypeOf<GeneticPredictionData>()
      .toHaveProperty('genotypePredictedPhenotypes')
      .toBeNullable();

    // Test nested metabolizer status types
    expectTypeOf<NonNullable<GeneticPredictionData['metabolizerStatus']>['cyp2d6']>().toEqualTypeOf<
      'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid' | undefined
    >();
  });

  it('BiomarkerData has correct structure', () => {
    expectTypeOf<BiomarkerData>().toHaveProperty('inflammatoryMarkers').toBeNullable();
    expectTypeOf<BiomarkerData>().toHaveProperty('metabolicMarkers').toBeNullable();
    expectTypeOf<BiomarkerData>().toHaveProperty('endocrineMarkers').toBeNullable();
    expectTypeOf<BiomarkerData>().toHaveProperty('neurotransmitterMetabolites').toBeNullable();
    expectTypeOf<BiomarkerData>().toHaveProperty('oxidativeStressMarkers').toBeNullable();
    expectTypeOf<BiomarkerData>().toHaveProperty('microbiomeProfile').toBeNullable();
  });

  it('TreatmentPredictionVisualizationSettings has correct structure', () => {
    expectTypeOf<TreatmentPredictionVisualizationSettings>()
      .toHaveProperty('colorScale')
      .toBeObject();
    expectTypeOf<TreatmentPredictionVisualizationSettings>()
      .toHaveProperty('confidenceIntervalDisplay')
      .toEqualTypeOf<'always' | 'on_hover' | 'on_click' | 'never'>();
    expectTypeOf<TreatmentPredictionVisualizationSettings>()
      .toHaveProperty('timeScale')
      .toEqualTypeOf<'days' | 'weeks' | 'months'>();
    expectTypeOf<TreatmentPredictionVisualizationSettings>()
      .toHaveProperty('symptomDisplayLimit')
      .toEqualTypeOf<number>();
    expectTypeOf<TreatmentPredictionVisualizationSettings>()
      .toHaveProperty('comparativeDisplay')
      .toEqualTypeOf<'table' | 'chart' | 'grid'>();
    expectTypeOf<TreatmentPredictionVisualizationSettings>()
      .toHaveProperty('personalizedFactorVisualization')
      .toEqualTypeOf<boolean>();
  });

  it('TreatmentPredictionState has correct discriminated union', () => {
    // Test each state variant explicitly
    type IdlePredState = Extract<TreatmentPredictionState, { status: 'idle' }>;
    expectTypeOf<IdlePredState>().toHaveProperty('status').toEqualTypeOf<'idle'>();

    type LoadingPredState = Extract<TreatmentPredictionState, { status: 'loading' }>;
    expectTypeOf<LoadingPredState>().toHaveProperty('status').toEqualTypeOf<'loading'>();

    type ErrorPredState = Extract<TreatmentPredictionState, { status: 'error' }>;
    expectTypeOf<ErrorPredState>().toHaveProperty('status').toEqualTypeOf<'error'>();
    expectTypeOf<ErrorPredState>().toHaveProperty('error').toEqualTypeOf<Error>();

    type SuccessPredState = Extract<TreatmentPredictionState, { status: 'success' }>;
    expectTypeOf<SuccessPredState>().toHaveProperty('status').toEqualTypeOf<'success'>();
    // Cannot test prediction type precisely without importing TreatmentResponsePrediction
    expectTypeOf<SuccessPredState>().toHaveProperty('prediction');
  });

  it('TreatmentComparisonState has correct discriminated union', () => {
    // Test each state variant explicitly
    type IdleCompState = Extract<TreatmentComparisonState, { status: 'idle' }>;
    expectTypeOf<IdleCompState>().toHaveProperty('status').toEqualTypeOf<'idle'>();

    type LoadingCompState = Extract<TreatmentComparisonState, { status: 'loading' }>;
    expectTypeOf<LoadingCompState>().toHaveProperty('status').toEqualTypeOf<'loading'>();

    type ErrorCompState = Extract<TreatmentComparisonState, { status: 'error' }>;
    expectTypeOf<ErrorCompState>().toHaveProperty('status').toEqualTypeOf<'error'>();
    expectTypeOf<ErrorCompState>().toHaveProperty('error').toEqualTypeOf<Error>();

    type SuccessCompState = Extract<TreatmentComparisonState, { status: 'success' }>;
    expectTypeOf<SuccessCompState>().toHaveProperty('status').toEqualTypeOf<'success'>();
    // Cannot test comparison type precisely without importing TreatmentComparisonResult
    expectTypeOf<SuccessCompState>().toHaveProperty('comparison');
  });
});

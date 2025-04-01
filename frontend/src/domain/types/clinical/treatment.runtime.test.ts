/**
 * NOVAMIND Neural Test Suite
 * Treatment runtime validators testing with quantum precision
 */

import { describe, it, expect } from 'vitest';
import { 
  TreatmentTypeValidator,
  TreatmentResponseRequestValidator,
  TreatmentDetailsValidator,
  ClinicalPredictionDataValidator,
  GeneticPredictionDataValidator,
  BiomarkerDataValidator,
  TreatmentResponsePredictionValidator,
  TreatmentComparisonResultValidator
} from './treatment.runtime';

describe('Treatment runtime validators', () => {
  it('TreatmentTypeValidator validates correct treatment types', () => {
    // Valid treatment types
    expect(TreatmentTypeValidator.isValid('pharmacological')).toBe(true);
    expect(TreatmentTypeValidator.isValid('psychotherapy')).toBe(true);
    expect(TreatmentTypeValidator.isValid('neuromodulation')).toBe(true);
    expect(TreatmentTypeValidator.isValid('neurofeedback')).toBe(true);
    expect(TreatmentTypeValidator.isValid('lifestyle_intervention')).toBe(true);
    expect(TreatmentTypeValidator.isValid('combination')).toBe(true);
    
    // Invalid values
    expect(TreatmentTypeValidator.isValid('invalid_type')).toBe(false);
    expect(TreatmentTypeValidator.isValid(123)).toBe(false);
    expect(TreatmentTypeValidator.isValid(null)).toBe(false);
    expect(TreatmentTypeValidator.isValid(undefined)).toBe(false);
  });

  it('TreatmentResponseRequestValidator validates correct TreatmentResponseRequest objects', () => {
    const validRequest = {
      patient_id: 'patient-123',
      treatment_type: 'pharmacological',
      treatment_details: {
        medication: {
          name: 'Sertraline',
          class: 'SSRI',
          dosage: '50mg',
          frequency: 'daily',
          duration: '12 weeks',
          previousExposure: false
        }
      },
      clinical_data: {
        diagnosis: ['F41.1'],
        symptomSeverity: { 'anxiety': 7, 'depression': 5 },
        illnessDuration: 6,
        previousTreatmentResponses: [],
        comorbidities: [],
        currentMedications: [],
        functionalImpairment: 'moderate',
        suicidalIdeation: false,
        substanceUse: false
      }
    };

    const invalidRequest = {
      patient_id: 'patient-123',
      treatment_type: 'invalid_type',
      // Missing required fields
    };

    expect(TreatmentResponseRequestValidator.isValid(validRequest)).toBe(true);
    expect(TreatmentResponseRequestValidator.isValid(invalidRequest)).toBe(false);
    expect(TreatmentResponseRequestValidator.isValid(null)).toBe(false);
    expect(TreatmentResponseRequestValidator.isValid(123)).toBe(false);
  });

  it('TreatmentDetailsValidator validates correct TreatmentDetails objects', () => {
    // Valid treatment details with medication
    const validMedicationDetails = {
      medication: {
        name: 'Sertraline',
        class: 'SSRI',
        dosage: '50mg',
        frequency: 'daily',
        duration: '12 weeks',
        previousExposure: false
      }
    };

    // Valid treatment details with psychotherapy
    const validPsychotherapyDetails = {
      psychotherapy: {
        type: 'cbt',
        frequency: 'weekly',
        duration: '12 sessions',
        modality: 'individual',
        specificProtocol: 'Anxiety Protocol',
        previousExposure: false
      }
    };

    // Valid treatment details with neuromodulation
    const validNeuromodulationDetails = {
      neuromodulation: {
        type: 'tms',
        targetRegions: ['dlPFC'],
        parameters: {
          frequency: 10,
          intensity: 120,
          duration: 20,
          sessions: 30
        },
        previousExposure: false
      }
    };

    // Invalid details - empty object
    const invalidEmptyDetails = {};

    expect(TreatmentDetailsValidator.isValid(validMedicationDetails)).toBe(true);
    expect(TreatmentDetailsValidator.isValid(validPsychotherapyDetails)).toBe(true);
    expect(TreatmentDetailsValidator.isValid(validNeuromodulationDetails)).toBe(true);
    expect(TreatmentDetailsValidator.isValid(invalidEmptyDetails)).toBe(false);
    expect(TreatmentDetailsValidator.isValid(null)).toBe(false);
  });

  it('TreatmentDetailsValidator.isValidMedication validates medication details', () => {
    const validMedication = {
      name: 'Sertraline',
      class: 'SSRI',
      dosage: '50mg',
      frequency: 'daily',
      duration: '12 weeks',
      previousExposure: false
    };

    const invalidMedication = {
      name: 'Sertraline',
      // Missing required fields
    };

    expect(TreatmentDetailsValidator.isValidMedication(validMedication)).toBe(true);
    expect(TreatmentDetailsValidator.isValidMedication(invalidMedication)).toBe(false);
  });

  it('ClinicalPredictionDataValidator validates correct ClinicalPredictionData objects', () => {
    const validClinicalData = {
      diagnosis: ['F41.1'],
      symptomSeverity: { 'anxiety': 7, 'depression': 5 },
      illnessDuration: 6,
      previousTreatmentResponses: [
        { treatmentType: 'SSRI', response: 'partial' }
      ],
      comorbidities: ['insomnia'],
      currentMedications: ['melatonin'],
      functionalImpairment: 'moderate',
      suicidalIdeation: false,
      substanceUse: false
    };

    const invalidClinicalData = {
      diagnosis: 'F41.1', // Should be array
      symptomSeverity: { 'anxiety': 7, 'depression': 5 },
      illnessDuration: 6,
      // Missing required fields
    };

    expect(ClinicalPredictionDataValidator.isValid(validClinicalData)).toBe(true);
    expect(ClinicalPredictionDataValidator.isValid(invalidClinicalData)).toBe(false);
    expect(ClinicalPredictionDataValidator.isValid(null)).toBe(false);
  });

  it('GeneticPredictionDataValidator validates correct GeneticPredictionData objects', () => {
    const validGeneticData = {
      metabolizerStatus: {
        cyp2d6: 'normal',
        cyp2c19: 'intermediate',
        cyp3a4: 'rapid',
        cyp1a2: 'normal'
      },
      pharmacodynamicMarkers: { 'HTR2A': 'T/T' },
      riskVariants: ['BDNF Val66Met'],
      protectiveVariants: ['COMT Val158Met'],
    };

    // Invalid metabolizer status
    const invalidMetabolizerStatus = {
      metabolizerStatus: {
        cyp2d6: 'invalid_status', // Invalid value
      }
    };

    expect(GeneticPredictionDataValidator.isValid(validGeneticData)).toBe(true);
    expect(GeneticPredictionDataValidator.isValidMetabolizerStatus(validGeneticData.metabolizerStatus)).toBe(true);
    expect(GeneticPredictionDataValidator.isValidMetabolizerStatus(invalidMetabolizerStatus.metabolizerStatus)).toBe(false);
  });

  it('BiomarkerDataValidator validates correct BiomarkerData objects', () => {
    const validBiomarkerData = {
      inflammatoryMarkers: { 'CRP': 2.5, 'IL-6': 3.1 },
      metabolicMarkers: { 'BDNF': 1200 },
    };

    const invalidBiomarkerData = {};

    expect(BiomarkerDataValidator.isValid(validBiomarkerData)).toBe(true);
    expect(BiomarkerDataValidator.isValid(invalidBiomarkerData)).toBe(false);
    expect(BiomarkerDataValidator.isValid(null)).toBe(false);
  });

  it('TreatmentResponsePredictionValidator validates correct TreatmentResponsePrediction objects', () => {
    const validPrediction = {
      patientId: 'patient-123',
      treatmentType: 'pharmacological',
      treatmentDetails: {
        medication: {
          name: 'Sertraline',
          class: 'SSRI',
          dosage: '50mg',
          frequency: 'daily',
          duration: '12 weeks'
        }
      },
      prediction: {
        responseProbability: 0.75,
        timeToResponse: 21,
        confidenceInterval: [0.65, 0.85],
        relapseProbability: 0.25
      },
      sideEffectRisks: [
        { effect: 'nausea', probability: 0.2, severity: 'mild' }
      ],
      symptomSpecificPredictions: [
        { symptom: 'anxiety', expectedImprovement: 0.6, timeToImprovement: 14 }
      ]
    };

    const invalidPrediction = {
      patientId: 'patient-123',
      // Missing required fields
    };

    expect(TreatmentResponsePredictionValidator.isValid(validPrediction)).toBe(true);
    expect(TreatmentResponsePredictionValidator.isValid(invalidPrediction)).toBe(false);
    expect(TreatmentResponsePredictionValidator.isValid(null)).toBe(false);
  });

  it('TreatmentComparisonResultValidator validates correct TreatmentComparisonResult objects', () => {
    const validComparison = {
      patientId: 'patient-123',
      comparedTreatments: [
        { id: 1, type: 'pharmacological', name: 'Sertraline' },
        { id: 2, type: 'psychotherapy', name: 'CBT' }
      ],
      efficacyComparison: {
        overallEfficacy: [0.75, 0.65],
        timeToResponse: [21, 35],
        symptomSpecific: {
          anxiety: [0.8, 0.7],
          depression: [0.6, 0.5]
        }
      },
      sideEffectComparison: {
        overall: [0.3, 0.1],
        specific: {
          nausea: [0.2, 0.0],
          insomnia: [0.15, 0.1]
        }
      },
      recommendationSummary: {
        primaryRecommendation: 0,
        rationale: 'Better efficacy and tolerable side effects',
        confidenceLevel: 'high',
        alternativeOptions: [1]
      }
    };

    const invalidComparison = {
      patientId: 'patient-123',
      // Missing required fields
    };

    expect(TreatmentComparisonResultValidator.isValid(validComparison)).toBe(true);
    expect(TreatmentComparisonResultValidator.isValid(invalidComparison)).toBe(false);
    expect(TreatmentComparisonResultValidator.isValid(null)).toBe(false);
  });
});

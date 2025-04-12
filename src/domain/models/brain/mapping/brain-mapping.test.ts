/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite
 * calculateNeuralActivation testing with quantum precision
 */

import { describe, it, expect } from 'vitest'; // Removed unused: vi

import { calculateNeuralActivation } from '@domain/models/brain/mapping/brain-mapping.ts'; // Correct alias and add .ts
// Import necessary types
import type { BrainRegion } from '@domain/types/brain/models';
import type { Symptom, Diagnosis } from '@domain/types/clinical/patient';
import type {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
} from '@domain/models/brain/mapping/brain-mapping.ts';
// Removed unused import: NeuralActivationPattern
describe('calculateNeuralActivation', () => {
  // --- Mock Data ---
  const mockRegions: BrainRegion[] = [
    // Corrected: Use 'position', remove 'significance'. Added missing properties.
    {
      id: 'r1',
      name: 'Region 1',
      position: { x: 0, y: 0, z: 0 },
      activityLevel: 0,
      isActive: false,
      color: '',
      connections: [],
      hemisphereLocation: 'left',
      dataConfidence: 1,
      volume: 100, // Added missing property
      activity: 0, // Added missing property
    },
    {
      id: 'r2',
      name: 'Region 2',
      position: { x: 1, y: 1, z: 1 },
      activityLevel: 0,
      isActive: false,
      color: '',
      connections: [],
      hemisphereLocation: 'right',
      dataConfidence: 1,
      volume: 100, // Added missing property
      activity: 0, // Added missing property
    },
    {
      id: 'r3',
      name: 'Region 3',
      position: { x: -1, y: -1, z: -1 },
      activityLevel: 0,
      isActive: false,
      color: '',
      connections: [],
      hemisphereLocation: 'central',
      dataConfidence: 1,
      volume: 100, // Added missing property
      activity: 0, // Added missing property
    },
  ];

  const mockSymptomMappings: SymptomNeuralMapping[] = [
    {
      symptomId: 's1',
      symptomName: 'Anxiety',
      category: 'Emotional',
      evidenceQuality: 'established',
      contributingFactors: [],
      activationPatterns: [
        {
          regionIds: ['r1'],
          intensity: 0.8,
          confidence: 0.9,
          timeScale: 'acute',
          connectivity: { increasedPathways: [], decreasedPathways: [] },
        }, // r1 activation = 0.8 * 0.9 = 0.72
        {
          regionIds: ['r2'],
          intensity: 0.5,
          confidence: 0.7,
          timeScale: 'acute',
          connectivity: { increasedPathways: [], decreasedPathways: [] },
        }, // r2 activation = 0.5 * 0.7 = 0.35
      ],
    },
    {
      symptomId: 's2',
      symptomName: 'Insomnia',
      category: 'Sleep',
      evidenceQuality: 'probable',
      contributingFactors: [],
      activationPatterns: [
        {
          regionIds: ['r2'],
          intensity: 0.6,
          confidence: 0.8,
          timeScale: 'chronic',
          connectivity: { increasedPathways: [], decreasedPathways: [] },
        }, // r2 activation = 0.6 * 0.8 = 0.48
      ],
    },
  ];

  const mockDiagnosisMappings: DiagnosisNeuralMapping[] = [
    {
      diagnosisId: 'd1',
      diagnosisName: 'MDD',
      codingSystem: 'ICD-10',
      evidenceQuality: 'established',
      activationPatterns: [
        {
          regionIds: ['r1'],
          intensity: 0.7,
          confidence: 0.85,
          timeScale: 'chronic',
          connectivity: { increasedPathways: [], decreasedPathways: [] },
        }, // r1 activation = 0.7 * 0.85 = 0.595
        {
          regionIds: ['r3'],
          intensity: 0.4,
          confidence: 0.6,
          timeScale: 'chronic',
          connectivity: { increasedPathways: [], decreasedPathways: [] },
        }, // r3 activation = 0.4 * 0.6 = 0.24
      ],
    },
  ];

  const mockActiveSymptoms: Symptom[] = [
    // Corrected: Use ISO string for dates, remove lastUpdated, fix category. Added missing required properties.
    {
      id: 's1',
      name: 'Anxiety',
      severity: 7,
      onsetDate: new Date().toISOString(),
      category: 'affective',
      frequency: 'daily',
      impact: 'moderate',
      progression: 'stable',
    },
    {
      id: 's2',
      name: 'Insomnia',
      severity: 5,
      onsetDate: new Date().toISOString(),
      category: 'behavioral',
      frequency: 'daily',
      impact: 'moderate',
      progression: 'stable',
    }, // Changed category
  ];

  const mockActiveDiagnoses: Diagnosis[] = [
    // Corrected: Use ISO string for dates. Added missing required properties.
    {
      id: 'd1',
      name: 'MDD',
      code: 'F33.1',
      codingSystem: 'ICD-10',
      severity: 'moderate',
      onsetDate: new Date().toISOString(),
      diagnosisDate: new Date().toISOString(),
      status: 'active',
    },
  ];

  it('should calculate activation based on symptoms only', () => {
    const result = calculateNeuralActivation(mockRegions, mockSymptomMappings, mockActiveSymptoms);
    expect(result.success).toBe(true);
    if (!result.success) throw result.error; // Check success before accessing data
    const activationMap = result.value; // Corrected back to .value

    // Expected calculations:
    // r1: sqrt(0^2 + (0.7 * 0.72)^2) = sqrt(0.504^2) = 0.504
    // r2: sqrt(0^2 + (0.7 * 0.35)^2 + (0.5 * 0.48)^2) = sqrt(0.245^2 + 0.24^2) = sqrt(0.060025 + 0.0576) = sqrt(0.117625) approx 0.343
    // r3: 0 (no symptom mapping)
    expect(activationMap.get('r1')).toBeCloseTo(0.7 * 0.8 * 0.9); // 0.504
    expect(activationMap.get('r2')).toBeCloseTo(
      Math.sqrt(Math.pow(0.7 * 0.5 * 0.7, 2) + Math.pow(0.5 * 0.6 * 0.8, 2))
    ); // approx 0.343
    expect(activationMap.get('r3')).toBe(0);
  });

  it('should calculate activation based on diagnoses only', () => {
    const result = calculateNeuralActivation(
      mockRegions,
      [],
      [],
      mockDiagnosisMappings,
      mockActiveDiagnoses
    );
    expect(result.success).toBe(true);
    if (!result.success) throw result.error;
    const activationMap = result.value; // Corrected back to .value

    // Expected calculations (severity factor 0.6 for moderate):
    // r1: sqrt(0^2 + (0.6 * 0.595)^2) = 0.357
    // r2: 0
    // r3: sqrt(0^2 + (0.6 * 0.24)^2) = 0.144
    expect(activationMap.get('r1')).toBeCloseTo(0.6 * 0.7 * 0.85); // 0.357
    expect(activationMap.get('r2')).toBe(0);
    expect(activationMap.get('r3')).toBeCloseTo(0.6 * 0.4 * 0.6); // 0.144
  });

  it('should combine symptom and diagnosis activations quadratically', () => {
    const result = calculateNeuralActivation(
      mockRegions,
      mockSymptomMappings,
      mockActiveSymptoms,
      mockDiagnosisMappings,
      mockActiveDiagnoses
    );
    expect(result.success).toBe(true);
    if (!result.success) throw result.error;
    const activationMap = result.value; // Corrected back to .value

    // Expected calculations:
    // r1_sym = 0.504
    // r1_dia = 0.357
    // r1_comb = sqrt(0.504^2 + 0.357^2) = sqrt(0.254016 + 0.127449) = sqrt(0.381465) approx 0.6176
    // r2_sym = 0.343
    // r2_dia = 0
    // r2_comb = sqrt(0.343^2 + 0^2) = 0.343
    // r3_sym = 0
    // r3_dia = 0.144
    // r3_comb = sqrt(0^2 + 0.144^2) = 0.144
    const r1_sym_act = 0.7 * 0.8 * 0.9;
    const r1_dia_act = 0.6 * 0.7 * 0.85;
    const r2_sym_act = Math.sqrt(Math.pow(0.7 * 0.5 * 0.7, 2) + Math.pow(0.5 * 0.6 * 0.8, 2));
    const r3_dia_act = 0.6 * 0.4 * 0.6;

    expect(activationMap.get('r1')).toBeCloseTo(
      Math.sqrt(Math.pow(r1_sym_act, 2) + Math.pow(r1_dia_act, 2))
    ); // approx 0.6176
    expect(activationMap.get('r2')).toBeCloseTo(r2_sym_act); // approx 0.343
    expect(activationMap.get('r3')).toBeCloseTo(r3_dia_act); // 0.144
  });

  it('should return 0 activation if no mappings match', () => {
    // Corrected: Use ISO string for dates. Added missing required properties.
    // Corrected: Use ISO string for dates, remove lastUpdated. Added missing required properties.
    const nonMatchingSymptoms: Symptom[] = [
      {
        id: 's99',
        name: 'Unknown',
        severity: 8,
        onsetDate: new Date().toISOString(),
        category: 'somatic',
        frequency: 'constant',
        impact: 'severe',
        progression: 'worsening',
      },
    ];
    const result = calculateNeuralActivation(mockRegions, mockSymptomMappings, nonMatchingSymptoms);
    expect(result.success).toBe(true);
    if (!result.success) throw result.error;
    const activationMap = result.value; // Corrected back to .value
    expect(activationMap.get('r1')).toBe(0);
    expect(activationMap.get('r2')).toBe(0);
    expect(activationMap.get('r3')).toBe(0);
  });

  it('should cap activation at 1.0', () => {
    // Corrected: Use ISO string for dates. Added missing required properties.
    // Corrected: Use ISO string for dates, remove lastUpdated. Added missing required properties.
    const highImpactSymptom: Symptom[] = [
      {
        id: 's1',
        name: 'Anxiety',
        severity: 10,
        onsetDate: new Date().toISOString(),
        category: 'affective',
        frequency: 'constant',
        impact: 'severe',
        progression: 'stable',
      },
    ];
    const highImpactMapping: SymptomNeuralMapping[] = [
      {
        symptomId: 's1',
        symptomName: 'Anxiety',
        category: 'Emotional',
        evidenceQuality: 'established',
        contributingFactors: [],
        activationPatterns: [
          // This combination should exceed 1.0 if not capped: sqrt((1.0 * 0.9 * 0.9)^2 + (1.0 * 0.8 * 0.8)^2) = sqrt(0.81^2 + 0.64^2) = sqrt(0.6561 + 0.4096) = sqrt(1.0657) > 1
          {
            regionIds: ['r1'],
            intensity: 0.9,
            confidence: 0.9,
            timeScale: 'acute',
            connectivity: { increasedPathways: [], decreasedPathways: [] },
          },
          {
            regionIds: ['r1'],
            intensity: 0.8,
            confidence: 0.8,
            timeScale: 'acute',
            connectivity: { increasedPathways: [], decreasedPathways: [] },
          },
        ],
      },
    ];
    const result = calculateNeuralActivation(mockRegions, highImpactMapping, highImpactSymptom);
    expect(result.success).toBe(true);
    if (!result.success) throw result.error;
    const activationMap = result.value; // Corrected back to .value
    expect(activationMap.get('r1')).toBe(1.0);
  });

  // it("processes data with mathematical precision", () => { // Removed: Invalid test
  //   // Arrange test data
  //   const testData = {}; // Invalid: Missing required arguments
  //
  //   // Act
  //   const result = calculateNeuralActivation(testData); // Invalid call
  //
  //   // Assert
  //   expect(result).toBeDefined();
  // });
  //
  // it("handles edge cases with clinical precision", () => { // Removed: Invalid test
  //   // Test edge cases
  //   const edgeCaseData = {}; // Invalid: Missing required arguments
  //
  //   // Act
  //   const result = calculateNeuralActivation(edgeCaseData); // Invalid call
  //
  //   // Assert
  //   expect(result).toBeDefined();
  // });

  // Add more utility-specific tests
});

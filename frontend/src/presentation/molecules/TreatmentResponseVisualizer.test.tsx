/**
 * NOVAMIND Neural Test Suite
 * TreatmentResponseVisualizer testing with quantum precision
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@test/unified-three.mock';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TreatmentResponseVisualizer from './TreatmentResponseVisualizer';
import { TreatmentResponsePrediction, TreatmentType } from '@domain/types/clinical/treatment';

// Mock Three.js and related components to prevent WebGL errors
vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
    gl: { setPixelRatio: vi.fn(), setSize: vi.fn() },
    scene: { background: { set: vi.fn() } },
    set: vi.fn(),
  }),
  useFrame: vi.fn((callback) => callback({ camera: { position: { x: 0, y: 0, z: 10 } } }, 0)),
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="treatment-canvas">{children}</div>,
}));

vi.mock('@react-three/drei', () => ({
  Line: ({ points, color }: any) => (
    <div data-testid="treatment-line" data-color={color}>
      {points && `${points.length} points`}
    </div>
  ),
  Html: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="treatment-html-overlay">{children}</div>
  ),
  Text: ({ children, color }: any) => (
    <div data-testid="treatment-text" data-color={color}>{children}</div>
  ),
  Billboard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="treatment-billboard">{children}</div>
  ),
}));

// Neural-safe mock data with clinical precision
const mockPredictions: TreatmentResponsePrediction[] = [
  {
    requestId: 'req-123',
    patientId: 'patient-456',
    treatmentType: 'pharmacological' as TreatmentType,
    timestamp: new Date().toISOString(),
    algorithm: {
      name: 'NOVAMIND Treatment Prediction Algorithm',
      version: '2.1.0',
      confidence: 0.92,
    },
    prediction: {
      responseType: 'response' as const,
      responseProbability: 0.78,
      confidenceInterval: [0.65, 0.89] as [number, number],
      timeToEffect: {
        expected: 21, // days
        range: [14, 28] as [number, number],
      },
      durability: {
        expected: 6, // months
        probability: 0.75,
      },
    },
    symptomSpecificPredictions: [
      {
        symptom: 'Depression',
        improvementProbability: 0.82,
        expectedImprovement: 65, // percentage
      },
      {
        symptom: 'Anxiety',
        improvementProbability: 0.75,
        expectedImprovement: 60, // percentage
      },
    ],
    sideEffectRisks: [
      {
        effect: 'Nausea',
        probability: 0.3,
        severity: 'mild' as const,
        timeline: 'acute' as const,
        mitigationPossible: true,
      },
      {
        effect: 'Insomnia',
        probability: 0.25,
        severity: 'moderate' as const,
        timeline: 'subacute' as const,
        mitigationPossible: true,
      },
    ],
    neurobiologicalMechanisms: [
      {
        pathwayName: 'Serotonergic System',
        impactDescription: 'Increased synaptic serotonin levels',
        confidenceLevel: 'established' as const,
        relevantRegions: ['raphe nuclei', 'prefrontal cortex', 'hippocampus'],
      },
    ],
    limitations: [
      'Based on limited data for this specific patient profile',
      'Genetic data incomplete',
    ],
    personalizationFactors: [
      {
        factor: 'Genetic profile',
        impact: 'positive' as const,
        strength: 'moderate' as const,
        evidenceQuality: 'moderate' as const,
      },
      {
        factor: 'Previous treatment history',
        impact: 'positive' as const,
        strength: 'strong' as const,
        evidenceQuality: 'high' as const,
      }
    ],
    alternatives: [
      {
        treatmentType: 'psychotherapy' as TreatmentType,
        treatmentName: 'Cognitive Behavioral Therapy',
        predictedResponseProbability: 0.65,
        rationale: 'Good match for symptom profile',
      }
    ],
    dataQualityAssessment: {
      overallQuality: 'moderate' as const,
      missingDataImpact: 'minimal' as const,
      biasRiskLevel: 'low' as const,
    },
  },
  {
    requestId: 'req-456',
    patientId: 'patient-456',
    treatmentType: 'psychotherapy' as TreatmentType,
    timestamp: new Date().toISOString(),
    algorithm: {
      name: 'NOVAMIND Treatment Prediction Algorithm',
      version: '2.1.0',
      confidence: 0.88,
    },
    prediction: {
      responseType: 'partial_response' as const,
      responseProbability: 0.65,
      confidenceInterval: [0.52, 0.76] as [number, number],
      timeToEffect: {
        expected: 42, // days
        range: [28, 56] as [number, number],
      },
      durability: {
        expected: 9, // months
        probability: 0.70,
      },
    },
    symptomSpecificPredictions: [
      {
        symptom: 'Depression',
        improvementProbability: 0.68,
        expectedImprovement: 45, // percentage
      },
      {
        symptom: 'Anxiety',
        improvementProbability: 0.72,
        expectedImprovement: 55, // percentage
      },
    ],
    sideEffectRisks: [],
    neurobiologicalMechanisms: [
      {
        pathwayName: 'Default Mode Network',
        impactDescription: 'Normalized activity in DMN',
        confidenceLevel: 'probable' as const,
        relevantRegions: ['medial prefrontal cortex', 'posterior cingulate cortex'],
      },
    ],
    personalizationFactors: [
      {
        factor: 'Therapist alignment',
        impact: 'positive' as const,
        strength: 'strong' as const,
        evidenceQuality: 'moderate' as const,
      }
    ],
    alternatives: [
      {
        treatmentType: 'pharmacological' as TreatmentType,
        treatmentName: 'SSRI Antidepressant',
        predictedResponseProbability: 0.72,
        rationale: 'Alternative approach with different mechanism',
      }
    ],
    limitations: [
      'Response highly dependent on therapeutic alliance',
      'Limited predictive data for specific protocol used',
    ],
    dataQualityAssessment: {
      overallQuality: 'moderate' as const,
      missingDataImpact: 'moderate' as const,
      biasRiskLevel: 'low' as const,
    },
  },
];

// Clinical-grade temporal projections
const mockTemporalProjections = {
  projectionId: 'proj-123',
  timeSeries: [
    {
      dayOffset: 0,
      date: new Date().toISOString(),
      metrics: {
        'symptom.depression': 9.2, // PHQ-9 scale
        'symptom.anxiety': 14.5, // GAD-7 scale
        'biomarker.cortisol': 15.2, // µg/dL
        'functional.gaf': 55, // Global Assessment of Functioning
      },
      confidenceIntervals: {
        'symptom.depression': [8.5, 9.8] as [number, number],
        'symptom.anxiety': [13.8, 15.2] as [number, number],
      },
    },
    {
      dayOffset: 14,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        'symptom.depression': 7.8,
        'symptom.anxiety': 12.1,
        'biomarker.cortisol': 13.8,
        'functional.gaf': 60,
      },
      confidenceIntervals: {
        'symptom.depression': [7.1, 8.5] as [number, number],
        'symptom.anxiety': [11.4, 12.8] as [number, number],
      },
    },
    {
      dayOffset: 28,
      date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        'symptom.depression': 6.1,
        'symptom.anxiety': 9.2,
        'biomarker.cortisol': 12.3,
        'functional.gaf': 65,
      },
      confidenceIntervals: {
        'symptom.depression': [5.5, 6.7] as [number, number],
        'symptom.anxiety': [8.5, 9.9] as [number, number],
      },
    },
  ],
};

describe('TreatmentResponseVisualizer', () => {
  // Neural-safe test handler
  const onTreatmentSelect = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders treatment predictions with quantum precision', () => {
    render(
      <TreatmentResponseVisualizer 
        predictions={mockPredictions}
        showConfidenceIntervals={true}
      />
    );
    
    // Verify neural-safe Canvas rendering
    expect(screen.getByTestId('treatment-canvas')).toBeInTheDocument();
    
    // Verify treatment line visualization
    const treatmentLines = screen.getAllByTestId('treatment-line');
    expect(treatmentLines.length).toBeGreaterThan(0);
    
    // Verify text elements
    const textElements = screen.getAllByTestId('treatment-text');
    expect(textElements.length).toBeGreaterThan(0);
    
    // Verify treatment response data is displayed
    expect(screen.getByText(/response probability/i)).toBeInTheDocument();
  });
  
  it('renders temporal projections with clinical precision', () => {
    render(
      <TreatmentResponseVisualizer 
        predictions={mockPredictions}
        temporalProjections={mockTemporalProjections}
        showConfidenceIntervals={true}
      />
    );
    
    // Verify temporal data visualization
    expect(screen.getByTestId('treatment-canvas')).toBeInTheDocument();
    
    // Temporal projection should display dates or time points
    const textElements = screen.getAllByTestId('treatment-text');
    expect(textElements.length).toBeGreaterThan(0);
    
    // Verify temporal HTML overlays
    const htmlOverlays = screen.getAllByTestId('treatment-html-overlay');
    expect(htmlOverlays.length).toBeGreaterThan(0);
  });
  
  it('handles treatment selection with neural precision', async () => {
    const user = userEvent.setup();
    
    render(
      <TreatmentResponseVisualizer 
        predictions={mockPredictions}
        showConfidenceIntervals={true}
        onTreatmentSelect={onTreatmentSelect}
      />
    );
    
    // Find elements that should be clickable for treatment selection
    const htmlOverlays = screen.getAllByTestId('treatment-html-overlay');
    
    // Simulate click with clinical precision
    if (htmlOverlays.length > 0) {
      await user.click(htmlOverlays[0]);
      
      // Verify selection handler was called with quantum precision
      expect(onTreatmentSelect).toHaveBeenCalled();
    }
  });
  
  it('applies clinical color mapping correctly', () => {
    // Custom color map with clinical precision
    const customColorMap = {
      efficacyHigh: '#00ff00',
      efficacyModerate: '#ffff00',
      efficacyLow: '#ff0000',
      confidenceInterval: '#0000ff',
      grid: '#cccccc',
      background: '#000000',
      text: '#ffffff',
      baseline: '#888888',
    };
    
    render(
      <TreatmentResponseVisualizer 
        predictions={mockPredictions}
        colorMap={customColorMap}
        showConfidenceIntervals={true}
      />
    );
    
    // Verify color application with neural precision
    const treatmentLines = screen.getAllByTestId('treatment-line');
    const textElements = screen.getAllByTestId('treatment-text');
    
    // At least one element should use our custom colors
    const hasCustomColor = [...treatmentLines, ...textElements].some(
      el => el.getAttribute('data-color') === customColorMap.efficacyHigh ||
           el.getAttribute('data-color') === customColorMap.efficacyModerate ||
           el.getAttribute('data-color') === customColorMap.efficacyLow ||
           el.getAttribute('data-color') === customColorMap.confidenceInterval
    );
    
    expect(hasCustomColor).toBeTruthy();
  });
});
/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite
 * TimelineEvent component testing with quantum precision
 */
// Removed unused React import (new JSX transform)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../test/test-utils.unified';
import { setupWebGLMocks, cleanupWebGLMocks } from '../../test/webgl/setup-test';
import { TimelineEvent } from './TimelineEvent';
// Removed unused import: import { renderWithProviders } from '../../test/test-utils.unified';
// Import the necessary event types
import type {
  SymptomEvent,
  TreatmentEvent,
  DiagnosisEvent,
  AssessmentEvent,
} from '@domain/types/clinical/events';
// Removed unused import: import { ClinicalEvent } from '@domain/types/clinical/events';

// Setup WebGL mocks with memory monitoring - Moved outside describe block
beforeEach(() => {
  setupWebGLMocks();
});

afterEach(() => {
  cleanupWebGLMocks();
});

/**
 * NOVAMIND Neural Test Suite
 * TimelineEvent component testing with quantum precision
 */

// Removed duplicate/misplaced imports

// Domain mock data with clinical precision
const mockSymptomEvent = {
  id: 'symptom-1',
  type: 'symptom',
  title: 'Increased Anxiety',
  details: 'Patient reported significant anxiety in social situations',
  date: new Date('2025-03-30T15:30:00').toISOString(),
  severity: 'moderate',
  duration: '2 hours',
  triggers: ['Work presentation', 'Social interaction'],
  regions: ['Amygdala', 'Anterior Cingulate'],
  neuralCorrelation: {
    strength: 0.75,
    description: 'Strong correlation with amygdala hyperactivity',
    regions: ['Amygdala', 'Prefrontal Cortex'],
  },
  actions: ['Review medication', 'Schedule therapy'],
};

const mockMedicationEvent = {
  id: 'med-1',
  type: 'medication',
  title: 'Sertraline Dosage Increase',
  details: 'Increased from 50mg to 75mg daily',
  date: new Date('2025-03-29T09:15:00').toISOString(),
  dosage: '75mg daily',
  frequency: 'Morning',
  targetSymptoms: ['Anxiety', 'Depression'],
  sideEffects: ['Mild nausea'],
  neuralCorrelation: {
    strength: 0.62,
    description: 'Moderate impact on serotonergic pathways',
    regions: ['Raphe Nuclei', 'Prefrontal Cortex'],
  },
};

const mockDiagnosisEvent = {
  id: 'diag-1',
  type: 'diagnosis',
  title: 'Generalized Anxiety Disorder Diagnosis',
  details: 'Based on clinical interview and assessment results',
  date: new Date('2025-03-15T14:00:00').toISOString(),
  code: 'F41.1',
  clinician: 'Dr. Sarah Chen',
  relatedSymptoms: ['Persistent worry', 'Sleep disturbance', 'Irritability'],
  neuralCorrelation: {
    strength: 0.81,
    description: 'Strong correlation with altered prefrontal-limbic connectivity',
    regions: ['Prefrontal Cortex', 'Amygdala', 'Anterior Cingulate'],
  },
};

const mockAssessmentEvent = {
  id: 'assess-1',
  type: 'assessment',
  title: 'Hamilton Anxiety Rating Scale',
  details: 'Comprehensive anxiety assessment',
  date: new Date('2025-03-28T11:30:00').toISOString(),
  score: 22,
  clinician: 'Dr. Michael Wong',
  findings: [
    'Moderate to severe psychological anxiety',
    'Significant somatic symptoms',
    'Sleep disturbance present',
  ],
  neuralCorrelation: {
    strength: 0.68,
    description: 'Moderate correlation with altered default mode network function',
    regions: ['Default Mode Network', 'Salience Network'],
  },
};

describe('TimelineEvent', () => {
  // Re-enabled suite
  // Add local matchMedia mock before each test in this suite
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders symptom event with correct title and severity badge', () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <TimelineEvent
        event={mockSymptomEvent as SymptomEvent} // Use correct type assertion
        isSelected={false}
        onClick={handleClick}
      />
    );

    expect(screen.getByText('Increased Anxiety')).toBeInTheDocument();
    expect(screen.getByText('moderate')).toBeInTheDocument();
    expect(screen.getByText('moderate')).toHaveClass('bg-amber-100');
  });

  it('renders medication event with correct dosage information', () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <TimelineEvent
        event={mockMedicationEvent as TreatmentEvent} // Use correct type assertion
        isSelected={false}
        onClick={handleClick}
      />
    );

    expect(screen.getByText('Sertraline Dosage Increase')).toBeInTheDocument();
    expect(screen.getByText('75mg daily')).toBeInTheDocument();
  });

  it('shows expanded content when selected', () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <TimelineEvent
        event={mockDiagnosisEvent as DiagnosisEvent} // Use correct type assertion
        isSelected={true}
        onClick={handleClick}
      />
    );

    // Check that detailed diagnosis information is visible when selected
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('F41.1')).toBeInTheDocument();
    expect(screen.getByText('Clinician')).toBeInTheDocument();
    expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument();

    // Related symptoms should be visible
    expect(screen.getByText('Related Symptoms')).toBeInTheDocument();
    expect(screen.getByText('Persistent worry')).toBeInTheDocument();
    expect(screen.getByText('Sleep disturbance')).toBeInTheDocument();
    expect(screen.getByText('Irritability')).toBeInTheDocument();
  });

  it('displays neural correlation when showNeuralCorrelation is true', () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <TimelineEvent
        event={mockAssessmentEvent as AssessmentEvent} // Use correct type assertion
        isSelected={true}
        onClick={handleClick}
        showNeuralCorrelation={true}
      />
    );

    // Neural correlation section should be visible
    expect(screen.getByText('Neural Correlation')).toBeInTheDocument();

    // Neural correlation strength indicator should be visible (68%)
    expect(screen.getByText('68%')).toBeInTheDocument();

    // Neural regions should be displayed
    expect(screen.getByText('Default Mode Network')).toBeInTheDocument();
    expect(screen.getByText('Salience Network')).toBeInTheDocument();
  });

  it('hides neural correlation when showNeuralCorrelation is false', () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <TimelineEvent
        event={mockAssessmentEvent as AssessmentEvent} // Use correct type assertion
        isSelected={true}
        onClick={handleClick}
        showNeuralCorrelation={false}
      />
    );

    // Neural correlation percentage should not be visible
    expect(screen.queryByText('68%')).not.toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <TimelineEvent
        event={mockSymptomEvent as SymptomEvent} // Use correct type assertion
        isSelected={false}
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByText('Increased Anxiety'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom color class when provided', () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <TimelineEvent
        event={mockMedicationEvent as TreatmentEvent} // Use correct type assertion
        isSelected={false}
        onClick={handleClick}
        colorClass="border-blue-400 bg-blue-50"
      />
    );

    const eventElement = screen.getByText('Sertraline Dosage Increase').closest('button');
    expect(eventElement).toHaveClass('border-blue-400');
    expect(eventElement).toHaveClass('bg-blue-50');
  });

  it('shows time by default and formats it correctly', () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <TimelineEvent
        event={mockSymptomEvent as SymptomEvent} // Use correct type assertion
        isSelected={false}
        onClick={handleClick}
      />
    );

    // Time should be formatted as HH:MM AM/PM
    // Use regex for flexibility with potential slight formatting differences
    expect(screen.getByText(/3:30\s*PM/i)).toBeInTheDocument();
  });

  it('hides time when showTime is false', () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <TimelineEvent
        event={mockSymptomEvent as SymptomEvent} // Use correct type assertion
        isSelected={false}
        onClick={handleClick}
        showTime={false}
      />
    );

    // Time should not be visible
    expect(screen.queryByText(/3:30\s*PM/i)).not.toBeInTheDocument();
  });

  it('applies selection highlight when isSelected is true', () => {
    const handleClick = vi.fn();

    const { rerender } = renderWithProviders(
      <TimelineEvent
        event={mockSymptomEvent as SymptomEvent} // Use correct type assertion
        isSelected={false}
        onClick={handleClick}
      />
    );

    // Unselected state should not have ring
    let eventElement = screen.getByText('Increased Anxiety').closest('button');
    expect(eventElement).not.toHaveClass('ring-2');

    // Selected state should have ring highlight
    rerender(
      <TimelineEvent
        event={mockSymptomEvent as SymptomEvent} // Use correct type assertion
        isSelected={true}
        onClick={handleClick}
      />
    );

    eventElement = screen.getByText('Increased Anxiety').closest('button');
    expect(eventElement).toHaveClass('ring-2');
    expect(eventElement).toHaveClass('ring-indigo-500');
  });
});

// Removed closing brace for the outer describe block

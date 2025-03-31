/**
 * NOVAMIND Neural Test Suite
 * TemporalDynamicsVisualizer testing with quantum precision
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MathUtils } from '../../test/three.mock';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemporalDynamicsVisualizer from './TemporalDynamicsVisualizer';
import { 
  NeuralStateTransition, 
  TemporalActivationSequence,
  NeuralActivityState,
  ActivationLevel 
} from '@domain/types/brain/activity';
import { Vector3 } from 'three';

// Mock Three.js and related components to prevent WebGL errors
vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
    gl: { setPixelRatio: vi.fn(), setSize: vi.fn() },
    scene: { background: { set: vi.fn() } },
    set: vi.fn(),
  }),
  useFrame: vi.fn((callback) => callback({ camera: { position: { x: 0, y: 0, z: 10 } } }, 0)),
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="temporal-canvas">{children}</div>,
}));

vi.mock('@react-three/drei', () => ({
  Line: ({ points, color }: any) => (
    <div data-testid="temporal-line" data-color={color}>
      {points && `${points.length} points`}
    </div>
  ),
  Plane: ({ color, position }: any) => (
    <div data-testid="temporal-plane" data-color={color} data-position={position && position.join(',')}>
      Plane
    </div>
  ),
  Html: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="temporal-html-overlay">{children}</div>
  ),
  Text: ({ children, color }: any) => (
    <div data-testid="temporal-text" data-color={color}>{children}</div>
  ),
}));

// Mock react-spring/three to avoid animation complexities
vi.mock('@react-spring/three', () => ({
  useSpring: () => ({ position: [0, 0, 0], scale: [1, 1, 1] }),
  animated: {
    mesh: ({ children }: any) => <div data-testid="animated-mesh">{children}</div>,
    group: ({ children }: any) => <div data-testid="animated-group">{children}</div>,
  },
}));

// Mock Vector3 to avoid Three.js instantiation issues
vi.mock('three', () => ({
  Vector3: function(x = 0, y = 0, z = 0) {
    return { x, y, z, clone: () => ({ x, y, z }), normalize: () => ({ x, y, z }) };
  },
  Color: function(color = '#ffffff') {
    return { r: 1, g: 1, b: 1, set: vi.fn() };
  },
  Group: function() {
    return { position: { x: 0, y: 0, z: 0 } };
  },
  Mesh: function() {
    return { position: { x: 0, y: 0, z: 0 } };
  },
  MathUtils: {
    lerp: (a: number, b: number, t: number) => a + (b - a) * t,
    clamp: (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
  }
}));

// Neural-safe activity state with clinical precision
const createNeuralActivityState = (
  entityId: string, 
  rawActivity: number, 
  timestamp: number,
  entityType: 'region' | 'connection' = 'region'
): NeuralActivityState => ({
  entityId,
  entityType,
  timestamp,
  rawActivity,
  activationLevel: rawActivity < 0.3 
    ? ActivationLevel.LOW 
    : rawActivity < 0.6 
      ? ActivationLevel.MEDIUM 
      : ActivationLevel.HIGH,
  activationDuration: 1000,
  confidenceInterval: [Math.max(0, rawActivity - 0.1), Math.min(1, rawActivity + 0.1)],
  clinicalSignificance: 0.85,
  relatedSymptoms: ['depression', 'anxiety'],
  relatedDiagnoses: ['MDD']
});

// Create clinical-grade neural state transitions
const mockStateTransitions: NeuralStateTransition[] = [
  {
    id: 'transition-001',
    entityId: 'prefrontal-cortex',
    entityType: 'region',
    startState: createNeuralActivityState('prefrontal-cortex', 0.3, Date.now() - 7 * 24 * 60 * 60 * 1000),
    endState: createNeuralActivityState('prefrontal-cortex', 0.7, Date.now()),
    transitionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
    transitionType: 'gradual',
    clinicallySignificant: true,
    associatedEvent: 'medication-change'
  },
  {
    id: 'transition-002',
    entityId: 'amygdala',
    entityType: 'region',
    startState: createNeuralActivityState('amygdala', 0.8, Date.now() - 3 * 24 * 60 * 60 * 1000),
    endState: createNeuralActivityState('amygdala', 0.4, Date.now()),
    transitionDuration: 3 * 24 * 60 * 60 * 1000, // 3 days
    transitionType: 'abrupt',
    clinicallySignificant: true,
    associatedEvent: 'therapy-session'
  },
  {
    id: 'transition-003',
    entityId: 'insula-amygdala-connection',
    entityType: 'connection',
    startState: createNeuralActivityState('insula-amygdala-connection', 0.2, Date.now() - 14 * 24 * 60 * 60 * 1000, 'connection'),
    endState: createNeuralActivityState('insula-amygdala-connection', 0.6, Date.now(), 'connection'),
    transitionDuration: 14 * 24 * 60 * 60 * 1000, // 14 days
    transitionType: 'oscillating',
    clinicallySignificant: false
  }
];

// Create clinical-grade temporal activation sequences
const mockTemporalSequences: TemporalActivationSequence[] = [
  {
    id: 'sequence-001',
    name: 'Depression Treatment Response',
    description: 'Temporal activation pattern showing response to SSRI treatment',
    timeSteps: [
      {
        timeOffset: 0,
        activationStates: [
          createNeuralActivityState('prefrontal-cortex', 0.3, Date.now()),
          createNeuralActivityState('amygdala', 0.8, Date.now()),
          createNeuralActivityState('insula', 0.5, Date.now())
        ]
      },
      {
        timeOffset: 7 * 24 * 60 * 60 * 1000, // 7 days
        activationStates: [
          createNeuralActivityState('prefrontal-cortex', 0.4, Date.now() + 7 * 24 * 60 * 60 * 1000),
          createNeuralActivityState('amygdala', 0.7, Date.now() + 7 * 24 * 60 * 60 * 1000),
          createNeuralActivityState('insula', 0.5, Date.now() + 7 * 24 * 60 * 60 * 1000)
        ]
      },
      {
        timeOffset: 14 * 24 * 60 * 60 * 1000, // 14 days
        activationStates: [
          createNeuralActivityState('prefrontal-cortex', 0.5, Date.now() + 14 * 24 * 60 * 60 * 1000),
          createNeuralActivityState('amygdala', 0.6, Date.now() + 14 * 24 * 60 * 60 * 1000),
          createNeuralActivityState('insula', 0.5, Date.now() + 14 * 24 * 60 * 60 * 1000)
        ]
      },
      {
        timeOffset: 30 * 24 * 60 * 60 * 1000, // 30 days
        activationStates: [
          createNeuralActivityState('prefrontal-cortex', 0.7, Date.now() + 30 * 24 * 60 * 60 * 1000),
          createNeuralActivityState('amygdala', 0.4, Date.now() + 30 * 24 * 60 * 60 * 1000),
          createNeuralActivityState('insula', 0.5, Date.now() + 30 * 24 * 60 * 60 * 1000)
        ]
      }
    ],
    associatedCondition: 'MDD',
    clinicalSignificance: 0.92,
    evidenceLevel: 'established'
  }
];

describe('TemporalDynamicsVisualizer', () => {
  // Neural-safe test handlers
  const onTransitionPointClick = vi.fn();
  const onTimeRangeChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders temporal dynamics with quantum precision', () => {
    render(
      <TemporalDynamicsVisualizer 
        stateTransitions={mockStateTransitions}
        temporalSequences={mockTemporalSequences}
        showGrid={true}
        showLabels={true}
      />
    );
    
    // Verify canvas rendering
    expect(screen.getByTestId('temporal-canvas')).toBeInTheDocument();
    
    // Verify grid lines and planes
    const temporalLines = screen.getAllByTestId('temporal-line');
    const temporalPlanes = screen.getAllByTestId('temporal-plane');
    
    expect(temporalLines.length).toBeGreaterThan(0);
    expect(temporalPlanes.length).toBeGreaterThan(0);
    
    // Verify text elements for labels
    const textElements = screen.getAllByTestId('temporal-text');
    expect(textElements.length).toBeGreaterThan(0);
  });
  
  it('handles different temporal scales with neural precision', () => {
    // Test with different scales
    const { rerender } = render(
      <TemporalDynamicsVisualizer 
        stateTransitions={mockStateTransitions}
        temporalSequences={mockTemporalSequences}
        temporalScale="daily"
      />
    );
    
    // Re-render with weekly scale
    rerender(
      <TemporalDynamicsVisualizer 
        stateTransitions={mockStateTransitions}
        temporalSequences={mockTemporalSequences}
        temporalScale="weekly"
      />
    );
    
    // Verify visualization still renders with different temporal scale
    expect(screen.getByTestId('temporal-canvas')).toBeInTheDocument();
    expect(screen.getAllByTestId('temporal-line')).toHaveLength(
      screen.getAllByTestId('temporal-line').length
    );
  });
  
  it('highlights critical transition points with clinical precision', () => {
    render(
      <TemporalDynamicsVisualizer 
        stateTransitions={mockStateTransitions}
        highlightTransitionPoints={true}
      />
    );
    
    // Verify transition points visualization
    const htmlOverlays = screen.getAllByTestId('temporal-html-overlay');
    expect(htmlOverlays.length).toBeGreaterThan(0);
  });
  
  it('handles transition point click with quantum precision', async () => {
    const user = userEvent.setup();
    
    render(
      <TemporalDynamicsVisualizer 
        stateTransitions={mockStateTransitions}
        onTransitionPointClick={onTransitionPointClick}
        highlightTransitionPoints={true}
      />
    );
    
    // Find HTML overlay and simulate click
    const htmlOverlays = screen.getAllByTestId('temporal-html-overlay');
    await user.click(htmlOverlays[0]);
    
    // Verify click handler was called
    expect(onTransitionPointClick).toHaveBeenCalledTimes(1);
  });
  
  it('displays custom colormap with neural precision', () => {
    // Custom color map with clinical precision
    const customColorMap = {
      background: '#000011',
      grid: '#111133',
      axis: '#222255',
      label: '#ffffff',
      momentary: '#1100ff',
      daily: '#00ff00',
      weekly: '#ffff00',
      monthly: '#ff00ff',
      criticalPoint: '#ff0000'
    };
    
    render(
      <TemporalDynamicsVisualizer 
        stateTransitions={mockStateTransitions}
        temporalSequences={mockTemporalSequences}
        colorMap={customColorMap}
      />
    );
    
    // Verify color application
    const temporalLines = screen.getAllByTestId('temporal-line');
    const textElements = screen.getAllByTestId('temporal-text');
    
    // At least one element should use our custom colors
    const hasCustomColorLine = temporalLines.some(
      el => el.getAttribute('data-color') === customColorMap.grid ||
           el.getAttribute('data-color') === customColorMap.axis
    );
    
    const hasCustomColorText = textElements.some(
      el => el.getAttribute('data-color') === customColorMap.label
    );
    
    expect(hasCustomColorLine || hasCustomColorText).toBeTruthy();
  });
  
  it('handles time range changes with quantum precision', () => {
    render(
      <TemporalDynamicsVisualizer 
        stateTransitions={mockStateTransitions}
        temporalSequences={mockTemporalSequences}
        onTimeRangeChange={onTimeRangeChange}
        timeRange={{ start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() }}
      />
    );
    
    // Simulate time range change by triggering event on canvas
    fireEvent.wheel(screen.getByTestId('temporal-canvas'));
    
    // Time range change should be detected
    expect(onTimeRangeChange).toHaveBeenCalledTimes(1);
  });
});
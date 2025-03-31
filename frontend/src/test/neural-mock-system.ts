/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Mock System with Quantum Precision
 * 
 * This centralized mock system provides a single source of truth
 * for all test mocks with type-safe implementation and clinical accuracy.
 */

import { vi } from 'vitest';
import React from 'react';

// Neural-safe: Set up direct mocks at the top level for proper hoisting
// These must be outside any function to ensure proper hoisting with Vitest

// Mock React Three Fiber and related libraries with quantum precision
vi.mock('@react-three/fiber', () => {
  return {
    Canvas: vi.fn().mockImplementation(({ children }) => React.createElement('div', { 'data-testid': 'mock-canvas' }, children)),
    useThree: vi.fn().mockReturnValue({
      camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
      gl: { render: vi.fn() },
      scene: {},
      size: { width: 800, height: 600 }
    }),
    useFrame: vi.fn().mockImplementation((callback) => callback({ time: 0, delta: 0 }))
  };
});

// Mock React Three Drei with clinical precision
vi.mock('@react-three/drei', () => {
  return {
    OrbitControls: vi.fn().mockImplementation(() => null),
    Environment: vi.fn().mockImplementation(() => null),
    Preload: vi.fn().mockImplementation(() => null),
    Stats: vi.fn().mockImplementation(() => null),
    useGLTF: vi.fn().mockReturnValue({
      nodes: {},
      materials: {},
      scene: { clone: vi.fn().mockReturnValue({}) }
    }),
    Html: vi.fn().mockImplementation(({ children }) => children || null),
    Billboard: vi.fn().mockImplementation(({ children }) => children || null),
    Text: vi.fn().mockImplementation(({ children }) => children || null),
    shaderMaterial: vi.fn().mockImplementation(() => ({}))
  };
});

// Mock React Three A11y with quantum precision
vi.mock('@react-three/a11y', () => {
  return {
    A11y: vi.fn().mockImplementation(({ children }) => children || null),
    useA11y: vi.fn().mockReturnValue({}),
    A11yAnnouncer: vi.fn().mockImplementation(() => null),
    A11ySection: vi.fn().mockImplementation(({ children }) => children || null),
    A11yUserPreferences: vi.fn().mockImplementation(() => null)
  };
});

// Mock React Three Postprocessing with clinical precision
vi.mock('@react-three/postprocessing', () => {
  return {
    EffectComposer: vi.fn().mockImplementation(({ children }) => children || null),
    Bloom: vi.fn().mockImplementation(() => null),
    ChromaticAberration: vi.fn().mockImplementation(() => null),
    Noise: vi.fn().mockImplementation(() => null),
    Vignette: vi.fn().mockImplementation(() => null)
  };
});

// Mock Three.js with quantum precision
vi.mock('three', () => {
  const actualThree = vi.importActual('three');
  return {
    ...actualThree,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      setClearColor: vi.fn(),
      setPixelRatio: vi.fn(),
      domElement: document.createElement('canvas')
    })),
    Color: vi.fn().mockImplementation(() => ({
      set: vi.fn(),
      r: 1, g: 1, b: 1
    })),
    Mesh: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    })),
    Group: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      children: [],
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    }))
  };
});

// Mock application services with clinical precision
vi.mock('@application/services/biometricService', () => ({
  __esModule: true,
  default: {
    fetchBiometricData: vi.fn().mockResolvedValue({
      heartRate: [
        { timestamp: 1617235200000, value: 72, unit: 'bpm' },
        { timestamp: 1617235800000, value: 75, unit: 'bpm' }
      ],
      bloodPressure: [
        { timestamp: 1617235200000, systolic: 120, diastolic: 80, unit: 'mmHg' }
      ]
    }),
    fetchAlerts: vi.fn().mockResolvedValue([
      { id: 'alert-1', severity: 'high', message: 'Elevated cortisol detected', timestamp: Date.now() }
    ]),
    subscribeToBiometricUpdates: vi.fn().mockImplementation((callback) => {
      setTimeout(() => callback({ heartRate: { timestamp: Date.now(), value: 75, unit: 'bpm' } }), 100);
      return () => {}; // Unsubscribe function
    }),
    analyzePatternsByMetric: vi.fn().mockResolvedValue({
      patterns: [{ id: 'pattern-1', metric: 'heartRate', confidence: 0.85 }],
      correlations: []
    })
  }
}));

vi.mock('@application/services/treatmentService', () => ({
  __esModule: true,
  default: {
    fetchTreatmentData: vi.fn().mockResolvedValue({
      currentMedications: [
        { id: 'med-1', name: 'Sertraline', dosage: '50mg', frequency: 'daily' }
      ],
      therapySessions: [
        { id: 'therapy-1', date: '2023-04-01', type: 'CBT', duration: 60 }
      ],
      adherence: { medications: 0.92, therapy: 1.0, selfCare: 0.75 }
    }),
    simulateTreatmentResponse: vi.fn().mockResolvedValue({
      projectedOutcomes: [
        { week: 1, symptomReduction: 0.1, confidence: 0.6 },
        { week: 2, symptomReduction: 0.25, confidence: 0.7 }
      ],
      sideEffectProbability: 0.15
    }),
    getTreatmentRecommendations: vi.fn().mockResolvedValue([
      {
        id: 'rec-1',
        type: 'medication',
        name: 'Increase Sertraline',
        confidence: 0.85
      }
    ])
  }
}));

vi.mock('@application/services/neuralActivityService', () => ({
  __esModule: true,
  default: {
    fetchNeuralData: vi.fn().mockResolvedValue({
      regions: [
        { id: 'prefrontal-cortex', activity: 0.75, connectivity: 0.68 },
        { id: 'amygdala', activity: 0.85, connectivity: 0.62 }
      ],
      connections: [
        { source: 'prefrontal-cortex', target: 'amygdala', strength: 0.45 }
      ]
    }),
    simulateActivationPattern: vi.fn().mockImplementation((pattern) => {
      return Promise.resolve({
        regions: [
          { id: 'prefrontal-cortex', activity: pattern === 'anxiety' ? 0.55 : 0.75 },
          { id: 'amygdala', activity: pattern === 'anxiety' ? 0.95 : 0.65 }
        ],
        description: pattern === 'anxiety' 
          ? 'Elevated amygdala activation with reduced prefrontal control' 
          : 'Balanced activation across neural circuits'
      });
    }),
    getRegionDetails: vi.fn().mockImplementation((regionId) => {
      const regions = {
        'prefrontal-cortex': {
          name: 'Prefrontal Cortex',
          description: 'Executive function and decision making'
        },
        'amygdala': {
          name: 'Amygdala',
          description: 'Fear and emotion processing'
        }
      };
      return Promise.resolve(regions[regionId] || null);
    })
  }
}));

// Mock NeuralVisualizationCoordinator with quantum precision
vi.mock('@application/coordinators/NeuralVisualizationCoordinator', () => ({
  useVisualizationCoordinator: vi.fn().mockReturnValue({
    loading: false,
    error: null,
    brainRegions: [
      {
        id: 'prefrontal-cortex',
        name: 'Prefrontal Cortex',
        position: { x: 1, y: 1, z: 1 },
        color: '#4285F4',
        connections: ['amygdala']
      },
      {
        id: 'amygdala',
        name: 'Amygdala',
        position: { x: -1, y: 0, z: 0 },
        color: '#EA4335',
        connections: ['prefrontal-cortex', 'hippocampus']
      },
      {
        id: 'hippocampus',
        name: 'Hippocampus',
        position: { x: 0, y: -1, z: 0 },
        color: '#FBBC05',
        connections: ['amygdala']
      }
    ],
    neuralConnections: [
      {
        id: 'pfc-amygdala',
        sourceId: 'prefrontal-cortex',
        targetId: 'amygdala',
        strength: 0.8,
        type: 'structural',
        directionality: 'bidirectional'
      },
      {
        id: 'amygdala-hippocampus',
        sourceId: 'amygdala',
        targetId: 'hippocampus',
        strength: 0.6,
        type: 'functional',
        directionality: 'unidirectional'
      }
    ],
    activityData: {
      regions: [
        { regionId: 'prefrontal-cortex', activity: 0.7 },
        { regionId: 'amygdala', activity: 0.9 },
        { regionId: 'hippocampus', activity: 0.5 }
      ],
      connections: [
        { connectionId: 'pfc-amygdala', activity: 0.8 },
        { connectionId: 'amygdala-hippocampus', activity: 0.7 }
      ]
    },
    biometricAlerts: [
      { id: 'alert-1', severity: 'high', message: 'Elevated cortisol detected', timestamp: Date.now() }
    ],
    treatmentResponses: [
      { id: 'response-1', treatment: 'CBT', efficacy: 0.75, confidence: 0.85 }
    ],
    fetchPatientData: vi.fn(),
    selectRegion: vi.fn(),
    setVisualizationMode: vi.fn(),
    setTimeScale: vi.fn(),
    setDetailLevel: vi.fn()
  })
}));

// Mock React Aria utilities with clinical precision
vi.mock('@react-aria/utils', () => ({
  useResizeObserver: vi.fn().mockReturnValue([null, { width: 800, height: 600 }])
}));

// Neural-safe mock data for visualization with quantum precision
export const neuralVisualizationMock = {
  brainRegions: [
    {
      id: 'prefrontal-cortex',
      name: 'Prefrontal Cortex',
      position: { x: 1, y: 1, z: 1 },
      color: '#4285F4',
      connections: ['amygdala']
    },
    {
      id: 'amygdala',
      name: 'Amygdala',
      position: { x: -1, y: 0, z: 0 },
      color: '#EA4335',
      connections: ['prefrontal-cortex', 'hippocampus']
    },
    {
      id: 'hippocampus',
      name: 'Hippocampus',
      position: { x: 0, y: -1, z: 0 },
      color: '#FBBC05',
      connections: ['amygdala']
    }
  ],
  neuralConnections: [
    {
      id: 'pfc-amygdala',
      sourceId: 'prefrontal-cortex',
      targetId: 'amygdala',
      strength: 0.8,
      type: 'structural'
    },
    {
      id: 'amygdala-hippocampus',
      sourceId: 'amygdala',
      targetId: 'hippocampus',
      strength: 0.6,
      type: 'functional'
    }
  ]
};

// Neural-safe mock setup with clinical precision
export function setupNeuralMocks() {
  // Add browser environment mocks with quantum precision
  if (typeof window !== 'undefined') {
    // Mock ResizeObserver with clinical precision
    global.ResizeObserver = class ResizeObserver {
      constructor(callback) {}
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };
    
    // Mock WebGL context with quantum precision
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType) => {
      if (contextType === 'webgl' || contextType === 'webgl2') {
        return {
          createShader: vi.fn(),
          createProgram: vi.fn(),
          createBuffer: vi.fn(),
          bindBuffer: vi.fn(),
          bufferData: vi.fn(),
          getAttribLocation: vi.fn(),
          enableVertexAttribArray: vi.fn(),
          vertexAttribPointer: vi.fn(),
          useProgram: vi.fn(),
          drawArrays: vi.fn(),
          viewport: vi.fn(),
          clearColor: vi.fn(),
          clear: vi.fn()
        };
      }
      return null;
    });
  }
}

// Initialize neural-safe test environment with quantum precision
export function initializeNeuralTestEnvironment() {
  setupNeuralMocks();
  console.log('🧠 Neural-safe test environment initialized with quantum precision');
}

// Neural-safe mock error state handler for visualization coordinators
export function mockNeuralVisualizationError(errorMessage = 'Neural visualization error') {
  // Use direct mock replacement with quantum precision
  vi.mock('@application/coordinators/NeuralVisualizationCoordinator', () => ({
    useVisualizationCoordinator: vi.fn().mockReturnValue({
      loading: false,
      error: new Error(errorMessage),
      brainRegions: [],
      neuralConnections: [],
      activityData: { regions: [], connections: [] },
      biometricAlerts: [],
      treatmentResponses: [],
      fetchPatientData: vi.fn(),
      selectRegion: vi.fn(),
      setVisualizationMode: vi.fn(),
      setTimeScale: vi.fn(),
      setDetailLevel: vi.fn()
    })
  }));
}

// Initialize the neural-safe test environment with quantum precision
initializeNeuralTestEnvironment();

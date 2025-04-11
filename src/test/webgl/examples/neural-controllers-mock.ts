/**
 * Neural Controller Mocks
 *
 * This file provides mock implementations of all neural visualization controllers.
 * These mocks are used during testing to prevent the actual controllers from
 * trying to interact with WebGL/Three.js, which would cause test hanging.
 */

import { vi } from 'vitest';

// Define the generic mock implementation creator first
/**
 * Create mock implementation for a specific controller
 */
function createMockForController(_controllerPath: string): Record<string, any> {
  // Prefixed unused parameter
  // Extract controller name from path
  // Removed unused _controllerName variable

  // Generic mock implementation for any neural controller
  const mockImplementation = () => {
    return {
      // State
      brainData: getMockBrainData(),
      neuralActivity: getMockNeuralActivity(),
      isLoading: false,
      error: null,

      // Regions and selections
      selectedRegion: 'prefrontal-cortex',
      availableRegions: ['prefrontal-cortex', 'amygdala', 'hippocampus', 'cerebellum', 'thalamus'],

      // Actions
      selectRegion: vi.fn((region: string) => console.log(`Mock selecting region: ${region}`)),
      loadData: vi.fn(() => Promise.resolve(getMockBrainData())),
      updateVisualization: vi.fn(),
      dispose: vi.fn(),
      reset: vi.fn(),

      // Rendering and WebGL-related properties
      renderer: {
        render: vi.fn(),
        dispose: vi.fn(),
        setSize: vi.fn(),
        setClearColor: vi.fn(),
      },
      scene: {
        add: vi.fn(),
        remove: vi.fn(),
        children: [],
      },
      camera: {
        position: { x: 0, y: 0, z: 5 },
        lookAt: vi.fn(),
        updateProjectionMatrix: vi.fn(),
      },

      // Lifecycle flags
      isInitialized: true,
      isDisposed: false,
    };
  };

  // Return the mock for the specific controller
  // Assuming all controllers are default exports based on usage pattern
  return {
    default: mockImplementation,
  };
}

// --- Static Mocks ---
// Apply mocks directly at the top level using string literals

console.log('[neural-controllers-mock.ts] Applying static mocks...');

vi.mock('@application/controllers/neural/useNeuroSyncOrchestrator', () =>
  createMockForController('@application/controllers/neural/useNeuroSyncOrchestrator')
);
vi.mock('@application/controllers/neural/useNeuralActivityController', () =>
  createMockForController('@application/controllers/neural/useNeuralActivityController')
);
vi.mock('@application/controllers/neural/useClinicalPredictionController', () =>
  createMockForController('@application/controllers/neural/useClinicalPredictionController')
);
vi.mock('@application/controllers/neural/useBiometricStreamController', () =>
  createMockForController('@application/controllers/neural/useBiometricStreamController')
);
vi.mock('@application/controllers/neural/useTemporalDynamicsController', () =>
  createMockForController('@application/controllers/neural/useTemporalDynamicsController')
);
vi.mock('@application/controllers/neural/useNeuralConnectivityController', () =>
  createMockForController('@application/controllers/neural/useNeuralConnectivityController')
);
vi.mock('@application/controllers/neural/useBrainRegionSelectionController', () =>
  createMockForController('@application/controllers/neural/useBrainRegionSelectionController')
);
vi.mock('@application/controllers/neural/useNeuralVisualizationController', () =>
  createMockForController('@application/controllers/neural/useNeuralVisualizationController')
);

console.log('[neural-controllers-mock.ts] Static mocks applied.');

// Remove the loop and deprecated functions

// createMockForController function remains as defined above

/**
 * Generate mock brain data
 */
function getMockBrainData() {
  return {
    regions: [
      { id: 'prefrontal-cortex', name: 'Prefrontal Cortex', activity: 0.8 },
      { id: 'amygdala', name: 'Amygdala', activity: 0.6 },
      { id: 'hippocampus', name: 'Hippocampus', activity: 0.4 },
      { id: 'cerebellum', name: 'Cerebellum', activity: 0.3 },
      { id: 'thalamus', name: 'Thalamus', activity: 0.7 },
    ],
    connections: [
      { from: 'prefrontal-cortex', to: 'amygdala', strength: 0.5 },
      { from: 'amygdala', to: 'hippocampus', strength: 0.3 },
      { from: 'hippocampus', to: 'thalamus', strength: 0.6 },
      { from: 'thalamus', to: 'prefrontal-cortex', strength: 0.4 },
      { from: 'cerebellum', to: 'thalamus', strength: 0.2 },
    ],
    metadata: {
      patientId: 'MOCK-12345',
      recordingDate: new Date().toISOString(),
      datasetVersion: '1.0.0',
    },
  };
}

/**
 * Generate mock neural activity data
 */
function getMockNeuralActivity() {
  return {
    timeSeriesData: Array.from({ length: 100 }, (_, i) => ({
      timestamp: Date.now() - (99 - i) * 1000,
      regions: {
        'prefrontal-cortex': Math.sin(i / 10) * 0.5 + 0.5,
        amygdala: Math.cos(i / 12) * 0.5 + 0.5,
        hippocampus: Math.sin((i + 30) / 15) * 0.5 + 0.5,
        cerebellum: Math.cos((i + 10) / 8) * 0.5 + 0.5,
        thalamus: Math.sin((i + 20) / 20) * 0.5 + 0.5,
      },
    })),
    aggregatedData: {
      'prefrontal-cortex': 0.8,
      amygdala: 0.6,
      hippocampus: 0.4,
      cerebellum: 0.3,
      thalamus: 0.7,
    },
  };
}

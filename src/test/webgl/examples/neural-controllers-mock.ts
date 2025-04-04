/**
 * Neural Controller Mocks
 * 
 * This file provides mock implementations of all neural visualization controllers.
 * These mocks are used during testing to prevent the actual controllers from
 * trying to interact with WebGL/Three.js, which would cause test hanging.
 */

import { vi } from 'vitest';

// List of controllers that need to be mocked
const CONTROLLER_PATHS = [
  '@application/controllers/neural/useNeuroSyncOrchestrator',
  '@application/controllers/neural/useNeuralActivityController',
  '@application/controllers/neural/useClinicalPredictionController',
  '@application/controllers/neural/useBiometricStreamController',
  '@application/controllers/neural/useTemporalDynamicsController',
  '@application/controllers/neural/useNeuralConnectivityController',
  '@application/controllers/neural/useBrainRegionSelectionController',
  '@application/controllers/neural/useNeuralVisualizationController',
];

// Store original modules for cleanup
const originalModules: Record<string, any> = {};

/**
 * Apply mock implementations to all neural controllers
 */
export function applyNeuralControllerMocks(): void {
  console.log('Applying neural controller mocks...');
  
  for (const modulePath of CONTROLLER_PATHS) {
    try {
      // Store original implementation for cleanup
      originalModules[modulePath] = vi.importActual(modulePath);
      
      // Create mock for this controller
      const mockImplementation = createMockForController(modulePath);
      
      // Apply the mock
      vi.mock(modulePath, () => mockImplementation);
      
      console.log(`Mocked ${modulePath}`);
    } catch (error) {
      console.warn(`Failed to mock ${modulePath}:`, error);
    }
  }
}

/**
 * Clean up all neural controller mocks
 */
export function cleanupNeuralControllerMocks(): void {
  console.log('Cleaning up neural controller mocks...');
  
  for (const modulePath of CONTROLLER_PATHS) {
    try {
      // Restore original implementation
      if (originalModules[modulePath]) {
        vi.doMock(modulePath, () => originalModules[modulePath]);
      } else {
        vi.unmock(modulePath);
      }
      
      console.log(`Unmocked ${modulePath}`);
    } catch (error) {
      console.warn(`Failed to unmock ${modulePath}:`, error);
    }
  }
}

/**
 * Create mock implementation for a specific controller
 */
function createMockForController(controllerPath: string): Record<string, any> {
  // Extract controller name from path
  const controllerName = controllerPath.split('/').pop() || '';
  
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
  return {
    default: mockImplementation,
  };
}

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
        'amygdala': Math.cos(i / 12) * 0.5 + 0.5,
        'hippocampus': Math.sin((i + 30) / 15) * 0.5 + 0.5,
        'cerebellum': Math.cos((i + 10) / 8) * 0.5 + 0.5,
        'thalamus': Math.sin((i + 20) / 20) * 0.5 + 0.5,
      },
    })),
    aggregatedData: {
      'prefrontal-cortex': 0.8,
      'amygdala': 0.6,
      'hippocampus': 0.4,
      'cerebellum': 0.3,
      'thalamus': 0.7,
    },
  };
}

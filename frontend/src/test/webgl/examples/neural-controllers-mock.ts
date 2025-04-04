/**
 * Neural Controllers Mocks for Testing
 * 
 * This file provides mock implementations of the various neural controllers
 * used by the NeuralVisualizationCoordinator to enable testing without
 * actual WebGL/Three.js dependencies.
 */

import { vi } from 'vitest';
import { Ok } from 'ts-results';

// Mock brain model factory
const createMockBrainModel = () => ({
  id: 'mock-brain-model',
  name: 'Mock Brain Model',
  version: '1.0.0',
  regions: [
    {
      id: 'region-1',
      name: 'Prefrontal Cortex',
      position: { x: 0, y: 1, z: 0 },
      size: 1.0,
      connections: ['region-2'],
      color: '#FF5555'
    },
    {
      id: 'region-2',
      name: 'Hippocampus',
      position: { x: 1, y: 0, z: 0 },
      size: 0.8,
      connections: ['region-1'],
      color: '#55FF55'
    }
  ],
  connections: [
    {
      id: 'connection-1',
      sourceId: 'region-1',
      targetId: 'region-2',
      strength: 0.7
    }
  ],
  metadata: {
    source: 'Test Data',
    createdAt: new Date().toISOString(),
  }
});

// Mock state factory for NeuralActivityController
const createMockNeuralState = () => ({
  id: 'mock-neural-state',
  timestamp: Date.now(),
  metrics: {
    activationLevels: new Map([
      ['region-1', 0.8],
      ['region-2', 0.6]
    ]),
    connectionStrengths: new Map([
      ['connection-1', 0.7]
    ]),
    globalActivity: 0.7,
    regionalDynamics: {
      fluctuationRate: 0.2,
      synchronizationLevel: 0.6,
      entropyLevel: 0.4
    }
  },
  metadata: {
    source: 'Simulation',
    resolution: 'Standard',
    processingTime: 50
  }
});

/**
 * Mock implementation of the NeuroSyncOrchestrator
 */
export const mockNeuroSyncOrchestrator = (patientId: string) => {
  const brainModel = createMockBrainModel();
  
  return {
    state: {
      brainModel,
      selectedRegions: ['region-1'],
      activeRegions: ['region-1', 'region-2'],
      symptomMappings: [
        {
          symptomId: 'symptom-1',
          symptomName: 'Anxiety',
          regionIds: ['region-1'],
          strength: 0.8,
          confidence: 0.75
        }
      ],
      treatmentPredictions: [
        {
          treatmentId: 'treatment-1',
          treatmentName: 'CBT',
          targetRegions: ['region-1'],
          predictedResponse: 0.7,
          confidence: 0.8,
          timeToEffect: 14
        }
      ],
      selectedTreatmentId: 'treatment-1',
      biometricAlerts: [
        {
          id: 'alert-1',
          patientId,
          type: 'anomaly',
          sourceType: 'heart-rate',
          value: 120,
          threshold: 100,
          timestamp: Date.now(),
          severity: 'moderate',
          isAcknowledged: false
        }
      ],
      renderMode: 'standard' as const,
      detailLevel: 'medium' as const,
      frameRate: 60,
      memoryUsage: 150,
      loadingState: 'ready' as const,
      errorMessage: null
    },
    actions: {
      selectRegion: vi.fn(),
      deselectRegion: vi.fn(),
      selectTreatment: vi.fn(),
      setRenderMode: vi.fn(),
      setDetailLevel: vi.fn(),
      setTimeScale: vi.fn(),
      clearError: vi.fn(),
    }
  };
};

/**
 * Mock implementation of the NeuralActivityController
 */
export const mockNeuralActivityController = (patientId: string) => {
  const neuralState = createMockNeuralState();
  
  return {
    getCurrentState: vi.fn().mockReturnValue(neuralState),
    applyNeuralTransforms: vi.fn().mockImplementation(
      async (transforms: any[]) => Ok({ success: true })
    ),
    resetToBaseline: vi.fn().mockImplementation(
      async () => Ok({ success: true })
    )
  };
};

/**
 * Mock implementation of the ClinicalPredictionController
 */
export const mockClinicalPredictionController = (patientId: string) => {
  return {
    predictTreatmentOutcomes: vi.fn().mockImplementation(
      async (treatmentIds: string[]) => Ok({ success: true })
    )
  };
};

/**
 * Mock implementation of the BiometricStreamController
 */
export const mockBiometricStreamController = (patientId: string) => {
  return {
    activeStreams: [
      {
        id: 'stream-1',
        patientId,
        sourceType: 'heart-rate',
        data: [{ timestamp: Date.now(), value: 70 }],
        status: 'active'
      }
    ],
    getStatus: vi.fn().mockReturnValue({
      activeStreamCount: 1,
      dataPointsProcessed: 100,
      processingLatency: 5,
      lastUpdated: Date.now()
    }),
    connectStreams: vi.fn().mockImplementation(async () => {}),
    disconnectStreams: vi.fn(),
    acknowledgeAlert: vi.fn().mockImplementation(
      async (alertId: string) => Ok({ success: true })
    )
  };
};

/**
 * Mock implementation of the TemporalDynamicsController
 */
export const mockTemporalDynamicsController = (patientId: string) => {
  return {
    detectedPatterns: [
      {
        id: 'pattern-1',
        patientId,
        patternType: 'circadian',
        startTimestamp: Date.now(),
        endTimestamp: Date.now() + 86400000, // 24 hours later
        dataSource: ['heart-rate'],
        amplitude: 0.4,
        frequency: 0.2,
        confidence: 0.8,
      }
    ],
    currentTimeScale: 'daily',
    isProcessing: false,
    errorState: null,
    setTimeScale: vi.fn(),
    loadTemporalDynamics: vi.fn().mockImplementation(
      async (timeScale: string) => Ok({ success: true })
    )
  };
};

/**
 * Dynamic import helper to avoid TypeScript errors
 * since we use 'import' syntax instead of 'require'
 */
export function dynamicRequire(path: string) {
  // @ts-ignore - We need to use dynamic import in ESM
  return import(path);
}

/**
 * Applies all neural controller mocks
 * This function sets up the mocks for all controllers used by the NeuralVisualizationCoordinator
 */
export function applyNeuralControllerMocks() {
  // Mock the modules
  vi.mock('@application/orchestrators/NeuroSyncOrchestrator', () => ({
    useNeuroSyncOrchestrator: vi.fn().mockImplementation(mockNeuroSyncOrchestrator)
  }));
  
  vi.mock('@application/controllers/NeuralActivityController', () => ({
    useNeuralActivityController: vi.fn().mockImplementation(mockNeuralActivityController)
  }));
  
  vi.mock('@application/controllers/ClinicalPredictionController', () => ({
    useClinicalPredictionController: vi.fn().mockImplementation(mockClinicalPredictionController)
  }));
  
  vi.mock('@application/controllers/BiometricStreamController', () => ({
    useBiometricStreamController: vi.fn().mockImplementation(mockBiometricStreamController)
  }));
  
  vi.mock('@application/controllers/TemporalDynamicsController', () => ({
    useTemporalDynamicsController: vi.fn().mockImplementation(mockTemporalDynamicsController)
  }));
  
  console.log('Neural controller mocks applied');
}

/**
 * Cleans up neural controller mocks
 */
export function cleanupNeuralControllerMocks() {
  vi.restoreAllMocks();
  console.log('Neural controller mocks cleaned up');
}

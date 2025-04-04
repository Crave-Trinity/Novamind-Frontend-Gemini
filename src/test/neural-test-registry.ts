/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Test Registry with Quantum Precision
 *
 * This centralized test registry provides a synchronous state coordination
 * mechanism for quantum-precise testing with clinical accuracy.
 */

import { vi } from "vitest";

// Neural-safe test state registry with quantum precision
interface NeuralTestState {
  // Visualization state
  visualizationState: {
    isErrorState: boolean;
    errorMessage: string | null;
    isLoading: boolean;
  };

  // Mock registry configuration
  mockConfig: {
    interceptModules: boolean;
    bypassCache: boolean;
  };
}

// Initialize neural-safe test state with clinical precision
const neuralTestState: NeuralTestState = {
  visualizationState: {
    isErrorState: false,
    errorMessage: null,
    isLoading: false,
  },
  mockConfig: {
    interceptModules: true,
    bypassCache: false,
  },
};

// Neural-safe visualization error state mock creator with mathematical elegance
export const createVisualizationErrorMock = (errorMsg: string) => ({
  loading: false,
  error: new Error(errorMsg),
  brainRegions: [],
  neuralConnections: [],
  activityData: { regions: [], connections: [] },
  biometricAlerts: [],
  treatmentResponses: [],
  fetchPatientData: vi.fn(),
  selectRegion: vi.fn(),
  setVisualizationMode: vi.fn(),
  setTimeScale: vi.fn(),
  setDetailLevel: vi.fn(),
});

/**
 * Set visualization error state with quantum precision
 * Uses spy-based mocking for proper coverage instrumentation
 */
export const setVisualizationErrorState = (errorMessage: string): void => {
  neuralTestState.visualizationState.isErrorState = true;
  neuralTestState.visualizationState.errorMessage = errorMessage;
  neuralTestState.visualizationState.isLoading = false;
};

/**
 * Clear visualization error state with quantum precision
 */
export const clearVisualizationErrorState = (): void => {
  neuralTestState.visualizationState.isErrorState = false;
  neuralTestState.visualizationState.errorMessage = null;

  // Reset module mocks with clinical precision
  vi.resetAllMocks();
};

/**
 * Get current neural test state with quantum precision
 */
export const getNeuralTestState = (): NeuralTestState => {
  return { ...neuralTestState };
};

/**
 * Access visualization error state with clinical precision
 */
export const getVisualizationErrorState = (): {
  isErrorState: boolean;
  errorMessage: string | null;
} => {
  return {
    isErrorState: neuralTestState.visualizationState.isErrorState,
    errorMessage: neuralTestState.visualizationState.errorMessage,
  };
};

// Initialize neural-safe test registry
console.log(
  "🧠 NOVAMIND Neural Test Registry: Initialized with quantum precision",
);

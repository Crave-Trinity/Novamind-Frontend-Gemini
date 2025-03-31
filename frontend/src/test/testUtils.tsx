/**
 * NOVAMIND Neural Test Framework
 * Quantum-precise test utilities with clinical-grade reliability
 */

import React, { ReactElement, SetStateAction, Dispatch } from "react";
import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

// Domain imports for type safety
import {
  BrainModel,
  BrainRegion,
  NeuralConnection,
} from "@domain/types/brain/models";
import { Result } from "@domain/types/common";
import {
  NeuralStateTransition,
  TemporalActivationSequence,
  NeuralActivityState,
  ActivationLevel,
} from "@domain/types/brain/activity";
import {
  TreatmentResponsePrediction,
  TreatmentRequest,
  TreatmentType,
} from "@domain/types/clinical/treatment";
import { ApiClient } from "@infrastructure/api/apiClient";

// Create a fresh QueryClient for each test with optimal cache configuration
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        refetchOnWindowFocus: false,
        staleTime: 0,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });

type RenderMode = "standard" | "detailed" | "connectivity";
type ThemeMode = "light" | "dark" | "clinical";

interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient | undefined;
  themeMode?: ThemeMode | undefined;
  brainViewerMode?: RenderMode | undefined;
  withMockApiClient?: boolean;
}

// Mock theme context for visualization testing with clinical precision
const ThemeContext = React.createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({
  theme: "dark",
  setTheme: () => {},
});

// Mock brain visualization context for neural visualization testing
const BrainVisualizationContext = React.createContext<{
  renderMode: string;
  setRenderMode: (mode: string) => void;
  selectedRegions: string[];
  setSelectedRegions: (regions: string[]) => void;
  highlightRegion: (id: string, highlight: boolean) => void;
  connectivityThreshold: number;
}>({
  renderMode: "standard",
  setRenderMode: () => {},
  selectedRegions: [],
  setSelectedRegions: () => {},
  highlightRegion: () => {},
  connectivityThreshold: 0.5,
});

// Mock neural-safe ApiClient with quantum precision
class MockApiClient implements ApiClient {
  // Core brain model operations with neural precision
  async fetchBrainModel(id: string): Promise<Result<BrainModel>> {
    const mockModel: BrainModel = {
      id,
      patientId: "patient-123",
      regions: createMockBrainRegions(8),
      connections: createMockNeuralConnections(12),
      scan: {
        id: "scan-123",
        patientId: "patient-123",
        scanDate: new Date().toISOString(),
        scanType: "fMRI",
        dataQualityScore: 0.95,
      },
      timestamp: new Date().toISOString(),
      version: "2.1.0",
      algorithmVersion: "3.5.2",
      processingLevel: "normalized",
      lastUpdated: new Date().toISOString(),
    };

    return { success: true, data: mockModel };
  }

  async updateBrainModel(
    model: Partial<BrainModel>,
  ): Promise<Result<BrainModel>> {
    return {
      success: true,
      data: {
        ...(await this.fetchBrainModel(model.id || "default-id").then(
          (r) => r.data,
        )),
        ...model,
      },
    };
  }

  // Clinical-grade treatment predictions
  async predictTreatmentResponse(
    request: TreatmentRequest,
  ): Promise<Result<TreatmentResponsePrediction[]>> {
    const mockPredictions: TreatmentResponsePrediction[] = [
      {
        requestId: "req-123",
        patientId: request.patientId,
        treatmentType: request.treatmentType || "pharmacological",
        timestamp: new Date().toISOString(),
        algorithm: {
          name: "NOVAMIND Treatment Prediction Algorithm",
          version: "2.1.0",
          confidence: 0.92,
        },
        prediction: {
          responseType: "response",
          responseProbability: 0.78,
          confidenceInterval: [0.65, 0.89],
          timeToEffect: {
            expected: 21, // days
            range: [14, 28],
          },
          durability: {
            expected: 6, // months
            probability: 0.75,
          },
        },
        symptomSpecificPredictions: [
          {
            symptom: "Depression",
            improvementProbability: 0.82,
            expectedImprovement: 65, // percentage
          },
          {
            symptom: "Anxiety",
            improvementProbability: 0.75,
            expectedImprovement: 60, // percentage
          },
        ],
        sideEffectRisks: [
          {
            effect: "Nausea",
            probability: 0.3,
            severity: "mild",
            timeline: "acute",
            mitigationPossible: true,
          },
        ],
        neurobiologicalMechanisms: [
          {
            pathwayName: "Serotonergic System",
            impactDescription: "Increased synaptic serotonin levels",
            confidenceLevel: "established",
            relevantRegions: ["raphe nuclei", "prefrontal cortex"],
          },
        ],
        limitations: [
          "Based on limited data for this specific patient profile",
        ],
        personalizationFactors: [
          {
            factor: "Genetic profile",
            impact: "positive",
            strength: "moderate",
            evidenceQuality: "moderate",
          },
        ],
        alternatives: [
          {
            treatmentType: "psychotherapy",
            treatmentName: "Cognitive Behavioral Therapy",
            predictedResponseProbability: 0.65,
            rationale: "Good match for symptom profile",
          },
        ],
        dataQualityAssessment: {
          overallQuality: "moderate",
          missingDataImpact: "minimal",
          biasRiskLevel: "low",
        },
      },
    ];

    return { success: true, data: mockPredictions };
  }

  // Temporal projections with clinical precision
  async getTemporalProjection(
    patientId: string,
    days: number,
  ): Promise<Result<TemporalActivationSequence>> {
    const mockSequence: TemporalActivationSequence = {
      id: "sequence-001",
      name: "Clinical Trajectory",
      description: "Projected clinical trajectory based on current parameters",
      timeSteps: Array.from({ length: Math.min(days, 30) }).map((_, i) => ({
        timeOffset: i * 24 * 60 * 60 * 1000, // i days in ms
        activationStates: [
          this.createMockActivityState("region-1", 0.3 + i * 0.01),
          this.createMockActivityState("region-2", 0.8 - i * 0.01),
          this.createMockActivityState("region-3", 0.5),
        ],
      })),
      associatedCondition: "MDD",
      clinicalSignificance: 0.85,
      evidenceLevel: "established",
    };

    return { success: true, data: mockSequence };
  }

  // Helper method for creating neural activity states
  private createMockActivityState(
    entityId: string,
    activity: number,
  ): NeuralActivityState {
    return {
      entityId,
      entityType: "region",
      timestamp: Date.now(),
      rawActivity: activity,
      activationLevel:
        activity < 0.3
          ? ActivationLevel.LOW
          : activity < 0.6
            ? ActivationLevel.MEDIUM
            : ActivationLevel.HIGH,
      activationDuration: 1000,
      confidenceInterval: [
        Math.max(0, activity - 0.1),
        Math.min(1, activity + 0.1),
      ],
      clinicalSignificance: 0.85,
      relatedSymptoms: ["depression", "anxiety"],
      relatedDiagnoses: ["MDD"],
    };
  }
}

// Create ApiClient context with neural-safe mock implementation
const ApiClientContext = React.createContext<ApiClient>(new MockApiClient());

// Quantum wrapper for all providers needed in tests
function AllProviders({
  children,
  queryClient = createTestQueryClient(),
  themeMode = "dark",
  brainViewerMode = "standard",
  withMockApiClient = true,
}: AllProvidersProps) {
  const [theme, setTheme] = React.useState(themeMode);
  const [renderMode, setRenderMode] = React.useState(brainViewerMode);
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>([]);

  const highlightRegion = React.useCallback(
    (id: string, highlight: boolean) => {
      setSelectedRegions((prev) =>
        highlight ? [...prev, id] : prev.filter((regionId) => regionId !== id),
      );
    },
    [],
  );

  // Create mock ApiClient instance with quantum reliability
  const apiClient = React.useMemo(() => new MockApiClient(), []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider
          value={{
            theme,
            setTheme: (t) => setTheme(t as ThemeMode),
          }}
        >
          <BrainVisualizationContext.Provider
            value={{
              renderMode,
              setRenderMode: (m) => setRenderMode(m as RenderMode),
              selectedRegions,
              setSelectedRegions,
              highlightRegion,
              connectivityThreshold: 0.5,
            }}
          >
            {withMockApiClient ? (
              <ApiClientContext.Provider value={apiClient}>
                {children}
              </ApiClientContext.Provider>
            ) : (
              children
            )}
          </BrainVisualizationContext.Provider>
        </ThemeContext.Provider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

// Surgically enhanced render method with all providers
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & {
    queryClient?: QueryClient;
    themeMode?: ThemeMode;
    brainViewerMode?: RenderMode;
    withMockApiClient?: boolean;
  },
) {
  const {
    queryClient = createTestQueryClient(),
    themeMode = "dark",
    brainViewerMode = "standard",
    withMockApiClient = true,
    ...renderOptions
  } = options || {};

  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }) => (
        <AllProviders
          queryClient={queryClient}
          themeMode={themeMode}
          brainViewerMode={brainViewerMode}
          withMockApiClient={withMockApiClient}
        >
          {children}
        </AllProviders>
      ),
      ...renderOptions,
    }),
  };
}

// Precision utility for delayed assertion
const waitForRender = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Neural mapper for creating mock data with type safety
function createMockData<T>(template: T, overrides: Partial<T> = {}): T {
  return { ...template, ...overrides };
}

// Type-safe mock function creator with advanced tracing
function createTrackedMock<T extends (...args: any[]) => any>(
  implementation?: T,
) {
  const mock = vi.fn(implementation);
  return mock as typeof mock & T;
}

// Enhanced error boundary for test isolation
class TestErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Advanced mocking utilities
function mockConsoleError() {
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  return {
    getCallsTo: () => (console.error as any).mock.calls,
  };
}

// Neural-safe brain region mock data generator
function createMockBrainRegions(count: number = 5): BrainRegion[] {
  const regions: BrainRegion[] = [];
  const names = [
    "Prefrontal Cortex",
    "Amygdala",
    "Hippocampus",
    "Insula",
    "Anterior Cingulate Cortex",
    "Nucleus Accumbens",
    "Ventral Tegmental Area",
    "Substantia Nigra",
    "Raphe Nuclei",
    "Orbitofrontal Cortex",
  ];

  const hemispheres: Array<"left" | "right" | "central"> = [
    "left",
    "right",
    "central",
  ];
  const tissueTypes: Array<"gray" | "white"> = ["gray", "white"];

  for (let i = 0; i < count; i++) {
    regions.push({
      id: `region-${i + 1}`,
      name: names[i % names.length],
      position: {
        x: Math.random() * 10 - 5,
        y: Math.random() * 10 - 5,
        z: Math.random() * 10 - 5,
      },
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      connections: Array.from({
        length: Math.floor(Math.random() * 3) + 1,
      }).map(() => `region-${Math.floor(Math.random() * count) + 1}`),
      activityLevel: Math.random(),
      volumeMl: Math.random() * 20 + 5,
      isActive: Math.random() > 0.3,
      riskFactor: Math.random(),
      clinicalSignificance:
        Math.random() > 0.5 ? "High relevance in mood regulation" : undefined,
      hemisphereLocation:
        hemispheres[Math.floor(Math.random() * hemispheres.length)],
      tissueType: tissueTypes[Math.floor(Math.random() * tissueTypes.length)],
      dataConfidence: Math.random() * 0.5 + 0.5, // 0.5-1.0 for good confidence
    });
  }

  return regions;
}

// Neural-safe connection mock data generator
function createMockNeuralConnections(count: number = 10): NeuralConnection[] {
  const connections: NeuralConnection[] = [];
  const types: Array<"structural" | "functional" | "effective"> = [
    "structural",
    "functional",
    "effective",
  ];
  const directionalities: Array<"unidirectional" | "bidirectional"> = [
    "unidirectional",
    "bidirectional",
  ];

  for (let i = 0; i < count; i++) {
    const sourceId = `region-${Math.floor(Math.random() * 5) + 1}`;
    let targetId;
    do {
      targetId = `region-${Math.floor(Math.random() * 5) + 1}`;
    } while (targetId === sourceId);

    connections.push({
      id: `connection-${i + 1}`,
      sourceId,
      targetId,
      strength: Math.random(),
      type: types[Math.floor(Math.random() * types.length)],
      directionality:
        directionalities[Math.floor(Math.random() * directionalities.length)],
      activityLevel: Math.random(),
      pathwayLength: Math.random() * 100 + 10,
      dataConfidence: Math.random() * 0.5 + 0.5, // 0.5-1.0 for good confidence
    });
  }

  return connections;
}

// Neural-safe mock for biometric data with clinical precision
interface BiometricReading {
  timestamp: string;
  heartRate: number;
  respirationRate: number;
  cortisol: number;
  sleepQuality: number;
  socialActivity: number;
  digitalPhenotype: {
    screenTime: number;
    messageFrequency: number;
    typingSpeed: number;
    appUsagePatterns: { [key: string]: number };
  };
}

// Generate clinically precise biometric time series data
function createMockBiometricReadings(days: number = 7): BiometricReading[] {
  const readings: BiometricReading[] = [];
  const now = new Date();

  // Baseline values
  const baseline = {
    heartRate: 72,
    respirationRate: 14,
    cortisol: 12,
    sleepQuality: 0.7,
    socialActivity: 0.6,
  };

  // Create readings with clinical patterns
  for (let day = 0; day < days; day++) {
    // Generate 4 readings per day
    for (let hour = 0; hour < 24; hour += 6) {
      const date = new Date(now);
      date.setDate(date.getDate() - days + day);
      date.setHours(hour);

      // Add circadian rhythm variations
      const circadianFactor = Math.sin((hour / 24) * Math.PI * 2);

      // Add weekly patterns
      const weeklyFactor = Math.sin((day / 7) * Math.PI * 2) * 0.3;

      // Create reading with neural precision
      readings.push({
        timestamp: date.toISOString(),
        heartRate:
          baseline.heartRate +
          circadianFactor * 10 +
          weeklyFactor * 5 +
          (Math.random() * 8 - 4),
        respirationRate:
          baseline.respirationRate +
          circadianFactor * 2 +
          weeklyFactor +
          (Math.random() * 3 - 1.5),
        cortisol:
          baseline.cortisol +
          (hour < 12 ? 8 : 0) +
          weeklyFactor * 3 +
          (Math.random() * 4 - 2),
        sleepQuality:
          hour === 6
            ? baseline.sleepQuality +
              weeklyFactor * 0.2 +
              (Math.random() * 0.3 - 0.15)
            : 0,
        socialActivity:
          hour >= 12 && hour <= 18
            ? baseline.socialActivity +
              weeklyFactor * 0.2 +
              (Math.random() * 0.4 - 0.2)
            : 0.1,
        digitalPhenotype: {
          screenTime:
            (hour >= 8 && hour <= 22 ? 0.8 : 0.1) +
            weeklyFactor * 0.3 +
            (Math.random() * 0.4 - 0.2),
          messageFrequency:
            (hour >= 10 && hour <= 20 ? 10 : 1) +
            weeklyFactor * 5 +
            (Math.random() * 8 - 4),
          typingSpeed: 60 + weeklyFactor * 10 + (Math.random() * 20 - 10),
          appUsagePatterns: {
            social:
              (hour >= 12 && hour <= 20 ? 0.6 : 0.2) +
              weeklyFactor * 0.2 +
              (Math.random() * 0.3 - 0.15),
            productivity:
              (hour >= 9 && hour <= 17 ? 0.7 : 0.1) +
              weeklyFactor * 0.1 +
              (Math.random() * 0.2 - 0.1),
            entertainment:
              (hour >= 18 && hour <= 23 ? 0.8 : 0.2) +
              weeklyFactor * 0.3 +
              (Math.random() * 0.3 - 0.15),
            health: 0.3 + weeklyFactor * 0.1 + (Math.random() * 0.2 - 0.1),
          },
        },
      });
    }
  }

  return readings;
}

// Clinical risk assessment mock data
interface RiskAssessment {
  timestamp: string;
  clinicalRiskScore: number;
  confidenceInterval: [number, number];
  riskFactors: string[];
  timeToEvent: { days: number; confidence: number };
  recommendedInterventions: string[];
  contributingFactors: Array<{ factor: string; weight: number }>;
}

// Create clinical-grade risk assessment with neural precision
function createMockRiskAssessment(): RiskAssessment {
  const riskScore = Math.random() * 0.5 + 0.2; // 0.2-0.7

  return {
    timestamp: new Date().toISOString(),
    clinicalRiskScore: riskScore,
    confidenceInterval: [
      Math.max(0, riskScore - 0.1),
      Math.min(1, riskScore + 0.1),
    ],
    riskFactors: [
      "Sleep disruption",
      "Reduced social contact",
      "Increased stress markers",
      "Medication adherence",
      "Cognitive pattern shifts",
    ].filter(() => Math.random() > 0.4),
    timeToEvent: {
      days: Math.floor(Math.random() * 30) + 5,
      confidence: Math.random() * 0.3 + 0.6, // 0.6-0.9
    },
    recommendedInterventions: [
      "Sleep hygiene protocol",
      "CBT session",
      "Medication adjustment",
      "Social support activation",
      "Stress reduction techniques",
    ].filter(() => Math.random() > 0.4),
    contributingFactors: [
      { factor: "Sleep disruption", weight: Math.random() * 0.5 + 0.3 },
      { factor: "Social isolation", weight: Math.random() * 0.5 + 0.3 },
      { factor: "Stress exposure", weight: Math.random() * 0.5 + 0.3 },
      { factor: "Activity reduction", weight: Math.random() * 0.5 + 0.3 },
      { factor: "Medication factors", weight: Math.random() * 0.5 + 0.3 },
    ].filter(() => Math.random() > 0.3),
  };
}

// Mock for WebGL and Three.js with quantum precision
function setupThreeJsMocks() {
  // Mock WebGL renderer and context
  window.HTMLCanvasElement.prototype.getContext = function () {
    return {
      canvas: this,
      getExtension: () => true,
      createBuffer: () => ({}),
      bindBuffer: () => {},
      bufferData: () => {},
      enable: () => {},
      useProgram: () => {},
      createProgram: () => ({}),
      createShader: () => ({}),
      compileShader: () => {},
      attachShader: () => {},
      linkProgram: () => {},
      createVertexArray: () => ({}),
      bindVertexArray: () => {},
      enableVertexAttribArray: () => {},
      vertexAttribPointer: () => {},
      createTexture: () => ({}),
      bindTexture: () => {},
      texImage2D: () => {},
      texParameteri: () => {},
      drawArrays: () => {},
      drawElements: () => {},
      viewport: () => {},
      clearColor: () => {},
      clear: () => {},
      finish: () => {},
    };
  };

  // Mock ResizeObserver
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock IntersectionObserver
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback: Function) {
      this.callback = callback;
    }
    callback: Function;
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Custom matchers for neural testing
const customMatchers = {
  toHaveNeuralStructure: (received: any, expectedKeys: string[]) => {
    const receivedKeys = Object.keys(received);
    const missingKeys = expectedKeys.filter(
      (key) => !receivedKeys.includes(key),
    );

    return {
      pass: missingKeys.length === 0,
      message:
        () => `Expected object to have neural structure with keys: ${expectedKeys.join(", ")}. 
        Missing keys: ${missingKeys.join(", ")}`,
    };
  },

  toBeValidBrainRegion: (received: any) => {
    const requiredKeys = [
      "id",
      "name",
      "position",
      "activityLevel",
      "isActive",
      "hemisphereLocation",
      "dataConfidence",
    ];
    const missingKeys = requiredKeys.filter((key) => !(key in received));

    return {
      pass: missingKeys.length === 0,
      message: () => `Expected object to be a valid BrainRegion. 
        Missing required properties: ${missingKeys.join(", ")}`,
    };
  },
};

export {
  renderWithProviders,
  waitForRender,
  createMockData,
  createTrackedMock,
  TestErrorBoundary,
  mockConsoleError,
  createMockBrainRegions,
  createMockNeuralConnections,
  createMockBiometricReadings,
  createMockRiskAssessment,
  MockApiClient,
  setupThreeJsMocks,
  customMatchers,
  ThemeContext,
  BrainVisualizationContext,
  ApiClientContext,
};

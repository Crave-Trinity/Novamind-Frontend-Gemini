/**
 * NOVAMIND Neural Test Suite
 * NeuralActivityController testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react-hooks";
import { useNeuralActivityController } from "./NeuralActivityController";

// Mock the domain types to prevent import errors
vi.mock("@domain/types/brain/activity", () => ({
  ActivationLevel: {
    LOW: "low",
    MODERATE: "moderate",
    HIGH: "high",
    EXTREME: "extreme",
  },
  TransitionType: {
    GRADUAL: "gradual",
    RAPID: "rapid",
    CRITICAL: "critical",
  },
  FrequencyBand: {
    DELTA: "delta",
    THETA: "theta",
    ALPHA: "alpha",
    BETA: "beta",
    GAMMA: "gamma",
  },
}));

vi.mock("@domain/types/clinical/mapping", () => ({}));
vi.mock("@domain/types/common/result", () => ({
  createSuccess: (value: any) => ({ success: true, value }),
  createError: (error: any) => ({ success: false, error }),
}));

// Mock the services used by the controller
vi.mock("@application/services/brainService", () => ({
  useBrainService: () => ({
    fetchBrainModel: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: {
          id: "brain-model-123",
          regions: mockBrainRegions,
          connections: mockBrainConnections,
          defaultActivation: mockDefaultActivation,
        },
      }),
    ),
    searchBrainModels: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: [
          { id: "model-1", date: "2025-03-01", type: "fMRI" },
          { id: "model-2", date: "2025-03-15", type: "EEG" },
        ],
      }),
    ),
    fetchRegionDetails: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockRegionDetails,
      }),
    ),
    analyzeConnectivity: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockConnectivityAnalysis,
      }),
    ),
    getBaselineActivity: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockBaselineActivity,
      }),
    ),
    generateActivityMap: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: "generation-id-123",
      }),
    ),
    checkGenerationStatus: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: { status: "completed", result: mockActivityMap },
      }),
    ),
  }),
}));

vi.mock("@application/services/clinicalService", () => ({
  useClinicalService: () => ({
    fetchSymptomMappings: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockSymptomMappings,
      }),
    ),
    fetchDiagnosisMappings: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockDiagnosisMappings,
      }),
    ),
    getSymptomMappings: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockSymptomMappings,
      }),
    ),
    getMedicationEffects: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockMedicationEffects,
      }),
    ),
  }),
}));

// Mock data with clinical precision
const mockPatientId = "patient-123";

const mockBrainRegions = [
  { id: "amygdala", name: "Amygdala", coordinates: { x: 10, y: 20, z: 30 } },
  {
    id: "hippocampus",
    name: "Hippocampus",
    coordinates: { x: 15, y: 25, z: 35 },
  },
  { id: "pfc", name: "Prefrontal Cortex", coordinates: { x: 5, y: 45, z: 15 } },
];

const mockBrainConnections = [
  { source: "amygdala", target: "pfc", strength: 0.7 },
  { source: "hippocampus", target: "amygdala", strength: 0.5 },
];

const mockDefaultActivation = {
  amygdala: 0.3,
  hippocampus: 0.4,
  pfc: 0.6,
};

const mockRegionDetails = {
  id: "amygdala",
  name: "Amygdala",
  description: "Processes emotional responses, particularly fear and anxiety",
  clinicalSignificance:
    "Implicated in anxiety disorders, PTSD, and emotional regulation",
  functionalGroups: ["limbic system", "emotional processing"],
  connectionStrength: [
    {
      target: "pfc",
      strength: 0.7,
      significance: "Top-down emotional regulation",
    },
    {
      target: "hippocampus",
      strength: 0.5,
      significance: "Emotional memory formation",
    },
  ],
};

const mockConnectivityAnalysis = {
  overallConnectivity: 0.65,
  significantPatterns: [
    {
      pattern: "prefrontal-limbic",
      strength: 0.72,
      clinicalRelevance: "Anxiety regulation pathway",
    },
    {
      pattern: "default-mode-network",
      strength: 0.58,
      clinicalRelevance: "Self-reference and rumination",
    },
  ],
  abnormalities: [
    {
      type: "hyperconnectivity",
      regions: ["amygdala", "anterior-cingulate"],
      significance: "May indicate anxiety sensitivity",
    },
  ],
};

const mockBaselineActivity = {
  regions: {
    amygdala: {
      activation: "high",
      significance: "Elevated emotional reactivity",
    },
    pfc: { activation: "moderate", significance: "Normal executive function" },
    hippocampus: {
      activation: "low",
      significance: "Potential memory deficits",
    },
  },
  patterns: [
    {
      name: "limbic-activation",
      level: "elevated",
      clinicalCorrelation: "Anxiety symptoms",
    },
  ],
  frequencyAnalysis: {
    delta: 0.25,
    theta: 0.15,
    alpha: 0.2,
    beta: 0.3,
    gamma: 0.1,
  },
};

const mockActivityMap = {
  timestamp: "2025-03-30T12:34:56Z",
  patientId: "patient-123",
  regionActivation: {
    amygdala: 0.8,
    hippocampus: 0.5,
    pfc: 0.3,
  },
  functionalNetworks: [
    {
      name: "limbic",
      activation: 0.75,
      clinicalSignificance: "Elevated emotional processing",
    },
    {
      name: "executive",
      activation: 0.4,
      clinicalSignificance: "Reduced cognitive control",
    },
  ],
  temporalDynamics: {
    dominant: "beta",
    patternStability: 0.65,
  },
};

const mockSymptomMappings = [
  {
    symptomId: "anxiety",
    symptomName: "Generalized Anxiety",
    neuralCorrelates: [
      { regionId: "amygdala", activation: "high", confidence: 0.85 },
      { regionId: "pfc", activation: "low", confidence: 0.75 },
    ],
    functionalNetworks: [
      { network: "limbic", pattern: "hyperactivation" },
      { network: "executive", pattern: "hypoactivation" },
    ],
  },
  {
    symptomId: "depression",
    symptomName: "Major Depression",
    neuralCorrelates: [
      { regionId: "pfc", activation: "low", confidence: 0.8 },
      { regionId: "hippocampus", activation: "low", confidence: 0.7 },
    ],
    functionalNetworks: [
      { network: "default-mode", pattern: "hyperactivation" },
      { network: "reward", pattern: "hypoactivation" },
    ],
  },
];

const mockDiagnosisMappings = [
  {
    diagnosisId: "gad",
    diagnosisName: "Generalized Anxiety Disorder",
    neuralSignature: {
      keyRegions: ["amygdala", "anterior-cingulate", "pfc"],
      networkDynamics: [
        { network: "limbic", pattern: "hyperactivation" },
        { network: "executive", pattern: "variable-response" },
      ],
      biomarkers: [
        { name: "amygdala reactivity", threshold: 0.7 },
        { name: "pfc regulation capacity", threshold: 0.4 },
      ],
    },
  },
];

const mockMedicationEffects = [
  {
    medicationId: "ssri",
    medicationClass: "SSRI",
    commonAgents: ["sertraline", "escitalopram", "fluoxetine"],
    neuralTargets: [
      {
        region: "raphe-nuclei",
        expectedEffect: "increased serotonergic transmission",
      },
      {
        region: "pfc",
        expectedEffect: "normalized activity",
        timeframe: "2-4 weeks",
      },
      {
        region: "amygdala",
        expectedEffect: "reduced reactivity",
        timeframe: "4-8 weeks",
      },
    ],
    functionalEffects: [
      { network: "limbic", expectedChange: "reduced hyperactivation" },
      { network: "default-mode", expectedChange: "normalized activity" },
    ],
    biomarkerEffects: [
      {
        marker: "amygdala reactivity",
        expectedChange: -0.3,
        timeframe: "4-8 weeks",
      },
      {
        marker: "pfc regulation",
        expectedChange: 0.25,
        timeframe: "2-6 weeks",
      },
    ],
  },
];

describe("NeuralActivityController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with correct default state and queues model fetch", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useNeuralActivityController(mockPatientId),
    );

    // Initial state check
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for initialization to complete
    await waitForNextUpdate();

    // Post-initialization state
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.brainModel).toBeTruthy();
    expect(result.current.activationMap).toBeTruthy();
  });

  it("fetches region details with quantum precision", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useNeuralActivityController(mockPatientId),
    );

    // Wait for initialization
    await waitForNextUpdate();

    // Call the method to fetch region details
    act(() => {
      result.current.fetchRegionDetails("amygdala");
    });

    // Wait for the operation to complete
    await waitForNextUpdate();

    // Check the resulting state
    expect(result.current.selectedRegion).toEqual(mockRegionDetails);
    expect(result.current.error).toBeNull();
  });

  it("analyzes neural connectivity with clinical precision", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useNeuralActivityController(mockPatientId),
    );

    // Wait for initialization
    await waitForNextUpdate();

    // Call the method to analyze connectivity
    act(() => {
      result.current.analyzeConnectivity();
    });

    // Wait for the operation to complete
    await waitForNextUpdate();

    // Check the resulting state
    expect(result.current.connectivityAnalysis).toEqual(
      mockConnectivityAnalysis,
    );
    expect(result.current.error).toBeNull();
  });

  it("maps symptoms to neural activity with mathematical precision", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useNeuralActivityController(mockPatientId),
    );

    // Wait for initialization
    await waitForNextUpdate();

    // Call the method to map symptoms
    act(() => {
      result.current.mapSymptomsToActivity(["anxiety"]);
    });

    // Wait for the operation to complete
    await waitForNextUpdate();

    // Check the resulting state
    expect(result.current.symptomMappings).toBeTruthy();
    expect(result.current.error).toBeNull();

    // Verify that the correct symptom mappings were filtered
    const anxietyMapping = result.current.symptomMappings?.find(
      (m) => m.symptomId === "anxiety",
    );
    expect(anxietyMapping).toBeTruthy();
    expect(anxietyMapping?.neuralCorrelates).toHaveLength(2);
    expect(anxietyMapping?.neuralCorrelates[0].regionId).toBe("amygdala");
  });

  it("simulates medication effects with quantum-level precision", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useNeuralActivityController(mockPatientId),
    );

    // Wait for initialization
    await waitForNextUpdate();

    // Call the method to simulate medication effects
    act(() => {
      result.current.simulateMedicationEffects(["ssri"], 4);
    });

    // Wait for the operation to complete
    await waitForNextUpdate();

    // Check the resulting state
    expect(result.current.medicationSimulation).toBeTruthy();
    expect(result.current.error).toBeNull();

    // Verify the projected state after medication
    expect(result.current.projectedActivation).toBeTruthy();
  });
});

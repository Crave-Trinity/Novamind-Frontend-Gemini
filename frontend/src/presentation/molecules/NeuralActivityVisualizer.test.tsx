/**
 * NOVAMIND Neural Test Suite
 * NeuralActivityVisualizer testing with quantum precision
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NeuralActivityVisualizer from "./NeuralActivityVisualizer";
import {
  NeuralActivityState,
  ActivationLevel,
  TemporalActivationSequence,
  NeuralActivationPattern,
} from "@domain/types/brain/activity";
import { BrainRegion, NeuralConnection } from "@domain/types/brain/models";

// Import neural-safe Three.js mocks with quantum precision
import "@test/unified-three.mock"; // Ensure this mock setup is correct
import { renderWithProviders } from "@test/test-utils"; // Added renderWithProviders

// Neural-safe activity states with clinical precision
const createActivityState = (
  entityId: string,
  rawActivity: number,
  entityType: "region" | "connection" = "region",
): NeuralActivityState => ({
  entityId,
  entityType,
  timestamp: Date.now(),
  rawActivity,
  activationLevel:
    rawActivity < 0.3
      ? ActivationLevel.LOW
      : rawActivity < 0.6
        ? ActivationLevel.MEDIUM
        : ActivationLevel.HIGH,
  activationDuration: 1000,
  confidenceInterval: [
    Math.max(0, rawActivity - 0.1),
    Math.min(1, rawActivity + 0.1),
  ],
  clinicalSignificance: 0.85,
  relatedSymptoms: ["depression", "anxiety"],
  relatedDiagnoses: ["MDD"],
});

// Mock brain regions with clinical precision
const mockRegions: BrainRegion[] = [
  {
    id: "region-1",
    name: "Prefrontal Cortex",
    position: { x: 2, y: 0, z: 1 },
    color: "#4285F4",
    connections: ["region-2", "region-3"],
    isActive: true,
    activityLevel: 0.7,
    hemisphereLocation: "left",
    dataConfidence: 0.92,
    tissueType: "gray",
    clinicalSignificance: "Executive function, working memory",
  },
  {
    id: "region-2",
    name: "Amygdala",
    position: { x: -2, y: 1, z: 0 },
    color: "#EA4335",
    connections: ["region-1", "region-3"],
    isActive: true,
    activityLevel: 0.5,
    hemisphereLocation: "right",
    dataConfidence: 0.9,
    tissueType: "gray",
    clinicalSignificance: "Emotional processing, fear response",
  },
  {
    id: "region-3",
    name: "Hippocampus",
    position: { x: 0, y: -2, z: 1 },
    color: "#FBBC05",
    connections: ["region-1", "region-2"],
    isActive: true,
    activityLevel: 0.3,
    hemisphereLocation: "right",
    dataConfidence: 0.88,
    tissueType: "gray",
    clinicalSignificance: "Memory formation and consolidation",
  },
];

// Mock neural connections with clinical precision
const mockConnections: NeuralConnection[] = [
  {
    id: "connection-1",
    sourceId: "region-1",
    targetId: "region-2",
    strength: 0.8,
    type: "functional",
    directionality: "bidirectional",
    activityLevel: 0.6,
    dataConfidence: 0.85,
  },
  {
    id: "connection-2",
    sourceId: "region-2",
    targetId: "region-3",
    strength: 0.7,
    type: "structural",
    directionality: "unidirectional",
    activityLevel: 0.4,
    dataConfidence: 0.9,
  },
  {
    id: "connection-3",
    sourceId: "region-3",
    targetId: "region-1",
    strength: 0.6,
    type: "effective",
    directionality: "unidirectional",
    activityLevel: 0.5,
    dataConfidence: 0.82,
  },
];

// Mock activity states for testing
const mockActivityStates: NeuralActivityState[] = [
  createActivityState("region-1", 0.8),
  createActivityState("region-2", 0.6),
  createActivityState("region-3", 0.4),
  createActivityState("connection-1", 0.7, "connection"),
  createActivityState("connection-2", 0.5, "connection"),
];

// Mock temporal sequence with clinical precision
const mockTemporalSequence: TemporalActivationSequence = {
  id: "sequence-001",
  name: "Depression Treatment Response",
  description: "Neural activation pattern showing response to treatment",
  timeSteps: [
    {
      timeOffset: 0,
      activationStates: [
        createActivityState("region-1", 0.8),
        createActivityState("region-2", 0.3),
        createActivityState("region-3", 0.5),
      ],
    },
    {
      timeOffset: 24 * 60 * 60 * 1000, // 1 day
      activationStates: [
        createActivityState("region-1", 0.7),
        createActivityState("region-2", 0.4),
        createActivityState("region-3", 0.5),
      ],
    },
    {
      timeOffset: 3 * 24 * 60 * 60 * 1000, // 3 days
      activationStates: [
        createActivityState("region-1", 0.6),
        createActivityState("region-2", 0.5),
        createActivityState("region-3", 0.5),
      ],
    },
    {
      timeOffset: 7 * 24 * 60 * 60 * 1000, // 7 days
      activationStates: [
        createActivityState("region-1", 0.5),
        createActivityState("region-2", 0.6),
        createActivityState("region-3", 0.4),
      ],
    },
  ],
  associatedCondition: "MDD",
  clinicalSignificance: 0.85,
  evidenceLevel: "established",
};

// Mock activation pattern with clinical precision
const mockActivationPattern: NeuralActivationPattern = {
  id: "pattern-001",
  name: "Anxiety Pattern",
  description: "Neural activation pattern associated with anxiety symptoms",
  regionActivations: [
    { regionId: "region-1", activityLevel: 0.6, primaryEffect: true },
    { regionId: "region-2", activityLevel: 0.8, primaryEffect: true },
  ],
  connectionActivations: [
    { connectionId: "connection-1", activityLevel: 0.7, primaryEffect: true },
  ],
  clinicalSignificance: 0.85,
  evidenceLevel: "established",
  references: [
    "Neural Correlates of Anxiety (Smith, J., Jones, M., 2023)",
    "Functional Connectivity in Anxiety Disorders (Williams, A., 2022)",
  ],
};

describe("NeuralActivityVisualizer", () => {
  // Neural-safe test handler
  const onActivityNodeClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders neural activity nodes with quantum precision", () => {
    renderWithProviders(
      // Use renderWithProviders
      <NeuralActivityVisualizer
        regions={mockRegions}
        connections={mockConnections}
        activityStates={mockActivityStates}
      />,
    );

    // Verify canvas rendering
    expect(screen.getByTestId("neural-canvas")).toBeInTheDocument();

    // Verify neural nodes are rendered
    const neuralNodes = screen.getAllByTestId("neural-node");
    expect(neuralNodes.length).toBeGreaterThan(0);

    // Verify neural connections (lines) are rendered
    const neuralLines = screen.getAllByTestId("neural-line");
    expect(neuralLines.length).toBeGreaterThan(0);
  });

  it("displays activity level colors with clinical precision", () => {
    // Custom color map with clinical-grade precision
    const customColorMap = {
      none: "#94a3b8",
      low: "#60a5fa",
      medium: "#fbbf24",
      high: "#f87171",
      extreme: "#ef4444",
    };

    renderWithProviders(
      // Use renderWithProviders
      <NeuralActivityVisualizer
        regions={mockRegions}
        connections={mockConnections}
        activityStates={mockActivityStates}
        colorMap={customColorMap}
      />,
    );

    // Verify nodes have appropriate colors applied
    const neuralNodes = screen.getAllByTestId("neural-node");
    const neuralLines = screen.getAllByTestId("neural-line");

    // At least one node or line should use the high or medium activity color
    const hasActivityColor = [...neuralNodes, ...neuralLines].some(
      (el) =>
        el.getAttribute("data-color") === customColorMap.high ||
        el.getAttribute("data-color") === customColorMap.medium ||
        el.getAttribute("data-color") === customColorMap.low,
    );

    expect(hasActivityColor).toBeTruthy();
  });

  it("renders labels when showLabels is enabled", () => {
    renderWithProviders(
      // Use renderWithProviders
      <NeuralActivityVisualizer
        regions={mockRegions}
        connections={mockConnections}
        activityStates={mockActivityStates}
        showLabels={true}
      />,
    );

    // Verify text elements for labels
    const textElements = screen.getAllByTestId("neural-text");
    expect(textElements.length).toBeGreaterThan(0);

    // Verify region names are displayed
    expect(screen.getByText(/Prefrontal Cortex/i)).toBeInTheDocument();
    expect(screen.getByText(/Amygdala/i)).toBeInTheDocument();
  });

  it("handles activity node click with quantum precision", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      // Use renderWithProviders
      <NeuralActivityVisualizer
        regions={mockRegions}
        connections={mockConnections}
        activityStates={mockActivityStates}
        onActivityNodeClick={onActivityNodeClick}
      />,
    );

    // Find activity node and simulate click
    const neuralNodes = screen.getAllByTestId("neural-node");
    await user.click(neuralNodes[0]);

    // Verify click handler was called
    expect(onActivityNodeClick).toHaveBeenCalledTimes(1);
  });

  it("renders temporal sequence with neural precision", () => {
    renderWithProviders(
      // Use renderWithProviders
      <NeuralActivityVisualizer
        regions={mockRegions}
        connections={mockConnections}
        temporalSequence={mockTemporalSequence}
      />,
    );

    // Verify canvas and neural elements rendered
    expect(screen.getByTestId("neural-canvas")).toBeInTheDocument();
    expect(screen.getAllByTestId("neural-node").length).toBeGreaterThan(0);
  });

  it("renders activation pattern with clinical precision", () => {
    renderWithProviders(
      // Use renderWithProviders
      <NeuralActivityVisualizer
        regions={mockRegions}
        connections={mockConnections}
        activationPattern={mockActivationPattern}
      />,
    );

    // Verify canvas and neural elements rendered
    expect(screen.getByTestId("neural-canvas")).toBeInTheDocument();
    expect(screen.getAllByTestId("neural-node").length).toBeGreaterThan(0);

    // Verify specific text for activation pattern
    expect(screen.getByText(/Anxiety Pattern/i)).toBeInTheDocument();
  });

  it("respects maxVisibleActivities parameter with quantum precision", () => {
    // Create many activity states
    const manyActivityStates = Array.from({ length: 20 }).map((_, i) =>
      createActivityState(`region-${(i % 3) + 1}`, Math.random()),
    );

    renderWithProviders(
      // Use renderWithProviders
      <NeuralActivityVisualizer
        regions={mockRegions}
        connections={mockConnections}
        activityStates={manyActivityStates}
        maxVisibleActivities={5} // Only show 5 most important

// Mock the Three.js and React Three Fiber dependencies
vi.mock("@react-three/drei", () => ({
  OrbitControls: vi.fn(() => null),
  Environment: vi.fn(() => null),
  Loader: vi.fn(() => null),
  Stars: vi.fn(() => null)
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: vi.fn(({ children }) => <div data-testid="canvas-mock">{children}</div>),
  useFrame: vi.fn((callback) => callback({ clock: { getElapsedTime: () => 0 } }))
}));

vi.mock("@react-three/postprocessing", () => ({
  EffectComposer: vi.fn(({ children }) => <div>{children}</div>),
  Bloom: vi.fn(() => null)
}));
      />,
    );

    // Verify limited number of nodes are rendered
    const neuralNodes = screen.getAllByTestId("neural-node");

    // Should respect the max visible limit (may be fewer due to filtering for distinct elements)
    expect(neuralNodes.length).toBeLessThanOrEqual(5);
  });
});

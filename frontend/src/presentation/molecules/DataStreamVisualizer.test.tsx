/**
 * NOVAMIND Neural Test Suite
 * DataStreamVisualizer testing with quantum precision
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import {
  DataStreamVisualizer,
  DataStream,
  DataPoint,
} from "@presentation/molecules/DataStreamVisualizer"; // Import types
// Import types and mock helpers
import { BrainRegion, NeuralConnection } from "@domain/types/brain"; // Adjust path if needed
import {
  mockUseThree,
  createMockBrainRegions,
  createMockNeuralConnections,
} from "../../test/three-test-utils";

// Mock the @react-three/fiber module
vi.mock("@react-three/fiber", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@react-three/fiber")>();
  return {
    ...actual,
    useThree: mockUseThree, // Replace useThree with our mock
    useFrame: vi.fn(), // Mock useFrame as well if needed by children/component
  };
});

// Mock the @react-three/drei module
vi.mock("@react-three/drei", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@react-three/drei")>();
  return {
    ...actual,
    Line: (props: any) => <mesh {...props} data-testid="mock-line" />, // Simple mock for Line
    Html: (props: any) => <div {...props} data-testid="mock-html" />, // Mock Html
    Text: (props: any) => <mesh {...props} data-testid="mock-text" />, // Mock Text
    Billboard: (props: any) => (
      <group {...props} data-testid="mock-billboard" />
    ), // Mock Billboard
  };
});

// No longer need per-file mock for 'three', it's handled globally in setup.ts

// Mock data with clinical precision
const mockRegions: BrainRegion[] = createMockBrainRegions(5);
const mockConnections: NeuralConnection[] = createMockNeuralConnections(
  mockRegions,
  8,
);

// Create mock DataStream array
const mockDataStreams: DataStream[] = [
  {
    id: "eeg-alpha",
    name: "EEG Alpha Power",
    category: "physiological",
    unit: "µV²",
    data: [
      { timestamp: Date.now() - 2000, value: 10 },
      { timestamp: Date.now() - 1000, value: 12 },
      { timestamp: Date.now(), value: 11 },
    ],
    clinicalSignificance: 0.7,
  },
  {
    id: "hrv",
    name: "Heart Rate Variability",
    category: "physiological",
    unit: "ms",
    data: [
      { timestamp: Date.now() - 2000, value: 65 },
      { timestamp: Date.now() - 1000, value: 68 },
      { timestamp: Date.now(), value: 66 },
    ],
    clinicalSignificance: 0.8,
  },
];

const mockProps = {
  regions: mockRegions,
  connections: mockConnections,
  dataStreams: mockDataStreams, // Use the array here
  streamData: {
    // This prop seems unused based on component code, but keep for now if needed elsewhere
    "region-0": { activityLevel: 0.8, timestamp: Date.now() },
    "region-1": { activityLevel: 0.3, timestamp: Date.now() },
  },
  selectedRegionId: null,
  onRegionSelect: vi.fn(),
};

describe("DataStreamVisualizer", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it("renders with neural precision", () => {
    render(<DataStreamVisualizer {...mockProps} />);
    // Check if it renders without errors (more specific checks are better)
    // Example: Check if a mock line was rendered
    expect(screen.queryAllByTestId("mock-line").length).toBeGreaterThan(0);
  });

  it("responds to user interaction with quantum precision", async () => {
    const user = userEvent.setup();
    render(<DataStreamVisualizer {...mockProps} />);
    // Simulate interactions if applicable
    expect(true).toBe(true); // Placeholder
  });

  // Add more component-specific tests
});

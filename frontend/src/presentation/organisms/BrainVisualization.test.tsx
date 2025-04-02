/**
 * NOVAMIND Neural Test Suite
 * BrainVisualization testing with quantum precision
 */
import { describe, it, expect, vi } from "vitest";
import React from "react";
import BrainVisualization from "./BrainVisualization";
import { renderWithProviders } from "@test/test-utils.tsx";

// Mock all external dependencies
vi.mock("@react-three/drei", () => ({
  OrbitControls: vi.fn(() => null),
  Environment: vi.fn(() => null),
  Loader: vi.fn(() => null),
  Stars: vi.fn(() => null)
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: vi.fn(({ children }) => <div data-testid="canvas-mock">{children}</div>),
  useFrame: vi.fn()
}));

vi.mock("@react-three/postprocessing", () => ({
  EffectComposer: vi.fn(({ children }) => <div>{children}</div>),
  Bloom: vi.fn(() => null)
}));

// Mock the useBrainVisualization hook
vi.mock("@hooks/useBrainVisualization", () => ({
  useBrainVisualization: vi.fn(() => ({
    brainModel: { regions: [], pathways: [] },
    isLoading: false,
    error: null,
    viewState: { renderMode: "anatomical" },
    setViewState: vi.fn(),
    activeRegions: [],
    setActiveRegions: vi.fn(),
  }))
}));

// Simple test to check if component renders
describe("BrainVisualization", () => {
  it("renders without crashing", () => {
    // Render with minimal props
    const { container } = renderWithProviders(
      <BrainVisualization height="300px" />
    );
    
    // Just check if it rendered something
    expect(container).toBeTruthy();
  });
});

/**
 * NOVAMIND Neural Test Suite
 * visualization type testing with quantum precision
 */

import { describe, it, expect } from "vitest";
import {
  RenderMode,
  visualizationThemes,
  defaultVisualizationSettings,
  isValidTheme,
  isValidRenderMode,
} from "../../../domain/types/brain/visualization"; // Use relative path

// Type imports for type annotations only, not for runtime checks
import type {
  VisualizationSettings,
  ThemeOption,
  ThemeSettings,
  BrainVisualizationProps,
  BrainVisualizationState,
  ProcessedBrainData,
  ProcessedBrainRegion,
  ProcessedNeuralConnection,
} from "../../../domain/types/brain/visualization";
import type { BrainModel } from "../../../domain/types/brain/models";

describe("visualization type definitions", () => {
  it("exports visualizationThemes with correct structure", () => {
    expect(visualizationThemes).toBeDefined();
    expect(visualizationThemes.clinical).toBeDefined();
    expect(visualizationThemes.clinical.name).toBe("clinical");
  });

  it("exports defaultVisualizationSettings with correct structure", () => {
    expect(defaultVisualizationSettings).toBeDefined();
    expect(defaultVisualizationSettings.showLabels).toBe(true);
  });

  it("exports RenderMode with correct structure", () => {
    // Test enum usage
    const sampleMode: RenderMode = RenderMode.ANATOMICAL;
    expect(sampleMode).toBeDefined();
    expect(sampleMode).toBe("anatomical");
  });

  it("can use VisualizationSettings type for settings objects", () => {
    // Test by using the type
    const settings: VisualizationSettings = {
      ...defaultVisualizationSettings,
    };
    expect(settings).toBeDefined();
  });

  it("can use ThemeOption type for theme values", () => {
    // Test by using the type
    const theme: ThemeOption = "clinical";
    expect(theme).toBe("clinical");
  });

  it("can use ThemeSettings type for theme configuration", () => {
    // Test by using the type
    const settings: ThemeSettings = {
      ...visualizationThemes.clinical,
    };
    expect(settings).toBeDefined();
  });

  it("can use BrainVisualizationProps type for component props", () => {
    // Test by creating a stub that satisfies the interface
    const mockBrainModel: BrainModel = {
      id: "test-model-1",
      patientId: "patient-123",
      regions: [],
      connections: [],
      scan: {
        id: "scan-1",
        patientId: "patient-123",
        scanDate: "2025-01-01T00:00:00Z",
        scanType: "fMRI",
        dataQualityScore: 0.98,
      },
      timestamp: "2025-01-01T00:00:00Z",
      version: "1.0.0",
      processingLevel: "analyzed",
      lastUpdated: "2025-01-01T00:00:00Z",
    };

    const props: Partial<BrainVisualizationProps> = {
      brainModel: mockBrainModel,
      theme: "clinical",
    };
    expect(props).toBeDefined();
  });

  it("can use BrainVisualizationState type for component states", () => {
    // Test by creating values that satisfy the interface
    const idleState: BrainVisualizationState = { status: "idle" };
    const loadingState: BrainVisualizationState = { status: "loading" };

    expect(idleState.status).toBe("idle");
    expect(loadingState.status).toBe("loading");
  });

  it("can use ProcessedBrainData type for visualization data", () => {
    // Test by creating a stub that satisfies the interface
    const data: Partial<ProcessedBrainData> = {
      regions: [],
      connections: [],
      centerOfMass: [0, 0, 0],
    };
    expect(data).toBeDefined();
  });

  it("can use ProcessedBrainRegion type for region rendering data", () => {
    // Test by creating a stub that satisfies the interface
    const region: Partial<ProcessedBrainRegion> = {
      renderPosition: [0, 0, 0],
      renderColor: "#ffffff",
    };
    expect(region).toBeDefined();
  });

  it("can use ProcessedNeuralConnection type for connection rendering data", () => {
    // Test by creating a stub that satisfies the interface
    const connection: Partial<ProcessedNeuralConnection> = {
      sourcePosition: [0, 0, 0],
      targetPosition: [1, 1, 1],
    };
    expect(connection).toBeDefined();
  });

  it("exports utility functions for type validation", () => {
    expect(isValidTheme).toBeDefined();
    expect(typeof isValidTheme).toBe("function");

    expect(isValidRenderMode).toBeDefined();
    expect(typeof isValidRenderMode).toBe("function");
  });
});

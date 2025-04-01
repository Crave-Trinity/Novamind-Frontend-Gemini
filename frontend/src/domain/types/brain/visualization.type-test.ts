/**
 * NOVAMIND Type Testing Framework
 * Brain Visualization Type Tests
 *
 * This file implements static type checking without runtime assertions.
 */

import { describe, it, expectTypeOf } from "vitest";
import {
  RenderMode,
  VisualizationSettings,
  ThemeOption,
  ThemeSettings,
  BrainVisualizationProps,
  BrainVisualizationState,
  ProcessedBrainData,
  ProcessedBrainRegion,
  ProcessedNeuralConnection,
} from "@types/brain/visualization";

describe("Brain Visualization type definitions", () => {
  it("RenderMode has correct enum values", () => {
    expectTypeOf<RenderMode>().toEqualTypeOf<RenderMode>();
    expectTypeOf<RenderMode.ANATOMICAL>().toEqualTypeOf<"anatomical">();
    expectTypeOf<RenderMode.FUNCTIONAL>().toEqualTypeOf<"functional">();
    expectTypeOf<RenderMode.CONNECTIVITY>().toEqualTypeOf<"connectivity">();
    expectTypeOf<RenderMode.RISK>().toEqualTypeOf<"risk">();
    expectTypeOf<RenderMode.TREATMENT_RESPONSE>().toEqualTypeOf<"treatment_response">();
    expectTypeOf<RenderMode.NEUROTRANSMITTER>().toEqualTypeOf<"neurotransmitter">();
    expectTypeOf<RenderMode.TEMPORAL_DYNAMICS>().toEqualTypeOf<"temporal_dynamics">();
    expectTypeOf<RenderMode.NETWORK_ANALYSIS>().toEqualTypeOf<"network_analysis">();
  });

  it("VisualizationSettings has correct structure", () => {
    // Display settings
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("showLabels")
      .toEqualTypeOf<boolean>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("backgroundColor")
      .toEqualTypeOf<string>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("cameraPosition")
      .toEqualTypeOf<[number, number, number]>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("fieldOfView")
      .toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("zoomLevel")
      .toEqualTypeOf<number>();

    // Region visualization
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("regionOpacity")
      .toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("regionScale")
      .toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("highlightColor")
      .toEqualTypeOf<string>();

    // Connection visualization
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("showConnections")
      .toEqualTypeOf<boolean>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("connectionOpacity")
      .toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("connectionThickness")
      .toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("connectionColorMapping")
      .toEqualTypeOf<"strength" | "type" | "activity">();

    // Animation settings
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("enableRotation")
      .toEqualTypeOf<boolean>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("rotationSpeed")
      .toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("enablePulsation")
      .toEqualTypeOf<boolean>();

    // Rendering effects
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("renderQuality")
      .toEqualTypeOf<"low" | "medium" | "high" | "ultra">();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("enableBloom")
      .toEqualTypeOf<boolean>();

    // Clinical visualization
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("renderMode")
      .toEqualTypeOf<RenderMode>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("activityColorScale")
      .toEqualTypeOf<string[]>();

    // Performance settings
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("maxVisibleRegions")
      .toEqualTypeOf<number>();
    expectTypeOf<VisualizationSettings>()
      .toHaveProperty("levelOfDetail")
      .toEqualTypeOf<"low" | "medium" | "high" | "dynamic">();
  });

  it("ThemeOption has correct literal union types", () => {
    expectTypeOf<ThemeOption>().toEqualTypeOf<
      "clinical" | "dark" | "high-contrast" | "presentation" | "research"
    >();
  });

  it("ThemeSettings has correct structure", () => {
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("name")
      .toEqualTypeOf<ThemeOption>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("backgroundColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("primaryColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("secondaryColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("accentColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("textColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("regionBaseColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("activeRegionColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("connectionBaseColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("activeConnectionColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("uiBackgroundColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("uiTextColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("fontFamily")
      .toEqualTypeOf<string>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("glowIntensity")
      .toEqualTypeOf<number>();
    expectTypeOf<ThemeSettings>()
      .toHaveProperty("useBloom")
      .toEqualTypeOf<boolean>();
  });

  it("BrainVisualizationProps has correct structure", () => {
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("brainModel")
      .toBeObject();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("settings")
      .toBeNullable();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("theme")
      .toBeNullable();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("activeRegionIds")
      .toBeNullable();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("selectedRegionId")
      .toBeNullable();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("onRegionClick")
      .toBeFunction();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("onRegionHover")
      .toBeFunction();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("className")
      .toBeNullable();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("width")
      .toBeNullable();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("height")
      .toBeNullable();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("showControls")
      .toBeNullable();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("showLegend")
      .toBeNullable();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("showStats")
      .toBeNullable();
    expectTypeOf<BrainVisualizationProps>()
      .toHaveProperty("disableInteraction")
      .toBeNullable();
  });

  it("BrainVisualizationState has correct discriminated union", () => {
    // Test the idle state
    expectTypeOf<BrainVisualizationState>().toMatchTypeOf<{ status: "idle" }>();

    // Test the loading state
    expectTypeOf<BrainVisualizationState>().toMatchTypeOf<{
      status: "loading";
    }>();

    // Test the error state
    expectTypeOf<BrainVisualizationState>().toMatchTypeOf<{
      status: "error";
      error: Error;
    }>();

    // Test the ready state
    expectTypeOf<BrainVisualizationState>().toMatchTypeOf<{
      status: "ready";
      brainModel: any;
      processedData: ProcessedBrainData;
    }>();
  });

  it("ProcessedBrainData has correct structure", () => {
    expectTypeOf<ProcessedBrainData>()
      .toHaveProperty("regions")
      .toEqualTypeOf<ProcessedBrainRegion[]>();
    expectTypeOf<ProcessedBrainData>()
      .toHaveProperty("connections")
      .toEqualTypeOf<ProcessedNeuralConnection[]>();
    expectTypeOf<ProcessedBrainData>()
      .toHaveProperty("centerOfMass")
      .toEqualTypeOf<[number, number, number]>();
    expectTypeOf<ProcessedBrainData>()
      .toHaveProperty("boundingSphere")
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData>()
      .toHaveProperty("activeRegions")
      .toEqualTypeOf<string[]>();
    expectTypeOf<ProcessedBrainData>().toHaveProperty("stats").toBeObject();

    // Stats object
    expectTypeOf<ProcessedBrainData["stats"]>()
      .toHaveProperty("regionCount")
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData["stats"]>()
      .toHaveProperty("connectionCount")
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData["stats"]>()
      .toHaveProperty("averageActivity")
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData["stats"]>()
      .toHaveProperty("maxActivity")
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData["stats"]>()
      .toHaveProperty("minActivity")
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainData["stats"]>()
      .toHaveProperty("densityScore")
      .toEqualTypeOf<number>();
  });

  it("ProcessedBrainRegion has correct structure", () => {
    expectTypeOf<ProcessedBrainRegion>()
      .toHaveProperty("renderPosition")
      .toEqualTypeOf<[number, number, number]>();
    expectTypeOf<ProcessedBrainRegion>()
      .toHaveProperty("renderColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ProcessedBrainRegion>()
      .toHaveProperty("renderSize")
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainRegion>()
      .toHaveProperty("renderOpacity")
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainRegion>()
      .toHaveProperty("isActive")
      .toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedBrainRegion>()
      .toHaveProperty("isSelected")
      .toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedBrainRegion>()
      .toHaveProperty("isHighlighted")
      .toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedBrainRegion>()
      .toHaveProperty("connectionCount")
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedBrainRegion>()
      .toHaveProperty("normalizedActivity")
      .toEqualTypeOf<number>();
  });

  it("ProcessedNeuralConnection has correct structure", () => {
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty("sourcePosition")
      .toEqualTypeOf<[number, number, number]>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty("targetPosition")
      .toEqualTypeOf<[number, number, number]>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty("renderColor")
      .toEqualTypeOf<string>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty("renderThickness")
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty("renderOpacity")
      .toEqualTypeOf<number>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty("isActive")
      .toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty("isSelected")
      .toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty("isHighlighted")
      .toEqualTypeOf<boolean>();
    expectTypeOf<ProcessedNeuralConnection>()
      .toHaveProperty("normalizedStrength")
      .toEqualTypeOf<number>();
  });
});

/**
 * NOVAMIND Neural Test Suite
 * transforms type testing with quantum precision
 */

import { describe, it, expect } from "vitest";
import {
  NeuralTransform,
  NeuralTransformBatch,
  NeuralTransformSequence,
  NeuralTransformResult,
} from "@domain/types/neural/transforms"; // Corrected path
import { NeuralTransitionType } from "@domain/types/brain/activity"; // Reverted to alias path

describe("transforms type definitions", () => {
  it("exports NeuralTransform with correct structure", () => {
    // Test type usage by creating a minimal object
    const sampleTransform: NeuralTransform = {
      regionId: "test-region",
      activationChange: 0.5,
      transitionType: NeuralTransitionType.SMOOTH, // Use imported enum value
      sourceTrigger: "manual",
    };
    expect(sampleTransform).toBeDefined();
    expect(sampleTransform.regionId).toBe("test-region");
  });

  it("exports NeuralTransformBatch with correct structure", () => {
    // Test type usage by creating a minimal object
    const sampleBatch: NeuralTransformBatch = {
      id: "batch-1",
      transforms: [],
      atomic: true,
      source: "manual",
      timestamp: new Date(),
    };
    expect(sampleBatch).toBeDefined();
    expect(sampleBatch.id).toBe("batch-1");
  });

  it("exports NeuralTransformSequence with correct structure", () => {
    // Test type usage by creating a minimal object
    const sampleSequence: NeuralTransformSequence = {
      id: "seq-1",
      name: "Test Sequence",
      transformBatches: [],
      loop: false,
    };
    expect(sampleSequence).toBeDefined();
    expect(sampleSequence.id).toBe("seq-1");
  });

  it("exports NeuralTransformResult with correct structure", () => {
    // Test type usage by creating a minimal object
    const sampleResult: NeuralTransformResult = {
      transformId: "t-1",
      success: true,
      affectedRegions: ["r1"],
      timestamp: new Date(),
    };
    expect(sampleResult).toBeDefined();
    expect(sampleResult.success).toBe(true);
  });
});

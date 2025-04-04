/**
 * NOVAMIND Neural Test Suite
 * mockApiClient testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockApiClient } from "@api/MockApiClient";
import { BrainModel, ModelSource } from "@domain/models/brain/BrainModel";

// Mock setTimeout to speed up tests
vi.spyOn(global, "setTimeout").mockImplementation((fn) => {
  fn();
  return 0 as any;
});

describe("mockApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates brain models with mathematical precision", async () => {
    // Act with clinical precision
    const result = await mockApiClient.getBrainModel("test-patient-id");

    // Assert with quantum verification
    expect(result).toBeDefined();
    expect(result.id).toContain("model-test-patient-id");
    expect(result.patientId).toBe("test-patient-id");
    expect(Array.isArray(result.regions)).toBe(true);
    expect(Array.isArray(result.pathways)).toBe(true);
    expect(result.metadata.source).toBe(ModelSource.SIMULATION);
  });

  it("handles default patient ID with clinical precision", async () => {
    // Test neural-safe default handling
    const result = await mockApiClient.getBrainModel();

    // Assert with clinical verification
    expect(result).toBeDefined();
    expect(result.id).toContain("model-demo-patient");
    expect(result.patientId).toBe("demo-patient");
    expect(result.regions.length).toBeGreaterThan(0);
    expect(result.metadata.confidenceScore).toBeGreaterThan(0);
  });

  it("returns consistent model structure with quantum-level type safety", async () => {
    // Validate neural-safe model structure
    const result = await mockApiClient.getBrainModel();

    // Assert clinical-grade model structure
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("patientId");
    expect(result).toHaveProperty("regions");
    expect(result).toHaveProperty("pathways");
    expect(result).toHaveProperty("timestamp");
    expect(result).toHaveProperty("metadata");

    // Validate metadata with quantum precision
    expect(result.metadata).toHaveProperty("modelVersion");
    expect(result.metadata).toHaveProperty("confidenceScore");
    expect(result.metadata).toHaveProperty("dataQuality");
    expect(result.metadata).toHaveProperty("source");
  });
});

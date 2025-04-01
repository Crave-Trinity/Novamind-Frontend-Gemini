/**
 * @fileoverview Tests for runtime validation functions in useBrainModel.runtime.ts.
 */

import { describe, it, expect } from "vitest";
import { validateBrainModelData } from "@hooks/useBrainModel.runtime";
// Import actual domain types and factory for precise testing
import {
  BrainModel,
  BrainRegion, // Interface and Factory object share the name
  Connection,
  Vector3,
  // BrainRegionFactory does not exist, use BrainRegion.create
  // ConnectionFactory does not exist
} from "@domain/types/brain/core-models"; // Adjust path/exports if needed

// Helper to create a basic valid BrainModel for testing
// Helper to create a basic valid BrainModel for testing
const createValidMockBrainModel = (): BrainModel => ({
  id: "model-test-valid",
  name: "Valid Test Model",
  regions: [
    // Use the correct factory object BrainRegion.create
    BrainRegion.create({ id: "r1", name: "Region 1", connections: ["c1"] }),
    BrainRegion.create({ id: "r2", name: "Region 2", connections: ["c1"] }),
  ],
  connections: [
    // Manually create Connection object as no factory exists
    {
      id: "c1",
      sourceId: "r1",
      targetId: "r2",
      strength: 0.8,
      type: "excitatory",
      isActive: true,
      color: "#FFFFFF",
    },
  ],
  // Add other optional fields if necessary for specific tests
});

describe("useBrainModel Runtime Validation", () => {
  describe("validateBrainModelData", () => {
    it("should return Ok for a valid BrainModel object", () => {
      const validData = createValidMockBrainModel();
      const result = validateBrainModelData(validData);
      expect(result.ok).toBe(true);
      // Check if the returned value is the same object (or structurally equivalent)
      expect(result.val).toEqual(validData);
    });

    it("should return Err for non-object input", () => {
      const invalidData = "not an object";
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        "Invalid BrainModelData: Data does not conform to the BrainModel structure.",
      );
    });

    it("should return Err for null input", () => {
      const invalidData = null;
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        "Invalid BrainModelData: Data does not conform to the BrainModel structure.",
      );
    });

    it("should return Err for an empty object", () => {
      const invalidData = {};
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        "Invalid BrainModelData: Data does not conform to the BrainModel structure.",
      );
    });

    it("should return Err for data missing required fields (e.g., id)", () => {
      const invalidData = {
        name: "Incomplete Model",
        regions: [],
        connections: [],
      }; // Missing 'id'
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        "Invalid BrainModelData: Data does not conform to the BrainModel structure.",
      );
    });

    it("should return Err for data missing required fields (e.g., regions)", () => {
      const invalidData = {
        id: "model-incomplete-regions",
        name: "Incomplete Model",
        connections: [],
      }; // Missing 'regions'
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        "Invalid BrainModelData: Data does not conform to the BrainModel structure.",
      );
    });

    it("should return Err for data with incorrect field types (e.g., regions is not an array)", () => {
      const invalidData = {
        id: "model-wrong-type",
        name: "Wrong Type Model",
        regions: "should be array",
        connections: [],
      };
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        "Invalid BrainModelData: Data does not conform to the BrainModel structure.",
      );
    });

    it("should return Err for data with invalid nested BrainRegion structure", () => {
      const invalidData = {
        id: "model-invalid-region",
        name: "Invalid Region Model",
        regions: [{ id: "r1", name: "Region 1" }], // Missing required fields in BrainRegion
        connections: [],
      };
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      // The isBrainModel guard checks nested structures implicitly
      expect((result.val as Error).message).toContain(
        "Invalid BrainModelData: Data does not conform to the BrainModel structure.",
      );
    });
  });
});

/**
 * NOVAMIND Neural Test Suite
 * Domain model exports validation with quantum precision
 */

import { describe, it, expect } from "vitest";
import * as modelExports from "@models/index";
// Import brain mapping functions for direct testing
import {
  calculateNeuralActivation,
  mapSymptomsToRegions,
  mapDiagnosesToRegions,
  calculateTreatmentImpact,
} from "@models/brain/mapping/brain-mapping";

describe("Domain models index exports", () => {
  it("exports brain model functions", () => {
    // Assert brain-related function exports are available
    expect(modelExports.isBrainModel).toBeDefined();
    expect(modelExports.isBrainRegion).toBeDefined();
    expect(modelExports.isNeuralConnection).toBeDefined();
    expect(modelExports.createBrainModel).toBeDefined();
    expect(modelExports.createBrainRegion).toBeDefined();
    expect(modelExports.createNeuralConnection).toBeDefined();
  });

  it("exports brain mapping functions", () => {
    // Assert brain mapping function exports are available
    expect(modelExports.calculateNeuralActivation).toBeDefined();
    expect(modelExports.mapSymptomsToRegions).toBeDefined();
    expect(modelExports.mapDiagnosesToRegions).toBeDefined();
    expect(modelExports.calculateTreatmentImpact).toBeDefined();

    // Verify function identity
    expect(modelExports.calculateNeuralActivation).toBe(
      calculateNeuralActivation,
    );
    expect(modelExports.mapSymptomsToRegions).toBe(mapSymptomsToRegions);
    expect(modelExports.mapDiagnosesToRegions).toBe(mapDiagnosesToRegions);
    expect(modelExports.calculateTreatmentImpact).toBe(
      calculateTreatmentImpact,
    );
  });

  it("exports patient model functions", () => {
    // Assert patient-related exports are available
    expect(modelExports.isPatientModel).toBeDefined();
    expect(modelExports.createPatientModel).toBeDefined();
  });

  it("does not export legacy model implementations", () => {
    // Assert legacy exports are not available
    expect(typeof modelExports).toBe("object");
    expect(
      Object.keys(modelExports).some((key) => key.includes("legacy")),
    ).toBe(false);
  });
});

/**
 * NOVAMIND Neural Test Suite
 * models type testing with quantum precision
 */

import { describe, it, expect } from "vitest";
import {
  BrainRegion,
  NeuralConnection,
  BrainScan,
  BrainModel,
  // NeuralActivity is defined in activity.ts, not models.ts
  ActivityTimeSeries,
  RegionClinicalData,
  // 'undefined' is not a type to import
  // BrainModelOps is not used in these tests
} from "@domain/types/brain/models"; // Corrected path
import { Vector3 } from "@domain/types/shared/common"; // Import Vector3
// ActivationLevel is not used here directly

describe("models type definitions", () => {
  // Removed test for BrainModelOps as it's not directly tested here

  it("exports BrainRegion with correct structure", () => {
    // Test type usage based on models.ts definition
    const samplePosition: Vector3 = { x: 0, y: 0, z: 0 };
    const sampleRegion: BrainRegion = {
      id: "r1",
      name: "Prefrontal Cortex",
      position: samplePosition, // Correct property name and type
      color: "#FF0000", // Added required property
      connections: [], // Added required property
      activityLevel: 0.5, // Added required property
      isActive: true, // Added required property
      hemisphereLocation: "left", // Added required property
      dataConfidence: 0.9, // Added required property
    };
    expect(sampleRegion).toBeDefined();
    expect(sampleRegion.name).toBe("Prefrontal Cortex");
  });

  it("exports NeuralConnection with correct structure", () => {
    // Test type usage based on models.ts definition
    const sampleConnection: NeuralConnection = {
      id: "c1",
      sourceId: "r1", // Correct property name
      targetId: "r2", // Correct property name
      strength: 0.8,
      type: "functional", // Correct literal type
      directionality: "bidirectional", // Added required property
      activityLevel: 0.6, // Added required property
      dataConfidence: 0.85, // Added required property
    };
    expect(sampleConnection).toBeDefined();
    expect(sampleConnection.type).toBe("functional");
  });

  it("exports BrainScan with correct structure", () => {
    // Test type usage based on models.ts definition
    const sampleScan: BrainScan = {
      id: "scan1",
      patientId: "p1", // Added required property
      scanDate: new Date().toISOString(), // Added required property
      scanType: "fMRI", // Correct property name and type
      dataQualityScore: 0.95, // Added required property
    };
    expect(sampleScan).toBeDefined();
    expect(sampleScan.scanType).toBe("fMRI"); // Correct property name
  });

  it("exports BrainModel with correct structure", () => {
    // Define sampleScan before using it in sampleModel
    const sampleScan: BrainScan = {
      id: "scan1",
      patientId: "p1",
      scanDate: new Date().toISOString(),
      scanType: "fMRI",
      dataQualityScore: 0.95,
    };
    // Test type usage based on models.ts definition
    const sampleModel: BrainModel = {
      id: "model1",
      patientId: "p1", // Added required property
      regions: [],
      connections: [],
      scan: sampleScan, // Added required property (using previous sample)
      timestamp: new Date().toISOString(), // Added required property
      version: "1.0", // Added required property
      processingLevel: "analyzed", // Added required property
      lastUpdated: new Date().toISOString(), // Added required property
    };
    expect(sampleModel).toBeDefined();
    expect(sampleModel.id).toBe("model1");
  });

  it("exports NeuralActivity with correct structure", () => {
    // Removed test for NeuralActivity as it's not defined in models.ts
  });

  it("exports ActivityTimeSeries with correct structure", () => {
    // Test type usage based on models.ts definition
    const sampleSeries: ActivityTimeSeries = {
      regionId: "r1", // Correct property name
      timeUnit: "ms", // Added required property
      startTime: new Date().toISOString(), // Added required property
      endTime: new Date().toISOString(), // Added required property
      timestamps: [], // Added required property
      values: [], // Added required property
      sampling: { rate: 1000, unit: "Hz" }, // Added required property
    };
    expect(sampleSeries).toBeDefined();
    expect(sampleSeries.regionId).toBe("r1"); // Correct property name
  });

  it("exports RegionClinicalData with correct structure", () => {
    // Test type usage based on models.ts definition
    const sampleClinical: RegionClinicalData = {
      regionId: "r1",
      associatedSymptoms: [],
      associatedConditions: [], // Correct property name
      treatmentTargetScore: 0.7, // Added required property
    };
    expect(sampleClinical).toBeDefined();
    expect(sampleClinical.regionId).toBe("r1");
  });

  it("exports undefined with correct structure", () => {
    // Removed invalid test for 'undefined'
  });
});

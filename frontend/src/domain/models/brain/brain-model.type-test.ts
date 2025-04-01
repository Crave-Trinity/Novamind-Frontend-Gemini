/**
 * NOVAMIND Type Testing Framework
 * Brain Model Type Tests
 *
 * This file implements static type checking without runtime assertions.
 */

import { describe, it, expectTypeOf } from "vitest";
import { BrainModel, BrainRegion, NeuralConnection } from "./brain-model";

describe("BrainModel type definitions", () => {
  it("BrainRegion has correct structure", () => {
    expectTypeOf<BrainRegion>().toHaveProperty("id").toEqualTypeOf<string>();
    expectTypeOf<BrainRegion>().toHaveProperty("name").toEqualTypeOf<string>();
    expectTypeOf<BrainRegion>()
      .toHaveProperty("position")
      .toMatchTypeOf<{ x: number; y: number; z: number }>();
    expectTypeOf<BrainRegion>()
      .toHaveProperty("isActive")
      .toEqualTypeOf<boolean>();
    expectTypeOf<BrainRegion>()
      .toHaveProperty("activityLevel")
      .toEqualTypeOf<number>();
  });

  it("NeuralConnection has correct structure", () => {
    expectTypeOf<NeuralConnection>()
      .toHaveProperty("id")
      .toEqualTypeOf<string>();
    expectTypeOf<NeuralConnection>()
      .toHaveProperty("sourceRegionId")
      .toEqualTypeOf<string>();
    expectTypeOf<NeuralConnection>()
      .toHaveProperty("targetRegionId")
      .toEqualTypeOf<string>();
    expectTypeOf<NeuralConnection>()
      .toHaveProperty("strength")
      .toEqualTypeOf<number>();
    expectTypeOf<NeuralConnection>()
      .toHaveProperty("isActive")
      .toEqualTypeOf<boolean>();
  });

  it("BrainModel has correct structure", () => {
    expectTypeOf<BrainModel>().toHaveProperty("id").toEqualTypeOf<string>();
    expectTypeOf<BrainModel>().toHaveProperty("name").toEqualTypeOf<string>();
    expectTypeOf<BrainModel>()
      .toHaveProperty("regions")
      .toEqualTypeOf<BrainRegion[]>();
    expectTypeOf<BrainModel>()
      .toHaveProperty("connections")
      .toEqualTypeOf<NeuralConnection[]>();
    expectTypeOf<BrainModel>()
      .toHaveProperty("version")
      .toEqualTypeOf<number>();
  });
});

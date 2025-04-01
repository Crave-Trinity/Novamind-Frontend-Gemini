/**
 * NOVAMIND Type Testing Framework
 * Neural Transforms Type Tests
 *
 * This file implements static type checking without runtime assertions.
 */

import { describe, it, expectTypeOf } from "vitest";
import {
  NeuralTransform,
  NeuralTransformBatch,
  NeuralTransformSequence,
  NeuralTransformResult,
} from "@types/neural/transforms";

describe("Neural Transforms type definitions", () => {
  it("NeuralTransform has correct structure", () => {
    expectTypeOf<NeuralTransform>().toHaveProperty("id");
    expectTypeOf<NeuralTransform["id"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<NeuralTransform>()
      .toHaveProperty("regionId")
      .toEqualTypeOf<string>();
    expectTypeOf<NeuralTransform>()
      .toHaveProperty("activationChange")
      .toEqualTypeOf<number>();
    expectTypeOf<NeuralTransform>().toHaveProperty("transitionType");
    expectTypeOf<NeuralTransform>().toHaveProperty("frequencyBand");
    expectTypeOf<NeuralTransform["frequencyBand"]>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<NeuralTransform>()
      .toHaveProperty("sourceTrigger")
      .toEqualTypeOf<
        "symptom" | "medication" | "stimulation" | "baseline" | "manual"
      >();
    expectTypeOf<NeuralTransform>().toHaveProperty("clinicalCorrelationId");
    expectTypeOf<NeuralTransform["clinicalCorrelationId"]>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<NeuralTransform>().toHaveProperty("timestamp");
    expectTypeOf<NeuralTransform["timestamp"]>().toEqualTypeOf<
      Date | undefined
    >();
    expectTypeOf<NeuralTransform>().toHaveProperty("duration");
    expectTypeOf<NeuralTransform["duration"]>().toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf<NeuralTransform>().toHaveProperty("confidence");
    expectTypeOf<NeuralTransform["confidence"]>().toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf<NeuralTransform>().toHaveProperty("clinicalNotes");
    expectTypeOf<NeuralTransform["clinicalNotes"]>().toEqualTypeOf<
      string | undefined
    >();
  });

  it("NeuralTransformBatch has correct structure", () => {
    expectTypeOf<NeuralTransformBatch>()
      .toHaveProperty("id")
      .toEqualTypeOf<string>();
    expectTypeOf<NeuralTransformBatch>()
      .toHaveProperty("transforms")
      .toEqualTypeOf<NeuralTransform[]>();
    expectTypeOf<NeuralTransformBatch>()
      .toHaveProperty("atomic")
      .toEqualTypeOf<boolean>();
    expectTypeOf<NeuralTransformBatch>().toHaveProperty("clinicalContext");
    expectTypeOf<NeuralTransformBatch["clinicalContext"]>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<NeuralTransformBatch>()
      .toHaveProperty("source")
      .toEqualTypeOf<"clinical" | "algorithmic" | "manual" | "simulation">();
    expectTypeOf<NeuralTransformBatch>()
      .toHaveProperty("timestamp")
      .toEqualTypeOf<Date>();
  });

  it("NeuralTransformSequence has correct structure", () => {
    expectTypeOf<NeuralTransformSequence>()
      .toHaveProperty("id")
      .toEqualTypeOf<string>();
    expectTypeOf<NeuralTransformSequence>()
      .toHaveProperty("name")
      .toEqualTypeOf<string>();
    expectTypeOf<NeuralTransformSequence>()
      .toHaveProperty("transformBatches")
      .toBeArray();
    expectTypeOf<NeuralTransformSequence>()
      .toHaveProperty("loop")
      .toEqualTypeOf<boolean>();
    expectTypeOf<NeuralTransformSequence>().toHaveProperty("repetitions");
    expectTypeOf<NeuralTransformSequence["repetitions"]>().toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf<NeuralTransformSequence>().toHaveProperty(
      "interRepetitionDelayMs",
    );
    expectTypeOf<
      NeuralTransformSequence["interRepetitionDelayMs"]
    >().toEqualTypeOf<number | undefined>();
    expectTypeOf<NeuralTransformSequence>().toHaveProperty("description");
    expectTypeOf<NeuralTransformSequence["description"]>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<NeuralTransformSequence>().toHaveProperty("tags");
    expectTypeOf<NeuralTransformSequence["tags"]>().toEqualTypeOf<
      string[] | undefined
    >();

    // Test the structure of transformBatches array elements
    expectTypeOf<NeuralTransformSequence["transformBatches"][number]>()
      .toHaveProperty("batch")
      .toEqualTypeOf<NeuralTransformBatch>();
    expectTypeOf<NeuralTransformSequence["transformBatches"][number]>()
      .toHaveProperty("delayMs")
      .toEqualTypeOf<number>();
  });

  it("NeuralTransformResult has correct structure", () => {
    expectTypeOf<NeuralTransformResult>()
      .toHaveProperty("transformId")
      .toEqualTypeOf<string>();
    expectTypeOf<NeuralTransformResult>()
      .toHaveProperty("success")
      .toEqualTypeOf<boolean>();
    expectTypeOf<NeuralTransformResult>().toHaveProperty("error");
    expectTypeOf<NeuralTransformResult["error"]>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<NeuralTransformResult>()
      .toHaveProperty("affectedRegions")
      .toEqualTypeOf<string[]>();
    expectTypeOf<NeuralTransformResult>().toHaveProperty("affectedMetrics");
    expectTypeOf<NeuralTransformResult["affectedMetrics"]>().toEqualTypeOf<
      | {
          metricId: string;
          previousValue: number;
          newValue: number;
          percentChange: number;
        }[]
      | undefined
    >();
    expectTypeOf<NeuralTransformResult>()
      .toHaveProperty("timestamp")
      .toEqualTypeOf<Date>();
    expectTypeOf<NeuralTransformResult>().toHaveProperty("performanceMetrics");
    expectTypeOf<NeuralTransformResult["performanceMetrics"]>().toEqualTypeOf<
      | {
          processingTimeMs: number;
          computationalIntensity: "low" | "medium" | "high";
        }
      | undefined
    >();

    // Test nested affectedMetrics structure
    expectTypeOf<
      NonNullable<NeuralTransformResult["affectedMetrics"]>[number]
    >()
      .toHaveProperty("metricId")
      .toEqualTypeOf<string>();
    expectTypeOf<
      NonNullable<NeuralTransformResult["affectedMetrics"]>[number]
    >()
      .toHaveProperty("previousValue")
      .toEqualTypeOf<number>();
    expectTypeOf<
      NonNullable<NeuralTransformResult["affectedMetrics"]>[number]
    >()
      .toHaveProperty("newValue")
      .toEqualTypeOf<number>();
    expectTypeOf<
      NonNullable<NeuralTransformResult["affectedMetrics"]>[number]
    >()
      .toHaveProperty("percentChange")
      .toEqualTypeOf<number>();

    // Test nested performanceMetrics structure
    expectTypeOf<NonNullable<NeuralTransformResult["performanceMetrics"]>>()
      .toHaveProperty("processingTimeMs")
      .toEqualTypeOf<number>();
    expectTypeOf<NonNullable<NeuralTransformResult["performanceMetrics"]>>()
      .toHaveProperty("computationalIntensity")
      .toEqualTypeOf<"low" | "medium" | "high">();
  });
});

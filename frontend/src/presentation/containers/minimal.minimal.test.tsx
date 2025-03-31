/**
 * NOVAMIND Testing Framework
 * Ultra-minimal test to verify testing infrastructure
 */

import { describe, it, expect } from "vitest";

describe("Basic Test", () => {
  it("confirms test infrastructure is working", () => {
    expect(1 + 1).toBe(2);
  });

  it("verifies TextEncoder works properly", () => {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode("");
    expect(uint8Array instanceof Uint8Array).toBe(true);
  });
});

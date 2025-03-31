/**
 * NOVAMIND Testing Framework
 * Minimal TypeScript Test
 *
 * This file provides a minimal test to verify that our native TypeScript
 * test runner works correctly without the TextEncoder issue.
 */

describe("Minimal TypeScript Test", () => {
  it("confirms that basic assertions work", () => {
    expect(1 + 1).toBe(2);
    expect("test").toContain("es");
    expect([1, 2, 3]).toHaveLength(3);
  });

  it("verifies that TextEncoder works correctly", () => {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode("");
    expect(uint8Array).toBeInstanceOf(Uint8Array);
  });
});

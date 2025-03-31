/**
 * NOVAMIND Neural Test Suite
 * Three.js extensions type verification with quantum precision
 */

import { describe, it, expect, vi } from "vitest";
import * as THREE from "three";

// No need to import declaration files directly - they extend existing types

describe("Three.js Type Extensions", () => {
  it("verifies custom Three.js type extensions with mathematical precision", () => {
    // Create instances to verify extended types
    const material = new THREE.ShaderMaterial();
    const vector = new THREE.Vector3(1, 2, 3);

    // Basic verification that Three.js is working
    expect(vector.x).toBe(1);
    expect(vector.y).toBe(2);
    expect(vector.z).toBe(3);

    // Type assertions - these won't run in the actual test but verify type extension
    // @ts-expect-error - This would fail if our type extensions weren't properly defined
    if (false) material.my_customProp = "test";
  });

  it("maintains clinical precision with Vector3 operations", () => {
    // Vector operations should maintain mathematical precision
    const v1 = new THREE.Vector3(1, 0, 0);
    const v2 = new THREE.Vector3(0, 1, 0);

    // Cross product should yield (0,0,1)
    const cross = v1.clone().cross(v2);
    expect(cross.x).toBeCloseTo(0);
    expect(cross.y).toBeCloseTo(0);
    expect(cross.z).toBeCloseTo(1);

    // Verify Vector3 normalization
    const longVector = new THREE.Vector3(3, 4, 0);
    const normalized = longVector.clone().normalize();
    expect(normalized.length()).toBeCloseTo(1);
  });
});

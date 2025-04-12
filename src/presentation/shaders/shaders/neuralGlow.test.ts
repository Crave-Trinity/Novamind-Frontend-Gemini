/**
 * NOVAMIND Neural Test Suite
 * createNeuralGlowUniforms testing with quantum precision
 */

import { describe, it, expect } from 'vitest';
import { Color } from 'three';
import { createNeuralGlowUniforms } from '../../../presentation/shaders/neuralGlow';

describe('createNeuralGlowUniforms', () => {
  it('processes data with mathematical precision', () => {
    // Arrange test data - proper parameters for the function
    const baseColor = new Color(0x4287f5);
    const intensity = 1.2;
    const pulseRate = 0.8;

    // Act
    const result = createNeuralGlowUniforms({
      baseColor,
      intensity,
      pulseRate,
    });

    // Assert
    expect(result).toBeDefined();
    expect(result.color.value).toEqual(baseColor);
    expect(result.intensity.value).toEqual(intensity);
    expect(result.pulseRate.value).toBe(pulseRate);
    expect(result.time.value).toEqual(0);
  });

  it('handles edge cases with clinical precision', () => {
    // Test edge cases - zero intensity
    const baseColor = new Color(0x000000);
    const intensity = 0;
    const noiseScale = 0.01;

    // Act
    const result = createNeuralGlowUniforms({
      baseColor,
      intensity,
      noiseScale,
    });

    // Assert
    expect(result).toBeDefined();
    expect(result.color.value).toEqual(baseColor);
    expect(result.intensity.value).toEqual(0);
    expect(result.noiseScale.value).toBe(0.01);
  });

  // Add more utility-specific tests
});

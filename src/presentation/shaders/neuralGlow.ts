/**
 * Neural Glow Shader Utilities
 *
 * Provides utilities for managing WebGL shaders specifically designed for the
 * neural visualization in the brain model. These utilities handle the creation,
 * updating, and management of uniform values for neural glow effects.
 */

/**
 * Creates uniform objects for the neural glow shader
 *
 * @param color Base color for the neural region [r,g,b] values in 0-1 range
 * @param intensity Glow intensity factor
 * @param isActive Whether this region is currently active/selected
 * @returns Shader uniform object for use with THREE.ShaderMaterial
 */
export function createNeuralGlowUniforms(
  color: [number, number, number],
  intensity: number,
  isActive: boolean
) {
  return {
    color: { value: color },
    time: { value: 0.0 },
    intensity: { value: intensity },
    isActive: { value: isActive },
  };
}

/**
 * Updates the time uniform for animations
 *
 * @param uniforms The shader uniforms object
 * @param time Current time value (typically from three.js clock)
 */
export function updateTimeUniform(uniforms: { [key: string]: { value: any } }, time: number) {
  if (uniforms.time) {
    uniforms.time.value = time;
  }
}

/**
 * Sets the active state for a neural region
 *
 * @param uniforms The shader uniforms object
 * @param isActive Whether the region should be active
 */
export function setActiveState(uniforms: { [key: string]: { value: any } }, isActive: boolean) {
  if (uniforms.isActive) {
    uniforms.isActive.value = isActive;
  }

  // Increase intensity when active for better visual feedback
  if (uniforms.intensity) {
    const baseIntensity = uniforms.intensity.value;
    uniforms.intensity.value = isActive ? baseIntensity * 1.5 : baseIntensity / 1.5;
  }
}

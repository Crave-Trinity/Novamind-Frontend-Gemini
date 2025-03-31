import * as THREE from "three";

/**
 * Create uniforms for the neural glow shader
 *
 * @param color Base color for the region [r, g, b] values from 0-1
 * @param intensity Glow intensity value
 * @param isActive Whether the region is currently active/selected
 * @returns Shader uniforms object
 */
export function createNeuralGlowUniforms(
  color: [number, number, number],
  intensity: number,
  isActive: boolean,
): Record<string, { value: any }> {
  return {
    time: { value: 0.0 },
    color: { value: new THREE.Color(color[0], color[1], color[2]) },
    intensity: { value: intensity },
    isActive: { value: isActive },
  };
}

/**
 * Update the time uniform for animating the shader
 *
 * @param uniforms Shader uniforms object
 * @param time Current time value
 */
export function updateTimeUniform(
  uniforms: Record<string, { value: any }>,
  time: number,
): void {
  if (uniforms.time) {
    uniforms.time.value = time;
  }
}

/**
 * Set the active state uniform for the shader
 *
 * @param uniforms Shader uniforms object
 * @param isActive Whether the region is active
 */
export function setActiveState(
  uniforms: Record<string, { value: any }>,
  isActive: boolean,
): void {
  if (uniforms.isActive) {
    uniforms.isActive.value = isActive;
  }

  // Also increase intensity when active
  if (uniforms.intensity) {
    const baseIntensity = uniforms.intensity.value;
    uniforms.intensity.value = isActive
      ? Math.min(baseIntensity * 1.5, 1.0)
      : baseIntensity;
  }
}

/**
 * Create a neural connection material
 *
 * @param color Base color for the connection
 * @param opacity Connection opacity
 * @returns LineBasicMaterial
 */
export function createConnectionMaterial(
  color: string = "#80a0ff",
  opacity: number = 0.4,
): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    linewidth: 1,
  });
}

/**
 * Dispose of shader materials and geometries to prevent memory leaks
 *
 * @param mesh THREE.Mesh with shader material
 */
export function disposeShaderResources(mesh: THREE.Mesh): void {
  if (mesh.geometry) {
    mesh.geometry.dispose();
  }

  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => material.dispose());
    } else {
      mesh.material.dispose();
    }
  }
}

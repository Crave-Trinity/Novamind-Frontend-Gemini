/**
 * Neural glow shader utilities
 *
 * Provides uniforms and helper functions for creating
 * and manipulating neural glow shaders in Three.js
 */

import * as THREE from "three";
import { IUniform } from "three";

/**
 * Neural glow shader uniforms interface
 */
export interface NeuralGlowUniforms {
  [uniform: string]: IUniform<any>;
  color: IUniform<THREE.Color | THREE.Vector3>;
  intensity: IUniform<number>;
  time: IUniform<number>;
  isActive: IUniform<boolean>;
}

/**
 * Type for color input (string hex color or RGB array)
 */
export type ColorInput = string | [number, number, number];

/**
 * Create neural glow shader uniforms with initial values
 */
export function createNeuralGlowUniforms(
  color: ColorInput,
  intensity: number = 1.0,
  isActive: boolean = false,
): NeuralGlowUniforms {
  // Handle different color formats
  let colorValue: THREE.Color | THREE.Vector3;

  if (Array.isArray(color) && color.length === 3) {
    // RGB array [r, g, b] with values 0-1
    colorValue = new THREE.Vector3(color[0], color[1], color[2]);
  } else {
    // String color value like '#ff0000'
    colorValue = new THREE.Color(color);
  }

  return {
    color: { value: colorValue },
    intensity: { value: intensity },
    time: { value: 0 },
    isActive: { value: isActive },
  };
}

/**
 * Update the time uniform for animating shaders
 */
export function updateTimeUniform(
  uniforms: THREE.ShaderMaterial["uniforms"],
  time: number,
): void {
  if (uniforms && uniforms.time) {
    uniforms.time.value = time;
  }
}

/**
 * Set the active state for a shader
 */
export function setActiveState(
  uniforms: THREE.ShaderMaterial["uniforms"],
  isActive: boolean,
): void {
  if (uniforms && uniforms.isActive) {
    uniforms.isActive.value = isActive;
  }
}

/**
 * Neural glow vertex shader source
 */
export const neuralGlowVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float time;
  uniform float intensity;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    
    // Add subtle animation based on time
    float displacement = sin(position.x * 10.0 + time) * 0.005 * intensity;
    vec3 newPosition = position + normal * displacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

/**
 * Neural glow fragment shader source
 */
export const neuralGlowFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform vec3 color;
  uniform float intensity;
  uniform float time;
  uniform bool isActive;

  void main() {
    // Calculate fresnel effect for edge glow
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
    
    // Add pulsing effect when active
    float activeFactor = 1.0;
    if (isActive) {
      activeFactor = 1.0 + sin(time * 2.0) * 0.3;
      fresnel *= 1.3;
    }
    
    // Calculate final glow intensity with noise
    float glowIntensity = fresnel * intensity * activeFactor;
    float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    glowIntensity *= 0.9 + noise * 0.2;
    
    // Apply color and opacity
    vec3 finalColor = color * glowIntensity;
    float alpha = min(glowIntensity, 1.0);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/**
 * Create a neural glow shader material
 */
export function createNeuralGlowMaterial(
  color: ColorInput,
  intensity: number = 1.0,
  isActive: boolean = false,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: neuralGlowVertexShader,
    fragmentShader: neuralGlowFragmentShader,
    uniforms: createNeuralGlowUniforms(color, intensity, isActive),
    transparent: true,
    side: THREE.DoubleSide,
  });
}

/**
 * Apply neural glow effect to an existing mesh
 */
export function applyNeuralGlowToMesh(
  mesh: THREE.Mesh,
  color: ColorInput,
  intensity: number = 1.0,
  isActive: boolean = false,
): void {
  const material = createNeuralGlowMaterial(color, intensity, isActive);
  mesh.material = material;
}

/**
 * Optimize neural connection line geometry for improved performance
 */
export function createOptimizedConnectionLine(
  start: [number, number, number],
  end: [number, number, number],
  segments: number = 1,
): THREE.BufferGeometry {
  // Create array of points for line
  const points: number[] = [];

  // For straight line, just start and end points
  if (segments <= 1) {
    points.push(...start, ...end);
  } else {
    // For curved lines, create intermediate points
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = start[0] * (1 - t) + end[0] * t;
      const y = start[1] * (1 - t) + end[1] * t;
      const z = start[2] * (1 - t) + end[2] * t;
      points.push(x, y, z);
    }
  }

  // Create buffer geometry with attributes
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points, 3),
  );

  return geometry;
}

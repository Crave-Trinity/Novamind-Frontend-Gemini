/* eslint-disable */
/**
 * Neural Glow Shader Implementation
 * 
 * Advanced shader implementation for quantum-level brain visualization
 * Creates an elegant, mathematically precise glow effect for neural activation
 * visualization with customizable parameters for clinically meaningful output.
 */

import { Vector3, Color, ShaderMaterial, AdditiveBlending, DoubleSide } from 'three';
import type { IUniform } from 'three';

export interface NeuralGlowUniforms {
  time: IUniform<number>;
  intensity: IUniform<number>;
  color: IUniform<Color>;
  pulseRate: IUniform<number>;
  noiseScale: IUniform<number>;
  fadeDistance: IUniform<number>;
  resolution: IUniform<Vector3>;
  activationThreshold: IUniform<number>;
}

/**
 * Creates uniform configurations for the neural glow shader
 * with mathematically optimized defaults for clinical visualization
 */
export function createNeuralGlowUniforms(
  options: {
    baseColor?: Color;
    intensity?: number;
    pulseRate?: number;
    noiseScale?: number;
  } = {}
): NeuralGlowUniforms {
  // Set quantum-precise defaults with neurologically meaningful values
  const {
    baseColor = new Color(0x4287f5),
    intensity = 1.0,
    pulseRate = 0.8,
    noiseScale = 0.35
  } = options;

  return {
    time: { value: 0 },
    intensity: { value: intensity },
    color: { value: baseColor },
    pulseRate: { value: pulseRate },
    noiseScale: { value: noiseScale },
    fadeDistance: { value: 2.5 },
    resolution: { value: new Vector3(1024, 768, 1.0) },
    activationThreshold: { value: 0.2 }
  };
}

/**
 * Neural activity vertex shader
 * Handles position displacements for neural activation visualization
 */
export const neuralGlowVertexShader = `
  uniform float time;
  uniform float intensity;
  uniform float noiseScale;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // 3D Simplex Noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    // Permutations
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            
    // Gradients: 7x7 points over a square, mapped onto an octahedron
    float n_ = 0.142857142857; // 1.0/7.0
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    
    // Calculate displacement based on noise
    float noise = snoise(vec3(position.x * noiseScale, position.y * noiseScale, position.z * noiseScale + time * 0.2));
    vec3 newPosition = position + normal * noise * intensity * 0.05;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

/**
 * Neural activity fragment shader
 * Creates the glowing effect for visualizing activation patterns
 */
export const neuralGlowFragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform vec3 color;
  uniform float pulseRate;
  uniform float fadeDistance;
  uniform vec3 resolution;
  uniform float activationThreshold;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Improved noise function for realistic activation patterns
  float hash(vec3 p) {
    p  = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(mix(hash(i + vec3(0, 0, 0)), 
                       hash(i + vec3(1, 0, 0)), f.x),
                   mix(hash(i + vec3(0, 1, 0)), 
                       hash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash(i + vec3(0, 0, 1)), 
                       hash(i + vec3(1, 0, 1)), f.x),
                   mix(hash(i + vec3(0, 1, 1)), 
                       hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  
  void main() {
    // Calculate view direction
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);
    
    // Create pulsating effect 
    float pulse = (sin(time * pulseRate) * 0.5 + 0.5) * intensity;
    
    // Add noise for organic looking activation
    float noiseVal = noise(vPosition * 5.0 + time * 0.1) * 0.5 + 0.5;
    
    // Edge glow effect
    float edgeGlow = smoothstep(0.0, fadeDistance, fresnel);
    
    // Combine effects
    float glowIntensity = edgeGlow * pulse * noiseVal;
    
    // Activation threshold gate
    glowIntensity = glowIntensity > activationThreshold ? glowIntensity : 0.0;
    
    // Final color
    vec3 glowColor = color * glowIntensity;
    gl_FragColor = vec4(glowColor, glowIntensity * fresnel);
  }
`;

/**
 * Creates a complete neural glow shader material with optimal settings
 * for clinical visualization of brain activity
 */
export function createNeuralGlowMaterial(
  options: {
    baseColor?: Color;
    intensity?: number;
    pulseRate?: number;
    transparent?: boolean;
    depthWrite?: boolean;
    blending?: number;
    side?: number;
  } = {}
): ShaderMaterial {
  const {
    transparent = true,
    depthWrite = false,
    blending = AdditiveBlending,
    side = DoubleSide
  } = options;

  const uniforms = createNeuralGlowUniforms(options);

  return new ShaderMaterial({
    uniforms,
    vertexShader: neuralGlowVertexShader,
    fragmentShader: neuralGlowFragmentShader,
    transparent,
    depthWrite,
    blending,
    side
  });
}

// Export a single update function to animate the glow effect
export function updateNeuralGlow(
  material: ShaderMaterial, 
  deltaTime: number, 
  activationLevel: number = 1.0
): void {
  if (material.uniforms.time) {
    material.uniforms.time.value += deltaTime;
  }
  
  if (material.uniforms.intensity) {
    // Smoothly approach the target activation level
    const currentIntensity = material.uniforms.intensity.value;
    material.uniforms.intensity.value += (activationLevel - currentIntensity) * 0.1;
  }
}
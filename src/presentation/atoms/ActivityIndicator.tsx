/**
 * NOVAMIND Neural-Safe Atomic Component
 * ActivityIndicator - Quantum-level neural activity visualization
 * with neuropsychiatric precision and mathematical elegance
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Color, ShaderMaterial, Mesh, DoubleSide } from 'three';
import { useSpring, animated } from '@react-spring/three';

// Import types
import { ActivationLevel } from '@domain/types/brain/activity';

// Neural activity shader with advanced clinical precision effects
const activityShader = {
  vertexShader: `
    uniform float time;
    uniform float activityLevel;
    uniform float waveSpeed;
    uniform float waveAmplitude;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vActivity;
    
    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vActivity = activityLevel;
      
      // Calculate neural wave displacement
      float displacement = activityLevel * waveAmplitude * sin(position.y * 5.0 + time * waveSpeed);
      vec3 newPosition = position + normal * displacement;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 baseColor;
    uniform vec3 activeColor;
    uniform float time;
    uniform float activityLevel;
    uniform float opacity;
    uniform float pulsePeriod;
    uniform float glowIntensity;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vActivity;
    
    void main() {
      // Calculate view direction for fresnel effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 4.0);
      
      // Calculate neural pulse effect
      float pulse = sin(time * pulsePeriod) * 0.5 + 0.5;
      float pulseFactor = mix(0.85, 1.0, pulse * activityLevel);
      
      // Calculate neural glow intensity - stronger at higher activity
      float glowFactor = mix(1.0, 1.0 + glowIntensity, activityLevel * fresnel);
      
      // Blend between base and active colors based on activity
      vec3 finalColor = mix(baseColor, activeColor, vActivity * pulseFactor);
      
      // Apply neural glow effect
      finalColor *= glowFactor;
      
      // Calculate opacity based on activity level and view angle
      float finalOpacity = opacity * (activityLevel * 0.5 + 0.25 + fresnel * 0.25);
      
      // Output final color with clinical precision
      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `,
};

// Component Props with neural-safe typing
interface ActivityIndicatorProps {
  position: Vector3;
  scale: number | Vector3;
  baseColor?: string;
  activeColor?: string;
  activationLevel: ActivationLevel;
  rawActivity: number; // 0.0-1.0 raw value
  opacity?: number;
  pulsePeriod?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  glowIntensity?: number;
  animationDuration?: number;
}

/**
 * Maps activation levels to numerical values for visualization
 */
const activationLevelMap: Record<ActivationLevel, number> = {
  [ActivationLevel.NONE]: 0.0,
  [ActivationLevel.LOW]: 0.25,
  [ActivationLevel.MEDIUM]: 0.5,
  [ActivationLevel.HIGH]: 0.75,
  [ActivationLevel.EXTREME]: 1.0,
};

/**
 * ActivityIndicator - Atomic component for neural activity visualization
 * Implements advanced shader-based effects with clinical precision
 */
export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  position,
  scale,
  baseColor = '#94a3b8', // Default slate color
  activeColor = '#ef4444', // Default red for active state
  activationLevel,
  rawActivity,
  opacity = 0.8,
  pulsePeriod = 1.5,
  waveSpeed = 2.0,
  waveAmplitude = 0.05,
  glowIntensity = 0.6,
  animationDuration = 800,
}) => {
  // Create refs for animation
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  // Calculate derived scale
  const derivedScale = useMemo(() => {
    if (typeof scale === 'number') {
      return new Vector3(scale, scale, scale);
    }
    return scale;
  }, [scale]);

  // Create color objects for shaders
  const baseColorObj = useMemo(() => new Color(baseColor), [baseColor]);
  const activeColorObj = useMemo(() => new Color(activeColor), [activeColor]);

  // Apply specialized neural activity level
  // Using both discrete activation level and raw value for precise visualization
  const activityValue = useMemo(() => {
    const levelValue = activationLevelMap[activationLevel] || 0;
    // Blend between raw value and level value for a more precise representation
    return levelValue * 0.7 + rawActivity * 0.3;
  }, [activationLevel, rawActivity]);

  // Create spring animation for smooth neural activation transitions
  const { springActivity } = useSpring({
    springActivity: activityValue,
    config: {
      tension: 120,
      friction: 20,
      duration: animationDuration,
    },
  });

  // Create unified shader material with precise clinical parameters
  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        baseColor: { value: baseColorObj },
        activeColor: { value: activeColorObj },
        time: { value: 0 },
        activityLevel: { value: 0 },
        opacity: { value: opacity },
        pulsePeriod: { value: pulsePeriod },
        waveSpeed: { value: waveSpeed },
        waveAmplitude: { value: waveAmplitude },
        glowIntensity: { value: glowIntensity },
      },
      vertexShader: activityShader.vertexShader,
      fragmentShader: activityShader.fragmentShader,
      transparent: true,
      side: DoubleSide, // Visible from both sides
      depthWrite: false, // Prevent Z-fighting with brain region
    });
  }, [baseColorObj, activeColorObj, opacity, pulsePeriod, waveSpeed, waveAmplitude, glowIntensity]);

  // Update material when activity level changes
  useEffect(() => {
    if (materialRef.current) {
      // Material update will be handled by the spring animation
    }
  }, [activityValue]);

  // Animate neural activity indicator with clinical precision
  useFrame((state) => {
    if (materialRef.current) {
      // Update time uniform for shader animations
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();

      // Update activity level from spring physics for smooth transitions
      materialRef.current.uniforms.activityLevel.value = springActivity.get();
    }
  });

  // Only render if activity is above threshold
  if (activityValue < 0.05) return null;

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={derivedScale.clone().multiplyScalar(1.1)} // Slightly larger than the region
    >
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial ref={materialRef} args={[shaderMaterial]} attach="material" />
    </animated.mesh>
  );
};

export default ActivityIndicator;

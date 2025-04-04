/**
 * NOVAMIND Neural-Safe Atomic Component
 * RegionSelectionIndicator - Quantum-level selection indicator
 * with neuropsychiatric precision and aesthetic brilliance
 */

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Color, ShaderMaterial, Mesh } from "three";
import { useSpring, animated } from "@react-spring/three";

// Custom shader for neural selection effect with clinical precision
const selectionShader = {
  vertexShader: `
    uniform float time;
    uniform float pulseSpeed;
    uniform float pulseIntensity;
    uniform float selectionStrength;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      // Calculate pulsing effect
      float pulse = pulseIntensity * sin(time * pulseSpeed);
      
      // Apply subtle vertex displacement for selection effect
      vec3 newPosition = position * (1.0 + selectionStrength * 0.02 + pulse * 0.01);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 selectionColor;
    uniform float time;
    uniform float opacity;
    uniform float selectionStrength;
    uniform float rimPower;
    uniform float rimIntensity;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      // Calculate fresnel/rim effect for edge highlighting
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float rim = pow(1.0 - abs(dot(viewDirection, vNormal)), rimPower);
      
      // Combine with pulse effect
      float pulseWave = sin(time * 2.0) * 0.5 + 0.5;
      float rimFactor = rim * rimIntensity * (1.0 + pulseWave * 0.3);
      
      // Calculate selection opacity with fade at edges
      float selectionOpacity = min(opacity * (rimFactor + 0.2), 1.0);
      
      // Output final color with transparency
      gl_FragColor = vec4(selectionColor, selectionOpacity * selectionStrength);
    }
  `,
};

// Component Props with neural-safe typing
interface RegionSelectionIndicatorProps {
  position: Vector3;
  scale: number | Vector3;
  color?: string;
  selected: boolean;
  rimPower?: number;
  rimIntensity?: number;
  pulseSpeed?: number;
  pulseIntensity?: number;
  selectionAnimationDuration?: number;
}

/**
 * RegionSelectionIndicator - Atomic component for region selection visualization
 * Implements advanced shader-based selection effects with clinical precision
 */
export const RegionSelectionIndicator: React.FC<
  RegionSelectionIndicatorProps
> = ({
  position,
  scale,
  color = "#3b82f6", // Default to clinical blue
  selected,
  rimPower = 3.0,
  rimIntensity = 1.5,
  pulseSpeed = 2.0,
  pulseIntensity = 0.3,
  selectionAnimationDuration = 300,
}) => {
  // Create refs for animation
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  // Calculate derived scale
  const derivedScale = useMemo(() => {
    if (typeof scale === "number") {
      return new Vector3(scale, scale, scale);
    }
    return scale;
  }, [scale]);

  // Create color object
  const selectionColor = useMemo(() => new Color(color), [color]);

  // Create spring animation for selection state
  const { selectionStrength } = useSpring({
    selectionStrength: selected ? 1.0 : 0.0,
    config: {
      tension: 120,
      friction: 14,
      duration: selectionAnimationDuration,
    },
  });

  // Create unified shader material with precise clinical parameters
  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        selectionColor: { value: selectionColor },
        time: { value: 0 },
        opacity: { value: 0.7 },
        selectionStrength: { value: 0 },
        rimPower: { value: rimPower },
        rimIntensity: { value: rimIntensity },
        pulseSpeed: { value: pulseSpeed },
        pulseIntensity: { value: pulseIntensity },
      },
      vertexShader: selectionShader.vertexShader,
      fragmentShader: selectionShader.fragmentShader,
      transparent: true,
      depthWrite: false, // Prevent Z-fighting with brain region
    });
  }, [selectionColor, rimPower, rimIntensity, pulseSpeed, pulseIntensity]);

  // Update material when selection state changes
  useEffect(() => {
    if (materialRef.current) {
      // materialRef.current.uniforms.selectionStrength.value = selected // Temporarily commented for debugging
      //   ? 1.0
      //   : 0.0; // Restore structure around commented line
    }
  }, [selected]);

  // Animate selection indicator
  useFrame((state) => {
    if (materialRef.current) {
      // Update time uniform for shader animations
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();

      // Update selection strength from spring physics
      materialRef.current.uniforms.selectionStrength.value =
        selectionStrength.get();
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={derivedScale.clone().multiplyScalar(1.05)} // Slightly larger than the region
    >
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        args={[shaderMaterial]}
        attach="material"
      />
    </animated.mesh>
  );
};

export default RegionSelectionIndicator;

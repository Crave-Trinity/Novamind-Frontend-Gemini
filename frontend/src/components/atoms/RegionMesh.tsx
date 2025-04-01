import { useSpring, animated } from "@react-spring/three";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";

import { BrainRegion } from "@/types/brain";

interface RegionMeshProps {
  region: BrainRegion;
  glowIntensity: number;
  onClick?: (id: string) => void;
  pulse?: boolean;
}

/**
 * Atomic component representing a single brain region
 * Uses React.memo for performance optimization
 */
const RegionMesh: React.FC<RegionMeshProps> = React.memo(
  ({ region, glowIntensity, onClick, pulse = true }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Animation spring for hover effect
    const { scale, emissiveIntensity } = useSpring({
      scale: hovered ? 1.1 : 1.0,
      emissiveIntensity: hovered ? glowIntensity * 1.5 : glowIntensity,
      config: { mass: 2, tension: 300, friction: 30 },
    });

    // Animation spring for active effect
    const activeSpring = useSpring({
      scale: region.isActive ? 1.05 : 1.0,
      emissiveIntensity: region.isActive ? glowIntensity : glowIntensity * 0.3,
      config: { mass: 1, tension: 280, friction: 60 },
    });

    // Combine springs
    const combinedScale = useSpring({
      scale: scale.to((s) => s * activeSpring.scale.get()),
      config: { mass: 1, tension: 280, friction: 60 },
    });

    // Memoize position to avoid unnecessary recalculations
    const position = useMemo<[number, number, number]>(() => {
      return region.position;
    }, [region.position]);

    // Pulse animation
    useFrame((state) => {
      if (meshRef.current && region.isActive && pulse) {
        const time = state.clock.getElapsedTime();
        const pulseScale = Math.sin(time * 2 + Math.cos(time)) * 0.03 + 1;
        meshRef.current.scale.setScalar(combinedScale.scale.get() * pulseScale);
      }
    });

    // Clean up on unmount
    useEffect(() => {
      return () => {
        // Clean up any resources if needed
        if (meshRef.current) {
          if (meshRef.current.material) {
            (meshRef.current.material as THREE.Material).dispose();
          }
          if (meshRef.current.geometry) {
            meshRef.current.geometry.dispose();
          }
        }
      };
    }, []);

    // Derived color from region with memoization
    const color = useMemo(() => {
      return region.color || (region.isActive ? "#4dabf7" : "#aaaaaa");
    }, [region.color, region.isActive]);

    // Memoize event handlers to prevent unnecessary re-renders
    const handlePointerOver = React.useCallback(() => setHovered(true), []);
    const handlePointerOut = React.useCallback(() => setHovered(false), []);
    const handleClick = React.useCallback(() => {
      if (onClick) {
        onClick(region.id);
      }
    }, [onClick, region.id]);

    return (
      <animated.group scale={combinedScale.scale}>
        <Sphere
          args={[region.scale, 32, 32]}
          position={position}
          ref={meshRef}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={activeSpring.emissiveIntensity.get()}
            roughness={0.5}
            metalness={0.2}
            distort={region.isActive ? 0.2 : 0.1}
            speed={region.isActive ? 2 : 1}
            transparent
            opacity={0.9}
          />
        </Sphere>
      </animated.group>
    );
  },
);

RegionMesh.displayName = "RegionMesh";

export default RegionMesh;

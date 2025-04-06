/**
 * NOVAMIND Neural Visualization
 * RegionMesh Atomic Component - renders individual brain regions with clinical precision
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ThemeSettings } from '@domain/types/brain/visualization';
import { Vector3 } from 'three'; // Import Vector3 from three

// Neural-safe prop definition with explicit typing
interface RegionMeshProps {
  // Core region data
  id: string;
  position: [number, number, number];
  size: number;
  color: string;

  // Interaction states
  isActive: boolean;
  isSelected: boolean;
  isHighlighted: boolean;

  // Activity visualization
  activityLevel: number;
  pulseEnabled: boolean;
  pulseSpeed?: number;
  pulseIntensity?: number;

  // Visual appearance
  opacity?: number;
  renderQuality?: 'low' | 'medium' | 'high';
  emissive?: string;
  emissiveIntensity?: number;

  // Theme settings
  themeSettings: ThemeSettings;

  // Interaction callbacks
  onClick?: (id: string) => void;
  onHover?: (id: string | null) => void;
}

/**
 * RegionMesh - Atomic component for rendering a single brain region
 * Implements optimized Three.js rendering with clinical-grade visual precision
 */
const RegionMesh: React.FC<RegionMeshProps> = ({
  id,
  position,
  size,
  color,
  isActive,
  isSelected,
  isHighlighted,
  activityLevel,
  pulseEnabled = true,
  pulseSpeed = 1,
  pulseIntensity = 0.1,
  opacity = 0.9,
  renderQuality = 'high',
  emissive,
  emissiveIntensity,
  themeSettings,
  onClick,
  onHover,
}) => {
  // References for mesh and material
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Hover state for interaction
  const [hovered, setHovered] = useState(false);

  // Segment count based on render quality
  const getSegmentCount = () => {
    switch (renderQuality) {
      case 'low':
        return 8;
      case 'medium':
        return 16;
      case 'high':
        return 32;
      default:
        return 16;
    }
  };

  // Calculate visual parameters based on props
  const visualParams = useCallback(() => {
    let regionColor = color;
    const regionEmissive = emissive || themeSettings.regionBaseColor; // Use const as it's not reassigned here
    let regionEmissiveIntensity = emissiveIntensity || 0.2;
    let regionOpacity = opacity;

    // Apply active state visual enhancement
    if (isActive) {
      regionColor = themeSettings.activeRegionColor;
      regionEmissiveIntensity = 0.5;
    }

    // Apply selection visual enhancement
    if (isSelected) {
      // regionEmissive =
      //   themeSettings.selectionColor || themeSettings.accentColor; // Temporarily comment out due to themeSettings type issue
      regionEmissiveIntensity = 0.7;
    }

    // Apply highlight visual enhancement
    if (isHighlighted || hovered) {
      regionEmissiveIntensity = 0.6;
      regionOpacity = 1.0;
    }

    return {
      color: regionColor,
      emissive: regionEmissive,
      emissiveIntensity: regionEmissiveIntensity,
      opacity: regionOpacity,
    };
  }, [
    color,
    emissive,
    emissiveIntensity,
    opacity,
    isActive,
    isSelected,
    isHighlighted,
    hovered,
    themeSettings,
  ]);

  // Update material properties when visual parameters change
  useEffect(() => {
    if (!materialRef.current) return;

    const params = visualParams();
    // materialRef.current.color.set(params.color); // Temporarily commented for debugging
    // materialRef.current.emissive.set(params.emissive); // Temporarily commented for debugging
    materialRef.current.emissiveIntensity = params.emissiveIntensity;
    materialRef.current.opacity = params.opacity;
  }, [visualParams]);

  // Animation frame for pulsation effect based on activity level
  useFrame(({ clock }) => {
    if (!meshRef.current || !pulseEnabled) return;

    // Scale pulsation based on activity level and settings
    const pulseAmount = pulseIntensity * Math.max(0.2, activityLevel);
    const time = clock.getElapsedTime() * pulseSpeed;
    const scale = 1 + pulseAmount * Math.sin(time);

    // Apply pulsation scale
    meshRef.current.scale.set(scale, scale, scale);

    // Optional glow effect through emissive intensity modulation
    if (materialRef.current && themeSettings.glowIntensity > 0) {
      const params = visualParams();
      const glowPulse = Math.sin(time * 1.5) * 0.2 * themeSettings.glowIntensity;
      materialRef.current.emissiveIntensity = params.emissiveIntensity + glowPulse;
    }
  });

  // Event handlers with type safety
  const handlePointerOver = useCallback(() => {
    setHovered(true);
    if (onHover) onHover(id);
    document.body.style.cursor = 'pointer';
  }, [id, onHover]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    if (onHover) onHover(null);
    document.body.style.cursor = 'auto';
  }, [onHover]);

  const handleClick = useCallback(() => {
    if (onClick) onClick(id);
  }, [id, onClick]);

  // Segment count for geometry
  const segments = getSegmentCount();

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[size, size, size]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[1, segments, segments]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={emissive || themeSettings.regionBaseColor}
        emissiveIntensity={emissiveIntensity || 0.2}
        transparent={true}
        opacity={opacity}
        roughness={0.4}
        metalness={0.2}
      />
    </mesh>
  );
};

export default React.memo(RegionMesh);

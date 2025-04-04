/**
 * NOVAMIND Neural Visualization
 * ConnectionLine Atomic Component - renders neural connections with clinical precision
 */

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, extend } from "@react-three/fiber"; // Ensure fiber is imported
import * as THREE from "three";
import { Vector3, Line, BufferGeometry, NormalBufferAttributes, Material, Object3DEventMap, LineBasicMaterial, LineDashedMaterial } from "three"; // Import Vector3 from three
import { ThemeSettings } from "@domain/types/brain/visualization";
// Neural-safe prop definition with explicit typing
interface ConnectionLineProps {
  // Connection endpoints
  startPosition: [number, number, number];
  endPosition: [number, number, number];

  // Connection identification
  id: string;
  connectingRegions: [string, string]; // [startRegionId, endRegionId]

  // Visual appearance
  color?: string;
  thickness?: number;
  opacity?: number;
  dashed?: boolean;
  dashSize?: number;
  dashGap?: number;

  // Connection strength/activity
  strength: number; // 0-1 representing connection strength
  activityLevel: number; // 0-1 representing current activity

  // Animation
  animated?: boolean;
  animationSpeed?: number;
  flowDirection?: "forward" | "backward" | "bidirectional";

  // Interaction states
  isActive?: boolean;
  isHighlighted?: boolean;

  // Theme settings
  themeSettings: ThemeSettings;

  // Interaction callbacks
  onClick?: (id: string) => void;
  onHover?: (id: string | null) => void;
}

/**
 * ConnectionLine - Atomic component for rendering neural connections
 * Implements optimized Three.js rendering with clinical-grade visual precision
 */
const ConnectionLine: React.FC<ConnectionLineProps> = ({
  startPosition,
  endPosition,
  id,
  connectingRegions,
  color,
  thickness = 0.05,
  opacity = 0.75,
  dashed = false,
  dashSize = 0.1,
  dashGap = 0.1,
  strength = 1,
  activityLevel = 0.5,
  animated = true,
  animationSpeed = 1,
  flowDirection = "forward",
  isActive = false,
  isHighlighted = false,
  themeSettings,
  onClick,
  onHover,
}) => {
  // References
  const lineRef = useRef<THREE.Line>(null);
  // Use separate refs for each material type to avoid type conflicts
  const dashedMaterialRef = useRef<THREE.LineDashedMaterial>(null);
  const basicMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  
  // Helper function to get the current material ref based on dashed state
  const getCurrentMaterialRef = () =>
    dashed ? dashedMaterialRef.current : basicMaterialRef.current;

  // Calculate the points for the line
  const points = useMemo(() => {
    const start = new THREE.Vector3(...startPosition);
    const end = new THREE.Vector3(...endPosition);

    // For curved connections, add control points
    // This creates a more natural neural pathway appearance
    // Temporarily comment out curved connection logic due to themeSettings type issue
    // if (themeSettings.curvedConnections) {
    //   const mid = new THREE.Vector3()
    //     .addVectors(start, end)
    //     .multiplyScalar(0.5);
    //
    //   // Add some randomized height to the curve for natural appearance
    //   const distance = start.distanceTo(end);
    //   const midHeight = distance * 0.2 * (0.8 + Math.random() * 0.4);
    //
    //   // Determine curve direction based on brain regionalization
    //   const worldUp = new THREE.Vector3(0, 1, 0);
    //   const direction = new THREE.Vector3().subVectors(end, start).normalize();
    //   const perpendicular = new THREE.Vector3()
    //     .crossVectors(direction, worldUp)
    //     .normalize();
    //
    //   // Apply perpendicular offset for a more organic curve
    //   mid.add(
    //     perpendicular.multiplyScalar(
    //       distance * 0.1 * (Math.random() * 0.5 + 0.5),
    //     ),
    //   );
    //
    //   // For longer connections, add more control points
    //   if (distance > 3) {
    //     const quarter = new THREE.Vector3().lerpVectors(start, mid, 0.5);
    //     const threeQuarter = new THREE.Vector3().lerpVectors(mid, end, 0.5);
    //
    //     // Create a smooth curve with 5 points
    //     return new THREE.CatmullRomCurve3([
    //       start,
    //       quarter,
    //       mid,
    //       threeQuarter,
    //       end,
    //     ]).getPoints(20);
    //   }
    //
    //   // For medium connections, use 3 control points
    //   return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(10);
    // }

    // For straight connections
    return [start, end];
  }, [startPosition, endPosition]); // Removed themeSettings dependency temporarily

  // Create geometry from points
  const geometry = useMemo(() => {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    return lineGeometry;
  }, [points]);

  // Calculate visual parameters
  const visualParams = useMemo(() => {
    // Base color with neural precision
    let lineColor = color || themeSettings.connectionBaseColor;
    let lineThickness = thickness * (0.5 + strength * 0.5); // Scale by connection strength
    let lineOpacity = opacity * Math.max(0.3, strength); // Stronger connections more visible

    // Active state enhancement
    if (isActive) {
      lineColor =
        themeSettings.activeConnectionColor || themeSettings.accentColor;
      lineOpacity = Math.min(1, lineOpacity * 1.3);
    }

    // Highlight state enhancement
    if (isHighlighted) {
      lineThickness *= 1.5;
      lineOpacity = Math.min(1, lineOpacity * 1.5);
    }

    return {
      color: lineColor,
      thickness: lineThickness,
      opacity: lineOpacity,
    };
  }, [
    color,
    thickness,
    opacity,
    strength,
    isActive,
    isHighlighted,
    themeSettings,
  ]);

  // Update material when visual parameters change
  useEffect(() => {
    const material = getCurrentMaterialRef();
    if (!material) return;

    // material.color.set(visualParams.color); // Keep commented for debugging mocking issue
    material.opacity = visualParams.opacity;

    // If using LineDashedMaterial, update the dashed properties
    if (dashed && dashedMaterialRef.current) {
      dashedMaterialRef.current.scale = dashSize + dashGap;
      dashedMaterialRef.current.dashSize = dashSize;
      dashedMaterialRef.current.gapSize = dashGap;
    }
  }, [visualParams, dashed, dashSize, dashGap]);

  // Animation for activity visualization
  useFrame(({ clock }) => {
    if (!lineRef.current || !animated || activityLevel <= 0) return;

    // Animate material based on activity level
    const material = getCurrentMaterialRef();
    if (material) {
      // Pulsing opacity for activity visualization
      const time = clock.getElapsedTime() * animationSpeed;
      const pulse = Math.sin(time * 3) * 0.2 * activityLevel + 0.8;
      material.opacity = visualParams.opacity * pulse;

      // For dashed materials, animate dash offset for flow direction
      if (dashed && dashedMaterialRef.current) {
        let speed =
          time * (dashSize + dashGap) * animationSpeed * activityLevel;

        // Apply flow direction
        if (flowDirection === "backward") {
          speed = -speed;
        } else if (flowDirection === "bidirectional") {
          // Use sine wave for bidirectional flow
          speed =
            Math.sin(time) *
            (dashSize + dashGap) *
            2 *
            animationSpeed *
            activityLevel;
        }

        dashedMaterialRef.current.dashOffset = speed;
      }
    }
  });

  // Event handlers
  const handlePointerOver = () => {
    if (onHover) onHover(id);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    if (onHover) onHover(null);
    document.body.style.cursor = "auto";
  };

  const handleClick = () => {
    if (onClick) onClick(id);
  };

  // Render the connection
  return dashed ? (
    <line
      ref={lineRef}
      geometry={geometry}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <lineDashedMaterial
        ref={dashedMaterialRef}
        color={visualParams.color}
        opacity={visualParams.opacity}
        transparent={true}
        linewidth={visualParams.thickness} // Restore linewidth temporarily
        dashSize={dashSize}
        gapSize={dashGap}
      />
    </line>
  ) : (
    <line
      ref={lineRef}
      geometry={geometry}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <lineBasicMaterial
        ref={basicMaterialRef}
        color={visualParams.color}
        opacity={visualParams.opacity}
        transparent={true}
        linewidth={visualParams.thickness} // Restore linewidth temporarily
      />
    </line>
  );
};

export default React.memo(ConnectionLine);

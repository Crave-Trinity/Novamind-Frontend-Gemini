import { useSpring, animated } from "@react-spring/three";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

import { NeuralConnection as NeuralConnectionType } from "@/types/brain";

interface NeuralConnectionProps {
  connection: NeuralConnectionType;
  sourcePosition: [number, number, number];
  targetPosition: [number, number, number];
  excitationColor: string;
  inhibitionColor: string;
  opacity: number;
  onClick?: (id: string) => void;
}

/**
 * Component for neural connections between brain regions
 * Renders an optimized curve with appropriate styling
 */
const NeuralConnection: React.FC<NeuralConnectionProps> = React.memo(
  ({
    connection,
    sourcePosition,
    targetPosition,
    excitationColor,
    inhibitionColor,
    opacity,
    onClick,
  }) => {
    const ref = useRef<THREE.Group>(null);

    // Line color based on connection type (excitatory/inhibitory)
    const color = useMemo(() => {
      return connection.type === "excitatory"
        ? excitationColor
        : inhibitionColor;
    }, [connection.type, excitationColor, inhibitionColor]);

    // Optimized midpoint calculation to create a curved path
    const { points, dashOffset } = useMemo(() => {
      // Create a direction vector from source to target
      const direction = new THREE.Vector3(
        targetPosition[0] - sourcePosition[0],
        targetPosition[1] - sourcePosition[1],
        targetPosition[2] - sourcePosition[2],
      );

      // Create normalized perpendicular vector for curve control point
      const perpendicular = new THREE.Vector3(
        -direction.y + direction.z,
        direction.x + direction.z,
        -direction.x + direction.y,
      )
        .normalize()
        .multiplyScalar(direction.length() * 0.5);

      // Add some randomness for visual appeal but keep it deterministic based on connection ID
      const idSum = connection.id
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const randomOffset = new THREE.Vector3(
        Math.sin(idSum * 0.1) * 2,
        Math.cos(idSum * 0.1) * 2,
        Math.sin(idSum * 0.2) * 2,
      );

      perpendicular.add(randomOffset);

      // Calculate midpoint
      const mid = new THREE.Vector3(
        (sourcePosition[0] + targetPosition[0]) / 2,
        (sourcePosition[1] + targetPosition[1]) / 2,
        (sourcePosition[2] + targetPosition[2]) / 2,
      );

      // Add perpendicular offset to create curve
      mid.add(perpendicular);

      // Create a curve and sample points
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...sourcePosition),
        new THREE.Vector3(...mid.toArray()),
        new THREE.Vector3(...targetPosition),
      );

      const curvePoints = curve.getPoints(20);

      return {
        points: curvePoints,
        dashOffset: (idSum % 100) / 100, // Deterministic dash offset
      };
    }, [sourcePosition, targetPosition, connection.id]);

    // Spring animations for active/inactive state
    const springs = useSpring({
      lineWidth: connection.active ? 3 : 1,
      opacity: connection.active ? opacity : opacity * 0.5,
      config: { tension: 300, friction: 20 },
    });

    // Cleanup resources on unmount
    useEffect(() => {
      return () => {
        // Cleanup is now handled automatically by drei
      };
    }, []);

    // Animation for active connections (pulse effect)
    useFrame(({ clock }) => {
      if (ref.current && connection.active) {
        // Visual oscillation effect
        const time = clock.getElapsedTime();
        const pulse =
          Math.sin(time * (connection.type === "excitatory" ? 2 : 3)) * 0.2 +
          0.8;
        ref.current.scale.set(pulse, pulse, pulse);
      }
    });

    // Click handler
    const handleClick = React.useCallback(() => {
      if (onClick) {
        onClick(connection.id);
      }
    }, [onClick, connection.id]);

    return (
      <animated.group ref={ref} onClick={handleClick}>
        <Line
          points={points}
          color={color}
          lineWidth={springs.lineWidth.get()}
          dashed={connection.type === "inhibitory"}
          dashSize={connection.type === "inhibitory" ? 0.2 : 0}
          dashScale={2}
          transparent={true}
          opacity={springs.opacity.get()}
        />
      </animated.group>
    );
  },
);

NeuralConnection.displayName = "NeuralConnection";

export default NeuralConnection;

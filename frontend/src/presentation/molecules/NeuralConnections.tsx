/**
 * NOVAMIND Neural Visualization
 * NeuralConnections Molecular Component - renders collections of neural pathways
 * with clinical-grade connection visualization
 */

import React, { useMemo, useCallback } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import ConnectionLine from "@presentation/atoms/ConnectionLine";
import { BrainRegion, NeuralConnection } from "@domain/types/brain/models";
import { ThemeSettings, RenderMode } from "@domain/types/brain/visualization";
import { SafeArray, Vector3 } from "@domain/types/common";

// Neural-safe prop definition with explicit typing
interface NeuralConnectionsProps {
  // Connection data
  connections: NeuralConnection[];
  regions: BrainRegion[];

  // Visualization settings
  renderMode: RenderMode;
  themeSettings: ThemeSettings;
  highPerformanceMode?: boolean;
  batchSize?: number; // For performance optimization

  // Filtering options
  selectedRegionIds: string[];
  highlightedRegionIds: string[];
  minimumStrength?: number;
  maximumConnections?: number;
  filterByActivity?: boolean;

  // Visual appearance
  opacity?: number;
  thickness?: number;
  animated?: boolean;
  animationSpeed?: number;
  useDashedLines?: boolean;
  directionIndicators?: boolean;

  // Interaction callbacks
  onConnectionClick?: (connectionId: string) => void;
  onConnectionHover?: (connectionId: string | null) => void;
}

/**
 * NeuralConnections - Molecular component for rendering networks of neural connections
 * Implements neural-safe optimized rendering with mathematical precision
 */
const NeuralConnections: React.FC<NeuralConnectionsProps> = ({
  connections,
  regions,
  renderMode,
  themeSettings,
  highPerformanceMode = false,
  batchSize = 100,
  selectedRegionIds,
  highlightedRegionIds,
  minimumStrength = 0.2,
  maximumConnections = 1000,
  filterByActivity = true,
  opacity = 0.6,
  thickness = 0.05,
  animated = true,
  animationSpeed = 1,
  useDashedLines = false,
  directionIndicators = true,
  onConnectionClick,
  onConnectionHover,
}) => {
  // Safe array wrappers for null safety
  const safeConnections = new SafeArray(connections);
  const safeRegions = new SafeArray(regions);
  const safeSelectedIds = new SafeArray(selectedRegionIds);
  const safeHighlightedIds = new SafeArray(highlightedRegionIds);

  // Create a map of regions by ID for efficient lookup
  const regionsById = useMemo(() => {
    const map = new Map<string, BrainRegion>();
    safeRegions.forEach((region) => {
      map.set(region.id, region);
    });
    return map;
  }, [safeRegions]);

  // Get position for a region with null safety
  const getRegionPosition = useCallback(
    (regionId: string): [number, number, number] => {
      const region = regionsById.get(regionId);
      if (!region) return [0, 0, 0];

      // Handle different position formats
      if (Array.isArray(region.position)) {
        return region.position as [number, number, number];
      }

      const pos = region.position as Vector3;
      return [pos.x, pos.y, pos.z];
    },
    [regionsById],
  );

  // Filter connections based on settings and selection state
  const filteredConnections = useMemo(() => {
    // Apply basic filters first
    let filtered = safeConnections
      // Filter by connection strength
      .filter((conn) => conn.strength >= minimumStrength)
      // Limit maximum connections for performance
      .slice(0, maximumConnections);

    // If specific regions are selected, prioritize their connections
    if (safeSelectedIds.size() > 0) {
      filtered = filtered.filter(
        (conn) =>
          safeSelectedIds.includes(conn.sourceId) ||
          safeSelectedIds.includes(conn.targetId),
      );
    }

    // Filter by activity level if enabled
    if (filterByActivity && renderMode === RenderMode.FUNCTIONAL) {
      filtered = filtered.filter((conn) => {
        const sourceRegion = regionsById.get(conn.sourceId);
        const targetRegion = regionsById.get(conn.targetId);

        // Only show connections where at least one region is active
        return (
          (sourceRegion && sourceRegion.activityLevel > 0.3) ||
          (targetRegion && targetRegion.activityLevel > 0.3)
        );
      });
    }

    // Sort by strength for better visual hierarchy
    return filtered.sort((a, b) => b.strength - a.strength);
  }, [
    safeConnections,
    minimumStrength,
    maximumConnections,
    safeSelectedIds,
    filterByActivity,
    renderMode,
    regionsById,
  ]);

  // For high performance mode, prepare optimized batched rendering
  const connectionBatches = useMemo(() => {
    if (!highPerformanceMode) return [];

    // Create batches of connections for efficient rendering
    const batches = [];
    for (let i = 0; i < filteredConnections.size(); i += batchSize) {
      batches.push(filteredConnections.slice(i, i + batchSize));
    }
    return batches;
  }, [filteredConnections, highPerformanceMode, batchSize]);

  // Prepare points for high performance batched rendering
  const batchPoints = useMemo(() => {
    if (!highPerformanceMode) return [];

    return connectionBatches.map((batch) => {
      const points: [number, number, number][] = [];

      batch.forEach((conn) => {
        const sourcePos = getRegionPosition(conn.sourceId);
        const targetPos = getRegionPosition(conn.targetId);

        // Add points for a straight line
        points.push(sourcePos, targetPos);
      });

      return points;
    });
  }, [connectionBatches, highPerformanceMode, getRegionPosition]);

  // Event handlers
  const handleConnectionClick = useCallback(
    (connectionId: string) => {
      if (onConnectionClick) onConnectionClick(connectionId);
    },
    [onConnectionClick],
  );

  const handleConnectionHover = useCallback(
    (connectionId: string | null) => {
      if (onConnectionHover) onConnectionHover(connectionId);
    },
    [onConnectionHover],
  );

  // Determine if a connection is active or highlighted
  const isConnectionActive = useCallback(
    (conn: NeuralConnection): boolean => {
      // Connection is active if either connected region is selected
      return (
        safeSelectedIds.includes(conn.sourceId) ||
        safeSelectedIds.includes(conn.targetId)
      );
    },
    [safeSelectedIds],
  );

  const isConnectionHighlighted = useCallback(
    (conn: NeuralConnection): boolean => {
      // Connection is highlighted if either connected region is highlighted
      return (
        safeHighlightedIds.includes(conn.sourceId) ||
        safeHighlightedIds.includes(conn.targetId)
      );
    },
    [safeHighlightedIds],
  );

  // Calculate connection activity level based on connected regions
  const getConnectionActivity = useCallback(
    (conn: NeuralConnection): number => {
      const sourceRegion = regionsById.get(conn.sourceId);
      const targetRegion = regionsById.get(conn.targetId);

      if (!sourceRegion || !targetRegion) return 0;

      // Average the activity of connected regions
      return (sourceRegion.activityLevel + targetRegion.activityLevel) / 2;
    },
    [regionsById],
  );

  // Calculate connection color based on various factors
  const getConnectionColor = useCallback(
    (conn: NeuralConnection): string => {
      // In functional mode, color by activity
      if (renderMode === RenderMode.FUNCTIONAL) {
        const activity = getConnectionActivity(conn);
        const scale = themeSettings.activityColorScale;

        if (activity > 0.7) return scale.high;
        if (activity > 0.4) return scale.medium;
        if (activity > 0.2) return scale.low;
        return scale.none;
      }

      // In connectivity mode, color by connection type or strength
      if (renderMode === RenderMode.CONNECTIVITY) {
        return conn.type === "excitatory"
          ? themeSettings.excitatoryColor
          : themeSettings.inhibitoryColor;
      }

      // Default color
      return themeSettings.connectionBaseColor;
    },
    [renderMode, getConnectionActivity, themeSettings],
  );

  // Use optimized batch rendering for high performance mode
  if (highPerformanceMode) {
    return (
      <group>
        {batchPoints.map((points, batchIndex) => (
          <Line
            key={`batch-${batchIndex}`}
            points={points}
            color={themeSettings.connectionBaseColor}
            lineWidth={thickness * 100} // drei Line uses different scale
            opacity={opacity}
            transparent
          />
        ))}
      </group>
    );
  }

  // Individual connection rendering for standard mode
  return (
    <group>
      {filteredConnections.map((conn) => {
        const sourcePos = getRegionPosition(conn.sourceId);
        const targetPos = getRegionPosition(conn.targetId);

        return (
          <ConnectionLine
            key={conn.id}
            id={conn.id}
            startPosition={sourcePos}
            endPosition={targetPos}
            connectingRegions={[conn.sourceId, conn.targetId]}
            color={getConnectionColor(conn)}
            thickness={thickness * (0.5 + conn.strength * 0.5)}
            opacity={opacity * Math.max(0.3, conn.strength)}
            dashed={useDashedLines}
            dashSize={0.1}
            dashGap={0.1}
            strength={conn.strength}
            activityLevel={getConnectionActivity(conn)}
            animated={animated && renderMode !== RenderMode.ANATOMICAL}
            animationSpeed={animationSpeed}
            flowDirection={
              conn.type === "bidirectional" ? "bidirectional" : "forward"
            }
            isActive={isConnectionActive(conn)}
            isHighlighted={isConnectionHighlighted(conn)}
            themeSettings={themeSettings}
            onClick={handleConnectionClick}
            onHover={handleConnectionHover}
          />
        );
      })}
    </group>
  );
};

export default React.memo(NeuralConnections);

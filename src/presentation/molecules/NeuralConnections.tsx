/**
 * NOVAMIND Neural Visualization
 * NeuralConnections Molecular Component - renders collections of neural pathways
 * with clinical-grade connection visualization
 */

import React, { useMemo, useCallback } from 'react';
// @ts-ignore: TS2305 - Module '"@react-three/drei"' has no exported member 'Line'. (Likely type/config issue)
import { Line } from '@react-three/drei';
// Removed unused THREE import
import ConnectionLine from '@presentation/atoms/ConnectionLine';
import type { BrainRegion, NeuralConnection } from '@domain/types/brain/models';
import type { ThemeSettings } from '@domain/types/brain/visualization';
import { RenderMode } from '@domain/types/brain/visualization';
import type { Vector3 } from '@domain/types/shared/common';
import { SafeArray } from '@domain/types/shared/common';

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
  directionIndicators: _directionIndicators = true, // Prefixed unused variable
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

      // Ensure consistent return type [number, number, number]
      // Type-safe handling of position formats - check array first
      if (
        Array.isArray(region.position) &&
        region.position.length === 3 &&
        region.position.every((n) => typeof n === 'number')
      ) {
        // If it's an array of 3 numbers, construct the tuple explicitly
        return [region.position[0], region.position[1], region.position[2]];
      } else if (
        typeof region.position === 'object' &&
        region.position !== null &&
        'x' in region.position &&
        'y' in region.position &&
        'z' in region.position
      ) {
        // If it's a Vector3-like object, construct the tuple
        const pos = region.position as Vector3; // Safe assertion after checks
        return [pos.x, pos.y, pos.z];
      }
      // Fallback if position format is unexpected or invalid
      console.warn(`Unexpected position format for region ${regionId}:`, region.position);
      return [0, 0, 0];
    },
    [regionsById]
  );

  // Filter connections based on settings and selection state
  const filteredConnections = useMemo(() => {
    // Apply basic filters first
    let filtered = safeConnections
      // Filter by connection strength
      .filter((conn) => conn.strength >= minimumStrength)
      // Limit maximum connections for performance
      .toArray() // Convert to array before slicing
      .slice(0, maximumConnections);

    // If specific regions are selected, prioritize their connections
    if (safeSelectedIds.size() > 0) {
      filtered = filtered.filter(
        (conn) => safeSelectedIds.includes(conn.sourceId) || safeSelectedIds.includes(conn.targetId)
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
    // Convert SafeArray result back to array before sorting
    // 'filtered' is already a NeuralConnection[] array here from the slice operation
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

    // Create batches of connections for efficient rendering with explicit typing
    const batches: NeuralConnection[][] = [];
    const connectionsArray = filteredConnections; // Already an array from previous step
    for (let i = 0; i < connectionsArray.length; i += batchSize) {
      batches.push(connectionsArray.slice(i, i + batchSize));
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
    [onConnectionClick]
  );

  const handleConnectionHover = useCallback(
    (connectionId: string | null) => {
      if (onConnectionHover) onConnectionHover(connectionId);
    },
    [onConnectionHover]
  );

  // Determine if a connection is active or highlighted
  const isConnectionActive = useCallback(
    (conn: NeuralConnection): boolean => {
      // Connection is active if either connected region is selected
      return safeSelectedIds.includes(conn.sourceId) || safeSelectedIds.includes(conn.targetId);
    },
    [safeSelectedIds]
  );

  const isConnectionHighlighted = useCallback(
    (conn: NeuralConnection): boolean => {
      // Connection is highlighted if either connected region is highlighted
      return (
        safeHighlightedIds.includes(conn.sourceId) || safeHighlightedIds.includes(conn.targetId)
      );
    },
    [safeHighlightedIds]
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
    [regionsById]
  );

  // Calculate connection color based on various factors
  const getConnectionColor = useCallback(
    (conn: NeuralConnection): string => {
      // In functional mode, color by activity - Use placeholder scale logic
      if (renderMode === RenderMode.FUNCTIONAL) {
        const activity = getConnectionActivity(conn);
        // Placeholder scale - replace with actual scale from VisualizationSettings when available
        // Using theme colors as placeholders for activity scale
        const scale = {
          high: themeSettings.accentColor || '#FF0000',
          medium: themeSettings.secondaryColor || '#FFA500',
          low: themeSettings.primaryColor || '#FFFF00',
          none: themeSettings.connectionBaseColor || '#808080',
        };

        if (activity > 0.7) return scale.high;
        if (activity > 0.4) return scale.medium;
        if (activity > 0.2) return scale.low;
        return scale.none;
      }

      // In connectivity mode, color by connection type (structural, functional, effective)
      // Using base color as placeholder since excitatory/inhibitory colors are not in ThemeSettings
      if (renderMode === RenderMode.CONNECTIVITY) {
        // TODO: Define appropriate colors based on conn.type ('structural', 'functional', 'effective')
        return themeSettings.connectionBaseColor;
      }

      // Default color
      return themeSettings.connectionBaseColor;
    },
    // Removed themeSettings from dependencies as specific color props are missing/placeholders used
    [
      renderMode,
      getConnectionActivity,
      themeSettings.accentColor,
      themeSettings.secondaryColor,
      themeSettings.primaryColor,
      themeSettings.connectionBaseColor,
    ]
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
            // Use 'directionality' property for flow direction
            // Removed duplicate flowDirection prop
            activityLevel={getConnectionActivity(conn)}
            animated={animated && renderMode !== RenderMode.ANATOMICAL}
            animationSpeed={animationSpeed}
            // Use 'directionality' property for flow direction
            flowDirection={conn.directionality === 'bidirectional' ? 'bidirectional' : 'forward'}
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

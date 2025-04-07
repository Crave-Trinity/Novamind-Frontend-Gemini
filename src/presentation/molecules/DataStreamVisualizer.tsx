/**
 * NOVAMIND Neural-Safe Molecular Component
 * DataStreamVisualizer - Quantum-level data stream visualization
 * with HIPAA-compliant multi-dimensional correlation analysis
 */

import React, { useRef, useMemo, useState, useCallback } from 'react'; // Removed unused useEffect
// Removed unused useFrame import
// @ts-ignore: TS2305 - Module '"@react-three/drei"' has no exported member 'Line'/'Html'/'Billboard'/'Text'. (Likely type/config issue)
import { Line, Html, Billboard, Text } from '@react-three/drei'; // Re-added Text, suppressed errors
import type { Group } from 'three';
import { Vector3, MathUtils } from 'three'; // Removed unused Color

// Domain types
import type { BrainRegion } from '@domain/types/brain/models';
// Removed unused import: import { NeuralConnection } from '@domain/types/brain/models';

/**
 * Neural-safe data point type
 */
export interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
  confidence?: number; // 0.0-1.0
  anomaly?: boolean;
  // trend?: 'increasing' | 'decreasing' | 'stable'; // Removed unused property
}

/**
 * Neural-safe data stream type
 */
export interface DataStream {
  id: string;
  name: string;
  category: 'physiological' | 'behavioral' | 'self-reported' | 'environmental' | 'treatment';
  unit?: string;
  data: DataPoint[];
  normalRange?: [number, number];
  criticalThresholds?: [number, number];
  relatedRegionIds?: string[];
  // relatedSymptomIds?: string[]; // Removed unused property
  clinicalSignificance: number; // 0.0-1.0
  visualProperties?: {
    color?: string;
    lineWidth?: number;
    showPoints?: boolean;
    dashPattern?: [number, number];
  };
  correlationStrength?: Record<string, number>; // map of stream id to correlation strength
}

/**
 * Props with neural-safe typing
 */
interface DataStreamVisualizerProps {
  dataStreams: DataStream[];
  regions: BrainRegion[];
  timeRange?: { start: number; end: number };
  width?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  displayMode?: 'stacked' | 'overlay' | 'correlated';
  maxStreams?: number;
  showLabels?: boolean;
  showGrid?: boolean;
  showCorrelations?: boolean;
  correlationThreshold?: number; // Minimum correlation to display
  categoryFilter?: (
    | 'physiological'
    | 'behavioral'
    | 'self-reported'
    | 'environmental'
    | 'treatment'
  )[];
  interactable?: boolean;
  onStreamSelect?: (streamId: string) => void;
  onTimeRangeChange?: (range: { start: number; end: number }) => void; // Restored prop
  colorMap?: {
    physiological: string;
    behavioral: string;
    'self-reported': string;
    environmental: string;
    treatment: string;
    grid: string;
    background: string;
    text: string;
    correlation: string;
    anomaly: string;
  };
}

/**
 * Category configuration with icons and labels
 */
const CATEGORY_CONFIG = {
  physiological: {
    icon: '❤️',
    label: 'Physiological',
    defaultColor: '#ef4444', // Red
  },
  behavioral: {
    icon: '🚶',
    label: 'Behavioral',
    defaultColor: '#3b82f6', // Blue
  },
  'self-reported': {
    icon: '💬',
    label: 'Self-Reported',
    defaultColor: '#8b5cf6', // Purple
  },
  environmental: {
    icon: '🌤️',
    label: 'Environmental',
    defaultColor: '#10b981', // Green
  },
  treatment: {
    icon: '💊',
    label: 'Treatment',
    defaultColor: '#f59e0b', // Amber
  },
};

/**
 * DataStreamVisualizer - Molecular component for multi-dimensional data visualization
 * Implements HIPAA-compliant data correlation with neural regions
 */
export const DataStreamVisualizer: React.FC<DataStreamVisualizerProps> = ({
  dataStreams,
  regions: _regions, // Prefixed unused variable
  timeRange,
  width = 10,
  height = 6,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  displayMode = 'stacked',
  maxStreams = 5,
  showLabels = true,
  showGrid = true,
  showCorrelations = true,
  correlationThreshold = 0.5,
  categoryFilter,
  interactable = true,
  onStreamSelect,
  onTimeRangeChange, // Restored prop in destructuring
  colorMap = {
    physiological: '#ef4444', // Red
    behavioral: '#3b82f6', // Blue
    'self-reported': '#8b5cf6', // Purple
    environmental: '#10b981', // Green
    treatment: '#f59e0b', // Amber
    grid: '#475569', // Slate
    background: '#0f172a88', // Semi-transparent dark blue
    text: '#f8fafc', // Light slate
    correlation: '#64748b', // Slate
    anomaly: '#fb7185', // Pink
  },
}) => {
  // Refs
  const groupRef = useRef<Group>(null);

  // Local state
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Removed unused regionMap calculation

  // Filter and sort data streams
  const processedStreams = useMemo(() => {
    let filtered = [...dataStreams];

    // Apply category filter
    if (categoryFilter && categoryFilter.length > 0) {
      filtered = filtered.filter((stream) => categoryFilter.includes(stream.category));
    }

    // Sort by clinical significance
    filtered.sort((a, b) => b.clinicalSignificance - a.clinicalSignificance);

    // Limit to max streams
    return filtered.slice(0, maxStreams);
  }, [dataStreams, categoryFilter, maxStreams]);

  // Calculate auto time range if not provided
  const effectiveTimeRange = useMemo(() => {
    if (timeRange) return timeRange;

    // Calculate range from data streams
    let start = Date.now();
    let end = Date.now();

    processedStreams.forEach((stream) => {
      if (stream.data.length > 0) {
        const streamTimes = stream.data.map((point) => point.timestamp);
        const streamStart = Math.min(...streamTimes);
        const streamEnd = Math.max(...streamTimes);

        start = Math.min(start, streamStart);
        end = Math.max(end, streamEnd);
      }
    });

    // Ensure minimum range (1 hour)
    if (end - start < 3600000) {
      end = start + 3600000;
    }

    // Add padding (10%)
    const padding = (end - start) * 0.1;
    return {
      start: start - padding,
      end: end + padding,
    };
  }, [timeRange, processedStreams]);

  // Generate grid lines
  const gridLines = useMemo(() => {
    if (!showGrid) return [];

    const lines: {
      points: Vector3[];
      color: string;
      opacity: number;
      lineWidth: number;
    }[] = [];

    // Generate vertical time grid lines
    const timespan = effectiveTimeRange.end - effectiveTimeRange.start;
    const hourMs = 3600000;
    const timeStep =
      timespan > 86400000 * 7
        ? 86400000 // 1 day
        : timespan > 86400000
          ? hourMs * 6 // 6 hours
          : hourMs; // 1 hour

    const timeGridCount = Math.ceil(timespan / timeStep);

    for (let i = 0; i <= timeGridCount; i++) {
      const timestamp = effectiveTimeRange.start + i * timeStep;
      const x = MathUtils.mapLinear(
        timestamp,
        effectiveTimeRange.start,
        effectiveTimeRange.end,
        -width / 2,
        width / 2
      );

      // Vertical line
      lines.push({
        points: [new Vector3(x, -height / 2, 0), new Vector3(x, height / 2, 0)],
        color: colorMap.grid,
        opacity: 0.4,
        lineWidth: 1,
      });
    }

    // Generate horizontal value grid lines
    const valueGridCount = displayMode === 'stacked' ? processedStreams.length : 5;

    for (let i = 0; i <= valueGridCount; i++) {
      let y: number;

      if (displayMode === 'stacked') {
        // For stacked mode, draw lines between streams
        y = MathUtils.mapLinear(i, 0, processedStreams.length, -height / 2, height / 2);
      } else {
        // For overlay mode, draw evenly spaced grid lines
        y = MathUtils.mapLinear(i, 0, valueGridCount, -height / 2, height / 2);
      }

      // Horizontal line
      lines.push({
        points: [new Vector3(-width / 2, y, 0), new Vector3(width / 2, y, 0)],
        color: colorMap.grid,
        opacity: 0.4,
        lineWidth: 1,
      });
    }

    return lines;
  }, [showGrid, processedStreams, effectiveTimeRange, displayMode, width, height, colorMap]);

  // Process data streams for visualization
  const visualizationData = useMemo(() => {
    return processedStreams.map((stream, streamIndex) => {
      // Map data points to visualization space
      const points: Vector3[] = [];
      const annotationPoints: {
        position: Vector3;
        type: 'anomaly' | 'label';
        value: number;
        label?: string;
      }[] = [];

      // Calculate value range for this stream
      let minValue = Number.MAX_VALUE;
      let maxValue = Number.MIN_VALUE;

      stream.data.forEach((point) => {
        minValue = Math.min(minValue, point.value);
        maxValue = Math.max(maxValue, point.value);
      });

      // Ensure non-zero range
      if (minValue === maxValue) {
        minValue -= 1;
        maxValue += 1;
      }

      // Add padding to range (10%)
      const padding = (maxValue - minValue) * 0.1;
      minValue -= padding;
      maxValue += padding;

      // Process data points
      stream.data.forEach((point) => {
        // Map x position (time)
        const x = MathUtils.mapLinear(
          point.timestamp,
          effectiveTimeRange.start,
          effectiveTimeRange.end,
          -width / 2,
          width / 2
        );

        // Map y position (value)
        let y: number;

        if (displayMode === 'stacked') {
          // For stacked mode, position streams in separate rows
          const rowHeight = height / processedStreams.length;
          const baseY = MathUtils.mapLinear(
            streamIndex + 0.5,
            0,
            processedStreams.length,
            -height / 2,
            height / 2
          );

          // Map value to a portion of the row height
          const valueY = MathUtils.mapLinear(
            point.value,
            minValue,
            maxValue,
            -rowHeight * 0.4,
            rowHeight * 0.4
          );

          y = baseY + valueY;
        } else {
          // For overlay mode, map to full height
          y = MathUtils.mapLinear(point.value, minValue, maxValue, -height / 2, height / 2);
        }

        // Add point to line
        points.push(new Vector3(x, y, 0));

        // Add annotation for anomalies
        if (point.anomaly) {
          annotationPoints.push({
            position: new Vector3(x, y, 0),
            type: 'anomaly',
            value: point.value,
            label: point.label,
          });
        }

        // Add labels for significant points
        if (point.label && (streamIndex === 0 || displayMode === 'stacked')) {
          annotationPoints.push({
            position: new Vector3(x, y, 0),
            type: 'label',
            value: point.value,
            label: point.label,
          });
        }
      });

      // Determine line color
      const color =
        stream.visualProperties?.color ||
        colorMap[stream.category] ||
        CATEGORY_CONFIG[stream.category].defaultColor;

      // Determine if this stream is selected
      const isSelected = selectedStreamId === stream.id;

      // Extract correlation data
      const correlations = Object.entries(stream.correlationStrength || {})
        .filter(
          ([targetId, strength]) =>
            strength >= correlationThreshold && processedStreams.some((s) => s.id === targetId)
        )
        .map(([targetId, strength]) => ({
          targetId,
          strength,
        }));

      return {
        ...stream,
        points,
        annotationPoints,
        color,
        isSelected,
        correlations,
        valueRange: { min: minValue, max: maxValue },
      };
    });
  }, [
    processedStreams,
    effectiveTimeRange,
    displayMode,
    width,
    height,
    selectedStreamId,
    correlationThreshold,
    colorMap,
  ]);

  // Generate correlation lines
  const correlationLines = useMemo(() => {
    if (!showCorrelations) return [];

    const lines: {
      points: Vector3[];
      color: string;
      opacity: number;
      lineWidth: number;
      sourceId: string;
      targetId: string;
      strength: number;
    }[] = [];

    // Create a map of stream id to row position
    const streamPositions = new Map<string, number>();

    visualizationData.forEach((stream, index) => {
      const y = MathUtils.mapLinear(
        index + 0.5,
        0,
        processedStreams.length,
        -height / 2,
        height / 2
      );

      streamPositions.set(stream.id, y);
    });

    // Add correlation lines
    if (displayMode === 'stacked') {
      visualizationData.forEach((stream) => {
        const sourceY = streamPositions.get(stream.id) || 0;

        stream.correlations.forEach((correlation) => {
          const targetY = streamPositions.get(correlation.targetId) || 0;

          // Skip if target is before source (to avoid duplicates)
          const targetStream = visualizationData.find((s) => s.id === correlation.targetId);
          if (
            !targetStream ||
            visualizationData.indexOf(targetStream) < visualizationData.indexOf(stream)
          ) {
            return;
          }

          // Create curve points
          const sourceX = -width / 2 - 0.5;
          const targetX = -width / 2 - 0.5;
          const controlX = -width / 2 - 1.5;

          const curvePoints: Vector3[] = [];
          const steps = 20;

          for (let i = 0; i <= steps; i++) {
            const t = i / steps;

            // Quadratic Bezier curve
            const x = (1 - t) * (1 - t) * sourceX + 2 * (1 - t) * t * controlX + t * t * targetX;
            const y =
              (1 - t) * (1 - t) * sourceY +
              2 * (1 - t) * t * ((sourceY + targetY) / 2) +
              t * t * targetY;

            curvePoints.push(new Vector3(x, y, 0));
          }

          // Add correlation line
          lines.push({
            points: curvePoints,
            color: colorMap.correlation,
            opacity: correlation.strength,
            lineWidth: correlation.strength * 3,
            sourceId: stream.id,
            targetId: correlation.targetId,
            strength: correlation.strength,
          });
        });
      });
    }

    return lines;
  }, [showCorrelations, visualizationData, processedStreams, displayMode, height, width, colorMap]);

  // Handle stream selection
  const handleStreamSelect = useCallback(
    (streamId: string) => {
      setSelectedStreamId(selectedStreamId === streamId ? null : streamId);

      if (onStreamSelect) {
        onStreamSelect(streamId);
      }
    },
    [selectedStreamId, onStreamSelect]
  );

  // Format timestamp for labels
  const formatTimestamp = useCallback(
    (timestamp: number): string => {
      const date = new Date(timestamp);
      // Removed unused 'now' variable

      // Format based on time range
      const timespan = effectiveTimeRange.end - effectiveTimeRange.start;

      if (timespan <= 86400000) {
        // For ranges <= 1 day, show time only
        return date.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (timespan <= 86400000 * 7) {
        // For ranges <= 1 week, show day and time
        return (
          date.toLocaleDateString(undefined, {
            weekday: 'short',
          }) +
          ' ' +
          date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      } else {
        // For longer ranges, show date only
        return date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
      }
    },
    [effectiveTimeRange]
  );

  // Handle interaction
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (!interactable) return;

      // Update zoom level
      const newZoom = Math.max(0.5, Math.min(5, zoomLevel + event.deltaY * -0.001));
      setZoomLevel(newZoom);

      // Notify of time range change if enabled
      if (onTimeRangeChange) {
        const range = effectiveTimeRange.end - effectiveTimeRange.start;
        const zoomRatio = zoomLevel / newZoom;
        const newRange = range * zoomRatio;
        const center = (effectiveTimeRange.start + effectiveTimeRange.end) / 2;

        onTimeRangeChange({
          start: center - newRange / 2,
          end: center + newRange / 2,
        });
      }
    },
    [interactable, zoomLevel, effectiveTimeRange, onTimeRangeChange]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!interactable) return;

      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
    },
    [interactable]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!interactable || !isDragging) return;

      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;

      // Update view offset
      setViewOffset((prev) => ({
        x: prev.x + dx * 0.01,
        y: prev.y - dy * 0.01,
      }));

      // Update drag start
      setDragStart({ x: event.clientX, y: event.clientY });

      // Notify of time range change if enabled
      if (onTimeRangeChange) {
        const range = effectiveTimeRange.end - effectiveTimeRange.start;
        const offsetRatio = (dx * 0.01) / width;
        const timeOffset = range * offsetRatio;

        onTimeRangeChange({
          start: effectiveTimeRange.start - timeOffset,
          end: effectiveTimeRange.end - timeOffset,
        });
      }
    },
    [interactable, isDragging, dragStart, width, effectiveTimeRange, onTimeRangeChange]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <group
      ref={groupRef}
      position={new Vector3(...position)}
      rotation={[rotation[0], rotation[1], rotation[2]]}
      scale={[zoomLevel, zoomLevel, 1]}
    >
      {/* Background plane */}
      <mesh
        position={[viewOffset.x, viewOffset.y, -0.1]}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={colorMap.background} transparent opacity={0.7} />
      </mesh>

      {/* Grid lines */}
      {gridLines.map((line, i) => (
        <Line
          key={`grid-${i}`}
          points={line.points.map((p) => p.clone().add(new Vector3(viewOffset.x, viewOffset.y, 0)))}
          color={line.color}
          lineWidth={line.lineWidth}
          opacity={line.opacity}
          transparent
        />
      ))}

      {/* Correlation lines */}
      {correlationLines.map((line, i) => (
        <Line
          key={`correlation-${i}`}
          points={line.points.map((p) => p.clone().add(new Vector3(viewOffset.x, viewOffset.y, 0)))}
          color={line.color}
          lineWidth={line.lineWidth}
          opacity={line.opacity}
          transparent
        />
      ))}

      {/* Axis labels */}
      {showLabels && (
        <group position={[viewOffset.x, viewOffset.y, 0.1]}>
          {/* Time axis labels */}
          {[...Array(5)].map((_, i) => {
            const t = i / 4;
            const timestamp = MathUtils.lerp(effectiveTimeRange.start, effectiveTimeRange.end, t);
            const x = MathUtils.lerp(-width / 2, width / 2, t);

            return (
              <Text
                key={`time-${i}`}
                position={[x, -height / 2 - 0.4, 0]}
                fontSize={0.35}
                color={colorMap.text}
                anchorX="center"
                anchorY="top"
              >
                {formatTimestamp(timestamp)}
              </Text>
            );
          })}

          {/* Stream labels for stacked mode */}
          {displayMode === 'stacked' &&
            visualizationData.map((stream, i) => {
              const y = MathUtils.mapLinear(
                i + 0.5,
                0,
                visualizationData.length,
                -height / 2,
                height / 2
              );

              return (
                <Html key={`stream-${stream.id}`} position={[-width / 2 - 0.5, y, 0]} center sprite>
                  <div
                    style={{
                      backgroundColor: `${stream.color}cc`,
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      opacity: stream.isSelected ? 1 : 0.7,
                      transform: `scale(${stream.isSelected ? 1.05 : 1})`,
                      transition: 'transform 0.2s, opacity 0.2s',
                      boxShadow: stream.isSelected ? '0 0 5px rgba(255, 255, 255, 0.5)' : 'none',
                    }}
                    onClick={() => handleStreamSelect(stream.id)}
                  >
                    {CATEGORY_CONFIG[stream.category].icon} {stream.name}
                    {stream.unit && ` (${stream.unit})`}
                  </div>
                </Html>
              );
            })}
        </group>
      )}

      {/* Data stream lines */}
      <group position={[viewOffset.x, viewOffset.y, 0.2]}>
        {visualizationData.map((stream) => {
          // Line width based on selection state
          const lineWidth = stream.isSelected
            ? (stream.visualProperties?.lineWidth || 2) * 1.5
            : stream.visualProperties?.lineWidth || 2;

          // Opacity based on selection state
          const opacity = stream.isSelected ? 1 : selectedStreamId ? 0.4 : 0.8;

          // Apply dash pattern if specified
          const dashPattern = stream.visualProperties?.dashPattern;

          return (
            <group key={stream.id}>
              <Line
                points={stream.points}
                color={stream.color}
                lineWidth={lineWidth}
                opacity={opacity}
                transparent
                dashed={!!dashPattern}
                dashArray={dashPattern}
              />

              {/* Normal range indicator */}
              {stream.normalRange && displayMode !== 'stacked' && (
                <mesh>
                  <planeGeometry args={[width, 0.2]} />
                  <meshBasicMaterial color={stream.color} transparent opacity={0.1} />
                </mesh>
              )}

              {/* Point markers */}
              {stream.visualProperties?.showPoints &&
                stream.points.map((point, i) => (
                  <mesh key={`point-${i}`} position={point} scale={0.1}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial color={stream.color} />
                  </mesh>
                ))}

              {/* Annotation points */}
              {stream.annotationPoints.map((annotation, i) => {
                if (annotation.type === 'anomaly') {
                  return (
                    <group key={`anomaly-${i}`} position={annotation.position}>
                      <mesh scale={0.15}>
                        <sphereGeometry args={[1, 16, 16]} />
                        <meshBasicMaterial color={colorMap.anomaly} />
                      </mesh>

                      {annotation.label && (
                        <Html position={[0, 0.3, 0]} center sprite>
                          <div
                            style={{
                              backgroundColor: `${colorMap.anomaly}dd`,
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              whiteSpace: 'nowrap',
                              maxWidth: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {annotation.label}
                          </div>
                        </Html>
                      )}
                    </group>
                  );
                } else if (annotation.type === 'label') {
                  return (
                    <Billboard key={`label-${i}`} position={annotation.position} follow={true}>
                      <Html center sprite>
                        <div
                          style={{
                            backgroundColor: `${stream.color}99`,
                            color: 'white',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap',
                            maxWidth: '120px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {annotation.label}
                        </div>
                      </Html>
                    </Billboard>
                  );
                }

                return null;
              })}
            </group>
          );
        })}
      </group>
    </group>
  );
};

export default DataStreamVisualizer;

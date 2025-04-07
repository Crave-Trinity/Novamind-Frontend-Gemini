/**
 * NOVAMIND Neural-Safe Molecular Component
 * TemporalDynamicsVisualizer - Quantum-level temporal dynamics visualization
 * with multi-scale pattern recognition and state transition precision
 */

import React, { useRef, useMemo, useState, useCallback } from 'react'; // Re-added useRef, removed unused useEffect
// Removed unused useThree import
// @ts-ignore: TS2305 - Module '"@react-three/drei"' has no exported member 'Line'/'Plane'/'Html'/'Text'. (Likely type/config issue)
import { Line, Plane, Html, Text } from '@react-three/drei';
import type { Group, Mesh } from 'three';
import { Vector3, MathUtils } from 'three'; // Removed unused Color
// Removed unused imports: import { useSpring, animated } from '@react-spring/three';

// Domain types
import type {
  NeuralStateTransition,
  TemporalActivationSequence,
} from '@domain/types/brain/activity';

/**
 * Props with neural-safe typing
 */
interface TemporalDynamicsVisualizerProps {
  stateTransitions?: NeuralStateTransition[];
  temporalSequences?: TemporalActivationSequence[];
  timeRange?: { start: number; end: number };
  width?: number;
  height?: number;
  depth?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  showGrid?: boolean;
  showLabels?: boolean;
  showTimescale?: boolean;
  temporalScale?: 'momentary' | 'daily' | 'weekly' | 'monthly' | 'auto';
  highlightTransitionPoints?: boolean;
  colorMap?: {
    background: string;
    grid: string;
    axis: string;
    label: string;
    momentary: string;
    daily: string;
    weekly: string;
    monthly: string;
    criticalPoint: string;
  };
  interactable?: boolean;
  onTransitionPointClick?: (transition: NeuralStateTransition) => void;
  onTimeRangeChange?: (range: { start: number; end: number }) => void;
}

/**
 * TimeScaleDefinition with neural-safe typing
 */
interface TimeScaleDefinition {
  name: string;
  duration: number; // in milliseconds
  majorGridInterval: number; // in milliseconds
  minorGridInterval: number; // in milliseconds
  color: string;
  labelFormat: (timestamp: number) => string;
}

/**
 * Grid line with neural-safe typing
 */
interface GridLine {
  points: Vector3[];
  color: string;
  opacity: number;
  lineWidth: number;
}

/**
 * TemporalDynamicsVisualizer - Molecular component for temporal neural dynamics
 * Implements clinical precision visualization of multi-scale temporal patterns
 */
export const TemporalDynamicsVisualizer: React.FC<TemporalDynamicsVisualizerProps> = ({
  stateTransitions = [],
  temporalSequences = [],
  timeRange,
  width = 10,
  height = 6,
  depth: _depth = 2, // Prefixed unused variable
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  showGrid = true,
  showLabels = true,
  showTimescale = true,
  temporalScale = 'auto',
  highlightTransitionPoints = true,
  colorMap = {
    background: '#0f172a88', // Semi-transparent dark blue
    grid: '#334155',
    axis: '#64748b',
    label: '#e2e8f0',
    momentary: '#3b82f6', // Blue
    daily: '#22c55e', // Green
    weekly: '#f59e0b', // Amber
    monthly: '#8b5cf6', // Violet
    criticalPoint: '#ef4444', // Red
  },
  interactable = true,
  onTransitionPointClick,
  onTimeRangeChange,
}) => {
  // Refs
  const groupRef = useRef<Group>(null);
  const planeRef = useRef<Mesh>(null);

  // Get scene context
  // Removed unused camera variable

  // Local state for zoom level
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });

  // Calculate auto time range if not provided
  const effectiveTimeRange = useMemo(() => {
    if (timeRange) return timeRange;

    // If we have transitions or sequences, calculate from them
    let start = Date.now();
    let end = Date.now();

    // Check transitions
    if (stateTransitions.length > 0) {
      const transitionTimes = stateTransitions.flatMap((t) => [
        t.startState.timestamp,
        t.startState.timestamp + t.transitionDuration,
      ]);

      start = Math.min(start, ...transitionTimes);
      end = Math.max(end, ...transitionTimes);
    }

    // Check sequences
    if (temporalSequences.length > 0) {
      const sequenceTimes = temporalSequences.flatMap((seq) =>
        seq.timeSteps.map((step) => step.timeOffset)
      );

      if (sequenceTimes.length > 0) {
        const seqStart = Math.min(...sequenceTimes);
        const seqEnd = Math.max(...sequenceTimes);
        // Removed unused seqDuration variable

        start = Math.min(start, seqStart);
        end = Math.max(end, seqEnd);
      }
    }

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
  }, [timeRange, stateTransitions, temporalSequences]);

  // Define time scales with clinical precision
  const timeScales = useMemo<Record<string, TimeScaleDefinition>>(
    () => ({
      momentary: {
        name: 'Momentary',
        duration: 300000, // 5 minutes
        majorGridInterval: 60000, // 1 minute
        minorGridInterval: 15000, // 15 seconds
        color: colorMap.momentary,
        labelFormat: (timestamp) => {
          const date = new Date(timestamp);
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        },
      },
      daily: {
        name: 'Daily',
        duration: 86400000, // 24 hours
        majorGridInterval: 10800000, // 3 hours
        minorGridInterval: 3600000, // 1 hour
        color: colorMap.daily,
        labelFormat: (timestamp) => {
          const date = new Date(timestamp);
          return `${date.getHours().toString().padStart(2, '0')}:00`;
        },
      },
      weekly: {
        name: 'Weekly',
        duration: 604800000, // 7 days
        majorGridInterval: 86400000, // 1 day
        minorGridInterval: 21600000, // 6 hours
        color: colorMap.weekly,
        labelFormat: (timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString(undefined, { weekday: 'short' });
        },
      },
      monthly: {
        name: 'Monthly',
        duration: 2592000000, // 30 days
        majorGridInterval: 604800000, // 1 week
        minorGridInterval: 86400000, // 1 day
        color: colorMap.monthly,
        labelFormat: (timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          });
        },
      },
    }),
    [colorMap]
  );

  // Determine effective time scale
  const effectiveTemporalScale = useMemo(() => {
    if (temporalScale !== 'auto') return temporalScale;

    // Auto-select based on range duration
    const duration = effectiveTimeRange.end - effectiveTimeRange.start;

    if (duration <= timeScales.momentary.duration) return 'momentary';
    if (duration <= timeScales.daily.duration) return 'daily';
    if (duration <= timeScales.weekly.duration) return 'weekly';
    return 'monthly';
  }, [temporalScale, effectiveTimeRange, timeScales]);

  // Generate grid lines
  const gridLines = useMemo(() => {
    if (!showGrid) return [];

    const lines: GridLine[] = [];
    const scale = timeScales[effectiveTemporalScale];
    const timespan = effectiveTimeRange.end - effectiveTimeRange.start;

    // Add major grid lines
    const majorCount = Math.ceil(timespan / scale.majorGridInterval);
    for (let i = 0; i <= majorCount; i++) {
      const timestamp = effectiveTimeRange.start + i * scale.majorGridInterval;
      const x = MathUtils.lerp(
        -width / 2,
        width / 2,
        (timestamp - effectiveTimeRange.start) / (effectiveTimeRange.end - effectiveTimeRange.start)
      );

      // Vertical line
      lines.push({
        points: [new Vector3(x, -height / 2, 0), new Vector3(x, height / 2, 0)],
        color: colorMap.grid,
        opacity: 0.8,
        lineWidth: 2,
      });
    }

    // Add minor grid lines
    const minorCount = Math.ceil(timespan / scale.minorGridInterval);
    for (let i = 0; i <= minorCount; i++) {
      const timestamp = effectiveTimeRange.start + i * scale.minorGridInterval;

      // Skip if this coincides with a major line
      if (timestamp % scale.majorGridInterval === 0) continue;

      const x = MathUtils.lerp(
        -width / 2,
        width / 2,
        (timestamp - effectiveTimeRange.start) / (effectiveTimeRange.end - effectiveTimeRange.start)
      );

      // Vertical line
      lines.push({
        points: [new Vector3(x, -height / 2, 0), new Vector3(x, height / 2, 0)],
        color: colorMap.grid,
        opacity: 0.4,
        lineWidth: 1,
      });
    }

    // Add horizontal grid lines
    const horizontalLines = 6;
    for (let i = 0; i <= horizontalLines; i++) {
      const y = MathUtils.lerp(0, height, i / horizontalLines);

      // Horizontal line
      lines.push({
        points: [new Vector3(-width / 2, y, 0), new Vector3(width / 2, y, 0)],
        color: colorMap.grid,
        opacity: i === 0 ? 0.8 : 0.4, // Emphasize baseline
        lineWidth: i === 0 ? 2 : 1,
      });
    }

    return lines;
  }, [showGrid, timeScales, effectiveTemporalScale, effectiveTimeRange, width, height, colorMap]);

  // Process state transitions
  const processedTransitions = useMemo(() => {
    return stateTransitions.map((transition) => {
      // Map transition timestamps to visualization space
      const startX = MathUtils.lerp(
        -width / 2,
        width / 2,
        (transition.startState.timestamp - effectiveTimeRange.start) /
          (effectiveTimeRange.end - effectiveTimeRange.start)
      );

      const endX = MathUtils.lerp(
        -width / 2,
        width / 2,
        (transition.startState.timestamp +
          transition.transitionDuration -
          effectiveTimeRange.start) /
          (effectiveTimeRange.end - effectiveTimeRange.start)
      );

      // Map activity levels to y position
      const startY = MathUtils.lerp(-height / 2, height / 2, transition.startState.rawActivity);

      const endY = MathUtils.lerp(-height / 2, height / 2, transition.endState.rawActivity);

      // Determine color based on whether transition is clinically significant
      const color = transition.clinicallySignificant
        ? colorMap.criticalPoint
        : timeScales[effectiveTemporalScale].color;

      // Create points for the transition line
      const points = [];

      // Add points based on transition type
      if (transition.transitionType === 'abrupt') {
        // Sharp transition with just start and end
        points.push(new Vector3(startX, startY, 0));
        points.push(new Vector3(endX, endY, 0));
      } else if (transition.transitionType === 'oscillating') {
        // Oscillating with sine wave pattern
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const x = MathUtils.lerp(startX, endX, t);

          // Base y interpolation
          const baseY = MathUtils.lerp(startY, endY, t);

          // Add oscillation
          const oscillation = Math.sin(t * Math.PI * 4) * (height * 0.05);
          const y = baseY + oscillation;

          points.push(new Vector3(x, y, 0));
        }
      } else {
        // Gradual transition with smooth curve
        const steps = 10;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const x = MathUtils.lerp(startX, endX, t);
          const y = MathUtils.lerp(startY, endY, t);
          points.push(new Vector3(x, y, 0));
        }
      }

      return {
        ...transition,
        startPos: new Vector3(startX, startY, 0),
        endPos: new Vector3(endX, endY, 0),
        points,
        color,
      };
    });
  }, [
    stateTransitions,
    effectiveTimeRange,
    width,
    height,
    colorMap,
    timeScales,
    effectiveTemporalScale,
  ]);

  // Process temporal sequences
  const processedSequences = useMemo(() => {
    return temporalSequences.map((sequence) => {
      // Map sequence timestamps to visualization space
      const points = sequence.timeSteps.map((step) => {
        // Calculate average activity across all states
        const avgActivity =
          step.activationStates.reduce((sum, state) => sum + state.rawActivity, 0) /
          Math.max(1, step.activationStates.length);

        // Map to visualization space
        const x = MathUtils.lerp(
          -width / 2,
          width / 2,
          (step.timeOffset - effectiveTimeRange.start) /
            (effectiveTimeRange.end - effectiveTimeRange.start)
        );

        const y = MathUtils.lerp(-height / 2, height / 2, avgActivity);

        return new Vector3(x, y, 0);
      });

      return {
        ...sequence,
        points,
        color: timeScales[effectiveTemporalScale].color,
      };
    });
  }, [temporalSequences, effectiveTimeRange, width, height, timeScales, effectiveTemporalScale]);

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

  // Handle transition point click
  const handleTransitionClick = useCallback(
    (transition: NeuralStateTransition) => {
      if (onTransitionPointClick) {
        onTransitionPointClick(transition);
      }
    },
    [onTransitionPointClick]
  );

  return (
    <group
      ref={groupRef}
      position={new Vector3(...position)}
      rotation={[rotation[0], rotation[1], rotation[2]]}
      scale={[zoomLevel, zoomLevel, 1]}
    >
      {/* Background plane */}
      <Plane
        ref={planeRef}
        args={[width, height]}
        position={[viewOffset.x, viewOffset.y, -0.1]}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <meshBasicMaterial color={colorMap.background} transparent opacity={0.7} />
      </Plane>

      {/* Grid lines */}
      {showGrid &&
        gridLines.map((line, i) => (
          <Line
            key={`grid-line-${i}`}
            points={line.points.map((p) =>
              p.clone().add(new Vector3(viewOffset.x, viewOffset.y, 0))
            )}
            color={line.color}
            lineWidth={line.lineWidth}
            opacity={line.opacity}
            transparent
          />
        ))}

      {/* Axis labels */}
      {showLabels && showTimescale && (
        <group position={[viewOffset.x, viewOffset.y, 0.1]}>
          {/* Generate time axis labels */}
          {[...Array(5)].map((_, i) => {
            const t = i / 4;
            const timestamp = MathUtils.lerp(effectiveTimeRange.start, effectiveTimeRange.end, t);
            const x = MathUtils.lerp(-width / 2, width / 2, t);

            return (
              <Text
                key={`time-label-${i}`}
                position={[x, -height / 2 - 0.5, 0]}
                fontSize={0.4}
                color={colorMap.label}
                anchorX="center"
                anchorY="top"
              >
                {timeScales[effectiveTemporalScale].labelFormat(timestamp)}
              </Text>
            );
          })}

          {/* Activity level labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((level) => {
            const y = MathUtils.lerp(-height / 2, height / 2, level);

            return (
              <Text
                key={`activity-label-${level}`}
                position={[-width / 2 - 0.5, y, 0]}
                fontSize={0.4}
                color={colorMap.label}
                anchorX="right"
                anchorY="middle"
              >
                {Math.round(level * 100)}%
              </Text>
            );
          })}

          {/* Scale title */}
          <Text
            position={[0, height / 2 + 0.5, 0]}
            fontSize={0.5}
            color={colorMap.label}
            anchorX="center"
            anchorY="bottom"
            fontWeight="bold"
          >
            {timeScales[effectiveTemporalScale].name} Neural Activity
          </Text>
        </group>
      )}

      {/* State transitions */}
      <group position={[viewOffset.x, viewOffset.y, 0.2]}>
        {processedTransitions.map((transition, i) => (
          <group key={`transition-${i}`}>
            <Line points={transition.points} color={transition.color} lineWidth={2} opacity={0.8} />

            {highlightTransitionPoints && (
              <>
                {/* Start point */}
                <mesh
                  position={transition.startPos}
                  onClick={() => handleTransitionClick(transition)}
                  scale={0.2}
                >
                  <sphereGeometry args={[1, 16, 16]} />
                  <meshBasicMaterial color={transition.color} />
                </mesh>

                {/* End point */}
                <mesh
                  position={transition.endPos}
                  onClick={() => handleTransitionClick(transition)}
                  scale={0.2}
                >
                  <sphereGeometry args={[1, 16, 16]} />
                  <meshBasicMaterial color={transition.color} />
                </mesh>

                {/* Label for significant transitions */}
                {transition.clinicallySignificant && (
                  <Html
                    position={transition.endPos.clone().add(new Vector3(0, 0.5, 0))}
                    center
                    sprite
                  >
                    <div
                      style={{
                        backgroundColor: colorMap.criticalPoint,
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        fontWeight: 'bold',
                      }}
                    >
                      {transition.associatedEvent || 'Critical Point'}
                    </div>
                  </Html>
                )}
              </>
            )}
          </group>
        ))}
      </group>

      {/* Temporal sequences */}
      <group position={[viewOffset.x, viewOffset.y, 0.2]}>
        {processedSequences.map((sequence, i) => (
          <Line
            key={`sequence-${i}`}
            points={sequence.points}
            color={sequence.color}
            lineWidth={3}
            opacity={0.8}
          />
        ))}
      </group>
    </group>
  );
};

export default TemporalDynamicsVisualizer;

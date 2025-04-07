/**
 * NOVAMIND Neural-Safe Molecular Component
 * NeuralActivityVisualizer - Quantum-level neural activity visualization
 * with clinical precision and temporal dynamics
 */

import React, { useRef, useMemo, useEffect, useState } from 'react'; // Re-added useRef, useEffect, useState
import { useFrame, extend, ThreeEvent } from '@react-three/fiber'; // Added ThreeEvent
// @ts-ignore: TS2305 - Module '"@react-three/drei"' has no exported member 'Sphere'/'Line'/'Text'/'shaderMaterial'. (Likely type/config issue)
import { Sphere, Line, Text, shaderMaterial } from '@react-three/drei'; // Removed unused useTexture
import type { ShaderMaterial, Mesh, Group, Event } from 'three';
import { Vector3, Color } from 'three'; // Removed unused IUniform
import { useSpring } from '@react-spring/three'; // Removed unused animated

// Domain types
import type {
  NeuralActivityState,
  TemporalActivationSequence,
  NeuralActivationPattern,
} from '@domain/types/brain/activity';
import { ActivationLevel } from '@domain/types/brain/activity';
import type { BrainRegion, NeuralConnection } from '@domain/types/brain/models';
import type { Vector3 as DomainVector3 } from '@domain/types/shared/common'; // Corrected path

/**
 * Neural-safe adapter to convert domain Vector3 to Three.js Vector3
 * with quantum precision
 */
const adaptVector3 = (domainVector: DomainVector3): Vector3 => {
  return new Vector3(domainVector.x, domainVector.y, domainVector.z);
};

// Neural activity shader
const NeuralActivityShaderMaterial = shaderMaterial(
  {
    time: 0,
    activityLevel: 0,
    activityColor: new Color('#ef4444'),
    baseColor: new Color('#1e293b'),
    pulsePeriod: 1.5,
    noiseIntensity: 0.1,
    glowIntensity: 0.5,
  },
  // Vertex shader
  `
    uniform float time;
    uniform float activityLevel;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vPosition = position;
      vNormal = normal;
      
      // Apply subtle displacement based on activity
      float displacement = sin(position.x * 5.0 + time) * sin(position.y * 5.0 + time) * sin(position.z * 5.0 + time) * activityLevel * 0.05;
      vec3 newPosition = position + normal * displacement;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform float activityLevel;
    uniform vec3 activityColor;
    uniform vec3 baseColor;
    uniform float pulsePeriod;
    uniform float noiseIntensity;
    uniform float glowIntensity;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    // Simple noise function
    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
    }
    
    void main() {
      // Calculate view direction for fresnel effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
      
      // Calculate pulse effect
      float pulse = sin(time * pulsePeriod) * 0.5 + 0.5;
      
      // Add noise for more organic appearance
      float noiseValue = noise(vPosition + time * 0.1) * noiseIntensity;
      
      // Blend colors based on activity level
      vec3 color = mix(baseColor, activityColor, activityLevel * (0.7 + pulse * 0.3 + noiseValue));
      
      // Apply fresnel glow effect
      color += activityColor * fresnel * activityLevel * glowIntensity;
      
      // Output final color
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// Register the shader material with react-three-fiber
extend({ NeuralActivityShaderMaterial });

// Removed global type declaration - rely on extend

/**
 * Props with neural-safe typing for ActivityNode
 */
interface ActivityNodeProps {
  position: Vector3;
  scale: number;
  activityLevel: number;
  activationLevel: ActivationLevel;
  pulseSpeed?: number;
  baseColor?: string;
  activeColor?: string;
  label?: string | undefined;
  showLabel?: boolean;
  onClick?:
    | ((event: Event, entityId: string, entityType: 'region' | 'connection') => void)
    | undefined; // Allow undefined for exactOptionalPropertyTypes
}

/**
 * ActivityNode - Internal component for visualizing a single neural activity node
 */

const ActivityNode: React.FC<ActivityNodeProps> = ({
  position,
  scale,
  activityLevel,
  activationLevel: _activationLevel, // Prefixed unused variable
  pulseSpeed = 1.5,
  baseColor = '#1e293b',
  activeColor = '#ef4444',
  label,
  showLabel = false,
  onClick,
}) => {
  // References
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  // Create color objects
  const baseColorObj = useMemo(() => new Color(baseColor), [baseColor]);
  const activeColorObj = useMemo(() => new Color(activeColor), [activeColor]);

  // Spring animation for smooth activity transitions
  const { springActivity } = useSpring({
    springActivity: activityLevel,
    config: {
      tension: 120,
      friction: 14,
      duration: 500,
    },
  });

  // Animation for pulsing effect
  useFrame((_state) => { // state is unused
    if (materialRef.current) {
      // Update uniforms
      materialRef.current.uniforms.time.value = _state.clock.getElapsedTime(); // state is unused
      materialRef.current.uniforms.activityLevel.value = springActivity.get();
      materialRef.current.uniforms.pulsePeriod.value = pulseSpeed;
    }

    // Scale node based on activity level for better visibility
    if (meshRef.current) {
      // Removed unused baseScale variable
      const activityScale = scale * (1 + springActivity.get() * 0.2);
      meshRef.current.scale.setScalar(activityScale);
    }
  });

  // Only render if there's activity
  if (activityLevel < 0.05) return null;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        data-testid="neural-node"
        data-color={activeColor}
        onClick={(event: ThreeEvent<MouseEvent>) => onClick && onClick(event, '', 'region')}
      >
        <Sphere args={[1, 32, 32]} /> {/* Use Sphere from drei import */}
        {/* Use PascalCase for extended components and ignore TS error */}
        {/* @ts-ignore */}
        <NeuralActivityShaderMaterial
          ref={materialRef}
          attach="material"
          baseColor={baseColorObj}
          activityColor={activeColorObj}
          activityLevel={activityLevel}
          glowIntensity={0.5}
          noiseIntensity={0.1}
          pulsePeriod={pulseSpeed}
          transparent
        />
      </mesh>

      {showLabel && label && (
        <Text
          position={[0, scale * 1.5, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          depthOffset={1}
          outlineWidth={0.05}
          outlineColor={activeColor}
        >
          {label}
        </Text>
      )}
    </group>
  );
};

/**
 * Props with neural-safe typing for ActivityFlow
 */
interface ActivityFlowProps {
  points: Vector3[];
  activityLevel: number;
  flowSpeed?: number;
  width?: number;
  color?: string;
  dashPattern?: [number, number];
  bidirectional?: boolean;
}

/**
 * ActivityFlow - Internal component for visualizing neural activity flow along connections
 */
const ActivityFlow: React.FC<ActivityFlowProps> = ({
  points,
  activityLevel,
  flowSpeed = 1,
  width = 0.1,
  color = '#3b82f6',
  dashPattern = [0.1, 0.1],
  bidirectional = false,
}) => {
  // Animation progress
  const progress = useRef(0);

  // Spring animation for smooth activity transitions
  const { springActivity } = useSpring({
    springActivity: activityLevel,
    config: {
      tension: 80,
      friction: 10,
      duration: 300,
    },
  });

  // Animation for flow effect
  useFrame((_state, delta) => { // state is unused
    // Update progress for flow animation
    progress.current = (progress.current + delta * flowSpeed * springActivity.get()) % 1;
  });

  // Only render if there's activity
  if (activityLevel < 0.05) return null;

  // Calculate line width based on activity level
  const lineWidth = width * (0.5 + activityLevel * 0.5);

  // Animation settings
  const dashArray = dashPattern;
  const dashOffset = progress.current;

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth}
        dashed
        dashScale={dashArray[0] + dashArray[1]}
        dashSize={dashArray[0]}
        dashOffset={dashOffset}
        opacity={0.3 + activityLevel * 0.7}
        transparent
        data-testid="neural-line"
        data-color={color}
      />

      {bidirectional && (
        <Line
          points={[...points].reverse()}
          color={color}
          lineWidth={lineWidth * 0.7}
          dashed
          dashScale={dashArray[0] + dashArray[1]}
          dashSize={dashArray[0]}
          dashOffset={-dashOffset}
          opacity={0.3 + activityLevel * 0.5}
          transparent
          data-testid="neural-line"
          data-color={color}
        />
      )}
    </group>
  );
};

/**
 * Props with neural-safe typing
 */
interface NeuralActivityVisualizerProps {
  regions: BrainRegion[];
  connections: NeuralConnection[];
  activityStates?: NeuralActivityState[];
  activationPattern?: NeuralActivationPattern;
  temporalSequence?: TemporalActivationSequence;
  playbackSpeed?: number;
  showLabels?: boolean;
  colorMap?: {
    none: string;
    low: string;
    medium: string;
    high: string;
    extreme: string;
  };
  flowColor?: string;
  maxVisibleActivities?: number;
  enableTemporalSmoothing?: boolean;
  onActivityNodeClick?: (
    event: Event,
    entityId: string,
    entityType: 'region' | 'connection'
  ) => void;
}

/**
 * Map activity levels to display properties
 */
interface ActivityDisplayProperties {
  color: string;
  pulseSpeed: number;
  scale: number;
}

/**
 * Activity level display mapping
 */
const defaultActivityDisplay: Record<ActivationLevel, ActivityDisplayProperties> = {
  [ActivationLevel.NONE]: {
    color: '#94a3b8',
    pulseSpeed: 0.5,
    scale: 0.2,
  },
  [ActivationLevel.LOW]: {
    color: '#60a5fa',
    pulseSpeed: 0.8,
    scale: 0.3,
  },
  [ActivationLevel.MEDIUM]: {
    color: '#fbbf24',
    pulseSpeed: 1.2,
    scale: 0.4,
  },
  [ActivationLevel.HIGH]: {
    color: '#f87171',
    pulseSpeed: 1.6,
    scale: 0.5,
  },
  [ActivationLevel.EXTREME]: {
    color: '#ef4444',
    pulseSpeed: 2.0,
    scale: 0.6,
  },
};

/**
 * NeuralActivityVisualizer - Molecular component for neural activity visualization
 * Implements clinical precision neural activity with temporal dynamics
 */
export const NeuralActivityVisualizer: React.FC<NeuralActivityVisualizerProps> = ({
  regions,
  connections,
  activityStates = [],
  activationPattern,
  temporalSequence,
  playbackSpeed = 1.0,
  showLabels = false,
  colorMap = {
    none: '#94a3b8',
    low: '#60a5fa',
    medium: '#fbbf24',
    high: '#f87171',
    extreme: '#ef4444',
  },
  flowColor = '#3b82f6',
  maxVisibleActivities = 100,
  enableTemporalSmoothing: _enableTemporalSmoothing = true, // Prefixed unused variable
  onActivityNodeClick,
}) => {
  // Refs
  const groupRef = useRef<Group>(null);

  // Create custom activity display properties using provided color map
  const activityDisplay = useMemo(() => {
    return {
      [ActivationLevel.NONE]: {
        ...defaultActivityDisplay[ActivationLevel.NONE],
        color: colorMap.none,
      },
      [ActivationLevel.LOW]: {
        ...defaultActivityDisplay[ActivationLevel.LOW],
        color: colorMap.low,
      },
      [ActivationLevel.MEDIUM]: {
        ...defaultActivityDisplay[ActivationLevel.MEDIUM],
        color: colorMap.medium,
      },
      [ActivationLevel.HIGH]: {
        ...defaultActivityDisplay[ActivationLevel.HIGH],
        color: colorMap.high,
      },
      [ActivationLevel.EXTREME]: {
        ...defaultActivityDisplay[ActivationLevel.EXTREME],
        color: colorMap.extreme,
      },
    };
  }, [colorMap]);

  // Maps for efficient lookup
  const regionMap = useMemo(() => {
    const map = new Map<string, BrainRegion>();
    regions.forEach((region) => map.set(region.id, region));
    return map;
  }, [regions]);

  const connectionMap = useMemo(() => {
    const map = new Map<string, NeuralConnection>();
    connections.forEach((connection) => map.set(connection.id, connection));
    return map;
  }, [connections]);

  // Process activity states
  const processedActivities = useMemo(() => {
    // If we have a temporal sequence, we'll handle it separately
    if (temporalSequence) return [];

    // If we have an activation pattern, convert it to activity states
    let activities = [...activityStates];

    if (activationPattern) {
      // Convert activation pattern to activity states
      const patternActivities: NeuralActivityState[] = [];

      // Add region activations
      activationPattern.regionActivations.forEach((activation) => {
        patternActivities.push({
          entityId: activation.regionId,
          entityType: 'region',
          timestamp: Date.now(),
          rawActivity: activation.activityLevel,
          activationLevel:
            activation.activityLevel < 0.1
              ? ActivationLevel.NONE
              : activation.activityLevel < 0.3
                ? ActivationLevel.LOW
                : activation.activityLevel < 0.6
                  ? ActivationLevel.MEDIUM
                  : activation.activityLevel < 0.9
                    ? ActivationLevel.HIGH
                    : ActivationLevel.EXTREME,
          activationDuration: 0,
          clinicalSignificance: activation.primaryEffect ? 0.8 : 0.5,
        });
      });

      // If there are connection activations, add those too
      if (activationPattern.connectionActivations) {
        activationPattern.connectionActivations.forEach((activation) => {
          patternActivities.push({
            entityId: activation.connectionId,
            entityType: 'connection',
            timestamp: Date.now(),
            rawActivity: activation.activityLevel,
            activationLevel:
              activation.activityLevel < 0.1
                ? ActivationLevel.NONE
                : activation.activityLevel < 0.3
                  ? ActivationLevel.LOW
                  : activation.activityLevel < 0.6
                    ? ActivationLevel.MEDIUM
                    : activation.activityLevel < 0.9
                      ? ActivationLevel.HIGH
                      : ActivationLevel.EXTREME,
            activationDuration: 0,
            clinicalSignificance: activation.primaryEffect ? 0.8 : 0.5,
          });
        });
      }
      activities = patternActivities;
    }

    // Sort activities by timestamp (descending) and limit
    activities.sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return b.timestamp - a.timestamp; // Most recent first
      }
      // Secondary sort by activity level (descending) if timestamps are equal
      return b.rawActivity - a.rawActivity;
    });

    return activities.slice(0, maxVisibleActivities);
  }, [activityStates, activationPattern, temporalSequence, maxVisibleActivities]);

  // State for temporal sequence playback
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [currentSequenceActivities, setCurrentSequenceActivities] = useState<NeuralActivityState[]>(
    []
  );

  // Effect for temporal sequence playback
  useEffect(() => {
    if (!temporalSequence) {
      setCurrentSequenceActivities([]); // Clear sequence if not provided
      return;
    }

    let intervalId: NodeJS.Timeout | undefined;
    let currentIndex = 0;

    const playNextStep = () => {
      if (!temporalSequence || currentIndex >= temporalSequence.timeSteps.length) {
        currentIndex = 0; // Loop sequence
      }
      // Use a different variable name here to avoid redeclaration
      const currentStepData = temporalSequence.timeSteps[currentIndex];
      const stepActivities: NeuralActivityState[] = currentStepData.activationStates; // Use states from the step

      // Determine duration until next step
      const nextTimeOffset =
        currentIndex + 1 < temporalSequence.timeSteps.length
          ? temporalSequence.timeSteps[currentIndex + 1].timeOffset
          : temporalSequence.timeSteps[0].timeOffset + // Loop duration approximation
            (temporalSequence.timeSteps[temporalSequence.timeSteps.length - 1].timeOffset -
              temporalSequence.timeSteps[0].timeOffset); // Add total duration for loop

      const duration = nextTimeOffset - currentStepData.timeOffset; // Duration in ms
      const playbackDuration = duration / (playbackSpeed || 1.0);

      // Update state with activities for the current step
      // Add activationDuration to each state for potential use in ActivityNode/Flow
      const activitiesWithDuration = stepActivities.map((act) => ({
        ...act,
        activationDuration: duration, // Assign the calculated duration
      }));
      setCurrentSequenceActivities(activitiesWithDuration);
      setCurrentSequenceIndex(currentIndex);

      currentIndex++; // Increment index for the next iteration

      // Schedule next step
      intervalId = setTimeout(playNextStep, Math.max(0, playbackDuration)); // Ensure delay isn't negative
    };

    playNextStep(); // Start the sequence

    return () => {
      if (intervalId) clearTimeout(intervalId); // Cleanup on unmount or change
    };
  }, [temporalSequence, playbackSpeed]);

  // Determine which activities to render
  const activitiesToRender = temporalSequence ? currentSequenceActivities : processedActivities;

  // Render function for activity nodes and flows
  const renderActivityNodes = (activities: NeuralActivityState[]) => {
    return activities.map((activity, index) => {
      // Add index here
      const displayProps =
        activityDisplay[activity.activationLevel] || activityDisplay[ActivationLevel.NONE];

      if (activity.entityType === 'region') {
        const region = regionMap.get(activity.entityId);
        if (!region) return null;
        const position = adaptVector3(region.position);
        return (
          <ActivityNode
            key={`region-activity-${region.id}-${index}`} // Add index to key
            position={position}
            scale={displayProps.scale}
            activityLevel={activity.rawActivity}
            activationLevel={activity.activationLevel}
            pulseSpeed={displayProps.pulseSpeed}
            baseColor={activityDisplay[ActivationLevel.NONE].color}
            activeColor={displayProps.color}
            label={region.name}
            showLabel={showLabels}
            onClick={onActivityNodeClick}
          />
        );
      } else if (activity.entityType === 'connection') {
        const connection = connectionMap.get(activity.entityId);
        if (!connection) return null;
        const regionA = regionMap.get(connection.sourceId);
        const regionB = regionMap.get(connection.targetId);
        if (!regionA || !regionB) return null;

        const points = [adaptVector3(regionA.position), adaptVector3(regionB.position)];
        return (
          <ActivityFlow
            key={`connection-activity-${connection.id}-${index}`} // Add index to key
            points={points}
            activityLevel={activity.rawActivity}
            color={flowColor}
            width={0.05 + activity.rawActivity * 0.1} // Dynamic width
            flowSpeed={1 + activity.rawActivity * 2} // Dynamic speed
            bidirectional={connection.directionality === 'bidirectional'}
          />
        );
      }
      return null;
    });
  };

  return (
    <group ref={groupRef} data-testid="neural-canvas">
      {/* Render static regions/connections if needed, or just activities */}
      {renderActivityNodes(activitiesToRender)}

      {/* Optional: Display pattern/sequence info */}
      {activationPattern && (
        <Text position={[0, 5, 0]} fontSize={0.8} color="cyan">
          Pattern: {activationPattern.name}
        </Text>
      )}
      {temporalSequence && (
        <Text position={[0, 4, 0]} fontSize={0.8} color="lime">
          Sequence: {temporalSequence.name} (Step: {currentSequenceIndex + 1})
        </Text>
      )}
    </group>
  );
};

/**
 * NOVAMIND Neural-Safe Molecular Component
 * NeuralActivityVisualizer - Quantum-level neural activity visualization
 * with clinical precision and temporal dynamics
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, Line, Text, useTexture, shaderMaterial } from '@react-three/drei';
import { Vector3, Color, ShaderMaterial, Mesh, IUniform, Group } from 'three';
import { useSpring, animated } from '@react-spring/three';
import { extend } from '@react-three/fiber';

// Domain types
import { 
  NeuralActivityState, 
  ActivationLevel,
  TemporalActivationSequence,
  NeuralActivationPattern
} from '@domain/types/brain/activity';
import { BrainRegion, NeuralConnection } from '@domain/types/brain/models';

// Neural activity shader
const NeuralActivityShaderMaterial = shaderMaterial(
  {
    time: 0,
    activityLevel: 0,
    activityColor: new Color('#ef4444'),
    baseColor: new Color('#1e293b'),
    pulsePeriod: 1.5,
    noiseIntensity: 0.1,
    glowIntensity: 0.5
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

// Declare the JSX element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      neuralActivityShaderMaterial: any;
    }
  }
}

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
  label?: string;
  showLabel?: boolean;
}

/**
 * ActivityNode - Internal component for visualizing a single neural activity node
 */
const ActivityNode: React.FC<ActivityNodeProps> = ({ 
  position, 
  scale, 
  activityLevel,
  activationLevel,
  pulseSpeed = 1.5,
  baseColor = '#1e293b',
  activeColor = '#ef4444',
  label,
  showLabel = false
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
      duration: 500
    }
  });
  
  // Animation for pulsing effect
  useFrame((state) => {
    if (materialRef.current) {
      // Update uniforms
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.activityLevel.value = springActivity.get();
      materialRef.current.uniforms.pulsePeriod.value = pulseSpeed;
      
      // Scale node based on activity level for better visibility
      if (meshRef.current) {
        const baseScale = scale;
        const activityScale = scale * (1 + springActivity.get() * 0.2);
        meshRef.current.scale.setScalar(activityScale);
      }
    }
  });
  
  // Only render if there's activity
  if (activityLevel < 0.05) return null;
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <neuralActivityShaderMaterial
          ref={materialRef}
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
  bidirectional = false
}) => {
  // Animation progress
  const progress = useRef(0);
  
  // Spring animation for smooth activity transitions
  const { springActivity } = useSpring({
    springActivity: activityLevel,
    config: {
      tension: 80,
      friction: 10,
      duration: 300
    }
  });
  
  // Animation for flow effect
  useFrame((state, delta) => {
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
        dashArray={dashArray}
        dashOffset={dashOffset}
        opacity={0.3 + activityLevel * 0.7}
        transparent
      />
      
      {bidirectional && (
        <Line
          points={[...points].reverse()}
          color={color}
          lineWidth={lineWidth * 0.7}
          dashed
          dashArray={dashArray}
          dashOffset={-dashOffset}
          opacity={0.3 + activityLevel * 0.5}
          transparent
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
  onActivityNodeClick?: (entityId: string, entityType: 'region' | 'connection') => void;
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
    scale: 0.2
  },
  [ActivationLevel.LOW]: {
    color: '#60a5fa',
    pulseSpeed: 0.8,
    scale: 0.3
  },
  [ActivationLevel.MEDIUM]: {
    color: '#fbbf24',
    pulseSpeed: 1.2,
    scale: 0.4
  },
  [ActivationLevel.HIGH]: {
    color: '#f87171',
    pulseSpeed: 1.6,
    scale: 0.5
  },
  [ActivationLevel.EXTREME]: {
    color: '#ef4444',
    pulseSpeed: 2.0,
    scale: 0.6
  }
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
    extreme: '#ef4444'
  },
  flowColor = '#3b82f6',
  maxVisibleActivities = 100,
  enableTemporalSmoothing = true,
  onActivityNodeClick
}) => {
  // Refs
  const groupRef = useRef<Group>(null);
  
  // Create custom activity display properties using provided color map
  const activityDisplay = useMemo(() => {
    return {
      [ActivationLevel.NONE]: {
        ...defaultActivityDisplay[ActivationLevel.NONE],
        color: colorMap.none
      },
      [ActivationLevel.LOW]: {
        ...defaultActivityDisplay[ActivationLevel.LOW],
        color: colorMap.low
      },
      [ActivationLevel.MEDIUM]: {
        ...defaultActivityDisplay[ActivationLevel.MEDIUM],
        color: colorMap.medium
      },
      [ActivationLevel.HIGH]: {
        ...defaultActivityDisplay[ActivationLevel.HIGH],
        color: colorMap.high
      },
      [ActivationLevel.EXTREME]: {
        ...defaultActivityDisplay[ActivationLevel.EXTREME],
        color: colorMap.extreme
      }
    };
  }, [colorMap]);
  
  // Maps for efficient lookup
  const regionMap = useMemo(() => {
    const map = new Map<string, BrainRegion>();
    regions.forEach(region => map.set(region.id, region));
    return map;
  }, [regions]);
  
  const connectionMap = useMemo(() => {
    const map = new Map<string, NeuralConnection>();
    connections.forEach(connection => map.set(connection.id, connection));
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
      activationPattern.regionActivations.forEach(activation => {
        patternActivities.push({
          entityId: activation.regionId,
          entityType: 'region',
          timestamp: Date.now(),
          rawActivity: activation.activityLevel,
          activationLevel: activation.activityLevel < 0.1 ? ActivationLevel.NONE :
                          activation.activityLevel < 0.3 ? ActivationLevel.LOW :
                          activation.activityLevel < 0.6 ? ActivationLevel.MEDIUM :
                          activation.activityLevel < 0.9 ? ActivationLevel.HIGH :
                          ActivationLevel.EXTREME,
          activationDuration: 0,
          clinicalSignificance: activation.primaryEffect ? 0.8 : 0.5
        });
      });
      
      // If there are connection activations, add those too
      if (activationPattern.connectionActivations) {
        activationPattern.connectionActivations.forEach(activation => {
          patternActivities.push({
            entityId: activation.connectionId,
            entityType: 'connection',
            timestamp: Date.now(),
            rawActivity: activation.activityLevel,
            activationLevel: activation.activityLevel < 0.1 ? ActivationLevel.NONE :
                            activation.activityLevel < 0.3 ? ActivationLevel.LOW :
                            activation.activityLevel < 0.6 ? ActivationLevel.MEDIUM :
                            activation.activityLevel < 0.9 ? ActivationLevel.HIGH :
                            ActivationLevel.EXTREME,
            activationDuration: 0,
            clinicalSignificance: activation.primaryEffect ? 0.8 : 0.5
          });
        });
      }
      
      // Combine with existing activities, prioritizing the pattern
      activities = [...patternActivities, ...activities];
    }
    
    // Filter to most relevant activities
    if (activities.length > maxVisibleActivities) {
      // Sort by activity level and clinical significance
      activities.sort((a, b) => {
        // Prioritize by clinical significance first
        if (a.clinicalSignificance && b.clinicalSignificance) {
          const sigDiff = b.clinicalSignificance - a.clinicalSignificance;
          if (Math.abs(sigDiff) > 0.1) return sigDiff;
        }
        
        // Then by raw activity
        return b.rawActivity - a.rawActivity;
      });
      
      // Limit to max visible
      activities = activities.slice(0, maxVisibleActivities);
    }
    
    return activities;
  }, [activityStates, activationPattern, temporalSequence, maxVisibleActivities]);
  
  // Track temporal sequence playback
  const [sequenceTimeIndex, setSequenceTimeIndex] = useState(0);
  const sequenceStartTime = useRef(Date.now());
  
  // Determine current temporal sequence activities
  const sequenceActivities = useMemo(() => {
    if (!temporalSequence) return [];
    
    // Find the current time step
    const currentTimeStep = temporalSequence.timeSteps[sequenceTimeIndex] || temporalSequence.timeSteps[0];
    return currentTimeStep?.activationStates || [];
  }, [temporalSequence, sequenceTimeIndex]);
  
  // Advance temporal sequence playback
  useFrame(() => {
    if (temporalSequence && temporalSequence.timeSteps.length > 1) {
      const now = Date.now();
      const elapsedMs = (now - sequenceStartTime.current) * playbackSpeed;
      
      // Find the appropriate time index
      let newIndex = 0;
      let foundIndex = false;
      
      for (let i = 0; i < temporalSequence.timeSteps.length; i++) {
        if (elapsedMs < temporalSequence.timeSteps[i].timeOffset) {
          newIndex = Math.max(0, i - 1);
          foundIndex = true;
          break;
        }
      }
      
      // If we've gone past the end, reset
      if (!foundIndex) {
        sequenceStartTime.current = now;
        newIndex = 0;
      }
      
      // Update if changed
      if (newIndex !== sequenceTimeIndex) {
        setSequenceTimeIndex(newIndex);
      }
    }
  });
  
  // Render activity nodes
  const renderActivityNodes = (activities: NeuralActivityState[]) => {
    return activities.map(activity => {
      if (activity.entityType === 'region') {
        // Get region data
        const region = regionMap.get(activity.entityId);
        if (!region) return null;
        
        // Get display properties
        const display = activityDisplay[activity.activationLevel];
        
        return (
          <ActivityNode
            key={`region-activity-${activity.entityId}`}
            position={region.position}
            scale={display.scale}
            activityLevel={activity.rawActivity}
            activationLevel={activity.activationLevel}
            pulseSpeed={display.pulseSpeed}
            activeColor={display.color}
            label={showLabels ? region.name : undefined}
            showLabel={showLabels}
          />
        );
      } else if (activity.entityType === 'connection') {
        // Get connection data
        const connection = connectionMap.get(activity.entityId);
        if (!connection) return null;
        
        // Get source and target regions
        const sourceRegion = regionMap.get(connection.sourceId);
        const targetRegion = regionMap.get(connection.targetId);
        if (!sourceRegion || !targetRegion) return null;
        
        // Create flow path
        const points = [sourceRegion.position, targetRegion.position];
        
        // Determine if bidirectional
        const isBidirectional = connection.type === 'bidirectional';
        
        return (
          <ActivityFlow
            key={`connection-activity-${activity.entityId}`}
            points={points}
            activityLevel={activity.rawActivity}
            flowSpeed={1 + activity.rawActivity}
            width={0.05 + activity.rawActivity * 0.15}
            color={flowColor}
            bidirectional={isBidirectional}
          />
        );
      }
      
      return null;
    });
  };
  
  return (
    <group ref={groupRef}>
      {/* Render activities from combined sources */}
      {renderActivityNodes(temporalSequence ? sequenceActivities : processedActivities)}
    </group>
  );
};

export default NeuralActivityVisualizer;

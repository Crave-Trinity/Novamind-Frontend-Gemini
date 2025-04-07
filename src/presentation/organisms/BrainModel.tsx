import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
// @ts-ignore - Types will be handled by overrides in package.json
import { Instance, Instances } from '@react-three/drei';
import { Color, ShaderMaterial, AdditiveBlending, Group, Clock } from 'three'; // Import specific members, removed unused Vector3, Quaternion, Matrix4
import { createNeuralGlowUniforms, updateTimeUniform } from '@shaders/neuralGlow'; // Removed unused setActiveState

/**
 * Neural node data structure with 3D location and clinical metadata
 */
export interface NeuralNode {
  /** Unique identifier for the node */
  id: string;

  /** 3D position in brain space */
  position: [number, number, number];

  /** Node size (radius) */
  size: number;

  /** Base color [r,g,b] with values from 0-1 */
  color: [number, number, number];

  /** Node activation strength (0-1) */
  activation: number;

  /** Region this node belongs to */
  region: string;

  /** Clinical data attached to this node */
  clinicalData?: {
    /** Activity level from baseline */
    activityDelta?: number;
    /** Potential markers or flags */
    markers?: string[];
    /** Additional clinical metadata */
    metadata?: Record<string, unknown>;
  };
}

/**
 * Props for the BrainModel component
 */
export interface BrainModelProps {
  /** Array of neural nodes to render */
  nodes: NeuralNode[];

  /** Currently selected node ID */
  selectedNodeId?: string;

  /** Currently highlighted region */
  highlightedRegion?: string;

  /** Callback when a node is clicked */
  onNodeClick?: (nodeId: string) => void;

  /** Model rotation speed (0 for no rotation) */
  rotationSpeed?: number;

  /** Auto-rotation enabled */
  autoRotate?: boolean;
}

/**
 * Neural node instance component with glow shader
 */
const NeuralNodeInstance: React.FC<{
  node: NeuralNode;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}> = ({ node, isSelected, isHighlighted, onClick }) => {
  // Scale the node size based on its importance and selection state
  const scale = isSelected ? node.size * 1.3 : isHighlighted ? node.size * 1.15 : node.size;

  // Memoize to prevent unnecessary re-renders
  const scaleFactor = useMemo(() => [scale, scale, scale] as [number, number, number], [scale]);

  return (
    <Instance
      position={node.position}
      scale={scaleFactor}
      color={new Color(...node.color)}
      onClick={onClick}
    />
  );
};

/**
 * Brain Model Component with optimized 3D rendering
 *
 * Implements best practices for Three.js performance:
 * - Instance rendering for neural nodes
 * - Proper resource disposal
 * - Shader optimizations for neural glow effects
 * - Progressive loading
 */
const BrainModel: React.FC<BrainModelProps> = ({
  nodes,
  selectedNodeId,
  highlightedRegion,
  onNodeClick = () => {},
  rotationSpeed = 0.001,
  autoRotate = true,
}) => {
  // Reference to the entire brain model for rotations
  const brainRef = useRef<Group>(null);

  // References for shader materials
  const shaderMaterialRef = useRef<ShaderMaterial>(null);

  // Shader clock
  const clockRef = useRef<Clock>(new Clock());

  // Access Three.js scene
  // Removed unused scene from useThree

  // State to track loaded nodes for progressive loading
  const [loadedNodeCount, setLoadedNodeCount] = useState(0);
  const maxNodesPerFrame = 50; // Limit nodes added per frame for smooth loading

  // Optimization: Precompute which nodes are highlighted
  const highlightedNodeIds = useMemo(() => {
    if (!highlightedRegion) return new Set<string>();
    return new Set(
      nodes.filter((node) => node.region === highlightedRegion).map((node) => node.id)
    );
  }, [nodes, highlightedRegion]);

  // Create custom shader material with neural glow effect
  const shaderMaterial = useMemo(() => {
    // Neural glow shader with pulsing effect
    const vertexShader = `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 color;
      uniform float time;
      uniform float intensity;
      uniform bool isActive;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        // Calculate fresnel effect for edge glow
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = dot(viewDirection, vNormal);
        fresnel = pow(1.0 - fresnel, 3.0);
        
        // Pulsating glow effect based on time
        float pulse = sin(time * 2.0) * 0.5 + 0.5;
        pulse = isActive ? pulse * 0.5 + 0.5 : pulse * 0.2 + 0.2;
        
        // Mix base color with fresnel effect
        vec3 glowColor = color * (intensity + fresnel * 1.5);
        
        // Apply pulse effect
        glowColor *= pulse * (isActive ? 1.5 : 1.0);
        
        gl_FragColor = vec4(glowColor, fresnel * intensity);
      }
    `;

    // Create default uniforms
    const uniforms = createNeuralGlowUniforms(
      [0.4, 0.6, 1.0], // Default blue color
      0.8, // Default intensity
      false // Not active by default
    );

    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
  }, []); // Corrected dependency array

  // Handle animation frame updates
  useFrame(() => {
    // Auto-rotation of the brain model
    if (brainRef.current && autoRotate) {
      brainRef.current.rotation.y += rotationSpeed;
    }

    // Update shader uniforms
    if (shaderMaterialRef.current) {
      updateTimeUniform(shaderMaterialRef.current.uniforms, clockRef.current.getElapsedTime());
    }

    // Progressive loading of nodes
    if (loadedNodeCount < nodes.length) {
      setLoadedNodeCount(Math.min(loadedNodeCount + maxNodesPerFrame, nodes.length));
    }
  });

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      // Dispose of geometries, materials, and textures
      if (shaderMaterialRef.current) {
        shaderMaterialRef.current.dispose();
      }

      // Clear any remaining resources
      clockRef.current.stop();
    };
  }, []);

  // Only render nodes that have been progressively loaded
  const visibleNodes = useMemo(() => {
    return nodes.slice(0, loadedNodeCount);
  }, [nodes, loadedNodeCount]);

  return (
    <group ref={brainRef}>
      <Instances limit={nodes.length}>
        {/* Base geometry for all instances - a perfect sphere */}
        <sphereGeometry args={[1, 32, 32]} />

        {/* Shared material with neural glow effect */}
        <primitive object={shaderMaterial} ref={shaderMaterialRef} />

        {/* Render neural nodes as instances for performance */}
        {visibleNodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isHighlighted = highlightedNodeIds.has(node.id);

          return (
            <NeuralNodeInstance
              key={node.id}
              node={node}
              isSelected={isSelected}
              isHighlighted={isHighlighted}
              onClick={() => onNodeClick(node.id)}
            />
          );
        })}
      </Instances>
    </group>
  );
};

export default React.memo(BrainModel);

/**
 * NOVAMIND Neural-Safe Common Component
 * LoadingFallback - Quantum-level loading visualization
 * with neuropsychiatric precision and elegant transitions
 */

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Html, useTexture } from '@react-three/drei';
import { Vector3, Color, MathUtils } from 'three';

/**
 * Props with neural-safe typing
 */
interface LoadingFallbackProps {
  message?: string;
  progress?: number;
  theme?: 'clinical' | 'dark' | 'modern' | 'highContrast';
  showNeuralAnimation?: boolean;
  height?: string | number;
  onReady?: () => void;
}

/**
 * Neural pulsing animation component
 */
const NeuralPulse: React.FC<{
  position: Vector3;
  baseColor: string;
  pulseColor: string;
  scale?: number;
  speed?: number;
  minOpacity?: number;
  maxOpacity?: number;
}> = ({
  position,
  baseColor,
  pulseColor,
  scale = 1,
  speed = 1,
  minOpacity = 0.1,
  maxOpacity = 0.8,
}) => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.Material>(null);
  const baseColorObj = useRef(new Color(baseColor));
  const pulseColorObj = useRef(new Color(pulseColor));
  const colorRef = useRef(new Color(baseColor));

  // Animation parameters
  const t = useRef(Math.random() * Math.PI * 2);

  // Update animation
  useFrame((state, delta) => {
    if (sphereRef.current && materialRef.current) {
      // Update pulse animation
      t.current += delta * speed;

      // Oscillate opacity
      const opacity = MathUtils.lerp(minOpacity, maxOpacity, (Math.sin(t.current) + 1) / 2);

      // Oscillate color
      colorRef.current
        .copy(baseColorObj.current)
        .lerp(pulseColorObj.current, (Math.sin(t.current) + 1) / 2);

      // Apply to material
      if (materialRef.current.opacity !== undefined) {
        materialRef.current.opacity = opacity;
      }

      if ('color' in materialRef.current && materialRef.current.color instanceof Color) {
        materialRef.current.color = colorRef.current;
      }

      // Subtle scale pulsation
      const scaleValue = scale * (1 + 0.1 * Math.sin(t.current));
      sphereRef.current.scale.set(scaleValue, scaleValue, scaleValue);
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 16, 16]} position={position} scale={scale}>
      <meshBasicMaterial ref={materialRef} color={baseColor} transparent opacity={minOpacity} />
    </Sphere>
  );
};

/**
 * Neural connection animation component
 */
const NeuralConnections: React.FC<{
  nodeCount: number;
  connectionDensity?: number;
  baseColor: string;
  activeColor: string;
}> = ({ nodeCount = 5, connectionDensity = 0.5, baseColor, activeColor }) => {
  // Generate nodes
  const nodes = useRef<Vector3[]>([]);
  const connections = useRef<{ from: number; to: number; active: boolean }[]>([]);
  const lineRefs = useRef<THREE.Line[]>([]);

  // Initialize nodes and connections
  useEffect(() => {
    // Generate nodes in a sphere-like arrangement
    nodes.current = Array.from({ length: nodeCount }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 1.5;

      return new Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    });

    // Generate connections
    const maxConnections = Math.floor((nodeCount * (nodeCount - 1) * connectionDensity) / 2);
    connections.current = [];

    for (let i = 0; i < maxConnections; i++) {
      const from = Math.floor(Math.random() * nodeCount);
      let to = Math.floor(Math.random() * nodeCount);

      // Avoid self-connections
      while (to === from) {
        to = Math.floor(Math.random() * nodeCount);
      }

      // Avoid duplicate connections
      const connectionExists = connections.current.some(
        (conn) => (conn.from === from && conn.to === to) || (conn.from === to && conn.to === from)
      );

      if (!connectionExists) {
        connections.current.push({
          from,
          to,
          active: Math.random() > 0.7, // 30% active
        });
      }
    }
  }, [nodeCount, connectionDensity]);

  // Animation cycle
  useFrame((state, delta) => {
    lineRefs.current.forEach((line, index) => {
      if (line && connections.current[index]) {
        // Periodically change active state
        if (Math.random() < 0.01) {
          connections.current[index].active = !connections.current[index].active;
        }

        // Update line color
        if (line.material instanceof THREE.LineBasicMaterial) {
          const targetColor = connections.current[index].active ? activeColor : baseColor;
          line.material.color.set(targetColor);

          // Update opacity
          line.material.opacity = connections.current[index].active ? 0.8 : 0.3;
        }
      }
    });
  });

  return (
    <>
      {/* Render nodes */}
      {nodes.current.map((pos, i) => (
        <NeuralPulse
          key={`node-${i}`}
          position={pos}
          baseColor={baseColor}
          pulseColor={activeColor}
          scale={0.15 + Math.random() * 0.1}
          speed={0.5 + Math.random() * 1}
        />
      ))}

      {/* Render connections */}
      {connections.current.map(({ from, to, active }, i) => {
        const fromPos = nodes.current[from];
        const toPos = nodes.current[to];

        if (!fromPos || !toPos) return null;

        return (
          <line
            key={`connection-${i}`}
            ref={(el) => {
              if (el) lineRefs.current[i] = el;
            }}
          >
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                array={
                  new Float32Array([fromPos.x, fromPos.y, fromPos.z, toPos.x, toPos.y, toPos.z])
                }
                count={2}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              attach="material"
              color={active ? activeColor : baseColor}
              transparent
              opacity={active ? 0.8 : 0.3}
              linewidth={1}
            />
          </line>
        );
      })}
    </>
  );
};

/**
 * 3D loading animation
 */
const BrainLoadingAnimation: React.FC<{
  progress: number;
}> = ({ progress }) => {
  // Rotation refs
  const groupRef = useRef<THREE.Group>(null);

  // Animate rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <NeuralConnections
        nodeCount={12}
        connectionDensity={0.3}
        baseColor="#94a3b8"
        activeColor="#3b82f6"
      />

      {/* Central pulsing sphere */}
      <NeuralPulse
        position={new Vector3(0, 0, 0)}
        baseColor="#3b82f6"
        pulseColor="#8b5cf6"
        scale={0.4}
        speed={1.5}
        minOpacity={0.4}
        maxOpacity={0.9}
      />

      {/* Progress indicator */}
      <Html position={[0, -3, 0]} center>
        <div
          style={{
            width: '100px',
            textAlign: 'center',
            color: 'white',
            fontSize: '0.8rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            userSelect: 'none',
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>{Math.round(progress * 100)}%</div>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                backgroundColor: '#3b82f6',
                transition: 'width 0.3s ease-out',
              }}
            />
          </div>
        </div>
      </Html>
    </group>
  );
};

/**
 * Theme configuration
 */
const themeConfig: Record<
  string,
  {
    background: string;
    text: string;
    accent: string;
    activeColor: string;
  }
> = {
  clinical: {
    background: '#ffffff',
    text: '#1e293b',
    accent: '#3b82f6',
    activeColor: '#f87171',
  },
  dark: {
    background: '#0f172a',
    text: '#f8fafc',
    accent: '#8b5cf6',
    activeColor: '#f87171',
  },
  modern: {
    background: '#f8fafc',
    text: '#0f172a',
    accent: '#3b82f6',
    activeColor: '#f97316',
  },
  highContrast: {
    background: '#000000',
    text: '#ffffff',
    accent: '#3b82f6',
    activeColor: '#ef4444',
  },
};

/**
 * LoadingFallback - Common component for visualization loading states
 * Implements clinical precision loading animation with neural theme
 */
export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading Neural Visualization',
  progress = 0,
  theme = 'dark',
  showNeuralAnimation = true,
  height = '100%',
  onReady,
}) => {
  // State for animation timing
  const [showLoader, setShowLoader] = useState(true);

  // Handle component ready state
  useEffect(() => {
    // Only trigger onReady when progress is complete
    if (progress >= 1 && onReady) {
      // Add slight delay for smooth transition
      const timeout = setTimeout(() => {
        setShowLoader(false);
        onReady();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [progress, onReady]);

  // Get theme configuration
  const currentTheme = themeConfig[theme] || themeConfig.dark;

  // Only render if we're still loading
  if (!showLoader) return null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        backgroundColor: currentTheme.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'opacity 0.5s ease-out',
        opacity: showLoader ? 1 : 0,
      }}
    >
      {showNeuralAnimation ? (
        <div style={{ width: '100%', height: '70%', minHeight: '200px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 2]}>
            <ambientLight intensity={0.5} />
            <BrainLoadingAnimation progress={progress} />
          </Canvas>
        </div>
      ) : (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            borderTop: `3px solid ${currentTheme.accent}`,
            borderRight: `3px solid transparent`,
            animation: 'spin 1s linear infinite',
            marginBottom: '1.5rem',
          }}
        />
      )}

      <h3
        style={{
          color: currentTheme.text,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 500,
          marginBottom: '0.5rem',
          fontSize: '1.25rem',
        }}
      >
        {message}
      </h3>

      {!showNeuralAnimation && (
        <div
          style={{
            width: '200px',
            marginTop: '1rem',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: `${currentTheme.text}20`,
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                backgroundColor: currentTheme.accent,
                transition: 'width 0.3s ease-out',
              }}
            />
          </div>
          <div
            style={{
              textAlign: 'center',
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: `${currentTheme.text}80`,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {Math.round(progress * 100)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingFallback;

import { Canvas, useFrame, RootState } from "@react-three/fiber"; // Import RootState
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import React, { useRef, useEffect, useMemo } from "react"; // Removed unused useCallback
import * as THREE from "three";

import { useTheme } from "@/application/hooks/useTheme";
import {
  MeshWithShaderMaterial,
  Object3DWithMaterial,
} from "../../types/three-extensions";
import { isValidTheme } from "../../types/theme";
import {
  createNeuralGlowUniforms,
  updateTimeUniform,
  setActiveState,
} from "../../utils/shaders/neuralGlow";

/**
 * Brain region data interface
 */
export interface BrainRegion {
  id: string;
  name: string;
  activity: number; // 0-1 scale of neural activity
  coordinates: [number, number, number]; // [x, y, z] in 3D space
  connections: string[]; // IDs of connected regions
  size: number; // Size modifier for visualization
  color?: string | number[]; // Override for default color scheme
}

/**
 * Props for BrainVisualizationContainer
 */
export interface BrainVisualizationContainerProps {
  brainData: BrainRegion[];
  activeRegions: string[];
  viewMode: "normal" | "activity" | "connections";
  onRegionSelect: (regionId: string) => void;
}

/**
 * BrainVisualizationContainer component
 * Container for the 3D brain visualization with Three.js
 * Optimized for performance with WebGL
 */
const BrainVisualizationContainer: React.FC<
  BrainVisualizationContainerProps
> = ({ brainData, activeRegions, viewMode, onRegionSelect }) => {
  const { theme, isDarkMode } = useTheme();

  // Settings for different themes
  const themeSettings = useMemo(
    () => ({
      light: {
        bgColor: "#ffffff",
        glowIntensity: 0.5,
        useBloom: false,
      },
      dark: {
        bgColor: "#121212",
        glowIntensity: 0.8,
        useBloom: true,
      },
      clinical: {
        bgColor: "#f8f9fa",
        glowIntensity: 0.4,
        useBloom: false,
      },
      "sleek-dark": {
        bgColor: "#0a1128",
        glowIntensity: 1.0,
        useBloom: true,
      },
      retro: {
        bgColor: "#0a1128",
        glowIntensity: 0.5,
        useBloom: false,
      },
      wes: {
        bgColor: "#F8E9D6",
        glowIntensity: 0.3,
        useBloom: false,
      },
    }),
    [],
  );

  // Get current theme settings (default to light if theme is invalid)
  const currentTheme = isValidTheme(theme)
    ? theme
    : isDarkMode
      ? "dark"
      : "light";
  const settings = themeSettings[currentTheme];

  // Memoize brain data processing to avoid unnecessary recalculations
  const processedData = useMemo(() => {
    return brainData.map((region) => {
      // Calculate color based on activity if in activity view mode
      let color = region.color || [0.3, 0.6, 1.0]; // Default blue

      if (viewMode === "activity") {
        // Gradient from blue (low) to red (high)
        const r = Math.min(1.0, region.activity * 2);
        const b = Math.max(0, 1 - region.activity * 2);
        color = [r, 0.4, b];
      }

      return {
        ...region,
        isActive: activeRegions.includes(region.id),
        color,
      };
    });
  }, [brainData, activeRegions, viewMode]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]} // Responsive to device pixel ratio for retina screens
        camera={{ position: [0, 0, 15], fov: 50 }}
        performance={{ min: 0.5 }} // Performance optimization
      >
        {/* Background color */}
        <color attach="background" args={[settings.bgColor]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight
          position={[-10, -10, -5]}
          intensity={0.2}
          color="#6080ff"
        />

        {/* Brain model */}
        <BrainModel
          processedData={processedData}
          viewMode={viewMode}
          glowIntensity={settings.glowIntensity}
          onRegionSelect={onRegionSelect}
        />

        {/* Post-processing effects */}
        {settings.useBloom && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} intensity={1.5} />
          </EffectComposer>
        )}
      </Canvas>

      {/* UI Overlay */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-center">
        <div className="rounded-lg bg-black/30 px-4 py-2 text-xs text-white backdrop-blur-sm">
          {activeRegions.length === 0 ? (
            <span>Click on a brain region to select it</span>
          ) : (
            activeRegions.map((regionId) => {
              const region = brainData.find((r) => r.id === regionId);
              return region ? (
                <span
                  key={region.id}
                  className="m-1 inline-block rounded bg-white/10 px-2 py-1"
                >
                  {region.name}
                </span>
              ) : null;
            })
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Brain model component with WebGL optimizations
 * Uses memoization for performance
 */
const BrainModel = React.memo(
  ({
    processedData,
    viewMode,
    glowIntensity,
    onRegionSelect,
  }: {
    processedData: (BrainRegion & {
      isActive: boolean;
      color: number[] | string;
    })[];
    viewMode: "normal" | "activity" | "connections";
    glowIntensity: number;
    onRegionSelect: (regionId: string) => void;
  }) => {
    const groupRef = useRef<THREE.Group>(null);

    // Animate brain rotation
    useFrame((state: RootState) => {
      // Re-add RootState type
      if (groupRef.current) {
        // Gentle rotation for visual appeal
        groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;

        // Update time uniform for all regions to animate shaders
        processedData.forEach((region) => {
          const mesh = groupRef.current?.getObjectByName(
            `region-${region.id}`,
          ) as Object3DWithMaterial | undefined;

          if (mesh?.material?.uniforms) {
            updateTimeUniform(
              mesh.material.uniforms,
              state.clock.getElapsedTime(),
            );
          }
        });
      }
    });

    return (
      <group ref={groupRef}>
        {/* Render each brain region as a sphere */}
        {processedData.map((region) => (
          <RegionMesh
            key={region.id}
            region={region}
            glowIntensity={glowIntensity}
            onSelect={() => onRegionSelect(region.id)}
          />
        ))}

        {/* Render connections between regions if in connections mode */}
        {viewMode === "connections" &&
          processedData.map((region) =>
            region.connections.map((connectedId) => {
              const connectedRegion = processedData.find(
                (r) => r.id === connectedId,
              );
              if (!connectedRegion) {
                return null;
              }

              return (
                <ConnectionLine
                  key={`${region.id}-${connectedId}`}
                  start={region.coordinates}
                  end={connectedRegion.coordinates}
                  active={region.isActive && connectedRegion.isActive}
                  activityLevel={
                    (region.activity + connectedRegion.activity) / 2
                  }
                />
              );
            }),
          )}
      </group>
    );
  },
);

/**
 * Individual brain region mesh component
 * Uses custom shaders for glow effect
 */
const RegionMesh = React.memo(
  ({
    region,
    glowIntensity,
    onSelect,
  }: {
    region: BrainRegion & { isActive: boolean; color: number[] | string };
    glowIntensity: number;
    onSelect: () => void;
  }) => {
    const meshRef = useRef<MeshWithShaderMaterial>(null);

    // Create shader uniforms with proper typing
    const uniforms = useMemo(() => {
      return createNeuralGlowUniforms(
        Array.isArray(region.color)
          ? region.color.length === 3
            ? (region.color as [number, number, number])
            : [0.3, 0.6, 1.0]
          : [0.3, 0.6, 1.0],
        glowIntensity * (region.isActive ? 1.5 : 1.0) * region.activity,
        region.isActive,
      );
    }, [region.color, glowIntensity, region.isActive, region.activity]);

    // Update active state when it changes
    useEffect(() => {
      if (meshRef.current?.material?.uniforms) {
        setActiveState(meshRef.current.material.uniforms, region.isActive);
      }
    }, [region.isActive]);

    return (
      <mesh
        ref={meshRef}
        name={`region-${region.id}`}
        position={region.coordinates}
        scale={[region.size, region.size, region.size]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          transparent
          uniforms={uniforms}
          vertexShader={`
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vNormal;
          uniform float time;
          uniform float intensity;

          void main() {
            vUv = uv;
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            
            float displacement = sin(position.x * 10.0 + time) * 0.005 * intensity;
            vec3 newPosition = position + normal * displacement;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `}
          fragmentShader={`
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vNormal;
          uniform vec3 color;
          uniform float intensity;
          uniform float time;
          uniform bool isActive;

          void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
            
            float activeFactor = 1.0;
            if (isActive) {
              activeFactor = 1.0 + sin(time * 2.0) * 0.3;
              fresnel *= 1.3;
            }
            
            float glowIntensity = fresnel * intensity * activeFactor;
            float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
            glowIntensity *= 0.9 + noise * 0.2;
            
            vec3 finalColor = color * glowIntensity;
            float alpha = min(glowIntensity, 1.0);
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
        />
      </mesh>
    );
  },
);

/**
 * Connection line between brain regions
 */
const ConnectionLine = React.memo(
  ({
    start,
    end,
    active,
    activityLevel,
  }: {
    start: [number, number, number];
    end: [number, number, number];
    active: boolean;
    activityLevel: number;
  }) => {
    const lineRef = useRef<THREE.Line>(null);

    // Create connection line and update on changes
    useEffect(() => {
      if (lineRef.current) {
        // Update line opacity based on activity
        const material = lineRef.current.material as THREE.LineBasicMaterial;
        if (material) {
          material.opacity = active ? 0.8 : 0.2;
          material.color.setRGB(
            active ? 0.6 + activityLevel * 0.4 : 0.3,
            active ? 0.8 : 0.3,
            active ? 1.0 : 0.3,
          );
        }
      }
    }, [active, activityLevel]);

    // Create line with points
    const line = useMemo(() => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...start),
        new THREE.Vector3(...end),
      ]);

      const material = new THREE.LineBasicMaterial({
        color: "#80a0ff",
        transparent: true,
        opacity: 0.4,
        linewidth: 1,
      });

      return new THREE.Line(geometry, material);
    }, [start, end]);

    return <primitive object={line} ref={lineRef} />;
  },
);

export default BrainVisualizationContainer;

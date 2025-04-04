import { OrbitControls } from "@react-three/drei"; // Removed Environment, useGLTF
import { Canvas, useFrame, RootState } from "@react-three/fiber"; // Import RootState
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import React, { useRef, useEffect, useMemo } from "react"; // Removed useState
import * as THREE from "three";

import { useTheme } from "@hooks/useTheme";
import { useBrainVisualization } from "@hooks/useBrainVisualization";
import {
  RenderMode,
  BrainRegion,
  type NeuralPathway,
} from "@domain/models/brain/BrainModel";

interface BrainVisualizationProps {
  /** Patient ID for data fetching */
  patientId?: string;
  /** Optional height override */
  height?: string | number;
  /** Optional initially active regions */
  initialActiveRegions?: string[];
  /** Optional render mode override */
  renderMode?: RenderMode;
  /** Callback when a region is clicked */
  onRegionClick?: (regionId: string) => void;
  /** Whether to auto-rotate the model */
  autoRotate?: boolean;
  /** Optional className for container */
  className?: string;
  /** Whether the visualization is interactive */
  interactive?: boolean;
  /** Whether to show region labels */
  showLabels?: boolean;
}

/**
 * Brain Region Mesh Component
 * Renders a single brain region as a 3D mesh
 */
// eslint-disable-next-line react/no-unknown-property
const RegionMesh: React.FC<{
  region: BrainRegion;
  isActive: boolean;
  isHighlighted: boolean;
  glowIntensity: number;
  renderMode: RenderMode;
  onClick?: (() => void) | undefined;
}> = ({
  region,
  isActive,
  isHighlighted,
  glowIntensity,
  renderMode,
  onClick,
}) => {
  // Refs for the mesh and material
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Determine color based on render mode and status
  const color = useMemo(() => {
    if (isHighlighted) {
      return "#ffff00"; // Yellow for highlighted regions
    }

    if (isActive) {
      switch (renderMode) {
        case RenderMode.ANATOMICAL:
          return "#ff6b6b"; // Red for active regions in anatomical mode
        case RenderMode.FUNCTIONAL:
          return "#4dabf7"; // Blue for functional mode
        case RenderMode.ACTIVITY:
          return `hsl(${120 * region.data.activity}, 100%, 50%)`; // Green to red based on activity
        case RenderMode.SIGNIFICANCE:
          return `hsl(${120 * (1 - region.significance)}, 100%, 50%)`; // Red to green based on significance
        case RenderMode.CONNECTIVITY:
          return "#9775fa"; // Purple for connectivity mode
        case RenderMode.ANOMALY:
          return region.data.anomalies.length > 0 ? "#ff0000" : "#aaaaaa"; // Red if anomalies exist
        case RenderMode.TREATMENT_RESPONSE:
          return "#32c36c"; // Green for treatment response mode
        default:
          return "#aaaaaa"; // Default gray
      }
    }

    return "#aaaaaa"; // Default gray for inactive regions
  }, [isActive, isHighlighted, renderMode, region]);

  // Animation for pulsing effect on active regions
  useFrame((state: RootState) => {
    // Re-add RootState type
    if (meshRef.current && materialRef.current && (isActive || isHighlighted)) {
      // Pulse effect for active or highlighted regions
      const pulse = Math.sin(state.clock.getElapsedTime() * 2) * 0.1 + 0.9;
      meshRef.current.scale.setScalar(region.scale * pulse);

      // Glow effect based on highlight state
      if (isHighlighted) {
        materialRef.current.emissiveIntensity =
          0.5 + Math.sin(state.clock.getElapsedTime() * 3) * 0.2;
      } else if (isActive) {
        materialRef.current.emissiveIntensity = glowIntensity * 0.5;
      }
    }
  });
/* eslint-disable react/no-unknown-property */
return (
  <mesh
    ref={meshRef}
    position={[region.position[0], region.position[1], region.position[2]]}
    scale={[region.scale, region.scale, region.scale]}
    onClick={(e) => {
      e.stopPropagation();
      if (onClick) onClick();
    }}
  >
    <sphereGeometry args={[1, 16, 16]} />
    <meshStandardMaterial
      ref={materialRef}
      color={color}
      emissive={color}
      emissiveIntensity={isHighlighted || isActive ? glowIntensity : 0}
      roughness={0.3}
      metalness={0.7}
    />
  </mesh>
);
/* eslint-enable react/no-unknown-property */
};

/**
 * Neural Pathway Component
 * Renders a connection between brain regions
 */
const NeuralPathwayMesh: React.FC<{
  pathway: NeuralPathway;
  sourcePosition: [number, number, number];
  targetPosition: [number, number, number];
  isActive: boolean;
  thickness?: number;
}> = ({
  pathway,
  sourcePosition,
  targetPosition,
  isActive,
  thickness = 0.1,
}) => {
  // Create a curve for the pathway
  const curve = useMemo(() => {
    const p0 = new THREE.Vector3(
      sourcePosition[0],
      sourcePosition[1],
      sourcePosition[2],
    );
    const p1 = new THREE.Vector3(
      targetPosition[0],
      targetPosition[1],
      targetPosition[2],
    );

    // Create a midpoint with some curvature
    const midPoint = new THREE.Vector3()
      .addVectors(p0, p1)
      .multiplyScalar(0.5)
      .add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
        ),
      );

    return new THREE.QuadraticBezierCurve3(p0, midPoint, p1);
  }, [sourcePosition, targetPosition]);

  // Points to define the curve
  const points = useMemo(() => curve.getPoints(20), [curve]);

  // Colors based on pathway type and activity
  const color = useMemo(() => {
    if (!isActive) {
      return new THREE.Color("#555555");
    }
    return pathway.type === "excitatory"
      ? new THREE.Color("#4c6ef5")
      : new THREE.Color("#ff6b6b");
  }, [pathway.type, isActive]);

  /* eslint-disable react/no-unknown-property */
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} linewidth={thickness} />
    </line>
  );
  /* eslint-enable react/no-unknown-property */
};

/**
 * Brain Model Component
 * Combines regions and pathways into a complete model
 */
const BrainModel: React.FC<{
  regions: BrainRegion[];
  pathways: NeuralPathway[];
  activeRegions: string[];
  highlightedRegions: string[];
  renderMode: RenderMode;
  onRegionClick?: (regionId: string) => void;
  glowIntensity: number;
  interactive: boolean;
}> = ({
  regions,
  pathways,
  activeRegions,
  highlightedRegions,
  renderMode,
  onRegionClick,
  glowIntensity,
  interactive,
}) => {
  // Track positions of regions for pathways
  const regionPositions = useMemo(() => {
    const positions: Record<string, [number, number, number]> = {};
    regions.forEach((region) => {
      positions[region.id] = region.position;
    });
    return positions;
  }, [regions]);

  return (
    <group>
      {/* Render brain regions */}
      {regions.map((region) => (
        <RegionMesh
          key={region.id}
          region={region}
          isActive={activeRegions.includes(region.id)}
          isHighlighted={highlightedRegions.includes(region.id)}
          renderMode={renderMode}
          glowIntensity={glowIntensity}
          onClick={interactive && onRegionClick ? () => onRegionClick(region.id) : undefined}
        />
      ))}

      {/* Render neural pathways */}
      {pathways.map((pathway) => {
        const sourcePosition = regionPositions[pathway.sourceId];
        const targetPosition = regionPositions[pathway.targetId];

        if (!sourcePosition || !targetPosition) {
          return null;
        }

        return (
          <NeuralPathwayMesh
            key={pathway.id}
            pathway={pathway}
            sourcePosition={sourcePosition}
            targetPosition={targetPosition}
            isActive={
              activeRegions.includes(pathway.sourceId) ||
              activeRegions.includes(pathway.targetId) ||
              pathway.isActive
            }
            thickness={pathway.strength * 0.3}
          />
        );
      })}
    </group>
  );
};

/**
 * Main Brain Visualization Component
 * 3D visualization of brain model with interactive controls
 */
const BrainVisualization: React.FC<BrainVisualizationProps> = ({
  patientId,
  height = "500px",
  initialActiveRegions = [],
  renderMode: externalRenderMode,
  onRegionClick,
  autoRotate = false,
  className = "",
  interactive = true,
  showLabels = true,
}) => {
  // Get theme from context
  const { theme, isDarkMode } = useTheme();

  // Use the brain visualization hook
  const {
    brainModel,
    isLoading,
    error,
    viewState,
    setViewState,
    activeRegions,
    setActiveRegions,
    // highlightRegion, // Removed unused variable
    // clearHighlights, // Removed unused variable
  } = useBrainVisualization({
    patientId: patientId || '',
    autoRotate,
    highlightActiveRegions: true,
  });

  // Initialize active regions if provided
  useEffect(() => {
    if (initialActiveRegions.length > 0) {
      setActiveRegions(initialActiveRegions);
    }
  }, [initialActiveRegions, setActiveRegions]);

  // Set render mode if externally provided
  useEffect(() => {
    if (externalRenderMode) {
      setViewState((prev) => ({ ...prev, renderMode: externalRenderMode }));
    }
  }, [externalRenderMode, setViewState]);

  // Handler for region click
  const handleRegionClick = (regionId: string) => {
    if (!interactive) return;

    // Toggle in active regions
    setActiveRegions((prevRegions) => {
      if (prevRegions.includes(regionId)) {
        return prevRegions.filter((id) => id !== regionId);
      } else {
        return [...prevRegions, regionId];
      }
    });

    // Call external handler if provided
    onRegionClick?.(regionId);
  };

  // Theme-specific settings
  const visualSettings = useMemo(
    () =>
      ({
        light: {
          bgColor: "#f8f9fa",
          ambientLight: 0.8,
          directionalLight: 0.7,
          glowIntensity: 0.2,
          useBloom: false,
        },
        dark: {
          bgColor: "#1a1a2e",
          ambientLight: 0.4,
          directionalLight: 0.6,
          glowIntensity: 0.5,
          useBloom: true,
        },
        clinical: {
          bgColor: "#ffffff",
          ambientLight: 1.0,
          directionalLight: 0.8,
          glowIntensity: 0.1,
          useBloom: false,
        },
        "sleek-dark": {
          bgColor: "#121212",
          ambientLight: 0.3,
          directionalLight: 0.5,
          glowIntensity: 0.8,
          useBloom: true,
        },
        retro: {
          bgColor: "#0a1128",
          ambientLight: 0.5,
          directionalLight: 0.6,
          glowIntensity: 0.4,
          useBloom: false,
        },
        wes: {
          bgColor: "#F8E9D6",
          ambientLight: 0.7,
          directionalLight: 0.6,
          glowIntensity: 0.3,
          useBloom: false,
        },
      }) as const,
    [],
  );

  // Type guard for theme values
  const isValidVisualTheme = (t: string): t is keyof typeof visualSettings => {
    return t in visualSettings;
  };

  // Get current settings based on theme
  const currentSettings = isValidVisualTheme(theme)
    ? visualSettings[theme]
    : visualSettings[isDarkMode ? "dark" : "light"];

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ height }}
      >
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-200 ${className}`}
        style={{ height }}
      >
        <div className="p-4 text-center">
          <p className="font-bold">Error loading brain model</p>
          <p className="text-sm">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  if (!brainModel) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ height }}
      >
        <div className="p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No brain model data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ height, width: "100%" }}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      <Canvas
        dpr={[1, 2]} // Responsive resolution
        camera={{ position: [0, 0, 30], fov: 50 }}
        gl={{ antialias: true }}
      >
        {/* Scene background */}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <color attach="background" args={[currentSettings.bgColor]} />

        {/* Lighting */}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <ambientLight intensity={currentSettings.ambientLight} />
        {/* eslint-disable-next-line react/no-unknown-property */}
        <directionalLight
          /* eslint-disable-next-line react/no-unknown-property */
          position={[10, 10, 5]}
          /* eslint-disable-next-line react/no-unknown-property */
          intensity={currentSettings.directionalLight}
          /* eslint-disable-next-line react/no-unknown-property */
          castShadow
        />

        {/* Brain model */}
        <BrainModel
          regions={brainModel.regions}
          pathways={brainModel.pathways}
          activeRegions={activeRegions}
          highlightedRegions={viewState.highlightedRegions}
          renderMode={viewState.renderMode}
          onRegionClick={handleRegionClick}
          glowIntensity={currentSettings.glowIntensity}
          interactive={interactive}
        />

        {/* Camera controls */}
        <OrbitControls
          enablePan={interactive}
          enableZoom={interactive}
          enableRotate={interactive}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
        />

        {/* Post-processing effects */}
        {currentSettings.useBloom && (
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              intensity={1.5}
            />
          </EffectComposer>
        )}
      </Canvas>

      {/* UI Overlay */}
      {showLabels && (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4">
          <div className="inline-block rounded-lg bg-black/30 px-4 py-2 text-xs text-white backdrop-blur-sm">
            {activeRegions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {activeRegions.map((regionId) => {
                  const region = brainModel.regions.find(
                    (r: BrainRegion) => r.id === regionId,
                  );
                  return (
                    <span
                      key={regionId}
                      className="inline-block rounded bg-white/10 px-2 py-1"
                    >
                      {region?.name || regionId}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span>No active regions selected</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrainVisualization;

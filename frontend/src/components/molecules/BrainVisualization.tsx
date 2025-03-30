import { OrbitControls, Environment, Loader, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import React, { useMemo, useRef, Suspense } from "react";

import { useTheme } from "../../application/contexts/ThemeProviderComponent";
import { BrainData, BrainVisualizationProps } from "../../types/brain";
import {
  transformBrainData,
  getActiveRegions,
  getActiveConnections,
  generateConnectionPositionMap,
  applyVisualizationMode,
} from "../../utils/brainDataTransformer";
import NeuralConnection from "../atoms/NeuralConnection";
import RegionMesh from "../atoms/RegionMesh";

/**
 * Error boundary for 3D visualization to prevent crashes
 */
class BrainVisualizationErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Brain visualization error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-900 md:h-96">
          <div className="p-6 text-center">
            <h3 className="mb-2 text-xl text-red-400">Visualization Error</h3>
            <p className="text-gray-300">
              There was a problem rendering the brain visualization.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * BrainModel component that renders the actual 3D model
 * This is separated to allow for more granular control of rerenders
 */
const BrainModel = React.memo(
  ({
    brainData,
    activeRegionIds,
    mode,
    onRegionClick,
    onConnectionClick,
    autoRotate,
  }: {
    brainData: BrainData;
    activeRegionIds: string[];
    mode: "anatomical" | "functional" | "activity";
    onRegionClick?: (id: string) => void;
    onConnectionClick?: (id: string) => void;
    autoRotate?: boolean;
  }) => {
    const { settings } = useTheme();
    const groupRef = useRef<THREE.Group>(null);

    // Get active regions and their positions
    const activeRegions = useMemo(
      () => getActiveRegions(brainData, activeRegionIds),
      [brainData, activeRegionIds],
    );

    // Get active connections between regions
    const activeConnections = useMemo(
      () => getActiveConnections(brainData, activeRegionIds),
      [brainData, activeRegionIds],
    );

    // Generate a map of positions for efficient lookup
    const positionMap = useMemo(
      () => generateConnectionPositionMap(brainData),
      [brainData],
    );

    // Apply visual styling based on mode
    const visualizedRegions = useMemo(
      () => applyVisualizationMode(brainData.regions, mode, settings),
      [brainData.regions, mode, settings],
    );

    // Handle auto-rotation animation
    useFrame(({ clock }) => {
      if (groupRef.current && autoRotate) {
        groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      }
    });

    return (
      <group ref={groupRef}>
        {/* Render brain regions */}
        {visualizedRegions.map((region) => (
          <RegionMesh
            key={region.id}
            region={region}
            glowIntensity={settings.glowIntensity}
            onClick={onRegionClick}
            pulse={region.isActive}
          />
        ))}

        {/* Render connections between regions */}
        {activeConnections.map((connection) => {
          // Skip connections with missing position data
          if (
            !positionMap[connection.sourceId] ||
            !positionMap[connection.targetId]
          ) {
            return null;
          }

          return (
            <NeuralConnection
              key={connection.id}
              connection={connection}
              sourcePosition={
                positionMap[connection.sourceId] as [number, number, number]
              }
              targetPosition={
                positionMap[connection.targetId] as [number, number, number]
              }
              excitationColor={settings.excitationColor}
              inhibitionColor={settings.inhibitionColor}
              opacity={settings.connectionOpacity}
              onClick={onConnectionClick}
            />
          );
        })}
      </group>
    );
  },
);

/**
 * Main BrainVisualization component
 * Renders a complete 3D brain visualization with regions and connections
 */
const BrainVisualization: React.FC<BrainVisualizationProps> = ({
  brainData,
  activeRegions = [],
  theme: themeProp,
  showConnections = true,
  size = { width: "100%", height: "500px" },
  onRegionClick,
  onConnectionClick,
  autoRotate = true,
  mode = "anatomical",
  cameraPosition = [0, 0, 30],
  className = "",
}) => {
  const { theme, setTheme, settings } = useTheme();

  // If theme prop is provided, use it
  React.useEffect(() => {
    if (themeProp && themeProp !== theme) {
      setTheme(themeProp);
    }
  }, [themeProp, theme, setTheme]);

  // Transform brain data for visualization
  const processedData = useMemo(
    () => transformBrainData(brainData),
    [brainData],
  );

  // Extract width and height from size
  const width = size.width || "100%";
  const height = size.height || "500px";

  return (
    <BrainVisualizationErrorBoundary>
      <div
        className={`relative overflow-hidden rounded-lg ${className}`}
        style={{ width, height }}
      >
        <Canvas
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          camera={{ position: cameraPosition, fov: 50 }}
          shadows
        >
          {/* Set background color */}
          <color attach="background" args={[settings.bgColor]} />

          {/* Lighting setup */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
          <directionalLight position={[-10, -10, -10]} intensity={0.2} />

          {/* Suspense for async loading */}
          <Suspense fallback={null}>
            <BrainModel
              brainData={processedData}
              activeRegionIds={activeRegions}
              mode={mode}
              onRegionClick={onRegionClick}
              onConnectionClick={onConnectionClick}
              autoRotate={autoRotate}
            />

            {/* Background elements */}
            <Stars radius={100} depth={50} count={5000} factor={4} />
            <Environment preset="night" />

            {/* Post-processing effects */}
            {settings.useBloom && (
              <EffectComposer>
                <Bloom
                  luminanceThreshold={0.2}
                  luminanceSmoothing={0.9}
                  intensity={1.5}
                />
              </EffectComposer>
            )}
          </Suspense>

          {/* Camera controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false} // We handle this in our own animation
            autoRotateSpeed={0.5}
            minDistance={15}
            maxDistance={50}
          />
        </Canvas>

        {/* Loading indicator */}
        <Loader
          containerStyles={{
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(10px)",
          }}
          dataStyles={{
            color: "#ffffff",
            fontSize: "14px",
          }}
          dataInterpolation={(p) => `Loading brain model... ${Math.round(p)}%`}
        />

        {/* Region information overlay */}
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-center">
          <div className="rounded-lg bg-black/30 px-4 py-2 text-xs text-white backdrop-blur-sm">
            {activeRegions.length > 0 ? (
              activeRegions.map((regionId) => {
                const region = brainData.regions.find((r) => r.id === regionId);
                return region ? (
                  <span
                    key={region.id}
                    className="m-1 inline-block rounded bg-white/10 px-2 py-1"
                  >
                    {region.name}
                  </span>
                ) : null;
              })
            ) : (
              <span className="text-gray-400">No regions selected</span>
            )}
          </div>
        </div>
      </div>
    </BrainVisualizationErrorBoundary>
  );
};

export default BrainVisualization;

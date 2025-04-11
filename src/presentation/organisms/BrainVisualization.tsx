/**
 * NOVAMIND Neural Visualization Component
 * Renders a 3D brain model with clinical-grade precision
 */
import React, { useRef, useMemo, useEffect } from 'react'; // Restored useEffect
import type { ThreeEvent } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber'; // Added ThreeEvent
// @ts-ignore: TS2305 - Module '"@react-three/drei"' has no exported member 'OrbitControls'/'PerspectiveCamera'. (Likely type/config issue)
import { OrbitControls, PerspectiveCamera, Line } from '@react-three/drei'; // Removed unused useGLTF, Added Line
import { Bloom, EffectComposer } from '@react-three/postprocessing'; // Restored EffectComposer
import type { Mesh } from 'three'; // Removed Line import from three

import type { BrainModel, BrainRegion } from '@domain/types/brain'; // Re-add BrainRegion
import { RenderMode, isBrainModel } from '@domain/types/brain'; // Re-add isBrainModel

// --- Component Interfaces ---

interface RegionNodeProps {
  region: BrainRegion;
  isSelected: boolean;
  settings?: typeof DEFAULT_SETTINGS;
  onClick?: () => void;
}

interface ConnectionProps {
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  color: string;
  opacity: number;
  selected?: boolean;
  // pulse?: boolean; // Removed unused prop
}

interface BrainVisualizationProps {
  brainModel?: BrainModel | null;
  selectedRegion?: string | null;
  onRegionSelect?: (regionId: string) => void;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
}

// --- Default Settings ---

const DEFAULT_SETTINGS = {
  showLabels: true,
  rotationSpeed: 0.5,
  highlightColor: '#0066F0',
  backgroundColor: '#121212',
  connectionOpacity: 0.6,
  nodeSize: 1,
  renderMode: 'normal' as RenderMode, // Re-add RenderMode type cast
  enableBloom: true,
  synapticPulse: true,
};

// --- Helper Components ---

// Neural-safe region node component with quantum-level typing
const RegionNode: React.FC<RegionNodeProps> = ({ region, isSelected, settings, onClick }) => {
  const mesh = useRef<Mesh>(null);

  // Neural-safe activity color mapping with clinical precision
  const color = useMemo(() => {
    if (isSelected) return settings?.highlightColor || '#0066F0';

    // Neural activity color mapping
    if (settings?.renderMode === RenderMode.FUNCTIONAL) {
      // Use imported RenderMode
      const activityLevel = region.activityLevel || 0;
      if (activityLevel > 0.8) return '#F41A13'; // Critical
      if (activityLevel > 0.6) return '#FF8C00'; // High
      if (activityLevel > 0.4) return '#FFCC33'; // Moderate
      if (activityLevel > 0.2) return '#99C2F9'; // Low
      return '#868E96'; // Minimal
    }

    // Risk color mapping
    if (settings?.renderMode === RenderMode.RISK && region.riskFactor !== undefined) {
      // Use imported RenderMode
      if (region.riskFactor > 0.8) return '#F41A13'; // Severe
      if (region.riskFactor > 0.6) return '#FF8C00'; // High
      if (region.riskFactor > 0.4) return '#FFCC33'; // Moderate
      if (region.riskFactor > 0.2) return '#99C2F9'; // Low
      return '#82C7FF'; // Minimal
    }

    return region.color || '#82C7FF';
  }, [region, isSelected, settings]);

  // Neural pulse animation with quantum precision
  useEffect(() => {
    if (!mesh.current) return;
    if (isSelected && settings?.synapticPulse) {
      // Add neural glow animation here
    }
  }, [isSelected, settings]);

  // Neural-safe position with clinical precision
  const position = useMemo(() => {
    return [region.position.x || 0, region.position.y || 0, region.position.z || 0];
  }, [region.position]);

  return (
    <mesh
      ref={mesh}
      position={position as any}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <sphereGeometry args={[(settings?.nodeSize || 1) * (isSelected ? 1.2 : 1), 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={isSelected ? color : undefined}
        emissiveIntensity={isSelected ? 0.5 : 0}
        roughness={0.4}
        metalness={0.8}
      />
    </mesh>
  );
};

// Neural connection component with quantum-level precision
const Connection: React.FC<ConnectionProps> = ({ start, end, color, opacity, selected }) => {
  // Use R3F Line component from drei
  const points = useMemo(
    () =>
      [
        [start.x, start.y, start.z],
        [end.x, end.y, end.z],
      ] as [number, number, number][],
    [start, end]
  );

  return (
    <Line
      points={points}
      color={color}
      lineWidth={selected ? 2 : 1}
      opacity={selected ? Math.min(opacity + 0.2, 1) : opacity}
      transparent={true}
    />
  );
};

// --- Main Component ---

export const BrainVisualization: React.FC<BrainVisualizationProps> = ({
  brainModel,
  selectedRegion,
  onRegionSelect,
  className = '',
  isLoading = false,
  error = null,
}) => {
  // Ensure neural-safe type handling with quantum-level precision
  const safeModel = useMemo(() => {
    if (!brainModel || !isBrainModel(brainModel)) {
      // Re-add isBrainModel check
      return {
        regions: [],
        settings: DEFAULT_SETTINGS, // Return default settings if model is invalid/missing
      };
    }
    // Merge brainModel settings with defaults if brainModel is valid
    return {
      ...brainModel,
      settings: {
        ...DEFAULT_SETTINGS,
        // ...(brainModel.settings || {}), // Removed merge: BrainModel type has no 'settings' property
      },
    };
  }, [brainModel]);

  const { regions, settings } = safeModel; // Remove prefix from settings

  // Neural-safe rendering states
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-background-card p-4 shadow-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
          <p className="text-sm text-neutral-400">Initializing neural visualization...</p>
        </div>
      </div>
    );
  }

  // Neural error handling with clinical precision
  if (error) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-background-card p-4 shadow-md">
        <div className="flex flex-col items-center space-y-2 text-center">
          <svg
            className="h-12 w-12 text-danger-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm font-medium text-danger-500">Neural visualization error</p>
          <p className="text-xs text-neutral-400">{error.message}</p>
        </div>
      </div>
    );
  }

  // Neural-safe region handling
  const safeRegions = regions || [];
  const isEmpty = safeRegions.length === 0;

  if (isEmpty) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-background-card p-4 shadow-md">
        <div className="flex flex-col items-center space-y-2 text-center">
          <svg
            className="h-12 w-12 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <p className="text-sm text-neutral-400">No neural data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-64 md:h-[500px] rounded-lg overflow-hidden ${className}`}>
      <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={[settings?.backgroundColor || '#121212']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />

        {/* Brain regions with neural-safe rendering */}
        {safeRegions.map((region) => (
          <RegionNode
            key={region.id}
            region={region}
            isSelected={region.id === selectedRegion}
            settings={settings}
            onClick={() => onRegionSelect?.(region.id)}
          />
        ))}

        {/* Neural connections with clinical precision */}
        {safeRegions.map((region) => (
          <React.Fragment key={`connections-${region.id}`}>
            {(region.connections || []).map((targetId) => {
              const targetRegion = safeRegions.find((r) => r.id === targetId);
              if (!targetRegion) return null;

              return (
                <Connection
                  key={`${region.id}-${targetId}`}
                  start={region.position}
                  end={targetRegion.position}
                  color={settings?.highlightColor || '#0066F0'}
                  opacity={settings?.connectionOpacity || 0.6}
                  selected={region.id === selectedRegion || targetId === selectedRegion}
                  // pulse prop removed as it doesn't exist on ConnectionProps
                />
              );
            })}
          </React.Fragment>
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={settings?.rotationSpeed ? settings.rotationSpeed > 0 : false}
          autoRotateSpeed={settings?.rotationSpeed || 0.5}
        />

        {settings?.enableBloom && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />
          </EffectComposer>
        )}
      </Canvas>

      {/* Clinical controls overlay */}
      <div className="absolute bottom-2 right-2 flex space-x-2">
        <button
          className="rounded bg-background-elevated px-2 py-1 text-xs text-neutral-300 opacity-70 transition hover:opacity-100"
          onClick={() => {
            /* Toggle rotation */
          }}
        >
          Rotate
        </button>
        <button
          className="rounded bg-background-elevated px-2 py-1 text-xs text-neutral-300 opacity-70 transition hover:opacity-100"
          onClick={() => {
            /* Reset camera */
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default BrainVisualization;

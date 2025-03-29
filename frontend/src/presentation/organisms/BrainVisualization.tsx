import React, { useRef, useEffect, useState } from 'react';
import { useBrainVisualization } from '../../application/hooks/useBrainVisualization';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { BrainRegion, RenderMode } from '../../domain/models/BrainModel';

// Improved BrainVisualization component with error handling and fallbacks
const BrainVisualization: React.FC<{
  patientId?: string;
  initialActiveRegions?: string[];
  onRegionClick?: (regionId: string) => void;
  renderMode?: string;
  showControls?: boolean;
  height?: string;
}> = ({
  patientId,
  initialActiveRegions = [],
  onRegionClick,
  renderMode = 'realistic',
  showControls = true,
  height = '500px'
}) => {
  // Wrap hook use in try/catch for better error handling
  try {
    const {
      brainModel,
      isLoading,
      error,
      activeRegions,
      setActiveRegions,
      highlightRegion,
      clearHighlights,
      setRenderMode
    } = useBrainVisualization({ patientId });

    const [initialized, setInitialized] = useState(false);

    // Initialize model with props
    useEffect(() => {
      if (brainModel && !initialized) {
        // Convert string renderMode to RenderMode enum
        const mode = renderMode as RenderMode;
        setRenderMode(mode);
        
        if (initialActiveRegions.length > 0) {
          setActiveRegions(initialActiveRegions);
        }
        setInitialized(true);
      }
    }, [brainModel, renderMode, initialActiveRegions, setRenderMode, setActiveRegions, initialized]);

    // Update when active regions change externally
    useEffect(() => {
      if (brainModel && initialized && initialActiveRegions.length > 0) {
        setActiveRegions(initialActiveRegions);
      }
    }, [initialActiveRegions, brainModel, initialized, setActiveRegions]);

    // Handle loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-sm">Loading brain model...</p>
          </div>
        </div>
      );
    }

    // Handle error state with clear error message
    if (error) {
      return (
        <div className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg" style={{ height }}>
          <div className="text-center p-6">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error Loading Brain Model</h3>
            <p className="text-sm text-red-600 dark:text-red-300">
              {error instanceof Error ? error.message : "An error occurred while loading the brain model"}
            </p>
          </div>
        </div>
      );
    }

    // Handle case when brain model is not available
    if (!brainModel) {
      return (
        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg" style={{ height }}>
          <div className="text-center p-6">
            <p className="text-sm">No brain model data available.</p>
          </div>
        </div>
      );
    }

    // Render 3D visualization
    return (
      <div className="relative rounded-lg overflow-hidden" style={{ height }}>
        <Canvas
          camera={{ position: [0, 0, 150], fov: 50 }}
          gl={{ antialias: true }}
          shadows
          dpr={[1, 2]}
        >
          <color attach="background" args={['#f8f9fa']} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <BrainModelRenderer
            brainModel={brainModel}
            activeRegions={activeRegions}
            onRegionClick={onRegionClick}
          />
          
          {showControls && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
          <Environment preset="city" />
        </Canvas>
        
        {/* Active regions indicator */}
        {activeRegions.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap justify-center">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs">
              {activeRegions.length} active {activeRegions.length === 1 ? 'region' : 'regions'}
            </div>
          </div>
        )}
      </div>
    );
  } catch (err) {
    // Component-level error boundary
    console.error('Error in BrainVisualization:', err);
    return (
      <div className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg" style={{ height: height || '500px' }}>
        <div className="text-center p-6">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Rendering Error</h3>
          <p className="text-sm text-red-600 dark:text-red-300">
            {err instanceof Error ? err.message : "An unexpected error occurred in the brain visualization component"}
          </p>
        </div>
      </div>
    );
  }
};

// Brain Model Renderer Component
interface BrainModelRendererProps {
  brainModel: any;
  activeRegions: string[];
  onRegionClick?: (regionId: string) => void;
}

const BrainModelRenderer: React.FC<BrainModelRendererProps> = ({
  brainModel,
  activeRegions,
  onRegionClick
}) => {
  // Safe render with proper null checks
  if (!brainModel || !brainModel.regions) {
    return null;
  }

  return (
    <group>
      {/* Render brain regions */}
      {Object.values(brainModel.regions).map((region: any) => (
        <BrainRegionRenderer
          key={region.id}
          region={region}
          isActive={activeRegions.includes(region.id)}
          onClick={() => onRegionClick && onRegionClick(region.id)}
        />
      ))}
    </group>
  );
};

// Individual Brain Region Renderer
interface BrainRegionRendererProps {
  region: any;
  isActive: boolean;
  onClick?: () => void;
}

const BrainRegionRenderer: React.FC<BrainRegionRendererProps> = ({
  region,
  isActive,
  onClick
}) => {
  // Safe defaults for coordinates
  const coordinates = region.coordinates || [0, 0, 0];
  const position = region.position || coordinates;
  const scale = region.scale || 1;
  const color = isActive ? '#ff6b6b' : '#64748b';
  
  return (
    <mesh 
      position={position as any} 
      scale={scale} 
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.7}
        metalness={0.2}
        transparent
        opacity={isActive ? 0.9 : 0.7}
      />
    </mesh>
  );
};

export default BrainVisualization;

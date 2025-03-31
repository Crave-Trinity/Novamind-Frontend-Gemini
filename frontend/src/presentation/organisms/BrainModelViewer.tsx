/**
 * NOVAMIND Neural Visualization
 * BrainModelViewer Organism Component - primary visualization engine
 * for neural architecture with clinical precision
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, BakeShadows, useContextBridge } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, SelectiveBloom, DepthOfField } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import { ThemeContext } from '@presentation/context/ThemeContext';

// Import molecular components
import BrainRegionGroup from '@presentation/molecules/BrainRegionGroup';
import NeuralConnections from '@presentation/molecules/NeuralConnections';

// Import domain types
import { BrainModel, BrainRegion, NeuralConnection } from '@domain/types/brain/models';
import { RenderMode, ThemeSettings, VisualizationSettings } from '@domain/types/brain/visualization';
import { SafeArray, Result, VisualizationState } from '@domain/types/common';

// Neural-safe prop definition with explicit typing
interface BrainModelViewerProps {
  // Core data
  brainModel?: BrainModel;
  visualizationState: VisualizationState<BrainModel>;
  
  // Visualization settings
  renderMode?: RenderMode;
  theme?: string;
  visualizationSettings?: VisualizationSettings;
  
  // Interaction state
  selectedRegionIds?: string[];
  highlightedRegionIds?: string[];
  regionSearchQuery?: string;
  
  // Post-processing
  enableBloom?: boolean;
  enableDepthOfField?: boolean;
  highPerformanceMode?: boolean;
  
  // Clinical visualization
  activityThreshold?: number;
  showInactiveRegions?: boolean;
  
  // Canvas configuration
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  
  // Callbacks
  onRegionClick?: (regionId: string) => void;
  onRegionHover?: (regionId: string | null) => void;
  onConnectionClick?: (connectionId: string) => void;
  onConnectionHover?: (connectionId: string | null) => void;
  onCameraMove?: (position: [number, number, number], target: [number, number, number]) => void;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * CameraController - Internal component for camera handling
 */
const CameraController: React.FC<{
  onCameraMove?: (position: [number, number, number], target: [number, number, number]) => void;
  initialPosition?: [number, number, number];
  initialTarget?: [number, number, number];
}> = ({
  onCameraMove,
  initialPosition = [0, 0, 10],
  initialTarget = [0, 0, 0]
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Set initial camera position
  useEffect(() => {
    if (!camera) return;
    camera.position.set(...initialPosition);
  }, [camera, initialPosition]);
  
  // Register camera move callback
  useFrame(() => {
    if (!controlsRef.current || !onCameraMove) return;
    
    const position: [number, number, number] = [
      camera.position.x,
      camera.position.y,
      camera.position.z
    ];
    
    const target: [number, number, number] = [
      controlsRef.current.target.x,
      controlsRef.current.target.y,
      controlsRef.current.target.z
    ];
    
    onCameraMove(position, target);
  });
  
  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.7}
      minDistance={5}
      maxDistance={50}
      target={new THREE.Vector3(...initialTarget)}
    />
  );
};

/**
 * Brain3DScene - Internal component for the actual 3D scene
 */
const Brain3DScene: React.FC<{
  brainModel: BrainModel;
  renderMode: RenderMode;
  themeSettings: ThemeSettings;
  selectedRegionIds: string[];
  highlightedRegionIds: string[];
  highPerformanceMode: boolean;
  activityThreshold: number;
  showInactiveRegions: boolean;
  onRegionClick?: (regionId: string) => void;
  onRegionHover?: (regionId: string | null) => void;
  onConnectionClick?: (connectionId: string) => void;
  onConnectionHover?: (connectionId: string | null) => void;
}> = ({
  brainModel,
  renderMode,
  themeSettings,
  selectedRegionIds,
  highlightedRegionIds,
  highPerformanceMode,
  activityThreshold,
  showInactiveRegions,
  onRegionClick,
  onRegionHover,
  onConnectionClick,
  onConnectionHover
}) => {
  // Safe wrappers for null safety
  const safeRegions = new SafeArray(brainModel.regions);
  const safeConnections = new SafeArray(brainModel.connections);
  
  // Group regions by lobe/functional system for neuroanatomical precision
  const regionGroups = useMemo(() => {
    // Create a default grouping if none exists in the model
    // This is a simplified example - clinical applications would use true neuroanatomical grouping
    const groups: Record<string, BrainRegion[]> = {
      'frontal': [],
      'parietal': [],
      'temporal': [],
      'occipital': [],
      'subcortical': [],
      'other': []
    };
    
    safeRegions.forEach(region => {
      // In a real implementation, this would use the region's actual lobe/system data
      // For now, we'll use a simplified approach based on position
      const [x, y, z] = Array.isArray(region.position) 
        ? region.position 
        : [region.position.x, region.position.y, region.position.z];
      
      if (y > 2) {
        groups.frontal.push(region);
      } else if (y < -2) {
        groups.occipital.push(region);
      } else if (x > 2) {
        groups.temporal.push(region);
      } else if (x < -2) {
        groups.parietal.push(region);
      } else if (Math.abs(z) < 2) {
        groups.subcortical.push(region);
      } else {
        groups.other.push(region);
      }
    });
    
    // Filter out empty groups
    return Object.entries(groups)
      .filter(([_, regions]) => regions.length > 0)
      .map(([name, regions]) => ({
        groupId: `group-${name}`,
        groupName: name.charAt(0).toUpperCase() + name.slice(1),
        regions
      }));
  }, [safeRegions]);
  
  return (
    <group>
      {/* Render neural connections */}
      <NeuralConnections
        connections={safeConnections.toArray()}
        regions={safeRegions.toArray()}
        renderMode={renderMode}
        themeSettings={themeSettings}
        highPerformanceMode={highPerformanceMode}
        selectedRegionIds={selectedRegionIds}
        highlightedRegionIds={highlightedRegionIds}
        minimumStrength={0.2}
        filterByActivity={renderMode === RenderMode.FUNCTIONAL}
        animated={renderMode !== RenderMode.ANATOMICAL}
        useDashedLines={themeSettings.useDashedConnections}
        onConnectionClick={onConnectionClick}
        onConnectionHover={onConnectionHover}
      />
      
      {/* Render region groups */}
      {regionGroups.map(group => (
        <BrainRegionGroup
          key={group.groupId}
          regions={group.regions}
          groupId={group.groupId}
          groupName={group.groupName}
          renderMode={renderMode}
          themeSettings={themeSettings}
          instancedRendering={!highPerformanceMode && group.regions.length > 20}
          highPerformanceMode={highPerformanceMode}
          selectedRegionIds={selectedRegionIds}
          highlightedRegionIds={highlightedRegionIds}
          activityThreshold={activityThreshold}
          showInactiveRegions={showInactiveRegions}
          showLabels={themeSettings.showLabels}
          onRegionClick={onRegionClick}
          onRegionHover={onRegionHover}
        />
      ))}
      
      {/* Add contact shadows for visual depth */}
      {!highPerformanceMode && themeSettings.showFloor && (
        <ContactShadows
          position={[0, -5, 0]}
          scale={30}
          blur={2}
          opacity={0.4}
          color={themeSettings.shadowColor}
        />
      )}
      
      {/* Optional environment lighting */}
      {!highPerformanceMode && themeSettings.useEnvironmentLighting && (
        <Environment preset={themeSettings.environmentPreset} />
      )}
      
      {/* Performance optimization for shadows */}
      {!highPerformanceMode && themeSettings.showFloor && (
        <BakeShadows />
      )}
    </group>
  );
};

/**
 * BrainModelViewer - Organism component for comprehensive brain visualization
 * Implements neural-safe rendering with clinical precision
 */
const BrainModelViewer: React.FC<BrainModelViewerProps> = ({
  brainModel,
  visualizationState,
  renderMode = RenderMode.ANATOMICAL,
  theme = 'clinical',
  visualizationSettings,
  selectedRegionIds = [],
  highlightedRegionIds = [],
  regionSearchQuery,
  enableBloom = true,
  enableDepthOfField = false,
  highPerformanceMode = false,
  activityThreshold = 0.2,
  showInactiveRegions = true,
  width = '100%',
  height = '100%',
  backgroundColor = '#000000',
  cameraPosition = [0, 0, 20],
  cameraFov = 50,
  onRegionClick,
  onRegionHover,
  onConnectionClick,
  onConnectionHover,
  onCameraMove,
  onLoadComplete,
  onError
}) => {
  // Get custom theme settings
  const { getThemeSettings } = React.useContext(ThemeContext);
  const ContextBridge = useContextBridge(ThemeContext);
  
  // Theme settings with fallback
  const themeSettings = useMemo(() => {
    return visualizationSettings?.themeSettings || getThemeSettings(theme);
  }, [visualizationSettings, getThemeSettings, theme]);
  
  // Process search query to highlight matching regions
  const searchHighlightedRegions = useMemo(() => {
    if (!regionSearchQuery || !brainModel) return [];
    
    const query = regionSearchQuery.toLowerCase();
    return new SafeArray(brainModel.regions)
      .filter(region => region.name.toLowerCase().includes(query))
      .map(region => region.id)
      .toArray();
  }, [regionSearchQuery, brainModel]);
  
  // Combine explicitly highlighted regions with search results
  const combinedHighlightedRegions = useMemo(() => {
    return [...new Set([...highlightedRegionIds, ...searchHighlightedRegions])];
  }, [highlightedRegionIds, searchHighlightedRegions]);
  
  // Handle state-based rendering
  const renderContent = () => {
    switch (visualizationState.status) {
      case 'loading':
        return renderLoadingState();
      case 'error':
        return renderErrorState(visualizationState.error);
      case 'success':
        return renderVisualization(visualizationState.data);
      default:
        return renderEmptyState();
    }
  };
  
  // Render loading state
  const renderLoadingState = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-pulse flex space-x-4 mb-4 justify-center">
          <div className="rounded-full bg-blue-400 h-3 w-3"></div>
          <div className="rounded-full bg-blue-400 h-3 w-3"></div>
          <div className="rounded-full bg-blue-400 h-3 w-3"></div>
        </div>
        <p className="text-gray-300 text-sm">Loading neural architecture...</p>
      </div>
    </div>
  );
  
  // Render error state
  const renderErrorState = (error: Error) => {
    // Call error callback
    useEffect(() => {
      if (onError) onError(error);
    }, [error]);
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 mb-2 text-2xl">
            <svg className="inline-block w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 className="text-white text-lg font-medium mb-2">Neural Visualization Error</h3>
          <p className="text-gray-300 text-sm mb-4">{error.message}</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
            onClick={() => window.location.reload()}
          >
            Reinitialize Visualization
          </button>
        </div>
      </div>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="text-center max-w-md px-4">
        <h3 className="text-white text-lg font-medium mb-2">No Neural Data Available</h3>
        <p className="text-gray-300 text-sm">Please select a neural model to visualize.</p>
      </div>
    </div>
  );
  
  // Render the actual visualization
  const renderVisualization = (model: BrainModel) => {
    // Call load complete callback
    useEffect(() => {
      if (onLoadComplete) onLoadComplete();
    }, []);
    
    return (
      <Canvas 
        style={{ background: backgroundColor }} 
        camera={{ position: cameraPosition, fov: cameraFov }}
        dpr={[1, highPerformanceMode ? 1.5 : 2]}
        gl={{ 
          antialias: !highPerformanceMode,
          alpha: true,
          logarithmicDepthBuffer: !highPerformanceMode 
        }}
      >
        <ContextBridge>
          {/* Lighting based on theme */}
          <ambientLight intensity={themeSettings.ambientLightIntensity} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={themeSettings.directionalLightIntensity}
            color={themeSettings.directionalLightColor}
          />
          
          {/* Camera controller */}
          <CameraController 
            onCameraMove={onCameraMove}
            initialPosition={cameraPosition}
          />
          
          {/* Brain model visualization */}
          <Brain3DScene
            brainModel={model}
            renderMode={renderMode}
            themeSettings={themeSettings}
            selectedRegionIds={selectedRegionIds}
            highlightedRegionIds={combinedHighlightedRegions}
            highPerformanceMode={highPerformanceMode}
            activityThreshold={activityThreshold}
            showInactiveRegions={showInactiveRegions}
            onRegionClick={onRegionClick}
            onRegionHover={onRegionHover}
            onConnectionClick={onConnectionClick}
            onConnectionHover={onConnectionHover}
          />
          
          {/* Post-processing effects */}
          {!highPerformanceMode && (enableBloom || enableDepthOfField) && (
            <EffectComposer>
              {enableBloom && (
                <Bloom
                  luminanceThreshold={themeSettings.bloomThreshold}
                  luminanceSmoothing={0.9}
                  intensity={themeSettings.bloomIntensity}
                  kernelSize={KernelSize.LARGE}
                />
              )}
              {enableDepthOfField && (
                <DepthOfField
                  focusDistance={0}
                  focalLength={0.02}
                  bokehScale={2}
                />
              )}
            </EffectComposer>
          )}
        </ContextBridge>
      </Canvas>
    );
  };
  
  // Render with appropriate sizing
  return (
    <div 
      style={{ 
        width: width, 
        height: height, 
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '0.5rem' 
      }}
    >
      {renderContent()}
      
      {/* Optional UI overlays */}
      {visualizationState.status === 'success' && visualizationSettings?.showRegionCount && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          {new SafeArray(visualizationState.data.regions).size()} regions | 
          {new SafeArray(visualizationState.data.connections).size()} connections
        </div>
      )}
      
      {/* Legend for current render mode */}
      {visualizationState.status === 'success' && visualizationSettings?.showLegend && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs p-2 rounded">
          <div className="font-medium mb-1">
            {renderMode === RenderMode.ANATOMICAL && 'Anatomical View'}
            {renderMode === RenderMode.FUNCTIONAL && 'Functional View'}
            {renderMode === RenderMode.CONNECTIVITY && 'Connectivity View'}
          </div>
          {renderMode === RenderMode.FUNCTIONAL && (
            <div className="flex space-x-2 mt-1">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: themeSettings.activityColorScale.high }}></div>
                <span>High</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: themeSettings.activityColorScale.medium }}></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: themeSettings.activityColorScale.low }}></div>
                <span>Low</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(BrainModelViewer);

/**
 * NOVAMIND Neural Visualization
 * BrainModelViewer Organism Component - primary visualization engine
 * for neural architecture with clinical precision
 */

import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  BakeShadows,
  useContextBridge,
} from "@react-three/drei";
import * as THREE from "three";
import {
  EffectComposer,
  Bloom,
  SelectiveBloom,
  DepthOfField,
} from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import ThemeContext from "@contexts/ThemeContext"; // Corrected alias and import type

// Import molecular components
import BrainRegionGroup from "@presentation/molecules/BrainRegionGroup";
import NeuralConnections from "@presentation/molecules/NeuralConnections";

// Import domain types
import {
  BrainModel,
  BrainRegion,
  NeuralConnection,
} from "@domain/types/brain/models";
import {
  RenderMode,
  ThemeSettings,
  VisualizationSettings,
  defaultVisualizationSettings, // Import defaults
} from "@domain/types/brain/visualization";
// Use relative path for common types
import { SafeArray, Result, VisualizationState } from "../../domain/types/shared/common";

// Neural-safe prop definition with explicit typing
interface BrainModelViewerProps {
  // Core data
  brainModel?: BrainModel;
  visualizationState: VisualizationState<BrainModel>;

  // Visualization settings
  renderMode?: RenderMode;
  theme?: string; // Keep theme prop for potential future use or direct theme selection
  visualizationSettings?: Partial<VisualizationSettings>; // Allow partial overrides
  showLegend?: boolean; // Added showLegend prop

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
  onCameraMove?: (
    position: [number, number, number],
    target: [number, number, number],
  ) => void;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * CameraController - Internal component for camera handling
 */
const CameraController: React.FC<{
  onCameraMove?: (
    position: [number, number, number],
    target: [number, number, number],
  ) => void;
  initialPosition?: [number, number, number];
  initialTarget?: [number, number, number];
}> = ({
  onCameraMove,
  initialPosition = [0, 0, 10],
  initialTarget = [0, 0, 0],
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
      camera.position.z,
    ];

    const target: [number, number, number] = [
      controlsRef.current.target.x,
      controlsRef.current.target.y,
      controlsRef.current.target.z,
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
  themeSettings: ThemeSettings; // Use the actual ThemeSettings type
  visualizationSettings: VisualizationSettings; // Pass merged settings
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
  visualizationSettings, // Receive merged settings
  selectedRegionIds,
  highlightedRegionIds,
  highPerformanceMode,
  activityThreshold,
  showInactiveRegions,
  onRegionClick,
  onRegionHover,
  onConnectionClick,
  onConnectionHover,
}) => {
  const safeRegions = brainModel.regions || [];
  const safeConnections = brainModel.connections || [];

  // Group regions by lobe/functional system for neuroanatomical precision
  const regionGroups = useMemo(() => {
    const groups: Record<string, BrainRegion[]> = {
        frontal: [], parietal: [], temporal: [], occipital: [], subcortical: [], other: []
    };
     safeRegions.forEach((region: BrainRegion) => {
       const [x, y, z] = Array.isArray(region.position)
         ? region.position
         : [region.position.x, region.position.y, region.position.z];
       // Simplified grouping logic - replace with actual neuroanatomical data if available
       if (y > 2) groups.frontal.push(region);
       else if (y < -2) groups.occipital.push(region);
       else if (x > 2) groups.temporal.push(region);
       else if (x < -2) groups.parietal.push(region);
       else if (Math.abs(z) < 2) groups.subcortical.push(region);
       else groups.other.push(region);
     });
     return Object.entries(groups)
       .filter(([_, regions]) => regions.length > 0)
       .map(([name, regions]) => ({
         groupId: `group-${name}`,
         groupName: name.charAt(0).toUpperCase() + name.slice(1),
         regions,
       }));
  }, [brainModel.regions]);

  return (
    <group>
      {/* Render neural connections */}
      <NeuralConnections
        connections={safeConnections}
        regions={safeRegions}
        renderMode={renderMode}
        themeSettings={themeSettings} // Pass theme settings
        // visualizationSettings prop removed
        highPerformanceMode={highPerformanceMode}
        selectedRegionIds={selectedRegionIds}
        highlightedRegionIds={highlightedRegionIds}
        minimumStrength={visualizationSettings.minConnectionStrength} // Use setting
        filterByActivity={renderMode === RenderMode.FUNCTIONAL}
        animated={renderMode !== RenderMode.ANATOMICAL}
        // useDashedLines={themeSettings.useDashedConnections} // Property missing
        // Pass callbacks conditionally
        {...(onConnectionClick && { onConnectionClick })}
        {...(onConnectionHover && { onConnectionHover })}
      />

      {/* Render region groups */}
      {regionGroups.map((group) => (
        <BrainRegionGroup
          key={group.groupId}
          regions={group.regions}
          groupId={group.groupId}
          groupName={group.groupName}
          renderMode={renderMode}
          themeSettings={themeSettings} // Pass theme settings
          // visualizationSettings prop removed
          instancedRendering={!highPerformanceMode && group.regions.length > 20}
          highPerformanceMode={highPerformanceMode}
          selectedRegionIds={selectedRegionIds}
          highlightedRegionIds={highlightedRegionIds}
          activityThreshold={activityThreshold}
          showInactiveRegions={showInactiveRegions}
          showLabels={visualizationSettings.showLabels} // Use setting
          // Pass callbacks conditionally
          {...(onRegionClick && { onRegionClick })}
          {...(onRegionHover && { onRegionHover })}
        />
      ))}

       {/* Add contact shadows for visual depth */}
       {!highPerformanceMode && visualizationSettings.enableShadows && (
         <ContactShadows
           position={[0, -5, 0]} // Make configurable?
           scale={30}
           blur={2}
           opacity={0.4}
           // color={themeSettings.shadowColor} // Property missing
         />
       )}

       {/* Optional environment lighting */}
       {/* {!highPerformanceMode && visualizationSettings.useEnvironmentLighting && ( // Property missing
         <Environment preset="sunset" /> // Example preset
       )} */}

       {/* Performance optimization for shadows */}
       {!highPerformanceMode && visualizationSettings.enableShadows && <BakeShadows />}
    </group>
  );
};

/**
 * BrainModelViewer - Organism component for comprehensive brain visualization
 * Implements neural-safe rendering with clinical precision
 */
const BrainModelViewer: React.FC<BrainModelViewerProps> = ({
  // Destructure all props
  brainModel,
  visualizationState,
  renderMode: renderModeProp, // Rename to avoid conflict with internal variable
  theme, // Keep theme prop
  visualizationSettings: visualizationSettingsProp, // Rename
  showLegend = true, // Default showLegend to true if not provided
  selectedRegionIds = [],
  highlightedRegionIds = [],
  regionSearchQuery,
  enableBloom: enableBloomProp, // Rename
  enableDepthOfField: enableDepthOfFieldProp, // Rename
  highPerformanceMode = false,
  activityThreshold = 0.2,
  showInactiveRegions = true,
  width = "100%",
  height = "100%",
  backgroundColor, // Use theme/settings instead?
  cameraPosition = [0, 0, 20], // Default camera position
  cameraFov = 50,
  onRegionClick,
  onRegionHover,
  onConnectionClick,
  onConnectionHover,
  onCameraMove,
  onLoadComplete,
  onError,
}) => {
  // Get theme settings from context
  const { settings: contextThemeSettings } = React.useContext(ThemeContext);
  const ContextBridge = useContextBridge(ThemeContext);

  // Use theme settings from context
  const themeSettings = contextThemeSettings;

  // Merge incoming visualization settings with defaults and props
  const settings: VisualizationSettings = useMemo(() => {
    const merged = {
      ...defaultVisualizationSettings,
      ...(visualizationSettingsProp || {}), // Apply overrides from visualizationSettings prop
    };

    // Apply overrides from direct props that exist in VisualizationSettings
    if (renderModeProp !== undefined) merged.renderMode = renderModeProp;
    if (enableBloomProp !== undefined) merged.enableBloom = enableBloomProp;
    // enableDepthOfField and highPerformanceMode are direct props, not part of VisualizationSettings type

    return merged;
    // Only include dependencies that affect the merged settings object
  }, [visualizationSettingsProp, renderModeProp, enableBloomProp]);


  // Process search query to highlight matching regions
  const searchHighlightedRegions = useMemo(() => {
    if (!regionSearchQuery || !brainModel) return [];
    const query = regionSearchQuery.toLowerCase();
    return (brainModel.regions || [])
      .filter((region) => region.name.toLowerCase().includes(query))
      .map((region) => region.id);
  }, [regionSearchQuery, brainModel]);

  // Combine explicitly highlighted regions with search results
  const combinedHighlightedRegions = useMemo(() => {
    return [...new Set([...highlightedRegionIds, ...searchHighlightedRegions])];
  }, [highlightedRegionIds, searchHighlightedRegions]);

  // --- State-based Effects ---
  useEffect(() => {
    if (visualizationState.status === "error" && onError) {
      onError(visualizationState.error);
    }
  }, [visualizationState, onError]);

  useEffect(() => {
    if (visualizationState.status === "success" && onLoadComplete) {
      onLoadComplete();
    }
  }, [visualizationState.status, onLoadComplete]);


  // --- Render Functions ---
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

  const renderErrorState = (error: Error) => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
       <div className="text-center max-w-md px-4">
         <div className="text-red-500 mb-2 text-2xl"> {/* Icon placeholder */} </div>
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

   const renderEmptyState = () => (
     <div className="w-full h-full flex items-center justify-center bg-gray-900">
       <div className="text-center max-w-md px-4">
         <h3 className="text-white text-lg font-medium mb-2">No Neural Data Available</h3>
         <p className="text-gray-300 text-sm">Please select a neural model to visualize.</p>
       </div>
     </div>
   );

  const renderVisualization = (model: BrainModel) => (
    <Canvas
      style={{ background: backgroundColor || settings.backgroundColor }} // Use settings bg
      camera={{ position: cameraPosition, fov: cameraFov }}
      dpr={[1, highPerformanceMode ? 1.5 : 2]} // Use direct prop
      gl={{
        antialias: !highPerformanceMode, // Use direct prop
        alpha: true,
        logarithmicDepthBuffer: !highPerformanceMode, // Use direct prop
      }}
    >
      <ContextBridge>
        {/* Lighting - Use settings from merged object */}
        <ambientLight intensity={settings.ambientLightIntensity} />
        <directionalLight
           position={[10, 10, 5]} // Make configurable?
           intensity={settings.directionalLightIntensity}
           // color={settings.directionalLightColor} // Property missing
        />

        {/* Camera controller */}
        <CameraController
          {...(onCameraMove && { onCameraMove })}
          initialPosition={cameraPosition}
        />

        {/* Brain model visualization */}
        <Brain3DScene
          brainModel={model}
          renderMode={settings.renderMode} // Use merged setting
          themeSettings={themeSettings as any} // Re-add 'as any' cast temporarily
          visualizationSettings={settings} // Pass merged settings
          selectedRegionIds={selectedRegionIds}
          highlightedRegionIds={combinedHighlightedRegions}
          highPerformanceMode={highPerformanceMode} // Pass prop directly
          activityThreshold={activityThreshold} // Pass prop directly
          showInactiveRegions={showInactiveRegions} // Pass prop directly
          // Pass callbacks conditionally
          {...(onRegionClick && { onRegionClick })}
          {...(onRegionHover && { onRegionHover })}
          {...(onConnectionClick && { onConnectionClick })}
          {...(onConnectionHover && { onConnectionHover })}
        />

        {/* Post-processing effects - Use settings and direct props */}
        {!highPerformanceMode && (settings.enableBloom || enableDepthOfFieldProp) ? (
          <EffectComposer>
            <> {/* Wrap conditional elements in Fragment */}
              {settings.enableBloom ? (
                <Bloom
                  luminanceThreshold={settings.bloomThreshold}
                  luminanceSmoothing={0.9}
                  intensity={settings.bloomIntensity}
                  kernelSize={KernelSize.LARGE}
                />
              ) : null}
            </>
            <> {/* Wrap conditional elements in Fragment */}
              {enableDepthOfFieldProp ? ( // Use direct prop
                <DepthOfField
                  focusDistance={0} // Example values, make configurable?
                  focalLength={0.02}
                  bokehScale={2}
                />
              ) : null}
            </>
          </EffectComposer>
        ) : null}
      </ContextBridge>
    </Canvas>
  );

  // Handle state-based rendering
  const renderContent = () => {
    switch (visualizationState.status) {
      case "loading":
        return renderLoadingState();
      case "error":
        return renderErrorState(visualizationState.error);
      case "success":
        return renderVisualization(visualizationState.data);
      default:
        return renderEmptyState();
    }
  };


  // Render with appropriate sizing and overlays
  return (
    <div
      style={{
        width: width,
        height: height,
        position: "relative",
        overflow: "hidden",
        borderRadius: "0.5rem", // Example styling
      }}
    >
      {renderContent()}

      {/* Optional UI overlays */}
      {/* Region count display removed */}

      {/* Legend for current render mode */}
      {visualizationState.status === "success" && showLegend && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs p-2 rounded shadow-lg">
            <div className="font-medium mb-1">
              {settings.renderMode === RenderMode.ANATOMICAL && "Anatomical View"}
              {settings.renderMode === RenderMode.FUNCTIONAL && "Functional View"}
              {settings.renderMode === RenderMode.CONNECTIVITY && "Connectivity View"}
              {/* Add other render modes as needed */}
            </div>
            {settings.renderMode === RenderMode.FUNCTIONAL && (
              <div className="flex space-x-2 mt-1">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-1"
                    style={{
                      backgroundColor: settings.activityColorScale?.[4] || '#E74C3C', // Safe access
                    }}
                  ></div>
                  <span>High</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-1"
                    style={{
                      backgroundColor: settings.activityColorScale?.[2] || '#F1C40F', // Safe access
                    }}
                  ></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-1"
                    style={{
                      backgroundColor: settings.activityColorScale?.[0] || '#3498DB', // Safe access
                    }}
                  ></div>
                  <span>Low</span>
                </div>
              </div>
            )}
            {/* Add legend content for other render modes if necessary */}
          </div>
        )}
    </div>
  );
};

export default React.memo(BrainModelViewer);

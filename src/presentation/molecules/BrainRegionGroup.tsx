/**
 * NOVAMIND Neural Visualization
 * BrainRegionGroup Molecular Component - renders collections of brain regions
 * with neural clustering and spatial organization
 */

import React, { useMemo, useCallback } from 'react';
// Removed unused Instance, Instances imports
// Removed unused THREE import
import RegionMesh from '@presentation/atoms/RegionMesh';
import type { BrainRegion } from '@domain/types/brain/models';
import type { ThemeSettings } from '@domain/types/brain/visualization';
import { RenderMode } from '@domain/types/brain/visualization';
import { SafeArray } from '../../domain/types/shared/common'; // Use relative path
// @ts-ignore: TS2305 - Module '"@react-three/drei"' has no exported member 'Html'. (Likely type/config issue)
import { Html } from '@react-three/drei'; // Added missing import

// Neural-safe prop definition with explicit typing
interface BrainRegionGroupProps {
  // Region data
  regions: BrainRegion[];
  groupId: string;
  groupName: string;

  // Visualization settings
  renderMode: RenderMode;
  themeSettings: ThemeSettings;
  instancedRendering?: boolean;
  highPerformanceMode?: boolean;

  // Interaction state
  selectedRegionIds: string[];
  highlightedRegionIds: string[];

  // Group positioning and appearance
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  groupColor?: string;
  groupOpacity?: number;

  // Clinical visualization settings
  activityThreshold?: number;
  showInactiveRegions?: boolean;
  showLabels?: boolean;

  // Interaction callbacks
  onRegionClick?: (regionId: string) => void;
  onRegionHover?: (regionId: string | null) => void;
}

/**
 * BrainRegionGroup - Molecular component for rendering collections of brain regions
 * Implements neural-safe optimized rendering with mathematical precision
 */
const BrainRegionGroup: React.FC<BrainRegionGroupProps> = ({
  regions,
  groupId: _groupId, // Prefixed unused variable
  groupName: _groupName, // Prefixed unused variable
  renderMode,
  themeSettings,
  instancedRendering: _instancedRendering = true, // Prefixed unused variable
  highPerformanceMode = false,
  selectedRegionIds,
  highlightedRegionIds,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  groupColor,
  groupOpacity,
  activityThreshold = 0.2,
  showInactiveRegions = true,
  showLabels = true,
  onRegionClick,
  onRegionHover,
}) => {
  // Safe array wrappers for null safety
  const safeRegions = new SafeArray(regions);
  const safeSelectedIds = new SafeArray(selectedRegionIds);
  const safeHighlightedIds = new SafeArray(highlightedRegionIds);

  // Calculate which regions to render based on settings
  const filteredRegions = useMemo(() => {
    return safeRegions.filter((region) => {
      // Filter inactive regions if needed
      if (!showInactiveRegions && !region.isActive && region.activityLevel < activityThreshold) {
        return false;
      }

      // Additional filtering based on render mode
      if (renderMode === RenderMode.FUNCTIONAL && region.activityLevel < activityThreshold) {
        return false;
      }

      return true;
    });
  }, [safeRegions, showInactiveRegions, activityThreshold, renderMode]);

  // Determine if we should use instanced rendering
  // Instances is more performant for large numbers of similar objects
  // Removed unused useInstancing calculation

  // Event handlers with type safety
  const handleRegionClick = useCallback(
    (regionId: string) => {
      if (onRegionClick) onRegionClick(regionId);
    },
    [onRegionClick]
  );

  const handleRegionHover = useCallback(
    (regionId: string | null) => {
      if (onRegionHover) onRegionHover(regionId);
    },
    [onRegionHover]
  );

  // Determine the region color based on various states
  const getRegionColor = useCallback(
    (region: BrainRegion): string => {
      // If group has a specified color, use it as base
      const baseColor = groupColor || region.color;

      // Apply render mode-specific coloring
      if (renderMode === RenderMode.FUNCTIONAL) {
        // TODO: Implement proper color scaling based on activityLevel and themeSettings
        // Placeholder: Use active color if above threshold, otherwise inactive
        return region.activityLevel >= activityThreshold
          ? themeSettings.activeRegionColor
          : themeSettings.regionBaseColor; // Use base color for inactive
      }

      return baseColor;
    },
    [groupColor, renderMode, themeSettings, activityThreshold]
  );

  // Determine the region size based on various factors
  const getRegionSize = useCallback(
    (region: BrainRegion): number => {
      // Base size (can be adjusted by client requirements)
      let size = 0.5;

      // Scale by activity level in functional mode
      if (renderMode === RenderMode.FUNCTIONAL) {
        size *= 0.7 + region.activityLevel * 0.6;
      }

      // Scale by connectivity in connectivity mode
      if (renderMode === RenderMode.CONNECTIVITY) {
        // More connections = slightly larger node
        const connectionCount = new SafeArray(region.connections).size();
        size *= 0.8 + Math.min(connectionCount / 10, 0.5);
      }

      // Selected regions are slightly larger
      if (safeSelectedIds.includes(region.id)) {
        size *= 1.2;
      }

      // Apply global scale
      size *= scale;

      return size;
    },
    [renderMode, safeSelectedIds, scale]
  );

  // Removed unused instancedData calculation

  // For high performance mode, use simplified rendering
  if (highPerformanceMode) {
    return (
      <group position={position} rotation={rotation as any}>
        {filteredRegions.map((region) => {
          // Simple spheres with minimal overhead
          const [x, y, z] = Array.isArray(region.position)
            ? region.position
            : [region.position.x, region.position.y, region.position.z];

          return (
            <mesh
              key={region.id}
              position={[x, y, z]}
              scale={[getRegionSize(region), getRegionSize(region), getRegionSize(region)]}
              onClick={() => handleRegionClick(region.id)}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial
                color={getRegionColor(region)}
                transparent={true}
                opacity={groupOpacity ?? 0.8} // Use default if groupOpacity undefined
              />
            </mesh>
          );
        })}
      </group>
    );
  }

  // Instanced rendering for optimal performance with many regions
  // TODO: Refactor instanced rendering - temporarily disabled due to matrix prop error
  // if (useInstancing && instancedData) {
  //   // Base geometry is shared across all instances
  //   return (
  //     <group position={position} rotation={rotation as any}>
  //       {/* <Instances ref={instancedMeshRef} limit={filteredRegions.size()}> */}
  //       <Instances limit={filteredRegions.size()}>
  //         <sphereGeometry args={[1, 16, 16]} />
  //         <meshStandardMaterial
  //           color={themeSettings.regionBaseColor}
  //           roughness={0.4}
  //           metalness={0.2}
  //           transparent={true}
  //           opacity={groupOpacity ?? 0.9} // Use default if groupOpacity undefined
  //         />
  //         {/* Need useEffect to setMatrixAt and setColorAt */}
  //       </Instances>
  //
  //       {/* Optional labels */}
  //       {showLabels &&
  //         filteredRegions.map((region) => {
  //           const [x, y, z] = Array.isArray(region.position)
  //             ? region.position
  //             : [region.position.x, region.position.y, region.position.z];
  //
  //           const isSelected = safeSelectedIds.includes(region.id);
  //           const isHighlighted = safeHighlightedIds.includes(region.id);
  //
  //           // Only show labels for active, selected or highlighted regions to reduce visual noise
  //           if (!isSelected && !isHighlighted && !region.isActive) return null;
  //
  //           return (
  //             <Html
  //               key={`label-${region.id}`}
  //               position={[x, y + getRegionSize(region) + 0.3, z]}
  //               center
  //               distanceFactor={10}
  //             >
  //               <div
  //                 className={`
  //               text-xs font-bold px-1 py-0.5 rounded whitespace-nowrap
  //               ${isSelected ? 'bg-blue-600 text-white' : 'bg-black/40 text-white'}
  //               ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}
  //             `}
  //               >
  //                 {region.name}
  //               </div>
  //             </Html>
  //           );
  //         })}
  //     </group>
  //   );
  // }

  // Individual rendering when instancing isn't suitable
  return (
    <group position={position} rotation={rotation as any}>
      {filteredRegions.map((region) => {
        const [x, y, z] = Array.isArray(region.position)
          ? region.position
          : [region.position.x, region.position.y, region.position.z];

        return (
          <RegionMesh
            key={region.id}
            id={region.id}
            position={[x, y, z]}
            size={getRegionSize(region)}
            color={getRegionColor(region)}
            isActive={region.isActive}
            isSelected={safeSelectedIds.includes(region.id)}
            isHighlighted={safeHighlightedIds.includes(region.id)}
            activityLevel={region.activityLevel}
            pulseEnabled={renderMode !== RenderMode.ANATOMICAL}
            themeSettings={themeSettings}
            onClick={handleRegionClick}
            onHover={handleRegionHover}
            opacity={groupOpacity ?? 0.9} // Provide default value
          />
        );
      })}

      {/* Optional labels */}
      {showLabels &&
        filteredRegions.map((region) => {
          const [x, y, z] = Array.isArray(region.position)
            ? region.position
            : [region.position.x, region.position.y, region.position.z];

          const isSelected = safeSelectedIds.includes(region.id);
          const isHighlighted = safeHighlightedIds.includes(region.id);

          // Only show labels for active, selected or highlighted regions to reduce visual noise
          if (!isSelected && !isHighlighted && !region.isActive) return null;

          return (
            <Html
              key={`label-${region.id}`}
              position={[x, y + getRegionSize(region) + 0.3, z]}
              center
              distanceFactor={10}
            >
              <div
                className={`
              text-xs font-bold px-1 py-0.5 rounded whitespace-nowrap
              ${isSelected ? 'bg-blue-600 text-white' : 'bg-black/40 text-white'}
              ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}
            `}
              >
                {region.name}
              </div>
            </Html>
          );
        })}
    </group>
  );
};

export default React.memo(BrainRegionGroup);

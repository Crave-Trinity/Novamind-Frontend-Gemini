/**
 * NOVAMIND Neural Visualization
 * BrainRegionLabels Molecular Component - clinical region annotation with quantum precision
 */

import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import { BrainRegion } from "@domain/types/brain/models";
import { ThemeSettings } from "@domain/types/brain/visualization";
import { SafeArray, Vector3 } from "@domain/types/common";

// Neural-safe prop definition with explicit typing
interface BrainRegionLabelsProps {
  // Region data
  regions: BrainRegion[];

  // Filtering and selection
  selectedRegionIds: string[];
  highlightedRegionIds: string[];
  activeRegionsOnly?: boolean;

  // Display options
  showAllLabels?: boolean;
  labelScale?: number;
  distanceFactor?: number;
  maxLabels?: number;

  // Clinical data integration
  symptomMapping?: Record<string, string[]>;
  diagnosisMapping?: Record<string, string[]>;

  // Theme settings
  themeSettings: ThemeSettings;

  // Interaction callbacks
  onLabelClick?: (regionId: string) => void;
}

/**
 * BrainRegionLabels - Molecular component for rendering clinical region labels
 * Implements neural-safe optimized rendering with clinical precision
 */
const BrainRegionLabels: React.FC<BrainRegionLabelsProps> = ({
  regions,
  selectedRegionIds,
  highlightedRegionIds,
  activeRegionsOnly = false,
  showAllLabels = false,
  labelScale = 1,
  distanceFactor = 8,
  maxLabels = 30,
  symptomMapping = {},
  diagnosisMapping = {},
  themeSettings,
  onLabelClick,
}) => {
  // Safe array wrappers for null safety
  const safeRegions = new SafeArray(regions);
  const safeSelectedIds = new SafeArray(selectedRegionIds);
  const safeHighlightedIds = new SafeArray(highlightedRegionIds);

  // Filter and sort regions for label display
  const regionsToLabel = useMemo(() => {
    let filtered = safeRegions;

    // Filter active regions if requested
    if (activeRegionsOnly) {
      filtered = filtered.filter((r) => r.isActive || r.activityLevel > 0.3);
    }

    // Always show selected and highlighted regions
    const priorityIds = new Set([
      ...safeSelectedIds.toArray(),
      ...safeHighlightedIds.toArray(),
    ]);

    // Sort by importance (selected > highlighted > active > others)
    const sorted = filtered.sort((a, b) => {
      // First priority: selected regions
      if (safeSelectedIds.includes(a.id) && !safeSelectedIds.includes(b.id))
        return -1;
      if (!safeSelectedIds.includes(a.id) && safeSelectedIds.includes(b.id))
        return 1;

      // Second priority: highlighted regions
      if (
        safeHighlightedIds.includes(a.id) &&
        !safeHighlightedIds.includes(b.id)
      )
        return -1;
      if (
        !safeHighlightedIds.includes(a.id) &&
        safeHighlightedIds.includes(b.id)
      )
        return 1;

      // Third priority: activity level
      return b.activityLevel - a.activityLevel;
    });

    // If not showing all labels, limit to max labels, but always include priority regions
    if (!showAllLabels) {
      const priorityRegions = sorted.filter((r) => priorityIds.has(r.id));
      const otherRegions = sorted
        .filter((r) => !priorityIds.has(r.id))
        .slice(0, maxLabels - priorityRegions.size());
      return [...priorityRegions.toArray(), ...otherRegions];
    }

    return sorted.toArray();
  }, [
    safeRegions,
    safeSelectedIds,
    safeHighlightedIds,
    activeRegionsOnly,
    showAllLabels,
    maxLabels,
  ]);

  // Get clinical indicators for a region (symptoms and diagnoses)
  const getClinicalIndicators = (region: BrainRegion) => {
    const symptoms = symptomMapping[region.id] || [];
    const diagnoses = diagnosisMapping[region.id] || [];

    return {
      hasSymptoms: symptoms.length > 0,
      hasDiagnoses: diagnoses.length > 0,
      symptomCount: symptoms.length,
      diagnosisCount: diagnoses.length,
      indicators: [...symptoms, ...diagnoses].slice(0, 2), // Show max 2 indicators
    };
  };

  // Handle label click with type safety
  const handleLabelClick = (regionId: string) => {
    if (onLabelClick) onLabelClick(regionId);
  };

  return (
    <>
      {regionsToLabel.map((region) => {
        // Get position with type safety
        const position = Array.isArray(region.position)
          ? region.position
          : [region.position.x, region.position.y, region.position.z];

        // Determine visual state
        const isSelected = safeSelectedIds.includes(region.id);
        const isHighlighted = safeHighlightedIds.includes(region.id);

        // Get clinical indicators
        const clinical = getClinicalIndicators(region);

        // Calculate y-offset based on region size + activity
        const yOffset = 0.5 + region.activityLevel * 0.3;

        return (
          <Html
            key={`label-${region.id}`}
            position={[position[0], position[1] + yOffset, position[2]]}
            center
            distanceFactor={distanceFactor}
            transform
            sprite
            scale={[labelScale, labelScale, labelScale]}
            calculatePosition={(el, cam, size) => {
              // Add occlusion handling to prevent label overlap
              // This is a simplified implementation - a real one would do proper 3D occlusion testing
              // Here we're just adjusting based on camera distance
              const distance = Math.sqrt(
                Math.pow(cam.position.x - position[0], 2) +
                  Math.pow(cam.position.y - position[1], 2) +
                  Math.pow(cam.position.z - position[2], 2),
              );

              // Scale based on distance
              const scale =
                Math.max(0.6, Math.min(1, 10 / distance)) * labelScale;
              el.style.transform = `translate(-50%, -50%) scale(${scale})`;
              return true;
            }}
            // Make labels non-visible to raycaster so they don't interfere with region selection
            occlude={false}
          >
            <div
              className={`
                whitespace-nowrap leading-tight pointer-events-auto cursor-pointer
                px-1.5 py-0.5 rounded text-xs backdrop-blur-sm transition-all duration-200
                ${
                  isSelected
                    ? "bg-blue-600 text-white font-bold shadow-lg scale-105"
                    : isHighlighted
                      ? "bg-yellow-500/80 text-white font-medium shadow-md scale-100"
                      : "bg-black/50 text-white/90 font-normal shadow hover:bg-black/70 scale-95"
                }
                ${region.isActive ? "ring-1 ring-white/30" : ""}
              `}
              style={{
                fontSize: `${0.8 * labelScale}rem`,
                transform: `scale(${0.8 + region.activityLevel * 0.4})`,
                minWidth: "12px",
              }}
              onClick={() => handleLabelClick(region.id)}
            >
              {region.name}

              {/* Show clinical indicators if available */}
              {(clinical.hasSymptoms || clinical.hasDiagnoses) && (
                <div
                  className={`
                  mt-0.5 flex items-center justify-center gap-1 text-2xs font-normal
                  ${isSelected ? "text-blue-100" : "text-white/80"}
                `}
                >
                  {clinical.hasSymptoms && (
                    <span className="flex items-center">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-0.5"></span>
                      <span>{clinical.symptomCount}</span>
                    </span>
                  )}

                  {clinical.hasDiagnoses && (
                    <span className="flex items-center">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 mr-0.5"></span>
                      <span>{clinical.diagnosisCount}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Optional tooltip for detailed indicators */}
              {clinical.indicators.length > 0 &&
                (isSelected || isHighlighted) && (
                  <div
                    className={`
                  absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full
                  bg-black/80 text-white px-2 py-1 rounded text-2xs w-max max-w-[12rem] z-10
                `}
                  >
                    {clinical.indicators.map((indicator, i) => (
                      <div key={i} className="whitespace-normal">
                        • {indicator}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </Html>
        );
      })}
    </>
  );
};

export default React.memo(BrainRegionLabels);

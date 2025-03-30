import {
  BrainData,
  BrainRegion,
  NeuralConnection,
  ThemeSettings,
} from "../types/brain";

/**
 * Transforms raw brain data for optimal visualization rendering
 * This follows the precomputation pattern to avoid expensive calculations during render
 */
export function transformBrainData(data: BrainData): BrainData {
  // Create a deep copy to avoid mutating the original data
  const processed: BrainData = {
    regions: [...data.regions],
    connections: [...data.connections],
    metadata: data.metadata ? { ...data.metadata } : undefined,
  };

  // Process regions if needed (e.g., normalize positions, scales)
  processed.regions = processed.regions.map((region) => {
    // Ensure region has all required properties
    return {
      ...region,
      // Apply any necessary transformations to position or scale
      position: normalizePosition(region.position),
      // Ensure region has metrics
      metrics: region.metrics || {
        activity: 0,
        connectivity: 0,
        volume: 0,
      },
    };
  });

  // Process connections (e.g., calculate curved paths, strength indicators)
  processed.connections = processed.connections.map((connection) => {
    return {
      ...connection,
      // Additional computed properties could be added here
    };
  });

  return processed;
}

/**
 * Normalize a position to fit within visualization bounds
 */
function normalizePosition(
  position: [number, number, number],
): [number, number, number] {
  // Example normalization logic - adjust based on actual requirements
  const MAX_BOUND = 10;
  return position.map((coord) =>
    Math.max(-MAX_BOUND, Math.min(MAX_BOUND, coord)),
  ) as [number, number, number];
}

/**
 * Filter active regions
 */
export function getActiveRegions(
  data: BrainData,
  activeIds?: string[],
): BrainRegion[] {
  if (!activeIds || activeIds.length === 0) {
    return data.regions.filter((region) => region.isActive);
  }
  return data.regions.filter((region) => activeIds.includes(region.id));
}

/**
 * Get connections between active regions
 */
export function getActiveConnections(
  data: BrainData,
  activeRegionIds: string[],
): NeuralConnection[] {
  return data.connections.filter(
    (conn) =>
      activeRegionIds.includes(conn.sourceId) &&
      activeRegionIds.includes(conn.targetId),
  );
}

/**
 * Generate position mapping for connections
 */
export function generateConnectionPositionMap(
  data: BrainData,
): Record<string, [number, number, number]> {
  const positionMap: Record<string, [number, number, number]> = {};

  data.regions.forEach((region) => {
    positionMap[region.id] = region.position;
  });

  return positionMap;
}

/**
 * Apply visual settings based on mode
 */
export function applyVisualizationMode(
  regions: BrainRegion[],
  mode: "anatomical" | "functional" | "activity",
  themeSettings: ThemeSettings,
): BrainRegion[] {
  return regions.map((region) => {
    let color: string;

    if (region.isActive) {
      switch (mode) {
        case "anatomical":
          color = region.type === "cortical" ? "#ff6b6b" : "#4dabf7";
          break;
        case "functional":
          color = themeSettings.activeRegionColor;
          break;
        case "activity":
          // Gradient color based on activity level
          const activityLevel = region.metrics?.activity || 0;
          if (activityLevel > 0.7) {
            color = "#fa5252"; // High activity
          } else if (activityLevel > 0.4) {
            color = "#ff922b"; // Medium activity
          } else {
            color = "#74b816"; // Low activity
          }
          break;
        default:
          color = themeSettings.activeRegionColor;
      }
    } else {
      color = themeSettings.inactiveRegionColor;
    }

    return {
      ...region,
      color,
    };
  });
}

/**
 * Generate mock brain data for testing/development
 */
export function generateMockBrainData(): BrainData {
  const regions: BrainRegion[] = [
    {
      id: "pfc",
      name: "Prefrontal Cortex",
      position: [0, 5, 0],
      scale: 2.5,
      isActive: true,
      type: "cortical",
      metrics: { activity: 0.8, connectivity: 0.7, volume: 1.0 },
    },
    {
      id: "amyg",
      name: "Amygdala",
      position: [-3, 0, 1],
      scale: 1.2,
      isActive: false,
      type: "subcortical",
      metrics: { activity: 0.6, connectivity: 0.9, volume: 0.7 },
    },
    {
      id: "hipp",
      name: "Hippocampus",
      position: [-2, -2, 2],
      scale: 1.5,
      isActive: true,
      type: "subcortical",
      metrics: { activity: 0.5, connectivity: 0.8, volume: 0.8 },
    },
    {
      id: "thal",
      name: "Thalamus",
      position: [0, 1, -1],
      scale: 1.8,
      isActive: false,
      type: "subcortical",
      metrics: { activity: 0.7, connectivity: 0.6, volume: 0.9 },
    },
    {
      id: "cere",
      name: "Cerebellum",
      position: [0, -6, 0],
      scale: 2.2,
      isActive: true,
      type: "cerebellum",
      metrics: { activity: 0.6, connectivity: 0.5, volume: 1.0 },
    },
  ];

  const connections: NeuralConnection[] = [
    {
      id: "pfc-hipp",
      sourceId: "pfc",
      targetId: "hipp",
      strength: 0.8,
      type: "excitatory",
      active: true,
    },
    {
      id: "pfc-amyg",
      sourceId: "pfc",
      targetId: "amyg",
      strength: 0.6,
      type: "inhibitory",
      active: false,
    },
    {
      id: "amyg-hipp",
      sourceId: "amyg",
      targetId: "hipp",
      strength: 0.9,
      type: "excitatory",
      active: true,
    },
    {
      id: "thal-cere",
      sourceId: "thal",
      targetId: "cere",
      strength: 0.7,
      type: "excitatory",
      active: false,
    },
  ];

  return {
    regions,
    connections,
    metadata: {
      patientId: "DEMO-123",
      scanDate: "2025-03-29",
      scanType: "fMRI",
    },
  };
}

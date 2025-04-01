// Corrected import paths based on domain structure
import {
  BrainRegion,
  NeuralConnection,
  BrainModel,
  BrainScan,
  isBrainRegion,
  isNeuralConnection,
  isBrainModel
} from "@domain/types/brain/models";
import { Vector3 } from "@domain/types/shared/common"; // Correct: Import Vector3 from common.ts
import { ThemeSettings, RenderMode, isValidRenderMode } from "@domain/types/brain/visualization";
import {
    validateBrainModelData,
    validateBrainRegionArray,
    validateRenderMode,
    validateThemeSettings
} from "./brainDataTransformer.runtime"; // Import validators
import { Result, Ok, Err } from 'ts-results';

// Use BrainModel directly
type BrainData = BrainModel;

/**
 * Transforms raw brain data for optimal visualization rendering
 */
export function transformBrainData(data: unknown): Result<BrainData, Error> {
  const validationResult = validateBrainModelData(data);
  if (validationResult.err) {
      console.error("Invalid data passed to transformBrainData:", validationResult.val.message);
      return validationResult;
  }
  const validatedData = validationResult.val;

  const processed: BrainData = {
    ...validatedData,
    regions: [...validatedData.regions],
    connections: [...validatedData.connections],
  };

  processed.regions = processed.regions.map((region) => {
    if (!isBrainRegion(region)) {
        console.warn("Skipping invalid region structure during transformation map:", region);
        return region;
    }
    return {
      ...region,
      position: normalizePosition(region.position),
      activityLevel: region.activityLevel ?? 0,
      isActive: region.isActive ?? false,
    };
  });

  processed.connections = processed.connections.map((connection) => {
     if (!isNeuralConnection(connection)) {
         console.warn("Skipping invalid connection structure during transformation map:", connection);
         return connection;
     }
    return {
      ...connection,
    };
  });

  return Ok(processed);
}

/**
 * Normalize a position Vector3 to fit within visualization bounds
 */
function normalizePosition(position: Vector3): Vector3 {
  const MAX_BOUND = 10;
  if (typeof position !== 'object' || position === null || typeof position.x !== 'number' || typeof position.y !== 'number' || typeof position.z !== 'number') {
       console.warn("Invalid position format for normalization:", position);
       return { x: 0, y: 0, z: 0 };
  }
  return {
      x: Math.max(-MAX_BOUND, Math.min(MAX_BOUND, position.x)),
      y: Math.max(-MAX_BOUND, Math.min(MAX_BOUND, position.y)),
      z: Math.max(-MAX_BOUND, Math.min(MAX_BOUND, position.z)),
  };
}

/**
 * Filter active regions
 */
export function getActiveRegions(
  data: unknown,
  activeIds?: unknown,
): Result<BrainRegion[], Error> {
   const dataValidationResult = validateBrainModelData(data);
   if (dataValidationResult.err) {
       console.error("Invalid data passed to getActiveRegions:", dataValidationResult.val.message);
       return Err(dataValidationResult.val);
   }
   const validatedData = dataValidationResult.val;

   if (activeIds !== undefined && (!Array.isArray(activeIds) || !activeIds.every(id => typeof id === 'string'))) {
       return Err(new Error("Invalid activeIds: Must be an array of strings or undefined."));
   }
   const validatedActiveIds = activeIds as string[] | undefined;

  if (!validatedActiveIds || validatedActiveIds.length === 0) {
    const filtered = validatedData.regions.filter((region) => region.isActive === true);
    return Ok(filtered);
  }
  const filteredByIds = validatedData.regions.filter((region) => validatedActiveIds.includes(region.id));
  return Ok(filteredByIds);
}

/**
 * Get connections between active regions
 */
export function getActiveConnections(
  data: unknown,
  activeRegionIds: unknown,
): Result<NeuralConnection[], Error> {
    const dataValidationResult = validateBrainModelData(data);
   if (dataValidationResult.err) {
       console.error("Invalid data passed to getActiveConnections:", dataValidationResult.val.message);
       return Err(dataValidationResult.val);
   }
   const validatedData = dataValidationResult.val;

   if (!Array.isArray(activeRegionIds) || !activeRegionIds.every(id => typeof id === 'string')) {
       return Err(new Error("Invalid activeRegionIds: Must be an array of strings."));
   }
   const validatedActiveRegionIds = activeRegionIds as string[];

  const filtered = validatedData.connections.filter(
    (conn) =>
      validatedActiveRegionIds.includes(conn.sourceId) &&
      validatedActiveRegionIds.includes(conn.targetId),
  );
  return Ok(filtered);
}

/**
 * Generate position mapping for connections
 */
export function generateConnectionPositionMap(
  data: unknown,
): Result<Record<string, Vector3>, Error> {
   const validationResult = validateBrainModelData(data);
   if (validationResult.err) {
       console.error("Invalid data passed to generateConnectionPositionMap:", validationResult.val.message);
       return Err(validationResult.val);
   }
   const validatedData = validationResult.val;

  const positionMap: Record<string, Vector3> = {};
  validatedData.regions.forEach((region) => {
    if (region.position && typeof region.position === 'object' && 'x' in region.position && 'y' in region.position && 'z' in region.position) {
        positionMap[region.id] = region.position;
    }
  });

  return Ok(positionMap);
}

/**
 * Apply visual settings based on mode
 */
export function applyVisualizationMode(
  regions: unknown,
  mode: unknown,
  themeSettings: unknown,
): Result<BrainRegion[], Error> {
    const regionsValidation = validateBrainRegionArray(regions);
    if (regionsValidation.err) return Err(regionsValidation.val);

    const modeValidation = validateRenderMode(mode);
    if (modeValidation.err) return Err(modeValidation.val);

    const themeValidation = validateThemeSettings(themeSettings);
    if (themeValidation.err) return Err(themeValidation.val);

    const validatedRegions = regionsValidation.val;
    const validatedMode = modeValidation.val;
    const validatedTheme = themeValidation.val;

  const processedRegions = validatedRegions.map((region) => {
    let color: string;

    if (region.isActive) {
      switch (validatedMode) {
        case RenderMode.ANATOMICAL:
          color = region.tissueType === "gray" ? "#ff6b6b" : "#4dabf7";
          break;
        case RenderMode.FUNCTIONAL:
          color = validatedTheme.activeRegionColor;
          break;
        case RenderMode.CONNECTIVITY:
             color = (region.connections?.length ?? 0) > 5 ? validatedTheme.accentColor : validatedTheme.activeRegionColor;
             break;
        case RenderMode.RISK:
             color = validatedTheme.activeRegionColor; // Placeholder
             break;
         case RenderMode.TREATMENT_RESPONSE:
             color = validatedTheme.activeRegionColor; // Placeholder
             break;
         case RenderMode.NEUROTRANSMITTER:
             color = validatedTheme.activeRegionColor; // Placeholder
             break;
         case RenderMode.TEMPORAL_DYNAMICS:
             color = validatedTheme.activeRegionColor; // Placeholder
             break;
         case RenderMode.NETWORK_ANALYSIS:
             color = validatedTheme.activeRegionColor; // Placeholder
             break;
        default:
          color = validatedTheme.activeRegionColor;
      }
    } else {
      color = validatedTheme.regionBaseColor;
    }

    const updatedRegion: Omit<BrainRegion, 'color'> & { color: string } = {
         ...region,
         color: color,
    };
    return updatedRegion as BrainRegion;
  });
  return Ok(processedRegions);
}

/**
 * Generate mock brain data for testing/development
 */
export function generateMockBrainData(): BrainModel {
  const regions: BrainRegion[] = [
    {
      id: "pfc", name: "Prefrontal Cortex", position: {x: 0, y: 5, z: 0}, color: "#4dabf7",
      connections: ["pfc-hipp", "pfc-amyg"], activityLevel: 0.8, isActive: true,
      hemisphereLocation: "central", tissueType: "gray", dataConfidence: 0.9
    },
    {
      id: "amyg", name: "Amygdala", position: {x: -3, y: 0, z: 1}, color: "#95A5A6",
      connections: ["pfc-amyg", "amyg-hipp"], activityLevel: 0.6, isActive: false,
      hemisphereLocation: "left", tissueType: "gray", dataConfidence: 0.85
    },
    {
      id: "hipp", name: "Hippocampus", position: {x: -2, y: -2, z: 2}, color: "#E74C3C",
      connections: ["pfc-hipp", "amyg-hipp"], activityLevel: 0.5, isActive: true,
      hemisphereLocation: "left", tissueType: "gray", dataConfidence: 0.88
    },
    {
      id: "thal", name: "Thalamus", position: {x: 0, y: 1, z: -1}, color: "#95A5A6",
      connections: ["thal-cere"], activityLevel: 0.7, isActive: false,
      hemisphereLocation: "central", tissueType: "white", dataConfidence: 0.92
    },
    {
      id: "cere", name: "Cerebellum", position: {x: 0, y: -6, z: 0}, color: "#74b816",
      connections: ["thal-cere"], activityLevel: 0.6, isActive: true,
      hemisphereLocation: "central", tissueType: "gray", dataConfidence: 0.95
    },
  ];

  const connections: NeuralConnection[] = [
    {
      id: "pfc-hipp", sourceId: "pfc", targetId: "hipp", strength: 0.8,
      type: "functional", directionality: "bidirectional", activityLevel: 0.7, dataConfidence: 0.8
    },
    {
      id: "pfc-amyg", sourceId: "pfc", targetId: "amyg", strength: 0.6,
      type: "structural", directionality: "unidirectional", activityLevel: 0.3, dataConfidence: 0.9
    },
    {
      id: "amyg-hipp", sourceId: "amyg", targetId: "hipp", strength: 0.9,
      type: "functional", directionality: "bidirectional", activityLevel: 0.8, dataConfidence: 0.85
    },
    {
      id: "thal-cere", sourceId: "thal", targetId: "cere", strength: 0.7,
      type: "structural", directionality: "unidirectional", activityLevel: 0.5, dataConfidence: 0.9
    },
  ];

  const scan: BrainScan = {
      id: "scan-001",
      patientId: "DEMO-123",
      scanDate: "2025-03-29T10:00:00Z",
      scanType: "fMRI",
      dataQualityScore: 0.95
  };

  return {
    id: "model-demo-001",
    patientId: "DEMO-123",
    regions,
    connections,
    scan,
    timestamp: new Date().toISOString(),
    version: "1.0",
    processingLevel: "analyzed",
    lastUpdated: new Date().toISOString(),
  };
}

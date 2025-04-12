/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Common Component
 * AdaptiveLOD - Quantum-level adaptive detail management
 * with performance-optimized neural rendering
 */

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from 'react'; // Added createContext, useContext
// R3F imports fully removed

// Performance thresholds (Keep for now, logic removed)
const FPS_THRESHOLD_HIGH = 55; // Maintain high detail above this FPS
const FPS_THRESHOLD_MEDIUM = 35; // Maintain medium detail above this FPS
const FPS_RECOVERY_DELAY = 2000; // Wait time before increasing detail

/**
 * Detail level enumeration with neural-safe typing
 */
// Use the type directly from VisualizationSettings for consistency
import type { VisualizationSettings } from '@domain/types/brain/visualization';
export type DetailLevelString = VisualizationSettings['levelOfDetail']; // "low" | "medium" | "high" | "dynamic"

/**
 * Detail configuration with neural-safe typing
 */
export interface DetailConfig {
  level: DetailLevelString;
  segmentDetail: number; // Geometry segment count
  maxVisibleRegions: number; // Maximum visible regions
  useInstancedMesh: boolean; // Use instancing for regions
  useShaderEffects: boolean; // Use advanced shader effects
  usePostProcessing: boolean; // Enable post-processing
  useShadows: boolean; // Enable shadows
  useBloom: boolean; // Enable bloom effect
  useReflections: boolean; // Enable reflections
  textureDimension: number; // Texture resolution
  lodTransitionTime: number; // Time to transition between LODs
  drawDistance: number; // Draw distance for regions
  connectionsVisible: number; // Number of visible connections
  showLabels: boolean; // Show region labels
  labelDensity: number; // Density of labels (0-1)
  physicsFidelity: number; // Physics simulation fidelity (0-1)
  minConnectionStrength?: number; // Added missing property
}

/**
 * Default LOD configurations
 */
// Use string literal type for keys and level property, remove ultra/minimal
const defaultDetailConfigs: Record<DetailLevelString, DetailConfig> = {
  // Removed "ultra" config
  high: {
    level: 'high',
    segmentDetail: 64,
    maxVisibleRegions: Infinity,
    useInstancedMesh: true,
    useShaderEffects: true,
    usePostProcessing: true,
    useShadows: true,
    useBloom: true,
    useReflections: true,
    textureDimension: 2048,
    lodTransitionTime: 1000,
    drawDistance: 100,
    connectionsVisible: Infinity,
    showLabels: true,
    labelDensity: 1.0,
    physicsFidelity: 1.0,
    minConnectionStrength: 0.2, // Added default value
  },
  medium: {
    level: 'medium',
    segmentDetail: 32,
    maxVisibleRegions: 1000,
    useInstancedMesh: true,
    useShaderEffects: true,
    usePostProcessing: true,
    useShadows: true,
    useBloom: true,
    useReflections: false,
    textureDimension: 1024,
    lodTransitionTime: 800,
    drawDistance: 75,
    connectionsVisible: 500,
    showLabels: true,
    labelDensity: 0.8,
    physicsFidelity: 0.8,
    minConnectionStrength: 0.3, // Added default value
  },
  low: {
    level: 'low',
    segmentDetail: 24,
    maxVisibleRegions: 500,
    useInstancedMesh: true,
    useShaderEffects: true,
    usePostProcessing: false,
    useShadows: false,
    useBloom: false,
    useReflections: false,
    textureDimension: 512,
    lodTransitionTime: 500,
    drawDistance: 50,
    connectionsVisible: 200,
    showLabels: true,
    labelDensity: 0.5,
    physicsFidelity: 0.6,
    minConnectionStrength: 0.4, // Added default value
  },
  dynamic: {
    // Add dynamic config - using 'medium' as a base for now
    level: 'dynamic',
    segmentDetail: 32,
    maxVisibleRegions: 1000,
    useInstancedMesh: true,
    useShaderEffects: true,
    usePostProcessing: true,
    useShadows: true,
    useBloom: true,
    useReflections: false,
    textureDimension: 1024,
    lodTransitionTime: 800,
    drawDistance: 75,
    connectionsVisible: 500,
    showLabels: true,
    labelDensity: 0.8,
    physicsFidelity: 0.8,
    minConnectionStrength: 0.3, // Added default value
  },
  // Removed "minimal" and "ultra" config blocks
};

/**
 * Props with neural-safe typing
 */

// Create Context for DetailConfig
interface DetailContextProps {
  detailConfig: DetailConfig;
}
const DetailContext = createContext<DetailContextProps | null>(null);

export const useDetailConfig = () => {
  const context = useContext(DetailContext);
  if (!context) {
    throw new Error('useDetailConfig must be used within an AdaptiveLOD provider');
  }
  return context.detailConfig;
};

interface AdaptiveLODProps {
  initialDetailLevel?: DetailLevelString;
  detailConfigs?: Partial<Record<DetailLevelString, Partial<DetailConfig>>>;
  adaptiveMode?: 'auto' | 'manual' | 'hybrid';
  onDetailLevelChange?: (newLevel: DetailLevelString, config: DetailConfig) => void;
  // children: (detailConfig: DetailConfig) => React.ReactNode; // Remove render prop
  children: React.ReactNode; // Add normal children prop
  forceDetailLevel?: DetailLevelString;
  distanceBasedLOD?: boolean;
  cameraPositionInfluence?: number;
  regionCount?: number;
  regionDensityInfluence?: number;
  devicePerformanceClass?: 'high' | 'medium' | 'low';
}

/**
 * AdaptiveLOD - Common component for dynamic detail management
 * Implements clinically-precise performance optimization for neural visualization
 */
export const AdaptiveLOD: React.FC<AdaptiveLODProps> = ({
  initialDetailLevel = 'high',
  detailConfigs,
  adaptiveMode = 'hybrid',
  onDetailLevelChange,
  children,
  forceDetailLevel,
  distanceBasedLOD = true,
  cameraPositionInfluence = 0.5,
  regionCount = 0,
  regionDensityInfluence = 0.3,
  devicePerformanceClass = 'medium',
}) => {
  // R3F hook usage fully removed

  // Performance tracking (Refs kept, logic removed)
  const fpsBufferSize = 60;
  const fpsBuffer = useRef<number[]>([]);
  // Removed unused ref: const frameCount = useRef(0);
  const lastFrameTime = useRef(performance.now());
  const lastFPSUpdateTime = useRef(performance.now());
  const averageFPS = useRef(60); // Default FPS

  // LOD control state
  const [detailLevel, setDetailLevel] = useState<DetailLevelString>(initialDetailLevel);
  const lastDetailChangeTime = useRef(performance.now());
  const canIncreaseDetail = useRef(true);

  // Merged configurations with defaults
  const mergedConfigs = useMemo(() => {
    // Start with the default configs
    const configs = { ...defaultDetailConfigs };

    // Apply custom overrides if provided
    if (detailConfigs) {
      Object.entries(detailConfigs).forEach(([level, config]) => {
        // Check if level is a valid DetailLevelString key
        if (level in configs && config) {
          configs[level as DetailLevelString] = {
            ...configs[level as DetailLevelString], // Correct type assertion
            ...config,
          };
        }
      });
    }

    // Apply device performance class adjustments
    if (devicePerformanceClass === 'high') {
      // High-end devices can use higher detail
      configs['high'].maxVisibleRegions += 200;
      configs['medium'].maxVisibleRegions += 100;
    } else if (devicePerformanceClass === 'low') {
      // Low-end devices need more aggressive optimization
      Object.values(configs).forEach((config) => {
        config.segmentDetail = Math.max(8, Math.floor(config.segmentDetail * 0.7));
        config.maxVisibleRegions = Math.floor(config.maxVisibleRegions * 0.6);
        config.connectionsVisible = Math.floor(config.connectionsVisible * 0.6);
        config.useBloom = false;
        config.useReflections = false;
        config.useShadows = false;
      });
    }

    return configs;
  }, [detailConfigs, devicePerformanceClass]);

  // Current detail configuration - Use forced level or initial level
  const currentConfig = useMemo(() => {
    const levelToUse = forceDetailLevel ?? detailLevel;
    return mergedConfigs[levelToUse];
  }, [mergedConfigs, detailLevel, forceDetailLevel]);

  // Camera distance factor calculation fully removed

  // Calculate region density factor (Does not use R3F hooks)
  // Note: This block seems to be duplicated/incorrectly placed from the previous diff, removing it.

  // Calculate region density factor
  const calculateRegionDensityFactor = useCallback(() => {
    if (regionCount <= 0 || regionDensityInfluence === 0) return 1.0;

    // Region count thresholds
    const lowRegionCount = 100;
    const highRegionCount = 500;

    // Normalize region count between 0 and 1
    const densityFactor = Math.min(
      1.0,
      Math.max(0, (regionCount - lowRegionCount) / (highRegionCount - lowRegionCount))
    );

    // Scale by the region density influence
    return densityFactor * regionDensityInfluence;
  }, [regionCount, regionDensityInfluence]);

  // Performance update function fully removed

  // useFrame call fully removed

  // Handle forced detail level changes
  // Note: This block seems to be duplicated/incorrectly placed from the previous diff, removing it.

  // useFrame call fully removed

  // Handle forced detail level changes
  useEffect(() => {
    if (forceDetailLevel && forceDetailLevel !== detailLevel) {
      setDetailLevel(forceDetailLevel);

      // Notify via callback
      if (onDetailLevelChange) {
        onDetailLevelChange(forceDetailLevel, mergedConfigs[forceDetailLevel]);
      }
    }
  }, [forceDetailLevel, detailLevel, onDetailLevelChange, mergedConfigs]);

  // Initialize FPS buffer
  useEffect(() => {
    fpsBuffer.current = new Array(fpsBufferSize).fill(60);
  }, []);

  // Apply initial LOD based on device class
  useEffect(() => {
    // Set an initial LOD based on device performance class
    if (!forceDetailLevel) {
      let initialLOD = initialDetailLevel;

      if (devicePerformanceClass === 'high') {
        initialLOD = 'high';
      } else if (devicePerformanceClass === 'medium') {
        initialLOD = 'medium';
      } else if (devicePerformanceClass === 'low') {
        initialLOD = 'low';
      }

      setDetailLevel(initialLOD);

      // Notify via callback
      if (onDetailLevelChange) {
        onDetailLevelChange(initialLOD, mergedConfigs[initialLOD]);
      }
    }
  }, [
    devicePerformanceClass,
    forceDetailLevel,
    initialDetailLevel,
    onDetailLevelChange,
    mergedConfigs,
  ]);

  // Provide the config via context
  const contextValue = useMemo(() => ({ detailConfig: currentConfig }), [currentConfig]);

  return <DetailContext.Provider value={contextValue}>{children}</DetailContext.Provider>;
};

export default AdaptiveLOD;

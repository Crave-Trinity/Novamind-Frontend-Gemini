/**
 * NOVAMIND Neural-Safe Common Component
 * AdaptiveLOD - Quantum-level adaptive detail management
 * with performance-optimized neural rendering
 */

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

// Performance thresholds
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
  },
  dynamic: {
    // Add dynamic config - using 'high' as a base for now
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
  },
  // Removed "minimal" and "ultra" config blocks
};

/**
 * Props with neural-safe typing
 */
interface AdaptiveLODProps {
  initialDetailLevel?: DetailLevelString;
  detailConfigs?: Partial<Record<DetailLevelString, Partial<DetailConfig>>>;
  adaptiveMode?: 'auto' | 'manual' | 'hybrid';
  onDetailLevelChange?: (newLevel: DetailLevelString, config: DetailConfig) => void;
  children: (detailConfig: DetailConfig) => React.ReactNode;
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
  // Get THREE.js camera
  const { camera } = useThree(); // Removed unused gl, scene

  // Performance tracking
  const fpsBufferSize = 60; // Track FPS over 60 frames (1 second at 60fps)
  const fpsBuffer = useRef<number[]>([]);
  // Removed unused ref: const frameCount = useRef(0);
  const lastFrameTime = useRef(performance.now());
  const lastFPSUpdateTime = useRef(performance.now());
  const averageFPS = useRef(60);

  // LOD control state
  // Use string literal type for state
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

  // Current detail configuration
  const currentConfig = useMemo(() => {
    return mergedConfigs[detailLevel];
  }, [mergedConfigs, detailLevel]);

  // Calculate camera distance factor for LOD (if enabled)
  const calculateCameraDistanceFactor = useCallback(() => {
    if (!distanceBasedLOD) return 1.0;

    // Calculate distance from camera to scene center
    const distanceToCenter = camera.position.distanceTo(new Vector3(0, 0, 0));

    // Base distance thresholds (adjustable based on scene scale)
    const closeDistance = 10;
    const farDistance = 50;

    // Normalize distance between 0 and 1
    const distanceFactor =
      1.0 -
      Math.min(
        1.0,
        Math.max(0, (distanceToCenter - closeDistance) / (farDistance - closeDistance))
      );

    // Scale by the camera position influence
    return 1.0 - distanceFactor * cameraPositionInfluence;
  }, [camera, distanceBasedLOD, cameraPositionInfluence]);

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

  // Performance update function
  const updatePerformance = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastFrameTime.current;
    lastFrameTime.current = now;

    // Calculate current FPS
    const currentFPS = 1000 / deltaTime;

    // Add to FPS buffer (capped to buffer size)
    if (fpsBuffer.current.length >= fpsBufferSize) {
      fpsBuffer.current.shift();
    }
    fpsBuffer.current.push(currentFPS);

    // Update average every second
    if (now - lastFPSUpdateTime.current > 1000) {
      // Calculate average FPS from buffer
      const sum = fpsBuffer.current.reduce((a, b) => a + b, 0);
      averageFPS.current = sum / fpsBuffer.current.length;
      lastFPSUpdateTime.current = now;

      // Only allow detail increases after recovery delay
      if (!canIncreaseDetail.current && now - lastDetailChangeTime.current > FPS_RECOVERY_DELAY) {
        canIncreaseDetail.current = true;
      }
    }

    // Check for detail level changes in auto or hybrid modes
    if ((adaptiveMode === 'auto' || adaptiveMode === 'hybrid') && !forceDetailLevel) {
      let newLevel: DetailLevelString = detailLevel; // Use string literal type

      // Check if performance is too low for current detail level
      if (averageFPS.current < FPS_THRESHOLD_MEDIUM) {
        // Step down detail aggressively
        // Adjust logic to exclude ultra/minimal
        if (detailLevel === 'high') newLevel = 'medium';
        else if (detailLevel === 'medium') newLevel = 'low';
        // Cannot go lower than "low" in adaptive mode based on FPS

        canIncreaseDetail.current = false;
      }
      // Check if performance is extremely good and we can increase detail
      else if (averageFPS.current > FPS_THRESHOLD_HIGH && canIncreaseDetail.current) {
        // Step up detail conservatively
        // Adjust logic to exclude ultra/minimal
        if (detailLevel === 'low') newLevel = 'medium';
        else if (detailLevel === 'medium') newLevel = 'high';
        // Cannot go higher than "high" in adaptive mode based on FPS
      }

      // Apply additional LOD factors in hybrid mode
      if (adaptiveMode === 'hybrid') {
        const distanceFactor = calculateCameraDistanceFactor();
        const densityFactor = calculateRegionDensityFactor();
        const combinedFactor = Math.max(distanceFactor, densityFactor);

        // Use combined factor to potentially adjust level more aggressively
        if (combinedFactor > 0.8 && detailLevel !== 'low') {
          // Check against new lowest level 'low'
          // Potentially reduce detail one more level when combined factors are high
          if (newLevel !== detailLevel) {
            // Already changing levels, consider more aggressive reduction
            const levels: DetailLevelString[] = ['high', 'medium', 'low']; // Use adjusted levels
            const currentIndex = levels.indexOf(newLevel);
            if (currentIndex < levels.length - 1) {
              // Ensure we don't go below 'low'
              newLevel = levels[currentIndex + 1];
            }
          }
        }
      }

      // Apply detail level change if needed
      if (newLevel !== detailLevel) {
        setDetailLevel(newLevel);
        lastDetailChangeTime.current = now;

        // Notify via callback
        if (onDetailLevelChange) {
          onDetailLevelChange(newLevel, mergedConfigs[newLevel]);
        }
      }
    }
  }, [
    detailLevel,
    adaptiveMode,
    forceDetailLevel,
    onDetailLevelChange,
    mergedConfigs,
    calculateCameraDistanceFactor,
    calculateRegionDensityFactor,
  ]);

  // Update on each frame
  useFrame(() => {
    updatePerformance();
  });

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

  // Return children with current config
  return <>{children(currentConfig)}</>;
};

export default AdaptiveLOD;

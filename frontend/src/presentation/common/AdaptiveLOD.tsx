/**
 * NOVAMIND Neural-Safe Common Component
 * AdaptiveLOD - Quantum-level adaptive detail management
 * with performance-optimized neural rendering
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

// Performance thresholds
const FPS_THRESHOLD_HIGH = 55; // Maintain high detail above this FPS
const FPS_THRESHOLD_MEDIUM = 35; // Maintain medium detail above this FPS
const FPS_RECOVERY_DELAY = 2000; // Wait time before increasing detail

/**
 * Detail level enumeration with neural-safe typing
 */
export enum DetailLevel {
  ULTRA = 'ultra',   // Maximum quality, clinical precision
  HIGH = 'high',     // High quality with full features
  MEDIUM = 'medium', // Balanced for clinical utility
  LOW = 'low',       // Performance mode for weaker systems
  MINIMAL = 'minimal' // Emergency fallback for critical performance issues
}

/**
 * Detail configuration with neural-safe typing
 */
export interface DetailConfig {
  level: DetailLevel;
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
const defaultDetailConfigs: Record<DetailLevel, DetailConfig> = {
  [DetailLevel.ULTRA]: {
    level: DetailLevel.ULTRA,
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
    physicsFidelity: 1.0
  },
  [DetailLevel.HIGH]: {
    level: DetailLevel.HIGH,
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
    physicsFidelity: 0.8
  },
  [DetailLevel.MEDIUM]: {
    level: DetailLevel.MEDIUM,
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
    physicsFidelity: 0.6
  },
  [DetailLevel.LOW]: {
    level: DetailLevel.LOW,
    segmentDetail: 16,
    maxVisibleRegions: 200,
    useInstancedMesh: true,
    useShaderEffects: false,
    usePostProcessing: false,
    useShadows: false,
    useBloom: false,
    useReflections: false,
    textureDimension: 256,
    lodTransitionTime: 300,
    drawDistance: 30,
    connectionsVisible: 100,
    showLabels: true,
    labelDensity: 0.3,
    physicsFidelity: 0.4
  },
  [DetailLevel.MINIMAL]: {
    level: DetailLevel.MINIMAL,
    segmentDetail: 8,
    maxVisibleRegions: 100,
    useInstancedMesh: true,
    useShaderEffects: false,
    usePostProcessing: false,
    useShadows: false,
    useBloom: false,
    useReflections: false,
    textureDimension: 128,
    lodTransitionTime: 200,
    drawDistance: 20,
    connectionsVisible: 50,
    showLabels: false,
    labelDensity: 0.1,
    physicsFidelity: 0.2
  }
};

/**
 * Props with neural-safe typing
 */
interface AdaptiveLODProps {
  initialDetailLevel?: DetailLevel;
  detailConfigs?: Partial<Record<DetailLevel, Partial<DetailConfig>>>;
  adaptiveMode?: 'auto' | 'manual' | 'hybrid';
  onDetailLevelChange?: (newLevel: DetailLevel, config: DetailConfig) => void;
  children: (detailConfig: DetailConfig) => React.ReactNode;
  forceDetailLevel?: DetailLevel;
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
  initialDetailLevel = DetailLevel.HIGH,
  detailConfigs,
  adaptiveMode = 'hybrid',
  onDetailLevelChange,
  children,
  forceDetailLevel,
  distanceBasedLOD = true,
  cameraPositionInfluence = 0.5,
  regionCount = 0,
  regionDensityInfluence = 0.3,
  devicePerformanceClass = 'medium'
}) => {
  // Get THREE.js camera
  const { camera, gl, scene } = useThree();
  
  // Performance tracking
  const fpsBufferSize = 60; // Track FPS over 60 frames (1 second at 60fps)
  const fpsBuffer = useRef<number[]>([]);
  const frameCount = useRef(0);
  const lastFrameTime = useRef(performance.now());
  const lastFPSUpdateTime = useRef(performance.now());
  const averageFPS = useRef(60);
  
  // LOD control state
  const [detailLevel, setDetailLevel] = useState(initialDetailLevel);
  const lastDetailChangeTime = useRef(performance.now());
  const canIncreaseDetail = useRef(true);
  
  // Merged configurations with defaults
  const mergedConfigs = useMemo(() => {
    // Start with the default configs
    const configs = { ...defaultDetailConfigs };
    
    // Apply custom overrides if provided
    if (detailConfigs) {
      Object.entries(detailConfigs).forEach(([level, config]) => {
        if (level in DetailLevel && config) {
          configs[level as DetailLevel] = {
            ...configs[level as DetailLevel],
            ...config
          };
        }
      });
    }
    
    // Apply device performance class adjustments
    if (devicePerformanceClass === 'high') {
      // High-end devices can use higher detail
      configs[DetailLevel.HIGH].maxVisibleRegions += 200;
      configs[DetailLevel.MEDIUM].maxVisibleRegions += 100;
    } else if (devicePerformanceClass === 'low') {
      // Low-end devices need more aggressive optimization
      Object.values(configs).forEach(config => {
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
    let distanceFactor = 1.0 - Math.min(
      1.0,
      Math.max(0, (distanceToCenter - closeDistance) / (farDistance - closeDistance))
    );
    
    // Scale by the camera position influence
    return 1.0 - (distanceFactor * cameraPositionInfluence);
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
      let newLevel = detailLevel;
      
      // Check if performance is too low for current detail level
      if (averageFPS.current < FPS_THRESHOLD_MEDIUM) {
        // Step down detail aggressively
        if (detailLevel === DetailLevel.ULTRA) newLevel = DetailLevel.HIGH;
        else if (detailLevel === DetailLevel.HIGH) newLevel = DetailLevel.MEDIUM;
        else if (detailLevel === DetailLevel.MEDIUM) newLevel = DetailLevel.LOW;
        else if (detailLevel === DetailLevel.LOW) newLevel = DetailLevel.MINIMAL;
        
        canIncreaseDetail.current = false;
      }
      // Check if performance is extremely good and we can increase detail
      else if (averageFPS.current > FPS_THRESHOLD_HIGH && canIncreaseDetail.current) {
        // Step up detail conservatively
        if (detailLevel === DetailLevel.MINIMAL) newLevel = DetailLevel.LOW;
        else if (detailLevel === DetailLevel.LOW) newLevel = DetailLevel.MEDIUM;
        else if (detailLevel === DetailLevel.MEDIUM) newLevel = DetailLevel.HIGH;
        else if (detailLevel === DetailLevel.HIGH) newLevel = DetailLevel.ULTRA;
      }
      
      // Apply additional LOD factors in hybrid mode
      if (adaptiveMode === 'hybrid') {
        const distanceFactor = calculateCameraDistanceFactor();
        const densityFactor = calculateRegionDensityFactor();
        const combinedFactor = Math.max(distanceFactor, densityFactor);
        
        // Use combined factor to potentially adjust level more aggressively
        if (combinedFactor > 0.8 && detailLevel > DetailLevel.MINIMAL) {
          // Potentially reduce detail one more level when combined factors are high
          if (newLevel !== detailLevel) {
            // Already changing levels, consider more aggressive reduction
            if (newLevel > DetailLevel.MINIMAL) {
              newLevel = Object.values(DetailLevel)[Object.values(DetailLevel).indexOf(newLevel) + 1] as DetailLevel;
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
    calculateRegionDensityFactor
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
        initialLOD = DetailLevel.HIGH;
      } else if (devicePerformanceClass === 'medium') {
        initialLOD = DetailLevel.MEDIUM;
      } else if (devicePerformanceClass === 'low') {
        initialLOD = DetailLevel.LOW;
      }
      
      setDetailLevel(initialLOD);
      
      // Notify via callback
      if (onDetailLevelChange) {
        onDetailLevelChange(initialLOD, mergedConfigs[initialLOD]);
      }
    }
  }, [devicePerformanceClass, forceDetailLevel, initialDetailLevel, onDetailLevelChange, mergedConfigs]);
  
  // Return children with current config
  return <>{children(currentConfig)}</>;
};

export default AdaptiveLOD;

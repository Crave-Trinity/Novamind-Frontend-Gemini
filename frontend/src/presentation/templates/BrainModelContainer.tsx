/**
 * NOVAMIND Neural-Safe Template Component
 * BrainModelContainer - Quantum-level integration of neural visualization
 * with clinical precision and type-safe state management
 */

import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Preload, Stats } from "@react-three/drei";
import { A11yAnnouncer, A11ySection } from "@react-three/a11y";
import { useResizeObserver } from "@react-aria/utils";

// Neural visualization coordinator
import { useVisualizationCoordinator } from "@application/coordinators/NeuralVisualizationCoordinator";

// Core visualization components
import SymptomRegionMappingVisualizer from "@presentation/molecules/SymptomRegionMappingVisualizer";
import NeuralActivityVisualizer from "@presentation/molecules/NeuralActivityVisualizer";
import TemporalDynamicsVisualizer from "@presentation/molecules/TemporalDynamicsVisualizer";
import BiometricAlertVisualizer from "@presentation/molecules/BiometricAlertVisualizer";
import DataStreamVisualizer from "@presentation/molecules/DataStreamVisualizer";
import TreatmentResponseVisualizer from "@presentation/molecules/TreatmentResponseVisualizer";

// Utility components
import PerformanceMonitor from "@presentation/common/PerformanceMonitor";
import VisualizationErrorBoundary from "@presentation/common/VisualizationErrorBoundary";
import LoadingFallback from "@presentation/common/LoadingFallback";
import AdaptiveLOD from "@presentation/common/AdaptiveLOD";

// Clinical control components
import NeuralControlPanel from "@presentation/organisms/NeuralControlPanel";
import ClinicalMetricsPanel from "@presentation/organisms/ClinicalMetricsPanel";
import BiometricMonitorPanel from "@presentation/organisms/BiometricMonitorPanel";

// Domain types
import { BrainRegion, NeuralConnection } from "@domain/types/brain/models";
import { VisualizationOptions } from "@domain/types/visualization/options";

/**
 * Interface for container props with neural-safe typing
 */
interface BrainModelContainerProps {
  patientId: string;
  initialRenderMode?:
    | "standard"
    | "heatmap"
    | "connectivity"
    | "activity"
    | "treatment";
  initialRegionSelection?: string[];
  initialTimeScale?: "momentary" | "hourly" | "daily" | "weekly" | "monthly";
  initialDetailLevel?: "low" | "medium" | "high" | "ultra";
  width?: string | number;
  height?: string | number;
  showControls?: boolean;
  showMetrics?: boolean;
  showPerformance?: boolean;
  allowRegionSelection?: boolean;
  showBiometricAlerts?: boolean;
  showTreatmentResponses?: boolean;
  className?: string;
  onRegionSelect?: (regionId: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Constants for visualization settings with clinical precision
 */
const CAMERA_SETTINGS = {
  position: [0, 0, 15] as [number, number, number],
  fov: 50,
  near: 0.1,
  far: 1000,
};

const ENVIRONMENT_PRESET = "studio";

/**
 * Inner Canvas component wrapped in error boundary
 */
const VisualizationCanvas: React.FC<{
  patientId: string;
  canvasWidth: number;
  canvasHeight: number;
  showPerformance: boolean;
}> = ({ patientId, canvasWidth, canvasHeight, showPerformance }) => {
  // Access visualization coordinator
  const { state, selectRegion, deselectRegion } = useVisualizationCoordinator();

  // Destructure state
  const {
    brainModel,
    selectedRegions,
    activeRegions,
    neuralActivation,
    connectionStrengths,
    symptomMappings,
    treatmentPredictions,
    selectedTreatmentId,
    biometricAlerts,
    biometricStreams,
    temporalPatterns,
    renderMode,
    detailLevel,
    isLoading,
  } = state;

  // Handle region selection
  const handleRegionClick = useCallback(
    (regionId: string) => {
      if (selectedRegions.includes(regionId)) {
        deselectRegion(regionId);
      } else {
        selectRegion(regionId);
      }
    },
    [selectedRegions, selectRegion, deselectRegion],
  );

  // Calculate quality factor based on detail level
  const qualityFactor = useMemo(() => {
    switch (detailLevel) {
      case "low":
        return 0.5;
      case "medium":
        return 1.0;
      case "high":
        return 1.5;
      case "ultra":
        return 2.0;
      default:
        return 1.0;
    }
  }, [detailLevel]);

  // Generate visualization options
  const visualizationOptions = useMemo<VisualizationOptions>(
    () => ({
      renderMode,
      qualityFactor,
      showLabels: detailLevel !== "low",
      showConnections:
        renderMode === "connectivity" || renderMode === "standard",
      showActivation: renderMode === "activity" || renderMode === "standard",
      showSymptomMapping: renderMode === "standard" || renderMode === "heatmap",
      useHeatmap: renderMode === "heatmap",
      selectedRegions,
      activeRegions: new Set(activeRegions),
      highlightSelected: true,
      highlightActive: true,
    }),
    [renderMode, qualityFactor, detailLevel, selectedRegions, activeRegions],
  );

  // Convert activation and strength maps to arrays for efficient rendering
  const activationArray = useMemo(() => {
    if (!brainModel || !brainModel.regions) return [];

    return brainModel.regions.map((region) => ({
      regionId: region.id,
      level: neuralActivation.get(region.id) || "baseline",
    }));
  }, [brainModel, neuralActivation]);

  const connectionArray = useMemo(() => {
    if (!brainModel || !brainModel.connections) return [];

    return brainModel.connections.map((connection) => ({
      id: connection.id,
      strength:
        connectionStrengths.get(
          `${connection.sourceId}-${connection.targetId}`,
        ) || connection.strength,
    }));
  }, [brainModel, connectionStrengths]);

  // Array of biometric streams
  const biometricStreamArray = useMemo(() => {
    return Array.from(biometricStreams.values());
  }, [biometricStreams]);

  // Setting up region lookup for efficient access
  const regionLookup = useMemo(() => {
    if (!brainModel || !brainModel.regions)
      return new Map<string, BrainRegion>();

    const lookup = new Map<string, BrainRegion>();
    brainModel.regions.forEach((region) => {
      lookup.set(region.id, region);
    });

    return lookup;
  }, [brainModel]);

  // Show loading state if data is not ready
  if (isLoading || !brainModel) {
    return <LoadingFallback message="Initializing neural visualization..." />;
  }

  return (
    <>
      {/* Neural Activity Visualization */}
      {renderMode === "activity" && (
        <NeuralActivityVisualizer
          regions={brainModel.regions}
          connections={brainModel.connections}
          activationLevels={activationArray}
          selectedRegions={selectedRegions}
          onRegionClick={handleRegionClick}
          options={visualizationOptions}
        />
      )}

      {/* Symptom-Region Mapping */}
      {(renderMode === "standard" || renderMode === "heatmap") && (
        <SymptomRegionMappingVisualizer
          regions={brainModel.regions}
          connections={brainModel.connections}
          symptomMappings={symptomMappings}
          selectedRegions={selectedRegions}
          activeRegions={new Set(activeRegions)}
          onRegionClick={handleRegionClick}
          options={visualizationOptions}
        />
      )}

      {/* Treatment Response Visualization */}
      {renderMode === "treatment" && treatmentPredictions.length > 0 && (
        <TreatmentResponseVisualizer
          predictions={treatmentPredictions}
          regions={brainModel.regions}
          selectedTreatmentId={selectedTreatmentId || undefined}
        />
      )}

      {/* Temporal Dynamics Visualization */}
      <TemporalDynamicsVisualizer
        patterns={temporalPatterns}
        regions={regionLookup}
        position={[8, 0, 0]}
        rotation={[0, -Math.PI / 6, 0]}
        visible={renderMode === "standard" || renderMode === "activity"}
      />

      {/* Biometric Alert Visualization */}
      <BiometricAlertVisualizer
        alerts={biometricAlerts.filter((alert) => !alert.acknowledged)}
        position={[-8, 0, 0]}
        rotation={[0, Math.PI / 6, 0]}
        visible={renderMode === "standard"}
      />

      {/* Data Stream Visualization */}
      <DataStreamVisualizer
        streams={biometricStreamArray}
        position={[0, -6, 0]}
        rotation={[Math.PI / 6, 0, 0]}
        visible={renderMode === "standard"}
      />

      {/* Adaptive Level of Detail */}
      <AdaptiveLOD detailLevel={detailLevel} targetFrameRate={60} />

      {/* Performance Monitoring */}
      {showPerformance && <Stats />}
    </>
  );
};

/**
 * Scene setup for proper camera and lighting
 */
const SceneSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { camera } = useThree();

  useEffect(() => {
    // Position camera for optimal neural visualization
    camera.position.set(
      CAMERA_SETTINGS.position[0],
      CAMERA_SETTINGS.position[1],
      CAMERA_SETTINGS.position[2],
    );
    camera.near = CAMERA_SETTINGS.near;
    camera.far = CAMERA_SETTINGS.far;
    camera.updateProjectionMatrix();
  }, [camera]);

  return (
    <>
      {/* Professional studio lighting for clinical clarity */}
      <Environment preset={ENVIRONMENT_PRESET} />

      {/* Orbit controls for neural navigation */}
      <OrbitControls
        enableDamping
        dampingFactor={0.25}
        rotateSpeed={0.8}
        minDistance={5}
        maxDistance={30}
      />

      {/* Scene content */}
      {children}

      {/* Preload assets for optimal clinical experience */}
      <Preload all />
    </>
  );
};

/**
 * Main brain model container component
 */
export const BrainModelContainer: React.FC<BrainModelContainerProps> = ({
  patientId,
  initialRenderMode = "standard",
  initialRegionSelection = [],
  initialTimeScale = "daily",
  initialDetailLevel = "medium",
  width = "100%",
  height = "600px",
  showControls = true,
  showMetrics = true,
  showPerformance = false,
  allowRegionSelection = true,
  showBiometricAlerts = true,
  showTreatmentResponses = true,
  className = "",
  onRegionSelect,
  onError,
}) => {
  // Container dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Create resize observer for responsive canvas
  const { width: resizeWidth, height: resizeHeight } = useResizeObserver({
    ref: containerRef,
    onResize: () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    },
  });

  // Update dimensions when container size changes
  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  }, [resizeWidth, resizeHeight]);

  // Handle errors
  const handleError = useCallback(
    (error: Error) => {
      console.error("Neural visualization error:", error);
      if (onError) {
        onError(error);
      }
    },
    [onError],
  );

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-900 rounded-lg overflow-hidden ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
      data-testid="brain-model-container"
    >
      {/* Visualization Canvas */}
      <VisualizationErrorBoundary onError={handleError}>
        <A11yAnnouncer />
        <Canvas
          camera={{
            fov: CAMERA_SETTINGS.fov,
            near: CAMERA_SETTINGS.near,
            far: CAMERA_SETTINGS.far,
            position: CAMERA_SETTINGS.position,
          }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
          className="w-full h-full"
        >
          <A11ySection
            title="Neural Visualization"
            description="Interactive 3D visualization of neural activity and clinical correlations"
          >
            <SceneSetup>
              <VisualizationCanvas
                patientId={patientId}
                canvasWidth={dimensions.width}
                canvasHeight={dimensions.height}
                showPerformance={showPerformance}
              />
            </SceneSetup>
          </A11ySection>
        </Canvas>
      </VisualizationErrorBoundary>

      {/* Neural Control Panel */}
      {showControls && (
        <div className="absolute top-4 right-4">
          <NeuralControlPanel />
        </div>
      )}

      {/* Clinical Metrics Panel */}
      {showMetrics && (
        <div className="absolute bottom-4 left-4">
          <ClinicalMetricsPanel />
        </div>
      )}

      {/* Biometric Monitor Panel */}
      {showBiometricAlerts && (
        <div className="absolute top-4 left-4">
          <BiometricMonitorPanel />
        </div>
      )}

      {/* Performance Monitor */}
      {showPerformance && (
        <div className="absolute bottom-4 right-4">
          <PerformanceMonitor />
        </div>
      )}
    </div>
  );
};

export default BrainModelContainer;

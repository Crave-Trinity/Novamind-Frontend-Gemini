/**
 * NOVAMIND Neural-Safe Organism Component
 * BrainVisualizationContainer - Quantum-level container for brain visualization
 * with neuropsychiatric integration and clinical precision
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
// Removed incorrect import: import { useRouter } from "next/router";
// Using useNavigate from react-router-dom instead
import { useNavigate } from 'react-router-dom';

// Domain types
// Removed incorrect import: import { DetailLevel } from "@domain/types/brain/visualization";
// Use string literals directly or VisualizationSettings['levelOfDetail']
import {
  BrainModel,
  BrainRegion,
  NeuralConnection,
} from "@domain/types/brain/models";
import { ActivationLevel } from "@domain/types/brain/activity";
import { VisualizationState, NeuralError } from "@domain/types/shared/common"; // Import VisualizationState and NeuralError
import type { VisualizationSettings } from '@domain/types/brain/visualization'; // Import type for use in component

// Application hooks
import { useBrainModel } from "@application/hooks/useBrainModel";
import { usePatientData } from "@application/hooks/usePatientData";
import { useClinicalContext } from "@application/hooks/useClinicalContext";
import { useVisualSettings } from "@application/hooks/useVisualSettings";
import { useSearchParams } from "@application/hooks/useSearchParams";

// Presentation components
import BrainModelViewer from "@presentation/organisms/BrainModelViewer";
import BrainRegionDetails from "@presentation/molecules/BrainRegionDetails";
import RegionSelectionPanel from "@presentation/molecules/RegionSelectionPanel";
import VisualizationControls from "@presentation/molecules/VisualizationControls";
import ClinicalDataOverlay from "@presentation/molecules/ClinicalDataOverlay";
import BrainRegionLabels from "@presentation/molecules/BrainRegionLabels";

// Common components
import AdaptiveLOD from "@presentation/common/AdaptiveLOD";
import PerformanceMonitor from "@presentation/common/PerformanceMonitor";
import VisualizationErrorBoundary from "@presentation/common/VisualizationErrorBoundary";
import LoadingFallback from "@presentation/common/LoadingFallback";

/**
 * Props with neural-safe typing
 */
interface BrainVisualizationContainerProps {
  scanId?: string;
  patientId?: string;
  initialSelectedRegionId?: string;
  readOnly?: boolean;
  showClinicalData?: boolean;
  showControls?: boolean;
  height?: string | number;
  width?: string | number;
  onRegionSelect?: (region: BrainRegion | null) => void;
  onVisualizationReady?: () => void;
  className?: string;
  // regionSearchQuery and highlightedRegionIds are managed internally or via hooks now
}

/**
 * Selectable detail modes for visualization
 */
export enum DetailMode {
  PERFORMANCE = "performance",
  BALANCED = "balanced",
  QUALITY = "quality",
  CLINICAL = "clinical",
  AUTO = "auto",
}

/**
 * Map detail modes to detail levels
 */
// Define the mapping using the correct string literal types (matching VisualizationSettings['levelOfDetail'])
const detailModeMap: Record<DetailMode, "low" | "medium" | "high" | "dynamic"> = {
  [DetailMode.PERFORMANCE]: "low",
  [DetailMode.BALANCED]: "medium",
  [DetailMode.QUALITY]: "high",
  [DetailMode.CLINICAL]: "high", // Map CLINICAL to 'high' for now
  [DetailMode.AUTO]: "dynamic", // Map AUTO to 'dynamic'
};

/**
 * BrainVisualizationContainer - Organism component for brain visualization
 * Implements neural-safe integration of visualization components with application state
 */
export const BrainVisualizationContainer: React.FC<
  BrainVisualizationContainerProps
> = ({
  scanId,
  patientId,
  initialSelectedRegionId,
  readOnly = false,
  showClinicalData = true,
  showControls = true,
  height = "100%",
  width = "100%",
  onRegionSelect,
  onVisualizationReady,
  className = "",
}) => {
  // Router for navigation
  // Use react-router-dom hook
  const navigate = useNavigate();

  // URL parameter management
  const { getParam, setParam, serializeState } = useSearchParams();

  // Application hooks
  // Call useBrainModel without arguments and destructure only existing properties
  const {
    brainModel,
    isLoading: isModelLoading,
    error: modelError,
    // Removed non-existent properties: selectedRegionId, selectRegion, highlightConnections, setRegionActivity, resetRegionActivity
    // We need to manage selection/highlight state locally or find the correct hook
    fetchBrainModel, // Keep fetch function if needed
    updateRegionActivity, // Keep update function
    toggleRegionActive, // Keep toggle function
    selectRegions, // Keep selection functions
    deselectRegions,
    highlightRegions, // Function to set highlights (state managed internally by hook or needs local state)
    clearHighlights,
    reset, // Keep reset function
  } = useBrainModel();

  // Destructure correct properties from usePatientData
  const {
    patient: patientData, // Rename patient to patientData for consistency in this component
    symptoms: activeSymptoms, // Rename symptoms to activeSymptoms
    diagnoses: activeDiagnoses, // Rename diagnoses to activeDiagnoses
    isLoading: isPatientLoading,
    error: patientError,
  } = usePatientData(patientId);

  const {
    symptomMappings,
    diagnosisMappings,
    riskAssessment,
    treatmentPredictions, // Note: This is fetched but not used by ClinicalDataOverlay currently
    isLoading: isClinicalLoading,
    error: clinicalError,
  } = useClinicalContext(patientId);

  // Destructure the active theme settings directly
  const {
    visualizationSettings,
    updateVisualizationSettings,
    getThemeSettings, // Keep getter if needed elsewhere, but use activeThemeSettings below
    activeThemeSettings, // Destructure the active settings object
  } = useVisualSettings();

  // Local state
  const [selectedRegionIdInternal, setSelectedRegionIdInternal] = useState<string | null>(initialSelectedRegionId || null); // Manage selection locally
  const [isReady, setIsReady] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailMode, setDetailMode] = useState<DetailMode>(DetailMode.AUTO);
  // Use the correct string literal type union for the state (matching VisualizationSettings['levelOfDetail'])
  const [forceDetailLevel, setForceDetailLevel] = useState<
    "low" | "medium" | "high" | "dynamic" | undefined // Add "dynamic" back
  >(undefined);
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [showRegionLabels, setShowRegionLabels] = useState(true);
  const [errorState, setErrorState] = useState<Error | null>(null);
  // Add local state for highlighted regions (if not provided by useBrainModel)
  const [highlightedRegionIdsInternal, setHighlightedRegionIdsInternal] = useState<string[]>([]);

  // Loading state
  const isLoading = isModelLoading || isPatientLoading || isClinicalLoading;
  const loadingProgress = useMemo(() => {
    // Calculate loading progress based on various data sources
    let progress = 0;
    const total = 3; // Model, patient, clinical

    if (!isModelLoading) progress++;
    if (!isPatientLoading) progress++;
    if (!isClinicalLoading) progress++;

    return progress / total;
  }, [isModelLoading, isPatientLoading, isClinicalLoading]);

  // Error handling
  const combinedError = modelError || patientError || clinicalError || errorState;

  // Construct visualizationState based on loading and error status
  const visualizationState = useMemo((): VisualizationState<BrainModel | null> => { // Allow null BrainModel type
    if (combinedError && !brainModel) { // Prioritize error if model hasn't loaded
      // Ensure the error is of type NeuralError or wrap it
      const neuralError = combinedError instanceof NeuralError
        ? combinedError
        : new NeuralError(combinedError?.message || 'Unknown error', { code: 'VIS_CONTAINER_ERR' });
      return { status: 'error', error: neuralError };
    }
    if (isLoading && !brainModel) { // Loading only if model isn't ready
      return { status: 'loading' };
    }
    if (brainModel) {
      // Use 'success' status and 'data' property as defined in VisualizationState type
      // Ensure brainModel is not null here before assigning to 'data'
      return { status: 'success', data: brainModel }; // Use 'data' property
    }
    return { status: 'idle' }; // Default idle state
  }, [isLoading, combinedError, brainModel]);

  // Initialize from URL params
  useEffect(() => {
    // Check for region selection in URL
    const regionParam = getParam("region");
    // Use local state for initial selection check
    if (regionParam && brainModel && !selectedRegionIdInternal) {
      // selectRegion(regionParam); // selectRegion removed from useBrainModel hook
      setSelectedRegionIdInternal(regionParam); // Set local state instead
    }

    // Check for detail mode in URL
    const detailParam = getParam("detail") as DetailMode | null;
    if (detailParam && Object.values(DetailMode).includes(detailParam)) {
      setDetailMode(detailParam);

      if (detailParam !== DetailMode.AUTO) {
        setForceDetailLevel(detailModeMap[detailParam]);
      } else {
        setForceDetailLevel(undefined);
      }
    }

    // Check for performance stats toggle
    const statsParam = getParam("stats");
    if (statsParam === "true") {
      setShowPerformanceStats(true);
    }

    // Check for labels toggle
    const labelsParam = getParam("labels");
    if (labelsParam === "false") {
      setShowRegionLabels(false);
    }
  // Update dependencies for useEffect
  }, [brainModel, getParam, selectedRegionIdInternal]);

  // Update URL when selection changes
  useEffect(() => {
    // Use local state for URL update check
    if (selectedRegionIdInternal) {
      setParam("region", selectedRegionIdInternal); // Use local state
      setShowDetails(true);
    } else {
      setParam("region", null);
      setShowDetails(false);
    }
  // Update dependencies for useEffect
  }, [selectedRegionIdInternal, setParam]);

  // Handle initial region selection
  useEffect(() => {
    // Use local state for initial selection check
    if (initialSelectedRegionId && brainModel && !selectedRegionIdInternal) {
      // selectRegion(initialSelectedRegionId); // selectRegion removed from useBrainModel hook
      setSelectedRegionIdInternal(initialSelectedRegionId); // Set local state instead
    }
  // Update dependencies for useEffect
  }, [initialSelectedRegionId, brainModel, selectedRegionIdInternal]);

  // Selected region data
  const selectedRegion = useMemo(() => {
    // Use local state to find selected region
    if (!brainModel || !selectedRegionIdInternal) return null;
    return brainModel.regions.find((r) => r.id === selectedRegionIdInternal) || null;
  // Update dependencies for useMemo
  }, [brainModel, selectedRegionIdInternal]);

  // Handle region selection
  const handleRegionSelect = useCallback(
    // Update local state on selection
    (regionId: string | null) => {
      // selectRegion(regionId); // selectRegion removed from useBrainModel hook
      setSelectedRegionIdInternal(regionId); // Set local state instead


      // If external handler provided, call with region data
      // If external handler provided, call with region data based on local state
      if (onRegionSelect && brainModel) {
        const region = regionId
          ? brainModel.regions.find((r) => r.id === regionId) || null
          : null;
        onRegionSelect(region);
      }
    },
    // Update dependencies for useCallback
    [onRegionSelect, brainModel],
  );

  // Handle detail mode change
  const handleDetailModeChange = useCallback(
    (mode: DetailMode) => {
      setDetailMode(mode);
      setParam("detail", mode);

      if (mode !== DetailMode.AUTO) {
        setForceDetailLevel(detailModeMap[mode]);
      } else {
        setForceDetailLevel(undefined);
      }
    },
    [setParam],
  );

  // Handle performance metrics update
  const handlePerformanceUpdate = useCallback((metrics: any) => {
    setPerformanceMetrics(metrics);
  }, []);

  // Handle performance warning
  const handlePerformanceWarning = useCallback(
    (metrics: any, level: "warning" | "critical") => {
      if (level === "critical" && detailMode === DetailMode.AUTO) {
        // Auto-switch to performance mode
        setForceDetailLevel("low"); // Use string literal
      }
    },
    [detailMode],
  );

  // Handle visualization ready state
  const handleVisualizationReady = useCallback(() => {
    setIsReady(true);

    if (onVisualizationReady) {
      onVisualizationReady();
    }
  }, [onVisualizationReady]);

  // Handle error in visualization
  const handleVisualizationError = useCallback((error: Error) => {
    setErrorState(error);

    // Log error details
    console.error("NOVAMIND Visualization Error:", error);
  }, []);

  // Handle recovery from error
  const handleErrorRecovery = useCallback(() => {
    setErrorState(null);

    // Switch to performance mode for better recovery chances
    setDetailMode(DetailMode.PERFORMANCE);
    setForceDetailLevel("low"); // Use string literal

    return { success: true, data: true };
  }, []);

  // Placeholder for search-based highlighting if implemented later
  const searchHighlightedRegions: string[] = [];

  // Combine explicitly highlighted regions with search results
  const combinedHighlightedRegions = useMemo(() => {
    // Use only the local state for highlights for now
    return highlightedRegionIdsInternal;
  // Update dependencies
  }, [highlightedRegionIdsInternal]);

  // Device performance class detection
  const devicePerformanceClass = useMemo(() => {
    // Simple performance class detection based on navigator info
    // This would be more sophisticated in a real implementation

    if (typeof window === "undefined") return "medium";

    const userAgent = navigator.userAgent.toLowerCase();

    // Check for mobile devices which typically have lower performance
    if (
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      )
    ) {
      return "low";
    }

    // Check for modern GPU support using feature detection
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

    if (!gl) {
      return "low"; // No WebGL support
    }

    // Get WebGL info to estimate performance
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      // Check for high-end GPUs
      if (/nvidia|rtx|gtx|radeon rx|quadro/i.test(renderer)) {
        return "high";
      }

      // Check for integrated graphics
      if (/intel|hd graphics|iris|uhd/i.test(renderer)) {
        return "medium";
      }
    }

    // Default to medium for unknown configurations
    return "medium";
  }, []);

  // Render loading state
  if (isLoading && !isReady) {
    return (
      <LoadingFallback
        progress={loadingProgress}
        message="Loading Neural Model"
        height={height}
        theme="dark"
      />
    );
  }

  // Render error state
  // Use combinedError for check
  if (combinedError && !brainModel) {
    return (
      <div
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
      >
        <h3 style={{ color: "#ef4444", marginBottom: "1rem" }}>
          Visualization Error
        </h3>
        <p
          style={{
            marginBottom: "1rem",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          Failed to load neural model visualization. Please try again or contact
          support.
        </p>
        <pre
          style={{
            margin: "0.5rem 0",
            padding: "0.5rem",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "0.25rem",
            fontSize: "0.8rem",
            maxWidth: "100%",
            overflow: "auto",
            color: "#94a3b8",
          }}
        >
          {combinedError.message}
        </pre>
        <button
          // Replace router.reload() with a more appropriate action if needed,
          // or simply remove if retry isn't the desired behavior here.
          // For now, let's use window location reload as a simple replacement.
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "0.25rem",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        overflow: "hidden",
        borderRadius: "0.5rem",
        backgroundColor: "#0f172a",
      }}
    >
      {/* Performance Monitoring */}
      <PerformanceMonitor
        visible={showPerformanceStats}
        position="top-right"
        onMetricsUpdate={handlePerformanceUpdate}
        onPerformanceWarning={handlePerformanceWarning}
        showPanel={false}
      />

      {/* Error Boundary for visualization components */}
      <VisualizationErrorBoundary
        onError={handleVisualizationError}
        onRecoveryAttempt={handleErrorRecovery}
      >
        {/* Adaptive LOD */}
        <AdaptiveLOD
          initialDetailLevel={"medium"} // Use string literal
          // Pass the correct type for forceDetailLevel
          // Conditionally pass prop only when defined due to exactOptionalPropertyTypes
          {...(forceDetailLevel !== undefined && { forceDetailLevel: forceDetailLevel })}
          adaptiveMode={detailMode === DetailMode.AUTO ? "hybrid" : "manual"}
          devicePerformanceClass={devicePerformanceClass}
          regionCount={brainModel?.regions.length || 0}
        >
          {(detailConfig) => (
            <>
              {/* Brain Visualization */}
              {/* Conditionally render viewer only on success state with non-null data */}
              {visualizationState.status === 'success' && visualizationState.data && (
                <BrainModelViewer
                  // Pass the correctly typed state and data
                  visualizationState={visualizationState as VisualizationState<BrainModel>}
                  brainModel={visualizationState.data} // Use data from state
                  selectedRegionIds={[selectedRegionIdInternal].filter(Boolean) as string[]}
                  onRegionClick={handleRegionSelect}
                  // Pass other relevant props that BrainModelViewer *does* accept (check its definition if needed)
                  highlightedRegionIds={combinedHighlightedRegions} // Pass combined highlights
                  renderMode={visualizationSettings.renderMode} // Pass relevant settings
                  // themeSettings={activeThemeSettings} // Prop does not exist
                  // Removed props: onReady, settings object, clinical mappings, active clinical data, labels/density
                />
              )}

              {/* Region Labels */}
              {brainModel && showRegionLabels && detailConfig.showLabels && (
                <BrainRegionLabels
                  regions={brainModel.regions}
                  selectedRegionIds={[selectedRegionIdInternal].filter(Boolean) as string[]}
                  highlightedRegionIds={combinedHighlightedRegions} // Add missing prop
                  themeSettings={activeThemeSettings} // Add missing prop
                  // Removed props: density, symptomMappings, activeSymptoms
                />
              )}

              {/* Clinical Data Overlay */}
              {/* Ensure patientData is not null before rendering */}
              {showClinicalData && patientData && riskAssessment && brainModel && (
                <ClinicalDataOverlay
                  patient={patientData} // Use correct prop name 'patient'
                  riskAssessment={riskAssessment}
                  // treatmentPredictions={treatmentPredictions} // Prop does not exist
                  // selectedRegion={selectedRegion} // Prop does not exist, use selectedRegionIds
                  selectedRegionIds={[selectedRegionIdInternal].filter(Boolean) as string[]} // Pass selected IDs
                  // position="top-left" // Prop does not exist
                  brainModel={brainModel}
                  symptoms={activeSymptoms} // Pass symptoms
                  diagnoses={activeDiagnoses} // Pass diagnoses
                />
              )}

              {/* Visualization Controls */}
              {showControls && (
                <VisualizationControls
                  visualizationSettings={visualizationSettings}
                  renderMode={visualizationSettings.renderMode} // Pass renderMode from settings
                  // Define or pass a handler for render mode changes
                  onRenderModeChange={(newMode) => updateVisualizationSettings({ renderMode: newMode })}
                  onSettingsChange={updateVisualizationSettings}
                  // detailMode={detailMode} // Prop does not exist
                  // showPerformanceStats={showPerformanceStats} // Prop does not exist
                  // onTogglePerformanceStats={() => setShowPerformanceStats(!showPerformanceStats)} // Prop does not exist
                  // showLabels={showRegionLabels} // Prop does not exist
                  // onToggleLabels={() => setShowRegionLabels(!showRegionLabels)} // Prop does not exist
                  // position="bottom-right" // Prop does not exist
                />
              )}

              {/* Region Details Panel */}
              {/* Ensure selectedRegion and brainModel are not null */}
              {selectedRegion && showDetails && brainModel && patientData && (
                <BrainRegionDetails
                  regionId={selectedRegion.id} // Pass regionId instead of region object
                  // connections={ // Prop does not exist
                  //   brainModel?.connections.filter(
                  //     (c) =>
                  //       c.sourceId === selectedRegion.id ||
                  //       c.targetId === selectedRegion.id,
                  //   ) || []
                  // }
                  brainModel={brainModel}
                  symptomMappings={symptomMappings} // Pass mappings
                  diagnosisMappings={diagnosisMappings} // Pass mappings
                  onClose={() => handleRegionSelect(null)} // Use handleRegionSelect to clear selection
                  // position="right" // Prop does not exist
                  // width={300} // Prop does not exist
                  patient={patientData}
                  // treatmentPredictions={treatmentPredictions} // Prop does not exist
                />
              )}

              {/* Region Selection Panel (Fallback when no region selected) */}
              {brainModel && !selectedRegion && (
                <RegionSelectionPanel
                  regions={brainModel.regions}
                  selectedRegionIds={[selectedRegionIdInternal].filter(Boolean) as string[]} // Pass selected IDs
                  onRegionSelect={handleRegionSelect}
                  // position="left" // Prop does not exist
                  // width={250} // Prop does not exist
                />
              )}
            </>
          )}
        </AdaptiveLOD>
      </VisualizationErrorBoundary>
    </div>
  );
};

export default BrainVisualizationContainer;

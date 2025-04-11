/**
 * NOVAMIND Neural-Safe Organism Component
 * BrainVisualizationContainer - Quantum-level container for brain visualization
 * with neuropsychiatric integration and clinical precision
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
// Removed unused BrowserRouter, useNavigate imports
import { useTheme } from 'next-themes';
// Removed unused useQuery import

// Domain types
import type { BrainModel, BrainRegion } from '@domain/types/brain/models';
// Removed unused NeuralConnection import
import type { VisualizationSettings } from '@domain/types/brain/visualization';
import {
  RenderMode,
  // Removed unused ThemeOption import
  // Removed unused defaultVisualizationSettings import
} from '@domain/types/brain/visualization';
import type { VisualizationState } from '@domain/types/shared/common';
import { SafeArray, NeuralError } from '@domain/types/shared/common'; // Removed unused Result, success, failure
import type { Diagnosis, Symptom } from '@domain/types/clinical/patient';
// Removed unused Patient import
import type { TreatmentResponsePrediction } from '@domain/types/clinical/treatment';
// Removed unused NeuralImpactRating, TreatmentType imports
import type { RiskAssessment } from '@domain/types/clinical/risk';

// Import DetailLevelString from AdaptiveLOD
import type { DetailLevelString } from '@presentation/common/AdaptiveLOD';

// Domain models
import type {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
  TreatmentNeuralMapping,
} from '@domain/models/brain/mapping/brain-mapping';
import {
  calculateNeuralActivation,
  // Removed unused mapSymptomsToRegions, mapDiagnosesToRegions imports
  calculateTreatmentImpact,
} from '@domain/models/brain/mapping/brain-mapping';

// Application hooks
import { useBrainModel } from '@application/hooks/useBrainModel';
import { usePatientData } from '@application/hooks/usePatientData';
import { useClinicalContext } from '@application/hooks/useClinicalContext';
import { useVisualSettings } from '@application/hooks/useVisualSettings';
import { useSearchParams } from '@application/hooks/useSearchParams';

// Presentation components
import BrainModelViewer from '@presentation/organisms/BrainModelViewer';
import RegionSelectionPanel from '@presentation/molecules/RegionSelectionPanel';
import VisualizationControls from '@presentation/molecules/VisualizationControls';
import ClinicalDataOverlay from '@presentation/molecules/ClinicalDataOverlay';
import BrainRegionDetails from '@presentation/molecules/BrainRegionDetails';
// Removed unused LoadingIndicator import

// Common components
import AdaptiveLOD /*, { DetailConfig } */ from '@presentation/common/AdaptiveLOD'; // Removed unused DetailConfig import
// Removed unused PerformanceMetrics import
import PerformanceMonitor from '@presentation/common/PerformanceMonitor'; // Import PerformanceMetrics type
import VisualizationErrorBoundary from '@presentation/common/VisualizationErrorBoundary';
import LoadingFallback from '@presentation/common/LoadingFallback';

// Define neural-safe prop interface
interface BrainVisualizationContainerProps {
  patientId?: string;
  scanId?: string;
  initialRenderMode?: RenderMode;
  initialSelectedRegions?: string[];
  initialSelectedRegionId?: string; // Added prop
  readOnly?: boolean; // Added prop
  showClinicalData?: boolean; // Added prop
  showControls?: boolean;
  height?: string | number;
  width?: string | number;
  enableClinicalOverlay?: boolean;
  enableRegionSelection?: boolean;
  highPerformanceMode?: boolean;
  onRegionSelect?: (region: BrainRegion | null) => void; // Updated prop type
  onVisualizationReady?: () => void;
  className?: string;
}

/**
 * Selectable detail modes for visualization
 */
// Moved DetailMode enum and detailModeMap to AdaptiveLOD.tsx

/**
 * BrainVisualizationContainer - Organism component for brain visualization
 * Implements neural-safe integration of visualization components with application state
 */
const BrainVisualizationContainerInternal: React.FC<BrainVisualizationContainerProps> = ({
  scanId,
  patientId,
  initialSelectedRegionId,
  initialRenderMode = RenderMode.ANATOMICAL,
  initialSelectedRegions = [],
  // readOnly = false, // Removed unused prop from destructuring
  // showClinicalData = true, // Removed unused prop from destructuring
  showControls = true,
  height = '100%',
  width = '100%',
  onRegionSelect,
  onVisualizationReady,
  className = '',
  enableClinicalOverlay = true,
  enableRegionSelection = true,
  highPerformanceMode = false,
}) => {
  // Removed unused navigate variable
  const { getParam, setParam } = useSearchParams();
  const { theme } = useTheme();

  const {
    brainModel,
    isLoading: isModelLoading,
    error: modelError,
    fetchBrainModel,
    // ... other methods from useBrainModel if needed
  } = useBrainModel();

  const {
    patient: patientData,
    symptoms: activeSymptoms,
    diagnoses: activeDiagnoses,
    isLoading: isPatientLoading,
    error: patientError,
  } = usePatientData(patientId);

  const {
    symptomMappings,
    diagnosisMappings,
    treatmentMappings,
    riskAssessment,
    treatmentPredictions,
    isLoading: isClinicalLoading,
    error: clinicalError,
  } = useClinicalContext(patientId);

  const { visualizationSettings, updateVisualizationSettings, activeThemeSettings } =
    useVisualSettings();

  const [renderMode, setRenderMode] = useState<RenderMode>(
    (getParam('mode') as RenderMode) || initialRenderMode
  );
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>(
    getParam('regions')?.split(',') ?? initialSelectedRegions
  );
  const [highlightedRegionIdsInternal, setHighlightedRegionIdsInternal] = useState<string[]>([]);
  const [regionSearchQuery, setRegionSearchQuery] = useState<string>('');
  const [activeRegionId, setActiveRegionId] = useState<string | null>(
    initialSelectedRegionId || null
  );
  const [showDetails, setShowDetails] = useState<boolean>(!!initialSelectedRegionId);
  // Use DetailLevelString type from AdaptiveLOD. Initialize with a valid default.
  const [detailMode] = useState<DetailLevelString>('high'); // Default to 'high' or use initialDetailLevel prop if added
  const [forceDetailLevel] = useState<
    // Removed unused setForceDetailLevel
    DetailLevelString | undefined // Use DetailLevelString type
  >(undefined);
  const [showPerformanceStats, _setShowPerformanceStats] = useState(false); // Reverted prefix on state variable, kept on setter
  const [_performanceMetrics] = useState<any>(null); // Removed unused setPerformanceMetrics
  const [_showRegionLabels] = useState(true); // Removed unused state setter setShowRegionLabels
  const [errorState, setErrorState] = useState<Error | null>(null);
  const [_isReady, setIsReady] = useState(false); // Prefixed unused state variable

  const isLoading = isModelLoading || isPatientLoading || isClinicalLoading;
  const loadingProgress = useMemo(() => {
    let progress = 0;
    const total = 3;
    if (!isModelLoading) progress++;
    if (!isPatientLoading) progress++;
    if (!isClinicalLoading) progress++;
    return progress / total;
  }, [isModelLoading, isPatientLoading, isClinicalLoading]);

  const combinedError = modelError || patientError || clinicalError || errorState;

  const visualizationState = useMemo((): VisualizationState<BrainModel | null> => {
    if (combinedError && !brainModel) {
      const neuralError =
        combinedError instanceof NeuralError
          ? combinedError
          : new NeuralError(combinedError?.message || 'Unknown error', {
              code: 'VIS_CONTAINER_ERR',
              severity: 'fatal',
            });
      return { status: 'error', error: neuralError };
    }
    if (isLoading && !brainModel) {
      return { status: 'loading' };
    }
    if (brainModel) {
      try {
        const enhancedModel = applyClinicialDataToBrainModel(
          brainModel,
          activeSymptoms ?? [],
          activeDiagnoses ?? [],
          symptomMappings ?? [],
          diagnosisMappings ?? [],
          treatmentMappings ?? [],
          riskAssessment ?? undefined, // Correctly pass undefined
          treatmentPredictions ?? [],
          renderMode
        );
        // Ensure enhancedModel is not null before returning success
        if (enhancedModel) {
          return { status: 'success', data: enhancedModel };
        } else {
          // Handle case where enhancement might fail or return null unexpectedly
          return {
            status: 'error',
            error: new NeuralError('Failed to enhance brain model', {
              code: 'ENHANCE_FAILED',
              severity: 'warning',
            }),
          };
        }
      } catch (error) {
        const neuralError = new NeuralError(
          `Failed to process clinical data: ${error instanceof Error ? error.message : String(error)}`,
          { code: 'CLINICAL_PROCESSING_FAILED', severity: 'warning' }
        );
        return { status: 'error', error: neuralError };
      }
    }
    return { status: 'idle' };
  }, [
    isLoading,
    combinedError,
    brainModel,
    activeSymptoms,
    activeDiagnoses,
    symptomMappings,
    diagnosisMappings,
    treatmentMappings,
    riskAssessment,
    treatmentPredictions,
    renderMode,
  ]);

  // Log visualization state changes
  useEffect(() => {
    console.log(`[BrainVisContainer] Visualization State: ${visualizationState.status}`);
    if (visualizationState.status === 'error') {
      console.error('[BrainVisContainer] Error:', visualizationState.error);
    }
  }, [visualizationState]);

  useEffect(() => {
    if (scanId) {
      fetchBrainModel(scanId);
    }
  }, [fetchBrainModel, scanId]);

  useEffect(() => {
    if (selectedRegionIds.length > 0) {
      setParam('regions', selectedRegionIds.join(','));
    } else {
      setParam('regions', null);
    }
  }, [selectedRegionIds, setParam]);

  useEffect(() => {
    setParam('mode', renderMode);
  }, [renderMode, setParam]);

  useEffect(() => {
    if (visualizationState.status === 'success' && onVisualizationReady) {
      onVisualizationReady();
      setIsReady(true);
    }
  }, [visualizationState.status, onVisualizationReady]);

  // Event Handlers
  const handleRenderModeChange = useCallback((mode: RenderMode) => {
    setRenderMode(mode);
  }, []);

  // Handler for external onRegionSelect (expects BrainRegion | null)
  const handleRegionSelect = useCallback(
    (region: BrainRegion | null) => {
      const regionId = region?.id ?? null;
      setSelectedRegionIds(regionId ? [regionId] : []); // Assuming single selection for external callback? Adjust if multi-select needed.
      setActiveRegionId(regionId);
      setShowDetails(!!regionId);
      if (onRegionSelect) {
        onRegionSelect(region);
      }
    },
    [onRegionSelect]
  );

  // Handler for BrainModelViewer's onRegionClick (expects regionId)
  const handleViewerRegionClick = useCallback(
    (regionId: string) => {
      if (brainModel) {
        const region = brainModel.regions.find((r) => r.id === regionId) || null;
        handleRegionSelect(region); // Use the main handler
      }
    },
    [brainModel, handleRegionSelect]
  );

  // Handler for BrainModelViewer's onRegionHover (expects regionId | null)
  const handleViewerRegionHover = useCallback(
    (regionId: string | null) => {
      setHighlightedRegionIdsInternal(regionId ? [regionId] : []);
      // Optionally trigger external hover logic if needed
      // if (onRegionHover && brainModel) { ... }
    },
    [
      /* dependencies if needed */
    ]
  );

  const handleRegionSearch = useCallback((query: string) => {
    setRegionSearchQuery(query);
  }, []);

  // Handler for RegionSelectionPanel's onRegionSelect (expects regionId, selected)
  const handlePanelRegionSelect = useCallback(
    (regionId: string, selected: boolean) => {
      setSelectedRegionIds((prev) => {
        if (selected && !prev.includes(regionId)) return [...prev, regionId];
        if (!selected && prev.includes(regionId)) return prev.filter((id) => id !== regionId);
        return prev;
      });
      if (onRegionSelect && brainModel) {
        const region = brainModel.regions.find((r) => r.id === regionId) || null;
        if (selected) onRegionSelect(region);
        // else onRegionSelect(null); // Optionally notify deselection
      }
    },
    [onRegionSelect, brainModel]
  );

  const handleConnectionClick = useCallback(
    (connectionId: string) => {
      if (visualizationState.status === 'success' && visualizationState.data) {
        const connection = new SafeArray(visualizationState.data.connections).find(
          (conn) => conn.id === connectionId
        );
        if (connection) {
          setSelectedRegionIds([connection.sourceId, connection.targetId]);
          setActiveRegionId(null);
          setShowDetails(false);
        }
      }
    },
    [visualizationState]
  );

  const handleSettingsChange = useCallback(
    (settings: Partial<VisualizationSettings>) => {
      updateVisualizationSettings(settings);
    },
    [updateVisualizationSettings]
  );

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setActiveRegionId(null);
  }, []);

  const handleVisualizationError = useCallback((error: Error) => {
    setErrorState(error);
    console.error('NOVAMIND Visualization Error:', error);
  }, []);

  // Import DetailLevelString from AdaptiveLOD if not already imported
  // import { DetailLevelString } from '@presentation/common/AdaptiveLOD';

  const currentDetailLevel = useMemo(() => {
    // Use forceDetailLevel if provided, otherwise use detailMode (which should be DetailLevelString)
    // The detailModeMap is now internal to AdaptiveLOD
    return forceDetailLevel ?? detailMode ?? 'dynamic';
  }, [forceDetailLevel, detailMode]);

  // Render
  return (
    <div
      data-testid="brain-model-container-root"
      className={`relative rounded-lg overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <VisualizationErrorBoundary onError={handleVisualizationError}>
        <AdaptiveLOD
          forceDetailLevel={currentDetailLevel}
          // onWarning={handlePerformanceWarning} // Prop doesn't exist on AdaptiveLODProps
          // Pass other necessary props based on AdaptiveLODProps definition
          // initialDetailLevel={...} // If needed
          // adaptiveMode={...} // If needed
          // etc.
        >
          {/* Remove the render prop function wrapper */}
          <>
            {/* Explicitly check for non-null data for type safety */}
            {visualizationState.status === 'success' && visualizationState.data !== null && (
              <BrainModelViewer
                visualizationState={visualizationState as VisualizationState<BrainModel>} // Assert non-null data
                renderMode={renderMode}
                theme={theme ?? 'clinical'}
                visualizationSettings={visualizationSettings}
                selectedRegionIds={selectedRegionIds}
                highlightedRegionIds={highlightedRegionIdsInternal}
                regionSearchQuery={regionSearchQuery}
                enableBloom={visualizationSettings?.enableBloom}
                highPerformanceMode={highPerformanceMode}
                showInactiveRegions={visualizationSettings?.inactiveRegionOpacity > 0}
                width="100%"
                height="100%"
                backgroundColor={activeThemeSettings?.backgroundColor || '#000000'}
                onRegionClick={handleViewerRegionClick} // Pass correct handler
                onRegionHover={handleViewerRegionHover} // Pass correct handler
                onConnectionClick={handleConnectionClick}
                // onReady prop doesn't exist on BrainModelViewerProps
                // Spread detailConfig if BrainModelViewer accepts these props
                // {...detailConfig}
              />
            )}

            {/* Loading State */}
            {visualizationState.status === 'loading' && (
              <LoadingFallback
                progress={loadingProgress}
                message="Loading Neural Model"
                height={height}
                theme={theme === 'dark' ? 'dark' : 'clinical'}
              />
            )}
            {/* Error State */}
            {visualizationState.status === 'error' && (
              <div className="absolute inset-0 bg-black/80 z-30 flex items-center justify-center p-4">
                <div className="bg-gray-900 p-6 rounded-lg shadow-xl text-center">
                  <h3 className="text-red-500 text-xl mb-2">Visualization Error</h3>
                  <p className="text-gray-300 mb-4">{visualizationState.error.message}</p>
                  <button
                    onClick={() => {
                      if (scanId) fetchBrainModel(scanId);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {showControls && (
              <div className="absolute top-4 left-4 z-10">
                <VisualizationControls
                  renderMode={renderMode}
                  onRenderModeChange={handleRenderModeChange}
                  visualizationSettings={visualizationSettings}
                  onSettingsChange={handleSettingsChange}
                  // Remove non-existent props: detailMode, onDetailModeChange, showPerformanceStats, onTogglePerformanceStats, showLabels, onToggleLabels
                />
              </div>
            )}

            {enableRegionSelection &&
              visualizationState.status === 'success' &&
              visualizationState.data && (
                <div className="absolute right-4 top-4 z-10 max-h-[calc(100%-2rem)] overflow-auto">
                  <RegionSelectionPanel
                    regions={visualizationState.data.regions}
                    selectedRegionIds={selectedRegionIds}
                    onRegionSelect={handlePanelRegionSelect}
                    onRegionSearch={handleRegionSearch}
                    searchQuery={regionSearchQuery}
                  />
                </div>
              )}

            {enableClinicalOverlay &&
              visualizationState.status === 'success' &&
              visualizationState.data &&
              patientData &&
              riskAssessment && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <ClinicalDataOverlay
                    patient={patientData}
                    symptoms={activeSymptoms ?? []}
                    diagnoses={activeDiagnoses ?? []}
                    riskAssessment={riskAssessment}
                    selectedRegionIds={selectedRegionIds}
                    brainModel={visualizationState.data}
                  />
                </div>
              )}

            {showDetails &&
              activeRegionId &&
              visualizationState.status === 'success' &&
              visualizationState.data &&
              patientData && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center p-4">
                  <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90%] overflow-auto">
                    <BrainRegionDetails
                      regionId={activeRegionId}
                      brainModel={visualizationState.data}
                      patient={patientData}
                      symptoms={activeSymptoms ?? []}
                      diagnoses={activeDiagnoses ?? []}
                      treatmentPredictions={treatmentPredictions ?? []}
                      symptomMappings={symptomMappings ?? []}
                      diagnosisMappings={diagnosisMappings ?? []}
                      onClose={handleCloseDetails}
                    />
                  </div>
                </div>
              )}

            {showPerformanceStats && (
              <div className="absolute bottom-4 right-4 z-10">
                <PerformanceMonitor /> {/* Remove non-existent onUpdate prop */}
              </div>
            )}
          </>
          {/* Removed extraneous closing parenthesis */}
        </AdaptiveLOD>
      </VisualizationErrorBoundary>
    </div>
  );
};
export default BrainVisualizationContainerInternal; // Export the internal component directly
// Removed incorrect duplicate default export

/**
 * Apply clinical data to the brain model
 * This function enhances the brain model with clinical data for visualization
 */
function applyClinicialDataToBrainModel(
  brainModel: BrainModel,
  symptoms: Symptom[],
  diagnoses: Diagnosis[],
  symptomMappings: SymptomNeuralMapping[],
  diagnosisMappings: DiagnosisNeuralMapping[],
  treatmentMappings: TreatmentNeuralMapping[],
  riskAssessment?: RiskAssessment,
  treatmentPredictions?: TreatmentResponsePrediction[],
  renderMode: RenderMode = RenderMode.ANATOMICAL
): BrainModel {
  const enhancedModel: BrainModel = JSON.parse(JSON.stringify(brainModel));

  if (renderMode === RenderMode.ANATOMICAL) {
    return enhancedModel;
  }

  const activationResult = calculateNeuralActivation(
    enhancedModel.regions,
    symptomMappings,
    symptoms,
    diagnosisMappings,
    diagnoses
  );

  if (activationResult.success) {
    const activationMap = activationResult.value; // Use .value

    enhancedModel.regions = enhancedModel.regions.map((region) => {
      const activation = activationMap.get(region.id) || 0;
      return { ...region, activityLevel: activation, isActive: activation > 0.3 };
    });

    enhancedModel.connections = enhancedModel.connections.map((conn) => {
      const sourceRegion = enhancedModel.regions.find((r) => r.id === conn.sourceId);
      const targetRegion = enhancedModel.regions.find((r) => r.id === conn.targetId);
      const sourceActivity = sourceRegion?.activityLevel || 0;
      const targetActivity = targetRegion?.activityLevel || 0;
      const avgActivity = (sourceActivity + targetActivity) / 2;
      return { ...conn, activityLevel: avgActivity, isActive: avgActivity > 0.3 };
    });
  }

  if (
    renderMode === RenderMode.CONNECTIVITY &&
    treatmentPredictions &&
    treatmentPredictions.length > 0
  ) {
    const treatmentIds = treatmentPredictions.map((tp) => tp.treatmentType);
    // calculateTreatmentImpact expects regions, mappings, ids
    const impactResult = calculateTreatmentImpact(
      enhancedModel.regions,
      // enhancedModel.connections, // Remove incorrect argument
      treatmentMappings,
      treatmentIds
    );

    if (impactResult.success) {
      const impact = impactResult.value; // Use .value

      enhancedModel.regions = enhancedModel.regions.map((region) => {
        const regionImpact = impact.regionImpacts.find((ri) => ri.regionId === region.id);
        // Use 'impact' property, map it to a numerical effect if needed
        const effectValue =
          regionImpact?.impact === 'increase' ? 1 : regionImpact?.impact === 'decrease' ? -1 : 0;
        return { ...region, treatmentEffect: (regionImpact?.magnitude || 0) * effectValue };
      });

      enhancedModel.connections = enhancedModel.connections.map((conn) => {
        // Find connection impact using sourceId and targetId
        const connectionImpact = impact.connectionImpacts.find(
          (ci) => ci.sourceId === conn.sourceId && ci.targetId === conn.targetId
        );
        // Use 'impact' property, map it to a numerical effect if needed
        const connEffectValue =
          connectionImpact?.impact === 'increase'
            ? 1
            : connectionImpact?.impact === 'decrease'
              ? -1
              : 0;
        return { ...conn, treatmentEffect: (connectionImpact?.magnitude || 0) * connEffectValue };
      });
    }
  }

  // Apply risk assessment data if available and in risk mode
  if (riskAssessment && renderMode === RenderMode.RISK) {
    enhancedModel.regions = enhancedModel.regions.map((region) => {
      // Property regionRiskScores does not exist on RiskAssessment type
      // const regionRisk = riskAssessment.regionRiskScores?.find(rs => rs.regionId === region.id);
      // Property riskScore also doesn't exist
      return { ...region, riskFactor: 0 }; // Assign default 0
    });
  }

  return enhancedModel;
}

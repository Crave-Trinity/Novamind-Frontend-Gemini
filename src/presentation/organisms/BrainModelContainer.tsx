/**
 * NOVAMIND Neural Visualization
 * BrainModelContainer - Clinical container with quantum-level integration
 * between domain logic and presentation components
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
// Removed unused useQuery import

// Domain types
import type { BrainModel } from '@domain/types/brain/models';
// Removed unused import: import { BrainRegion } from '@domain/types/brain/models';
import type { VisualizationSettings } from '@domain/types/brain/visualization';
import { RenderMode } from '@domain/types/brain/visualization';
import type { VisualizationState } from '@domain/types/shared/common';
import {
  SafeArray,
  // Removed unused Result, success, failure
  NeuralError, // Import NeuralError
} from '@domain/types/shared/common';
import type { Diagnosis, Symptom } from '@domain/types/clinical/patient';
// Removed unused import: import { Patient } from '@domain/types/clinical/patient';
import type { TreatmentResponsePrediction } from '@domain/types/clinical/treatment';
import type { RiskAssessment } from '@domain/types/clinical/risk';

// Domain models
import type {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
  TreatmentNeuralMapping,
} from '@domain/models/brain/mapping/brain-mapping';
import {
  calculateNeuralActivation,
  calculateTreatmentImpact, // Re-added import
} from '@domain/models/brain/mapping/brain-mapping'; // Correct path

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
import LoadingIndicator from '@presentation/atoms/LoadingIndicator'; // Correct component name and path
// import ErrorMessage from "@presentation/atoms/ErrorMessage"; // Component doesn't exist

// Define neural-safe prop interface
interface BrainModelContainerProps {
  patientId?: string;
  scanId?: string;
  initialRenderMode?: RenderMode;
  initialSelectedRegions?: string[];
  showControls?: boolean;
  height?: string | number;
  width?: string | number;
  enableClinicalOverlay?: boolean;
  enableRegionSelection?: boolean;
  highPerformanceMode?: boolean;
  onRegionSelect?: (regionId: string) => void;
  onVisualizationReady?: () => void;
  className?: string;
}

/**
 * BrainModelContainer - Container component for brain visualization
 * Handles data fetching, state management, and clinical integration
 */
const BrainModelContainer: React.FC<BrainModelContainerProps> = ({
  patientId,
  scanId,
  initialRenderMode = RenderMode.ANATOMICAL,
  initialSelectedRegions = [],
  showControls = true,
  height = '600px',
  width = '100%',
  enableClinicalOverlay = true,
  enableRegionSelection = true,
  highPerformanceMode = false,
  onRegionSelect,
  onVisualizationReady,
  className = '',
}) => {
  // Theme context
  const { theme } = useTheme();

  // Application state hooks
  const {
    brainModel,
    isLoading: isModelLoading,
    error: modelError,
    fetchBrainModel,
  } = useBrainModel();

  const {
    patient,
    symptoms,
    diagnoses,
    isLoading: isPatientLoading,
    error: _patientError, // Prefixed unused variable
  } = usePatientData(patientId);

  const {
    symptomMappings,
    diagnosisMappings,
    treatmentMappings,
    riskAssessment,
    treatmentPredictions,
    isLoading: isClinicalLoading,
  } = useClinicalContext(patientId);

  const { visualizationSettings, updateVisualizationSettings } = useVisualSettings();

  // Extract and apply URL search parameters
  const { getParam, setParam } = useSearchParams();

  // Local component state with type safety
  const [renderMode, setRenderMode] = useState<RenderMode>(
    (getParam('mode') as RenderMode) || initialRenderMode
  );

  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>(
    getParam('regions')?.split(',') ?? initialSelectedRegions // Add null safety
  );

  const [highlightedRegionIds, setHighlightedRegionIds] = useState<string[]>([]);
  const [regionSearchQuery, setRegionSearchQuery] = useState<string>('');
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [showRegionDetails, setShowRegionDetails] = useState<boolean>(false);

  // Calculate the visualization state
  const visualizationState: VisualizationState<BrainModel> = useMemo(() => {
    if (isModelLoading || isPatientLoading || isClinicalLoading) {
      return { status: 'loading' };
    }

    if (modelError) {
      // Construct NeuralError (assuming structure)
      return {
        status: 'error',
        error: new NeuralError(modelError.message, {
          code: 'MODEL_FETCH_FAILED',
          severity: 'fatal',
        }),
      }; // Use 'fatal'
    }

    if (!brainModel) {
      return { status: 'idle' };
    }

    // Apply clinical data to the brain model
    try {
      const enhancedModel = applyClinicialDataToBrainModel(
        brainModel,
        symptoms,
        diagnoses,
        symptomMappings,
        diagnosisMappings,
        treatmentMappings,
        riskAssessment ?? undefined,
        treatmentPredictions,
        renderMode
      );

      return { status: 'success', data: enhancedModel };
    } catch (error) {
      return {
        status: 'error',
        // Construct NeuralError (assuming structure)
        error: new NeuralError(
          `Failed to process clinical data: ${error instanceof Error ? error.message : String(error)}`,
          { code: 'CLINICAL_PROCESSING_FAILED', severity: 'warning' }
        ),
      };
    }
  }, [
    brainModel,
    isModelLoading,
    isPatientLoading,
    isClinicalLoading,
    modelError,
    symptoms,
    diagnoses,
    symptomMappings,
    diagnosisMappings,
    treatmentMappings,
    riskAssessment,
    treatmentPredictions,
    renderMode,
  ]);

  // Fetch data on component mount
  useEffect(() => {
    if (scanId) {
      fetchBrainModel(scanId);
    }
  }, [fetchBrainModel, scanId]);

  // Update URL params when selection changes
  useEffect(() => {
    if (selectedRegionIds.length > 0) {
      setParam('regions', selectedRegionIds.join(','));
    } else {
      setParam('regions', null); // Remove param if empty
    }
  }, [selectedRegionIds, setParam]);

  useEffect(() => {
    setParam('mode', renderMode);
  }, [renderMode, setParam]);

  // Notify parent when visualization is ready
  useEffect(() => {
    if (visualizationState.status === 'success' && onVisualizationReady) {
      onVisualizationReady();
    }
  }, [visualizationState.status, onVisualizationReady]);

  // Event handlers
  const handleRenderModeChange = useCallback((mode: RenderMode) => {
    setRenderMode(mode);
  }, []);

  const handleRegionClick = useCallback(
    (regionId: string) => {
      setSelectedRegionIds((prev) => {
        // Toggle selection
        return prev.includes(regionId) ? prev.filter((id) => id !== regionId) : [...prev, regionId];
      });

      setActiveRegionId(regionId);
      setShowRegionDetails(true);

      if (onRegionSelect) {
        onRegionSelect(regionId);
      }
    },
    [onRegionSelect]
  );

  const handleRegionHover = useCallback((regionId: string | null) => {
    if (regionId) {
      setHighlightedRegionIds([regionId]);
    } else {
      setHighlightedRegionIds([]);
    }
  }, []);

  const handleRegionSearch = useCallback((query: string) => {
    setRegionSearchQuery(query);
  }, []);

  const handleRegionSelect = useCallback(
    (regionId: string, selected: boolean) => {
      setSelectedRegionIds((prev) => {
        if (selected && !prev.includes(regionId)) {
          return [...prev, regionId];
        } else if (!selected && prev.includes(regionId)) {
          return prev.filter((id) => id !== regionId);
        }
        return prev;
      });

      if (selected && onRegionSelect) {
        onRegionSelect(regionId);
      }
    },
    [onRegionSelect]
  );

  const handleConnectionClick = useCallback(
    (connectionId: string) => {
      // If we have a successful visualization state, find the connection
      if (visualizationState.status === 'success') {
        const connection = new SafeArray(visualizationState.data.connections).find(
          (conn) => conn.id === connectionId
        );

        if (connection) {
          // Select both connected regions
          setSelectedRegionIds([connection.sourceId, connection.targetId]);
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
    setShowRegionDetails(false);
  }, []);

  // Render the visualization container
  return (
    <div
      data-testid="brain-model-container-root"
      className={`relative rounded-lg overflow-hidden ${className}`}
      style={{
        width,
        height,
      }}
    >
      {/* Main brain visualization */}
      <BrainModelViewer
        visualizationState={visualizationState}
        renderMode={renderMode}
        theme={theme ?? 'clinical'} // Provide default theme if undefined
        visualizationSettings={visualizationSettings}
        selectedRegionIds={selectedRegionIds}
        highlightedRegionIds={highlightedRegionIds}
        regionSearchQuery={regionSearchQuery}
        enableBloom={visualizationSettings?.enableBloom}
        // enableDepthOfField={visualizationSettings?.enableDepthOfField} // Property doesn't exist
        highPerformanceMode={highPerformanceMode}
        // activityThreshold={visualizationSettings?.activityThreshold || 0.2} // Property doesn't exist
        showInactiveRegions={
          // Use inactiveRegionOpacity to determine visibility
          visualizationSettings?.inactiveRegionOpacity > 0
        }
        width="100%"
        height="100%"
        backgroundColor={visualizationSettings?.backgroundColor || '#000000'}
        onRegionClick={handleRegionClick}
        onRegionHover={handleRegionHover}
        onConnectionClick={handleConnectionClick}
      />

      {/* Visualization controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10">
          <VisualizationControls
            renderMode={renderMode}
            onRenderModeChange={handleRenderModeChange}
            visualizationSettings={visualizationSettings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      )}

      {/* Region selection panel */}
      {enableRegionSelection && visualizationState.status === 'success' && (
        <div className="absolute right-4 top-4 z-10 max-h-[calc(100%-2rem)] overflow-auto">
          <RegionSelectionPanel
            regions={visualizationState.data.regions}
            selectedRegionIds={selectedRegionIds}
            onRegionSelect={handleRegionSelect}
            onRegionSearch={handleRegionSearch}
            searchQuery={regionSearchQuery}
          />
        </div>
      )}

      {/* Clinical data overlay */}
      {enableClinicalOverlay && visualizationState.status === 'success' && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <ClinicalDataOverlay
            patient={patient!}
            symptoms={symptoms}
            diagnoses={diagnoses}
            riskAssessment={riskAssessment!}
            selectedRegionIds={selectedRegionIds}
            brainModel={visualizationState.data}
          />
        </div>
      )}

      {/* Region details panel */}
      {showRegionDetails && activeRegionId && visualizationState.status === 'success' && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90%] overflow-auto">
            <BrainRegionDetails
              regionId={activeRegionId}
              brainModel={visualizationState.data}
              patient={patient!} // Non-null assertion
              symptoms={symptoms}
              diagnoses={diagnoses}
              treatmentPredictions={treatmentPredictions}
              symptomMappings={symptomMappings}
              diagnosisMappings={diagnosisMappings}
              onClose={handleCloseDetails}
            />
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {(isModelLoading || isPatientLoading || isClinicalLoading) && (
        <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
          <LoadingIndicator text="Loading neural architecture..." />
        </div>
      )}

      {/* Error state */}
      {visualizationState.status === 'error' && (
        <div className="absolute inset-0 bg-black/80 z-30 flex items-center justify-center">
          {/* ErrorMessage usage commented out as component doesn't exist */}
          {/* <ErrorMessage
            error={visualizationState.error}
            title="Visualization Error"
            onRetry={() => {
              if (scanId) fetchBrainModel(scanId);
            }}
          /> */}
        </div>
      )}
    </div>
  );
};

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
  _riskAssessment?: RiskAssessment, // Prefixed unused parameter
  treatmentPredictions?: TreatmentResponsePrediction[],
  renderMode: RenderMode = RenderMode.ANATOMICAL
): BrainModel {
  // Create a deep copy of the brain model to avoid mutation
  const enhancedModel: BrainModel = JSON.parse(JSON.stringify(brainModel));

  // For anatomical view, just return the model as is
  if (renderMode === RenderMode.ANATOMICAL) {
    return enhancedModel;
  }

  // Calculate neural activation based on clinical data
  const activationResult = calculateNeuralActivation(
    enhancedModel.regions,
    symptomMappings,
    symptoms,
    diagnosisMappings,
    diagnoses
  );

  if (activationResult.success) {
    const activationMap = activationResult.value; // Use .value

    // Apply activation to regions
    enhancedModel.regions = enhancedModel.regions.map((region) => {
      const activation = activationMap.get(region.id) || 0;
      return {
        ...region,
        activityLevel: activation,
        isActive: activation > 0.3,
      };
    });

    // Calculate connection activity based on connected regions
    enhancedModel.connections = enhancedModel.connections.map((conn) => {
      // Find connected regions
      const sourceRegion = enhancedModel.regions.find((r) => r.id === conn.sourceId);
      const targetRegion = enhancedModel.regions.find((r) => r.id === conn.targetId);

      // Calculate connection activity as average of connected regions
      const sourceActivity = sourceRegion?.activityLevel || 0;
      const targetActivity = targetRegion?.activityLevel || 0;
      const avgActivity = (sourceActivity + targetActivity) / 2;

      return {
        ...conn,
        activityLevel: avgActivity,
        isActive: avgActivity > 0.3,
      };
    });
  }

  // Apply treatment impact if available and in connectivity mode
  if (
    renderMode === RenderMode.CONNECTIVITY &&
    treatmentPredictions &&
    treatmentPredictions.length > 0
  ) {
    // Extract treatment IDs from predictions
    const treatmentIds = treatmentPredictions.map((tp) => tp.treatmentType);

    // Calculate impact
    const impactResult = calculateTreatmentImpact(
      enhancedModel.regions,
      treatmentMappings,
      treatmentIds
    );

    if (impactResult.success) {
      const impact = impactResult.value;

      // Apply region impacts
      enhancedModel.regions = enhancedModel.regions.map((region) => {
        const regionImpact = impact.regionImpacts.find(
          (ri: { regionId: string; impact: string; magnitude: number; confidence: number }) =>
            ri.regionId === region.id
        );

        if (!regionImpact) return region;

        // Modify region based on impact type
        const updatedRegion = { ...region };

        if (regionImpact.impact === 'increase') {
          updatedRegion.activityLevel = Math.min(
            1,
            region.activityLevel + regionImpact.magnitude * 0.5
          );
          updatedRegion.isActive = true;
        } else if (regionImpact.impact === 'decrease') {
          updatedRegion.activityLevel = Math.max(
            0,
            region.activityLevel - regionImpact.magnitude * 0.5
          );
          updatedRegion.isActive = updatedRegion.activityLevel > 0.3;
        }

        return updatedRegion;
      });

      // Apply connection impacts
      enhancedModel.connections = enhancedModel.connections.map((conn) => {
        const connectionImpact = impact.connectionImpacts.find(
          (ci: {
            sourceId: string;
            targetId: string;
            impact: string;
            magnitude: number;
            confidence: number;
          }) => ci.sourceId === conn.sourceId && ci.targetId === conn.targetId
        );

        if (!connectionImpact) return conn;

        // Modify connection based on impact type
        const updatedConn = { ...conn };

        if (connectionImpact.impact === 'increase') {
          updatedConn.strength = Math.min(1, conn.strength + connectionImpact.magnitude * 0.5);
        } else if (connectionImpact.impact === 'decrease') {
          updatedConn.strength = Math.max(0, conn.strength - connectionImpact.magnitude * 0.5);
        } else if (connectionImpact.impact === 'normalize') {
          // Normalize means move toward 0.5 strength
          if (conn.strength > 0.5) {
            updatedConn.strength = Math.max(0.5, conn.strength - connectionImpact.magnitude * 0.5);
          } else {
            updatedConn.strength = Math.min(0.5, conn.strength + connectionImpact.magnitude * 0.5);
          }
        }

        return updatedConn;
      });
    }
  }

  return enhancedModel;
}

export default BrainModelContainer;

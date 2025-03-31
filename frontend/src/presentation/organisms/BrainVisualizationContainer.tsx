/**
 * NOVAMIND Neural-Safe Organism Component
 * BrainVisualizationContainer - Quantum-level container for brain visualization
 * with neuropsychiatric integration and clinical precision
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

// Domain types
import { DetailLevel } from '@domain/types/brain/visualization';
import { BrainModel, BrainRegion, NeuralConnection } from '@domain/types/brain/models';
import { ActivationLevel } from '@domain/types/brain/activity';

// Application hooks
import { useBrainModel } from '@application/hooks/useBrainModel';
import { usePatientData } from '@application/hooks/usePatientData';
import { useClinicalContext } from '@application/hooks/useClinicalContext';
import { useVisualSettings } from '@application/hooks/useVisualSettings';
import { useSearchParams } from '@application/hooks/useSearchParams';

// Presentation components
import BrainModelViewer from '@presentation/organisms/BrainModelViewer';
import BrainRegionDetails from '@presentation/molecules/BrainRegionDetails';
import RegionSelectionPanel from '@presentation/molecules/RegionSelectionPanel';
import VisualizationControls from '@presentation/molecules/VisualizationControls';
import ClinicalDataOverlay from '@presentation/molecules/ClinicalDataOverlay';
import BrainRegionLabels from '@presentation/molecules/BrainRegionLabels';

// Common components
import AdaptiveLOD from '@presentation/common/AdaptiveLOD';
import PerformanceMonitor from '@presentation/common/PerformanceMonitor';
import VisualizationErrorBoundary from '@presentation/common/VisualizationErrorBoundary';
import LoadingFallback from '@presentation/common/LoadingFallback';

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
}

/**
 * Selectable detail modes for visualization
 */
export enum DetailMode {
  PERFORMANCE = 'performance',
  BALANCED = 'balanced',
  QUALITY = 'quality',
  CLINICAL = 'clinical',
  AUTO = 'auto'
}

/**
 * Map detail modes to detail levels
 */
const detailModeMap: Record<DetailMode, DetailLevel> = {
  [DetailMode.PERFORMANCE]: DetailLevel.LOW,
  [DetailMode.BALANCED]: DetailLevel.MEDIUM,
  [DetailMode.QUALITY]: DetailLevel.HIGH,
  [DetailMode.CLINICAL]: DetailLevel.ULTRA,
  [DetailMode.AUTO]: DetailLevel.HIGH // Initial level for auto mode
};

/**
 * BrainVisualizationContainer - Organism component for brain visualization
 * Implements neural-safe integration of visualization components with application state
 */
export const BrainVisualizationContainer: React.FC<BrainVisualizationContainerProps> = ({
  scanId,
  patientId,
  initialSelectedRegionId,
  readOnly = false,
  showClinicalData = true,
  showControls = true,
  height = '100%',
  width = '100%',
  onRegionSelect,
  onVisualizationReady,
  className = ''
}) => {
  // Router for navigation
  const router = useRouter();
  
  // URL parameter management
  const { getParam, setParam, serializeState } = useSearchParams();
  
  // Application hooks
  const { 
    brainModel, 
    isLoading: isModelLoading, 
    error: modelError,
    selectedRegionId,
    selectRegion,
    highlightConnections,
    setRegionActivity,
    resetRegionActivity
  } = useBrainModel(scanId);
  
  const {
    patientData,
    isLoading: isPatientLoading,
    error: patientError,
    activeSymptoms,
    activeDiagnoses
  } = usePatientData(patientId);
  
  const {
    symptomMappings,
    diagnosisMappings,
    riskAssessment,
    treatmentPredictions,
    isLoading: isClinicalLoading,
    error: clinicalError
  } = useClinicalContext(patientId);
  
  const {
    visualizationSettings,
    updateVisualizationSettings,
    getThemeSettings
  } = useVisualSettings();
  
  // Local state
  const [isReady, setIsReady] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailMode, setDetailMode] = useState<DetailMode>(DetailMode.AUTO);
  const [forceDetailLevel, setForceDetailLevel] = useState<DetailLevel | undefined>(undefined);
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [showRegionLabels, setShowRegionLabels] = useState(true);
  const [errorState, setErrorState] = useState<Error | null>(null);
  
  // Loading state
  const isLoading = isModelLoading || isPatientLoading || isClinicalLoading;
  const loadingProgress = useMemo(() => {
    // Calculate loading progress based on various data sources
    let progress = 0;
    let total = 3; // Model, patient, clinical
    
    if (!isModelLoading) progress++;
    if (!isPatientLoading) progress++;
    if (!isClinicalLoading) progress++;
    
    return progress / total;
  }, [isModelLoading, isPatientLoading, isClinicalLoading]);
  
  // Error handling
  const error = modelError || patientError || clinicalError || errorState;
  
  // Initialize from URL params
  useEffect(() => {
    // Check for region selection in URL
    const regionParam = getParam('region');
    if (regionParam && brainModel && !selectedRegionId) {
      selectRegion(regionParam);
    }
    
    // Check for detail mode in URL
    const detailParam = getParam('detail') as DetailMode | null;
    if (detailParam && Object.values(DetailMode).includes(detailParam)) {
      setDetailMode(detailParam);
      
      if (detailParam !== DetailMode.AUTO) {
        setForceDetailLevel(detailModeMap[detailParam]);
      } else {
        setForceDetailLevel(undefined);
      }
    }
    
    // Check for performance stats toggle
    const statsParam = getParam('stats');
    if (statsParam === 'true') {
      setShowPerformanceStats(true);
    }
    
    // Check for labels toggle
    const labelsParam = getParam('labels');
    if (labelsParam === 'false') {
      setShowRegionLabels(false);
    }
  }, [brainModel, getParam, selectRegion, selectedRegionId]);
  
  // Update URL when selection changes
  useEffect(() => {
    if (selectedRegionId) {
      setParam('region', selectedRegionId);
      setShowDetails(true);
    } else {
      setParam('region', null);
      setShowDetails(false);
    }
  }, [selectedRegionId, setParam]);
  
  // Handle initial region selection
  useEffect(() => {
    if (initialSelectedRegionId && brainModel && !selectedRegionId) {
      selectRegion(initialSelectedRegionId);
    }
  }, [initialSelectedRegionId, brainModel, selectRegion, selectedRegionId]);
  
  // Selected region data
  const selectedRegion = useMemo(() => {
    if (!brainModel || !selectedRegionId) return null;
    return brainModel.regions.find(r => r.id === selectedRegionId) || null;
  }, [brainModel, selectedRegionId]);
  
  // Handle region selection
  const handleRegionSelect = useCallback((regionId: string | null) => {
    selectRegion(regionId);
    
    // If external handler provided, call with region data
    if (onRegionSelect && brainModel) {
      const region = regionId ? brainModel.regions.find(r => r.id === regionId) || null : null;
      onRegionSelect(region);
    }
  }, [selectRegion, onRegionSelect, brainModel]);
  
  // Handle detail mode change
  const handleDetailModeChange = useCallback((mode: DetailMode) => {
    setDetailMode(mode);
    setParam('detail', mode);
    
    if (mode !== DetailMode.AUTO) {
      setForceDetailLevel(detailModeMap[mode]);
    } else {
      setForceDetailLevel(undefined);
    }
  }, [setParam]);
  
  // Handle performance metrics update
  const handlePerformanceUpdate = useCallback((metrics: any) => {
    setPerformanceMetrics(metrics);
  }, []);
  
  // Handle performance warning
  const handlePerformanceWarning = useCallback((metrics: any, level: 'warning' | 'critical') => {
    if (level === 'critical' && detailMode === DetailMode.AUTO) {
      // Auto-switch to performance mode
      setForceDetailLevel(DetailLevel.LOW);
    }
  }, [detailMode]);
  
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
    console.error('NOVAMIND Visualization Error:', error);
  }, []);
  
  // Handle recovery from error
  const handleErrorRecovery = useCallback(() => {
    setErrorState(null);
    
    // Switch to performance mode for better recovery chances
    setDetailMode(DetailMode.PERFORMANCE);
    setForceDetailLevel(DetailLevel.LOW);
    
    return { success: true, data: true };
  }, []);
  
  // Device performance class detection
  const devicePerformanceClass = useMemo(() => {
    // Simple performance class detection based on navigator info
    // This would be more sophisticated in a real implementation
    
    if (typeof window === 'undefined') return 'medium';
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Check for mobile devices which typically have lower performance
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'low';
    }
    
    // Check for modern GPU support using feature detection
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      return 'low'; // No WebGL support
    }
    
    // Get WebGL info to estimate performance
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      
      // Check for high-end GPUs
      if (/nvidia|rtx|gtx|radeon rx|quadro/i.test(renderer)) {
        return 'high';
      }
      
      // Check for integrated graphics
      if (/intel|hd graphics|iris|uhd/i.test(renderer)) {
        return 'medium';
      }
    }
    
    // Default to medium for unknown configurations
    return 'medium';
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
  if (error && !brainModel) {
    return (
      <div
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '1rem',
          borderRadius: '0.5rem'
        }}
      >
        <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>
          Visualization Error
        </h3>
        <p style={{ marginBottom: '1rem', maxWidth: '400px', textAlign: 'center' }}>
          Failed to load neural model visualization. Please try again or contact support.
        </p>
        <pre style={{ 
          margin: '0.5rem 0', 
          padding: '0.5rem', 
          backgroundColor: 'rgba(0, 0, 0, 0.3)', 
          borderRadius: '0.25rem',
          fontSize: '0.8rem',
          maxWidth: '100%',
          overflow: 'auto',
          color: '#94a3b8'
        }}>
          {error.message}
        </pre>
        <button
          onClick={() => router.reload()}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            marginTop: '1rem'
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
        position: 'relative',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'hidden',
        borderRadius: '0.5rem',
        backgroundColor: '#0f172a'
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
          initialDetailLevel={DetailLevel.MEDIUM}
          forceDetailLevel={forceDetailLevel}
          adaptiveMode={detailMode === DetailMode.AUTO ? 'hybrid' : 'manual'}
          devicePerformanceClass={devicePerformanceClass}
          regionCount={brainModel?.regions.length || 0}
        >
          {(detailConfig) => (
            <>
              {/* Brain Visualization */}
              {brainModel && (
                <BrainModelViewer
                  brainModel={brainModel}
                  selectedRegionId={selectedRegionId}
                  onRegionSelect={handleRegionSelect}
                  onReady={handleVisualizationReady}
                  settings={{
                    ...visualizationSettings,
                    segmentDetail: detailConfig.segmentDetail,
                    useInstancedMesh: detailConfig.useInstancedMesh,
                    useShaderEffects: detailConfig.useShaderEffects,
                    usePostProcessing: detailConfig.usePostProcessing,
                    useShadows: detailConfig.useShadows,
                    useBloom: detailConfig.useBloom,
                    drawDistance: detailConfig.drawDistance,
                    maxVisibleRegions: detailConfig.maxVisibleRegions,
                    maxVisibleConnections: detailConfig.connectionsVisible
                  }}
                  symptomMappings={symptomMappings}
                  diagnosisMappings={diagnosisMappings}
                  activeSymptoms={activeSymptoms}
                  activeDiagnoses={activeDiagnoses}
                  showLabels={showRegionLabels && detailConfig.showLabels}
                  labelDensity={detailConfig.labelDensity}
                />
              )}
              
              {/* Region Labels */}
              {brainModel && showRegionLabels && detailConfig.showLabels && (
                <BrainRegionLabels
                  regions={brainModel.regions}
                  selectedRegionId={selectedRegionId}
                  density={detailConfig.labelDensity}
                  symptomMappings={symptomMappings}
                  activeSymptoms={activeSymptoms}
                />
              )}
              
              {/* Clinical Data Overlay */}
              {showClinicalData && patientData && riskAssessment && (
                <ClinicalDataOverlay
                  patientData={patientData}
                  riskAssessment={riskAssessment}
                  treatmentPredictions={treatmentPredictions}
                  selectedRegion={selectedRegion}
                  position="top-left"
                />
              )}
              
              {/* Visualization Controls */}
              {showControls && (
                <VisualizationControls
                  settings={visualizationSettings}
                  onSettingsChange={updateVisualizationSettings}
                  detailMode={detailMode}
                  onDetailModeChange={handleDetailModeChange}
                  showPerformanceStats={showPerformanceStats}
                  onTogglePerformanceStats={() => setShowPerformanceStats(!showPerformanceStats)}
                  showLabels={showRegionLabels}
                  onToggleLabels={() => setShowRegionLabels(!showRegionLabels)}
                  position="bottom-right"
                />
              )}
              
              {/* Region Details Panel */}
              {selectedRegion && showDetails && (
                <BrainRegionDetails
                  region={selectedRegion}
                  connections={brainModel?.connections.filter(
                    c => c.sourceId === selectedRegion.id || c.targetId === selectedRegion.id
                  ) || []}
                  symptomMappings={symptomMappings}
                  diagnosisMappings={diagnosisMappings}
                  onClose={() => handleRegionSelect(null)}
                  position="right"
                  width={320}
                />
              )}
              
              {/* Region Selection Panel */}
              {brainModel && !selectedRegion && (
                <RegionSelectionPanel
                  regions={brainModel.regions}
                  onRegionSelect={handleRegionSelect}
                  position="left"
                  width={250}
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

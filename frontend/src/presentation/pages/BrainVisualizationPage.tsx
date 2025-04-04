import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auditLogService, AuditEventType } from "@infrastructure/services/AuditLogService";
import LoadingIndicator from "@presentation/atoms/LoadingIndicator";

// Lazy-loaded components for code splitting and better performance
const BrainModelContainer = React.lazy(() => import("@presentation/organisms/BrainModelContainer"));
const BrainVisualizationControls = React.lazy(() => import("@presentation/molecules/BrainVisualizationControls"));

interface DatasetType {
  id: string;
  type: "fMRI" | "EEG" | "DTI" | "MEG";
  date: string;
  patientId: string;
  regions?: {
    id: string;
    name: string;
    activity: number;
    connections: string[];
  }[];
  isProcessing?: boolean;
}

/**
 * Brain Visualization Page
 * 
 * Presents a 3D visualization of neural activity based on patient data.
 * Implements progressive loading, optimized rendering, and HIPAA-compliant
 * audit logging for all access to patient brain data.
 */
const BrainVisualizationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State for brain visualization data and UI
  const [dataset, setDataset] = useState<DatasetType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"normal" | "activity" | "connections">("normal");
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  
  // Fetch brain data
  useEffect(() => {
    const fetchBrainData = async () => {
      if (!id) {
        setError("Patient ID is required");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Log this access for HIPAA compliance
        auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
          action: "view_brain_visualization",
          resourceId: id,
          resourceType: "patient_brain_data",
          details: "Accessed brain visualization model",
          result: "success",
        });
        
        // In a real app, fetch from API
        // Simulating API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Mock brain dataset based on ID (in production, this would be from an API)
        // This is simplified for demo purposes
        const mockDataset: DatasetType = {
          id: `brain-${id}-${Date.now()}`,
          type: "fMRI",
          date: new Date().toISOString().split('T')[0],
          patientId: id,
          regions: Array.from({ length: 24 }, (_, i) => ({
            id: `region-${i + 1}`,
            name: `Brain Region ${i + 1}`,
            activity: Math.random() * 2 - 0.5, // Range from -0.5 to 1.5
            connections: Array.from(
              { length: Math.floor(Math.random() * 5) + 1 },
              () => `region-${Math.floor(Math.random() * 24) + 1}`
            )
          }))
        };
        
        setDataset(mockDataset);
        // Set initially active regions to those with high activity
        setActiveRegions(
          mockDataset.regions
            ?.filter(region => region.activity > 0.8)
            .map(region => region.id) || []
        );
        
        setLoading(false);
      } catch (err) {
        // Log error for HIPAA compliance
        auditLogService.log(AuditEventType.SYSTEM_ERROR, {
          action: "brain_data_fetch_error",
          resourceId: id,
          resourceType: "patient_brain_data",
          details: "Failed to fetch brain visualization data",
          result: "failure",
          errorMessage: err instanceof Error ? err.message : "Unknown error",
        });
        
        setError("Failed to load brain visualization data. Please try again.");
        setLoading(false);
      }
    };
    
    fetchBrainData();
    
    // Clean up on component unmount
    return () => {
      if (id) {
        auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
          action: "close_brain_visualization",
          resourceId: id,
          resourceType: "patient_brain_data",
          details: "Closed brain visualization",
          result: "success",
        });
      }
    };
  }, [id]);
  
  // Handle toggle region
  const handleToggleRegion = useCallback((regionId: string) => {
    setActiveRegions(prev => {
      const isActive = prev.includes(regionId);
      
      // Log for HIPAA compliance
      auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
        action: isActive ? "deactivate_brain_region" : "activate_brain_region",
        resourceId: regionId,
        resourceType: "brain_region",
        details: `${isActive ? 'Deactivated' : 'Activated'} brain region: ${regionId}`,
        result: "success",
      });
      
      return isActive 
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId];
    });
  }, []);
  
  // Handle view mode change
  const handleViewModeChange = useCallback((mode: "normal" | "activity" | "connections") => {
    setViewMode(mode);
    
    // Log for HIPAA compliance
    auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
      action: "change_view_mode",
      details: `Changed brain visualization mode to: ${mode}`,
      result: "success",
    });
  }, []);
  
  // Handle rotation speed change
  const handleRotationSpeedChange = useCallback((speed: number) => {
    setRotationSpeed(speed);
  }, []);
  
  // Handle rotation toggle
  const handleRotationToggle = useCallback(() => {
    setRotationEnabled(prev => !prev);
  }, []);
  
  // Handle back navigation
  const handleBackClick = useCallback(() => {
    navigate(`/patient/${id}`);
  }, [navigate, id]);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingIndicator size="lg" text="Loading brain visualization..." />
      </div>
    );
  }
  
  // Error state
  if (error || !dataset) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            Error Loading Brain Data
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            {error || "Brain visualization data could not be loaded."}
          </p>
          <button
            onClick={handleBackClick}
            className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Back to Patient Profile
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBackClick}
                className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Brain Visualization - Patient ID: {id}
                </h1>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {dataset.type} Scan - {dataset.date}
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded-full text-sm font-medium">
                Active Regions: {activeRegions.length}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* 3D Brain Visualization - 70% width on desktop */}
        <div className="w-full md:w-[70%] h-[400px] md:h-auto relative border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
          <Suspense fallback={<LoadingIndicator size="lg" text="Loading 3D brain model..." />}>
            <BrainModelContainer
              regions={dataset.regions || []}
              activeRegions={activeRegions}
              viewMode={viewMode}
              rotationSpeed={rotationEnabled ? rotationSpeed : 0}
              onRegionClick={handleToggleRegion}
            />
          </Suspense>
          
          {/* Floating controls for the 3D visualization */}
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg p-3 backdrop-blur-sm">
            <Suspense fallback={<div className="h-10 flex items-center justify-center">Loading controls...</div>}>
              <BrainVisualizationControls
                viewMode={viewMode}
                rotationSpeed={rotationSpeed}
                rotationEnabled={rotationEnabled}
                onViewModeChange={handleViewModeChange}
                onRotationSpeedChange={handleRotationSpeedChange}
                onRotationToggle={handleRotationToggle}
              />
            </Suspense>
          </div>
        </div>
        
        {/* Right sidebar with region list - 30% width on desktop */}
        <div className="w-full md:w-[30%] overflow-y-auto bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Brain Regions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select regions to highlight in the visualization
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {dataset.regions?.map(region => {
              const isActive = activeRegions.includes(region.id);
              // Determine activity color class
              const activityColorClass = region.activity < 0
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                : region.activity > 0.8
                  ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
              
              return (
                <div 
                  key={region.id}
                  className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer
                    ${isActive ? 'bg-gray-100 dark:bg-gray-700/30' : ''}`}
                  onClick={() => handleToggleRegion(region.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'} mr-3`}></div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {region.name}
                      </span>
                    </div>
                    <div className={`ml-2 px-2 py-1 text-xs rounded-full ${activityColorClass}`}>
                      {region.activity.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Connections: {region.connections.length}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* HIPAA compliance notice */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4">
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          This visualization contains protected health information (PHI) and is provided in accordance with HIPAA regulations.
          All access is logged and monitored for compliance purposes.
        </div>
      </div>
    </div>
  );
};

export default React.memo(BrainVisualizationPage);
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auditLogService, AuditEventType } from "@infrastructure/services/AuditLogService";
import BrainModelContainer from "@templates/BrainModelContainer";
import LoadingIndicator from "@atoms/LoadingIndicator";

interface PatientData {
  id: string;
  name: string;
  dateOfBirth: string;
  datasetId?: string;
  datasetDate?: string;
  notes?: string;
}

/**
 * Brain Visualization Page
 * 
 * Displays a detailed 3D visualization of the patient's neural activity,
 * implementing HIPAA-compliant handling of patient data and controls
 * for exploring the brain model.
 */
const BrainVisualizationPage: React.FC = () => {
  // Get patient ID from URL params
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State for patient data
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) {
        setError("Patient ID is required");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Log this access for HIPAA compliance
        auditLogService.log(AuditEventType.PATIENT_RECORD_VIEW, {
          action: "view_brain_visualization",
          resourceId: id,
          resourceType: "patient",
          details: "Accessed brain visualization page",
          result: "success",
        });
        
        // In a real app, fetch from API
        // Simulating API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Mock patient data (in production this would come from an API)
        setPatientData({
          id,
          name: id === "demo" ? "Demo Patient" : `Patient ${id.slice(0, 4)}`,
          dateOfBirth: "1980-05-15",
          datasetId: "fmri-20250315",
          datasetDate: "2025-03-15",
          notes: id === "demo" 
            ? "Demonstration dataset with normal activation patterns." 
            : "Patient exhibiting atypical frontal lobe activity patterns.",
        });
        
        setLoading(false);
      } catch (err) {
        // Log error for HIPAA compliance
        auditLogService.log(AuditEventType.SYSTEM_ERROR, {
          action: "patient_data_fetch_error",
          resourceId: id,
          resourceType: "patient",
          details: "Failed to fetch patient data",
          result: "failure",
          errorMessage: err instanceof Error ? err.message : "Unknown error",
        });
        
        setError("Failed to load patient data. Please try again.");
        setLoading(false);
      }
    };
    
    fetchPatientData();
    
    // Clean up on component unmount
    return () => {
      if (id) {
        auditLogService.log(AuditEventType.PATIENT_RECORD_VIEW, {
          action: "close_brain_visualization",
          resourceId: id,
          resourceType: "patient",
          details: "Closed brain visualization page",
          result: "success",
        });
      }
    };
  }, [id]);
  
  // Handle back navigation
  const handleBackClick = () => {
    navigate(-1);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingIndicator size="lg" text="Loading patient data..." />
      </div>
    );
  }
  
  // Error state
  if (error || !id) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            Error Loading Visualization
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            {error || "Patient ID is required"}
          </p>
          <button
            onClick={handleBackClick}
            className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Patient info header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <button
              onClick={handleBackClick}
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Brain Visualization
            </h1>
            {patientData && (
              <div className="mt-1 text-gray-600 dark:text-gray-300">
                <span className="font-medium">{patientData.name}</span>
                <span className="mx-2">•</span>
                <span>DOB: {patientData.dateOfBirth}</span>
              </div>
            )}
          </div>
          
          {patientData?.datasetId && (
            <div className="mt-4 md:mt-0 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
              <div className="text-sm text-gray-500 dark:text-gray-400">Dataset</div>
              <div className="font-medium text-gray-900 dark:text-white">{patientData.datasetId}</div>
              {patientData.datasetDate && (
                <div className="text-xs text-gray-500 dark:text-gray-400">Recorded {patientData.datasetDate}</div>
              )}
            </div>
          )}
        </div>
        
        {patientData?.notes && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <span className="font-medium">Clinical Notes: </span>
                {patientData.notes}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Brain visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 mb-6">
        <BrainModelContainer
          patientId={id}
          {...(patientData?.datasetId ? { datasetId: patientData.datasetId } : {})}
          showControls={true}
          backgroundColor="transparent"
        />
      </div>
      
      {/* Additional information section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Visualization Guide
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
              </svg>
              <span>Click and drag to rotate the brain model</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span>Use mouse wheel to zoom in/out</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Click on a neural node for details</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
              <span>Use the region buttons to highlight specific brain areas</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Brain Region Map
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">Prefrontal Cortex - Decision making, planning</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">Temporal Lobe - Memory, language, auditory</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">Parietal Lobe - Sensory processing, spatial</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">Occipital Lobe - Visual processing</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">Limbic System - Emotion, memory formation</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Clinical Indicators
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>
              Neural nodes display activity levels through brightness and size.
            </p>
            <p>
              <span className="font-medium text-gray-800 dark:text-gray-200">Color intensity</span> indicates baseline activation.
            </p>
            <p>
              <span className="font-medium text-gray-800 dark:text-gray-200">Node size</span> represents relative importance in the neural network.
            </p>
            <p>
              <span className="font-medium text-green-600 dark:text-green-400">Green indicators</span> show increased activity from baseline.
            </p>
            <p>
              <span className="font-medium text-red-600 dark:text-red-400">Red indicators</span> show decreased activity from baseline.
            </p>
            <p>
              <span className="px-1.5 py-0.5 rounded-sm text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                anomaly
              </span> markers flag significant deviations requiring review.
            </p>
          </div>
        </div>
      </div>
      
      {/* HIPAA compliance notice */}
      <div className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">
        This visualization contains protected health information (PHI) and is provided in accordance with HIPAA regulations.
        All access is logged and monitored for compliance purposes.
      </div>
    </div>
  );
};

export default BrainVisualizationPage;
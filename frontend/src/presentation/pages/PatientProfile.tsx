import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auditLogService, AuditEventType } from "@infrastructure/services/AuditLogService";
import LoadingIndicator from "@atoms/LoadingIndicator";

interface PatientData {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  contact: {
    email: string;
    phone: string;
  };
  medicalRecord: {
    patientId: string;
    primaryDiagnosis?: string;
    secondaryDiagnoses?: string[];
    medications?: {
      name: string;
      dosage: string;
      frequency: string;
      startDate?: string;
    }[];
    allergies?: string[];
    notes?: string;
  };
  datasets?: {
    id: string;
    type: string;
    date: string;
    status: "available" | "processing" | "archived";
  }[];
}

/**
 * PatientProfile Page Component
 * 
 * Displays comprehensive patient information with HIPAA compliance,
 * providing access to medical records and brain visualization datasets.
 */
const PatientProfile: React.FC = () => {
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
          action: "view_patient_profile",
          resourceId: id,
          resourceType: "patient",
          details: "Accessed patient profile",
          result: "success",
        });
        
        // In a real app, fetch from API
        // Simulating API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock patient data based on ID (in production, this would be from an API)
        if (id === "demo") {
          setPatientData({
            id: "demo",
            name: "Demo Patient",
            dateOfBirth: "1980-05-15",
            gender: "Female",
            contact: {
              email: "demo@example.com",
              phone: "(555) 123-4567",
            },
            medicalRecord: {
              patientId: "MRN-DEV-12345",
              primaryDiagnosis: "Generalized Anxiety Disorder (GAD)",
              secondaryDiagnoses: ["Mild Depression"],
              medications: [
                {
                  name: "Sertraline",
                  dosage: "50mg",
                  frequency: "Daily",
                  startDate: "2024-10-15",
                },
                {
                  name: "Lorazepam",
                  dosage: "0.5mg",
                  frequency: "As needed",
                  startDate: "2024-11-02",
                },
              ],
              allergies: ["Penicillin"],
              notes: "Patient is responding well to current treatment plan. Recommended continued therapy sessions.",
            },
            datasets: [
              {
                id: "fmri-20250315",
                type: "fMRI",
                date: "2025-03-15",
                status: "available",
              },
              {
                id: "eeg-20250301",
                type: "EEG",
                date: "2025-03-01",
                status: "archived",
              },
            ],
          });
        } else if (id === "p1001") {
          setPatientData({
            id: "p1001",
            name: "Alex Thompson",
            dateOfBirth: "1973-08-22",
            gender: "Male",
            contact: {
              email: "athompson@example.com",
              phone: "(555) 876-5432",
            },
            medicalRecord: {
              patientId: "MRN-10982",
              primaryDiagnosis: "Major Depressive Disorder",
              secondaryDiagnoses: ["Insomnia"],
              medications: [
                {
                  name: "Fluoxetine",
                  dosage: "20mg",
                  frequency: "Daily",
                  startDate: "2024-12-05",
                },
              ],
              allergies: [],
              notes: "Patient reports improved sleep patterns but still experiencing low mood in mornings.",
            },
            datasets: [
              {
                id: "fmri-20250401",
                type: "fMRI",
                date: "2025-04-01",
                status: "available",
              },
            ],
          });
        } else if (id === "p1003") {
          setPatientData({
            id: "p1003",
            name: "Michael Chen",
            dateOfBirth: "1958-03-11",
            gender: "Male",
            contact: {
              email: "mchen@example.com",
              phone: "(555) 234-5678",
            },
            medicalRecord: {
              patientId: "MRN-23456",
              primaryDiagnosis: "Alzheimer's Disease (Early Stage)",
              secondaryDiagnoses: ["Hypertension", "Type 2 Diabetes"],
              medications: [
                {
                  name: "Donepezil",
                  dosage: "5mg",
                  frequency: "Daily",
                  startDate: "2025-01-10",
                },
                {
                  name: "Metformin",
                  dosage: "500mg",
                  frequency: "Twice daily",
                  startDate: "2023-08-15",
                },
              ],
              allergies: ["Sulfa drugs"],
              notes: "Patient exhibiting mild cognitive decline. Family support system in place. Recommended memory exercises.",
            },
            datasets: [
              {
                id: "fmri-20250402",
                type: "fMRI",
                date: "2025-04-02",
                status: "available",
              },
              {
                id: "eeg-20250330",
                type: "EEG",
                date: "2025-03-30",
                status: "processing",
              },
            ],
          });
        } else {
          // Generic patient data for other IDs
          setPatientData({
            id: id,
            name: `Patient ${id.slice(0, 4)}`,
            dateOfBirth: "1985-01-01",
            gender: "Not Specified",
            contact: {
              email: `patient${id}@example.com`,
              phone: "(555) 000-0000",
            },
            medicalRecord: {
              patientId: `MRN-${id}`,
              notes: "No detailed records available.",
            },
            datasets: [],
          });
        }
        
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
          action: "close_patient_profile",
          resourceId: id,
          resourceType: "patient",
          details: "Closed patient profile",
          result: "success",
        });
      }
    };
  }, [id]);
  
  // Handle back navigation
  const handleBackClick = () => {
    navigate(-1);
  };
  
  // Handle view brain visualization
  const handleViewBrain = (datasetId: string) => {
    if (!id) return;
    
    // Log for HIPAA compliance
    auditLogService.log(AuditEventType.PATIENT_RECORD_VIEW, {
      action: "navigate_to_brain_visualization",
      resourceId: id,
      resourceType: "patient",
      details: `Navigated to brain visualization with dataset ${datasetId}`,
      result: "success",
    });
    
    navigate(`/brain-visualization/${id}`);
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
  if (error || !patientData) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            Error Loading Patient Data
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            {error || "Patient data could not be loaded."}
          </p>
          <button
            onClick={handleBackClick}
            className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Patient header */}
      <div className="mb-6">
        <button
          onClick={handleBackClick}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {patientData.name}
            </h1>
            <div className="mt-1 text-gray-600 dark:text-gray-300">
              <span>ID: {patientData.id}</span>
              <span className="mx-2">•</span>
              <span>DOB: {patientData.dateOfBirth}</span>
              <span className="mx-2">•</span>
              <span>Gender: {patientData.gender}</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-gray-500 dark:text-gray-400">MRN: {patientData.medicalRecord.patientId}</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Contact and basic info */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contact Information
              </h2>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</div>
                <div className="mt-1 text-gray-900 dark:text-white">{patientData.contact.email}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</div>
                <div className="mt-1 text-gray-900 dark:text-white">{patientData.contact.phone}</div>
              </div>
            </div>
          </div>
          
          {/* Brain Scan Datasets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Brain Scan Datasets
              </h2>
            </div>
            <div className="p-4">
              {patientData.datasets && patientData.datasets.length > 0 ? (
                <div className="space-y-4">
                  {patientData.datasets.map((dataset) => (
                    <div key={dataset.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{dataset.type}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Date: {dataset.date}
                          </div>
                          <div className="mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              dataset.status === "available" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                                : dataset.status === "processing" 
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}>
                              {dataset.status.charAt(0).toUpperCase() + dataset.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        {dataset.status === "available" && (
                          <button
                            onClick={() => handleViewBrain(dataset.id)}
                            className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                          >
                            View Brain
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No brain scan datasets available
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column: Medical info */}
        <div className="md:col-span-2">
          {/* Diagnoses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Diagnosis Information
              </h2>
            </div>
            <div className="p-4">
              {patientData.medicalRecord.primaryDiagnosis ? (
                <div>
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Diagnosis</div>
                    <div className="mt-1 text-gray-900 dark:text-white font-medium">
                      {patientData.medicalRecord.primaryDiagnosis}
                    </div>
                  </div>
                  
                  {patientData.medicalRecord.secondaryDiagnoses && patientData.medicalRecord.secondaryDiagnoses.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Secondary Diagnoses</div>
                      <ul className="mt-1 pl-5 list-disc space-y-1 text-gray-900 dark:text-white">
                        {patientData.medicalRecord.secondaryDiagnoses.map((diagnosis, index) => (
                          <li key={index}>{diagnosis}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No diagnosis information available
                </div>
              )}
            </div>
          </div>
          
          {/* Medications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Medication History
              </h2>
            </div>
            <div className="p-4">
              {patientData.medicalRecord.medications && patientData.medicalRecord.medications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Medication
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Dosage
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Frequency
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Start Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {patientData.medicalRecord.medications.map((medication, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {medication.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {medication.dosage}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {medication.frequency}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {medication.startDate || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No medication information available
                </div>
              )}
            </div>
          </div>
          
          {/* Notes & Allergies */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Clinical Notes
              </h2>
            </div>
            <div className="p-4">
              {/* Allergies */}
              {patientData.medicalRecord.allergies && patientData.medicalRecord.allergies.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Allergies</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {patientData.medicalRecord.allergies.map((allergy, index) => (
                      <span key={index} className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {patientData.medicalRecord.notes && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</div>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-gray-100">
                    {patientData.medicalRecord.notes}
                  </div>
                </div>
              )}
              
              {!patientData.medicalRecord.allergies?.length && !patientData.medicalRecord.notes && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No clinical notes available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* HIPAA compliance notice */}
      <div className="mt-8 text-xs text-center text-gray-500 dark:text-gray-400">
        This record contains protected health information (PHI) and is provided in accordance with HIPAA regulations.
        All access is logged and monitored for compliance purposes.
      </div>
    </div>
  );
};

export default PatientProfile;

import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auditLogService, AuditEventType } from "@infrastructure/services/AuditLogService";
import LoadingIndicator from "@atoms/LoadingIndicator";

interface PatientCard {
  id: string;
  name: string;
  age: number;
  status: "normal" | "review" | "critical";
  lastUpdated: string;
  datasetId?: string;
}

/**
 * Dashboard Page Component
 * 
 * Main entry point for the Novamind Digital Twin platform.
 * Provides access to patient brain visualizations and clinical data.
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock patient data (in a real app, this would come from an API)
  const patients: PatientCard[] = useMemo(() => [
    {
      id: "demo",
      name: "Demo Patient",
      age: 45,
      status: "normal",
      lastUpdated: "2025-04-03",
      datasetId: "fmri-20250315"
    },
    {
      id: "p1001",
      name: "Alex Thompson",
      age: 52,
      status: "review",
      lastUpdated: "2025-04-01",
      datasetId: "fmri-20250401"
    },
    {
      id: "p1002",
      name: "Samantha Wilson",
      age: 29,
      status: "normal",
      lastUpdated: "2025-03-28"
    },
    {
      id: "p1003",
      name: "Michael Chen",
      age: 67,
      status: "critical",
      lastUpdated: "2025-04-02",
      datasetId: "fmri-20250402"
    },
    {
      id: "p1004",
      name: "Jessica Rodriguez",
      age: 38,
      status: "normal",
      lastUpdated: "2025-03-25"
    }
  ], []);
  
  // Handle opening a patient's brain visualization
  const handleViewBrain = useCallback((patientId: string) => {
    // Log for HIPAA compliance
    auditLogService.log(AuditEventType.PATIENT_RECORD_VIEW, {
      action: "navigate_to_brain_visualization",
      resourceId: patientId,
      resourceType: "patient",
      details: "Navigated to brain visualization from dashboard",
      result: "success",
    });
    
    navigate(`/brain-visualization/${patientId}`);
  }, [navigate]);
  
  // Status badge component
  const StatusBadge: React.FC<{status: PatientCard["status"]}> = ({ status }) => {
    const colors = {
      normal: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    };
    
    const labels = {
      normal: "Normal",
      review: "Review",
      critical: "Critical"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Novamind Digital Twin Platform
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Clinical neuroscience visualization and analysis
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Patients</h2>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{patients.length}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600 dark:text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Normal Status</h2>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {patients.filter(p => p.status === "normal").length}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600 dark:text-yellow-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Needs Review</h2>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {patients.filter(p => p.status === "review").length}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600 dark:text-red-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Status</h2>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {patients.filter(p => p.status === "critical").length}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Demo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Demo Brain Visualization
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              Experience our neural visualization technology with sample data
            </p>
          </div>
          <button
            onClick={() => handleViewBrain("demo")}
            className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Open Demo Visualization
          </button>
        </div>
        
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Interactive 3D Brain Visualization
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Click "Open Demo Visualization" to explore
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Patient List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Patient Visualizations
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Access brain visualizations for your patients
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {patient.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {patient.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{patient.age}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={patient.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{patient.lastUpdated}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewBrain(patient.id)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      disabled={!patient.datasetId}
                    >
                      {patient.datasetId 
                        ? "View Brain" 
                        : "No Data Available"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* HIPAA Footer */}
      <div className="mt-8 text-xs text-center text-gray-500 dark:text-gray-400">
        <p>Novamind Digital Twin Platform v1.0 | HIPAA Compliant</p>
        <p className="mt-1">All access to patient data is logged and monitored for compliance purposes.</p>
      </div>
    </div>
  );
};

export default Dashboard;

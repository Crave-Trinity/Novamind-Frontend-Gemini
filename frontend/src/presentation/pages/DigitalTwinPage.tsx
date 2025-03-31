/**
 * NOVAMIND Neural-Safe Page Component
 * DigitalTwinPage - Quantum-level integration of all neural visualization systems
 * with clinical precision and HIPAA-compliant data handling
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Neural visualization coordinator provider
import { VisualizationCoordinatorProvider } from '@application/coordinators/NeuralVisualizationCoordinator';

// Page components
import BrainModelContainer from '@presentation/templates/BrainModelContainer';
import PatientHeader from '@presentation/molecules/PatientHeader';
import ClinicalTimelinePanel from '@presentation/organisms/ClinicalTimelinePanel';
import NeuralRegionSelector from '@presentation/organisms/NeuralRegionSelector';
import DataIntegrationPanel from '@presentation/organisms/DataIntegrationPanel';
import DigitalTwinSettings from '@presentation/organisms/DigitalTwinSettings';

// UI components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@presentation/atoms/Tabs';
import { Button } from '@presentation/atoms/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@presentation/atoms/Tooltip';
import { Badge } from '@presentation/atoms/Badge';
import { Card } from '@presentation/atoms/Card';
import { Separator } from '@presentation/atoms/Separator';
import { ScrollArea } from '@presentation/atoms/ScrollArea';

// Layout components
import DashboardLayout from '@presentation/layouts/DashboardLayout';
import { PageHeader } from '@presentation/molecules/PageHeader';

// Icons
import { 
  Brain, 
  Settings, 
  History, 
  List, 
  Database,
  DownloadCloud,
  Share2,
  Printer,
  Layers,
  Maximize,
  PanelLeft,
  PanelRight
} from 'lucide-react';

// Services
import { patientService } from '@application/services/patientService';

// Domain types
import { Patient } from '@domain/types/patient/patient';

/**
 * Digital Twin Page component - primary integration point for all neural visualization
 * with clinical precision and HIPAA-compliant data handling
 */
export const DigitalTwinPage: React.FC = () => {
  // Router params and navigation
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>('visualization');
  
  // UI state
  const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(true);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  
  // Patient data
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Safely access patient ID
  const safePatientId = useMemo(() => patientId || '', [patientId]);
  
  // Load patient data
  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        const result = await patientService.getPatientById(safePatientId);
        
        if (result.success && result.data) {
          setPatient(result.data);
        } else {
          setError(result.error || 'Failed to load patient data');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (safePatientId) {
      loadPatient();
    } else {
      setError('No patient ID provided');
      setLoading(false);
    }
  }, [safePatientId]);
  
  // Toggle left panel
  const toggleLeftPanel = useCallback(() => {
    setLeftPanelOpen(prev => !prev);
  }, []);
  
  // Toggle right panel
  const toggleRightPanel = useCallback(() => {
    setRightPanelOpen(prev => !prev);
  }, []);
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setFullscreen(prev => !prev);
    
    if (!fullscreen) {
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
    } else {
      setLeftPanelOpen(true);
      setRightPanelOpen(true);
    }
  }, [fullscreen]);
  
  // Handle visualization export
  const handleExport = useCallback(() => {
    // Implementation handled by the VisualizationCoordinator
    // This is just a handler for the UI button
  }, []);
  
  // Handle region selection
  const handleRegionSelect = useCallback((regionId: string) => {
    // Handled by visualization coordinator
    console.log('Region selected:', regionId);
  }, []);
  
  // Handle visualization error
  const handleVisualizationError = useCallback((error: Error) => {
    console.error('Visualization error:', error);
    setError(`Visualization error: ${error.message}`);
  }, []);
  
  // If loading
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center w-full h-[80vh]">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-16 w-16 rounded-full border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <div className="text-slate-600 text-lg">Loading Digital Twin...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // If error
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center w-full h-[80vh]">
          <Card className="max-w-md p-6 bg-red-50 border-red-200">
            <div className="flex flex-col items-center text-center">
              <Brain className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Digital Twin</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                variant="default" 
                onClick={() => navigate('/patients')}
              >
                Return to Patient List
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // If no patient
  if (!patient) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center w-full h-[80vh]">
          <Card className="max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <Brain className="h-16 w-16 text-slate-400 mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 mb-2">Patient Not Found</h2>
              <p className="text-slate-600 mb-4">The requested patient could not be found.</p>
              <Button 
                variant="default" 
                onClick={() => navigate('/patients')}
              >
                Return to Patient List
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // Render digital twin view
  return (
    <VisualizationCoordinatorProvider patientId={safePatientId}>
      <DashboardLayout fullWidth>
        <div className="flex flex-col h-screen">
          {/* Page Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Brain className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Digital Twin</h1>
                  <p className="text-sm text-slate-500">
                    Neural visualization and clinical analysis
                  </p>
                </div>
              </div>
              
              <PatientHeader 
                patient={patient}
                compact={true}
              />
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleExport}
                      >
                        <DownloadCloud className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export Visualization</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={toggleFullscreen}
                      >
                        <Maximize className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle Fullscreen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={toggleLeftPanel}
                      >
                        <PanelLeft className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle Left Panel</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={toggleRightPanel}
                      >
                        <PanelRight className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle Right Panel</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mt-4"
            >
              <TabsList>
                <TabsTrigger value="visualization">
                  <Brain className="h-4 w-4 mr-2" />
                  Visualization
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <History className="h-4 w-4 mr-2" />
                  Clinical Timeline
                </TabsTrigger>
                <TabsTrigger value="regions">
                  <List className="h-4 w-4 mr-2" />
                  Neural Regions
                </TabsTrigger>
                <TabsTrigger value="data">
                  <Database className="h-4 w-4 mr-2" />
                  Data Integration
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel */}
            {leftPanelOpen && activeTab !== 'visualization' && (
              <div className="w-80 border-r border-slate-200 bg-white overflow-auto">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {activeTab === 'timeline' && (
                      <ClinicalTimelinePanel patientId={safePatientId} />
                    )}
                    
                    {activeTab === 'regions' && (
                      <NeuralRegionSelector patientId={safePatientId} />
                    )}
                    
                    {activeTab === 'data' && (
                      <DataIntegrationPanel patientId={safePatientId} />
                    )}
                    
                    {activeTab === 'settings' && (
                      <DigitalTwinSettings patientId={safePatientId} />
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            {/* Main Visualization Area */}
            <div className="flex-1 bg-slate-100">
              <TabsContent value="visualization" className="h-full">
                <BrainModelContainer
                  patientId={safePatientId}
                  width="100%"
                  height="100%"
                  showControls={true}
                  showMetrics={true}
                  showPerformance={true}
                  showBiometricAlerts={true}
                  showTreatmentResponses={true}
                  allowRegionSelection={true}
                  onRegionSelect={handleRegionSelect}
                  onError={handleVisualizationError}
                />
              </TabsContent>
              
              <TabsContent value="timeline" className="h-full p-4">
                <div className="bg-white rounded-lg shadow-sm h-full overflow-hidden">
                  <BrainModelContainer
                    patientId={safePatientId}
                    initialRenderMode="standard"
                    width="100%"
                    height="100%"
                    showControls={true}
                    showMetrics={true}
                    showPerformance={false}
                    showBiometricAlerts={false}
                    allowRegionSelection={true}
                    onRegionSelect={handleRegionSelect}
                    onError={handleVisualizationError}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="regions" className="h-full p-4">
                <div className="bg-white rounded-lg shadow-sm h-full overflow-hidden">
                  <BrainModelContainer
                    patientId={safePatientId}
                    initialRenderMode="connectivity"
                    width="100%"
                    height="100%"
                    showControls={true}
                    showMetrics={false}
                    showPerformance={false}
                    showBiometricAlerts={false}
                    allowRegionSelection={true}
                    onRegionSelect={handleRegionSelect}
                    onError={handleVisualizationError}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="h-full p-4">
                <div className="bg-white rounded-lg shadow-sm h-full overflow-hidden">
                  <BrainModelContainer
                    patientId={safePatientId}
                    initialRenderMode="heatmap"
                    width="100%"
                    height="100%"
                    showControls={true}
                    showMetrics={false}
                    showPerformance={false}
                    showBiometricAlerts={true}
                    allowRegionSelection={true}
                    onRegionSelect={handleRegionSelect}
                    onError={handleVisualizationError}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="h-full p-4">
                <div className="bg-white rounded-lg shadow-sm h-full overflow-hidden">
                  <BrainModelContainer
                    patientId={safePatientId}
                    initialRenderMode="standard"
                    width="100%"
                    height="100%"
                    showControls={true}
                    showMetrics={false}
                    showPerformance={true}
                    showBiometricAlerts={false}
                    allowRegionSelection={true}
                    onRegionSelect={handleRegionSelect}
                    onError={handleVisualizationError}
                  />
                </div>
              </TabsContent>
            </div>
            
            {/* Right Panel */}
            {rightPanelOpen && activeTab !== 'visualization' && (
              <div className="w-80 border-l border-slate-200 bg-white overflow-auto">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {activeTab === 'timeline' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-slate-800">Timeline Details</h3>
                        <p className="text-sm text-slate-600">
                          Select events on the timeline to view detailed information about clinical events
                          and their correlation with neural activity patterns.
                        </p>
                      </div>
                    )}
                    
                    {activeTab === 'regions' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-slate-800">Region Details</h3>
                        <p className="text-sm text-slate-600">
                          Select a neural region to view detailed information about its connectivity,
                          activity patterns, and clinical correlations.
                        </p>
                      </div>
                    )}
                    
                    {activeTab === 'data' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-slate-800">Data Source Details</h3>
                        <p className="text-sm text-slate-600">
                          View detailed information about integrated data sources, data quality,
                          and synchronization status.
                        </p>
                      </div>
                    )}
                    
                    {activeTab === 'settings' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-slate-800">Setting Details</h3>
                        <p className="text-sm text-slate-600">
                          Configure detailed visualization settings, performance options,
                          and clinical precision parameters.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </VisualizationCoordinatorProvider>
  );
};

export default DigitalTwinPage;

import React, { useState } from 'react';
import { DigitalTwinProfile } from '../../domain/models/PatientModel';
import BrainVisualization from './BrainVisualization';
import ClinicalMetricsGroup from '../molecules/ClinicalMetricsCard';
import TreatmentResponsePredictor from './TreatmentResponsePredictor';
import RiskAssessmentPanel from './RiskAssessmentPanel';
import Button from '../atoms/Button';

interface DigitalTwinDashboardProps {
  patientId: string;
  profile: DigitalTwinProfile;
  className?: string;
}

/**
 * Digital Twin Dashboard
 * 
 * The main dashboard component for visualizing a patient's digital twin profile,
 * integrating brain visualization, clinical metrics, and predictive models.
 */
const DigitalTwinDashboard: React.FC<DigitalTwinDashboardProps> = ({
  patientId,
  profile,
  className = '',
}) => {
  // Active tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'brain' | 'metrics' | 'predictions'>('overview');
  
  // Active brain region for highlighting
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  
  // Handle brain region click
  const handleRegionClick = (regionId: string) => {
    setActiveRegion(regionId);
    setActiveTab('brain');
  };
  
  return (
    <div className={`bg-background dark:bg-background rounded-xl shadow-xl overflow-hidden ${className}`}>
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-800 px-6 py-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Digital Twin</h1>
            <p className="text-blue-100 text-sm">
              {profile.primaryDiagnosis.charAt(0).toUpperCase() + profile.primaryDiagnosis.slice(1)} | 
              Severity: {profile.currentSeverity}
            </p>
          </div>
          <div className="flex items-center">
            <div className="bg-blue-900/30 rounded-lg py-1 px-3 text-xs font-medium">
              Last Updated: {new Date(profile.updatedAt).toLocaleString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-4 border-white text-white hover:bg-blue-700"
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'overview' 
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' 
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'brain' 
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' 
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
          onClick={() => setActiveTab('brain')}
        >
          Brain Model
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'metrics' 
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' 
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
          onClick={() => setActiveTab('metrics')}
        >
          Clinical Metrics
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'predictions' 
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' 
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
          onClick={() => setActiveTab('predictions')}
        >
          Predictions
        </button>
      </div>
      
      {/* Dashboard Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Brain Visualization (smaller) */}
            <div className="lg:col-span-2">
              <div className="bg-background-card dark:bg-background-elevated rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                  <h3 className="font-medium">Brain Activity Model</h3>
                  <Button 
                    size="xs" 
                    variant="ghost"
                    onClick={() => setActiveTab('brain')}
                  >
                    Enlarge
                  </Button>
                </div>
                <div className="p-4">
                  <BrainVisualization 
                    patientId={patientId}
                    height={300}
                    interactive={true}
                    showLabels={false}
                    onRegionClick={handleRegionClick}
                  />
                </div>
              </div>
              
              {/* Risk Assessment Summary */}
              <div className="mt-6">
                <div className="bg-background-card dark:bg-background-elevated rounded-lg shadow-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-medium">Risk Assessment</h3>
                  </div>
                  <div className="p-4">
                    <RiskAssessmentPanel 
                      patientId={patientId} 
                      riskAssessments={profile.riskAssessments}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Clinical Metrics Summary */}
            <div>
              <div className="bg-background-card dark:bg-background-elevated rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                  <h3 className="font-medium">Clinical Metrics</h3>
                  <Button 
                    size="xs" 
                    variant="ghost"
                    onClick={() => setActiveTab('metrics')}
                  >
                    View All
                  </Button>
                </div>
                <div className="p-4 space-y-4">
                  {profile.assessmentScores.slice(0, 3).map(score => (
                    <ClinicalMetricsGroup 
                      key={score.id}
                      title={score.type}
                      metrics={[score]}
                    />
                  ))}
                </div>
              </div>
              
              {/* Treatment Summary */}
              <div className="mt-6">
                <div className="bg-background-card dark:bg-background-elevated rounded-lg shadow-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-medium">Treatment Plan</h3>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Current Treatments</h4>
                      <div className="space-y-2">
                        {profile.treatmentPlan.treatments.map((treatment, index) => (
                          <div key={index} className="flex items-center justify-between bg-background-lighter dark:bg-background-card p-2 rounded">
                            <div>
                              <span className="font-medium capitalize">{treatment.type}</span>
                              <p className="text-xs text-neutral-500">{treatment.details}</p>
                            </div>
                            <div className="text-xs text-neutral-500">
                              {treatment.timeframe}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Treatment Efficacy</h4>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-1">
                        <div 
                          className="h-2 rounded-full bg-green-500" 
                          style={{ width: `${profile.treatmentPlan.effectiveness}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>Effectiveness: {profile.treatmentPlan.effectiveness}%</span>
                        <span>Adherence: {profile.treatmentPlan.adherence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Brain Model Tab */}
        {activeTab === 'brain' && (
          <div>
            <div className="bg-background-card dark:bg-background-elevated rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-medium">Digital Twin Brain Model</h3>
              </div>
              <div className="p-4">
                <BrainVisualization 
                  patientId={patientId}
                  height={600}
                  interactive={true}
                  showLabels={true}
                  onRegionClick={handleRegionClick}
                />
                
                {/* Brain region details */}
                {activeRegion && (
                  <div className="mt-6 bg-background-lighter dark:bg-background-card p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Region Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Activity Levels</h4>
                        {/* We would render activity charts here */}
                        <div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center">
                          <p className="text-neutral-500 text-sm">Activity chart would render here</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Clinical Significance</h4>
                        <div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center">
                          <p className="text-neutral-500 text-sm">Clinical correlation would render here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Clinical Metrics Tab */}
        {activeTab === 'metrics' && (
          <div>
            <div className="bg-background-card dark:bg-background-elevated rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-medium">Clinical Metrics</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-6">
                  {/* Depression Metrics */}
                  <ClinicalMetricsGroup 
                    title="Depression Metrics"
                    metrics={profile.assessmentScores.filter(score => 
                      ['PHQ9', 'BDI', 'MADRS'].includes(score.type)
                    )}
                  />
                  
                  {/* Anxiety Metrics */}
                  <ClinicalMetricsGroup 
                    title="Anxiety Metrics"
                    metrics={profile.assessmentScores.filter(score => 
                      ['GAD7', 'HAM-A', 'DASS'].includes(score.type)
                    )}
                  />
                  
                  {/* Functional Metrics */}
                  <ClinicalMetricsGroup 
                    title="Functional Metrics"
                    metrics={profile.assessmentScores.filter(score => 
                      ['WSAS', 'SF-36', 'Q-LES-Q'].includes(score.type)
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* Biomarker Data */}
            <div className="mt-6">
              <div className="bg-background-card dark:bg-background-elevated rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="font-medium">Biomarker Data</h3>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Biomarker
                          </th>
                          <th className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Reference Range
                          </th>
                          <th className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Trend
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-background-card divide-y divide-neutral-200 dark:divide-neutral-800">
                        {profile.biomarkers.map(biomarker => (
                          <tr key={biomarker.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800 dark:text-neutral-200">
                              {biomarker.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-300">
                              {biomarker.value} {biomarker.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-300">
                              {biomarker.referenceRange.min} - {biomarker.referenceRange.max} {biomarker.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                                biomarker.isAbnormal 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              }`}>
                                {biomarker.isAbnormal ? 'Abnormal' : 'Normal'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-300">
                              <div className="flex items-center">
                                {biomarker.trend === 'increasing' && (
                                  <svg className="w-4 h-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                  </svg>
                                )}
                                {biomarker.trend === 'decreasing' && (
                                  <svg className="w-4 h-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                  </svg>
                                )}
                                {biomarker.trend === 'stable' && (
                                  <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                  </svg>
                                )}
                                <span>{biomarker.trend}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            {/* Treatment Response Predictor */}
            <div className="bg-background-card dark:bg-background-elevated rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-medium">Treatment Response Prediction</h3>
              </div>
              <div className="p-4">
                <TreatmentResponsePredictor 
                  patientId={patientId}
                  profile={profile}
                />
              </div>
            </div>
            
            {/* Risk Assessment */}
            <div className="bg-background-card dark:bg-background-elevated rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-medium">Risk Assessment</h3>
              </div>
              <div className="p-4">
                <RiskAssessmentPanel 
                  patientId={patientId}
                  riskAssessments={profile.riskAssessments}
                  compact={false}
                />
              </div>
            </div>
            
            {/* Outcome Prediction */}
            <div className="bg-background-card dark:bg-background-elevated rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-medium">Outcome Prediction</h3>
              </div>
              <div className="p-4">
                <div className="h-96 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center">
                  <p className="text-neutral-500">Outcome prediction chart would render here</p>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background dark:bg-background-card p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Short-term (4 weeks)</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">25%</div>
                      <span className="text-sm text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">Improving</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Expected symptom reduction over next 4 weeks</p>
                  </div>
                  <div className="bg-background dark:bg-background-card p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Medium-term (12 weeks)</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">45%</div>
                      <span className="text-sm text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">Improving</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Expected symptom reduction over next 12 weeks</p>
                  </div>
                  <div className="bg-background dark:bg-background-card p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Long-term (24 weeks)</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">65%</div>
                      <span className="text-sm text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">Improving</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Expected symptom reduction over next 24 weeks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalTwinDashboard;

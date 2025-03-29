import React, { useState } from 'react';
import { RiskAssessment } from '../../domain/models/PatientModel';
import { useQuery, useMutation } from 'react-query';
import { xgboostService, RiskPredictionRequest } from '../../infrastructure/api/XGBoostService';
import Button from '../atoms/Button';

interface RiskAssessmentPanelProps {
  patientId: string;
  riskAssessments: RiskAssessment[];
  compact?: boolean;
  className?: string;
}

/**
 * Risk Assessment Panel
 * 
 * Visualizes patient risk assessments and allows for new risk predictions
 * using the XGBoost service.
 */
const RiskAssessmentPanel: React.FC<RiskAssessmentPanelProps> = ({
  patientId,
  riskAssessments,
  compact = false,
  className = '',
}) => {
  // Sort risk assessments by date (newest first)
  const sortedRiskAssessments = [...riskAssessments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Active risk type selection
  const [activeRiskType, setActiveRiskType] = useState<'relapse' | 'suicide'>('relapse');
  
  // Clinical data for new prediction
  const [clinicalData, setClinicalData] = useState({
    phq9_score: 0,
    gad7_score: 0,
    severity: 'moderate',
    diagnosis: 'depression'
  });
  
  // Mutation for making risk predictions
  const {
    mutate: predictRisk,
    isLoading: isPredicting,
    error: predictionError,
    data: predictionResult,
    reset: resetPrediction
  } = useMutation(
    async () => {
      const request: RiskPredictionRequest = {
        patient_id: patientId,
        risk_type: activeRiskType,
        clinical_data: {
          assessment_scores: {
            phq9: clinicalData.phq9_score,
            gad7: clinicalData.gad7_score,
          },
          severity: clinicalData.severity,
          diagnosis: clinicalData.diagnosis
        },
        confidence_threshold: 0.7
      };
      
      return xgboostService.predictRisk(request);
    }
  );
  
  // Handle risk type change
  const handleRiskTypeChange = (type: 'relapse' | 'suicide') => {
    setActiveRiskType(type);
    resetPrediction();
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClinicalData(prev => ({
      ...prev,
      [name]: name.includes('score') ? parseInt(value, 10) : value
    }));
  };
  
  // Get severity color class
  const getSeverityColorClass = (severity: string) => {
    switch (severity) {
      case 'none':
        return 'bg-green-500';
      case 'mild':
        return 'bg-yellow-500';
      case 'moderate':
        return 'bg-orange-500';
      case 'severe':
        return 'bg-red-500';
      default:
        return 'bg-neutral-500';
    }
  };
  
  // Get severity text color class
  const getSeverityTextClass = (severity: string) => {
    switch (severity) {
      case 'none':
        return 'text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900';
      case 'mild':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900';
      case 'moderate':
        return 'text-orange-700 bg-orange-100 dark:text-orange-200 dark:bg-orange-900';
      case 'severe':
        return 'text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900';
      default:
        return 'text-neutral-700 bg-neutral-100 dark:text-neutral-200 dark:bg-neutral-800';
    }
  };
  
  // Render the newest risk assessment
  const renderLatestRiskAssessment = () => {
    if (!sortedRiskAssessments.length) return null;
    
    const latest = sortedRiskAssessments[0];
    
    return (
      <div className="bg-background-card dark:bg-background-elevated rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">Latest Risk Assessment</h3>
          <div className="text-xs text-neutral-500">
            {new Date(latest.date).toLocaleDateString()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {latest.riskFactors.map((factor, idx) => (
            <div key={idx} className="bg-background dark:bg-background-card rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium capitalize">{factor.category}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getSeverityTextClass(factor.severity)}`}>
                  {factor.severity}
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mr-2">
                  <div 
                    className={`h-2 rounded-full ${getSeverityColorClass(factor.severity)}`} 
                    style={{ width: `${
                      factor.severity === 'none' ? 0 :
                      factor.severity === 'mild' ? 33 :
                      factor.severity === 'moderate' ? 66 : 100
                    }%` }}
                  ></div>
                </div>
                
                <div className="flex items-center text-xs">
                  {factor.trend === 'increasing' && (
                    <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                  {factor.trend === 'decreasing' && (
                    <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                  {factor.trend === 'stable' && (
                    <svg className="w-3 h-3 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${getSeverityColorClass(latest.overallRisk)} mr-2`}></div>
            <span className="font-medium">Overall Risk: <span className="capitalize">{latest.overallRisk}</span></span>
          </div>
          
          <div className="text-xs text-neutral-500">
            Next Assessment: {new Date(latest.nextAssessmentDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };
  
  // Render the risk prediction form in compact mode
  const renderCompactPredictionForm = () => {
    return (
      <div className="mt-4 bg-background-card dark:bg-background-elevated rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Predict New Risk</h3>
          
          <div className="flex">
            <button
              className={`text-xs px-3 py-1 rounded-l-md ${
                activeRiskType === 'relapse'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}
              onClick={() => handleRiskTypeChange('relapse')}
            >
              Relapse
            </button>
            <button
              className={`text-xs px-3 py-1 rounded-r-md ${
                activeRiskType === 'suicide'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}
              onClick={() => handleRiskTypeChange('suicide')}
            >
              Suicide
            </button>
          </div>
        </div>
        
        <Button
          variant="primary"
          size="sm"
          isLoading={isPredicting}
          onClick={() => predictRisk()}
          fullWidth
        >
          Run {activeRiskType.charAt(0).toUpperCase() + activeRiskType.slice(1)} Risk Assessment
        </Button>
      </div>
    );
  };
  
  // Render the full risk prediction form
  const renderFullPredictionForm = () => {
    return (
      <div className="mt-6 bg-background-card dark:bg-background-elevated rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">New Risk Assessment</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Risk Type Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Risk Type
            </label>
            <div className="flex">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md ${
                  activeRiskType === 'relapse'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
                onClick={() => handleRiskTypeChange('relapse')}
              >
                Relapse Risk
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md ${
                  activeRiskType === 'suicide'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
                onClick={() => handleRiskTypeChange('suicide')}
              >
                Suicide Risk
              </button>
            </div>
          </div>
          
          {/* Diagnosis Selection */}
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Primary Diagnosis
            </label>
            <select
              id="diagnosis"
              name="diagnosis"
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-background-card text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={clinicalData.diagnosis}
              onChange={handleInputChange}
            >
              <option value="depression">Depression</option>
              <option value="anxiety">Anxiety</option>
              <option value="bipolar">Bipolar Disorder</option>
              <option value="schizophrenia">Schizophrenia</option>
              <option value="ptsd">PTSD</option>
            </select>
          </div>
          
          {/* PHQ9 Score */}
          <div>
            <label htmlFor="phq9_score" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              PHQ-9 Score
            </label>
            <input
              id="phq9_score"
              name="phq9_score"
              type="number"
              min="0"
              max="27"
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-background-card text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={clinicalData.phq9_score}
              onChange={handleInputChange}
            />
          </div>
          
          {/* GAD7 Score */}
          <div>
            <label htmlFor="gad7_score" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              GAD-7 Score
            </label>
            <input
              id="gad7_score"
              name="gad7_score"
              type="number"
              min="0"
              max="21"
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-background-card text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={clinicalData.gad7_score}
              onChange={handleInputChange}
            />
          </div>
          
          {/* Severity */}
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Current Severity
            </label>
            <select
              id="severity"
              name="severity"
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-background-card text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={clinicalData.severity}
              onChange={handleInputChange}
            >
              <option value="none">None</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={resetPrediction}
            disabled={!predictionResult}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            isLoading={isPredicting}
            onClick={() => predictRisk()}
          >
            Generate Risk Assessment
          </Button>
        </div>
      </div>
    );
  };
  
  // Render the prediction results
  const renderPredictionResults = () => {
    if (!predictionResult) return null;
    
    return (
      <div className="mt-6 bg-background-card dark:bg-background-elevated rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">Risk Prediction Results</h3>
          
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityTextClass(predictionResult.risk_level)}`}>
            {predictionResult.risk_level.charAt(0).toUpperCase() + predictionResult.risk_level.slice(1)} Risk
          </span>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Risk Score
            </span>
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
              {Math.round(predictionResult.risk_score * 100)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${getSeverityColorClass(predictionResult.risk_level)}`} 
              style={{ width: `${predictionResult.risk_score * 100}%` }}
            ></div>
          </div>
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>Low Risk</span>
            <span>Confidence: {Math.round(predictionResult.confidence * 100)}%</span>
            <span>High Risk</span>
          </div>
        </div>
        
        {predictionResult.factors.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Key Risk Factors
            </h4>
            <div className="space-y-2">
              {predictionResult.factors.slice(0, 5).map((factor: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {factor.name}
                  </span>
                  <div className="w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${factor.direction === 'positive' ? 'bg-red-500' : 'bg-blue-500'}`} 
                      style={{ width: `${Math.abs(factor.contribution) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-neutral-500 w-12 text-right">
                    {(factor.contribution * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {predictionResult.recommendations && predictionResult.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Recommendations
            </h4>
            <ul className="list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300 space-y-1 pl-2">
              {predictionResult.recommendations.map((rec: string, idx: number) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  // Render historical risk assessments
  const renderHistoricalAssessments = () => {
    if (sortedRiskAssessments.length <= 1) return null;
    
    return (
      <div className="mt-6 bg-background-card dark:bg-background-elevated rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Historical Risk Assessments</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Overall Risk
                </th>
                <th className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Risk Factors
                </th>
                <th className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Interventions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-background-card divide-y divide-neutral-200 dark:divide-neutral-800">
              {sortedRiskAssessments.slice(1).map((assessment, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {new Date(assessment.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${getSeverityTextClass(assessment.overallRisk)}`}>
                      {assessment.overallRisk.charAt(0).toUpperCase() + assessment.overallRisk.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                    <div className="flex flex-wrap gap-1">
                      {assessment.riskFactors.map((factor, fidx) => (
                        <span
                          key={fidx}
                          className={`inline-block px-2 py-1 text-xs rounded ${getSeverityTextClass(factor.severity)}`}
                        >
                          {factor.category}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                    <div className="flex flex-wrap gap-1">
                      {assessment.recommendedInterventions.slice(0, 2).map((intervention, iidx) => (
                        <span
                          key={iidx}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                        >
                          {intervention}
                        </span>
                      ))}
                      {assessment.recommendedInterventions.length > 2 && (
                        <span className="inline-block px-2 py-1 text-xs bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 rounded">
                          +{assessment.recommendedInterventions.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  return (
    <div className={className}>
      {/* Latest Risk Assessment */}
      {renderLatestRiskAssessment()}
      
      {/* Prediction Form */}
      {compact ? renderCompactPredictionForm() : renderFullPredictionForm()}
      
      {/* Prediction Results */}
      {predictionResult && renderPredictionResults()}
      
      {/* Historical Risk Assessments */}
      {!compact && renderHistoricalAssessments()}
    </div>
  );
};

export default RiskAssessmentPanel;

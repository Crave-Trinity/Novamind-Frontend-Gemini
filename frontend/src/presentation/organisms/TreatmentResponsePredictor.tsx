import React, { useState } from 'react';
import { DigitalTwinProfile } from '../../domain/models/PatientModel';
import { useTreatmentPrediction } from '../../application/hooks/useTreatmentPrediction';
import Button from '../atoms/Button';

interface TreatmentResponsePredictorProps {
  patientId: string;
  profile: DigitalTwinProfile;
  className?: string;
}

/**
 * Treatment Response Predictor
 * 
 * Interactive component for predicting patient responses to various
 * treatment options using the XGBoost service.
 */
const TreatmentResponsePredictor: React.FC<TreatmentResponsePredictorProps> = ({
  patientId,
  profile,
  className = '',
}) => {
  // Local state for clinical data inputs
  const [clinicalData, setClinicalData] = useState({
    severity: profile.currentSeverity,
    diagnosis: profile.primaryDiagnosis,
    phq9_score: profile.assessmentScores.find(s => s.type === 'PHQ9')?.score || 0,
    gad7_score: profile.assessmentScores.find(s => s.type === 'GAD7')?.score || 0,
  });
  
  // Get genetic markers from profile if available
  const geneticData = profile.biomarkers
    .filter(b => b.name.includes('genetic') || b.name.includes('CYP'))
    .map(b => b.name);
  
  // Use the treatment prediction hook
  const {
    treatmentConfig,
    predictionResult,
    featureImportance,
    isPredicting,
    isLoadingFeatures,
    predictionError,
    updateTreatmentConfig,
    predictTreatmentResponse,
    resetPrediction
  } = useTreatmentPrediction({
    patientId,
    initialTreatmentType: 'ssri',
    onPredictionSuccess: (data) => {
      console.log('Prediction successful:', data);
    },
    onPredictionError: (error) => {
      console.error('Prediction error:', error);
    }
  });
  
  // Treatment options
  const treatmentOptions = [
    { value: 'ssri', label: 'SSRI Medication' },
    { value: 'snri', label: 'SNRI Medication' },
    { value: 'tca', label: 'TCA Medication' },
    { value: 'maoi', label: 'MAOI Medication' },
    { value: 'cbt', label: 'Cognitive Behavioral Therapy' },
    { value: 'ect', label: 'Electroconvulsive Therapy' },
    { value: 'tms', label: 'Transcranial Magnetic Stimulation' },
    { value: 'combination', label: 'Combination Therapy' },
  ];
  
  // Handle treatment type change
  const handleTreatmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTreatmentConfig({ treatmentType: e.target.value });
  };
  
  // Handle clinical data input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClinicalData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle predict button click
  const handlePredict = () => {
    predictTreatmentResponse({ clinicalData, geneticData });
  };
  
  // Response level colors
  const getResponseLevelColor = (level: string) => {
    switch (level) {
      case 'poor':
        return 'bg-red-500';
      case 'partial':
        return 'bg-orange-500';
      case 'good':
        return 'bg-green-500';
      case 'excellent':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Treatment Configuration Panel */}
        <div className="bg-background dark:bg-background-elevated p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Treatment Options</h3>
          
          {/* Treatment Type Selection */}
          <div className="mb-4">
            <label htmlFor="treatment-type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Treatment Type
            </label>
            <select
              id="treatment-type"
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-background-card text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={treatmentConfig.treatmentType}
              onChange={handleTreatmentChange}
            >
              {treatmentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Clinical Data Inputs */}
          <div className="space-y-3">
            <div>
              <label htmlFor="phq9" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                PHQ-9 Score
              </label>
              <input
                id="phq9"
                name="phq9_score"
                type="number"
                min="0"
                max="27"
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-background-card text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={clinicalData.phq9_score}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label htmlFor="gad7" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                GAD-7 Score
              </label>
              <input
                id="gad7"
                name="gad7_score"
                type="number"
                min="0"
                max="21"
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-background-card text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={clinicalData.gad7_score}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Severity
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
          
          {/* Genetic Markers */}
          {geneticData.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Genetic Markers
              </label>
              <div className="flex flex-wrap gap-1">
                {geneticData.map((marker, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {marker}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              variant="primary"
              onClick={handlePredict}
              isLoading={isPredicting}
              disabled={isPredicting}
              fullWidth
            >
              Predict Response
            </Button>
            
            <Button
              variant="outline"
              onClick={resetPrediction}
              disabled={isPredicting || !predictionResult}
            >
              Reset
            </Button>
          </div>
        </div>
        
        {/* Prediction Results Panel */}
        <div className="bg-background dark:bg-background-elevated p-4 rounded-lg">
          {predictionResult ? (
            <div>
              <h3 className="text-lg font-medium mb-4">Prediction Results</h3>
              
              {/* Response Probability */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Response Probability
                  </span>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {Math.round(predictionResult.response_probability * 100)}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${getResponseLevelColor(predictionResult.response_level)}`} 
                    style={{ width: `${predictionResult.response_probability * 100}%` }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-neutral-500">
                  <span>Poor</span>
                  <span>Response Level: {predictionResult.response_level}</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              {/* Time to Response */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Estimated Time to Response
                </h4>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {predictionResult.time_to_response.weeks}
                  </span>
                  <span className="ml-1 text-neutral-500 dark:text-neutral-400">weeks</span>
                  <span className="ml-3 text-xs text-neutral-500">
                    (Confidence: {Math.round(predictionResult.time_to_response.confidence * 100)}%)
                  </span>
                </div>
              </div>
              
              {/* Influential Factors */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Key Influential Factors
                </h4>
                <div className="space-y-2">
                  {predictionResult.factors.slice(0, 4).map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {factor.name}
                      </span>
                      <div className="w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500" 
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
              
              {/* Alternative Treatments */}
              {predictionResult.alternative_treatments && predictionResult.alternative_treatments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Alternative Treatment Options
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {predictionResult.alternative_treatments.map((alt, idx) => (
                      <button
                        key={idx}
                        className="bg-white dark:bg-background-card border border-neutral-200 dark:border-neutral-700 rounded-md px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        onClick={() => updateTreatmentConfig({ treatmentType: alt.type })}
                      >
                        <div className="font-medium text-sm">
                          {treatmentOptions.find(opt => opt.value === alt.type)?.label || alt.type}
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                          Est. Response: {Math.round(alt.estimated_response * 100)}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : predictionError ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 text-red-500 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Prediction Error</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {predictionError.message || 'An error occurred while predicting treatment response.'}
              </p>
              <Button
                variant="primary"
                onClick={handlePredict}
                size="sm"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Treatment Response Predictor</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Configure treatment options and click "Predict Response" to generate a personalized treatment response prediction based on the patient's data.
              </p>
              <p className="text-xs text-neutral-500 mb-6">
                Predictions are based on ML models trained on clinical data and consider patient-specific factors.
              </p>
              <Button
                variant="primary"
                onClick={handlePredict}
                size="md"
              >
                Generate Prediction
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Feature Importance Panel (shown when available) */}
      {featureImportance && (
        <div className="mt-6 bg-background dark:bg-background-elevated p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Feature Importance Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Global Importance */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Global Model Features
              </h4>
              
              <div className="space-y-2">
                {featureImportance.features.map((feature: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {feature.name}
                    </span>
                    <div className="w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${feature.direction === 'positive' ? 'bg-green-500' : 'bg-red-500'}`} 
                        style={{ width: `${feature.importance * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-neutral-500 w-12 text-right">
                      {(feature.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Explanation */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Clinical Interpretation
              </h4>
              
              <div className="bg-neutral-50 dark:bg-background-card border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
                <ul className="list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300 space-y-2">
                  {featureImportance.interpretation && featureImportance.interpretation.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // This would typically open a more detailed view or export PDF
                    alert('Detailed report would be generated here');
                  }}
                  className="text-xs"
                >
                  Generate Detailed Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentResponsePredictor;

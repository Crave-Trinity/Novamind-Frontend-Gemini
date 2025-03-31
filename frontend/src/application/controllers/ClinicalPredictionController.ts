/**
 * NOVAMIND Neural-Safe Controller Layer
 * ClinicalPredictionController - Quantum-level prediction management
 * with neural-safe typing and mathematical prediction precision
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

// Domain types
import { 
  PredictionInterval, 
  PredictionResult,
  PredictionAccuracy,
  PredictionModel,
  ConfidenceLevel
} from '@domain/types/predictions/models';
import { 
  SymptomTrajectory, 
  TreatmentOutcome,
  RelapsePrediction,
  RiskAssessment,
  TimeseriesDataPoint
} from '@domain/types/clinical/predictions';
import { Result, success, failure } from '@domain/types/common/result';

// Services
import { clinicalService } from '@application/services/clinicalService';
import { predictionService } from '@application/services/predictionService';

/**
 * Neural-safe prediction state with type integrity
 */
interface PredictionState {
  symptomTrajectories: Map<string, SymptomTrajectory>;
  treatmentOutcomes: Map<string, TreatmentOutcome>;
  relapsePredictions: RelapsePrediction[];
  riskAssessments: Map<string, RiskAssessment>;
  confidenceIntervals: Map<string, PredictionInterval>;
  predictionHorizon: number; // in days
  lastUpdated: Date | null;
  activeModels: PredictionModel[];
  aggregationMethod: 'weighted' | 'bayesian' | 'ensemble' | 'highest-confidence';
  includeBiomarkers: boolean;
  includeEnvironmentalFactors: boolean;
  dataPoints: number; // Number of data points used for prediction
}

/**
 * Initial prediction state with safe defaults
 */
const createInitialPredictionState = (): PredictionState => ({
  symptomTrajectories: new Map<string, SymptomTrajectory>(),
  treatmentOutcomes: new Map<string, TreatmentOutcome>(),
  relapsePredictions: [],
  riskAssessments: new Map<string, RiskAssessment>(),
  confidenceIntervals: new Map<string, PredictionInterval>(),
  predictionHorizon: 90, // Default to 90-day prediction horizon
  lastUpdated: null,
  activeModels: ['bayesian', 'statistical'],
  aggregationMethod: 'weighted',
  includeBiomarkers: true,
  includeEnvironmentalFactors: true,
  dataPoints: 0
});

/**
 * Neural-safe controller for clinical prediction with mathematical precision
 */
export function useClinicalPredictionController(patientId: string) {
  // State with thread-safe operations
  const [state, setState] = useState<PredictionState>(createInitialPredictionState());
  
  // Generate predictions for symptoms with type-safe error handling
  const predictSymptomTrajectories = useCallback(async (
    symptomIds: string[],
    predictionHorizon?: number
  ): Promise<Result<Map<string, SymptomTrajectory>>> => {
    try {
      const horizon = predictionHorizon || state.predictionHorizon;
      
      // Configure prediction parameters
      const predictionParams = {
        patientId,
        symptomIds,
        horizon,
        includeBiomarkers: state.includeBiomarkers,
        includeEnvironmentalFactors: state.includeEnvironmentalFactors,
        models: state.activeModels,
        aggregationMethod: state.aggregationMethod
      };
      
      // Get predictions from service
      const result = await predictionService.predictSymptomTrajectories(predictionParams);
      
      if (result.success && result.data) {
        // Update state with new predictions
        setState(prevState => {
          const newSymptomTrajectories = new Map(prevState.symptomTrajectories);
          const newConfidenceIntervals = new Map(prevState.confidenceIntervals);
          
          // Add each symptom trajectory to the maps
          result.data.forEach(trajectory => {
            newSymptomTrajectories.set(trajectory.symptomId, trajectory);
            
            // Store confidence intervals separately for easier access
            newConfidenceIntervals.set(
              `symptom-${trajectory.symptomId}`,
              {
                upper: trajectory.confidenceInterval.upper,
                lower: trajectory.confidenceInterval.lower,
                confidenceLevel: trajectory.confidenceInterval.confidenceLevel
              }
            );
          });
          
          return {
            ...prevState,
            symptomTrajectories: newSymptomTrajectories,
            confidenceIntervals: newConfidenceIntervals,
            lastUpdated: new Date(),
            dataPoints: result.data.reduce((sum, traj) => sum + (traj.dataPoints || 0), 0)
          };
        });
        
        // Return a copy of the trajectories map
        return success(new Map(result.data.map(t => [t.symptomId, t])));
      }
      
      return failure(result.error || 'Failed to predict symptom trajectories');
    } catch (error) {
      return failure(error instanceof Error ? error.message : 'Unknown error in prediction');
    }
  }, [patientId, state.predictionHorizon, state.includeBiomarkers, 
      state.includeEnvironmentalFactors, state.activeModels, state.aggregationMethod]);
  
  // Generate predictions for treatment outcomes
  const predictTreatmentOutcomes = useCallback(async (
    treatmentIds: string[],
    predictionHorizon?: number
  ): Promise<Result<Map<string, TreatmentOutcome>>> => {
    try {
      const horizon = predictionHorizon || state.predictionHorizon;
      
      // Configure prediction parameters
      const predictionParams = {
        patientId,
        treatmentIds,
        horizon,
        includeBiomarkers: state.includeBiomarkers,
        includeEnvironmentalFactors: state.includeEnvironmentalFactors,
        models: state.activeModels,
        aggregationMethod: state.aggregationMethod
      };
      
      // Get predictions from service
      const result = await predictionService.predictTreatmentOutcomes(predictionParams);
      
      if (result.success && result.data) {
        // Update state with new predictions
        setState(prevState => {
          const newTreatmentOutcomes = new Map(prevState.treatmentOutcomes);
          const newConfidenceIntervals = new Map(prevState.confidenceIntervals);
          
          // Add each treatment outcome to the maps
          result.data.forEach(outcome => {
            newTreatmentOutcomes.set(outcome.treatmentId, outcome);
            
            // Store confidence intervals separately
            newConfidenceIntervals.set(
              `treatment-${outcome.treatmentId}`,
              {
                upper: outcome.confidenceInterval.upper,
                lower: outcome.confidenceInterval.lower,
                confidenceLevel: outcome.confidenceInterval.confidenceLevel
              }
            );
          });
          
          return {
            ...prevState,
            treatmentOutcomes: newTreatmentOutcomes,
            confidenceIntervals: newConfidenceIntervals,
            lastUpdated: new Date(),
            dataPoints: result.data.reduce((sum, outcome) => sum + (outcome.dataPoints || 0), 0)
          };
        });
        
        // Return a copy of the outcomes map
        return success(new Map(result.data.map(o => [o.treatmentId, o])));
      }
      
      return failure(result.error || 'Failed to predict treatment outcomes');
    } catch (error) {
      return failure(error instanceof Error ? error.message : 'Unknown error in prediction');
    }
  }, [patientId, state.predictionHorizon, state.includeBiomarkers, 
      state.includeEnvironmentalFactors, state.activeModels, state.aggregationMethod]);
  
  // Predict risk of relapse
  const predictRelapse = useCallback(async (
    disorderIds: string[],
    predictionHorizon?: number
  ): Promise<Result<RelapsePrediction[]>> => {
    try {
      const horizon = predictionHorizon || state.predictionHorizon;
      
      // Configure prediction parameters
      const predictionParams = {
        patientId,
        disorderIds,
        horizon,
        includeBiomarkers: state.includeBiomarkers,
        includeEnvironmentalFactors: state.includeEnvironmentalFactors,
        models: state.activeModels,
        aggregationMethod: state.aggregationMethod
      };
      
      // Get predictions from service
      const result = await predictionService.predictRelapse(predictionParams);
      
      if (result.success && result.data) {
        // Update state with new predictions
        setState(prevState => {
          // Update confidence intervals
          const newConfidenceIntervals = new Map(prevState.confidenceIntervals);
          
          result.data.forEach(prediction => {
            newConfidenceIntervals.set(
              `relapse-${prediction.disorderId}`,
              {
                upper: prediction.confidenceInterval.upper,
                lower: prediction.confidenceInterval.lower,
                confidenceLevel: prediction.confidenceInterval.confidenceLevel
              }
            );
          });
          
          return {
            ...prevState,
            relapsePredictions: result.data,
            confidenceIntervals: newConfidenceIntervals,
            lastUpdated: new Date(),
            dataPoints: result.data.reduce((sum, pred) => sum + (pred.dataPoints || 0), 0)
          };
        });
        
        return success(result.data);
      }
      
      return failure(result.error || 'Failed to predict relapse');
    } catch (error) {
      return failure(error instanceof Error ? error.message : 'Unknown error in prediction');
    }
  }, [patientId, state.predictionHorizon, state.includeBiomarkers, 
      state.includeEnvironmentalFactors, state.activeModels, state.aggregationMethod]);
  
  // Assess clinical risks
  const assessRisks = useCallback(async (
    riskFactors: string[]
  ): Promise<Result<Map<string, RiskAssessment>>> => {
    try {
      // Configure assessment parameters
      const assessmentParams = {
        patientId,
        riskFactors,
        includeBiomarkers: state.includeBiomarkers,
        includeEnvironmentalFactors: state.includeEnvironmentalFactors,
        models: state.activeModels,
        aggregationMethod: state.aggregationMethod
      };
      
      // Get assessments from service
      const result = await predictionService.assessRisks(assessmentParams);
      
      if (result.success && result.data) {
        // Update state with new assessments
        setState(prevState => {
          const newRiskAssessments = new Map(prevState.riskAssessments);
          const newConfidenceIntervals = new Map(prevState.confidenceIntervals);
          
          // Add each risk assessment to the maps
          result.data.forEach(assessment => {
            newRiskAssessments.set(assessment.riskFactorId, assessment);
            
            // Store confidence intervals separately
            newConfidenceIntervals.set(
              `risk-${assessment.riskFactorId}`,
              {
                upper: assessment.confidenceInterval.upper,
                lower: assessment.confidenceInterval.lower,
                confidenceLevel: assessment.confidenceInterval.confidenceLevel
              }
            );
          });
          
          return {
            ...prevState,
            riskAssessments: newRiskAssessments,
            confidenceIntervals: newConfidenceIntervals,
            lastUpdated: new Date(),
            dataPoints: result.data.reduce((sum, assessment) => sum + (assessment.dataPoints || 0), 0)
          };
        });
        
        // Return a copy of the assessments map
        return success(new Map(result.data.map(a => [a.riskFactorId, a])));
      }
      
      return failure(result.error || 'Failed to assess risks');
    } catch (error) {
      return failure(error instanceof Error ? error.message : 'Unknown error in assessment');
    }
  }, [patientId, state.includeBiomarkers, state.includeEnvironmentalFactors, 
      state.activeModels, state.aggregationMethod]);
  
  // Configure prediction parameters
  const configurePrediction = useCallback((config: {
    predictionHorizon?: number;
    activeModels?: PredictionModel[];
    aggregationMethod?: PredictionState['aggregationMethod'];
    includeBiomarkers?: boolean;
    includeEnvironmentalFactors?: boolean;
  }) => {
    setState(prevState => ({
      ...prevState,
      predictionHorizon: config.predictionHorizon ?? prevState.predictionHorizon,
      activeModels: config.activeModels ?? prevState.activeModels,
      aggregationMethod: config.aggregationMethod ?? prevState.aggregationMethod,
      includeBiomarkers: config.includeBiomarkers ?? prevState.includeBiomarkers,
      includeEnvironmentalFactors: config.includeEnvironmentalFactors ?? prevState.includeEnvironmentalFactors
    }));
  }, []);
  
  // Get confidence interval for a specific prediction
  const getConfidenceInterval = useCallback((
    type: 'symptom' | 'treatment' | 'relapse' | 'risk',
    id: string
  ): PredictionInterval | null => {
    const key = `${type}-${id}`;
    return state.confidenceIntervals.get(key) || null;
  }, [state.confidenceIntervals]);
  
  // Calculate prediction accuracy against actual outcomes
  const calculateAccuracy = useCallback(async (
    predictionType: 'symptom' | 'treatment' | 'relapse' | 'risk',
    timeframe: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<Result<PredictionAccuracy>> => {
    try {
      const result = await predictionService.calculateAccuracy({
        patientId,
        predictionType,
        timeframe,
        models: state.activeModels
      });
      
      return result;
    } catch (error) {
      return failure(error instanceof Error ? error.message : 'Unknown error calculating accuracy');
    }
  }, [patientId, state.activeModels]);
  
  // Combine multiple prediction models for improved accuracy
  const combineModels = useCallback(async <T extends PredictionResult>(
    results: T[],
    confidenceLevels: ConfidenceLevel[]
  ): Promise<Result<T>> => {
    try {
      if (results.length === 0) {
        return failure('No prediction results to combine');
      }
      
      if (results.length === 1) {
        return success(results[0]);
      }
      
      // Different combination strategies based on aggregation method
      switch (state.aggregationMethod) {
        case 'weighted': {
          // Weighted average based on confidence levels
          const totalConfidence = confidenceLevels.reduce((sum, level) => sum + level, 0);
          
          if (totalConfidence === 0) {
            return failure('Cannot combine with zero confidence');
          }
          
          // Create combined result (simplified for demonstration)
          // In a real implementation, this would properly combine all fields
          const combinedResult = { ...results[0] } as T;
          
          // Return the combined result
          return success(combinedResult);
        }
        
        case 'bayesian': {
          // In real implementation: Apply Bayesian model averaging
          return success(results[0]); // Simplified for demonstration
        }
        
        case 'ensemble': {
          // In real implementation: Apply ensemble techniques
          return success(results[0]); // Simplified for demonstration
        }
        
        case 'highest-confidence': {
          // Find result with highest confidence
          const maxIndex = confidenceLevels.reduce(
            (maxIdx, confidence, idx) => 
              confidence > confidenceLevels[maxIdx] ? idx : maxIdx, 
            0
          );
          
          return success(results[maxIndex]);
        }
        
        default:
          return failure('Unknown aggregation method');
      }
    } catch (error) {
      return failure(error instanceof Error ? error.message : 'Unknown error combining models');
    }
  }, [state.aggregationMethod]);
  
  // Get time series data for a specific prediction
  const getTimeSeriesData = useCallback(async (
    type: 'symptom' | 'treatment' | 'relapse' | 'risk',
    id: string
  ): Promise<Result<TimeseriesDataPoint[]>> => {
    try {
      const result = await predictionService.getTimeSeriesData({
        patientId,
        type,
        id,
        horizon: state.predictionHorizon
      });
      
      return result;
    } catch (error) {
      return failure(error instanceof Error ? error.message : 'Unknown error getting time series data');
    }
  }, [patientId, state.predictionHorizon]);
  
  // Reset prediction state
  const resetPredictions = useCallback(() => {
    setState(createInitialPredictionState());
  }, []);
  
  return {
    // Prediction functions
    predictSymptomTrajectories,
    predictTreatmentOutcomes,
    predictRelapse,
    assessRisks,
    
    // Configuration
    configurePrediction,
    
    // Utility functions
    getConfidenceInterval,
    calculateAccuracy,
    combineModels,
    getTimeSeriesData,
    resetPredictions,
    
    // Current state access
    currentState: state
  };
}

export default useClinicalPredictionController;

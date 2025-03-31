/**
 * NOVAMIND Neural Visualization
 * BrainRegionDetails Molecular Component - comprehensive analysis interface
 * for specific neural regions with clinical precision
 */

import React, { useMemo, useState } from 'react';
import { BrainModel, BrainRegion, NeuralConnection } from '@domain/types/brain/models';
import { Patient, Symptom, Diagnosis } from '@domain/types/clinical/patient';
import { TreatmentResponsePrediction } from '@domain/types/clinical/treatment';
import { SymptomNeuralMapping, DiagnosisNeuralMapping } from '@domain/models/brainMapping';
import { SafeArray } from '@domain/types/common';

// Neural-safe prop definition with explicit typing
interface BrainRegionDetailsProps {
  // Region identification
  regionId: string;
  brainModel: BrainModel;
  
  // Clinical data
  patient?: Patient;
  symptoms?: Symptom[];
  diagnoses?: Diagnosis[];
  treatmentPredictions?: TreatmentResponsePrediction[];
  
  // Mapping data
  symptomMappings?: SymptomNeuralMapping[];
  diagnosisMappings?: DiagnosisNeuralMapping[];
  
  // Event callbacks
  onClose: () => void;
  onConnectedRegionSelect?: (regionId: string) => void;
  className?: string;
}

/**
 * BrainRegionDetails - Molecular component for detailed region analysis
 * Implements comprehensive clinical analysis with neuropsychiatric precision
 */
const BrainRegionDetails: React.FC<BrainRegionDetailsProps> = ({
  regionId,
  brainModel,
  patient,
  symptoms,
  diagnoses,
  treatmentPredictions,
  symptomMappings,
  diagnosisMappings,
  onClose,
  onConnectedRegionSelect,
  className = ''
}) => {
  // Local state
  const [activeTab, setActiveTab] = useState<'overview' | 'connectivity' | 'clinical' | 'treatment'>('overview');
  
  // Safe array wrappers for null safety
  const safeRegions = new SafeArray(brainModel.regions);
  const safeConnections = new SafeArray(brainModel.connections);
  const safeSymptoms = new SafeArray(symptoms);
  const safeDiagnoses = new SafeArray(diagnoses);
  const safeSymptomMappings = new SafeArray(symptomMappings);
  const safeDiagnosisMappings = new SafeArray(diagnosisMappings);
  const safeTreatmentPredictions = new SafeArray(treatmentPredictions);
  
  // Get the region data with null safety
  const region = useMemo(() => {
    return safeRegions.find(r => r.id === regionId);
  }, [safeRegions, regionId]);
  
  // If region not found, display error
  if (!region) {
    return (
      <div className={`bg-gray-900 rounded-lg shadow-xl p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-medium">Region Not Found</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <p className="text-gray-300">The specified region could not be found.</p>
      </div>
    );
  }
  
  // Get connections for this region
  const regionConnections = useMemo(() => {
    return safeConnections.filter(conn => 
      conn.sourceId === regionId || conn.targetId === regionId
    ).toArray();
  }, [safeConnections, regionId]);
  
  // Get connected regions
  const connectedRegions = useMemo(() => {
    const connectedIds = regionConnections.flatMap(conn => {
      if (conn.sourceId === regionId) return [conn.targetId];
      if (conn.targetId === regionId) return [conn.sourceId];
      return [];
    });
    
    return safeRegions
      .filter(r => connectedIds.includes(r.id))
      .toArray();
  }, [safeRegions, regionConnections, regionId]);
  
  // Map symptoms to this region using symptom mappings
  const relatedSymptoms = useMemo(() => {
    const symptoms = new SafeArray([]);
    
    // Search through symptom mappings for this region
    safeSymptomMappings.forEach(mapping => {
      const patterns = new SafeArray(mapping.activationPatterns);
      const affectsRegion = patterns.some(pattern => 
        new SafeArray(pattern.regionIds).includes(regionId)
      );
      
      if (affectsRegion) {
        // Find the corresponding symptom in the active symptoms
        const matchingSymptom = safeSymptoms.find(s => 
          s.id === mapping.symptomId || s.name === mapping.symptomName
        );
        
        if (matchingSymptom) {
          symptoms.push(matchingSymptom);
        }
      }
    });
    
    return symptoms.toArray();
  }, [safeSymptomMappings, safeSymptoms, regionId]);
  
  // Map diagnoses to this region using diagnosis mappings
  const relatedDiagnoses = useMemo(() => {
    const diagnoses = new SafeArray([]);
    
    // Search through diagnosis mappings for this region
    safeDiagnosisMappings.forEach(mapping => {
      const patterns = new SafeArray(mapping.activationPatterns);
      const affectsRegion = patterns.some(pattern => 
        new SafeArray(pattern.regionIds).includes(regionId)
      );
      
      if (affectsRegion) {
        // Find the corresponding diagnosis in the active diagnoses
        const matchingDiagnosis = safeDiagnoses.find(d => 
          d.id === mapping.diagnosisId || d.name === mapping.diagnosisName
        );
        
        if (matchingDiagnosis) {
          diagnoses.push(matchingDiagnosis);
        }
      }
    });
    
    return diagnoses.toArray();
  }, [safeDiagnosisMappings, safeDiagnoses, regionId]);
  
  // Find treatment effects on this region
  const treatmentEffects = useMemo(() => {
    // Check all treatment predictions for effects on this region
    const effects = safeTreatmentPredictions.flatMap(prediction => {
      const neurobiologicalMechanisms = new SafeArray(prediction.neurobiologicalMechanisms);
      
      // Filter mechanisms that affect this region
      const relevantMechanisms = neurobiologicalMechanisms.filter(mechanism => 
        new SafeArray(mechanism.relevantRegions).includes(regionId)
      );
      
      if (relevantMechanisms.size() === 0) return [];
      
      // Return effect information
      return [{
        treatmentType: prediction.treatmentType,
        responseProbability: prediction.prediction.responseProbability,
        mechanisms: relevantMechanisms.toArray(),
        expectedImpact: prediction.prediction.responseType === 'remission' || 
                        prediction.prediction.responseType === 'response' ? 'positive' : 
                        prediction.prediction.responseType === 'partial_response' ? 'moderate' : 'minimal',
      }];
    }).toArray();
    
    return effects;
  }, [safeTreatmentPredictions, regionId]);
  
  // Handle tab change
  const handleTabChange = (tab: 'overview' | 'connectivity' | 'clinical' | 'treatment') => {
    setActiveTab(tab);
  };
  
  // Handle connected region selection
  const handleConnectedRegionClick = (id: string) => {
    if (onConnectedRegionSelect) {
      onConnectedRegionSelect(id);
    }
  };
  
  // Render activity level indicator
  const renderActivityIndicator = (activityLevel: number) => {
    const width = `${Math.max(1, Math.round(activityLevel * 100))}%`;
    
    let color = 'bg-gray-600';
    if (activityLevel > 0.8) color = 'bg-red-500';
    else if (activityLevel > 0.6) color = 'bg-orange-500';
    else if (activityLevel > 0.4) color = 'bg-yellow-500';
    else if (activityLevel > 0.2) color = 'bg-blue-500';
    
    return (
      <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width }}></div>
        <div className="mt-1 text-right text-xs text-gray-400">
          {Math.round(activityLevel * 100)}% activity
        </div>
      </div>
    );
  };
  
  return (
    <div className={`p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white text-lg font-semibold flex items-center">
            <span className="mr-2">🧠</span>
            {region.name}
          </h3>
          <p className="text-gray-400 text-sm mt-1">Region ID: {region.id}</p>
        </div>
        
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      
      {/* Activity state */}
      <div className="mb-6">
        <div className="text-white text-sm mb-2">Neural Activity</div>
        {renderActivityIndicator(region.activityLevel)}
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-700 mb-4">
        <nav className="-mb-px flex">
          <button
            onClick={() => handleTabChange('overview')}
            className={`py-2 px-4 text-sm font-medium mr-2 ${
              activeTab === 'overview'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange('connectivity')}
            className={`py-2 px-4 text-sm font-medium mr-2 ${
              activeTab === 'connectivity'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Connectivity
          </button>
          <button
            onClick={() => handleTabChange('clinical')}
            className={`py-2 px-4 text-sm font-medium mr-2 ${
              activeTab === 'clinical'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Clinical
          </button>
          <button
            onClick={() => handleTabChange('treatment')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'treatment'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Treatment
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="text-white">
          <h4 className="text-sm font-medium mb-3">Region Overview</h4>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">Status</p>
                <p className="text-sm font-medium">
                  {region.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Connections</p>
                <p className="text-sm font-medium">{regionConnections.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Related Symptoms</p>
                <p className="text-sm font-medium">{relatedSymptoms.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Related Diagnoses</p>
                <p className="text-sm font-medium">{relatedDiagnoses.length}</p>
              </div>
            </div>
          </div>
          
          {/* Location visualization (simplified - would be more detailed in real implementation) */}
          <h4 className="text-sm font-medium mb-2">Anatomical Location</h4>
          <div className="bg-gray-800 rounded-lg p-4 mb-4 h-32 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm mb-2">Position Coordinates</div>
              <div className="text-xs text-gray-400">
                {Array.isArray(region.position) 
                  ? `X: ${region.position[0].toFixed(2)}, Y: ${region.position[1].toFixed(2)}, Z: ${region.position[2].toFixed(2)}` 
                  : `X: ${region.position.x.toFixed(2)}, Y: ${region.position.y.toFixed(2)}, Z: ${region.position.z.toFixed(2)}`}
              </div>
            </div>
          </div>
          
          {/* Summary statistics */}
          <h4 className="text-sm font-medium mb-2">Summary</h4>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm">
              This region {region.isActive ? 'is currently active' : 'is currently inactive'} with 
              {region.activityLevel > 0.7 ? ' high' : 
               region.activityLevel > 0.4 ? ' moderate' : 
               region.activityLevel > 0.2 ? ' low' : ' minimal'} neural activity. 
              It has {regionConnections.length} neural pathways connecting to {connectedRegions.length} other regions.
            </p>
            
            {relatedSymptoms.length > 0 && (
              <p className="text-sm mt-2">
                This region is associated with {relatedSymptoms.length} clinical symptoms
                {relatedSymptoms.length > 0 ? `, including ${relatedSymptoms.slice(0, 2).map(s => s.name).join(', ')}` : ''}.
              </p>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'connectivity' && (
        <div className="text-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Neural Connectivity</h4>
            <span className="text-xs text-gray-400">{regionConnections.length} Connections</span>
          </div>
          
          {regionConnections.length > 0 ? (
            <div className="space-y-3">
              {/* Connected regions */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h5 className="text-sm font-medium mb-2">Connected Regions</h5>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {connectedRegions.map(connectedRegion => {
                    // Find the connection details
                    const connection = regionConnections.find(conn => 
                      (conn.sourceId === regionId && conn.targetId === connectedRegion.id) ||
                      (conn.targetId === regionId && conn.sourceId === connectedRegion.id)
                    );
                    
                    // Determine direction
                    const isOutgoing = connection ? connection.sourceId === regionId : false;
                    
                    return (
                      <div 
                        key={connectedRegion.id}
                        className="bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600"
                        onClick={() => handleConnectedRegionClick(connectedRegion.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium">{connectedRegion.name}</span>
                            {isOutgoing ? (
                              <span className="ml-2 text-green-400 text-xs">→ outgoing</span>
                            ) : (
                              <span className="ml-2 text-blue-400 text-xs">← incoming</span>
                            )}
                          </div>
                          <span className="text-xs bg-gray-900 rounded-full px-2 py-0.5">
                            {connection ? (connection.strength * 100).toFixed(0) : 0}% strength
                          </span>
                        </div>
                        
                        {connection && (
                          <div className="mt-1 w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`${isOutgoing ? 'bg-green-500' : 'bg-blue-500'} h-full rounded-full`}
                              style={{ width: `${Math.max(1, Math.round(connection.strength * 100))}%` }}
                            ></div>
                          </div>
                        )}
                        
                        <div className="mt-2 flex justify-between text-xs text-gray-400">
                          <span>Activity: {(connectedRegion.activityLevel * 100).toFixed(0)}%</span>
                          <span>Type: {connection?.type || 'unknown'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Connectivity statistics */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h5 className="text-sm font-medium mb-2">Connectivity Statistics</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Incoming Connections</p>
                    <p className="text-sm font-medium">
                      {regionConnections.filter(conn => conn.targetId === regionId).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Outgoing Connections</p>
                    <p className="text-sm font-medium">
                      {regionConnections.filter(conn => conn.sourceId === regionId).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Average Strength</p>
                    <p className="text-sm font-medium">
                      {regionConnections.length > 0
                        ? `${(regionConnections.reduce((sum, conn) => sum + conn.strength, 0) / regionConnections.length * 100).toFixed(0)}%`
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Connection Types</p>
                    <p className="text-sm font-medium">
                      {(() => {
                        const types = regionConnections.map(conn => conn.type);
                        const uniqueTypes = [...new Set(types)];
                        return uniqueTypes.join(', ');
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400">No connections found for this region.</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'clinical' && (
        <div className="text-white">
          <h4 className="text-sm font-medium mb-3">Clinical Correlations</h4>
          
          {/* Symptoms */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium">Related Symptoms</h5>
              <span className="text-xs text-gray-400">{relatedSymptoms.length} Found</span>
            </div>
            
            {relatedSymptoms.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {relatedSymptoms.map(symptom => (
                  <div key={symptom.id} className="bg-gray-700 rounded p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium">{symptom.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{symptom.category}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-red-900 rounded-full w-5 h-5 flex items-center justify-center">
                          <span className="text-xs">{symptom.severity}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs">
                      <span className="text-gray-400">Impact: </span>
                      <span>{symptom.impact}</span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-400">Progression: </span>
                      <span>{symptom.progression}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No symptoms associated with this region.</p>
            )}
          </div>
          
          {/* Diagnoses */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium">Related Diagnoses</h5>
              <span className="text-xs text-gray-400">{relatedDiagnoses.length} Found</span>
            </div>
            
            {relatedDiagnoses.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {relatedDiagnoses.map(diagnosis => (
                  <div key={diagnosis.id} className="bg-gray-700 rounded p-2">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">{diagnosis.name}</div>
                      <div className="text-xs text-gray-400">{diagnosis.code}</div>
                    </div>
                    
                    <div className="mt-1.5 flex justify-between text-xs">
                      <div>
                        <span className="text-gray-400">Severity: </span>
                        <span>{diagnosis.severity}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status: </span>
                        <span>{diagnosis.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No diagnoses associated with this region.</p>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'treatment' && (
        <div className="text-white">
          <h4 className="text-sm font-medium mb-3">Treatment Response Predictions</h4>
          
          {treatmentEffects.length > 0 ? (
            <div className="space-y-4">
              {treatmentEffects.map((effect, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium">
                      {effect.treatmentType.charAt(0).toUpperCase() + effect.treatmentType.slice(1).replace('_', ' ')}
                    </h5>
                    <div className={`
                      text-xs px-2 py-0.5 rounded-full font-medium
                      ${effect.expectedImpact === 'positive' ? 'bg-green-900 text-green-300' : 
                        effect.expectedImpact === 'moderate' ? 'bg-yellow-900 text-yellow-300' : 
                        'bg-red-900 text-red-300'}
                    `}>
                      {effect.expectedImpact.charAt(0).toUpperCase() + effect.expectedImpact.slice(1)} Impact
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-1">Response Probability</div>
                    <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
                      <div
                        className={`
                          ${effect.responseProbability > 0.7 ? 'bg-green-500' : 
                            effect.responseProbability > 0.4 ? 'bg-yellow-500' : 
                            'bg-red-500'} 
                          h-full rounded-full
                        `}
                        style={{ width: `${Math.max(1, Math.round(effect.responseProbability * 100))}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-right text-xs text-gray-400">
                      {Math.round(effect.responseProbability * 100)}% probability
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-300">
                    <h6 className="font-medium mb-1">Neurobiological Mechanisms:</h6>
                    <ul className="space-y-1 pl-4 list-disc">
                      {effect.mechanisms.map((mechanism, i) => (
                        <li key={i}>
                          {mechanism.pathwayName} 
                          <span className="text-gray-400 ml-1">
                            ({mechanism.confidenceLevel})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400">No treatment data available for this region.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(BrainRegionDetails);

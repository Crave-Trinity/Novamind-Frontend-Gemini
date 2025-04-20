/* eslint-disable */
/**
 * NOVAMIND Neural Visualization
 * ClinicalDataOverlay Molecular Component - neuropsychiatric clinical metrics
 * with HIPAA-compliant data presentation and quantum-level precision
 */

import React, { useState, useMemo } from 'react'; // Removed unused useCallback
import type { BrainModel } from '@domain/types/brain/models';
// Removed unused BrainRegion type import
import type { Patient, Symptom, Diagnosis } from '@domain/types/clinical/patient';
import type { RiskAssessment } from '@domain/types/clinical/risk';
import { RiskLevel, RiskAssessmentOps } from '@domain/types/clinical/risk';
import { SafeArray } from '@domain/types/shared/common';

// Neural-safe prop definition with explicit typing
interface ClinicalDataOverlayProps {
  // Clinical data
  patient?: Patient;
  symptoms?: Symptom[];
  diagnoses?: Diagnosis[];
  riskAssessment?: RiskAssessment;

  // Brain model data
  brainModel: BrainModel;
  selectedRegionIds: string[];

  // Display options
  compact?: boolean;
  maxSymptoms?: number;
  maxDiagnoses?: number;
  showRiskMetrics?: boolean;
  showPatientInfo?: boolean;
  className?: string;
}

/**
 * ClinicalDataOverlay - Molecular component for clinical metrics display
 * Implements HIPAA-compliant data presentation with clinical precision
 */
const ClinicalDataOverlay: React.FC<ClinicalDataOverlayProps> = ({
  patient,
  symptoms,
  diagnoses,
  riskAssessment,
  brainModel,
  selectedRegionIds,
  compact = false,
  maxSymptoms = 5,
  maxDiagnoses = 3,
  showRiskMetrics = true,
  showPatientInfo = true,
  className = '',
}) => {
  // Local state
  const [activeTab, setActiveTab] = useState<'overview' | 'symptoms' | 'regions' | 'risk'>(
    'overview'
  );
  const [expanded, setExpanded] = useState<boolean>(false);

  // Safe array wrappers for null safety
  const safeSymptoms = new SafeArray(symptoms);
  const safeDiagnoses = new SafeArray(diagnoses);
  const safeRegions = new SafeArray(brainModel.regions);
  const safeSelectedIds = new SafeArray(selectedRegionIds);

  // Get selected regions with type safety
  const selectedRegions = useMemo(() => {
    return safeRegions.filter((region) => safeSelectedIds.includes(region.id)).toArray();
  }, [safeRegions, safeSelectedIds]);

  // Get active regions (with significant activity)
  const activeRegions = useMemo(() => {
    return safeRegions.filter((region) => region.isActive || region.activityLevel > 0.3).toArray();
  }, [safeRegions]);

  // Filter symptoms by severity and recentness
  const prioritizedSymptoms = useMemo(() => {
    // Convert to array before sorting
    return safeSymptoms
      .toArray()
      .sort((a, b) => b.severity - a.severity) // Sort by severity (high to low)
      .slice(0, expanded ? undefined : maxSymptoms); // Limit if not expanded
    // Removed redundant .toArray()
  }, [safeSymptoms, maxSymptoms, expanded]);

  // Filter diagnoses for display
  const prioritizedDiagnoses = useMemo(() => {
    // Convert to array before sorting and slicing
    return safeDiagnoses
      .toArray()
      .sort((a, b) => {
        // "active" status gets priority
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;

        // Then by severity (severe > moderate > mild)
        const severityScore = (severity: string): number => {
          if (severity === 'severe') return 3;
          if (severity === 'moderate') return 2;
          if (severity === 'mild') return 1;
          return 0;
        };
        return severityScore(b.severity) - severityScore(a.severity);
      })
      .slice(0, expanded ? undefined : maxDiagnoses); // Limit if not expanded
    // Removed redundant .toArray()
  }, [safeDiagnoses, maxDiagnoses, expanded]);

  // Get risk level with null safety
  const overallRiskLevel = useMemo(() => {
    return riskAssessment ? RiskAssessmentOps.getRiskLevel(riskAssessment) : RiskLevel.UNKNOWN;
  }, [riskAssessment]);

  // Removed unused priorityRiskDomain calculation

  // Event handlers
  const handleTabChange = (tab: 'overview' | 'symptoms' | 'regions' | 'risk') => {
    setActiveTab(tab);
  };

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  // Render risk level badge with appropriate color
  const renderRiskBadge = (level: RiskLevel) => {
    const colorMap: Record<RiskLevel, string> = {
      [RiskLevel.NONE]: 'bg-green-500',
      [RiskLevel.LOW]: 'bg-blue-500',
      [RiskLevel.MODERATE]: 'bg-yellow-500',
      [RiskLevel.HIGH]: 'bg-orange-500',
      [RiskLevel.SEVERE]: 'bg-red-500',
      [RiskLevel.UNKNOWN]: 'bg-gray-500',
    };

    const textMap: Record<RiskLevel, string> = {
      [RiskLevel.NONE]: 'No Risk',
      [RiskLevel.LOW]: 'Low Risk',
      [RiskLevel.MODERATE]: 'Moderate Risk',
      [RiskLevel.HIGH]: 'High Risk',
      [RiskLevel.SEVERE]: 'Severe Risk',
      [RiskLevel.UNKNOWN]: 'Unknown Risk',
    };

    return (
      <span
        className={`${colorMap[level]} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
      >
        {textMap[level]}
      </span>
    );
  };

  // Render symptom severity indicator
  const renderSeverityIndicator = (severity: number) => {
    let color = 'bg-gray-400';
    if (severity >= 8) color = 'bg-red-500';
    else if (severity >= 6) color = 'bg-orange-500';
    else if (severity >= 4) color = 'bg-yellow-500';
    else if (severity >= 2) color = 'bg-blue-500';
    else if (severity > 0) color = 'bg-green-500';

    return (
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full ${color} mr-1.5`}></div>
        <span>{severity}/10</span>
      </div>
    );
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
      <div className="w-full bg-gray-900 rounded-full h-1 overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width }}></div>
      </div>
    );
  };

  // Compact view for minimal display
  if (compact) {
    return (
      <div className={`bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 ${className}`}>
        <div className="flex items-center gap-3 text-white text-xs">
          {/* Diagnosis count */}
          {safeDiagnoses.size() > 0 && (
            <div className="flex items-center">
              <span className="text-purple-400 mr-1.5">🏥</span>
              <span>{safeDiagnoses.size()} Diagnoses</span>
            </div>
          )}

          {/* Symptom count */}
          {safeSymptoms.size() > 0 && (
            <div className="flex items-center">
              <span className="text-red-400 mr-1.5">⚠️</span>
              <span>{safeSymptoms.size()} Symptoms</span>
            </div>
          )}

          {/* Selected region count */}
          {selectedRegions.length > 0 && (
            <div className="flex items-center">
              <span className="text-blue-400 mr-1.5">🔍</span>
              <span>{selectedRegions.length} Regions Selected</span>
            </div>
          )}

          {/* Risk level */}
          {showRiskMetrics && riskAssessment && (
            <div className="flex items-center ml-auto">{renderRiskBadge(overallRiskLevel)}</div>
          )}
        </div>
      </div>
    );
  }

  // Full view with tabs
  return (
    <div className={`bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden ${className}`}>
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-800">
        <button
          onClick={() => handleTabChange('overview')}
          className={`px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-white bg-blue-600'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => handleTabChange('symptoms')}
          className={`px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'symptoms'
              ? 'text-white bg-blue-600'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
        >
          Symptoms
        </button>
        <button
          onClick={() => handleTabChange('regions')}
          className={`px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'regions'
              ? 'text-white bg-blue-600'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
        >
          Regions
        </button>
        {showRiskMetrics && (
          <button
            onClick={() => handleTabChange('risk')}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === 'risk'
                ? 'text-white bg-blue-600'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Risk
          </button>
        )}

        {/* Expand/collapse toggle */}
        <button
          onClick={toggleExpanded}
          className="ml-auto px-3 py-2 text-gray-300 hover:text-white"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      {/* Tab content */}
      <div className="p-3">
        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="text-white">
            {/* Patient info */}
            {showPatientInfo && patient && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-300 mb-1">Patient Information</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">Age:</span>
                    <span>{patient.demographicData.age}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">Sex:</span>
                    <span>{patient.demographicData.biologicalSex}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">Diagnoses:</span>
                    <span>{safeDiagnoses.size()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">Symptoms:</span>
                    <span>{safeSymptoms.size()}</span>
                  </div>
                  {riskAssessment && (
                    <div className="flex items-center col-span-2 mt-1">
                      <span className="text-gray-400 mr-2">Risk Level:</span>
                      {renderRiskBadge(overallRiskLevel)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Primary diagnoses */}
            {safeDiagnoses.size() > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-300 mb-1">Primary Diagnoses</h4>
                <div className="space-y-1">
                  {prioritizedDiagnoses.map((diagnosis) => (
                    <div key={diagnosis.id} className="bg-black/20 rounded p-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{diagnosis.name}</span>
                        <span className="text-2xs text-gray-400">
                          {diagnosis.codingSystem}: {diagnosis.code}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-2xs text-gray-300">
                        <span>{diagnosis.severity}</span>
                        <span>{diagnosis.status}</span>
                      </div>
                    </div>
                  ))}

                  {!expanded && safeDiagnoses.size() > maxDiagnoses && (
                    <div
                      className="text-center text-xs text-blue-400 py-1 cursor-pointer hover:underline"
                      onClick={toggleExpanded}
                    >
                      Show {safeDiagnoses.size() - maxDiagnoses} more diagnoses
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Top symptoms */}
            {safeSymptoms.size() > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-300 mb-1">Active Symptoms</h4>
                <div className="space-y-1">
                  {prioritizedSymptoms.map((symptom) => (
                    <div key={symptom.id} className="bg-black/20 rounded p-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{symptom.name}</span>
                        {renderSeverityIndicator(symptom.severity)}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-2xs text-gray-300">
                        <span>{symptom.category}</span>
                        <span>{symptom.progression}</span>
                      </div>
                    </div>
                  ))}

                  {!expanded && safeSymptoms.size() > maxSymptoms && (
                    <div
                      className="text-center text-xs text-blue-400 py-1 cursor-pointer hover:underline"
                      onClick={toggleExpanded}
                    >
                      Show {safeSymptoms.size() - maxSymptoms} more symptoms
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Symptoms tab */}
        {activeTab === 'symptoms' && (
          <div className="text-white">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-300">Symptom Details</h4>
              <span className="text-xs text-gray-400">{safeSymptoms.size()} Total</span>
            </div>

            {safeSymptoms.size() > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {(expanded ? safeSymptoms.toArray() : safeSymptoms.toArray().slice(0, 10)).map(
                  (symptom) => (
                    <div key={symptom.id} className="bg-black/30 rounded p-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{symptom.name}</span>
                        {renderSeverityIndicator(symptom.severity)}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-2xs text-gray-300">
                        <div>
                          <span className="text-gray-400">Category:</span> {symptom.category}
                        </div>
                        <div>
                          <span className="text-gray-400">Frequency:</span> {symptom.frequency}
                        </div>
                        <div>
                          <span className="text-gray-400">Impact:</span> {symptom.impact}
                        </div>
                        <div>
                          <span className="text-gray-400">Progression:</span> {symptom.progression}
                        </div>
                      </div>
                      {symptom.triggers && symptom.triggers.length > 0 && (
                        <div className="mt-1 text-2xs">
                          <span className="text-gray-400">Triggers:</span>{' '}
                          {symptom.triggers.join(', ')}
                        </div>
                      )}
                    </div>
                  )
                )}

                {!expanded && safeSymptoms.size() > 10 && (
                  <div
                    className="text-center text-xs text-blue-400 py-1 cursor-pointer hover:underline"
                    onClick={toggleExpanded}
                  >
                    Show {safeSymptoms.size() - 10} more symptoms
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-gray-400">
                No symptom data available
              </div>
            )}
          </div>
        )}

        {/* Regions tab */}
        {activeTab === 'regions' && (
          <div className="text-white">
            {/* Selected regions */}
            {selectedRegions.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-300">Selected Regions</h4>
                  <span className="text-xs text-gray-400">{selectedRegions.length} Selected</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {selectedRegions.map((region) => (
                    <div key={region.id} className="bg-blue-600/30 rounded p-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{region.name}</span>
                        <span className="text-2xs">
                          {(region.activityLevel * 100).toFixed(0)}% Activity
                        </span>
                      </div>
                      <div className="mt-1">{renderActivityIndicator(region.activityLevel)}</div>
                      {region.connections && region.connections.length > 0 && (
                        <div className="mt-1 text-2xs text-gray-300">
                          <span>{region.connections.length} connections</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active regions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-300">Most Active Regions</h4>
                <span className="text-xs text-gray-400">{activeRegions.length} Active</span>
              </div>

              {activeRegions.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {activeRegions
                    .sort((a, b) => b.activityLevel - a.activityLevel)
                    .slice(0, expanded ? undefined : 5)
                    .map((region) => (
                      <div
                        key={region.id}
                        className={`bg-black/30 rounded p-2 text-xs ${
                          safeSelectedIds.includes(region.id) ? 'ring-1 ring-blue-500' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{region.name}</span>
                          <span className="text-2xs">
                            {(region.activityLevel * 100).toFixed(0)}% Activity
                          </span>
                        </div>
                        <div className="mt-1">{renderActivityIndicator(region.activityLevel)}</div>
                      </div>
                    ))}

                  {!expanded && activeRegions.length > 5 && (
                    <div
                      className="text-center text-xs text-blue-400 py-1 cursor-pointer hover:underline"
                      onClick={toggleExpanded}
                    >
                      Show {activeRegions.length - 5} more active regions
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-gray-400">
                  No active regions detected
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risk tab */}
        {activeTab === 'risk' && showRiskMetrics && (
          <div className="text-white">
            {/* Overall risk */}
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-300 mb-1">Overall Risk Assessment</h4>

              {riskAssessment ? (
                <div className="bg-black/30 rounded p-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Risk Level</span>
                    {renderRiskBadge(overallRiskLevel)}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-gray-400 mb-0.5">Confidence Level</div>
                      <div className="bg-black/20 rounded px-2 py-1">
                        {(riskAssessment.confidenceScore * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-0.5">Temporal Trend</div>
                      <div className="bg-black/20 rounded px-2 py-1">
                        {riskAssessment.temporalTrend}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-0.5">Assessment Type</div>
                      <div className="bg-black/20 rounded px-2 py-1">
                        {riskAssessment.assessmentType}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-0.5">Last Updated</div>
                      <div className="bg-black/20 rounded px-2 py-1">
                        {new Date(riskAssessment.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-gray-400">
                  No risk assessment data available
                </div>
              )}
            </div>

            {/* Domain risks */}
            {riskAssessment && riskAssessment.domainRisks && (
              <div>
                <h4 className="text-xs font-medium text-gray-300 mb-1">Domain-Specific Risks</h4>

                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {riskAssessment.domainRisks
                    .sort((a, b) => {
                      // Sort by risk level (high to low)
                      const riskScore = (level: RiskLevel): number => {
                        switch (level) {
                          case RiskLevel.SEVERE:
                            return 4;
                          case RiskLevel.HIGH:
                            return 3;
                          case RiskLevel.MODERATE:
                            return 2;
                          case RiskLevel.LOW:
                            return 1;
                          default:
                            return 0;
                        }
                      };
                      return riskScore(b.riskLevel) - riskScore(a.riskLevel);
                    })
                    .slice(0, expanded ? undefined : 3)
                    .map((domain) => (
                      <div key={domain.domain} className="bg-black/30 rounded p-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {domain.domain
                              .split('_')
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(' ')}
                          </span>
                          {renderRiskBadge(domain.riskLevel)}
                        </div>

                        <div className="mt-2 flex justify-between items-center text-2xs text-gray-300">
                          <span>Confidence: {(domain.confidenceScore * 100).toFixed(0)}%</span>
                          <span>Urgency: {domain.urgency}</span>
                        </div>

                        {domain.evidence && domain.evidence.length > 0 && (
                          <div className="mt-1 text-2xs text-gray-300">
                            <span className="text-gray-400">Evidence:</span>{' '}
                            {domain.evidence.slice(0, 2).join(', ')}
                            {domain.evidence.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    ))}

                  {!expanded && riskAssessment.domainRisks.length > 3 && (
                    <div
                      className="text-center text-xs text-blue-400 py-1 cursor-pointer hover:underline"
                      onClick={toggleExpanded}
                    >
                      Show {riskAssessment.domainRisks.length - 3} more risk domains
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ClinicalDataOverlay);

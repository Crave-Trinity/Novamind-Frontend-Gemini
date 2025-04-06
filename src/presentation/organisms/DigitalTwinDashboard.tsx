import React, { useState } from 'react';

import { DigitalTwinProfile } from '@domain/models/clinical/digital-twin-profile';
import Button from '@presentation/atoms/Button';
import ClinicalMetricsGroup from '@presentation/molecules/ClinicalMetricsCard';

import BrainVisualization from '@presentation/organisms/BrainVisualization';
import RiskAssessmentPanel from '@presentation/organisms/RiskAssessmentPanel';
import TreatmentResponsePredictor from '@presentation/organisms/TreatmentResponsePredictor';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'brain' | 'metrics' | 'predictions'>(
    'overview'
  );

  // Active brain region for highlighting
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  // Handle brain region click
  const handleRegionClick = (regionId: string) => {
    setActiveRegion(regionId);
    setActiveTab('brain');
  };

  return (
    <div
      className={`overflow-hidden rounded-xl bg-background shadow-xl dark:bg-background ${className}`}
    >
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-800 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Digital Twin</h1>
            <p className="text-sm text-blue-100">
              {profile.primaryDiagnosis.charAt(0).toUpperCase() + profile.primaryDiagnosis.slice(1)}{' '}
              | Severity: {profile.currentSeverity}
            </p>
          </div>
          <div className="flex items-center">
            <div className="rounded-lg bg-blue-900/30 px-3 py-1 text-xs font-medium">
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
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'overview'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'brain'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
          onClick={() => setActiveTab('brain')}
        >
          Brain Model
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'metrics'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
          onClick={() => setActiveTab('metrics')}
        >
          Clinical Metrics
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'predictions'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Brain Visualization (smaller) */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-lg bg-background-card shadow-md dark:bg-background-elevated">
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                  <h3 className="font-medium">Brain Activity Model</h3>
                  <Button size="xs" variant="ghost" onClick={() => setActiveTab('brain')}>
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
                <div className="overflow-hidden rounded-lg bg-background-card shadow-md dark:bg-background-elevated">
                  <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
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
              <div className="overflow-hidden rounded-lg bg-background-card shadow-md dark:bg-background-elevated">
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                  <h3 className="font-medium">Clinical Metrics</h3>
                  <Button size="xs" variant="ghost" onClick={() => setActiveTab('metrics')}>
                    View All
                  </Button>
                </div>
                <div className="space-y-4 p-4">
                  {profile.assessmentScores.slice(0, 3).map((score) => (
                    <ClinicalMetricsGroup key={score.id} title={score.type} metrics={[score]} />
                  ))}
                </div>
              </div>

              {/* Treatment Summary */}
              <div className="mt-6">
                <div className="overflow-hidden rounded-lg bg-background-card shadow-md dark:bg-background-elevated">
                  <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                    <h3 className="font-medium">Treatment Plan</h3>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Current Treatments
                      </h4>
                      <div className="space-y-2">
                        {profile.treatmentPlan.treatments.map((treatment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded bg-background-lighter p-2 dark:bg-background-card"
                          >
                            <div>
                              <span className="font-medium capitalize">{treatment.type}</span>
                              <p className="text-xs text-neutral-500">{treatment.details}</p>
                            </div>
                            <div className="text-xs text-neutral-500">{treatment.timeframe}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Treatment Efficacy
                      </h4>
                      <div className="mb-1 h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{
                            width: `${profile.treatmentPlan.effectiveness}%`,
                          }}
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
            <div className="overflow-hidden rounded-lg bg-background-card shadow-md dark:bg-background-elevated">
              <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
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
                  <div className="mt-6 rounded-lg bg-background-lighter p-4 dark:bg-background-card">
                    <h3 className="mb-2 font-medium">Region Details</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Activity Levels
                        </h4>
                        {/* We would render activity charts here */}
                        <div className="flex h-32 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800">
                          <p className="text-sm text-neutral-500">
                            Activity chart would render here
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Clinical Significance
                        </h4>
                        <div className="flex h-32 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800">
                          <p className="text-sm text-neutral-500">
                            Clinical correlation would render here
                          </p>
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
            <div className="overflow-hidden rounded-lg bg-background-card shadow-md dark:bg-background-elevated">
              <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <h3 className="font-medium">Clinical Metrics</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-6">
                  {/* Depression Metrics */}
                  <ClinicalMetricsGroup
                    title="Depression Metrics"
                    metrics={profile.assessmentScores.filter((score) =>
                      ['PHQ9', 'BDI', 'MADRS'].includes(score.type)
                    )}
                  />

                  {/* Anxiety Metrics */}
                  <ClinicalMetricsGroup
                    title="Anxiety Metrics"
                    metrics={profile.assessmentScores.filter((score) =>
                      ['GAD7', 'HAM-A', 'DASS'].includes(score.type)
                    )}
                  />

                  {/* Functional Metrics */}
                  <ClinicalMetricsGroup
                    title="Functional Metrics"
                    metrics={profile.assessmentScores.filter((score) =>
                      ['WSAS', 'SF-36', 'Q-LES-Q'].includes(score.type)
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Biomarker Data */}
            <div className="mt-6">
              <div className="overflow-hidden rounded-lg bg-background-card shadow-md dark:bg-background-elevated">
                <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                  <h3 className="font-medium">Biomarker Data</h3>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                      <thead>
                        <tr>
                          <th className="bg-neutral-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
                            Biomarker
                          </th>
                          <th className="bg-neutral-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
                            Value
                          </th>
                          <th className="bg-neutral-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
                            Reference Range
                          </th>
                          <th className="bg-neutral-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
                            Status
                          </th>
                          <th className="bg-neutral-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
                            Trend
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-background-card">
                        {profile.biomarkers.map((biomarker) => (
                          <tr key={biomarker.id}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                              {biomarker.name}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                              {biomarker.value} {biomarker.unit}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                              {biomarker.referenceRange.min} - {biomarker.referenceRange.max}{' '}
                              {biomarker.unit}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                                  biomarker.isAbnormal
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                }`}
                              >
                                {biomarker.isAbnormal ? 'Abnormal' : 'Normal'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                              <div className="flex items-center">
                                {biomarker.trend === 'increasing' && (
                                  <svg
                                    className="mr-1 h-4 w-4 text-red-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                                    />
                                  </svg>
                                )}
                                {biomarker.trend === 'decreasing' && (
                                  <svg
                                    className="mr-1 h-4 w-4 text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                    />
                                  </svg>
                                )}
                                {biomarker.trend === 'stable' && (
                                  <svg
                                    className="mr-1 h-4 w-4 text-blue-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 12h14"
                                    />
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
            <div className="overflow-hidden rounded-lg bg-background-card shadow-md dark:bg-background-elevated">
              <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <h3 className="font-medium">Treatment Response Prediction</h3>
              </div>
              <div className="p-4">
                <TreatmentResponsePredictor patientId={patientId} profile={profile} />
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="overflow-hidden rounded-lg bg-background-card shadow-md dark:bg-background-elevated">
              <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
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
            <div className="overflow-hidden rounded-lg bg-background-card shadow-md dark:bg-background-elevated">
              <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <h3 className="font-medium">Outcome Prediction</h3>
              </div>
              <div className="p-4">
                <div className="flex h-96 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-900">
                  <p className="text-neutral-500">Outcome prediction chart would render here</p>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-background p-4 dark:bg-background-card">
                    <h4 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Short-term (4 weeks)
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        25%
                      </div>
                      <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-600 dark:bg-green-900 dark:text-green-200">
                        Improving
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Expected symptom reduction over next 4 weeks
                    </p>
                  </div>
                  <div className="rounded-lg bg-background p-4 dark:bg-background-card">
                    <h4 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Medium-term (12 weeks)
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        45%
                      </div>
                      <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-600 dark:bg-green-900 dark:text-green-200">
                        Improving
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Expected symptom reduction over next 12 weeks
                    </p>
                  </div>
                  <div className="rounded-lg bg-background p-4 dark:bg-background-card">
                    <h4 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Long-term (24 weeks)
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        65%
                      </div>
                      <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-600 dark:bg-green-900 dark:text-green-200">
                        Improving
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Expected symptom reduction over next 24 weeks
                    </p>
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

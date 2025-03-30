import React, { useState } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";

import { RiskAssessment } from "../../domain/models/PatientModel";
import {
  xgboostService,
  RiskPredictionRequest,
} from "../../infrastructure/api/XGBoostService";
import Button from "../atoms/Button";

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
  className = "",
}) => {
  // Sort risk assessments by date (newest first)
  const sortedRiskAssessments = [...riskAssessments].sort(
    (a, b) => new Date(b.date || new Date().toISOString()).getTime() - new Date(a.date || new Date().toISOString()).getTime(),
  );

  // Active risk type selection
  const [activeRiskType, setActiveRiskType] = useState<"relapse" | "suicide">(
    "relapse",
  );

  // Clinical data for new prediction
  const [clinicalData, setClinicalData] = useState({
    phq9_score: 0,
    gad7_score: 0,
    severity: "moderate",
    diagnosis: "depression",
  });

  // Mutation for making risk predictions
  const {
    mutate: predictRisk,
    isPending: isPredicting,
    error: predictionError,
    data: predictionResult,
    reset: resetPrediction,
  } = useMutation({
    mutationFn: async () => {
    const request: RiskPredictionRequest = {
      patient_id: patientId,
      risk_type: activeRiskType,
      clinical_data: {
        assessment_scores: {
          phq9: clinicalData.phq9_score,
          gad7: clinicalData.gad7_score,
        },
        severity: clinicalData.severity,
        diagnosis: clinicalData.diagnosis,
      },
      confidence_threshold: 0.7,
    };

    return xgboostService.predictRisk(request);
    }
  });

  // Handle risk type change
  const handleRiskTypeChange = (type: "relapse" | "suicide") => {
    setActiveRiskType(type);
    resetPrediction();
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e?.target;
    setClinicalData((prev) => ({
      ...prev,
      [name]: name.includes("score") ? parseInt(value, 10) : value,
    }));
  };

  // Get severity color class
  const getSeverityColorClass = (severity: string) => {
    switch (severity) {
      case "none":
        return "bg-green-500";
      case "mild":
        return "bg-yellow-500";
      case "moderate":
        return "bg-orange-500";
      case "severe":
        return "bg-red-500";
      default:
        return "bg-neutral-500";
    }
  };

  // Get severity text color class for both Severity and RiskLevel values
  const getSeverityTextClass = (severity: string) => {
    switch (severity) {
      case "none":
        return "text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900";
      case "mild":
        return "text-yellow-700 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900";
      case "moderate":
        return "text-orange-700 bg-orange-100 dark:text-orange-200 dark:bg-orange-900";
      case "severe":
        return "text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900";
      default:
        return "text-neutral-700 bg-neutral-100 dark:text-neutral-200 dark:bg-neutral-800";
    }
  };

  // Render the newest risk assessment
  const renderLatestRiskAssessment = () => {
    if (!sortedRiskAssessments.length) {
      return null;
    }

    const latest = sortedRiskAssessments[0];

    return (
      <div className="rounded-lg bg-background-card p-4 dark:bg-background-elevated">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-medium">Latest Risk Assessment</h3>
          <div className="text-xs text-neutral-500">
            {new Date(latest?.date || new Date()).toLocaleDateString()}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {latest?.riskFactors.map((factor, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-background p-3 dark:bg-background-card"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {factor.category}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${getSeverityTextClass(factor.severity)}`}
                >
                  {factor.severity}
                </span>
              </div>

              <div className="flex items-center">
                <div className="mr-2 h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className={`h-2 rounded-full ${getSeverityColorClass(factor.severity)}`}
                    style={{
                      width: `${
                        factor.severity === "none"
                          ? 0
                          : factor.severity === "mild"
                            ? 33
                            : factor.severity === "moderate"
                              ? 66
                              : 100
                      }%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center text-xs">
                  {factor.trend === "increasing" && (
                    <svg
                      className="h-3 w-3 text-red-500"
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
                  {factor.trend === "decreasing" && (
                    <svg
                      className="h-3 w-3 text-green-500"
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
                  {factor.trend === "stable" && (
                    <svg
                      className="h-3 w-3 text-neutral-500"
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
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`h-4 w-4 rounded-full ${getSeverityColorClass(latest?.overallRisk || "low")} mr-2`}
            ></div>
            <span className="font-medium">
              Overall Risk:{" "}
              <span className="capitalize">{latest?.overallRisk}</span>
            </span>
          </div>

          <div className="text-xs text-neutral-500">
            Next Assessment:{" "}
            {new Date(latest?.nextAssessmentDate || new Date()).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };

  // Render the risk prediction form in compact mode
  const renderCompactPredictionForm = () => {
    return (
      <div className="mt-4 rounded-lg bg-background-card p-4 dark:bg-background-elevated">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Predict New Risk</h3>

          <div className="flex">
            <button
              className={`rounded-l-md px-3 py-1 text-xs ${
                activeRiskType === "relapse"
                  ? "bg-primary-600 text-white"
                  : "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
              }`}
              onClick={() => handleRiskTypeChange("relapse")}
            >
              Relapse
            </button>
            <button
              className={`rounded-r-md px-3 py-1 text-xs ${
                activeRiskType === "suicide"
                  ? "bg-primary-600 text-white"
                  : "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
              }`}
              onClick={() => handleRiskTypeChange("suicide")}
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
          Run {activeRiskType.charAt(0).toUpperCase() + activeRiskType.slice(1)}{" "}
          Risk Assessment
        </Button>
      </div>
    );
  };

  // Render the full risk prediction form
  const renderFullPredictionForm = () => {
    return (
      <div className="mt-6 rounded-lg bg-background-card p-4 dark:bg-background-elevated">
        <h3 className="mb-4 text-lg font-medium">New Risk Assessment</h3>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Risk Type Selection */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Risk Type
            </label>
            <div className="flex">
              <button
                className={`flex-1 rounded-l-md px-4 py-2 text-sm font-medium ${
                  activeRiskType === "relapse"
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                }`}
                onClick={() => handleRiskTypeChange("relapse")}
              >
                Relapse Risk
              </button>
              <button
                className={`flex-1 rounded-r-md px-4 py-2 text-sm font-medium ${
                  activeRiskType === "suicide"
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                }`}
                onClick={() => handleRiskTypeChange("suicide")}
              >
                Suicide Risk
              </button>
            </div>
          </div>

          {/* Diagnosis Selection */}
          <div>
            <label
              htmlFor="diagnosis"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Primary Diagnosis
            </label>
            <select
              id="diagnosis"
              name="diagnosis"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-background-card dark:text-white"
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
            <label
              htmlFor="phq9_score"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              PHQ-9 Score
            </label>
            <input
              id="phq9_score"
              name="phq9_score"
              type="number"
              min="0"
              max="27"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-background-card dark:text-white"
              value={clinicalData.phq9_score}
              onChange={handleInputChange}
            />
          </div>

          {/* GAD7 Score */}
          <div>
            <label
              htmlFor="gad7_score"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              GAD-7 Score
            </label>
            <input
              id="gad7_score"
              name="gad7_score"
              type="number"
              min="0"
              max="21"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-background-card dark:text-white"
              value={clinicalData.gad7_score}
              onChange={handleInputChange}
            />
          </div>

          {/* Severity */}
          <div>
            <label
              htmlFor="severity"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Current Severity
            </label>
            <select
              id="severity"
              name="severity"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-background-card dark:text-white"
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
    if (!predictionResult) {
      return null;
    }

    return (
      <div className="mt-6 rounded-lg bg-background-card p-4 dark:bg-background-elevated">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-medium">Risk Prediction Results</h3>

          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${getSeverityTextClass(predictionResult.risk_level)}`}
          >
            {predictionResult.risk_level.charAt(0).toUpperCase() +
              predictionResult.risk_level.slice(1)}{" "}
            Risk
          </span>
        </div>

        <div className="mb-6">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Risk Score
            </span>
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
              {Math.round(predictionResult.risk_score * 100)}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className={`h-3 rounded-full ${getSeverityColorClass(predictionResult.risk_level)}`}
              style={{ width: `${predictionResult.risk_score * 100}%` }}
            ></div>
          </div>
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>Low Risk</span>
            <span>
              Confidence: {Math.round(predictionResult.confidence * 100)}%
            </span>
            <span>High Risk</span>
          </div>
        </div>

        {predictionResult.factors.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Key Risk Factors
            </h4>
            <div className="space-y-2">
              {predictionResult.factors
                .slice(0, 5)
                .map((factor: { name: string; contribution: number; direction: "positive" | "negative" }, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {factor.name}
                    </span>
                    <div className="h-2 w-1/2 rounded-full bg-neutral-200 dark:bg-neutral-700">
                      <div
                        className={`h-2 rounded-full ${factor.direction === "positive" ? "bg-red-500" : "bg-blue-500"}`}
                        style={{
                          width: `${Math.abs(factor.contribution) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="w-12 text-right text-xs text-neutral-500">
                      {(factor.contribution * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {predictionResult.recommendations &&
          predictionResult.recommendations.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Recommendations
              </h4>
              <ul className="list-inside list-disc space-y-1 pl-2 text-sm text-neutral-700 dark:text-neutral-300">
                {predictionResult.recommendations.map(
                  (recommendation: string, idx: number) => (
                    <li key={idx}>{recommendation}</li>
                  ),
                )}
              </ul>
            </div>
          )}
      </div>
    );
  };

  // Render historical risk assessments
  const renderHistoricalAssessments = () => {
    if (sortedRiskAssessments.length <= 1) {
      return null;
    }

    return (
      <div className="mt-6 rounded-lg bg-background-card p-4 dark:bg-background-elevated">
        <h3 className="mb-4 text-lg font-medium">
          Historical Risk Assessments
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead>
              <tr>
                <th className="bg-neutral-50 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
                  Date
                </th>
                <th className="bg-neutral-50 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
                  Overall Risk
                </th>
                <th className="bg-neutral-50 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
                  Risk Factors
                </th>
                <th className="bg-neutral-50 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
                  Interventions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-background-card">
              {sortedRiskAssessments.slice(1).map((assessment, idx) => (
                <tr key={idx}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {new Date(assessment?.date || new Date()).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold ${getSeverityTextClass(assessment?.overallRisk)}`}
                    >
                      {assessment?.overallRisk.charAt(0).toUpperCase() +
                        assessment?.overallRisk.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                    <div className="flex flex-wrap gap-1">
                      {assessment?.riskFactors.map((factor, fidx) => (
                        <span
                          key={fidx}
                          className={`inline-block rounded px-2 py-1 text-xs ${getSeverityTextClass(factor.severity)}`}
                        >
                          {factor.category}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                    <div className="flex flex-wrap gap-1">
                      {assessment?.recommendedInterventions
                        .slice(0, 2)
                        .map((intervention, iidx) => (
                          <span
                            key={iidx}
                            className="inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {intervention}
                          </span>
                        ))}
                      {assessment?.recommendedInterventions.length > 2 && (
                        <span className="inline-block rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                          +{assessment?.recommendedInterventions.length - 2} more
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

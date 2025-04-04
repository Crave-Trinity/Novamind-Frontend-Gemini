import React from "react";

import { AssessmentScore } from "@domain/models/clinical/digital-twin-profile";

interface ClinicalMetricProps {
  title: string;
  value: number;
  maxValue: number;
  change?: number | undefined;
  severity: "none" | "mild" | "moderate" | "severe";
  date?: string | undefined;
  description?: string | undefined;
  className?: string;
}

/**
 * Clinical Metric Card Component
 *
 * Displays a single clinical metric with visual indicators
 * for severity and change over time.
 */
export const ClinicalMetricCard: React.FC<ClinicalMetricProps> = ({
  title,
  value,
  maxValue,
  change,
  severity,
  date,
  description,
  className = "",
}) => {
  // Calculate percentage for progress bar
  const percentage = Math.min(Math.round((value / maxValue) * 100), 100);

  // Get severity color
  const getSeverityColor = (severity: string) => {
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
        return "bg-gray-500";
    }
  };

  // Get change indicator
  const getChangeIndicator = () => {
    if (!change) {
      return null;
    }

    if (change < 0) {
      return (
        <span className="ml-2 flex items-center text-sm text-green-500">
          <svg
            className="mr-1 h-3 w-3"
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
          {Math.abs(change)}
        </span>
      );
    } else if (change > 0) {
      return (
        <span className="ml-2 flex items-center text-sm text-red-500">
          <svg
            className="mr-1 h-3 w-3"
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
          {change}
        </span>
      );
    }

    return (
      <span className="ml-2 flex items-center text-sm text-gray-500">
        <svg
          className="mr-1 h-3 w-3"
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
        0
      </span>
    );
  };

  return (
    <div
      className={`rounded-lg bg-background-card p-4 shadow-md dark:shadow-none ${className}`}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {title}
        </h3>
        <div className="flex items-center">
          <span
            className={`inline-block h-3 w-3 rounded-full ${getSeverityColor(severity)}`}
          ></span>
          <span className="ml-1 text-xs capitalize text-neutral-500 dark:text-neutral-400">
            {severity}
          </span>
        </div>
      </div>

      <div className="mb-3 flex items-end">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="ml-1 text-sm text-neutral-500 dark:text-neutral-400">
          / {maxValue}
        </span>
        {getChangeIndicator()}
      </div>

      <div className="mb-2 h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className={`h-2 rounded-full ${getSeverityColor(severity)}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {description && (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}

      {date && (
        <div className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
          Last assessed: {new Date(date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

interface ClinicalMetricsGroupProps {
  title: string;
  metrics: AssessmentScore[];
  className?: string;
}

/**
 * Clinical Metrics Group Component
 *
 * Displays a group of related clinical metrics in a grid layout.
 */
export const ClinicalMetricsGroup: React.FC<ClinicalMetricsGroupProps> = ({
  title,
  metrics,
  className = "",
}) => {
  if (!metrics.length) {
    return null;
  }

  return (
    <div className={className}>
      <h2 className="mb-3 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <ClinicalMetricCard
            key={metric.id}
            title={metric.type}
            value={metric.score}
            maxValue={metric.maxScore}
            change={metric.change}
            severity={metric.clinicalSignificance}
            date={metric.date}
            description={metric.notes}
          />
        ))}
      </div>
    </div>
  );
};

export default ClinicalMetricsGroup;

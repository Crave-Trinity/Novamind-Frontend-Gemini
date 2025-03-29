import React from 'react';
import { AssessmentScore } from '../../domain/models/PatientModel';

interface ClinicalMetricProps {
  title: string;
  value: number;
  maxValue: number;
  change?: number;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  date?: string;
  description?: string;
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
  className = '',
}) => {
  // Calculate percentage for progress bar
  const percentage = Math.min(Math.round((value / maxValue) * 100), 100);
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
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
        return 'bg-gray-500';
    }
  };
  
  // Get change indicator
  const getChangeIndicator = () => {
    if (!change) return null;
    
    if (change < 0) {
      return (
        <span className="flex items-center text-green-500 text-sm ml-2">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          {Math.abs(change)}
        </span>
      );
    } else if (change > 0) {
      return (
        <span className="flex items-center text-red-500 text-sm ml-2">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          {change}
        </span>
      );
    }
    
    return (
      <span className="flex items-center text-gray-500 text-sm ml-2">
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
        0
      </span>
    );
  };
  
  return (
    <div className={`bg-background-card rounded-lg p-4 shadow-md dark:shadow-none ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{title}</h3>
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full ${getSeverityColor(severity)}`}></span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1 capitalize">{severity}</span>
        </div>
      </div>
      
      <div className="flex items-end mb-3">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-1">/ {maxValue}</span>
        {getChangeIndicator()}
      </div>
      
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full ${getSeverityColor(severity)}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">{description}</p>
      )}
      
      {date && (
        <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
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
  className = '',
}) => {
  if (!metrics.length) return null;
  
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-neutral-200">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

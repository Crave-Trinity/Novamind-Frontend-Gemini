/* eslint-disable */
/**
 * RiskLevel represents the severity of a patient's risk assessment.
 * This is used throughout the application to maintain consistent risk level terminology.
 */
/**
 * RiskLevel represents the severity of a patient's risk assessment.
 * Includes both lowercase and capitalized versions for backward compatibility.
 */
export type RiskLevel =
  | 'minimal'
  | 'low'
  | 'moderate'
  | 'high'
  | 'critical'
  | 'Minimal'
  | 'Low'
  | 'Moderate'
  | 'High'
  | 'Critical'
  | 'Medium'; // Legacy value

/**
 * Utility function to get the appropriate Tailwind color class based on risk level
 */
export const getRiskLevelColor = (riskLevel: RiskLevel): string => {
  // Normalize risk level to lowercase for consistent handling
  const normalizedRiskLevel = riskLevel.toLowerCase();

  // Handle special case for 'Medium' which is a legacy value
  if (normalizedRiskLevel === 'medium') {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }

  switch (normalizedRiskLevel) {
    case 'minimal':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

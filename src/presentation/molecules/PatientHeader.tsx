/**
 * NOVAMIND Neural-Safe Molecular Component
 * PatientHeader - Quantum-level patient information display
 * with HIPAA-compliant data presentation and type-safe operations
 */

import React from 'react'; // Removed unused useMemo
import { motion } from 'framer-motion';

// UI components
import Avatar from '@presentation/atoms/Avatar'; // Corrected to default import
import { Badge } from '@presentation/atoms/Badge';
// Removed unused Button import
// Removed unused Tooltip imports

// Icons
import { User, Calendar, FileText } from 'lucide-react'; // Removed unused icons

// Domain types
import type { Patient } from '@domain/types/clinical/patient'; // Corrected path

/**
 * Props with neural-safe typing
 */
interface PatientHeaderProps {
  patient: Patient;
  compact?: boolean;
  showRiskLevel?: boolean;
  showLastUpdate?: boolean;
  className?: string;
}

/**
 * Calculate age from birthdate with clinical precision
 */
// Removed calculateAge function as dateOfBirth is not directly available; age comes from demographicData

/**
 * Determine risk level badge variant
 */
// Removed getRiskLevelBadge function as riskLevel is not directly available

/**
 * Format date with clinical precision
 */
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * PatientHeader - Molecular component for displaying patient information
 * with HIPAA-compliant data presentation
 */
export const PatientHeader: React.FC<PatientHeaderProps> = ({
  patient,
  compact = false,
  showRiskLevel: _showRiskLevel = true, // Prefixed unused variable
  showLastUpdate = true,
  className = '',
}) => {
  // Access age directly from demographicData
  const age = patient.demographicData.age;

  // Removed daysSinceLastVisit calculation as lastVisit is not directly available

  // Compact version for minimal space usage
  if (compact) {
    return (
      <div className={`flex items-center ${className}`}>
        <Avatar
          // src={patient.profileImage} // profileImage not available on Patient type
          fallback={`P${patient.id.substring(0, 1)}`} // Use ID for fallback
          className="h-10 w-10"
        />

        <div className="ml-3">
          <div className="flex items-center">
            <h3 className="text-sm font-medium text-slate-900">
              Patient {patient.id} {/* Display ID instead of name */}
            </h3>

            {/* Risk level display removed as patient.riskLevel is not available */}
          </div>

          <div className="flex items-center text-xs text-slate-500 mt-0.5">
            <span className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              {patient.id} {/* Use patient.id */}
            </span>
            <span className="mx-1.5">•</span>
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {age} yrs {/* Use direct age from demographicData */}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full version with complete patient information
  return (
    <motion.div
      className={`bg-white rounded-lg border border-slate-200 shadow-sm p-4 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <Avatar
          // src={patient.profileImage} // profileImage not available on Patient type
          fallback={`P${patient.id.substring(0, 1)}`} // Use ID for fallback
          className="h-16 w-16"
        />

        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Patient {patient.id} {/* Display ID instead of name */}
              </h2>

              <div className="flex items-center mt-1 space-x-3">
                <span className="flex items-center text-sm text-slate-600">
                  <User className="h-4 w-4 mr-1 text-slate-400" />
                  ID: {patient.id} {/* Use patient.id */}
                </span>

                <span className="flex items-center text-sm text-slate-600">
                  <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                  {age} years {/* Use direct age from demographicData */}
                </span>

                {patient.demographicData.biologicalSex && ( // Use biologicalSex from demographicData
                  <span className="text-sm text-slate-600 capitalize">
                    {' '}
                    {/* Added capitalize */}
                    {patient.demographicData.biologicalSex}
                  </span>
                )}
              </div>
            </div>

            {/* Risk level display removed as patient.riskLevel/riskNotes are not available */}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 items-center">
            <div>
              <div className="flex items-center text-sm">
                {/* Access diagnoses via clinicalData */}
                {patient.clinicalData.diagnoses && patient.clinicalData.diagnoses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {patient.clinicalData.diagnoses.slice(0, 3).map((diagnosis, index) => (
                      <Badge
                        key={diagnosis.id || index} // Use diagnosis.id if available
                        variant="outline"
                        className="font-normal text-xs"
                      >
                        {diagnosis.name} {/* Display diagnosis name */}
                      </Badge>
                    ))}
                    {patient.clinicalData.diagnoses.length > 3 && (
                      <Badge variant="outline" className="font-normal text-xs">
                        +{patient.clinicalData.diagnoses.length - 3} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-slate-500">No diagnoses recorded</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {/* Last visit display removed as patient.lastVisit is not available */}

              {/* Use top-level lastUpdated */}
              {showLastUpdate && patient.lastUpdated && (
                <div className="flex items-center justify-end text-sm text-slate-600">
                  <FileText className="h-4 w-4 mr-1 text-slate-400" />
                  Updated: {formatDate(new Date(patient.lastUpdated))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts display removed as patient.alerts is not available */}
    </motion.div>
  );
};

export default PatientHeader;

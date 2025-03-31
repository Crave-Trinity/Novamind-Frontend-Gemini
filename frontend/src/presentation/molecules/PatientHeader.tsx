/**
 * NOVAMIND Neural-Safe Molecular Component
 * PatientHeader - Quantum-level patient information display
 * with HIPAA-compliant data presentation and type-safe operations
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";

// UI components
import { Avatar } from "@presentation/atoms/Avatar";
import { Badge } from "@presentation/atoms/Badge";
import { Button } from "@presentation/atoms/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@presentation/atoms/Tooltip";

// Icons
import {
  AlertTriangle,
  User,
  Calendar,
  Clock,
  FileText,
  Activity,
} from "lucide-react";

// Domain types
import { Patient } from "@domain/types/patient/patient";

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
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Determine risk level badge variant
 */
const getRiskLevelBadge = (riskLevel: string) => {
  switch (riskLevel.toLowerCase()) {
    case "high":
      return <Badge variant="destructive">High Risk</Badge>;
    case "moderate":
      return <Badge variant="warning">Moderate Risk</Badge>;
    case "low":
      return <Badge variant="secondary">Low Risk</Badge>;
    default:
      return <Badge variant="outline">Unknown Risk</Badge>;
  }
};

/**
 * Format date with clinical precision
 */
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * PatientHeader - Molecular component for displaying patient information
 * with HIPAA-compliant data presentation
 */
export const PatientHeader: React.FC<PatientHeaderProps> = ({
  patient,
  compact = false,
  showRiskLevel = true,
  showLastUpdate = true,
  className = "",
}) => {
  // Calculate patient age
  const age = useMemo(() => {
    return calculateAge(new Date(patient.dateOfBirth));
  }, [patient.dateOfBirth]);

  // Calculate days since last visit
  const daysSinceLastVisit = useMemo(() => {
    if (!patient.lastVisit) return null;

    const lastVisit = new Date(patient.lastVisit);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [patient.lastVisit]);

  // Compact version for minimal space usage
  if (compact) {
    return (
      <div className={`flex items-center ${className}`}>
        <Avatar
          src={patient.profileImage}
          fallback={`${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`}
          className="h-10 w-10"
        />

        <div className="ml-3">
          <div className="flex items-center">
            <h3 className="text-sm font-medium text-slate-900">
              {patient.firstName} {patient.lastName}
            </h3>

            {showRiskLevel && patient.riskLevel && (
              <div className="ml-2">{getRiskLevelBadge(patient.riskLevel)}</div>
            )}
          </div>

          <div className="flex items-center text-xs text-slate-500 mt-0.5">
            <span className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              {patient.patientId}
            </span>
            <span className="mx-1.5">•</span>
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {age} yrs
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
          src={patient.profileImage}
          fallback={`${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`}
          className="h-16 w-16"
        />

        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {patient.firstName} {patient.lastName}
              </h2>

              <div className="flex items-center mt-1 space-x-3">
                <span className="flex items-center text-sm text-slate-600">
                  <User className="h-4 w-4 mr-1 text-slate-400" />
                  ID: {patient.patientId}
                </span>

                <span className="flex items-center text-sm text-slate-600">
                  <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                  {age} years
                </span>

                {patient.gender && (
                  <span className="text-sm text-slate-600">
                    {patient.gender}
                  </span>
                )}
              </div>
            </div>

            {showRiskLevel && patient.riskLevel && (
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>{getRiskLevelBadge(patient.riskLevel)}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {patient.riskNotes ||
                          "Risk assessment based on clinical factors"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 items-center">
            <div>
              <div className="flex items-center text-sm">
                {patient.diagnoses && patient.diagnoses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {patient.diagnoses.slice(0, 3).map((diagnosis, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="font-normal text-xs"
                      >
                        {diagnosis}
                      </Badge>
                    ))}
                    {patient.diagnoses.length > 3 && (
                      <Badge variant="outline" className="font-normal text-xs">
                        +{patient.diagnoses.length - 3} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-slate-500">
                    No diagnoses recorded
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {patient.lastVisit && (
                <div className="flex items-center justify-end text-sm text-slate-600">
                  <Clock className="h-4 w-4 mr-1 text-slate-400" />
                  Last visit: {formatDate(new Date(patient.lastVisit))}
                  {daysSinceLastVisit !== null && (
                    <span className="ml-1 text-xs text-slate-500">
                      ({daysSinceLastVisit} days ago)
                    </span>
                  )}
                </div>
              )}

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

      {patient.alerts && patient.alerts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
            <span className="text-sm font-medium text-slate-800">Alerts</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {patient.alerts.map((alert, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
              >
                {alert}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PatientHeader;

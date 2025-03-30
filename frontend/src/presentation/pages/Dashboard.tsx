import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../application/contexts/ThemeContext";
import Button from "../atoms/Button";
import DigitalTwinDashboard from "../organisms/DigitalTwinDashboard";

// Mock API client (would be replaced with actual API calls)
const fetchPatients = async () => {
  // This would be an actual API call in production
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay

  return [
    {
      id: "patient-123",
      name: "Patient A",
      primaryDiagnosis: "depression",
      currentSeverity: "moderate",
      lastUpdated: "2025-03-28T14:30:00Z",
    },
    {
      id: "patient-456",
      name: "Patient B",
      primaryDiagnosis: "anxiety",
      currentSeverity: "mild",
      lastUpdated: "2025-03-27T10:15:00Z",
    },
    {
      id: "patient-789",
      name: "Patient C",
      primaryDiagnosis: "bipolar",
      currentSeverity: "severe",
      lastUpdated: "2025-03-26T16:45:00Z",
    },
  ];
};

const fetchDigitalTwinProfile = async (patientId: string) => {
  // This would be an actual API call in production
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

  // Return mock data for demo purposes
  return {
    id: "profile-123",
    patientId: patientId,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-03-28T14:30:00Z",
    primaryDiagnosis: "depression",
    comorbidities: ["anxiety", "insomnia"],
    currentSeverity: "moderate",
    assessmentScores: [
      {
        id: "assessment-1",
        type: "PHQ9",
        score: 14,
        maxScore: 27,
        date: "2025-03-25T14:30:00Z",
        clinicalSignificance: "moderate",
        change: -2,
        notes: "Improvement in mood and energy levels",
      },
      {
        id: "assessment-2",
        type: "GAD7",
        score: 10,
        maxScore: 21,
        date: "2025-03-25T14:30:00Z",
        clinicalSignificance: "moderate",
        change: -1,
        notes: "Some reduction in anxiety symptoms",
      },
      {
        id: "assessment-3",
        type: "WSAS",
        score: 18,
        maxScore: 40,
        date: "2025-03-25T14:30:00Z",
        clinicalSignificance: "moderate",
        change: -3,
        notes: "Improved functioning at work",
      },
    ],
    medications: [
      {
        id: "med-1",
        name: "Sertraline",
        dosage: "100mg",
        frequency: "Once daily",
        startDate: "2025-01-20T00:00:00Z",
        adherence: 85,
        sideEffects: ["nausea", "insomnia"],
        effectiveness: 70,
      },
    ],
    therapySessions: [
      {
        id: "therapy-1",
        type: "CBT",
        date: "2025-03-20T15:00:00Z",
        duration: 50,
        attendance: true,
        effectiveness: 75,
        focusAreas: ["negative thoughts", "behavioral activation"],
        progress: 65,
      },
    ],
    biomarkers: [
      {
        id: "biomarker-1",
        name: "Cortisol",
        value: 18.2,
        unit: "μg/dL",
        date: "2025-03-15T09:00:00Z",
        referenceRange: {
          min: 5,
          max: 23,
        },
        isAbnormal: false,
        trend: "decreasing",
        clinicalSignificance: 60,
      },
      {
        id: "biomarker-2",
        name: "BDNF",
        value: 22.5,
        unit: "ng/mL",
        date: "2025-03-15T09:00:00Z",
        referenceRange: {
          min: 18,
          max: 30,
        },
        isAbnormal: false,
        trend: "increasing",
        clinicalSignificance: 70,
      },
      {
        id: "biomarker-3",
        name: "CYP2D6*1/*1",
        value: 1,
        unit: "",
        date: "2025-02-10T09:00:00Z",
        referenceRange: {
          min: 0,
          max: 1,
        },
        isAbnormal: false,
        trend: "stable",
        clinicalSignificance: 90,
      },
    ],
    sleepData: [
      {
        date: "2025-03-27T00:00:00Z",
        durationHours: 6.5,
        quality: 65,
        latencyMinutes: 35,
        remPercentage: 22,
        deepSleepPercentage: 18,
        disturbances: 2,
      },
    ],
    treatmentPlan: {
      id: "plan-1",
      startDate: "2025-01-20T00:00:00Z",
      primaryDiagnosis: "depression",
      comorbidities: ["anxiety"],
      treatments: [
        {
          type: "medication",
          details: "Sertraline 100mg daily",
          targetSymptoms: ["depressed mood", "loss of interest", "anxiety"],
          expectedOutcomes: ["improved mood", "reduced anxiety"],
          timeframe: "6-8 weeks",
        },
        {
          type: "therapy",
          details: "CBT weekly sessions",
          targetSymptoms: ["negative thoughts", "behavioral avoidance"],
          expectedOutcomes: ["improved coping skills", "reduced avoidance"],
          timeframe: "12 weeks",
        },
      ],
      goals: [
        {
          description: "Return to full-time work",
          progress: 60,
          targetDate: "2025-04-30T00:00:00Z",
        },
        {
          description: "Reduce PHQ-9 score to < 5",
          progress: 45,
          targetDate: "2025-05-15T00:00:00Z",
        },
      ],
      adherence: 80,
      effectiveness: 65,
    },
    riskAssessments: [
      {
        id: "risk-1",
        date: "2025-03-25T14:30:00Z",
        riskFactors: [
          {
            category: "relapse",
            severity: "moderate",
            trend: "decreasing",
          },
          {
            category: "suicide",
            severity: "mild",
            trend: "stable",
          },
          {
            category: "self-harm",
            severity: "mild",
            trend: "decreasing",
          },
        ],
        overallRisk: "moderate",
        recommendedInterventions: [
          "Continue current treatment plan",
          "Weekly check-ins",
          "Safety planning review",
        ],
        nextAssessmentDate: "2025-04-08T00:00:00Z",
        confidenceScore: 85,
      },
    ],
    predictedTrajectory: {
      timepoints: [
        "2025-04-01T00:00:00Z",
        "2025-05-01T00:00:00Z",
        "2025-06-01T00:00:00Z",
      ],
      severityScores: [12, 8, 5],
      confidenceIntervals: [
        [10, 14],
        [6, 10],
        [3, 7],
      ],
    },
  };
};

/**
 * Dashboard Page
 *
 * Main dashboard with patient selection and digital twin visualization.
 * This component serves as the entry point to the Digital Twin frontend.
 */
const Dashboard: React.FC = () => {
  const { theme, isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  // Selected patient state
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

  // Fetch patients list
  const {
    data: patients,
    isLoading: isPatientsLoading,
    error: patientsError,
  } = useQuery("patients", fetchPatients);

  // Fetch digital twin profile when patient is selected
  const {
    data: digitalTwinProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery(
    ["digitalTwinProfile", selectedPatientId],
    () => fetchDigitalTwinProfile(selectedPatientId!),
    {
      enabled: !!selectedPatientId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  // Select first patient by default when data loads
  useEffect(() => {
    if (patients && patients.length > 0 && !selectedPatientId) {
      // Use optional chaining and nullish coalescing for type safety
      setSelectedPatientId(patients[0]?.id ?? null);
    }
  }, [patients, selectedPatientId]);

  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  // Handle view patient details
  const handleViewPatientDetails = () => {
    if (selectedPatientId) {
      navigate(`/patients/${selectedPatientId}`);
    }
  };

  // Render loading state
  if (isPatientsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6 dark:bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
          <h3 className="text-xl font-medium text-neutral-800 dark:text-white">
            Loading Dashboard
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Retrieving patient data...
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (patientsError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6 dark:bg-background">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-neutral-800 dark:text-white">
            Error Loading Dashboard
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {patientsError instanceof Error
              ? patientsError.message
              : "Failed to load patient data. Please try again."}
          </p>
          <button
            className="mt-4 rounded bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 dark:bg-background">
      <div className="mx-auto max-w-7xl">
        {/* Dashboard Header */}
        <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
              Digital Twin Dashboard
            </h1>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              View and manage patient digital twin profiles
            </p>
          </div>

          <div className="mt-4 flex items-center gap-4 sm:mt-0">
            {/* Theme Toggle */}
            <button
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-neutral-700 shadow-sm dark:bg-background-card dark:text-neutral-300"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {/* Action Button */}
            <Button
              variant="primary"
              size="md"
              icon={
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
              onClick={() => navigate("/predictions")}
            >
              New Prediction
            </Button>
          </div>
        </div>

        {/* Patient Selection */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm dark:bg-background-card">
          <h2 className="mb-3 text-lg font-medium text-neutral-800 dark:text-white">
            Select Patient
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {patients?.map((patient) => (
              <button
                key={patient.id}
                className={`rounded-lg border p-4 ${
                  selectedPatientId === patient.id
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                } text-left transition-colors`}
                onClick={() => handlePatientSelect(patient.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-white">
                      {patient.name}
                    </h3>
                    <p className="mt-1 text-sm capitalize text-neutral-500 dark:text-neutral-400">
                      {patient.primaryDiagnosis} - {patient.currentSeverity}
                    </p>
                  </div>
                  {selectedPatientId === patient.id && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                  Updated: {new Date(patient.lastUpdated).toLocaleString()}
                </div>
              </button>
            ))}
          </div>

          {selectedPatientId && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewPatientDetails}
              >
                View Patient Details
              </Button>
            </div>
          )}
        </div>

        {/* Digital Twin Dashboard */}
        {selectedPatientId && digitalTwinProfile ? (
          <DigitalTwinDashboard
            patientId={selectedPatientId}
            profile={{
              id: `dt-${selectedPatientId}`,
              patientId: selectedPatientId || "",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              primaryDiagnosis: "depression",
              comorbidities: ["anxiety"],
              currentSeverity: "moderate",
              assessmentScores: [],
              medications: [],
              therapySessions: [],
              biomarkers: [],
              sleepData: [],
              treatmentPlan: {
                id: `tp-${selectedPatientId}`,
                startDate: new Date().toISOString(),
                primaryDiagnosis: "depression",
                comorbidities: [],
                treatments: [],
                goals: [],
                adherence: 0,
                effectiveness: 0,
              },
              riskAssessments: [],
              predictedTrajectory: {
                timepoints: [],
                severityScores: [],
                confidenceIntervals: [],
              },
            }}
          />
        ) : isProfileLoading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-background-card">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
            <h3 className="text-lg font-medium text-neutral-800 dark:text-white">
              Loading Digital Twin
            </h3>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Retrieving profile data...
            </p>
          </div>
        ) : profileError ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-background-card">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-800 dark:text-white">
              Error Loading Digital Twin
            </h3>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {profileError instanceof Error
                ? profileError.message
                : "Failed to load digital twin profile. Please try again."}
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useParams, useNavigate } from "react-router-dom";

import { PatientModel } from "@domain/models/clinical/patient-model"; // Corrected import name and path
import { ApiClient } from "@api/ApiClient"; // Match filename casing
import Button from "@presentation/atoms/Button";
import DigitalTwinDashboard from "@presentation/organisms/DigitalTwinDashboard";
import RiskAssessmentPanel from "@presentation/organisms/RiskAssessmentPanel";
import TreatmentResponsePredictor from "@presentation/organisms/TreatmentResponsePredictor";

const PatientProfile: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "digital-twin" | "treatments" | "history"
  >("digital-twin");

  // Fetch patient data
  const {
    data: patient,
    isLoading,
    error,
  } = useQuery(
    ["patient", patientId],
    async () => {
      // In a real app, this would call the API with the patientId
      // For now, we'll return mock data
      return await new Promise<PatientModel>(
        (
          resolve, // Use imported PatientModel type
        ) =>
          setTimeout(
            () =>
              resolve({
                id: patientId || "1",
                firstName: "Emma",
                lastName: "Thompson",
                dateOfBirth: "1985-05-12",
                gender: "Female",
                mrn: "MRN12345",
                status: "Active",
                riskLevel: "Medium",
                lastVisit: "2025-03-15",
                diagnoses: [
                  "Major Depressive Disorder",
                  "Generalized Anxiety Disorder",
                ],
                currentMedications: [
                  { name: "Sertraline", dosage: "100mg", frequency: "Daily" },
                  {
                    name: "Clonazepam",
                    dosage: "0.5mg",
                    frequency: "As needed",
                  },
                ],
                assessments: [
                  {
                    name: "PHQ-9",
                    score: 14,
                    interpretation: "Moderate Depression",
                    date: "2025-03-15",
                    previousScores: [18, 16, 15, 14],
                  },
                  {
                    name: "GAD-7",
                    score: 12,
                    interpretation: "Moderate Anxiety",
                    date: "2025-03-15",
                    previousScores: [15, 14, 13, 12],
                  },
                  {
                    name: "MOCA",
                    score: 27,
                    interpretation: "Normal Cognitive Function",
                    date: "2025-03-10",
                    previousScores: [26, 27, 27, 27],
                  },
                ],
                vitalSigns: [
                  {
                    name: "Heart Rate",
                    value: 72,
                    unit: "bpm",
                    normalRange: "60-100",
                  },
                  {
                    name: "Blood Pressure",
                    value: "118/78",
                    unit: "mmHg",
                    normalRange: "90-120/60-80",
                  },
                  {
                    name: "Sleep Quality",
                    value: 6.5,
                    unit: "hours",
                    normalRange: "7-9",
                  },
                  { name: "HRV", value: 45, unit: "ms", normalRange: "20-200" },
                ],
                riskFactors: [
                  {
                    name: "Suicide",
                    level: "Medium",
                    trend: "Decreasing",
                    lastUpdated: "2025-03-15",
                  },
                  {
                    name: "Self-Harm",
                    level: "Low",
                    trend: "Stable",
                    lastUpdated: "2025-03-15",
                  },
                  {
                    name: "Treatment Non-Adherence",
                    level: "Medium",
                    trend: "Stable",
                    lastUpdated: "2025-03-15",
                  },
                  {
                    name: "Substance Use",
                    level: "Low",
                    trend: "Stable",
                    lastUpdated: "2025-03-15",
                  },
                ],
                treatmentResponses: [
                  {
                    treatmentId: "tx1", // Use treatmentId
                    treatmentName: "Sertraline", // Use treatmentName
                    responseLevel: "Moderate",
                    confidence: 75,
                    predictedRemission: "65%",
                  },
                  {
                    treatmentId: "tx2", // Use treatmentId
                    treatmentName: "CBT", // Use treatmentName
                    responseLevel: "High",
                    confidence: 85,
                    predictedRemission: "72%",
                  },
                  {
                    treatmentId: "tx3", // Use treatmentId
                    treatmentName: "Mindfulness", // Use treatmentName
                    responseLevel: "Moderate",
                    confidence: 70,
                    predictedRemission: "60%",
                  },
                ],
                digitalTwinProfile: {
                  id: `dt-${Math.random().toString(36).substr(2, 9)}`,
                  patientId: patientId || "1",
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
                    id: `tp-${Math.random().toString(36).substr(2, 9)}`,
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
                },
                riskAssessments: [
                  // Add risk assessments data here
                ],
              }),
            800,
          ),
      );
    },
    {
      enabled: !!patientId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  // Navigate to brain model
  const handleViewBrainModel = () => {
    navigate(`/brain-model/${patientId}`);
  };

  // Get risk level badge color
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400";
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm dark:bg-background-card">
        {isLoading ? (
          <div className="flex h-16 items-center">
            <div className="h-6 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 dark:text-red-400">
            Error loading patient data
          </div>
        ) : patient ? (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {patient.firstName} {patient.lastName}
                </h1>
                {/* Placeholder for Risk Level Span - Content commented out */}
              </div>
              <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                {/* MRN: {patient.mrn} | */} DOB:{" "}
                {patient.dateOfBirth.toLocaleDateString()} | Gender:{" "}
                {patient.demographics.biologicalSex}{" "}
                {/* Access via demographics */}
              </p>
              <div className="mt-2 flex flex-wrap">
                {/* Access diagnoses via clinicalHistory */}
                {[
                  patient.clinicalHistory.primaryDiagnosis,
                  ...(patient.clinicalHistory.secondaryDiagnoses || []),
                ].map((diagnosis: string, index: number) => (
                  <span
                    key={`diagnosis-${patient.id}-${index}`}
                    className="mb-1 mr-2 rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {diagnosis}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewBrainModel}
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
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                }
              >
                Brain Model
              </Button>
              <Button
                variant="primary"
                size="sm"
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
                      strokeWidth={1.5}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                }
              >
                Edit Profile
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Tab Navigation */}
      <div className="border-t border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-background-card">
        <div className="flex overflow-x-auto">
          <button
            className={`border-b-2 px-6 py-3 text-sm font-medium ${
              activeTab === "overview"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`border-b-2 px-6 py-3 text-sm font-medium ${
              activeTab === "digital-twin"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
            }`}
            onClick={() => setActiveTab("digital-twin")}
          >
            Digital Twin
          </button>
          <button
            className={`border-b-2 px-6 py-3 text-sm font-medium ${
              activeTab === "treatments"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
            }`}
            onClick={() => setActiveTab("treatments")}
          >
            Treatments
          </button>
          <button
            className={`border-b-2 px-6 py-3 text-sm font-medium ${
              activeTab === "history"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
            }`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-neutral-50 p-6 dark:bg-background">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
            <span className="ml-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
              Loading patient data...
            </span>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md rounded-lg bg-red-50 p-4 text-center text-red-500 dark:bg-red-900/20 dark:text-red-400">
              <svg
                className="mx-auto mb-4 h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mb-2 text-lg font-semibold">
                Error Loading Patient Data
              </h3>
              <p className="text-sm">{String(error)}</p>
            </div>
          </div>
        ) : patient ? (
          <>
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Patient Info Card */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-background-card">
                  <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                    Patient Information
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Status
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {/* Status not directly on PatientModel */}
                        {/* {patient.status} */} {/* Placeholder */}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Last Visit
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {patient.lastUpdated.toLocaleDateString()}{" "}
                        {/* Use lastUpdated */}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Risk Level
                      </span>
                      {/* Placeholder for Risk Level Span */}
                    </div>
                    <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Current Medications
                      </span>
                      <div className="mt-2 space-y-2">
                        {patient.medications.map(
                          (
                            med,
                            index, // Use medications array
                          ) => (
                            <div
                              key={index}
                              className="rounded-lg bg-neutral-50 p-2 text-sm dark:bg-neutral-800/50"
                            >
                              <div className="font-medium text-neutral-900 dark:text-white">
                                {med.name}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                {med.dosage} • {med.frequency}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assessments Card */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-background-card">
                  <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                    Clinical Assessments
                  </h2>
                  <div className="space-y-4">
                    {/* Assessments not directly on PatientModel, maybe link via ID or fetch separately */}
                    {/* {patient.assessments?.map((assessment, index) => ( */}{" "}
                    {/* Placeholder */}
                    {/* Assessment Item Placeholder - Map is commented out */}
                    {/* <div key={index} className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50"> */}
                    {/*   ... content using assessment and index ... */}
                    {/* </div> */}
                    {/* ))} */}
                  </div>
                </div>

                {/* Vital Signs Card */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-background-card">
                  <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                    Vital Signs & Biometrics
                  </h2>
                  <div className="space-y-4">
                    {/* Vital signs not directly on PatientModel */}
                    {/* {patient.vitalSigns?.map((vital, index) => ( */}{" "}
                    {/* Placeholder */}
                    {/* Vital Item Placeholder - Map is commented out */}
                    {/* <div key={index} className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50"> */}
                    {/*   ... content using vital and index ... */}
                    {/* </div> */}
                    {/* ))} */}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "digital-twin" && (
              <DigitalTwinDashboard
                patientId={patient.id}
                profile={
                  {
                    // Placeholder profile data
                    id: `dt-${patient.id}`,
                    // patientId: patient.id, // Removed: Not a property of DigitalTwinProfile
                    // createdAt: new Date().toISOString(), // Removed: Not a property of DigitalTwinProfile
                    updatedAt: new Date().toISOString(),
                    primaryDiagnosis: "depression",
                    // comorbidities: ["anxiety"], // Removed: Not a property of DigitalTwinProfile
                    currentSeverity: "moderate",
                    assessmentScores: [],
                    // medications: [], // Removed: Not a property of DigitalTwinProfile
                    // therapySessions: [], // Removed: Not a property of DigitalTwinProfile
                    biomarkers: [],
                    // sleepData: [], // Removed: Not a property of DigitalTwinProfile
                    treatmentPlan: {
                      id: `tp-${patient.id}`,
                      startDate: new Date().toISOString(),
                      primaryDiagnosis: "depression",
                      comorbidities: [],
                      treatments: [],
                      goals: [],
                      adherence: 0,
                      effectiveness: 0,
                    },
                    riskAssessments: [],
                    // predictedTrajectory: { ... }, // Removed: Not a property of DigitalTwinProfile
                  } // End of placeholder profile data
                }
              />
            )}

            {activeTab === "treatments" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Treatment Response Card */}
                <div className="lg:col-span-2">
                  <TreatmentResponsePredictor
                    patientId={patient.id}
                    profile={
                      {
                        // Placeholder profile data
                        id: `dt-${patient.id}`,
                        // patientId: patient.id, // Removed: Not a property of DigitalTwinProfile
                        // createdAt: new Date().toISOString(), // Removed: Not a property of DigitalTwinProfile
                        updatedAt: new Date().toISOString(),
                        primaryDiagnosis: "depression",
                        // comorbidities: ["anxiety"], // Removed: Not a property of DigitalTwinProfile
                        currentSeverity: "moderate",
                        assessmentScores: [],
                        // medications: [], // Removed: Not a property of DigitalTwinProfile
                        // therapySessions: [], // Removed: Not a property of DigitalTwinProfile
                        biomarkers: [],
                        // sleepData: [], // Removed: Not a property of DigitalTwinProfile
                        treatmentPlan: {
                          id: `tp-${patient.id}`,
                          startDate: new Date().toISOString(),
                          primaryDiagnosis: "depression",
                          comorbidities: [],
                          treatments: [],
                          goals: [],
                          adherence: 0,
                          effectiveness: 0,
                        },
                        riskAssessments: [],
                        // predictedTrajectory: { ... }, // Removed: Not a property of DigitalTwinProfile
                      } // End of placeholder profile data
                    }
                  />
                </div>

                {/* Risk Assessment Panel */}
                <div>
                  <RiskAssessmentPanel
                    patientId={patient.id}
                    riskAssessments={[
                      // Placeholder assessments data
                      {
                        id: `risk-${Math.random().toString(36).substr(2, 9)}`,
                        date: new Date().toISOString(),
                        riskFactors: [
                          {
                            category: "Clinical",
                            severity: "moderate",
                            trend: "stable",
                          },
                          {
                            category: "Behavioral",
                            severity: "mild",
                            trend: "decreasing",
                          },
                        ],
                        overallRisk: "moderate",
                        recommendedInterventions: [
                          "Continued medication adherence",
                          "Weekly therapy sessions",
                        ],
                        nextAssessmentDate: new Date(
                          Date.now() + 7 * 24 * 60 * 60 * 1000,
                        ).toISOString(), // 1 week from now
                        confidenceScore: 0.85,
                      },
                    ]}
                  />
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-background-card">
                <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                  Treatment History
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Historical treatment data would be displayed here.
                </p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PatientProfile;

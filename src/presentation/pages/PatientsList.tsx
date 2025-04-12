/* eslint-disable */
import React, { useState } from 'react';
// Import with proper type definitions
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type { PatientModel } from '@domain/models/clinical/patient-model';
import { createPatientModel } from '@domain/models/clinical/patient-model'; // Ensure factory is imported
// Removed unused RiskLevel import
import Button from '@presentation/atoms/Button';

const PatientsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'high-risk'>('all');

  // Fetch patients data
  const {
    data: patients,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      // In a real app, this would call the API with proper filters
      // For now, we'll return mock data
      // Use PatientModel[] and conform mock data
      return await new Promise<PatientModel[]>((resolve) =>
        setTimeout(
          () =>
            resolve([
              createPatientModel({
                id: '1',
                firstName: 'Emma',
                lastName: 'Thompson',
                dateOfBirth: new Date('1985-05-12'),
                demographics: { age: 39, biologicalSex: 'female' },
                clinicalHistory: {
                  primaryDiagnosis: 'Major Depressive Disorder',
                  secondaryDiagnoses: ['Generalized Anxiety Disorder'],
                },
                medications: [
                  {
                    id: 'med1',
                    name: 'Sertraline',
                    dosage: '100mg',
                    frequency: 'Daily',
                    startDate: new Date('2024-01-15'),
                  },
                  {
                    id: 'med2',
                    name: 'Clonazepam',
                    dosage: '0.5mg',
                    frequency: 'As needed',
                    startDate: new Date('2024-01-15'),
                  },
                ],
                symptoms: [],
                treatmentResponses: [],
                lastUpdated: new Date('2025-03-15'),
              }),
              createPatientModel({
                id: '2',
                firstName: 'Michael',
                lastName: 'Rodriguez',
                dateOfBirth: new Date('1992-11-03'),
                demographics: { age: 32, biologicalSex: 'male' },
                clinicalHistory: {
                  primaryDiagnosis: 'Bipolar I Disorder',
                  secondaryDiagnoses: ['Substance Use Disorder'],
                },
                medications: [
                  {
                    id: 'med3',
                    name: 'Lithium',
                    dosage: '900mg',
                    frequency: 'Daily',
                    startDate: new Date('2023-12-01'),
                  },
                  {
                    id: 'med4',
                    name: 'Quetiapine',
                    dosage: '300mg',
                    frequency: 'Nightly',
                    startDate: new Date('2023-12-01'),
                  },
                ],
                symptoms: [],
                treatmentResponses: [],
                lastUpdated: new Date('2025-03-20'),
              }),
              createPatientModel({
                id: '3',
                firstName: 'Sarah',
                lastName: 'Chen',
                dateOfBirth: new Date('1979-03-24'),
                demographics: { age: 46, biologicalSex: 'female' },
                clinicalHistory: {
                  primaryDiagnosis: 'Post-Traumatic Stress Disorder',
                },
                medications: [
                  {
                    id: 'med5',
                    name: 'Prazosin',
                    dosage: '1mg',
                    frequency: 'Nightly',
                    startDate: new Date('2024-02-10'),
                  },
                  {
                    id: 'med6',
                    name: 'Bupropion',
                    dosage: '150mg',
                    frequency: 'Daily',
                    startDate: new Date('2024-03-01'),
                  },
                ],
                symptoms: [],
                treatmentResponses: [],
                lastUpdated: new Date('2025-03-10'),
              }),
              createPatientModel({
                id: '4',
                firstName: 'David',
                lastName: 'Wilson',
                dateOfBirth: new Date('1988-07-16'),
                demographics: { age: 36, biologicalSex: 'male' },
                clinicalHistory: {
                  primaryDiagnosis: 'Schizophrenia',
                  secondaryDiagnoses: ['Obsessive-Compulsive Disorder'],
                },
                medications: [
                  {
                    id: 'med7',
                    name: 'Risperidone',
                    dosage: '4mg',
                    frequency: 'Daily',
                    startDate: new Date('2022-05-20'),
                  },
                  {
                    id: 'med8',
                    name: 'Fluoxetine',
                    dosage: '40mg',
                    frequency: 'Daily',
                    startDate: new Date('2023-01-10'),
                  },
                ],
                symptoms: [],
                treatmentResponses: [],
                lastUpdated: new Date('2025-03-22'),
              }),
              createPatientModel({
                id: '5',
                firstName: 'Olivia',
                lastName: 'Johnson',
                dateOfBirth: new Date('1995-12-05'),
                demographics: { age: 29, biologicalSex: 'female' },
                clinicalHistory: {
                  primaryDiagnosis: 'Major Depressive Disorder',
                  secondaryDiagnoses: ['Eating Disorder NOS'],
                },
                medications: [
                  {
                    id: 'med9',
                    name: 'Escitalopram',
                    dosage: '20mg',
                    frequency: 'Daily',
                    startDate: new Date('2024-04-01'),
                  },
                  {
                    id: 'med10',
                    name: 'Olanzapine',
                    dosage: '5mg',
                    frequency: 'Nightly',
                    startDate: new Date('2024-04-01'),
                  },
                ],
                symptoms: [],
                treatmentResponses: [],
                lastUpdated: new Date('2025-03-18'),
              }),
            ]),
          800
        )
      );
    },
  });

  // Filter patients based on search and filter
  const filteredPatients = React.useMemo(() => {
    if (!patients) {
      return [];
    }

    let filtered = [...patients];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(search) ||
          // MRN not in model
          // Check primary and secondary diagnoses
          patient.clinicalHistory.primaryDiagnosis.toLowerCase().includes(search) ||
          (patient.clinicalHistory.secondaryDiagnoses || []).some((d: string) =>
            d.toLowerCase().includes(search)
          )
      );
    }

    // Apply category filter
    if (selectedFilter === 'high-risk') {
      // Risk level filtering needs adjustment as it's not directly on PatientModel
      // This logic needs to be updated based on how risk is determined/stored
      // Example: Fetch risk assessments separately and filter based on that
      // filtered = filtered.filter((patient) => {
      //    const latestAssessment = getLatestRiskAssessment(patient.id); // Fictional function
      //    return latestAssessment?.overallRisk === RiskLevel.HIGH || latestAssessment?.overallRisk === RiskLevel.SEVERE;
      // });
      // Temporarily removing risk filter logic
    } else if (selectedFilter === 'recent') {
      // Sort by most recent visit and take top 3
      // Sort by lastUpdated date
      // Sort by lastUpdated date
      filtered = [...filtered]
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        .slice(0, 3);
    }

    return filtered;
  }, [patients, searchTerm, selectedFilter]);

  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  // View patient's brain model
  const handleViewBrainModel = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/brain-model/${patientId}`);
  };

  // Get risk level badge color - Updated to accept RiskLevel enum or string
  // Removed unused getRiskLevelColor function

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm dark:bg-background-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Patients</h1>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              View and manage patient digital twins
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            Add Patient
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="border-t border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-background-card">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full rounded-lg bg-neutral-100 py-2 pl-10 pr-4 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                selectedFilter === 'all'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
              onClick={() => setSelectedFilter('all')}
            >
              All Patients
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                selectedFilter === 'high-risk'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
              onClick={() => setSelectedFilter('high-risk')}
            >
              High Risk
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                selectedFilter === 'recent'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
              onClick={() => setSelectedFilter('recent')}
            >
              Recent Visits
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-neutral-50 p-6 dark:bg-background">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
            <span className="ml-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
              Loading patients...
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
              <h3 className="mb-2 text-lg font-semibold">Error Loading Patients</h3>
              <p className="text-sm">{String(error)}</p>
              <Button variant="danger" size="sm" className="mt-4" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <svg
              className="mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-white">
              No Patients Found
            </h3>
            <p className="mb-6 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
              {searchTerm
                ? `No patients match the search term "${searchTerm}". Try a different search or reset filters.`
                : 'No patients found with the selected filters.'}
            </p>
            {searchTerm && (
              <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map(
              (
                patient: PatientModel // Use PatientModel type
              ) => (
                <div
                  key={patient.id}
                  className="mb-4 cursor-pointer rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-neutral-700 dark:bg-background-card dark:hover:bg-neutral-800"
                  onClick={() => handlePatientSelect(patient.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4 h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500"></div>
                      <div>
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">
                          {patient.firstName} {patient.lastName}
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {/* MRN not in model */} DOB: {patient.dateOfBirth.toLocaleDateString()} |
                          Gender: {patient.demographics.biologicalSex}{' '}
                          {/* Access via demographics */}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {/* Risk Level needs to be fetched/derived separately */}
                      {/* <span className={`mr-4 rounded-full px-3 py-1 text-xs font-medium ${getRiskLevelColor(patient.riskLevel)}`}>
                      {patient.riskLevel} Risk
                    </span> */}
                      <span className="mr-4 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
                        Risk: N/A {/* Placeholder */}
                      </span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Last Updated: {patient.lastUpdated.toLocaleDateString()}{' '}
                        {/* Use lastUpdated */}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-700">
                    <h3 className="mb-1 text-xs font-medium uppercase text-neutral-400">
                      Diagnoses
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {/* Access diagnoses via clinicalHistory */}
                      {[
                        patient.clinicalHistory.primaryDiagnosis,
                        ...(patient.clinicalHistory.secondaryDiagnoses || []),
                      ].map((diagnosis, index) => (
                        <span
                          key={index}
                          className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {diagnosis}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-700">
                    <h3 className="mb-1 text-xs font-medium uppercase text-neutral-400">
                      Current Medications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {patient.medications.map(
                        (
                          med,
                          index // Use medications array
                        ) => (
                          <span
                            key={med.id || index} // Use med.id if available, fallback to index
                            className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          >
                            {med.name} ({med.dosage})
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-700">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Last Updated: {patient.lastUpdated.toLocaleDateString()}
                    </span>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={(e) => handleViewBrainModel(patient.id, e)}
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
                    {/* Removed extra closing div */}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsList;

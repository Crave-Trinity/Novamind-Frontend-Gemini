import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ApiClient } from '../../infrastructure/api/ApiClient';
import Button from '../atoms/Button';
import { Patient } from '../../domain/models/PatientModel';

const PatientsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'high-risk'>('all');
  
  // Fetch patients data
  const { data: patients, isLoading, error, refetch } = useQuery(
    'patients',
    async () => {
      // In a real app, this would call the API with proper filters
      // For now, we'll return mock data
      return await new Promise<Patient[]>(resolve => 
        setTimeout(() => resolve([
          {
            id: '1',
            firstName: 'Emma',
            lastName: 'Thompson',
            dateOfBirth: '1985-05-12',
            gender: 'Female',
            mrn: 'MRN12345',
            status: 'Active',
            riskLevel: 'Medium',
            lastVisit: '2025-03-15',
            diagnoses: ['Major Depressive Disorder', 'Generalized Anxiety Disorder'],
            currentMedications: [
              { name: 'Sertraline', dosage: '100mg', frequency: 'Daily' },
              { name: 'Clonazepam', dosage: '0.5mg', frequency: 'As needed' }
            ]
          },
          {
            id: '2',
            firstName: 'Michael',
            lastName: 'Rodriguez',
            dateOfBirth: '1992-11-03',
            gender: 'Male',
            mrn: 'MRN67890',
            status: 'Active',
            riskLevel: 'High',
            lastVisit: '2025-03-20',
            diagnoses: ['Bipolar I Disorder', 'Substance Use Disorder'],
            currentMedications: [
              { name: 'Lithium', dosage: '900mg', frequency: 'Daily' },
              { name: 'Quetiapine', dosage: '300mg', frequency: 'Nightly' }
            ]
          },
          {
            id: '3',
            firstName: 'Sarah',
            lastName: 'Chen',
            dateOfBirth: '1979-03-24',
            gender: 'Female',
            mrn: 'MRN54321',
            status: 'Active',
            riskLevel: 'Low',
            lastVisit: '2025-03-10',
            diagnoses: ['Post-Traumatic Stress Disorder'],
            currentMedications: [
              { name: 'Prazosin', dosage: '1mg', frequency: 'Nightly' },
              { name: 'Bupropion', dosage: '150mg', frequency: 'Daily' }
            ]
          },
          {
            id: '4',
            firstName: 'David',
            lastName: 'Wilson',
            dateOfBirth: '1988-07-16',
            gender: 'Male',
            mrn: 'MRN13579',
            status: 'Active',
            riskLevel: 'High',
            lastVisit: '2025-03-22',
            diagnoses: ['Schizophrenia', 'Obsessive-Compulsive Disorder'],
            currentMedications: [
              { name: 'Risperidone', dosage: '4mg', frequency: 'Daily' },
              { name: 'Fluoxetine', dosage: '40mg', frequency: 'Daily' }
            ]
          },
          {
            id: '5',
            firstName: 'Olivia',
            lastName: 'Johnson',
            dateOfBirth: '1995-12-05',
            gender: 'Female',
            mrn: 'MRN24680',
            status: 'Active',
            riskLevel: 'Medium',
            lastVisit: '2025-03-18',
            diagnoses: ['Major Depressive Disorder', 'Eating Disorder NOS'],
            currentMedications: [
              { name: 'Escitalopram', dosage: '20mg', frequency: 'Daily' },
              { name: 'Olanzapine', dosage: '5mg', frequency: 'Nightly' }
            ]
          }
        ]), 800)
      );
    }
  );
  
  // Filter patients based on search and filter
  const filteredPatients = React.useMemo(() => {
    if (!patients) return [];
    
    let filtered = [...patients];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(search) ||
        patient.mrn.toLowerCase().includes(search) ||
        patient.diagnoses.some(d => d.toLowerCase().includes(search))
      );
    }
    
    // Apply category filter
    if (selectedFilter === 'high-risk') {
      filtered = filtered.filter(patient => patient.riskLevel === 'High');
    } else if (selectedFilter === 'recent') {
      // Sort by most recent visit and take top 3
      filtered = [...filtered].sort((a, b) => 
        new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
      ).slice(0, 3);
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
  
  // Get risk level badge color
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-background-card shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Patients
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              View and manage patient digital twins
            </p>
          </div>
          <Button 
            variant="primary"
            size="md"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Patient
          </Button>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-background-card shadow-sm border-t border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500 dark:text-neutral-400"
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
              className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                selectedFilter === 'all' 
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
              onClick={() => setSelectedFilter('all')}
            >
              All Patients
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                selectedFilter === 'high-risk' 
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
              onClick={() => setSelectedFilter('high-risk')}
            >
              High Risk
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                selectedFilter === 'recent' 
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
              onClick={() => setSelectedFilter('recent')}
            >
              Recent Visits
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-neutral-50 dark:bg-background p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            <span className="ml-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
              Loading patients...
            </span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-lg max-w-md text-center">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Error Loading Patients</h3>
              <p className="text-sm">{String(error)}</p>
              <Button 
                variant="danger" 
                size="sm" 
                className="mt-4"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No Patients Found
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
              {searchTerm 
                ? `No patients match the search term "${searchTerm}". Try a different search or reset filters.` 
                : 'No patients found with the selected filters.'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map(patient => (
              <div 
                key={patient.id}
                className="bg-white dark:bg-background-card rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => handlePatientSelect(patient.id)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        MRN: {patient.mrn}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRiskLevelColor(patient.riskLevel)}`}>
                      {patient.riskLevel} Risk
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Date of Birth</p>
                        <p className="text-sm text-neutral-900 dark:text-white">{patient.dateOfBirth}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Gender</p>
                        <p className="text-sm text-neutral-900 dark:text-white">{patient.gender}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Diagnoses</p>
                        <ul className="text-sm text-neutral-900 dark:text-white">
                          {patient.diagnoses.map((diagnosis, index) => (
                            <li key={index} className="truncate">• {diagnosis}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Last Visit: {patient.lastVisit}
                    </span>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={(e) => handleViewBrainModel(patient.id, e)}
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      }
                    >
                      Brain Model
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsList;

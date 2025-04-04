/**
 * NOVAMIND Neural Test Suite
 * PatientProfile testing with quantum precision
 */
import { describe, it, expect, vi, beforeEach, Mock } from "vitest"; // Import vi and Mock type

import { render, screen, fireEvent } from "@testing-library/react";
import React from "react"; // Added missing React import
import userEvent from "@testing-library/user-event";
import PatientProfile from "./PatientProfile"; // Use relative path
import { renderWithProviders } from "../../test/test-utils"; // Use relative path, remove extension
import * as ReactRouterDom from 'react-router-dom'; // Import for mocking
import * as ReactQuery from 'react-query'; // Import for mocking useQuery
import { Patient } from '../../domain/types/clinical/patient'; // Import Patient type

// Mock data with clinical precision
// Mock data with clinical precision - PatientProfile likely takes patientId from route params or context
const mockProps = {};

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const original = await vi.importActual('react-router-dom');
  return {
    ...original,
    useParams: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()), // Mock useNavigate to return a dummy function
  };
});

// Mock react-query
vi.mock('react-query', async () => {
  const original = await vi.importActual('react-query');
  return {
    ...original,
    useQuery: vi.fn(),
  };
});


describe("PatientProfile", () => {
  const mockPatientId = "test-patient-123";
  // Refactored mockPatientData to align with Patient interface from domain/types/clinical/patient.ts
  const mockPatientData: Patient = {
    id: mockPatientId,
    demographicData: {
      age: 35, // Added required age
      biologicalSex: "male",
      anonymizationLevel: "clinical", // Added required anonymizationLevel
      // Add other optional fields if needed by the component
    },
    clinicalData: {
      diagnoses: [
        {
          id: "diag-1",
          code: "F33.1",
          codingSystem: "ICD-10",
          name: "Major depressive disorder, recurrent, moderate",
          severity: "moderate",
          diagnosisDate: new Date("2023-01-15").toISOString(),
          status: "active",
        },
      ],
      symptoms: [
         {
            id: "symp-1",
            name: "Low Mood",
            category: "affective",
            severity: 7,
            frequency: "daily",
            impact: "moderate",
            progression: "stable",
         }
      ],
      medications: [
        {
          id: "med-1",
          name: "Sertraline",
          classification: "SSRI",
          dosage: "100mg",
          frequency: "Once Daily",
          route: "oral",
          startDate: new Date("2023-02-01").toISOString(),
          // Removed incorrect 'status' field from Medication object
        },
      ],
      psychometricAssessments: [],
      medicalHistory: [],
      // Add other optional fields if needed
    },
    treatmentData: {
      currentTreatments: [ // Assuming medications are listed here too based on common patterns
         {
          id: "med-1", // Re-use ID if it represents the same treatment instance
          type: "pharmacological",
          name: "Sertraline",
          description: "SSRI Antidepressant",
          startDate: new Date("2023-02-01").toISOString(),
          status: "active",
          dose: "100mg", // Use dose field from Treatment interface
          frequency: "Once Daily", // Use frequency field from Treatment interface
        },
      ],
      historicalTreatments: [],
      treatmentResponses: [],
      // Add other optional fields if needed
    },
    neuralData: { // Added required neuralData
        brainScans: [],
        // Add other optional fields if needed
    },
    dataAccessPermissions: { // Added required dataAccessPermissions
        accessLevel: "treatment",
        authorizedUsers: ["clinician-1"],
        consentStatus: "full",
        dataRetentionPolicy: "standard",
        lastReviewDate: new Date().toISOString(),
    },
    lastUpdated: new Date().toISOString(), // Use ISO string
    version: "1.0.0", // Added required version
  };

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    // Setup mock implementations for each test
    (ReactRouterDom.useParams as Mock).mockReturnValue({ patientId: mockPatientId });
    (ReactQuery.useQuery as Mock).mockReturnValue({
      data: mockPatientData,
      isLoading: false,
      error: null,
    });
  });

  it("renders with neural precision", () => {
    renderWithProviders(<PatientProfile {...mockProps} />); // Use renderWithProviders

    // Add assertions for rendered content
    // Assert that key patient info is rendered using the CORRECTED mock data structure
    // Note: PatientProfile component needs to be checked to see how it displays name (likely combines from API or context, not directly in Patient model)
    // Assuming PatientProfile fetches/displays name separately or uses a different hook/context
    // For now, assert based on data directly available in the mock Patient object
    expect(screen.getByText(`Age: ${mockPatientData.demographicData.age}`)).toBeInTheDocument();
    expect(screen.getByText(`Sex: ${mockPatientData.demographicData.biologicalSex}`)).toBeInTheDocument();
    // Check for diagnosis rendering
    expect(screen.getByText(mockPatientData.clinicalData.diagnoses[0].name)).toBeInTheDocument();
    // Check for medication rendering
    expect(screen.getByText(mockPatientData.clinicalData.medications[0].name)).toBeInTheDocument();
    // Add more specific assertions based on component structure
  });

  it("responds to user interaction with quantum precision", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PatientProfile {...mockProps} />); // Use renderWithProviders

    // Simulate user interactions
    // Example: Find and click the "Brain Model" button
    const brainModelButton = screen.getByRole('button', { name: /brain model/i });
    expect(brainModelButton).toBeInTheDocument();
    await user.click(brainModelButton);

    // Assert navigation was called (if useNavigate mock is set up correctly)
    // expect(ReactRouterDom.useNavigate()).toHaveBeenCalled(); // Or check the mock navigate function calls
    // Add assertions for any state changes if applicable
  });

  // Add more component-specific tests
});

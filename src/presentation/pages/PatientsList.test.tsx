/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite
 * PatientsList testing with quantum precision
 */

import type { Mock } from 'vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Removed unused React import
import { screen } from '@testing-library/react'; // Removed unused render, fireEvent
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils.unified'; // Use unified render
import * as ReactQuery from '@tanstack/react-query'; // Import for mocking useQuery
import * as ReactRouterDom from 'react-router-dom'; // Import for mocking

// Mock react-query's useQuery hook
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

// Mock react-router-dom's useNavigate hook
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()), // Mock useNavigate to return a dummy function
  };
});

// Import the REAL component
import PatientsList from './PatientsList';
import type { PatientModel } from '@domain/models/clinical/patient-model';
import { createPatientModel } from '@domain/models/clinical/patient-model'; // Import PatientModel and factory

// Mock data
// Use PatientModel and createPatientModel factory
const mockPatients: PatientModel[] = [
  createPatientModel({
    id: 'p1',
    firstName: 'Test Patient',
    lastName: 'One',
    dateOfBirth: new Date('1979-03-15'),
    demographics: { age: 45, biologicalSex: 'female' },
    // dateOfBirth: new Date("1979-03-15"), // Remove duplicate
    clinicalHistory: { primaryDiagnosis: 'MDD' },
    lastUpdated: new Date('2025-03-15'),
  }),
  createPatientModel({
    id: 'p2',
    firstName: 'Test Patient',
    lastName: 'Two',
    dateOfBirth: new Date('1972-08-22'),
    demographics: { age: 52, biologicalSex: 'male' },
    // dateOfBirth: new Date("1972-08-22"), // Remove duplicate
    clinicalHistory: { primaryDiagnosis: 'GAD' },
    lastUpdated: new Date('2025-03-20'),
  }),
];

describe('PatientsList Page', () => {
  // Re-enabled suite
  const mockedUseQuery = ReactQuery.useQuery as Mock;
  const mockedUseNavigate = ReactRouterDom.useNavigate as Mock;
  const mockNavigate = vi.fn();

  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    // Setup default mock return values
    mockedUseQuery.mockReturnValue({
      data: mockPatients,
      isLoading: false,
      error: null,
    });
    mockedUseNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders patient list correctly', () => {
    renderWithProviders(<PatientsList />);

    // Use getByRole for the heading to be more specific
    // Target the h1 specifically to avoid conflict with button text
    expect(screen.getByRole('heading', { name: 'Patients', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Test Patient One/i)).toBeInTheDocument();
    expect(screen.getByText(/MDD/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Patient Two/i)).toBeInTheDocument();
    expect(screen.getByText(/GAD/i)).toBeInTheDocument();
    // Check for the actual button text rendered by the component
    expect(screen.getAllByRole('button', { name: /brain model/i })).toHaveLength(2);
  });

  it('navigates to patient profile on button click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PatientsList />);

    // Find the button for the first patient
    // Use a more robust selector if possible, e.g., based on patient ID within the button/row
    const brainModelButtons = screen.getAllByRole('button', { name: /brain model/i });
    await user.click(brainModelButtons[0]); // Click the correct button

    // Assert navigation was called
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    // Assert navigation was called to the brain model page
    expect(mockNavigate).toHaveBeenCalledWith('/brain-model/p1');
  });

  it('displays loading state', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    renderWithProviders(<PatientsList />);
    expect(screen.getByText(/loading patients/i)).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });
    renderWithProviders(<PatientsList />);
    expect(screen.getByText(/error loading patients/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });
});

/**
 * NOVAMIND Neural Test Suite
 * PatientProfile testing with quantum precision
 */
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatientProfile from "./PatientProfile"; // Use relative path
import { renderWithProviders } from "@test/test-utils.unified"; // Correct path
import * as ReactRouterDom from 'react-router-dom'; // Import for mocking
import { Patient } from '../../domain/types/clinical/patient'; // Import Patient type

// Mock data with clinical precision - PatientProfile likely takes patientId from route params or context
const mockProps = {};

// Mock react-router-dom hooks
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    __esModule: true, // Ensure ES module handling
    ...actual,        // Spread actual exports
    useParams: vi.fn(), // Mock specific hooks
    useNavigate: vi.fn(() => vi.fn()),
  };
});

// No need to mock react-query as the component uses internal state/fetch simulation

describe("PatientProfile", () => { // Re-enabled suite
  const mockPatientId = "test-patient-123";
  const mockNavigate = vi.fn();

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    // Mock useNavigate consistently
    (ReactRouterDom.useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore mocks
  });

  it("renders with neural precision", async () => {
    // Mock useParams specifically for this test
    (ReactRouterDom.useParams as Mock).mockReturnValue({ id: mockPatientId });
    renderWithProviders(<PatientProfile {...mockProps} />);

    // Wait for the simulated fetch to complete using findByText with timeout
    expect(await screen.findByText(`Patient ${mockPatientId.slice(0, 4)}`, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(`ID: ${mockPatientId}`)).toBeInTheDocument();
    expect(screen.getByText(/DOB: 1985-01-01/i)).toBeInTheDocument(); // Correct date format
    expect(screen.getByText(/Gender: Not Specified/i)).toBeInTheDocument();
    expect(screen.getByText(/No detailed records available./i)).toBeInTheDocument();
    expect(screen.getByText(/No brain scan datasets available/i)).toBeInTheDocument();
  });

  it("responds to user interaction with quantum precision", async () => {
    // Mock useParams specifically for this test
    (ReactRouterDom.useParams as Mock).mockReturnValue({ id: mockPatientId });
    const user = userEvent.setup();
    renderWithProviders(<PatientProfile {...mockProps} />);

    // Wait for loading to potentially finish using findBy with increased timeout
    expect(await screen.findByText(`Patient ${mockPatientId.slice(0, 4)}`, {}, { timeout: 5000 })).toBeInTheDocument();

    // Test the back button navigation
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
    await user.click(backButton);

    // Assert navigation was called to go back
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // Add more component-specific tests
});

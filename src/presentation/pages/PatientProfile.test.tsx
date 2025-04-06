/**
 * NOVAMIND Neural Test Suite
 * PatientProfile testing with quantum precision
 */
import React from 'react'; // Import React
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'; // Import Mock
import { render, screen, cleanup } from '@testing-library/react'; // Import cleanup
import userEvent from '@testing-library/user-event';
import * as ReactRouterDom from 'react-router-dom'; // Import all for mocking

// Mock dependencies before importing the component
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn(), // Mock useParams as well
    MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

// Import the component after mocks
import PatientProfile from '@presentation/pages/PatientProfile'; // Correct alias
import { renderWithProviders } from '@test/test-utils.unified.tsx'; // Correct filename and keep alias

// Mock data with clinical precision - Assuming no specific props are required for PatientProfile page
const mockProps = {};

describe('PatientProfile', () => {
  // Re-enabled suite
  const mockPatientId = 'test-patient-123';
  const mockNavigate = vi.fn();

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    // Mock useNavigate consistently
    (ReactRouterDom.useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore mocks
    cleanup(); // Add cleanup
  });

  it('renders with neural precision', async () => {
    // Mock useParams specifically for this test
    (ReactRouterDom.useParams as Mock).mockReturnValue({ id: mockPatientId });
    renderWithProviders(<PatientProfile {...mockProps} />);

    // Wait for the simulated fetch to complete using findByText with timeout
    expect(
      await screen.findByText(`Patient ${mockPatientId.slice(0, 4)}`, {}, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(screen.getByText(`ID: ${mockPatientId}`)).toBeInTheDocument();
    expect(screen.getByText(/DOB: 1985-01-01/i)).toBeInTheDocument(); // Correct date format
    expect(screen.getByText(/Gender: Not Specified/i)).toBeInTheDocument();
    expect(screen.getByText(/No detailed records available./i)).toBeInTheDocument();
    expect(screen.getByText(/No brain scan datasets available/i)).toBeInTheDocument();
  });

  it('responds to user interaction with quantum precision', async () => {
    // Mock useParams for this test too
    (ReactRouterDom.useParams as Mock).mockReturnValue({ id: mockPatientId });
    const user = userEvent.setup();
    renderWithProviders(<PatientProfile {...mockProps} />);

    // Wait for initial render/data load
    await screen.findByText(`Patient ${mockPatientId.slice(0, 4)}`, {}, { timeout: 5000 });

    // Simulate user interactions (Example - replace with actual interactions if needed)
    // await user.click(screen.getByText(/example button/i));

    // Add assertions for behavior after interaction (Example)
    // expect(mockNavigate).toHaveBeenCalledWith('/some-path');
  });

  // Add more component-specific tests
});

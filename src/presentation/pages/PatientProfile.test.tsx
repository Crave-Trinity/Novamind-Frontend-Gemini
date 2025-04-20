/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite
 * PatientProfile testing with quantum precision
 */
import React from 'react'; // Import React
import type { Mock } from 'vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'; // Import Mock
import { screen, cleanup } from '@testing-library/react'; // Import cleanup, Removed unused render
// Removed unused userEvent import
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
import { renderWithProviders } from '../../test/test-utils.unified'; // Correct filename and keep alias

// Mock audit log service
vi.mock('@infrastructure/services/AuditLogService', () => ({
  // Adjust path if needed
  auditLogService: {
    log: vi.fn(),
  },
}));

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
    // Assert against the actual hardcoded data rendered by the component
    // Check for the H1 containing the name
    expect(await screen.findByRole('heading', { name: /Jane Doe/i, level: 1 })).toBeInTheDocument();
    // Check for the paragraph containing the ID (uses the mocked ID via fallback)
    expect(screen.getByText(`Patient ID: ${mockPatientId}`)).toBeInTheDocument();
    // Assert other hardcoded data points
    expect(screen.getByText(/Age:/i)).toBeInTheDocument(); // Check for label
    expect(screen.getByText(/32/)).toBeInTheDocument(); // Check for value
    expect(screen.getByText(/jane.doe@example.com/i)).toBeInTheDocument();
    // Add more assertions for other displayed data if necessary
  });

  it('responds to user interaction with quantum precision', async () => {
    // Mock useParams for this test too
    (ReactRouterDom.useParams as Mock).mockReturnValue({ id: mockPatientId });
    // const user = userEvent.setup(); // Removed unused variable
    renderWithProviders(<PatientProfile {...mockProps} />);

    // Wait for initial render/data load
    // Wait for the component to render using the actual heading text
    await screen.findByRole('heading', { name: /Jane Doe/i, level: 1 });

    // Simulate user interactions (Example - replace with actual interactions if needed)
    // await user.click(screen.getByText(/example button/i));

    // Add assertions for behavior after interaction (Example)
    // expect(mockNavigate).toHaveBeenCalledWith('/some-path');
  });

  // Add more component-specific tests
});

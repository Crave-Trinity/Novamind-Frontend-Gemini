/**
 * NOVAMIND Neural Test Suite
 * Dashboard testing with quantum precision
 */
import { describe, it, expect, vi } from "vitest";

import { screen, fireEvent, within } from "@testing-library/react"; // Added 'within' import
// Remove MemoryRouter import, it's provided by renderWithProviders
import userEvent from "@testing-library/user-event";
import Dashboard from "@pages/Dashboard"; // Use correct alias
import { renderWithProviders } from "@test/test-utils.unified.tsx"; // Use correct unified path
import { useNavigate } from "react-router-dom"; // Import for mocking

// Mock react-router-dom specifically for this test
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock data with clinical precision
// Mock data with clinical precision - Assuming no specific props are required for Dashboard page
const mockProps = {};

describe("Dashboard", () => {
  it("renders key dashboard elements with neural precision", () => {
    renderWithProviders(<Dashboard {...mockProps} />);

    // Verify main title and subtitle
    expect(screen.getByText("Novamind Digital Twin Platform")).toBeInTheDocument();
    expect(screen.getByText("Clinical neuroscience visualization and analysis")).toBeInTheDocument();

    // Verify summary cards (checking for key text)
    expect(screen.getByText("Total Patients")).toBeInTheDocument();
    expect(screen.getByText("Normal Status")).toBeInTheDocument();
    expect(screen.getByText("Needs Review")).toBeInTheDocument();
    expect(screen.getByText("Critical Status")).toBeInTheDocument();

    // Verify section titles
    expect(screen.getByText("Demo Brain Visualization")).toBeInTheDocument();
    expect(screen.getByText("Patient Visualizations")).toBeInTheDocument();
    
    // Verify patient table headers
    expect(screen.getByRole('columnheader', { name: /patient/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /age/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /last updated/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
  });

  it("navigates when 'View Brain' is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard {...mockProps} />);

    // Find the "View Brain" button for the Demo Patient (ID: demo)
    // We can find the row containing "Demo Patient" and then the button within that row
    const demoPatientRow = screen.getByText("Demo Patient").closest('tr');
    expect(demoPatientRow).toBeInTheDocument(); // Ensure row is found

    // Use within to scope the search to the specific row
    const viewBrainButton = within(demoPatientRow!).getByRole('button', { name: /view brain/i });
    
    await user.click(viewBrainButton);

    // Assert that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/brain-visualization/demo');
  });

  // Add more component-specific tests
});

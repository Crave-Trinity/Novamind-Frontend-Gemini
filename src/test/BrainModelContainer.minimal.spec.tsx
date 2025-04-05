/**
 * NOVAMIND Neural Architecture
 * Minimal BrainModelContainer Test with Quantum Precision
 *
 * This test provides a simplified approach to testing the BrainModelContainer
 * component with proper mocking of Three.js and related dependencies.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"; // Import afterEach
import React from "react";
import { screen, cleanup } from "@testing-library/react"; // Import cleanup
import { renderWithProviders } from '@test/test-utils.unified';

// Create a minimal mock for the BrainModelContainer component
const MockBrainModel = () => (
  <div data-testid="brain-model">Neural Visualization</div>
);
const MockControlPanel = () => (
  <div data-testid="control-panel">Neural Controls</div>
);

// Mock the actual components used by BrainModelContainer
vi.mock("../presentation/molecules/BrainModel", () => ({
  default: MockBrainModel,
}));

vi.mock("../presentation/molecules/ControlPanel", () => ({
  default: MockControlPanel,
}));

// Import the component under test after mocking its dependencies
import BrainModelContainer from "@presentation/templates/BrainModelContainer";

describe("BrainModelContainer Minimal Test", () => {
  beforeEach(() => {
    // Clear all mocks before each test with quantum precision
    vi.clearAllMocks();
  });

  it("renders the container with neural precision", () => {
    // Render the component with clinical precision
    renderWithProviders(<BrainModelContainer patientId="test-patient-123" />); // Provide required prop

    // Verify that the component renders with mathematical elegance
    expect(screen.getByTestId("brain-model")).toBeDefined();
    expect(screen.getByTestId("control-panel")).toBeDefined();
  });
  
  afterEach(cleanup); // Add cleanup
});

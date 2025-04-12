/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite
 * VisualizationControls testing with quantum precision
 */
// Removed unused React import (new JSX transform)
import { describe, it, expect, vi } from 'vitest'; // Removed unused beforeEach, afterEach
// Removed duplicate WebGL mock imports, keep setup/cleanup if needed, but likely handled globally or by test-utils
// import { setupWebGLMocks, cleanupWebGLMocks } from '../../test/webgl';
// Removed beforeEach import

import { screen } from '@testing-library/react'; // Removed unused render, fireEvent
import userEvent from '@testing-library/user-event';
import VisualizationControls from './VisualizationControls';
import { renderWithProviders } from '../../test/test-utils.unified';
import { RenderMode } from '@domain/types/brain/visualization'; // Import RenderMode

// Mock data with clinical precision including required props
const mockProps = {
  renderMode: RenderMode.ANATOMICAL, // Provide a default render mode
  onRenderModeChange: vi.fn(), // Mock the required handler function
  // Add other optional component props here if needed for specific tests
};

describe('VisualizationControls', () => {
  // Unskip the suite
  // Local matchMedia mock removed - relying on global mock in setup.ts

  it('renders with neural precision', () => {
    // Use renderWithProviders if context is needed, otherwise use render
    renderWithProviders(<VisualizationControls {...mockProps} />);

    // Add assertions for rendered content - check for a key element
    expect(screen.getByText('Visualization Mode')).toBeInTheDocument();
  });

  it('responds to user interaction with quantum precision', async () => {
    const user = userEvent.setup();
    const specificMockProps = {
      ...mockProps,
      onRenderModeChange: vi.fn(), // Use a fresh mock for this test
    };
    renderWithProviders(<VisualizationControls {...specificMockProps} />);

    // Simulate user clicking the 'Functional' mode button
    const functionalButton = screen.getByRole('button', { name: /functional/i });
    await user.click(functionalButton);

    // Add assertions for behavior after interaction
    expect(specificMockProps.onRenderModeChange).toHaveBeenCalledWith(RenderMode.FUNCTIONAL);
    expect(specificMockProps.onRenderModeChange).toHaveBeenCalledTimes(1);

    // Simulate clicking 'Settings'
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);
    // Check if settings panel appears (e.g., by looking for a setting label)
    expect(screen.getByText(/activity threshold/i)).toBeInTheDocument();
  });

  // Add more component-specific tests, e.g., for settings changes
});

// Removed redundant closing brace

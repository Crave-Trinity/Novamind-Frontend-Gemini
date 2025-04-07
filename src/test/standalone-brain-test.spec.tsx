/**
 * NOVAMIND Neural Architecture
 * Standalone Brain Test with Quantum Precision
 *
 * This test is completely self-contained and doesn't rely on any external
 * components or complex mocking to establish a baseline for testing.
 */

import { describe, it, expect } from 'vitest'; // Removed unused vi import
// Removed unused React import
import { screen, within } from '@testing-library/react'; // Import within
import { renderWithProviders } from '@test/test-utils.unified'; // Import unified render

// Define a standalone component that mimics the structure of BrainModelContainer
const StandaloneBrainContainer = () => {
  return (
    <div data-testid="brain-container" className="w-full h-full flex flex-col">
      <div data-testid="brain-model" className="flex-grow">
        <div className="w-full h-full bg-black rounded-lg overflow-hidden">
          <div className="text-white p-4">Neural Visualization Placeholder</div>
        </div>
      </div>
      <div data-testid="control-panel" className="h-64 mt-4">
        <div className="w-full h-full bg-gray-900 rounded-lg p-4">
          <div className="text-white">Neural Controls Placeholder</div>
        </div>
      </div>
    </div>
  );
};

describe('Standalone Brain Container Test', () => {
  it('renders the standalone container with quantum precision', () => {
    // Render the component with clinical precision
    renderWithProviders(<StandaloneBrainContainer />); // Use unified render

    // Verify that the component renders with mathematical elegance
    expect(screen.getByTestId('brain-container')).toBeInTheDocument();
    // Query within the first container found
    const container = screen.getAllByTestId('brain-container')[0];
    expect(within(container).getByTestId('brain-model')).toBeInTheDocument();
    expect(within(container).getByTestId('control-panel')).toBeInTheDocument();

    // Verify text content with neural precision
    expect(screen.getByText('Neural Visualization Placeholder')).toBeInTheDocument();
    expect(screen.getByText('Neural Controls Placeholder')).toBeInTheDocument();
  });
});

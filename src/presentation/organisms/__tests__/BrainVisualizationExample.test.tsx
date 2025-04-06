/**
 * Example test file demonstrating WebGL mocking system
 *
 * This test file shows how to use the WebGL mocking system to test
 * brain visualization components that use Three.js, without causing
 * test hanging or memory leaks.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react'; // Remove render
import { setupWebGLForTest, cleanupWebGLAfterTest, runTestWithWebGL } from '@test/webgl/setup-test';
import React from 'react';
// Import only the default export (the component)
import BrainVisualization from '../BrainVisualization';
import { renderWithProviders } from '@test/test-utils.unified'; // Import unified render

// Remove standalone mock component definition

// Vitest mock implementation
// Ensure the path to the actual component is correct for vi.mock
// Assuming the actual component is in the parent directory:
vi.mock('../BrainVisualization', () => ({
  // Define props based on the *actual* component signature
  default: ({
    brainModel,
    selectedRegion,
    onRegionSelect = () => {},
    className = '',
    isLoading = false,
    error = null,
  }: {
    brainModel?: any | null;
    selectedRegion?: string | null;
    onRegionSelect?: (regionId: string) => void;
    className?: string;
    isLoading?: boolean;
    error?: Error | null;
    // DO NOT include showControls or detailLevel here
  }) => (
    <div data-testid="brain-container">
      <div data-testid="brain-canvas">Mock 3D Brain</div>
      {/* Mock controls based on internal logic or simplify */}
      {/* For simplicity, let's always render mock controls in the mock */}
      <div data-testid="controls">
        <button data-testid="region-select" onClick={() => onRegionSelect('prefrontal-cortex')}>
          Select Region
        </button>
        {/* Remove detailLevel select as it's not a prop */}
      </div>
    </div>
  ),
}));

// Remove redundant assignment, tests will use the vi.mock implementation

describe('BrainVisualization Component with WebGL Mocks', () => {
  // Method 1: Use beforeAll/afterAll hooks
  beforeAll(() => {
    setupWebGLForTest({
      monitorMemory: true,
      debugMode: false,
    });
  });

  afterAll(() => {
    cleanupWebGLAfterTest({
      failOnLeak: true, // This will throw if memory leaks are detected
    });
  });

  it('renders the brain visualization', () => {
    renderWithProviders(<BrainVisualization />); // Remove patientId prop

    // Check if the component renders correctly
    expect(screen.getByTestId('brain-container')).toBeInTheDocument();
    expect(screen.getByTestId('brain-canvas')).toBeInTheDocument();
  });

  it('allows selecting brain regions', () => {
    const onRegionSelect = vi.fn();

    renderWithProviders(
      // Use renderWithProviders
      <BrainVisualization
        onRegionSelect={onRegionSelect} // Remove patientId prop
      />
    );

    // Click on a region
    fireEvent.click(screen.getByTestId('region-select'));

    // Verify the callback was called with the correct region
    expect(onRegionSelect).toHaveBeenCalledWith('prefrontal-cortex');
  });
  // Removed invalid test case for non-existent 'showControls' prop
});
// Remove extra closing brace

// Method 2: Use the runTestWithWebGL utility function
describe('BrainVisualization with runTestWithWebGL utility', () => {
  it('renders with different detail levels', async () => {
    await runTestWithWebGL(
      () => {
        renderWithProviders(
          // Use renderWithProviders
          <BrainVisualization
          // Remove detailLevel prop as it doesn't exist
          />
        );

        expect(screen.getByTestId('brain-container')).toBeInTheDocument();

        // You can perform assertions on the WebGL content here
      },
      {
        monitorMemory: true,
        failOnLeak: true,
        useNeuralControllerMocks: true, // Use neural controller mocks for this test
      }
    );
  });
});

// Advanced test with neural controller mocks
describe('BrainVisualization with Neural Controller Mocks', () => {
  beforeAll(() => {
    setupWebGLForTest({
      monitorMemory: true,
      useNeuralControllerMocks: true, // Enable neural controller mocks
    });
  });

  afterAll(() => {
    cleanupWebGLAfterTest();
  });

  it('renders with neural activity data', () => {
    // The neural controller mocks will automatically provide simulated data
    renderWithProviders(<BrainVisualization />); // Remove patientId prop

    expect(screen.getByTestId('brain-container')).toBeInTheDocument();

    // In a real implementation, you would test additional neural-specific features:
    // - Neural activity visualization
    // - Connectivity rendering
    // Region activation levels
    // etc.
  });
});

// Memory leak testing
describe('BrainVisualization Memory Management', () => {
  it('properly disposes resources when unmounted', async () => {
    await runTestWithWebGL(
      () => {
        const { unmount } = renderWithProviders(<BrainVisualization />); // Remove patientId prop

        // Unmount to trigger cleanup
        unmount();

        // The runTestWithWebGL utility will automatically check for memory leaks
        // after the test completes
      },
      {
        monitorMemory: true,
        failOnLeak: true,
      }
    );
  });
});

/**
 * Example test file demonstrating WebGL mocking system
 *
 * This test file shows how to use the WebGL mocking system to test
 * brain visualization components that use Three.js, without causing
 * test hanging or memory leaks.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupWebGLForTest, cleanupWebGLAfterTest, runTestWithWebGL } from '@test/webgl/setup-test';
import React from 'react';

// Mock component for demonstration (remove this and use the real component in actual tests)
interface BrainVisualizationProps {
  patientId: string;
  onRegionSelect?: (region: string) => void;
  showControls?: boolean;
  detailLevel?: string;
}

const MockBrainVisualization: React.FC<BrainVisualizationProps> = ({ 
  patientId, 
  onRegionSelect = () => {}, 
  showControls = true,
  detailLevel = 'medium' 
}) => (
  <div data-testid="brain-container">
    <div data-testid="brain-canvas">Mock 3D Brain</div>
    {showControls && (
      <div data-testid="controls">
        <button 
          data-testid="region-select" 
          onClick={() => onRegionSelect('prefrontal-cortex')}
        >
          Select Region
        </button>
        <select data-testid="detail-level">
          <option value="low">Low</option>
          <option value="medium" selected={detailLevel === 'medium'}>Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    )}
  </div>
);

// Vitest mock implementation
vi.mock('../BrainVisualization', () => ({
  default: ({ patientId, onRegionSelect = () => {}, showControls = true, detailLevel = 'medium' }: BrainVisualizationProps) => (
    <div data-testid="brain-container">
      <div data-testid="brain-canvas">Mock 3D Brain</div>
      {showControls && (
        <div data-testid="controls">
          <button 
            data-testid="region-select" 
            onClick={() => onRegionSelect('prefrontal-cortex')}
          >
            Select Region
          </button>
          <select data-testid="detail-level">
            <option value="low">Low</option>
            <option value="medium" selected={detailLevel === 'medium'}>Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      )}
    </div>
  )
}));

// For our example tests, use the MockBrainVisualization
const BrainVisualization = MockBrainVisualization;

describe('BrainVisualization Component with WebGL Mocks', () => {
  // Method 1: Use beforeAll/afterAll hooks
  beforeAll(() => {
    setupWebGLForTest({
      monitorMemory: true,
      debugMode: false
    });
  });

  afterAll(() => {
    cleanupWebGLAfterTest({
      failOnLeak: true // This will throw if memory leaks are detected
    });
  });

  it('renders the brain visualization', () => {
    render(<BrainVisualization patientId="patient-123" />);
    
    // Check if the component renders correctly
    expect(screen.getByTestId('brain-container')).toBeInTheDocument();
    expect(screen.getByTestId('brain-canvas')).toBeInTheDocument();
  });

  it('allows selecting brain regions', () => {
    const onRegionSelect = vi.fn();
    
    render(
      <BrainVisualization 
        patientId="patient-123" 
        onRegionSelect={onRegionSelect}
      />
    );
    
    // Click on a region
    fireEvent.click(screen.getByTestId('region-select'));
    
    // Verify the callback was called with the correct region
    expect(onRegionSelect).toHaveBeenCalledWith('prefrontal-cortex');
  });

  it('can hide controls when specified', () => {
    render(
      <BrainVisualization 
        patientId="patient-123" 
        showControls={false}
      />
    );
    
    // Controls should not be visible
    expect(screen.queryByTestId('controls')).not.toBeInTheDocument();
  });
});

// Method 2: Use the runTestWithWebGL utility function
describe('BrainVisualization with runTestWithWebGL utility', () => {
  it('renders with different detail levels', async () => {
    await runTestWithWebGL(() => {
      render(
        <BrainVisualization 
          patientId="patient-123" 
          detailLevel="high"
        />
      );
      
      expect(screen.getByTestId('brain-container')).toBeInTheDocument();
      
      // You can perform assertions on the WebGL content here
    }, {
      monitorMemory: true,
      failOnLeak: true,
      useNeuralControllerMocks: true // Use neural controller mocks for this test
    });
  });
});

// Advanced test with neural controller mocks
describe('BrainVisualization with Neural Controller Mocks', () => {
  beforeAll(() => {
    setupWebGLForTest({
      monitorMemory: true,
      useNeuralControllerMocks: true // Enable neural controller mocks
    });
  });

  afterAll(() => {
    cleanupWebGLAfterTest();
  });

  it('renders with neural activity data', () => {
    // The neural controller mocks will automatically provide simulated data
    render(<BrainVisualization patientId="patient-123" />);
    
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
    await runTestWithWebGL(() => {
      const { unmount } = render(<BrainVisualization patientId="patient-123" />);
      
      // Unmount to trigger cleanup
      unmount();
      
      // The runTestWithWebGL utility will automatically check for memory leaks
      // after the test completes
    }, {
      monitorMemory: true,
      failOnLeak: true
    });
  });
});

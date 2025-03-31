import { /**
 * NOVAMIND Neural Test Suite
 * BrainVisualizationControls testing with quantum precision
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrainVisualizationControls from './BrainVisualizationControls';
import { renderWithProviders } from '../../test/testUtils';
import { RenderMode } from '../../domain/models/BrainModel';

// Mock data with clinical precision
const mockProps = {
  activeRegions: ['prefrontal-cortex', 'amygdala', 'hippocampus'],
  onRegionToggle: vi.fn(),
  onRenderModeChange: vi.fn(),
  onResetView: vi.fn(),
  currentRenderMode: RenderMode.ANATOMICAL,
  disabled: false
};

describe('BrainVisualizationControls', () => {
  it('renders with neural precision', () => {
    render(<BrainVisualizationControls {...mockProps} />);
    
    // Verify component renders correctly
    expect(screen.getByText('Visualization Controls')).toBeInTheDocument();
    expect(screen.getByText('Show')).toBeInTheDocument();
  });
  
  it('responds to user interaction with quantum precision', async () => {
    const user = userEvent.setup();
    render(<BrainVisualizationControls {...mockProps} />);
    
    // Expand the controls
    await user.click(screen.getByText('Show'));
    
    // Verify expanded state
    expect(screen.getByText('Hide')).toBeInTheDocument();
    expect(screen.getByText('Render Mode')).toBeInTheDocument();
    expect(screen.getByText('Active Regions (3)')).toBeInTheDocument();
    
    // Verify render mode buttons
    Object.values(RenderMode).forEach(mode => {
      const buttonText = mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase().replace("_", " ");
      expect(screen.getByText(buttonText)).toBeInTheDocument();
    });
    
    // Test interaction with render mode
    await user.click(screen.getByText('Functional'));
    expect(mockProps.onRenderModeChange).toHaveBeenCalledWith(RenderMode.FUNCTIONAL);
    
    // Test interaction with reset view
    await user.click(screen.getByText('Reset View'));
    expect(mockProps.onResetView).toHaveBeenCalled();
    
    // Test region toggle
    if (screen.queryByText('prefrontal-cortex')) {
      await user.click(screen.getByText('prefrontal-cortex'));
      expect(mockProps.onRegionToggle).toHaveBeenCalledWith('prefrontal-cortex');
    }
  });
  
  it('disables controls when disabled prop is true', async () => {
    const user = userEvent.setup();
    render(<BrainVisualizationControls {...mockProps} disabled={true} />);
    
    // Expand the controls
    await user.click(screen.getByText('Show'));
    
    // Get the reset button and verify it's disabled
    const resetButton = screen.getByText('Reset View');
    expect(resetButton).toBeDisabled();
    
    // Reset mock to ensure clean test state
    mockProps.onResetView.mockClear();
    
    // Attempt to click the disabled button
    await user.click(resetButton);
    
    // Verify the callback wasn't called
    expect(mockProps.onResetView).not.toHaveBeenCalled();
  });
}); } from "";
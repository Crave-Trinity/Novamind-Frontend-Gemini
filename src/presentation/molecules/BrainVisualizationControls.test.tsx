/**
 * BrainVisualizationControls - Minimal Test
 * Replaced with minimal test to prevent hanging from useFrame animation loop
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest'; // Remove beforeEach, afterEach
import { render, screen } from '@test/test-utils.unified'; // Use unified render
import BrainVisualizationControls from './BrainVisualizationControls'; // Use default import
// Remove WebGL mock imports

// Remove unnecessary R3F/Three mocks for this component test

// Minimal test to verify component can be imported
// Mock props
const mockProps = {
  viewMode: 'normal' as const,
  rotationSpeed: 1,
  rotationEnabled: true,
  onViewModeChange: vi.fn(),
  onRotationSpeedChange: vi.fn(),
  onRotationToggle: vi.fn(),
};

describe('BrainVisualizationControls', () => {
  // Remove WebGL setup/teardown

  it('renders controls correctly', () => {
    render(<BrainVisualizationControls {...mockProps} />);

    // Check for key elements
    expect(screen.getByText('View:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Normal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Activity/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Connections/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rotation: On/i })).toBeInTheDocument();
    expect(screen.getByText('Speed:')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  // Add interaction tests if needed later
});

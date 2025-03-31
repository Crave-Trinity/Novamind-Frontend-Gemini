/**
 * NOVAMIND Neural Architecture
 * Minimal BrainModelContainer Test with Quantum Precision
 * 
 * This test provides a simplified approach to testing the BrainModelContainer
 * component with proper mocking of Three.js and related dependencies.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

// Create a minimal mock for the BrainModelContainer component
const MockBrainModel = () => <div data-testid="brain-model">Neural Visualization</div>;
const MockControlPanel = () => <div data-testid="control-panel">Neural Controls</div>;

// Mock the actual components used by BrainModelContainer
vi.mock('../presentation/molecules/BrainModel', () => ({
  default: MockBrainModel
}));

vi.mock('../presentation/molecules/ControlPanel', () => ({
  default: MockControlPanel
}));

// Import the component under test after mocking its dependencies
import BrainModelContainer from '../presentation/templates/BrainModelContainer';

describe('BrainModelContainer Minimal Test', () => {
  beforeEach(() => {
    // Clear all mocks before each test with quantum precision
    vi.clearAllMocks();
  });
  
  it('renders the container with neural precision', () => {
    // Render the component with clinical precision
    render(<BrainModelContainer />);
    
    // Verify that the component renders with mathematical elegance
    expect(screen.getByTestId('brain-model')).toBeDefined();
    expect(screen.getByTestId('control-panel')).toBeDefined();
  });
});

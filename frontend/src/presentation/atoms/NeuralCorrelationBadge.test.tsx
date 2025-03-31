/**
 * NOVAMIND Neural Test Suite
 * NeuralCorrelationBadge component testing with quantum precision
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NeuralCorrelationBadge } from './NeuralCorrelationBadge';

describe('NeuralCorrelationBadge', () => {
  // Neural correlation test data with clinical precision
  const mockLowCorrelation = {
    strength: 0.2,
    description: 'Weak correlation between occipital activity and visual symptom',
    regions: ['Occipital Lobe'],
    confidence: 0.6
  };

  const mockMediumCorrelation = {
    strength: 0.5,
    description: 'Moderate correlation between amygdala activity and anxiety',
    regions: ['Amygdala', 'Prefrontal Cortex'],
    confidence: 0.75
  };

  const mockHighCorrelation = {
    strength: 0.85,
    description: 'Strong correlation between hippocampus and memory deficit',
    regions: ['Hippocampus', 'Entorhinal Cortex', 'Parahippocampal Gyrus'],
    confidence: 0.92,
    activityPatterns: ['Theta Oscillations', 'Sharp Wave Ripples']
  };

  it('renders with minimal props and displays correct strength', () => {
    render(<NeuralCorrelationBadge correlation={mockLowCorrelation} />);
    
    // Verify correlation strength is displayed with mathematical precision
    expect(screen.getByText(/Neural Match: 20%/i)).toBeInTheDocument();
  });

  it('applies different color schemes based on correlation strength', () => {
    const { rerender } = render(<NeuralCorrelationBadge correlation={mockLowCorrelation} data-testid="badge" />);
    
    // Low correlation should use slate color scheme
    const lowBadge = screen.getByText(/Neural Match: 20%/i).closest('div');
    expect(lowBadge).toHaveClass('bg-slate-100');
    
    // Medium correlation should use blue color scheme
    rerender(<NeuralCorrelationBadge correlation={mockMediumCorrelation} data-testid="badge" />);
    const mediumBadge = screen.getByText(/Neural Match: 50%/i).closest('div');
    expect(mediumBadge).toHaveClass('bg-blue-100');
    
    // High correlation should use green color scheme
    rerender(<NeuralCorrelationBadge correlation={mockHighCorrelation} data-testid="badge" />);
    const highBadge = screen.getByText(/Neural Match: 85%/i).closest('div');
    expect(highBadge).toHaveClass('bg-green-100');
  });

  it('hides strength when showStrength is false', () => {
    render(<NeuralCorrelationBadge 
      correlation={mockMediumCorrelation} 
      showStrength={false} 
    />);
    
    // Should only show "Neural Match" without percentage
    expect(screen.getByText(/Neural Match$/i)).toBeInTheDocument();
    expect(screen.queryByText(/Neural Match: 50%/i)).not.toBeInTheDocument();
  });

  it('respects size prop with corresponding CSS classes', () => {
    const { rerender } = render(
      <NeuralCorrelationBadge correlation={mockMediumCorrelation} size="sm" />
    );
    
    // Small badge should have small text and padding
    const smallBadge = screen.getByText(/Neural Match: 50%/i).closest('div');
    expect(smallBadge).toHaveClass('text-xs py-0.5 px-1.5');
    
    // Medium badge should have default text and padding
    rerender(<NeuralCorrelationBadge correlation={mockMediumCorrelation} size="md" />);
    const mediumBadge = screen.getByText(/Neural Match: 50%/i).closest('div');
    expect(mediumBadge).toHaveClass('text-xs py-0.5 px-2');
    
    // Large badge should have larger text and padding
    rerender(<NeuralCorrelationBadge correlation={mockMediumCorrelation} size="lg" />);
    const largeBadge = screen.getByText(/Neural Match: 50%/i).closest('div');
    expect(largeBadge).toHaveClass('text-sm py-1 px-3');
  });

  it('applies custom className when provided', () => {
    render(
      <NeuralCorrelationBadge 
        correlation={mockMediumCorrelation} 
        className="custom-test-class" 
      />
    );
    
    const badge = screen.getByText(/Neural Match: 50%/i).closest('div');
    expect(badge).toHaveClass('custom-test-class');
  });

  it('renders without tooltip when showTooltip is false', () => {
    render(
      <NeuralCorrelationBadge 
        correlation={mockHighCorrelation} 
        showTooltip={false} 
      />
    );
    
    // Without tooltip, badge should not be wrapped in a TooltipProvider
    const badge = screen.getByText(/Neural Match: 85%/i).closest('div');
    expect(badge).not.toHaveClass('cursor-help');
  });
});

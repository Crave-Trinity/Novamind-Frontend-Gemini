import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../test/test-utils.unified';
import { Separator } from './separator';

describe('Separator Component', () => {
  it('renders with default horizontal orientation', () => {
    renderWithProviders(<Separator data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    
    // Should have the default classes
    expect(separator).toHaveClass('shrink-0');
    expect(separator).toHaveClass('bg-border');
    
    // Should have horizontal-specific classes
    expect(separator).toHaveClass('h-[1px]');
    expect(separator).toHaveClass('w-full');
    expect(separator).not.toHaveClass('h-full');
    expect(separator).not.toHaveClass('w-[1px]');
    // Should be decorative by default
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    // When decorative is true, it shouldn't have role="separator"
    expect(separator).not.toHaveAttribute('role', 'separator');
  });

  it('renders with vertical orientation', () => {
    renderWithProviders(<Separator orientation="vertical" data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    
    // Should have the default classes
    expect(separator).toHaveClass('shrink-0');
    expect(separator).toHaveClass('bg-border');
    
    // Should have vertical-specific classes
    expect(separator).toHaveClass('h-full');
    expect(separator).toHaveClass('w-[1px]');
    expect(separator).not.toHaveClass('h-[1px]');
    expect(separator).not.toHaveClass('w-full');
    
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('handles non-decorative separators', () => {
    renderWithProviders(<Separator decorative={false} data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    
    // Should not have aria-hidden if not decorative (semantically meaningful)
    expect(separator).not.toHaveAttribute('aria-hidden');
    
    // Should have proper role for a separator
    expect(separator).toHaveAttribute('role', 'separator');
  });

  it('applies custom className to the separator', () => {
    renderWithProviders(
      <Separator 
        className="custom-separator" 
        data-testid="separator" 
      />
    );
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('custom-separator');
    expect(separator).toHaveClass('shrink-0'); // Still has default classes
  });

  it('forwards ref to the separator element', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    renderWithProviders(
      <Separator 
        ref={ref}
        data-testid="separator" 
      />
    );
    
    const separator = screen.getByTestId('separator');
    expect(ref.current).toBe(separator);
  });

  it('passes additional props to the separator element', () => {
    renderWithProviders(
      <Separator 
        id="my-separator"
        aria-label="Section divider"
        data-testid="separator" 
      />
    );
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('id', 'my-separator');
    expect(separator).toHaveAttribute('aria-label', 'Section divider');
  });

  it('supports both horizontal and vertical in a layout', () => {
    renderWithProviders(
      <div data-testid="layout">
        <div>Section 1</div>
        <Separator data-testid="horizontal-separator" />
        <div>Section 2</div>
        <div style={{ display: 'flex', height: '50px' }}>
          <div>Column 1</div>
          <Separator orientation="vertical" data-testid="vertical-separator" />
          <div>Column 2</div>
        </div>
      </div>
    );
    
    const horizontalSeparator = screen.getByTestId('horizontal-separator');
    const verticalSeparator = screen.getByTestId('vertical-separator');
    
    expect(horizontalSeparator).toHaveClass('w-full');
    expect(verticalSeparator).toHaveClass('h-full');
    
    expect(horizontalSeparator).toHaveAttribute('data-orientation', 'horizontal');
    expect(verticalSeparator).toHaveAttribute('data-orientation', 'vertical');
  });
});
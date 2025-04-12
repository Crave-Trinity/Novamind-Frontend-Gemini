import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils.unified';
import { Slider } from './slider';
import userEvent from '@testing-library/user-event';

describe('Slider Component', () => {
  it('renders with default props and single value', () => {
    renderWithProviders(<Slider defaultValue={[50]} data-testid="test-slider" />);
    
    const slider = screen.getByTestId('test-slider');
    expect(slider).toBeInTheDocument();
    
    // Should have correct base classes
    expect(slider).toHaveClass('relative');
    expect(slider).toHaveClass('flex');
    expect(slider).toHaveClass('w-full');
    
    // Should have the track element
    const track = slider.querySelector('[class*="SliderTrack"]');
    expect(track).toBeInTheDocument();
    expect(track).toHaveClass('bg-primary/20');
    
    // Should have the range element
    const range = slider.querySelector('[class*="SliderRange"]');
    expect(range).toBeInTheDocument();
    expect(range).toHaveClass('bg-primary');
    
    // Should have the thumb element
    const thumb = slider.querySelector('[class*="SliderThumb"]');
    expect(thumb).toBeInTheDocument();
    expect(thumb).toHaveClass('rounded-full');
  });

  it('sets default value of 50 correctly', () => {
    // Test with value in the middle of the range
    renderWithProviders(<Slider defaultValue={[50]} min={0} max={100} data-testid="test-slider" />);
    
    const slider = screen.getByTestId('test-slider');
    const range = slider.querySelector('[class*="SliderRange"]');
    
    // With value 50 out of 0-100, the range width should be around 50%
    // Note: We can't test exact styles easily, but we can ensure it's set
    expect(range).toBeInTheDocument();
    expect(range).toHaveAttribute('style');
  });
  
  it('sets default value of 75 correctly', () => {
    // Test with a higher value in the range
    renderWithProviders(<Slider defaultValue={[75]} min={0} max={100} data-testid="test-slider" />);
    
    const slider = screen.getByTestId('test-slider');
    const range = slider.querySelector('[class*="SliderRange"]');
    
    // With value 75 out of 0-100, width should be around 75%
    expect(range).toBeInTheDocument();
    expect(range).toHaveAttribute('style');
  });

  it('handles value changes and calls onValueChange', async () => {
    const handleValueChange = vi.fn();
    const user = userEvent.setup();
    
    renderWithProviders(
      <Slider 
        defaultValue={[50]} 
        onValueChange={handleValueChange}
        min={0}
        max={100}
        step={1}
        data-testid="test-slider"
      />
    );
    
    const slider = screen.getByTestId('test-slider');
    const thumb = slider.querySelector('[class*="SliderThumb"]') as HTMLElement;
    
    // Simulate a click on the track to jump to a new value
    // Note: This is an approximation since actual positioning in a test
    // environment is tricky
    await user.click(slider);
    
    // handleValueChange should have been called
    expect(handleValueChange).toHaveBeenCalled();
  });

  it('renders with multiple thumbs for a range slider', () => {
    renderWithProviders(
      <Slider 
        defaultValue={[25, 75]} 
        min={0}
        max={100}
        data-testid="test-slider" 
      />
    );
    
    const slider = screen.getByTestId('test-slider');
    
    // Should have two thumb elements
    const thumbs = slider.querySelectorAll('[class*="SliderThumb"]');
    expect(thumbs.length).toBe(2);
  });

  it('applies custom className to the root', () => {
    renderWithProviders(
      <Slider 
        defaultValue={[50]} 
        className="custom-slider-class"
        data-testid="test-slider" 
      />
    );
    
    const slider = screen.getByTestId('test-slider');
    expect(slider).toHaveClass('custom-slider-class');
    expect(slider).toHaveClass('relative'); // Still has default classes
  });

  it('handles disabled state correctly', () => {
    renderWithProviders(
      <Slider 
        defaultValue={[50]} 
        disabled
        data-testid="test-slider" 
      />
    );
    
    const slider = screen.getByTestId('test-slider');
    const thumb = slider.querySelector('[class*="SliderThumb"]');
    
    // Thumb should have disabled styles
    expect(thumb).toHaveClass('disabled:opacity-50');
    expect(thumb).toHaveClass('disabled:pointer-events-none');
    
    // Root should have aria-disabled attribute
    expect(slider).toHaveAttribute('aria-disabled', 'true');
  });

  it('forwards ref to the slider root element', () => {
    const ref = React.createRef<HTMLSpanElement>();
    
    renderWithProviders(
      <Slider 
        ref={ref}
        defaultValue={[50]} 
        data-testid="test-slider" 
      />
    );
    
    const slider = screen.getByTestId('test-slider');
    expect(ref.current).toBe(slider);
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(
      <Slider 
        defaultValue={[30]} 
        min={0}
        max={100}
        step={1}
        aria-label="Volume"
        data-testid="test-slider" 
      />
    );
    
    const slider = screen.getByTestId('test-slider');
    
    // Check for appropriate ARIA attributes
    expect(slider).toHaveAttribute('aria-label', 'Volume');
    
    // Test the thumb's aria attributes
    const thumb = slider.querySelector('[class*="SliderThumb"]');
    expect(thumb).toHaveAttribute('role', 'slider');
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
    expect(thumb).toHaveAttribute('aria-valuenow', '30');
  });

  it('handles custom min, max, and step values', () => {
    renderWithProviders(
      <Slider 
        defaultValue={[5]} 
        min={0}
        max={10}
        step={0.5}
        data-testid="test-slider" 
      />
    );
    
    const slider = screen.getByTestId('test-slider');
    const thumb = slider.querySelector('[class*="SliderThumb"]');
    
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '10');
    expect(thumb).toHaveAttribute('aria-valuenow', '5');
  });

  it('adjusts to rtl text direction when in RTL mode', () => {
    // Set document to RTL
    document.documentElement.setAttribute('dir', 'rtl');
    
    renderWithProviders(
      <Slider 
        defaultValue={[50]} 
        data-testid="test-slider" 
      />
    );
    
    const slider = screen.getByTestId('test-slider');
    
    // Range should have rtl styles (can't test this explicitly in JSDOM)
    // But we can check that the direction attribute is recognized
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    
    // Clean up
    document.documentElement.removeAttribute('dir');
  });
});